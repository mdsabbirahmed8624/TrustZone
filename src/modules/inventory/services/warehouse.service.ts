import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateWarehouseDto {
  name: string;
  location: string;
  branchId: string;
}

@Injectable()
export class WarehouseService {
  private readonly logger = new Logger(WarehouseService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createWarehouse(dto: CreateWarehouseDto) {
    this.logger.log(`Creating warehouse: ${dto.name}`);
    return this.prisma.warehouse.create({
      data: {
        name: dto.name,
        location: dto.location,
        branchId: dto.branchId,
      },
    });
  }

  async getWarehouses() {
    return this.prisma.warehouse.findMany({
      where: { isDeleted: false },
      include: {
        branch: { select: { name: true } },
      },
    });
  }

  async getWarehouseById(id: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, isDeleted: false },
      include: {
        branch: { select: { name: true } },
      },
    });
    if (!warehouse) throw new NotFoundException(`Warehouse ${id} not found.`);
    return warehouse;
  }

  async softDeleteWarehouse(id: string) {
    this.logger.log(`Soft deleting warehouse ${id}`);
    const warehouse = await this.getWarehouseById(id);
    return this.prisma.warehouse.update({
      where: { id: warehouse.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async getWarehouseSummary(id: string) {
    const warehouse = await this.getWarehouseById(id);

    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: { warehouseId: id, isDeleted: false },
      include: {
        part: true,
        batches: true,
        reservations: { where: { isDeleted: false } },
      },
    });

    let totalItems = 0;
    let totalValue = 0;
    let totalReserved = 0;
    const itemsBreakdown = [];

    for (const item of inventoryItems) {
      totalItems += item.quantity;
      totalReserved += item.reservations.reduce(
        (sum, r) => sum + r.quantity,
        0,
      );

      // Value based on batches
      const itemCostValue = item.batches.reduce(
        (sum, b) => sum + b.quantity * Number(b.unitCost),
        0,
      );
      totalValue += itemCostValue;

      itemsBreakdown.push({
        partId: item.partId,
        sku: item.part.sku,
        name: item.part.name,
        quantity: item.quantity,
        reserved: item.reservations.reduce((sum, r) => sum + r.quantity, 0),
        available:
          item.quantity -
          item.reservations.reduce((sum, r) => sum + r.quantity, 0),
        value: itemCostValue,
      });
    }

    // Fast/Slow moving calculations mock parameters for dashboard
    return {
      warehouseId: warehouse.id,
      name: warehouse.name,
      totalItems,
      totalReserved,
      totalAvailable: totalItems - totalReserved,
      totalValue,
      utilizationPercentage: Math.min(
        100,
        Math.round((totalItems / 1000) * 100),
      ), // mock utilization capacity limit 1000 items
      itemsBreakdown,
    };
  }
}
