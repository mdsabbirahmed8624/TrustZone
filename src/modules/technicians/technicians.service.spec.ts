import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TechniciansService', () => {
  let service: TechniciansService;
  let prisma: PrismaService;

  const mockTechUser = {
    id: 'tech-uuid',
    email: 'tech.dhanmondi@trustzone.care',
    firstName: 'Kamal',
    lastName: 'Uddin',
    role: 'TECHNICIAN',
    branchId: 'branch-uuid',
    skills: [],
    availability: true,
    isOnline: true,
    leaveStatus: 'active',
    certificationLevel: 'L3',
    rating: 5.0,
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    ticket: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    attendance: {
      upsert: jest.fn(),
    },
    leaveRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechniciansService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TechniciansService>(TechniciansService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should query and return technician lists with workloads', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockTechUser]);
      mockPrismaService.ticket.count.mockResolvedValue(2);
      mockPrismaService.ticket.findMany.mockResolvedValue([]);

      const result = await service.findAll();
      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result[0].workload).toBe(2);
    });
  });

  describe('logAttendance', () => {
    it('should upsert attendance record for today', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockTechUser);
      mockPrismaService.attendance.upsert.mockResolvedValue({ id: 'att-uuid' });

      const result = await service.logAttendance('tech-uuid', {
        status: 'present',
        checkIn: new Date().toISOString(),
      });

      expect(prisma.attendance.upsert).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
