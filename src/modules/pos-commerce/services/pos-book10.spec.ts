import { Test, TestingModule } from '@nestjs/testing';
import { POSService } from './pos.service';
import { BillingService } from './billing.service';
import { InvoiceService } from './invoice.service';
import { QuotationService } from './quotation.service';
import { ReturnService } from './return.service';
import { ExchangeService } from './exchange.service';
import { LoyaltyService } from './loyalty.service';
import { CouponService } from './coupon.service';
import { PaymentService } from './payment.service';
import { SalesAnalyticsService } from './sales-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Phase 11 Book 10 - PosCommerce Module Unit Tests', () => {
  let posService: POSService;
  let billingService: BillingService;
  let couponService: CouponService;
  let loyaltyService: LoyaltyService;
  let returnService: ReturnService;
  let analyticsService: SalesAnalyticsService;

  const mockPrismaService = {
    pOSCounter: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(3),
    },
    pOSShift: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
    },
    sale: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([
        {
          totalAmount: 150.0,
          taxAmount: 7.5,
          discountAmount: 10.0,
          paymentStatus: 'PAID',
        },
      ]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn(),
    },
    coupon: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    giftCard: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    loyaltyAccount: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    returnOrder: {
      create: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    exchangeOrder: {
      count: jest.fn().mockResolvedValue(0),
    },
    cashDrawer: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        POSService,
        BillingService,
        InvoiceService,
        QuotationService,
        ReturnService,
        ExchangeService,
        LoyaltyService,
        CouponService,
        PaymentService,
        SalesAnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    posService = module.get<POSService>(POSService);
    billingService = module.get<BillingService>(BillingService);
    couponService = module.get<CouponService>(CouponService);
    loyaltyService = module.get<LoyaltyService>(LoyaltyService);
    returnService = module.get<ReturnService>(ReturnService);
    analyticsService = module.get<SalesAnalyticsService>(SalesAnalyticsService);

    jest.clearAllMocks();
  });

  describe('POSService', () => {
    it('should register a POS Counter Terminal', async () => {
      mockPrismaService.pOSCounter.findUnique.mockResolvedValue(null);
      mockPrismaService.pOSCounter.create.mockResolvedValue({
        id: 'counter-1',
        name: 'Main POS #1',
        code: 'CNT-001',
        status: 'ACTIVE',
      });

      const res = await posService.registerCounter('Main POS #1', 'CNT-001');
      expect(res.code).toBe('CNT-001');
      expect(mockPrismaService.pOSCounter.create).toHaveBeenCalled();
    });

    it('should open a cashier shift session', async () => {
      mockPrismaService.pOSCounter.findUnique.mockResolvedValue({
        id: 'counter-1',
        name: 'Main POS #1',
      });
      mockPrismaService.pOSShift.findFirst.mockResolvedValue(null);
      mockPrismaService.pOSShift.create.mockResolvedValue({
        id: 'shift-1',
        cashierName: 'John Doe',
        startingCash: 200,
        status: 'OPEN',
      });

      const res = await posService.openShift('counter-1', 'John Doe', 200);
      expect(res.status).toBe('OPEN');
    });
  });

  describe('BillingService', () => {
    it('should process retail sale with tax and payments', async () => {
      mockPrismaService.sale.create.mockResolvedValue({
        id: 'sale-1',
        saleNo: 'SALE-100293',
        customerName: 'Alice',
        totalAmount: 105,
        paymentStatus: 'PAID',
      });

      const res = await billingService.processSale({
        customerName: 'Alice',
        items: [
          {
            sku: 'SKU-MOB-01',
            productName: 'iPhone Screen Guard',
            quantity: 1,
            unitPrice: 100,
            taxRate: 5,
          },
        ],
        payments: [{ paymentMethod: 'CASH', amount: 105 }],
      });

      expect(res.saleNo).toBeDefined();
      expect(res.paymentStatus).toBe('PAID');
    });
  });

  describe('CouponService', () => {
    it('should create and redeem gift card', async () => {
      mockPrismaService.giftCard.create.mockResolvedValue({
        id: 'card-1',
        cardNumber: 'GC-900293',
        pinCode: '1234',
        currentBalance: 50,
      });

      const card = await couponService.createGiftCard('GC-900293', '1234', 50);
      expect(card.cardNumber).toBe('GC-900293');

      mockPrismaService.giftCard.findUnique.mockResolvedValue({
        id: 'card-1',
        cardNumber: 'GC-900293',
        pinCode: '1234',
        currentBalance: 50,
        status: 'ACTIVE',
      });
      mockPrismaService.giftCard.update.mockResolvedValue({
        id: 'card-1',
        cardNumber: 'GC-900293',
        currentBalance: 30,
        status: 'ACTIVE',
      });

      const redeemed = await couponService.redeemGiftCard(
        'GC-900293',
        '1234',
        20,
      );
      expect(redeemed.currentBalance).toBe(30);
    });
  });

  describe('LoyaltyService', () => {
    it('should upgrade customer loyalty tier based on accumulated points', async () => {
      mockPrismaService.loyaltyAccount.findUnique.mockResolvedValue(null);
      mockPrismaService.loyaltyAccount.upsert.mockResolvedValue({
        customerName: 'Alice',
        totalPoints: 600,
        activePoints: 600,
        tier: 'GOLD',
      });

      const account = await loyaltyService.updateLoyaltyPoints('Alice', 600);
      expect(account.tier).toBe('GOLD');
    });
  });

  describe('SalesAnalyticsService', () => {
    it('should return executive sales analytics dashboard', async () => {
      const res = await analyticsService.getExecutiveDashboard();
      expect(res.overview.totalSalesCount).toBe(1);
      expect(res.overview.grossRevenue).toBe(150.0);
    });
  });
});
