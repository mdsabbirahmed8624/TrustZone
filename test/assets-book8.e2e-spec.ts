import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Phase 11 Book 8 - Enterprise Asset Management & Maintenance (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testCategoryId: string;
  let testAssetId: string;
  let testAssignmentId: string;
  let testTransferId: string;

  const testEmail = `asset-admin-${Date.now()}@test.com`;
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
        firstName: 'Asset',
        lastName: 'Manager',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
      },
    });
    testUserId = user.id;

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    authToken = loginRes.body.accessToken || loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    if (prisma && testUserId) {
      await prisma.assetAnalytics.deleteMany({});
      await prisma.assetDisposal.deleteMany({});
      await prisma.assetDepreciation.deleteMany({});
      await prisma.assetInspection.deleteMany({});
      await prisma.maintenanceWorkOrder.deleteMany({});
      await prisma.maintenanceTechnician.deleteMany({});
      await prisma.maintenanceHistory.deleteMany({});
      await prisma.maintenanceSchedule.deleteMany({});
      await prisma.assetMaintenance.deleteMany({});
      await prisma.assetTransfer.deleteMany({});
      await prisma.assetAssignment.deleteMany({});
      await prisma.asset.deleteMany({
        where: { name: 'Microscope Station X1' },
      });
      await prisma.assetCategory.deleteMany({ where: { code: 'TEST_EQUIP' } });
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => null);
    }
    await app.close();
  });

  describe('Asset Categories & Registration (/api/v1/assets/categories & /api/v1/assets)', () => {
    it('POST /api/v1/assets/categories - should upsert asset category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/assets/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Precision Testing Equipment',
          code: 'TEST_EQUIP',
          depreciationMethod: 'STRAIGHT_LINE',
          defaultUsefulLife: 48,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testCategoryId = res.body.id;
    });

    it('POST /api/v1/assets - should register new fixed asset', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Microscope Station X1',
          categoryId: testCategoryId,
          serialNumber: `SN-${Date.now()}`,
          purchaseCost: 3600,
          salvageValue: 360,
          usefulLifeMonths: 48,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.assetTag).toBeDefined();
      expect(res.body.qrCode).toBeDefined();
      testAssetId = res.body.id;
    });

    it('GET /api/v1/assets - should list assets with category filter', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Assignments & Transfers (/api/v1/assets/assignments & /api/v1/assets/transfers)', () => {
    it('POST /api/v1/assets/assignments - should checkout asset to user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/assets/assignments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assetId: testAssetId,
          userId: testUserId,
          notes: 'Assigned for Logic Board Repair Team',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testAssignmentId = res.body.id;
    });

    it('POST /api/v1/assets/assignments/:id/return - should return assigned asset', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/assets/assignments/${testAssignmentId}/return`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Returned in good condition' })
        .expect(200);

      expect(res.body.status).toBe('RETURNED');
    });

    it('POST /api/v1/assets/transfers - should request asset transfer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/assets/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assetId: testAssetId,
          toLocation: 'Dhanmondi Branch Room 302',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testTransferId = res.body.id;
    });

    it('POST /api/v1/assets/transfers/:id/approve - should approve asset transfer', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/assets/transfers/${testTransferId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });
  });

  describe('Maintenance, Inspection & Depreciation (/api/v1/assets/maintenance & /api/v1/assets/depreciation)', () => {
    it('POST /api/v1/assets/maintenance/log - should log preventive maintenance', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/assets/maintenance/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assetId: testAssetId,
          description: 'Lens cleaning & bulb alignment',
          cost: 80,
          performedBy: 'Lead Tech Mark',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
    });

    it('POST /api/v1/assets/inspections - should submit inspection report', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/assets/inspections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assetId: testAssetId,
          inspectorName: 'QA Audit Team',
          condition: 'EXCELLENT',
          score: 95,
        })
        .expect(201);

      expect(res.body.passed).toBe(true);
    });

    it('POST /api/v1/assets/depreciation/calculate/:id - should compute straight-line depreciation', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/assets/depreciation/calculate/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ period: '2026-07' })
        .expect(200);

      expect(Number(res.body.deprAmount)).toBeGreaterThan(0);
    });

    it('GET /api/v1/assets/analytics/dashboard - should return executive asset dashboard metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/assets/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.overview.totalAssets).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.assetUptimePercentage).toBeDefined();
    });
  });
});
