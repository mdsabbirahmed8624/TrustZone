import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  const mockCustomer = {
    id: 'cust-uuid',
    firstName: 'Rafiq',
    lastName: 'Karim',
    email: 'rafiq.k@gmail.com',
    phone: '01711122233',
    loyaltyPoints: 100,
    tags: ['VIP'],
    createdAt: new Date(),
    devices: [],
    tickets: [],
    communications: [],
    documents: [],
  };

  const mockPrismaService = {
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    customerCommunication: {
      create: jest.fn(),
    },
    customerDocument: {
      create: jest.fn(),
    },
    customerActivity: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create customer if not duplicate', async () => {
      mockPrismaService.customer.findFirst.mockResolvedValue(null);
      mockPrismaService.customer.create.mockResolvedValue(mockCustomer);

      const result = await service.create({
        firstName: 'Rafiq',
        lastName: 'Karim',
        email: 'rafiq.k@gmail.com',
        phone: '01711122233',
      });

      expect(prisma.customer.findFirst).toHaveBeenCalled();
      expect(prisma.customer.create).toHaveBeenCalled();
      expect(result).toEqual(mockCustomer);
    });

    it('should throw BadRequestException if duplicate exists', async () => {
      mockPrismaService.customer.findFirst.mockResolvedValue(mockCustomer);

      await expect(
        service.create({
          firstName: 'Rafiq',
          lastName: 'Karim',
          email: 'rafiq.k@gmail.com',
          phone: '01711122233',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
