import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../modules/prisma/prisma.service';
import { RedisService } from '../modules/redis/redis.service';

@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/')
  getRoot() {
    return {
      status: 'ok',
      service: 'TrustZone Mobile Care ERP',
      version: '11.0.0',
    };
  }

  @Get('/health')
  async getHealth(@Res() res: Response) {
    return this.executeHealthCheck(res);
  }

  @Get('/api/v1/health')
  async getApiV1Health(@Res() res: Response) {
    return this.executeHealthCheck(res);
  }

  private async executeHealthCheck(res: Response) {
    let dbStatus = 'connected';
    let redisStatus = this.redis.getStatus(); // 'connected' | 'disconnected' | 'disabled'
    let isDbHealthy = true;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'disconnected';
      isDbHealthy = false;
    }

    if (redisStatus === 'connected') {
      try {
        const client = await this.redis.getClient();
        if (client && typeof client.ping === 'function') {
          await client.ping();
        }
      } catch (e) {
        redisStatus = 'disconnected';
      }
    }

    const env =
      this.configService.get<string>('NODE_ENV') ||
      process.env.NODE_ENV ||
      'development';

    const overallStatus = isDbHealthy
      ? redisStatus === 'connected'
        ? 'ok'
        : 'degraded'
      : 'error';

    const statusCode = isDbHealthy
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json({
      status: overallStatus,
      service: 'TrustZone Mobile Care ERP',
      version: '11.0.0',
      environment: env,
      timestamp: new Date().toISOString(),
      database: dbStatus,
      redis: redisStatus,
      services: {
        database: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
        redis:
          redisStatus === 'connected'
            ? 'healthy'
            : redisStatus === 'disabled'
              ? 'disabled'
              : 'degraded',
      },
    });
  }
}
