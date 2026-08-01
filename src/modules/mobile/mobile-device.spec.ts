import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { MobileDeviceGuard } from './guards/mobile-device.guard';
import { ExecutionContext } from '@nestjs/common';

describe('Enterprise Mobile Device Security', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let guard: MobileDeviceGuard;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userDevice: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'dev-1', ...args.data }),
        ),
      update: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'dev-1', ...args.data }),
        ),
    },
    deviceEvent: {
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
    pushToken: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        MobileDeviceGuard,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: {} },
        { provide: ConfigService, useValue: { get: () => 'key' } },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    guard = module.get<MobileDeviceGuard>(MobileDeviceGuard);
    jest.clearAllMocks();
  });

  describe('Device Status and Risk Blocking', () => {
    it('should block blocked devices', async () => {
      mockPrisma.userDevice.findUnique.mockResolvedValueOnce({
        id: 'dev-1',
        status: 'BLOCKED',
        riskLevel: 'LOW',
      });

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1' },
            headers: { 'x-device-uuid': 'uuid-1' },
          }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Device is blocked.'),
      );
    });

    it('should block lost devices', async () => {
      mockPrisma.userDevice.findUnique.mockResolvedValueOnce({
        id: 'dev-1',
        status: 'LOST',
        riskLevel: 'LOW',
      });

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1' },
            headers: { 'x-device-uuid': 'uuid-1' },
          }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Device is marked as lost.'),
      );
    });

    it('should block suspicious devices', async () => {
      mockPrisma.userDevice.findUnique.mockResolvedValueOnce({
        id: 'dev-1',
        status: 'SUSPICIOUS',
        riskLevel: 'LOW',
      });

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1' },
            headers: { 'x-device-uuid': 'uuid-1' },
          }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Device is marked as suspicious.'),
      );
    });

    it('should block critical risk devices', async () => {
      mockPrisma.userDevice.findUnique.mockResolvedValueOnce({
        id: 'dev-1',
        status: 'ACTIVE',
        riskLevel: 'CRITICAL',
      });

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1' },
            headers: { 'x-device-uuid': 'uuid-1' },
          }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Device risk level is critical.'),
      );
    });

    it('should allow active, low-risk devices and update lastUsedAt', async () => {
      mockPrisma.userDevice.findUnique.mockResolvedValueOnce({
        id: 'dev-1',
        status: 'ACTIVE',
        riskLevel: 'LOW',
        lastIpAddress: '127.0.0.1',
        lastUserAgent: 'agent',
      });

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1' },
            headers: { 'x-device-uuid': 'uuid-1', 'user-agent': 'agent' },
            ip: '127.0.0.1',
          }),
        }),
      } as unknown as ExecutionContext;

      const res = await guard.canActivate(context);
      expect(res).toBe(true);
      expect(prisma.userDevice.update).toHaveBeenCalled();
    });
  });

  describe('Duplicate Device Handling and Upserts', () => {
    it('should update metadata instead of creating another record on duplicate device registration', async () => {
      mockPrisma.userDevice.findUnique.mockResolvedValueOnce({
        id: 'dev-existing',
        userId: 'user-1',
        deviceUUID: 'uuid-1',
        status: 'ACTIVE',
        riskLevel: 'LOW',
      });

      await authService.registerOrUpdateDevice('user-1', '192.168.1.1', {
        deviceUUID: 'uuid-1',
        deviceFingerprint: 'new-fingerprint',
        deviceType: 'ANDROID',
        brand: 'Google',
        model: 'Pixel',
      });

      expect(prisma.userDevice.update).toHaveBeenCalledWith({
        where: { id: 'dev-existing' },
        data: expect.objectContaining({
          deviceFingerprint: 'new-fingerprint',
          lastIpAddress: '192.168.1.1',
        }),
      });
      expect(prisma.userDevice.create).not.toHaveBeenCalled();
    });
  });
});
