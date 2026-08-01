import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import * as argon2 from 'argon2';

describe('Inventory Book 7 (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = 'inventory-e2e@trustzone.care';
  const testPassword = 'Password123!';
  let token: string;
  let userId: string;

  let branchId: string;
  let warehouseId: string;
  let partId: string;
  let supplierId: string;
  let purchaseOrderId: string;
  let ticketId: string;
  let customerId: string;
  let deviceId: string;
  let reservationId: string;
  let inventoryItemId: string;

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
    await prisma.inventoryMovement.deleteMany({});
    await prisma.inventoryAlert.deleteMany({});
    await prisma.inventoryReservation.deleteMany({});
    await prisma.inventoryBatch.deleteMany({});
    await prisma.inventoryItem.deleteMany({});
    await prisma.purchaseReceiving.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.warehouse.deleteMany({});
    await prisma.inventoryAuditLog.deleteMany({});
    await prisma.technicianInventory.deleteMany({});

    // Clean seed entities
    await prisma.ticket.deleteMany({
      where: {
        branch: { name: 'Inventory Test Branch' },
      },
    });
    await prisma.device.deleteMany({
      where: {
        serialNumber: 'SN-INV-E2E',
      },
    });
    await prisma.customer.deleteMany({
      where: {
        email: 'customer-inv@test.com',
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: testEmail,
      },
    });
    await prisma.part.deleteMany({
      where: {
        sku: 'E2E-PART-SKU',
      },
    });
    await prisma.supplier.deleteMany({
      where: {
        name: 'Test Supplier',
      },
    });
    await prisma.branch.deleteMany({
      where: {
        name: 'Inventory Test Branch',
      },
    });

    // Create seed branch
    const branch = await prisma.branch.create({
      data: {
        name: 'Inventory Test Branch',
        address: '123 Test St',
        timezone: 'UTC',
        status: 'ACTIVE',
      },
    });
    branchId = branch.id;

    // Create User with hashed password
    const hashedPassword = await argon2.hash(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Inv',
        lastName: 'E2E',
        role: 'SUPER_ADMIN',
        branchId: branchId,
        isEmailVerified: true,
      },
    });
    userId = user.id;

    // Create Supplier
    const supplier = await prisma.supplier.create({
      data: {
        name: 'Test Supplier',
        contactPerson: 'John',
        email: 'john@supplier.com',
        phone: '123',
        address: 'Street',
      },
    });
    supplierId = supplier.id;

    // Create Part
    const part = await prisma.part.create({
      data: {
        sku: 'E2E-PART-SKU',
        name: 'E2E Test Screen',
        category: 'Display',
        brand: 'Generic',
        brandCompatibility: 'Apple',
        modelCompatibility: ['iPhone 13'],
        basePrice: 150.0,
        supplierId: supplier.id,
      },
    });
    partId = part.id;

    // Create Customer & Device
    const customer = await prisma.customer.create({
      data: {
        firstName: 'Inv',
        lastName: 'Customer',
        email: 'customer-inv@test.com',
        phone: '555-1234',
        branchId,
      },
    });
    customerId = customer.id;

    const device = await prisma.device.create({
      data: {
        customerId,
        brand: 'Apple',
        model: 'iPhone 13',
        serialNumber: 'SN-INV-E2E',
      },
    });
    deviceId = device.id;

    // Create Ticket
    const ticket = await prisma.ticket.create({
      data: {
        customerId,
        deviceId,
        branchId,
        status: 'booked',
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    ticketId = ticket.id;

    // Create PurchaseOrder
    const po = await prisma.purchaseOrder.create({
      data: {
        supplierId: supplier.id,
        branchId,
        status: 'DRAFT',
        totalAmount: 1500.0,
        items: {
          create: {
            partId,
            quantity: 10,
            unitCost: 150.0,
          },
        },
      },
    });
    purchaseOrderId = po.id;

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
    await prisma.inventoryMovement.deleteMany({});
    await prisma.inventoryAlert.deleteMany({});
    await prisma.inventoryReservation.deleteMany({});
    await prisma.inventoryBatch.deleteMany({});
    await prisma.inventoryItem.deleteMany({});
    await prisma.purchaseReceiving.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.warehouse.deleteMany({});
    await prisma.inventoryAuditLog.deleteMany({});
    await prisma.technicianInventory.deleteMany({});
    await prisma.ticket.deleteMany({ where: { id: ticketId } });
    await prisma.device.deleteMany({ where: { id: deviceId } });
    await prisma.customer.deleteMany({ where: { id: customerId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.part.deleteMany({ where: { id: partId } });
    await prisma.supplier.deleteMany({ where: { id: supplierId } });
    await prisma.branch.deleteMany({ where: { id: branchId } });

    await app.close();
  });

  describe('Warehouse & Purchase Receiving Flows', () => {
    it('POST /api/v1/inventory/warehouses (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/inventory/warehouses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Main E2E Warehouse',
          location: 'Building A, Shelf 2',
          branchId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          warehouseId = res.body.data.id;
        });
    });

    it('GET /api/v1/inventory/warehouses (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/inventory/warehouses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('POST /api/v1/inventory/purchases/receive (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/inventory/purchases/receive')
        .set('Authorization', `Bearer ${token}`)
        .send({
          purchaseOrderId,
          warehouseId,
          receivedById: userId,
          items: [
            {
              partId,
              quantity: 10,
              unitCost: 150.0,
            },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('Parts Reservation & Consumption', () => {
    it('POST /api/v1/inventory/reservations (Success)', async () => {
      // Find the InventoryItem ID
      const item = await prisma.inventoryItem.findFirst({
        where: { warehouseId, partId },
      });
      inventoryItemId = item.id;

      return request(app.getHttpServer())
        .post('/api/v1/inventory/reservations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          warehouseId,
          partId,
          ticketId,
          technicianId: userId,
          quantity: 3,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          reservationId = res.body.data.id;
        });
    });

    it('POST /api/v1/inventory/reservations/:id/consume (Success)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/inventory/reservations/${reservationId}/consume`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('Offline Synchronization & Alerts', () => {
    it('POST /api/v1/inventory/sync (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/inventory/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({
          steps: [
            {
              id: 'scan-e2e-1',
              inventoryItemId,
              quantityDelta: -2,
              timestamp: new Date(Date.now() + 600000).toISOString(),
              userId,
              barcode: 'E2E-BARCODE-ABC',
            },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data[0].status).toBe('SUCCESS');
        });
    });

    it('GET /api/v1/inventory/alerts/low-stock (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/inventory/alerts/low-stock')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('GET /api/v1/inventory/dashboard/metrics (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/inventory/dashboard/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('totalValuation');
        });
    });
  });
});
