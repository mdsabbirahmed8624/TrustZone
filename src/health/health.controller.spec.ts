import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';
import { PrismaService } from '../modules/prisma/prisma.service';
import { RedisService } from '../modules/redis/redis.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: PrismaService;
  let redisService: RedisService;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockPrismaService = {
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
  };

  const mockRedisService = {
    getClient: jest.fn().mockResolvedValue({
      ping: jest.fn().mockResolvedValue('PONG'),
    }),
    getStatus: jest.fn().mockReturnValue('connected'),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
      if (key === 'NODE_ENV') return 'test';
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoot', () => {
    it('should return basic status ok payload', () => {
      const result = controller.getRoot();
      expect(result).toEqual({
        status: 'ok',
        service: 'TrustZone Mobile Care ERP',
        version: '11.0.0',
      });
    });
  });

  describe('getHealth', () => {
    it('should return healthy status when database and redis respond normally', async () => {
      const res = mockResponse();
      mockRedisService.getStatus.mockReturnValueOnce('connected');

      await controller.getHealth(res);

      expect(prismaService.$queryRaw).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          service: 'TrustZone Mobile Care ERP',
          version: '11.0.0',
          database: 'connected',
          redis: 'connected',
          services: {
            database: 'healthy',
            redis: 'healthy',
          },
        }),
      );
    });

    it('should return 503 status when database throws an error', async () => {
      jest
        .spyOn(prismaService, '$queryRaw')
        .mockRejectedValueOnce(new Error('Database Down'));
      const res = mockResponse();

      await controller.getHealth(res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          database: 'disconnected',
          services: expect.objectContaining({
            database: 'unhealthy',
          }),
        }),
      );
    });
  });
});
