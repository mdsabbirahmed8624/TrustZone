import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upserts department
   */
  async upsertDepartment(
    name: string,
    code: string,
    description?: string,
    managerId?: string,
  ) {
    const dept = await this.prisma.department.upsert({
      where: { code },
      update: {
        name,
        description: description || null,
        managerId: managerId || null,
      },
      create: {
        name,
        code,
        description: description || null,
        managerId: managerId || null,
      },
    });
    this.logger.log(`Upserted Department '${dept.name}' (${dept.code})`);
    return dept;
  }

  /**
   * Upserts designation
   */
  async upsertDesignation(
    departmentId: string,
    title: string,
    code: string,
    level = 1,
  ) {
    const desig = await this.prisma.designation.upsert({
      where: { code },
      update: { title, departmentId, level },
      create: { title, code, departmentId, level },
    });
    this.logger.log(`Upserted Designation '${desig.title}' (${desig.code})`);
    return desig;
  }

  /**
   * Upserts full Employee Profile with structural mapping
   */
  async upsertEmployeeProfile(
    userId: string,
    data: {
      department: string;
      designation: string;
      employmentStatus?: string;
      joiningDate?: Date;
      employeeNumber?: string;
      emergencyContacts?: any;
      skills?: string[];
    },
  ) {
    const profile = await this.prisma.employeeProfile.upsert({
      where: { userId },
      update: {
        department: data.department,
        designation: data.designation,
        employmentStatus: data.employmentStatus || 'ACTIVE',
        employeeNumber: data.employeeNumber || null,
        emergencyContacts: data.emergencyContacts || null,
        skills: data.skills || [],
      },
      create: {
        userId,
        department: data.department,
        designation: data.designation,
        employmentStatus: data.employmentStatus || 'ACTIVE',
        joiningDate: data.joiningDate || new Date(),
        employeeNumber: data.employeeNumber || null,
        emergencyContacts: data.emergencyContacts || null,
        skills: data.skills || [],
      },
    });

    this.logger.log(
      `Upserted Employee Profile for User '${userId}' [Dept: ${data.department}]`,
    );
    return profile;
  }

  /**
   * Lists employees with filtering and department pagination
   */
  async getEmployees(query: {
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.department) where.department = query.department;
    if (query.search) {
      where.user = {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.employeeProfile.findMany({
        where,
        skip,
        take: limit,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employeeProfile.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Records employment history (promotions, transfers)
   */
  async recordEmploymentHistory(
    userId: string,
    previousTitle: string,
    newTitle: string,
    changeType = 'PROMOTION',
    notes?: string,
  ) {
    const record = await this.prisma.employmentHistory.create({
      data: {
        userId,
        previousTitle,
        newTitle,
        changeType,
        effectiveDate: new Date(),
        notes: notes || null,
      },
    });

    this.logger.log(
      `Recorded Employment History '${changeType}' for User '${userId}'`,
    );
    return record;
  }
}
