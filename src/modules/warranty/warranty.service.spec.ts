import { Test, TestingModule } from '@nestjs/testing';
import { WarrantyService } from './warranty.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WarrantyService', () => {
  let service: WarrantyService;
  let prisma: PrismaService;

  const mockPrisma = {
    ticket: {
      findUnique: jest.fn(),
    },
    warranty: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    warrantyHistory: {
      create: jest.fn(),
    },
    customerActivity: {
      create: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
    },
    warrantyClaim: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    supplierRma: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    branchInventory: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    stockMovement: {
      create: jest.fn(),
    },
    financialAccount: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    accountingPeriod: {
      findFirst: jest.fn(),
    },
    journalEntry: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarrantyService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<WarrantyService>(WarrantyService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('issueWarrantyForTicket', () => {
    it('should throw NotFoundException if ticket does not exist', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);
      await expect(service.issueWarrantyForTicket('t-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if ticket status is not delivered', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: 't-1',
        status: 'diagnosing',
      });
      await expect(service.issueWarrantyForTicket('t-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return existing warranty if it already exists', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: 't-1',
        status: 'delivered',
        customerId: 'c-1',
      });
      mockPrisma.warranty.findUnique.mockResolvedValue({
        id: 'w-1',
        warrantyNumber: 'TZ-WARR-11',
      });
      const res = await service.issueWarrantyForTicket('t-1');
      expect(res).toEqual({ id: 'w-1', warrantyNumber: 'TZ-WARR-11' });
    });

    it('should auto-issue a new warranty certificate on delivery', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: 't-1',
        status: 'delivered',
        customerId: 'c-1',
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 13',
        serialOrImei: 'IMEI-9921',
        branchId: 'b-1',
        invoice: { id: 'inv-1' },
      });
      mockPrisma.warranty.findUnique.mockResolvedValue(null);
      mockPrisma.warranty.create.mockResolvedValue({
        id: 'w-new',
        warrantyNumber: 'TZ-WARR-99',
      });

      const res = await service.issueWarrantyForTicket('t-1');
      expect(res.id).toBe('w-new');
      expect(mockPrisma.warranty.create).toHaveBeenCalled();
      expect(mockPrisma.warrantyHistory.create).toHaveBeenCalled();
      expect(mockPrisma.customerActivity.create).toHaveBeenCalled();
    });
  });

  describe('createClaim', () => {
    it('should throw BadRequestException if warranty status is not active', async () => {
      mockPrisma.warranty.findUnique.mockResolvedValue({
        id: 'w-1',
        status: 'VOID',
      });
      await expect(
        service.createClaim({
          warrantyId: 'w-1',
          issueDescription: 'Cracked screen',
          branchId: 'b-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a new customer claim and update warranty status', async () => {
      mockPrisma.warranty.findUnique.mockResolvedValue({
        id: 'w-1',
        status: 'ACTIVE',
      });
      mockPrisma.warrantyClaim.create.mockResolvedValue({
        id: 'clm-1',
        claimNumber: 'TZ-CLM-11',
      });

      const res = await service.createClaim({
        warrantyId: 'w-1',
        issueDescription: 'Digitizer issue',
        branchId: 'b-1',
      });
      expect(res.claimNumber).toBe('TZ-CLM-11');
      expect(mockPrisma.warranty.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'w-1' },
          data: { status: 'CLAIMED' },
        }),
      );
    });
  });

  describe('updateClaimStatus APPROVED integrations', () => {
    it('should decrement stock and post journal entries if claim is covered', async () => {
      mockPrisma.warrantyClaim.findUnique.mockResolvedValue({
        id: 'clm-1',
        warrantyId: 'w-1',
        claimNumber: 'TZ-CLM-11',
        isCovered: true,
        branchId: 'branch-1',
        newPartId: 'part-99',
        replacementCost: 1500,
        warranty: { customerId: 'cust-1' },
      });

      mockPrisma.branchInventory.findUnique.mockResolvedValue({
        branchId: 'branch-1',
        partId: 'part-99',
        quantity: 5,
      });

      mockPrisma.financialAccount.findUnique.mockImplementation((q) => {
        if (q.where.accountNumber === '5080')
          return { id: 'acc-5080', accountNumber: '5080' };
        if (q.where.accountNumber === '1300')
          return { id: 'acc-1300', accountNumber: '1300' };
        return null;
      });

      mockPrisma.accountingPeriod.findFirst.mockResolvedValue({
        id: 'period-1',
        isLocked: false,
      });

      await service.updateClaimStatus(
        'clm-1',
        'APPROVED',
        'Replace screen panel',
      );

      expect(mockPrisma.branchInventory.update).toHaveBeenCalled();
      expect(mockPrisma.stockMovement.create).toHaveBeenCalled();
      expect(mockPrisma.journalEntry.create).toHaveBeenCalled();
    });
  });
});
