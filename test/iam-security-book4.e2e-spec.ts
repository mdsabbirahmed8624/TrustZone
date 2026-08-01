import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Phase 11 Book 4 - Enterprise IAM, SSO & Advanced Security (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;

  const testEmail = `iam-admin-${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create SUPER_ADMIN user
    const hashedPassword = await argon2.hash(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'IAM',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
      },
    });
    testUserId = user.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    authToken = loginRes.body.accessToken || loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    if (prisma && testUserId) {
      await prisma.riskAssessment.deleteMany({});
      await prisma.deviceFingerprint.deleteMany({});
      await prisma.mFAConfiguration.deleteMany({});
      await prisma.sSOProvider.deleteMany({});
      await prisma.roleAssignment.deleteMany({});
      await prisma.permissionGroup.deleteMany({});
      await prisma.securityEvent.deleteMany({});
      await prisma.passwordHistory.deleteMany({});
      await prisma.loginAudit.deleteMany({});
      await prisma.trustedDevice.deleteMany({});
      await prisma.authSession.deleteMany({});
      await prisma.identityProfile.deleteMany({});
      await prisma.user
        .delete({ where: { email: testEmail } })
        .catch(() => null);
    }
    await app.close();
  });

  describe('Identity & Passwordless Endpoints (/api/v1/identity & /api/v1/auth)', () => {
    it('POST /api/v1/identity/profile - should upsert identity profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/identity/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          department: 'CYBERSECURITY',
          organizationUnit: 'ENTERPRISE_SECURITY',
          jobTitle: 'CISO',
          employeeId: 'EMP-9900',
        })
        .expect(200);

      expect(res.body.department).toBe('CYBERSECURITY');
      expect(res.body.employeeId).toBe('EMP-9900');
    });

    it('GET /api/v1/identity/profile - should fetch user identity profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/identity/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.userId).toBe(testUserId);
      expect(res.body.jobTitle).toBe('CISO');
    });

    it('POST /api/v1/auth/passwordless - should generate passwordless token link', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/passwordless')
        .send({ email: testEmail })
        .expect(200);

      expect(res.body.email).toBe(testEmail);
      expect(res.body.token).toBeDefined();
    });
  });

  describe('MFA & SSO Endpoints (/api/v1/mfa & /api/v1/sso)', () => {
    it('POST /api/v1/mfa/setup - should setup TOTP secret and backup recovery codes', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/mfa/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.totpSecret).toBeDefined();
      expect(res.body.backupCodes.length).toBe(6);
    });

    it('POST /api/v1/mfa/verify - should verify 6-digit TOTP code', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/mfa/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '123456' })
        .expect(200);

      expect(res.body.isTotpEnabled).toBe(true);
    });

    it('POST /api/v1/sso/providers - should configure SSO provider', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/sso/providers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'GOOGLE',
          name: 'Google Enterprise Workspace SSO',
          clientId: 'google-client-id-123',
          clientSecret: 'google-client-secret-xyz',
          redirectUri: 'https://erp.trustzone.care/api/v1/sso/callback',
        })
        .expect(201);

      expect(res.body.code).toBe('GOOGLE');
    });

    it('POST /api/v1/sso/callback - should process federated SSO callback', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/sso/callback')
        .send({
          code: 'GOOGLE',
          externalUser: {
            id: 'google-sub-999',
            email: testEmail,
            name: 'IAM Admin',
          },
        })
        .expect(200);

      expect(res.body.ssoProvider).toBe('GOOGLE');
    });
  });

  describe('Sessions, Permissions & Zero-Trust Security (/api/v1/sessions, /api/v1/security & /api/v1/permissions)', () => {
    it('GET /api/v1/security/dashboard - should return security dashboard metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/security/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.systemStatus).toBe('PROTECTED');
      expect(res.body.totalLoginAttempts).toBeGreaterThanOrEqual(0);
    });

    it('POST /api/v1/security/risk/eval - should calculate zero-trust risk score', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/security/risk/eval')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ipAddress: '192.168.1.100',
          deviceFingerprint: 'device-hash-abcdef',
        })
        .expect(200);

      expect(res.body.riskScore).toBeDefined();
      expect(res.body.riskLevel).toBeDefined();
    });

    it('POST /api/v1/permissions/groups - should create permission group', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/permissions/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Compliance Officers',
          permissions: ['documents:read', 'security:read'],
        })
        .expect(201);

      expect(res.body.name).toBe('Compliance Officers');
    });

    it('GET /api/v1/permissions/user - should fetch user permission evaluation', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/permissions/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.userId).toBe(testUserId);
      expect(res.body.baseRole).toBe('SUPER_ADMIN');
    });
  });
});
