import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryAuditService {
  private readonly logger = new Logger(InventoryAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAudit(userId: string, action: string, details: string) {
    this.logger.log(`Audit log: ${action} - User: ${userId}`);
    return this.prisma.inventoryAuditLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  }

  async getAuditLogs() {
    return this.prisma.inventoryAuditLog.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
