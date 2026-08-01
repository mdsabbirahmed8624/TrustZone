import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: PrismaService;

  const mockPrismaService = {
    accountingPeriod: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    fiscalYear: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    financialAccount: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    journalEntry: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    journalLine: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    customer: {
      update: jest.fn(),
    },
    supplier: {
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPeriodLock', () => {
    it('should throw BadRequestException if period is locked', async () => {
      mockPrismaService.accountingPeriod.findFirst.mockResolvedValue({
        id: 'period-1',
        name: '2026-07',
        isLocked: true,
      });

      const lines = [
        { accountId: 'acc-1', debit: 100, credit: 0 },
        { accountId: 'acc-2', debit: 0, credit: 100 },
      ];

      await expect(
        service.createJournalEntry({
          branchId: 'branch-1',
          createdById: 'user-1',
          referenceModule: 'INCOME',
          lines,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if no period matches date', async () => {
      mockPrismaService.accountingPeriod.findFirst.mockResolvedValue(null);

      const lines = [
        { accountId: 'acc-1', debit: 100, credit: 0 },
        { accountId: 'acc-2', debit: 0, credit: 100 },
      ];

      await expect(
        service.createJournalEntry({
          branchId: 'branch-1',
          createdById: 'user-1',
          referenceModule: 'INCOME',
          lines,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createJournalEntry (Double-entry logic)', () => {
    it('should throw BadRequestException if debits and credits do not balance', async () => {
      mockPrismaService.accountingPeriod.findFirst.mockResolvedValue({
        id: 'period-1',
        name: '2026-07',
        isLocked: false,
      });

      const lines = [
        { accountId: 'acc-1', debit: 100, credit: 0 },
        { accountId: 'acc-2', debit: 0, credit: 90 }, // Unbalanced!
      ];

      await expect(
        service.createJournalEntry({
          branchId: 'branch-1',
          createdById: 'user-1',
          referenceModule: 'INCOME',
          lines,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully post journal entry when balanced', async () => {
      mockPrismaService.accountingPeriod.findFirst.mockResolvedValue({
        id: 'period-1',
        name: '2026-07',
        isLocked: false,
      });

      mockPrismaService.journalEntry.create.mockResolvedValue({
        id: 'je-1',
        voucherNumber: 'JV-202607-001',
      });

      mockPrismaService.financialAccount.findUnique.mockResolvedValue({
        id: 'acc-1',
        accountNumber: '1010',
        accountClass: 'ASSET',
        accountType: 'CASH',
        currentBalance: 500.0,
      });

      mockPrismaService.financialAccount.update.mockResolvedValue({
        id: 'acc-1',
        accountNumber: '1010',
        accountClass: 'ASSET',
        accountType: 'CASH',
        currentBalance: 600.0,
      });

      const lines = [
        { accountId: 'acc-1', debit: 100, credit: 0 },
        { accountId: 'acc-2', debit: 0, credit: 100 },
      ];

      const res = await service.createJournalEntry({
        branchId: 'branch-1',
        createdById: 'user-1',
        referenceModule: 'INCOME',
        lines,
      });

      expect(res.voucherNumber).toBeDefined();
      expect(mockPrismaService.journalEntry.create).toHaveBeenCalled();
      expect(mockPrismaService.journalLine.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('reverseJournalEntry', () => {
    it('should swap debits and credits when reversing', async () => {
      mockPrismaService.journalEntry.findUnique.mockImplementation(
        ({ where }) => {
          if (where.id === 'je-1') {
            return Promise.resolve({
              id: 'je-1',
              voucherNumber: 'JV-202607-001',
              branchId: 'branch-1',
              referenceModule: 'INCOME',
              isReversal: false,
              lines: [
                { accountId: 'acc-1', debit: 150.0, credit: 0 },
                { accountId: 'acc-2', debit: 0, credit: 150.0 },
              ],
            });
          }
          return Promise.resolve(null);
        },
      );

      mockPrismaService.accountingPeriod.findFirst.mockResolvedValue({
        id: 'period-1',
        name: '2026-07',
        isLocked: false,
      });

      mockPrismaService.financialAccount.findUnique.mockResolvedValue({
        id: 'acc-1',
        accountNumber: '1010',
        accountClass: 'ASSET',
        accountType: 'CASH',
      });

      mockPrismaService.journalEntry.findFirst.mockResolvedValue(null);

      mockPrismaService.journalEntry.create.mockResolvedValue({
        id: 'je-reversal',
        voucherNumber: 'JV-REVERSAL',
      });

      const res = await service.reverseJournalEntry('je-1', 'user-1');

      expect(res).toBeDefined();
      expect(mockPrismaService.journalEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isReversal: true,
            reversedEntryId: 'je-1',
          }),
        }),
      );
    });
  });
});
