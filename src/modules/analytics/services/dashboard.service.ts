import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getExecutiveDashboard(branchId?: string) {
    this.logger.log(
      `Compiling executive dashboard metrics for branch ${branchId || 'ALL'}`,
    );

    const filter: any = {};
    if (branchId) {
      filter.branchId = branchId;
    }

    // 1. Revenue
    const payments = await this.prisma.payment.findMany({
      where: branchId ? { invoice: { ticket: { branchId } } } : {},
      select: { amount: true },
    });
    const totalRevenue = payments.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );

    // 2. Expenses
    const expenses = await this.prisma.expense.findMany({
      where: filter,
      select: { amount: true },
    });
    const totalExpenses = expenses.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );

    // 3. Profit
    const profit = Math.max(0, totalRevenue - totalExpenses);

    // 4. Ticket Status Aggregations
    const ticketStats = await (this.prisma.ticket as any).groupBy({
      by: ['status'],
      where: filter,
      _count: { id: true },
    });
    const ticketStatusDistribution = ticketStats.map((stat: any) => ({
      status: stat.status,
      count: stat._count.id,
    }));

    // 5. Technician Productivity (Tickets resolved per technician)
    const technicianStats = await (this.prisma.ticket as any).groupBy({
      by: ['assignedTechId'],
      where: {
        ...filter,
        status: { in: ['ready', 'delivered'] },
        assignedTechId: { not: null },
      },
      _count: { id: true },
    });
    const technicianProductivity = technicianStats.map((stat: any) => ({
      technicianId: stat.assignedTechId,
      resolvedCount: stat._count.id,
    }));

    // 6. Inventory Valuation
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: branchId ? { warehouse: { branchId } } : {},
      include: { part: true },
    });
    const totalInventoryValue = inventoryItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.part.basePrice),
      0,
    );

    // 7. Outstanding Payments (Accounts Receivable)
    const invoices = await this.prisma.invoice.findMany({
      where: {
        ...filter,
        status: 'unpaid',
      },
      select: { total: true },
    });
    const outstandingPayments = invoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0,
    );

    // 8. Procurement Cost
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: filter,
      select: { totalAmount: true },
    });
    const procurementCost = purchaseOrders.reduce(
      (sum, po) => sum + Number(po.totalAmount),
      0,
    );

    // 9. Customer Satisfaction (Simulated CSAT score out of 5.0)
    const customerSatisfaction = 4.7;

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit,
      ticketStatusDistribution,
      technicianProductivity,
      inventoryValue: totalInventoryValue,
      outstandingPayments,
      procurementCost,
      customerSatisfaction,
      timestamp: new Date(),
    };
  }
}
