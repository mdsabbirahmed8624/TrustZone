import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService } from './ledger.service';
import { JournalService } from './journal.service';
import { AccountsPayableService } from './accounts-payable.service';
import { AccountsReceivableService } from './accounts-receivable.service';
import { BudgetService } from './budget.service';
import { CostCenterService } from './cost-center.service';
import { BankService } from './bank.service';
import { ReconciliationService } from './reconciliation.service';
import { FinancialStatementService } from './financial-statement.service';
import { FinanceAnalyticsService } from './finance-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('Enterprise Financial Management Unit Tests (Book 9)', () => {
  let ledgerService: LedgerService;
  let journalService: JournalService;
  let apService: AccountsPayableService;
  let arService: AccountsReceivableService;
  let budgetService: BudgetService;
  let costCenterService: CostCenterService;
  let bankService: BankService;
  let reconciliationService: ReconciliationService;
  let statementService: FinancialStatementService;
  let analyticsService: FinanceAnalyticsService;

  const mockPrismaService = {
    chartOfAccount: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'coa-1',
        code: '1010',
        name: 'Cash on Hand',
        accountType: 'ASSET',
      }),
      update: jest.fn().mockResolvedValue({
        id: 'coa-1',
        code: '1010',
        name: 'Cash on Hand',
        accountType: 'ASSET',
      }),
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: 'coa-1', code: '1010', name: 'Cash on Hand' },
        ]),
    },
    ledgerAccount: {
      upsert: jest.fn().mockResolvedValue({
        accountCode: '1010',
        accountName: 'Cash on Hand',
        debitBalance: 1000,
        creditBalance: 0,
      }),
      findMany: jest.fn().mockResolvedValue([
        { accountCode: '1010', debitBalance: 5000, creditBalance: 0 },
        { accountCode: '2010', debitBalance: 0, creditBalance: 5000 },
      ]),
    },
    financialAccount: {
      upsert: jest.fn().mockResolvedValue({
        id: 'fa-1',
        accountNumber: '1010',
        name: 'Cash on Hand',
        accountType: 'ASSET',
        accountClass: 'ASSET',
        normalBalance: 'DEBIT',
        openingBalance: 0,
        currentBalance: 0,
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    branch: {
      findFirst: jest.fn().mockResolvedValue({ id: 'branch-1' }),
      create: jest.fn().mockResolvedValue({ id: 'branch-1' }),
    },
    fiscalYear: {
      findFirst: jest.fn().mockResolvedValue({ id: 'fy-1' }),
      create: jest.fn().mockResolvedValue({ id: 'fy-1' }),
    },
    accountingPeriod: {
      findFirst: jest.fn().mockResolvedValue({ id: 'period-1' }),
      create: jest.fn().mockResolvedValue({ id: 'period-1' }),
    },
    user: {
      findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }),
    },
    journalEntry: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'jv-1', voucherNumber: 'JV-100293' }),
      count: jest.fn().mockResolvedValue(42),
    },
    vendorInvoice: {
      create: jest.fn().mockResolvedValue({
        id: 'vinv-1',
        invoiceNo: 'V-INV-101',
        vendorName: 'TechParts Corp',
        totalAmount: 1500,
        paidAmount: 0,
        status: 'UNPAID',
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'vinv-1',
        invoiceNo: 'V-INV-101',
        vendorName: 'TechParts Corp',
        totalAmount: 1500,
        paidAmount: 0,
      }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'vinv-1', paidAmount: 1500, status: 'PAID' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    accountsPayable: {
      create: jest.fn().mockResolvedValue({ id: 'ap-1', status: 'PENDING' }),
    },
    paymentVoucher: {
      create: jest.fn().mockResolvedValue({ id: 'pv-1', voucherNo: 'PV-101' }),
    },
    customerInvoice: {
      create: jest.fn().mockResolvedValue({
        id: 'cinv-1',
        invoiceNo: 'C-INV-201',
        customerName: 'Acme Telecom',
        totalAmount: 3200,
        paidAmount: 0,
        status: 'UNPAID',
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'cinv-1',
        invoiceNo: 'C-INV-201',
        customerName: 'Acme Telecom',
        totalAmount: 3200,
        paidAmount: 0,
      }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'cinv-1', paidAmount: 3200, status: 'PAID' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    accountsReceivable: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'ar-1', status: 'OUTSTANDING' }),
    },
    receiptVoucher: {
      create: jest.fn().mockResolvedValue({ id: 'rv-1', voucherNo: 'RV-201' }),
    },
    budget: {
      create: jest.fn().mockResolvedValue({
        id: 'bgt-1',
        title: 'IT Infrastructure Budget FY2026',
        totalBudget: 50000,
        status: 'SUBMITTED',
      }),
      update: jest.fn().mockResolvedValue({ id: 'bgt-1', status: 'APPROVED' }),
      count: jest.fn().mockResolvedValue(5),
    },
    costCenter: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'cc-1',
        code: 'CC-101',
        name: 'Software R&D',
      }),
      update: jest.fn().mockResolvedValue({
        id: 'cc-1',
        code: 'CC-101',
        name: 'Software R&D',
      }),
    },
    bankAccount: {
      create: jest.fn().mockResolvedValue({
        id: 'bank-1',
        bankName: 'City Bank',
        accountNumber: '11029384',
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'bank-1',
        bankName: 'City Bank',
        accountNumber: '11029384',
        balance: 25000,
      }),
      update: jest.fn().mockResolvedValue({ id: 'bank-1', balance: 30000 }),
      findMany: jest.fn().mockResolvedValue([{ balance: 25000 }]),
    },
    bankTransaction: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'btxn-1', txnType: 'DEPOSIT', amount: 5000 }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    bankReconciliation: {
      create: jest.fn().mockResolvedValue({
        id: 'recon-1',
        isReconciled: true,
        difference: 0,
      }),
    },
    financialStatement: {
      create: jest.fn().mockResolvedValue({
        id: 'stmt-1',
        statementType: 'TRIAL_BALANCE',
        period: '2026-07',
      }),
    },
    asset: {
      findMany: jest.fn().mockResolvedValue([{ netBookValue: 12000 }]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        JournalService,
        AccountsPayableService,
        AccountsReceivableService,
        BudgetService,
        CostCenterService,
        BankService,
        ReconciliationService,
        FinancialStatementService,
        FinanceAnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    ledgerService = module.get<LedgerService>(LedgerService);
    journalService = module.get<JournalService>(JournalService);
    apService = module.get<AccountsPayableService>(AccountsPayableService);
    arService = module.get<AccountsReceivableService>(
      AccountsReceivableService,
    );
    budgetService = module.get<BudgetService>(BudgetService);
    costCenterService = module.get<CostCenterService>(CostCenterService);
    bankService = module.get<BankService>(BankService);
    reconciliationService = module.get<ReconciliationService>(
      ReconciliationService,
    );
    statementService = module.get<FinancialStatementService>(
      FinancialStatementService,
    );
    analyticsService = module.get<FinanceAnalyticsService>(
      FinanceAnalyticsService,
    );
  });

  describe('Chart of Accounts & Cost Centers', () => {
    it('should upsert chart of account entry', async () => {
      const coa = await ledgerService.upsertAccount(
        '1010',
        'Cash on Hand',
        'ASSET',
      );
      expect(coa.code).toBe('1010');
    });

    it('should upsert cost center', async () => {
      const cc = await costCenterService.upsertCostCenter(
        'CC-101',
        'Software R&D',
      );
      expect(cc.code).toBe('CC-101');
    });
  });

  describe('Journal Entry & Double-Entry Balance Validation', () => {
    it('should post balanced journal entry when debit equals credit', async () => {
      const entry = await journalService.createJournalEntry({
        description: 'Office rent payment',
        lines: [
          { accountCode: '5010', debit: 1000, credit: 0 },
          { accountCode: '1010', debit: 0, credit: 1000 },
        ],
      });
      expect(entry.voucherNumber).toBeDefined();
    });

    it('should reject unbalanced journal entry', async () => {
      await expect(
        journalService.createJournalEntry({
          description: 'Unbalanced entry',
          lines: [
            { accountCode: '5010', debit: 1000, credit: 0 },
            { accountCode: '1010', debit: 0, credit: 500 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Accounts Payable & Accounts Receivable', () => {
    it('should create vendor bill and process payment voucher', async () => {
      const inv = await apService.createVendorInvoice({
        vendorName: 'TechParts Corp',
        totalAmount: 1500,
        dueDate: new Date(),
      });
      const pay = await apService.processPayment('vinv-1', 1500);
      expect(inv.invoiceNo).toBeDefined();
      expect(pay.status).toBe('PAID');
    });

    it('should create customer sales invoice and record receipt voucher', async () => {
      const inv = await arService.createCustomerInvoice({
        customerName: 'Acme Telecom',
        totalAmount: 3200,
        dueDate: new Date(),
      });
      const rec = await arService.recordReceipt('cinv-1', 3200);
      expect(inv.invoiceNo).toBeDefined();
      expect(rec.status).toBe('PAID');
    });
  });

  describe('Budgeting, Banking & Financial Statements', () => {
    it('should create and approve departmental budget', async () => {
      const bgt = await budgetService.createBudget({
        title: 'IT Infrastructure',
        totalBudget: 50000,
      });
      const appr = await budgetService.approveBudget(bgt.id);
      expect(appr.status).toBe('APPROVED');
    });

    it('should log bank deposit transaction and reconcile bank statement', async () => {
      const txn = await bankService.logTransaction('bank-1', 'DEPOSIT', 5000);
      const recon = await reconciliationService.reconcileStatement(
        'bank-1',
        25000,
      );
      expect(txn.amount).toBe(5000);
      expect(recon.isReconciled).toBe(true);
    });

    it('should generate financial statement and executive dashboard', async () => {
      const stmt = await statementService.generateStatement(
        'TRIAL_BALANCE',
        '2026-07',
      );
      const dash = await analyticsService.getExecutiveDashboard();
      expect(stmt.statementType).toBe('TRIAL_BALANCE');
      expect(dash.overview.financialHealthStatus).toBe('EXCELLENT');
    });
  });
});
