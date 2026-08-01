import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates SHA-256 hash of request path and body payload
   */
  hashPayload(requestPath: string, payload: any): string {
    const data = requestPath + ':' + JSON.stringify(payload || {});
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Evaluates an idempotency key before request execution.
   * If existing completed record found: returns cached response body & status.
   * If currently locked by another request: throws ConflictException.
   * If new: creates locked idempotency record.
   */
  async evaluateIdempotency(
    key: string,
    requestPath: string,
    payload: any,
    userId?: string,
    ttlSeconds = 86400, // 24 hours default
  ): Promise<{
    isReplay: boolean;
    responseStatus?: number;
    responseBody?: any;
  }> {
    if (!key) {
      return { isReplay: false };
    }

    const requestHash = this.hashPayload(requestPath, payload);
    const existing = await this.prisma.idempotencyKey.findUnique({
      where: { idempotencyKey: key },
    });

    if (existing) {
      if (existing.expiresAt < new Date()) {
        // Expired key, remove and proceed
        await this.prisma.idempotencyKey.delete({ where: { id: existing.id } });
      } else if (existing.isLocked) {
        throw new ConflictException(
          `Idempotency Key '${key}' is currently being processed by a concurrent request.`,
        );
      } else {
        // Record replay event in audit history
        await this.prisma.idempotencyRequest.create({
          data: {
            keyId: existing.id,
            replayedAt: new Date(),
          },
        });

        this.logger.log(`Idempotency Replay matched for key '${key}'`);
        return {
          isReplay: true,
          responseStatus: existing.responseStatus,
          responseBody: existing.responseBody,
        };
      }
    }

    // Lock key for current execution
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await this.prisma.idempotencyKey.create({
      data: {
        idempotencyKey: key,
        requestPath,
        requestHash,
        responseStatus: 200,
        responseBody: {},
        isLocked: true,
        userId: userId || null,
        expiresAt,
      },
    });

    return { isReplay: false };
  }

  /**
   * Finalizes an idempotency key execution with actual response status and body.
   */
  async saveResponse(
    key: string,
    responseStatus: number,
    responseBody: any,
  ): Promise<void> {
    if (!key) return;

    await this.prisma.idempotencyKey.update({
      where: { idempotencyKey: key },
      data: {
        responseStatus,
        responseBody: responseBody || {},
        isLocked: false,
      },
    });
  }

  /**
   * Cleans up expired idempotency records
   */
  async purgeExpiredKeys(): Promise<number> {
    const deleted = await this.prisma.idempotencyKey.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return deleted.count;
  }
}
