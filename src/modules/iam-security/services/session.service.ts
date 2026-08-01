import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly maxConcurrentSessions = 5;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new AuthSession and enforces concurrent session limits
   */
  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    deviceFingerprint?: string,
    ttlHours = 24,
  ) {
    // Enforce concurrent session limit (revoke oldest active sessions)
    const activeSessions = await this.prisma.authSession.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'asc' },
    });

    if (activeSessions.length >= this.maxConcurrentSessions) {
      const excess = activeSessions.slice(
        0,
        activeSessions.length - this.maxConcurrentSessions + 1,
      );
      for (const sess of excess) {
        await this.prisma.authSession.update({
          where: { id: sess.id },
          data: { isRevoked: true },
        });
      }
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + ttlHours * 3600000);

    const session = await this.prisma.authSession.create({
      data: {
        userId,
        sessionToken,
        refreshTokenHash,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        deviceFingerprint: deviceFingerprint || null,
        expiresAt,
      },
    });

    this.logger.log(`Created AuthSession '${session.id}' for User '${userId}'`);
    return session;
  }

  /**
   * Revokes a specific session
   */
  async revokeSession(sessionId: string) {
    const session = await this.prisma.authSession.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    this.logger.log(`Revoked AuthSession '${sessionId}'`);
    return session;
  }

  /**
   * Revokes all active sessions for a user (Forced Logout)
   */
  async revokeAllUserSessions(userId: string) {
    const res = await this.prisma.authSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    this.logger.log(
      `Forced logout: Revoked ${res.count} active session(s) for User '${userId}'`,
    );
    return { revokedSessionsCount: res.count };
  }

  /**
   * Retrieves active sessions for a user
   */
  async getUserActiveSessions(userId: string) {
    return this.prisma.authSession.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      orderBy: { lastActivityAt: 'desc' },
    });
  }
}
