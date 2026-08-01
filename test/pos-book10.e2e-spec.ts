import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Phase 11 Book 10 - Enterprise POS, Billing & Omnichannel Commerce (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;

  let counterId: string;
  let shiftId: string;
  let saleId: string;

  const testEmail = `pos-admin-${Date.now()}@test.com`;
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
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test SUPER_ADMIN user
    const hashedPassword = await argon2.hash(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'POS',
        lastName: 'Admin',
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
      await prisma.salesAudit.deleteMany({});
      await prisma.salesAnalytics.deleteMany({});
      await prisma.paymentTransaction.deleteMany({});
      await prisma.loyaltyAccount.deleteMany({
        where: { customerName: 'Robert Smith' },
      });
      await prisma.giftCard.deleteMany({});
      await prisma.coupon.deleteMany({});
      await prisma.exchangeOrder.deleteMany({});
      await prisma.returnItem.deleteMany({});
      await prisma.returnOrder.deleteMany({});
      await prisma.quotationItem.deleteMany({});
      await prisma.quotation.deleteMany({
        where: { customerName: 'Corporate Solutions Ltd' },
      });
      await prisma.invoiceItem.deleteMany({});
      await prisma.retailInvoice.deleteMany({});
      await prisma.saleItem.deleteMany({});
      await prisma.sale.deleteMany({ where: { customerName: 'Robert Smith' } });
      await prisma.cashDrawer.deleteMany({});
      await prisma.pOSShift.deleteMany({});
      await prisma.pOSCounter.deleteMany({
        where: { name: 'Express POS Terminal #1' },
      });
      await prisma.user.delete({ where: { id: testUserId } });
    }
    if (app) {
      await app.close();
    }
  });

  describe('POS Counter & Shift Session Management (/api/v1/pos/*)', () => {
    it('POST /api/v1/pos/register - should register a POS counter terminal', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/pos/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Express POS Terminal #1',
          code: `CNT-REG-${Date.now().toString().slice(-4)}`,
          terminalIp: '192.168.1.101',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      counterId = res.body.id;
    });

    it('GET /api/v1/pos/counters - should list active POS counter terminals', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/pos/counters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/pos/shifts/open - should open cashier shift session', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/pos/shifts/open')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          counterId,
          cashierName: 'John Doe',
          startingCash: 250.0,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('OPEN');
      shiftId = res.body.id;
    });
  });

  describe('Billing & Retail Sales Processing (/api/v1/sales & /api/v1/invoices)', () => {
    it('POST /api/v1/sales - should process retail sale with split payments', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shiftId,
          customerName: 'Robert Smith',
          items: [
            {
              sku: 'MOB-ACC-01',
              productName: 'Fast Charger 20W',
              quantity: 2,
              unitPrice: 25.0,
              taxRate: 5,
            },
            {
              sku: 'MOB-ACC-02',
              productName: 'Tempered Glass Shield',
              quantity: 1,
              unitPrice: 15.0,
              taxRate: 5,
            },
          ],
          payments: [
            { paymentMethod: 'CASH', amount: 40.0 },
            {
              paymentMethod: 'CARD',
              amount: 28.25,
              referenceNo: 'CARD-TX-9021',
            },
          ],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.saleNo).toBeDefined();
      expect(res.body.paymentStatus).toBe('PAID');
      saleId = res.body.id;
    });

    it('POST /api/v1/invoices/generate/:saleId - should generate retail invoice', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/invoices/generate/${saleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(res.body.invoiceNo).toBeDefined();
      expect(res.body.saleId).toBe(saleId);
    });

    it('GET /api/v1/invoices - should list retail invoices', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Quotations, Returns & Exchanges (/api/v1/quotations, /returns, /exchanges)', () => {
    it('POST /api/v1/quotations - should create sales quotation', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Corporate Solutions Ltd',
          validDays: 14,
          items: [
            {
              productName: 'Enterprise Power Bank 10000mAh',
              quantity: 10,
              unitPrice: 45.0,
            },
          ],
        })
        .expect(201);

      expect(res.body.quoteNo).toBeDefined();
      expect(Number(res.body.totalAmount)).toBe(450);
    });

    it('POST /api/v1/returns - should process product return order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/returns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          saleId,
          reason: 'Defective item replaced under warranty',
          items: [{ sku: 'MOB-ACC-02', quantity: 1, refundPrice: 15.0 }],
        })
        .expect(201);

      expect(res.body.returnNo).toBeDefined();
      expect(Number(res.body.refundAmount)).toBe(15);
    });

    it('POST /api/v1/exchanges - should process product exchange order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/exchanges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          saleId,
          returnedSku: 'MOB-ACC-01',
          replacementSku: 'MOB-ACC-03',
          priceDifference: 10.0,
        })
        .expect(201);

      expect(res.body.exchangeNo).toBeDefined();
      expect(Number(res.body.priceDifference)).toBe(10);
    });
  });

  describe('Loyalty, Coupons & Gift Cards (/api/v1/loyalty, /coupons, /giftcards)', () => {
    it('POST /api/v1/loyalty/points - should update customer loyalty points', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/loyalty/points')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Robert Smith',
          pointsDelta: 350,
        })
        .expect(200);

      expect(res.body.tier).toBe('SILVER');
      expect(res.body.activePoints).toBe(350);
    });

    it('POST /api/v1/coupons - should create promotional coupon', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/coupons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: `FESTIVE${Date.now().toString().slice(-4)}`,
          discountType: 'PERCENTAGE',
          discountValue: 10,
        })
        .expect(201);

      expect(res.body.code).toBeDefined();
    });

    it('POST /api/v1/giftcards - should issue stored-value gift card', async () => {
      const gcCode = `GC-E2E-${Date.now().toString().slice(-4)}`;
      const res = await request(app.getHttpServer())
        .post('/api/v1/giftcards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardNumber: gcCode,
          pinCode: '9988',
          initialBalance: 100,
        })
        .expect(201);

      expect(res.body.cardNumber).toBe(gcCode);
      expect(Number(res.body.currentBalance)).toBe(100);

      // Redeem
      const redeemRes = await request(app.getHttpServer())
        .post('/api/v1/giftcards/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardNumber: gcCode,
          pinCode: '9988',
          amountToRedeem: 40,
        })
        .expect(200);

      expect(Number(redeemRes.body.currentBalance)).toBe(60);
    });
  });

  describe('Shift Closing & Executive Sales Analytics (/api/v1/pos/shifts/close & /sales/analytics)', () => {
    it('POST /api/v1/pos/shifts/close - should close cashier shift session', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/pos/shifts/close')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shiftId,
          closingCashCount: 290.0,
        })
        .expect(200);

      expect(res.body.status).toBe('CLOSED');
      expect(res.body.cashVariance).toBeDefined();
    });

    it('GET /api/v1/sales/analytics/dashboard - should return executive sales dashboard', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/sales/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.overview).toBeDefined();
      expect(res.body.overview.totalSalesCount).toBeGreaterThanOrEqual(1);
    });
  });
});
