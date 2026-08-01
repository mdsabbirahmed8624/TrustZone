import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { WarrantyService } from '../warranty/warranty.service';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: PrismaService;

  const mockTicket = {
    id: 'ticket-uuid',
    branchId: 'branch-uuid',
    customerId: 'customer-uuid',
    deviceId: 'device-uuid',
    assignedTechId: null,
    status: 'booked',
    estimatedCost: 1000.0,
    slaDeadline: new Date(),
    faults: ['broken screen'],
    tests: [],
    photos: [],
    partsRequired: [],
    customerApproved: false,
    diagnosticCompletedAt: null,
    repairedAt: null,
    deliveredAt: null,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    ticket: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    ticketHistory: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    device: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    customerActivity: {
      create: jest.fn(),
    },
    auditTrail: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: FinanceService,
          useValue: {
            recordRepairDeliveryJournal: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: WarrantyService,
          useValue: {
            issueWarrantyForTicket: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should query and return tickets', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([mockTicket]);
      const results = await service.findAll({ branchId: 'branch-uuid' });
      expect(prisma.ticket.findMany).toHaveBeenCalled();
      expect(results).toEqual([mockTicket]);
    });
  });

  describe('findOne', () => {
    it('should return a ticket if found', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      const result = await service.findOne('ticket-uuid');
      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: 'ticket-uuid' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assign', () => {
    it('should update assigned technician and create history log', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'tech-uuid',
        firstName: 'Kamal',
        lastName: 'Uddin',
      });
      mockPrismaService.ticket.update.mockResolvedValue({
        ...mockTicket,
        assignedTechId: 'tech-uuid',
      });

      await service.assign(
        'ticket-uuid',
        { assignedTechId: 'tech-uuid' },
        'admin-uuid',
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'tech-uuid' },
      });
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-uuid' },
        data: { assignedTechId: 'tech-uuid' },
      });
      expect(prisma.ticketHistory.create).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status and create history log', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.ticket.update.mockResolvedValue({
        ...mockTicket,
        status: 'diagnosing',
      });

      await service.updateStatus(
        'ticket-uuid',
        { status: 'diagnosing' },
        'admin-uuid',
      );

      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-uuid' },
        data: { status: 'diagnosing' },
      });
      expect(prisma.ticketHistory.create).toHaveBeenCalled();
    });
  });
});
