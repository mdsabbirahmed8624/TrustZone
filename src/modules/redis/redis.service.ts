import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;
  private isConfigured = false;
  private hasLoggedError = false;
  private memoryFallback = new Map<
    string,
    { value: string; expiresAt?: number }
  >();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    // 1. Check for full connection URL (REDIS_URL / REDIS_TLS_URL)
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ||
      this.configService.get<string>('REDIS_TLS_URL') ||
      process.env.REDIS_URL ||
      process.env.REDIS_TLS_URL;

    // 2. Check for Railway / Cloud environment variables (REDISHOST / REDIS_HOST)
    const host =
      this.configService.get<string>('REDIS_HOST') ||
      this.configService.get<string>('REDISHOST') ||
      process.env.REDIS_HOST ||
      process.env.REDISHOST;

    const port =
      this.configService.get<number>('REDIS_PORT') ||
      this.configService.get<number>('REDISPORT') ||
      (process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT, 10)
        : undefined) ||
      (process.env.REDISPORT ? parseInt(process.env.REDISPORT, 10) : undefined);

    const password =
      this.configService.get<string>('REDIS_PASSWORD') ||
      this.configService.get<string>('REDISPASSWORD') ||
      process.env.REDIS_PASSWORD ||
      process.env.REDISPASSWORD;

    const isProduction =
      (this.configService.get<string>('NODE_ENV') || process.env.NODE_ENV) ===
      'production';

    // If explicitly disabled via environment
    if (process.env.REDIS_DISABLED === 'true') {
      this.logger.warn(
        'Redis is explicitly disabled via REDIS_DISABLED=true. Operating in memory fallback mode.',
      );
      this.isConfigured = false;
      return;
    }

    if (redisUrl) {
      this.isConfigured = true;
      this.initClientWithUrl(redisUrl);
    } else if (host) {
      this.isConfigured = true;
      const targetPort = port || 6379;
      this.initClientWithOptions({
        host,
        port: targetPort,
        password: password || undefined,
      });
    } else if (!isProduction) {
      // In development/test mode, default to localhost:6379
      this.isConfigured = true;
      this.initClientWithOptions({
        host: 'localhost',
        port: 6379,
        password: password || undefined,
      });
    } else {
      // In production without Redis environment variables, gracefully disable Redis
      this.logger.warn(
        'No REDIS_URL, REDIS_HOST, or REDISHOST environment variables found in production. Redis is disabled (operating in memory fallback mode).',
      );
      this.isConfigured = false;
    }
  }

  private initClientWithUrl(url: string) {
    try {
      const options: RedisOptions = {
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        retryStrategy: (times) => this.getRetryDelay(times),
      };
      this.client = new Redis(url, options);
      this.attachEventListeners();
    } catch (err: any) {
      this.logger.warn(
        `Failed to instantiate Redis client with URL: ${err?.message}`,
      );
      this.isConfigured = false;
    }
  }

  private initClientWithOptions(redisOptions: RedisOptions) {
    try {
      const options: RedisOptions = {
        ...redisOptions,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        retryStrategy: (times) => this.getRetryDelay(times),
      };
      this.client = new Redis(options);
      this.attachEventListeners();
    } catch (err: any) {
      this.logger.warn(`Failed to instantiate Redis client: ${err?.message}`);
      this.isConfigured = false;
    }
  }

  private getRetryDelay(times: number): number | null {
    if (times > 5) {
      if (!this.hasLoggedError) {
        this.logger.warn(
          'Redis retry threshold reached. Suppressing reconnect log spam and using memory fallback.',
        );
        this.hasLoggedError = true;
      }
      return 10000; // Retry silently every 10 seconds without log spam
    }
    return Math.min(times * 1000, 5000);
  }

  private attachEventListeners() {
    if (!this.client) return;

    this.client.on('error', (err: Error) => {
      if (!this.hasLoggedError) {
        this.logger.warn(
          `Redis connection error (${err?.message || 'ECONNREFUSED'}). Operating in memory fallback mode.`,
        );
        this.hasLoggedError = true;
      }
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis instance.');
      this.isConnected = true;
      this.hasLoggedError = false;
    });

    this.client.on('ready', () => {
      this.isConnected = true;
    });

    this.client.on('close', () => {
      this.isConnected = false;
    });
  }

  onModuleDestroy() {
    if (this.client) {
      try {
        this.client.disconnect();
      } catch (e) {
        // Ignore disconnect errors on shutdown
      }
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.client && this.isConnected) {
      try {
        return await this.client.get(key);
      } catch (e) {
        // Fallback to memory on failure
      }
    }

    const cached = this.memoryFallback.get(key);
    if (!cached) return null;
    if (cached.expiresAt && Date.now() > cached.expiresAt) {
      this.memoryFallback.delete(key);
      return null;
    }
    return cached.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryFallback.set(key, { value, expiresAt });

    if (this.client && this.isConnected) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
      } catch (e) {
        // Suppress error when Redis is down
      }
    }
  }

  async del(key: string): Promise<void> {
    this.memoryFallback.delete(key);
    if (this.client && this.isConnected) {
      try {
        await this.client.del(key);
      } catch (e) {
        // Suppress error
      }
    }
  }

  async getClient(): Promise<Redis> {
    return (
      this.client ||
      (new Proxy(
        {},
        {
          get: () => async () => null,
        },
      ) as any)
    );
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  getStatus(): 'connected' | 'disconnected' | 'disabled' {
    if (!this.isConfigured) return 'disabled';
    return this.isConnected ? 'connected' : 'disconnected';
  }
}
