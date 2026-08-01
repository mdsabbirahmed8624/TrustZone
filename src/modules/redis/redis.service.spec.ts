import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
        disconnect: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
      };
    }),
  };
});

describe('RedisService', () => {
  let service: RedisService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize Redis client without password if REDIS_PASSWORD is not provided', () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === 'REDIS_HOST') return 'localhost';
          if (key === 'REDIS_PORT') return 6379;
          if (key === 'REDIS_PASSWORD') return undefined;
          return defaultValue;
        },
      );

      service.onModuleInit();

      expect(Redis).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'localhost',
          port: 6379,
          maxRetriesPerRequest: null,
        }),
      );
    });

    it('should initialize Redis client with password if REDIS_PASSWORD is provided', () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === 'REDIS_HOST') return 'production-redis';
          if (key === 'REDIS_PORT') return 6380;
          if (key === 'REDIS_PASSWORD') return 'secret-pass';
          return defaultValue;
        },
      );

      service.onModuleInit();

      expect(Redis).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'production-redis',
          port: 6380,
          password: 'secret-pass',
          maxRetriesPerRequest: null,
        }),
      );
    });

    it('should initialize Redis client with REDIS_URL if provided', () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          if (key === 'REDIS_URL')
            return 'redis://default:pass@redis.railway.internal:6379';
          return defaultValue;
        },
      );

      service.onModuleInit();

      expect(Redis).toHaveBeenCalledWith(
        'redis://default:pass@redis.railway.internal:6379',
        expect.objectContaining({
          maxRetriesPerRequest: null,
        }),
      );
    });

    it('should operate in memory fallback mode if Redis is unconfigured or fails', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      delete process.env.REDIS_HOST;
      delete process.env.REDISHOST;
      delete process.env.REDIS_URL;
      process.env.NODE_ENV = 'production';

      service.onModuleInit();

      expect(service.getStatus()).toBe('disabled');
      await service.set('test_key', 'test_val', 10);
      const val = await service.get('test_key');
      expect(val).toBe('test_val');
      await service.del('test_key');
      expect(await service.get('test_key')).toBeNull();
    });
  });
});
