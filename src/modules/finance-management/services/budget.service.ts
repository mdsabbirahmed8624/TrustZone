import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a Fiscal Year Budget header & line allocations
   */
  async createBudget(data: {
    title: string;
    fiscalYear?: string;
    department?: string;
    totalBudget: number;
    lines?: { category: string; allocated: number; costCenterId?: string }[];
  }) {
    const total = Number(data.totalBudget);

    const budget = await this.prisma.budget.create({
      data: {
        title: data.title,
        fiscalYear: data.fiscalYear || 'FY2026',
        department: data.department || 'Corporate',
        totalBudget: total,
        status: 'SUBMITTED',
        lines: {
          create: (data.lines || []).map((l) => ({
            category: l.category,
            allocated: Number(l.allocated),
            spent: 0,
            variance: Number(l.allocated),
            costCenterId: l.costCenterId || null,
          })),
        },
      },
      include: { lines: true },
    });

    this.logger.log(`Created Budget '${budget.title}' [Total: $${total}]`);
    return budget;
  }

  /**
   * Approves budget
   */
  async approveBudget(budgetId: string) {
    const budget = await this.prisma.budget.update({
      where: { id: budgetId },
      data: { status: 'APPROVED' },
    });

    this.logger.log(`Approved Budget '${budgetId}'`);
    return budget;
  }
}
