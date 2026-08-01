import {
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a new API Client and API Key
   */
  async createApiKey(
    name: string,
    ownerId: string,
    scopes = ['read', 'write'],
    rateLimit = 100,
  ) {
    const clientKey = 'client_' + crypto.randomBytes(12).toString('hex');
    const clientSecret = 'sec_' + crypto.randomBytes(24).toString('hex');
    const rawKey = 'tz_live_' + crypto.randomBytes(20).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const client = await this.prisma.apiClient.create({
      data: {
        name,
        clientKey,
        clientSecret,
        ownerId,
      },
    });

    const apiKey = await this.prisma.apiKey.create({
      data: {
        clientId: client.id,
        keyHash,
        name,
        scopes,
        rateLimit,
      },
    });

    this.logger.log(`Created API Client ${client.id} and API Key ${apiKey.id}`);
    return {
      clientId: client.id,
      clientKey,
      clientSecret,
      rawApiKey: rawKey,
      name,
      scopes,
      rateLimit,
    };
  }

  /**
   * Validates API key and enforces scopes and expiration
   */
  async validateApiKey(rawKey: string, requiredScope?: string) {
    if (!rawKey) {
      throw new UnauthorizedException('API Key header is missing.');
    }

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { client: true },
    });

    if (!apiKey || apiKey.revoked) {
      throw new UnauthorizedException('Invalid or revoked API Key.');
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException('API Key has expired.');
    }

    if (requiredScope && !apiKey.scopes.includes(requiredScope)) {
      throw new ForbiddenException(
        `API Key lacks required scope '${requiredScope}'.`,
      );
    }

    // Update last used timestamp async
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey;
  }

  /**
   * Health checks overview for Gateway and Subsystems
   */
  async getHealthStatus() {
    let dbStatus = 'HEALTHY';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbStatus = 'DEGRADED';
    }

    return {
      gatewayStatus: 'ONLINE',
      databaseStatus: dbStatus,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetches usage analytics for API Gateway
   */
  async getUsageAnalytics() {
    const totalClients = await this.prisma.apiClient.count({
      where: { isDeleted: false },
    });
    const totalKeys = await this.prisma.apiKey.count({
      where: { revoked: false },
    });
    const totalLogs = await this.prisma.integrationLog.count();

    return {
      totalClients,
      totalKeys,
      totalGatewayRequests: totalLogs,
      activeRateLimitDefault: 100,
    };
  }
}
