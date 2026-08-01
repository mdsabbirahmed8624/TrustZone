import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ConnectorResponse<T = any> {
  success: boolean;
  environment: 'SANDBOX' | 'PRODUCTION';
  data: T;
  latencyMs: number;
  dryRun?: boolean;
}

@Injectable()
export class ConnectorService {
  protected readonly logger = new Logger(ConnectorService.name);

  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Executes a connector action with dry-run support, retry loop, and logging
   */
  async executeWithRetry<T>(
    providerCode: string,
    actionName: string,
    operation: () => Promise<T>,
    dryRun = false,
    environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX',
    maxRetries = 3,
  ): Promise<ConnectorResponse<T>> {
    const startTime = Date.now();

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Simulating operation '${actionName}' for provider '${providerCode}' [${environment}]`,
      );
      return {
        success: true,
        environment,
        data: { simulated: true, action: actionName } as unknown as T,
        latencyMs: 1,
        dryRun: true,
      };
    }

    let attempt = 0;
    let lastError: any;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const result = await operation();
        const latencyMs = Date.now() - startTime;

        // Log integration audit trail
        await this.prisma.integrationLog.create({
          data: {
            providerCode,
            environment,
            action: actionName,
            statusCode: 200,
            details: `Execution succeeded on attempt ${attempt}`,
          },
        });

        return {
          success: true,
          environment,
          data: result,
          latencyMs,
        };
      } catch (err: any) {
        lastError = err;
        this.logger.warn(
          `[Attempt ${attempt}/${maxRetries}] Failed '${actionName}' for '${providerCode}': ${err.message}`,
        );
      }
    }

    // Log failure in integration log
    await this.prisma.integrationLog.create({
      data: {
        providerCode,
        environment,
        action: actionName,
        statusCode: 500,
        details: `Execution failed after ${maxRetries} attempts: ${lastError?.message}`,
      },
    });

    throw lastError;
  }
}
