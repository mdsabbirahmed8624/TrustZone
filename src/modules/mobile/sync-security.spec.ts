import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  SyncEngineService,
  MutationStep,
} from './services/sync-engine.service';
import { ConflictResolverService } from './services/conflict-resolver.service';
import { MobileSecurityGuard } from './guards/mobile-security.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ResolutionStrategy, SyncStatus } from '@prisma/client';

describe('Offline Sync & Mobile Security Engine', () => {
  let syncEngine: SyncEngineService;
  let resolver: ConflictResolverService;
  let securityGuard: MobileSecurityGuard;
  let prisma: PrismaService;

  const mockPrisma = {
    offlineSyncBatch: {
      create: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'batch-1', ...args.data }),
        ),
      update: jest.fn(),
    },
    syncConflict: {
      create: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'conflict-1', ...args.data }),
        ),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    mobileSecurityPolicy: {
      findFirst: jest.fn(),
    },
    userDevice: {
      findFirst: jest.fn(),
    },
    ticket: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncEngineService,
        ConflictResolverService,
        MobileSecurityGuard,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    syncEngine = module.get<SyncEngineService>(SyncEngineService);
    resolver = module.get<ConflictResolverService>(ConflictResolverService);
    securityGuard = module.get<MobileSecurityGuard>(MobileSecurityGuard);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('SyncEngine Conflict Detection & LWW Resolver', () => {
    it('should apply client updates directly if they are newer (Last-Write-Wins)', async () => {
      const steps: MutationStep[] = [
        {
          entityName: 'Ticket',
          entityId: 'ticket-1',
          clientUpdatedAt: new Date(Date.now() + 10000).toISOString(),
          data: { status: 'COMPLETED' },
        },
      ];

      mockPrisma.ticket.findUnique.mockResolvedValueOnce({
        id: 'ticket-1',
        status: 'OPEN',
        updatedAt: new Date(Date.now() - 10000),
      });

      const res = await syncEngine.processSyncBatch(
        'user-1',
        'device-1',
        steps,
      );
      expect(res.status).toBe(SyncStatus.SUCCESS);
      expect(res.conflictsCount).toBe(0);
      expect(mockPrisma.ticket.update).toHaveBeenCalled();
    });

    it('should detect a conflict if the client update is older than server record', async () => {
      const steps: MutationStep[] = [
        {
          entityName: 'Ticket',
          entityId: 'ticket-1',
          clientUpdatedAt: new Date(Date.now() - 20000).toISOString(),
          data: { status: 'COMPLETED' },
        },
      ];

      mockPrisma.ticket.findUnique.mockResolvedValueOnce({
        id: 'ticket-1',
        status: 'IN_PROGRESS',
        updatedAt: new Date(Date.now() - 10000),
      });

      const res = await syncEngine.processSyncBatch(
        'user-1',
        'device-1',
        steps,
      );
      expect(res.status).toBe(SyncStatus.CONFLICT);
      expect(res.conflictsCount).toBe(1);
      expect(mockPrisma.syncConflict.create).toHaveBeenCalled();
    });
  });

  describe('MobileSecurityGuard Security Hardening', () => {
    it('should reject access to jailbroken devices with x-security-root set', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { 'x-security-root': 'true' },
          }),
        }),
      } as ExecutionContext;

      await expect(securityGuard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should trigger remote wipe and block access if device is marked LOST', async () => {
      const mockHeaders = {
        'x-device-uuid': 'device-lost-uuid',
      };
      const mockResponseHeaders: Record<string, string> = {};
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: mockHeaders,
          }),
          getResponse: () => ({
            setHeader: (name: string, value: string) => {
              mockResponseHeaders[name] = value;
            },
          }),
        }),
      } as any;

      mockPrisma.userDevice.findFirst.mockResolvedValueOnce({
        id: 'dev-1',
        status: 'LOST',
      });

      await expect(securityGuard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockResponseHeaders['x-mobile-wipe']).toBe('true');
    });
  });
});
