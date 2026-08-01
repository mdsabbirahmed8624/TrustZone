import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Phase 11 Book 9 - Enterprise Financial Management & Reporting (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testVendorInvoiceId: string;
  let testCustomerInvoiceId: string;
  let testBudgetId: string;
  let testBankAccountId: string;

  const testEmail = `finance-admin-${Date.now()}@test.com`;
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
        firstName: 'Finance',
        lastName: 'Controller',
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

    // Clean up pre-existing accounts
    await prisma.ledgerAccount.deleteMany({
      where: { accountCode: { in: ['1010', '4010', '5010'] } },
    });
    await prisma.chartOfAccount.deleteMany({
      where: { code: { in: ['1010', '4010', '5010'] } },
    });
    await prisma.financialAccount.deleteMany({
      where: { accountNumber: { in: ['1010', '4010', '5010'] } },
    });
  });

  afterAll(async () => {
    if (prisma && testUserId) {
      await prisma.financeAnalytics.deleteMany({});
      await prisma.financialStatement.deleteMany({});
      await prisma.bankReconciliation.deleteMany({});
      await prisma.bankTransaction.deleteMany({});
      await prisma.bankAccount.deleteMany({
        where: { bankName: 'Prime Bank' },
      });
      await prisma.budgetLine.deleteMany({});
      await prisma.budget.deleteMany({
        where: { title: 'Q3 Operations Budget' },
      });
      await prisma.costCenter.deleteMany({ where: { code: 'CC-901' } });
      await prisma.accountsReceivable.deleteMany({});
      await prisma.receiptVoucher.deleteMany({});
      await prisma.customerInvoice.deleteMany({
        where: { customerName: 'Apex Mobile Solutions' },
      });
      await prisma.accountsPayable.deleteMany({});
      await prisma.paymentVoucher.deleteMany({});
      await prisma.vendorInvoice.deleteMany({
        where: { vendorName: 'Global Microchips Inc' },
      });
      await prisma.ledgerAccount.deleteMany({
        where: { accountCode: { in: ['1010', '4010', '5010'] } },
      });
      await prisma.chartOfAccount.deleteMany({
        where: { code: { in: ['1010', '4010', '5010'] } },
      });
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => null);
    }
    await app.close();
  });

  describe('Chart of Accounts & Cost Centers (/api/v1/finance/accounts)', () => {
    it('POST /api/v1/finance/accounts - should upsert chart of account', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: '1010',
          accountNumber: '1010',
          name: 'Main Bank Account BDT',
          accountClass: 'ASSET',
          accountType: 'BANK',
          normalBalance: 'DEBIT',
          description: 'Primary corporate operating account',
        })
        .expect(201);

      const data = res.body.data || res.body;
      expect(data.code || data.accountNumber).toBe('1010');
    });

    it('POST /api/v1/finance/accounts/cost-centers - should upsert cost center', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/accounts/cost-centers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'CC-901',
          name: 'Mobile Repair Operations',
          department: 'Technical Services',
        })
        .expect(201);

      expect(res.body.code).toBe('CC-901');
    });

    it('GET /api/v1/finance/accounts - should list chart of accounts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/finance/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const accounts = Array.isArray(res.body) ? res.body : res.body.data || [];
      expect(accounts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Journal Entry Posting (/api/v1/finance/journal)', () => {
    it('POST /api/v1/finance/journal - should post balanced double-entry journal voucher', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/journal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Initial capital deposit',
          lines: [
            { accountCode: '1010', debit: 25000, credit: 0 },
            { accountCode: '3010', debit: 0, credit: 25000 },
          ],
        })
        .expect(201);

      expect(res.body.voucherNumber).toBeDefined();
    });
  });

  describe('Accounts Payable & Accounts Receivable (/api/v1/finance/ap & /api/v1/finance/ar)', () => {
    it('POST /api/v1/finance/ap/invoices - should register vendor bill', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/ap/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vendorName: 'Global Microchips Inc',
          totalAmount: 4500,
          dueDate: new Date(Date.now() + 864000000),
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testVendorInvoiceId = res.body.id;
    });

    it('POST /api/v1/finance/ap/invoices/:id/pay - should process payment for vendor bill', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/finance/ap/invoices/${testVendorInvoiceId}/pay`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 4500, paymentMode: 'BANK_TRANSFER' })
        .expect(200);

      expect(res.body.status).toBe('PAID');
    });

    it('POST /api/v1/finance/ar/invoices - should register customer sales invoice', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/ar/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Apex Mobile Solutions',
          totalAmount: 8200,
          dueDate: new Date(Date.now() + 864000000),
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testCustomerInvoiceId = res.body.id;
    });

    it('POST /api/v1/finance/ar/invoices/:id/receipt - should record receipt from customer', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/finance/ar/invoices/${testCustomerInvoiceId}/receipt`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 8200, paymentMode: 'BANK_TRANSFER' })
        .expect(200);

      expect(res.body.status).toBe('PAID');
    });
  });

  describe('Budgeting, Banking & Financial Statements (/api/v1/finance/*)', () => {
    it('POST /api/v1/finance/budget - should create budget header', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/budget')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Q3 Operations Budget',
          fiscalYear: 'FY2026',
          department: 'Technical Operations',
          totalBudget: 60000,
          lines: [
            { category: 'EQUIPMENT', allocated: 20000 },
            { category: 'UTILITIES', allocated: 10000 },
          ],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testBudgetId = res.body.id;
    });

    it('POST /api/v1/finance/budget/:id/approve - should approve budget', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/finance/budget/${testBudgetId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });

    it('POST /api/v1/finance/banks - should register corporate bank account', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/banks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bankName: 'Prime Bank',
          accountNumber: `ACC-${Date.now()}`,
          initialBalance: 50000,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      testBankAccountId = res.body.id;
    });

    it('POST /api/v1/finance/reconciliation - should reconcile bank statement', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/reconciliation')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bankAccountId: testBankAccountId,
          statementBal: 50000,
        })
        .expect(200);

      expect(res.body.isReconciled).toBe(true);
    });

    it('POST /api/v1/finance/statements/generate - should generate Trial Balance', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/finance/statements/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ statementType: 'TRIAL_BALANCE', period: '2026-07' })
        .expect(200);

      expect(res.body.statementType).toBe('TRIAL_BALANCE');
    });

    it('GET /api/v1/finance/analytics/dashboard - should return executive financial dashboard metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/finance/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.overview.financialHealthStatus).toBe('EXCELLENT');
    });
  });
});
