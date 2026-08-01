import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a Maintenance Technician
   */
  async registerTechnician(
    name: string,
    specialization: string,
    phone?: string,
  ) {
    return this.prisma.maintenanceTechnician.create({
      data: { name, specialization, phone: phone || null },
    });
  }

  /**
   * Creates a Maintenance Work Order
   */
  async createWorkOrder(data: {
    assetId: string;
    description: string;
    priority?: string;
    technicianId?: string;
    partsCost?: number;
    laborCost?: number;
  }) {
    const workOrderNo = `MWO-${Date.now().toString().slice(-6)}`;
    const parts = Number(data.partsCost || 0);
    const labor = Number(data.laborCost || 0);
    const total = parts + labor;

    const workOrder = await this.prisma.maintenanceWorkOrder.create({
      data: {
        workOrderNo,
        assetId: data.assetId,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        technicianId: data.technicianId || null,
        partsCost: parts,
        laborCost: labor,
        totalCost: total,
        status: 'OPEN',
      },
    });

    this.logger.log(
      `Created MaintenanceWorkOrder '${workOrderNo}' [Total Cost: $${total}]`,
    );
    return workOrder;
  }
}
