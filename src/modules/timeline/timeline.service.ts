import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async logActivity(
    userId: string | null,
    module: string,
    action: string,
    details?: string,
    ipAddress?: string,
  ) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        module,
        action,
        details,
        ipAddress,
      },
    });
  }

  async logAuditTrail(dto: {
    userId?: string | null;
    userEmail?: string | null;
    userRole?: string | null;
    ipAddress?: string | null;
    browser?: string | null;
    branchId?: string | null;
    branchName?: string | null;
    action: string;
    affectedModule: string;
    recordId?: string | null;
    beforeValue?: any;
    afterValue?: any;
    rollbackData?: any;
  }) {
    return this.prisma.auditTrail.create({
      data: {
        userId: dto.userId || null,
        userEmail: dto.userEmail || null,
        userRole: dto.userRole || null,
        ipAddress: dto.ipAddress || null,
        browser: dto.browser || null,
        branchId: dto.branchId || null,
        branchName: dto.branchName || null,
        action: dto.action,
        affectedModule: dto.affectedModule,
        recordId: dto.recordId || null,
        beforeValue: dto.beforeValue
          ? JSON.parse(JSON.stringify(dto.beforeValue))
          : null,
        afterValue: dto.afterValue
          ? JSON.parse(JSON.stringify(dto.afterValue))
          : null,
        rollbackData: dto.rollbackData
          ? JSON.parse(JSON.stringify(dto.rollbackData))
          : null,
      },
    });
  }

  async getTimeline(filters: {
    module?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters.module) where.module = filters.module;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    if (filters.search) {
      where.OR = [
        { details: { contains: filters.search, mode: 'insensitive' } },
        { action: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit ? Number(filters.limit) : 50,
        skip: filters.offset ? Number(filters.offset) : 0,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return { items, total };
  }

  async getAuditTrails(filters: {
    module?: string;
    action?: string;
    recordId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters.module) where.affectedModule = filters.module;
    if (filters.action) where.action = filters.action;
    if (filters.recordId) where.recordId = filters.recordId;

    const [items, total] = await Promise.all([
      this.prisma.auditTrail.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit ? Number(filters.limit) : 50,
        skip: filters.offset ? Number(filters.offset) : 0,
      }),
      this.prisma.auditTrail.count({ where }),
    ]);

    return { items, total };
  }
}
