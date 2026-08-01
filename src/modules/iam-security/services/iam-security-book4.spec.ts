import { Test, TestingModule } from '@nestjs/testing';
import { IdentityService } from './identity.service';
import { AuthenticationService } from './authentication.service';
import { MFAService } from './mfa.service';
import { SSOService } from './sso.service';
import { SessionService } from './session.service';
import { PermissionService } from './permission.service';
import { DeviceTrustService } from './device-trust.service';
import { RiskEngineService } from './risk-engine.service';
import { SecurityMonitoringService } from './security-monitoring.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('IAM & Advanced Security Unit Tests (Book 4)', () => {
  let identityService: IdentityService;
  let authService: AuthenticationService;
  let mfaService: MFAService;
  let ssoService: SSOService;
  let sessionService: SessionService;
  let permissionService: PermissionService;
  let deviceTrustService: DeviceTrustService;
  let riskEngineService: RiskEngineService;
  let monitoringService: SecurityMonitoringService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'iam@test.com',
        role: 'SUPER_ADMIN',
        roleAssignments: [],
      }),
      update: jest.fn().mockResolvedValue({ id: 'user-1' }),
      create: jest.fn().mockResolvedValue({
        id: 'user-2',
        email: 'sso@test.com',
        role: 'STAFF',
      }),
    },
    identityProfile: {
      upsert: jest.fn().mockResolvedValue({
        id: 'prof-1',
        userId: 'user-1',
        department: 'IT',
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'prof-1',
        userId: 'user-1',
        linkedAccounts: [],
      }),
    },
    passwordHistory: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'hist-1' }),
    },
    mFAConfiguration: {
      upsert: jest
        .fn()
        .mockResolvedValue({ id: 'mfa-1', totpSecret: 'SECRET123' }),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'mfa-1', totpSecret: 'SECRET123' }),
      update: jest.fn().mockResolvedValue({ id: 'mfa-1', isTotpEnabled: true }),
    },
    sSOProvider: {
      upsert: jest
        .fn()
        .mockResolvedValue({ id: 'sso-1', code: 'GOOGLE', enabled: true }),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'sso-1', code: 'GOOGLE', enabled: true }),
    },
    authSession: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest
        .fn()
        .mockResolvedValue({ id: 'sess-1', sessionToken: 'tok-123' }),
      update: jest.fn().mockResolvedValue({ id: 'sess-1', isRevoked: true }),
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      count: jest.fn().mockResolvedValue(3),
    },
    permissionGroup: {
      upsert: jest
        .fn()
        .mockResolvedValue({ id: 'grp-1', name: 'Security Admins' }),
    },
    roleAssignment: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'assign-1', roleName: 'AUDITOR' }),
    },
    trustedDevice: {
      upsert: jest.fn().mockResolvedValue({ id: 'dev-1', isTrusted: true }),
      findUnique: jest.fn().mockResolvedValue({ id: 'dev-1', isTrusted: true }),
      count: jest.fn().mockResolvedValue(10),
    },
    loginAudit: {
      create: jest.fn().mockResolvedValue({ id: 'audit-1', status: 'SUCCESS' }),
      count: jest.fn().mockResolvedValue(1),
    },
    securityEvent: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'sec-1', eventType: 'BRUTE_FORCE_DETECTED' }),
      count: jest.fn().mockResolvedValue(0),
    },
    riskAssessment: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'risk-1', riskScore: 10, riskLevel: 'LOW' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityService,
        AuthenticationService,
        MFAService,
        SSOService,
        SessionService,
        PermissionService,
        DeviceTrustService,
        RiskEngineService,
        SecurityMonitoringService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    identityService = module.get<IdentityService>(IdentityService);
    authService = module.get<AuthenticationService>(AuthenticationService);
    mfaService = module.get<MFAService>(MFAService);
    ssoService = module.get<SSOService>(SSOService);
    sessionService = module.get<SessionService>(SessionService);
    permissionService = module.get<PermissionService>(PermissionService);
    deviceTrustService = module.get<DeviceTrustService>(DeviceTrustService);
    riskEngineService = module.get<RiskEngineService>(RiskEngineService);
    monitoringService = module.get<SecurityMonitoringService>(
      SecurityMonitoringService,
    );
  });

  describe('IdentityService & AuthenticationService', () => {
    it('should upsert identity profile', async () => {
      const prof = await identityService.upsertProfile(
        'user-1',
        'IT',
        'CORPORATE',
      );
      expect(prof.department).toBe('IT');
    });

    it('should generate passwordless login token', async () => {
      const res = await authService.generatePasswordlessToken('iam@test.com');
      expect(res.token).toBeDefined();
    });
  });

  describe('MFAService & SSOService', () => {
    it('should setup TOTP secret and backup codes', async () => {
      const res = await mfaService.setupTotp('user-1');
      expect(res.totpSecret).toBeDefined();
      expect(res.backupCodes.length).toBe(6);
    });

    it('should process federated SSO login callback', async () => {
      const res = await ssoService.processSsoCallback('GOOGLE', {
        id: 'ext-100',
        email: 'sso@test.com',
        name: 'SSO User',
      });
      expect(res.ssoProvider).toBe('GOOGLE');
    });
  });

  describe('SessionService & DeviceTrustService', () => {
    it('should create auth session', async () => {
      const sess = await sessionService.createSession('user-1', '127.0.0.1');
      expect(sess.sessionToken).toBe('tok-123');
    });

    it('should register trusted device', async () => {
      const dev = await deviceTrustService.registerDevice(
        'user-1',
        'fingerprint-hash',
        'Work Laptop',
      );
      expect(dev.isTrusted).toBe(true);
    });
  });

  describe('RiskEngineService & SecurityMonitoring', () => {
    it('should evaluate low risk score for trusted device', async () => {
      const risk = await riskEngineService.evaluateLoginRisk(
        'user-1',
        '127.0.0.1',
        'fingerprint-hash',
      );
      expect(risk.riskLevel).toBe('LOW');
    });

    it('should return security dashboard metrics', async () => {
      const dash = await monitoringService.getSecurityDashboardMetrics();
      expect(dash.systemStatus).toBe('PROTECTED');
    });
  });
});
