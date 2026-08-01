import { Test, TestingModule } from '@nestjs/testing';
import {
  WorkOrderSignatureService,
  SubmitSignatureDto,
} from './services/work-order-signature.service';
import {
  MobileBillingService,
  RecordPaymentDto,
} from './services/mobile-billing.service';
import { AttachmentStorageService } from './services/attachment-storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

describe('Work Order Approvals, Signature & Billing Engine (Book 6)', () => {
  let signatureService: WorkOrderSignatureService;
  let billingService: MobileBillingService;
  let prisma: PrismaService;

  const mockPrisma = {
    workOrderSignature: {
      create: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'sig-1', ...args.data }),
        ),
    },
    mobilePaymentLog: {
      create: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'pay-1', ...args.data }),
        ),
    },
    ticket: {
      findUnique: jest.fn(),
      update: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
    },
  };

  const mockStorage = {
    storeAttachment: jest
      .fn()
      .mockResolvedValue('file:///mocked_signature.png'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderSignatureService,
        MobileBillingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AttachmentStorageService, useValue: mockStorage },
      ],
    }).compile();

    signatureService = module.get<WorkOrderSignatureService>(
      WorkOrderSignatureService,
    );
    billingService = module.get<MobileBillingService>(MobileBillingService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('Signature Capture & File Storage', () => {
    it('should parse base64 signature, upload file, and record signature details', async () => {
      const dto: SubmitSignatureDto = {
        signeeName: 'Customer Jane',
        signatureBase64:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        latitude: 23.456,
        longitude: 90.123,
        ipAddress: '192.168.1.1',
      };

      const result = await signatureService.submitSignature('ticket-1', dto);
      expect(result.signeeName).toBe('Customer Jane');
      expect(result.signatureUrl).toBe('file:///mocked_signature.png');
      expect(mockStorage.storeAttachment).toHaveBeenCalled();
      expect(mockPrisma.workOrderSignature.create).toHaveBeenCalled();
    });
  });

  describe('Mobile Invoicing Dynamic Calculator', () => {
    it('should compute parts and labor cost dynamically', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValueOnce({
        id: 'ticket-1',
        partsRequired: ['Screen Replacement', 'Battery Replacement'],
        technicianTelemetries: [
          { action: 'REPAIR_COMPLETE', durationMin: 120 },
        ],
      });

      const invoice = await billingService.generateInvoiceDetails('ticket-1');
      expect(invoice.laborMinutes).toBe(120);
      expect(invoice.laborCost).toBe(120); // 120 minutes * $1
      expect(invoice.partsCount).toBe(2);
      expect(invoice.partsCost).toBe(70); // 2 * $35
      expect(invoice.subtotal).toBe(190); // 120 + 70
      expect(invoice.tax).toBe(15.2); // 190 * 0.08
      expect(invoice.total).toBe(205.2);
    });

    it('should use default values if parts or telemetries are missing', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValueOnce({
        id: 'ticket-2',
        partsRequired: [],
        technicianTelemetries: [],
      });

      const invoice = await billingService.generateInvoiceDetails('ticket-2');
      expect(invoice.laborMinutes).toBe(60); // default
      expect(invoice.laborCost).toBe(60); // default minimum base
      expect(invoice.partsCount).toBe(0);
      expect(invoice.partsCost).toBe(0);
      expect(invoice.total).toBe(64.8); // 60 * 1.08
    });
  });

  describe('Billing Payment Sync & Checkout Closure', () => {
    it('should record payment log and transition ticket status to delivered', async () => {
      const dto: RecordPaymentDto = {
        amount: 205.2,
        method: PaymentMethod.CARD,
        transactionRef: 'txn_12345',
      };

      const result = await billingService.recordMobilePayment('ticket-1', dto);
      expect(result.amount).toBe(205.2);
      expect(result.status).toBe(PaymentStatus.SUCCESS);
      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        data: { status: 'delivered', deliveredAt: expect.any(Date) },
      });
    });
  });
});
