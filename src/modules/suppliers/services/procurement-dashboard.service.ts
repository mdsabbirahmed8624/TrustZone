import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProcurementDashboardService {
  private readonly logger = new Logger(ProcurementDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    this.logger.log('Compiling Procurement Dashboard summary metrics.');

    const [
      pendingRequests,
      pendingApprovals,
      outstandingOrders,
      totalSuppliers,
    ] = await Promise.all([
      this.prisma.purchaseRequest.count({
        where: {
          status: {
            in: ['PENDING_MANAGER', 'APPROVED_MANAGER', 'APPROVED_PROCUREMENT'],
          },
          isDeleted: false,
        },
      }),
      this.prisma.purchaseOrder.count({
        where: { status: 'DRAFT', isDeleted: false },
      }),
      this.prisma.purchaseOrder.findMany({
        where: {
          status: { in: ['DRAFT', 'APPROVED', 'ORDERED'] },
          isDeleted: false,
        },
        include: { supplier: { select: { name: true } } },
      }),
      this.prisma.supplier.count({ where: { isDeleted: false } }),
    ]);

    // Calculate monthly procurement cost
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const monthlyOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        createdAt: { gte: oneMonthAgo },
        isDeleted: false,
      },
    });

    const monthlyProcurementCost = monthlyOrders.reduce(
      (sum, po) => sum + Number(po.totalAmount),
      0,
    );

    return {
      pendingRequestsCount: pendingRequests,
      pendingApprovalsCount: pendingApprovals,
      outstandingPurchaseOrdersCount: outstandingOrders.length,
      totalSuppliersRegistered: totalSuppliers,
      monthlyProcurementCost,
      outstandingOrders: outstandingOrders.map((o) => ({
        id: o.id,
        supplierName: o.supplier.name,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      })),
    };
  }
}
