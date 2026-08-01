import { Test, TestingModule } from '@nestjs/testing';
import { FranchiseBook1Service } from './services/franchise-book1.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 12 Book 1 Unit Tests (Franchise Tiers & Territory)', () => {
  let service: FranchiseBook1Service;

  const mockPrisma = {
    franchiseTier: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    franchise: {
      findUnique: jest.fn(),
    },
    territoryZone: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    royaltyInvoice: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    partnerComplianceAudit: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FranchiseBook1Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FranchiseBook1Service>(FranchiseBook1Service);
    jest.clearAllMocks();
  });

  it('should upsert a franchise tier classification', async () => {
    mockPrisma.franchiseTier.upsert.mockResolvedValueOnce({
      id: 't-1',
      tierName: 'GOLD',
      minRevenueThreshold: 250000,
    });

    const res = await service.upsertTier({
      tierName: 'GOLD',
      minRevenueThreshold: 250000,
      perks: ['VIP Support', 'Priority Stock'],
    });

    expect(res.tierName).toBe('GOLD');
    expect(mockPrisma.franchiseTier.upsert).toHaveBeenCalled();
  });

  it('should evaluate franchise tier qualification based on gross sales', async () => {
    mockPrisma.franchise.findUnique.mockResolvedValueOnce({
      id: 'f-1',
      code: 'TX-01',
      settlements: [{ grossRevenue: 300000 }],
    });
    mockPrisma.franchiseTier.findMany.mockResolvedValueOnce([
      { tierName: 'PLATINUM', minRevenueThreshold: 500000 },
      { tierName: 'GOLD', minRevenueThreshold: 250000 },
      { tierName: 'BRONZE', minRevenueThreshold: 0 },
    ]);

    const evalResult = await service.evaluateFranchiseTier('f-1');

    expect(evalResult.assignedTier).toBe('GOLD');
  });

  it('should auto-generate itemized royalty invoice', async () => {
    mockPrisma.franchise.findUnique.mockResolvedValue({
      id: 'f-1',
      code: 'TX-01',
      royaltyRate: 0.05,
      settlements: [{ grossRevenue: 300000 }],
    });
    mockPrisma.franchiseTier.findMany.mockResolvedValue([
      {
        tierName: 'GOLD',
        minRevenueThreshold: 250000,
        royaltyDiscountRate: 0.01,
        marketingFundPercentage: 0.02,
      },
    ]);
    mockPrisma.franchiseTier.findUnique.mockResolvedValue({
      tierName: 'GOLD',
      royaltyDiscountRate: 0.01,
      marketingFundPercentage: 0.02,
    });

    mockPrisma.royaltyInvoice.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'inv-1', ...data }),
    );

    const dueDate = new Date();
    const invoice = await service.generateRoyaltyInvoice(
      'f-1',
      '2026-Q3',
      100000,
      dueDate,
    );

    expect(invoice.baseRoyaltyFee).toBe(5000);
    expect(invoice.marketingFee).toBe(2000);
    expect(invoice.totalDue).toBe(5000 + 2000 - 50); // 6950
  });
});
