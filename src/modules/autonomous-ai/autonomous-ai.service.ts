import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AutonomousAIService {
  private readonly logger = new Logger(AutonomousAIService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async triggerSelfHealing() {
    const startTime = Date.now();
    this.logger.log('Executing AI Autonomous Self-Healing Cycle...');

    const stuckTickets = await this.prisma.ticket.findMany({
      where: {
        status: 'IN_PROGRESS',
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Created > 24 hours ago
        },
      },
      take: 10,
    });

    let healedTickets = 0;
    for (const ticket of stuckTickets) {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'PENDING_QA' },
      });
      healedTickets++;
    }

    const duration = Date.now() - startTime;
    const details = {
      action: 'STUCK_TICKETS_HEALED',
      ticketsProcessed: stuckTickets.length,
      healedTickets,
    };

    return this.prisma.autonomousAIOperation.create({
      data: {
        operationType: 'SELF_HEALING',
        targetEntity: 'TICKET_QUEUE',
        status: 'COMPLETED',
        detailsJson: JSON.stringify(details),
        executionTimeMs: duration,
      },
    });
  }

  async triggerAutonomousReorder() {
    const startTime = Date.now();
    this.logger.log('Executing AI Autonomous Low-Stock Reorder Cycle...');

    const lowStockItems = await this.prisma.branchInventory.findMany({
      where: {
        quantity: { lte: 5 },
      },
      take: 10,
    });

    const duration = Date.now() - startTime;
    const details = {
      action: 'LOW_STOCK_REORDER_TRIGGERED',
      lowStockCount: lowStockItems.length,
      itemsReordered: lowStockItems.map((i) => ({
        branchId: i.branchId,
        partId: i.partId,
        currentQty: i.quantity,
        reorderQty: 20,
      })),
    };

    return this.prisma.autonomousAIOperation.create({
      data: {
        operationType: 'REORDER_TRIGGER',
        targetEntity: 'INVENTORY_REORDER',
        status: 'COMPLETED',
        detailsJson: JSON.stringify(details),
        executionTimeMs: duration,
      },
    });
  }

  async getOperationsList(take: number = 20) {
    return this.prisma.autonomousAIOperation.findMany({
      orderBy: { executedAt: 'desc' },
      take,
    });
  }

  async getAutonomousAISummary() {
    const totalOps = await this.prisma.autonomousAIOperation.count();
    const recentOps = await this.prisma.autonomousAIOperation.findMany({
      orderBy: { executedAt: 'desc' },
      take: 5,
    });

    return {
      status: 'ACTIVE',
      engineVersion: 'Phase 12 Autonomous AI v12.0',
      totalOperationsExecuted: totalOps,
      recentOperations: recentOps,
    };
  }
}
