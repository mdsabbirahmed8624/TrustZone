import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import * as argon2 from 'argon2';

describe('Procurement Book 8 (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = 'procurement-e2e@trustzone.care';
  const testPassword = 'Password123!';
  let token: string;
  let userId: string;

  let branchId: string;
  let supplierId: string;
  let partId: string;
  let warehouseId: string;
  let purchaseRequestId: string;
  let purchaseOrderId: string;
  let poItemId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Initial cleanups
    await prisma.procurementAttachment.deleteMany({});
    await prisma.purchaseOrderApproval.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.purchaseRequest.deleteMany({});
    await prisma.supplierDocument.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.inventoryAuditLog.deleteMany({});
    await prisma.part.deleteMany({ where: { sku: 'E2E-PROC-PART' } });
    await prisma.supplier.deleteMany({ where: { name: 'E2E Supplier' } });
    await prisma.warehouse.deleteMany({
      where: { name: 'Procurement E2E Warehouse' },
    });

    const oldUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    if (oldUser) {
      await prisma.user.delete({ where: { id: oldUser.id } });
    }

    const oldBranch = await prisma.branch.findFirst({
      where: { name: 'Procurement Test Branch' },
    });
    if (oldBranch) {
      await prisma.branch.delete({ where: { id: oldBranch.id } });
    }

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        name: 'Procurement Test Branch',
        address: '456 Test St',
        timezone: 'UTC',
        status: 'ACTIVE',
      },
    });
    branchId = branch.id;

    // Create user
    const hashedPassword = await argon2.hash(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Proc',
        lastName: 'E2E',
        role: 'SUPER_ADMIN',
        branchId: branchId,
        isEmailVerified: true,
      },
    });
    userId = user.id;

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        name: 'E2E Supplier',
        contactPerson: 'David',
        email: 'david@e2esupplier.com',
        phone: '999',
        address: 'Supplier St',
        category: 'Hardware',
        status: 'ACTIVE',
      },
    });
    supplierId = supplier.id;

    // Create part
    const part = await prisma.part.create({
      data: {
        sku: 'E2E-PROC-PART',
        name: 'E2E Procurement Screen',
        category: 'Display',
        brand: 'Generic',
        brandCompatibility: 'Apple',
        modelCompatibility: ['iPhone 14'],
        basePrice: 200.0,
        supplierId: supplier.id,
      },
    });
    partId = part.id;

    // Create warehouse
    const warehouse = await prisma.warehouse.create({
      data: {
        name: 'Procurement E2E Warehouse',
        location: 'Zone B',
        branchId,
      },
    });
    warehouseId = warehouse.id;

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/mobile/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });
    token = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.procurementAttachment.deleteMany({});
    await prisma.purchaseOrderApproval.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.purchaseRequest.deleteMany({});
    await prisma.supplierDocument.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.inventoryAuditLog.deleteMany({});
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.part.deleteMany({ where: { id: partId } });
    await prisma.supplier.deleteMany({ where: { id: supplierId } });
    await prisma.warehouse.deleteMany({ where: { id: warehouseId } });
    await prisma.branch.deleteMany({ where: { id: branchId } });

    await app.close();
  });

  describe('Purchase Request Workflow', () => {
    it('POST /api/v1/procurement/requests (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/procurement/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          partId,
          quantity: 10,
          branchId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          purchaseRequestId = res.body.data.id;
        });
    });

    it('POST /api/v1/procurement/requests/:id/approve (Manager -> Procurement -> Finance)', async () => {
      // 1. Manager Approval
      await request(app.getHttpServer())
        .post(`/api/v1/procurement/requests/${purchaseRequestId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'MANAGER' })
        .expect(200);

      // 2. Procurement Approval
      await request(app.getHttpServer())
        .post(`/api/v1/procurement/requests/${purchaseRequestId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'PROCUREMENT' })
        .expect(200);

      // 3. Finance Approval
      const res = await request(app.getHttpServer())
        .post(`/api/v1/procurement/requests/${purchaseRequestId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'FINANCE' })
        .expect(200);

      expect(res.body.data.status).toBe('ORDERED');

      // Check that a PurchaseOrder was created automatically
      const po = await prisma.purchaseOrder.findFirst({
        where: { purchaseRequestId },
        include: { items: true },
      });
      expect(po).toBeDefined();
      purchaseOrderId = po.id;
      poItemId = po.items[0].id;
    });
  });

  describe('Purchase Order Approvals & Goods Validation', () => {
    it('POST /api/v1/procurement/orders/:id/approve (Level 1 to 3)', async () => {
      // Level 1 Approval
      await request(app.getHttpServer())
        .post(`/api/v1/procurement/orders/${purchaseOrderId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ level: 1, comments: 'L1 Approved' })
        .expect(200);

      // Level 2 Approval
      await request(app.getHttpServer())
        .post(`/api/v1/procurement/orders/${purchaseOrderId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ level: 2, comments: 'L2 Approved' })
        .expect(200);

      // Level 3 Approval
      const res = await request(app.getHttpServer())
        .post(`/api/v1/procurement/orders/${purchaseOrderId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ level: 3, comments: 'L3 Approved' })
        .expect(200);

      // PO should now be APPROVED
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
      });
      expect(po.status).toBe('APPROVED');
    });

    it('POST /api/v1/procurement/orders/:id/receive (Failure - Over Receiving Prevention)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/procurement/orders/${purchaseOrderId}/receive`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          warehouseId,
          items: [
            {
              itemId: poItemId,
              quantityReceived: 12, // 12 > 10 ordered
            },
          ],
        })
        .expect(400);
    });

    it('POST /api/v1/procurement/orders/:id/receive (Success)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/procurement/orders/${purchaseOrderId}/receive`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          warehouseId,
          items: [
            {
              itemId: poItemId,
              quantityReceived: 10, // Full receive
            },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('Dashboards & Supplier Performance scorecard', () => {
    it('GET /api/v1/procurement/dashboard (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/procurement/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('monthlyProcurementCost');
        });
    });

    it('GET /api/v1/procurement/suppliers/:id/performance (Success)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/procurement/suppliers/${supplierId}/performance`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('performanceScore');
        });
    });
  });
});
