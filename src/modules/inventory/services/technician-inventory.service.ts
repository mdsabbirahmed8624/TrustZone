import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TechnicianInventoryService {
  private readonly logger = new Logger(TechnicianInventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTechnicianStock(technicianId: string) {
    return this.prisma.technicianInventory.findMany({
      where: { technicianId },
      include: {
        part: { select: { sku: true, name: true, basePrice: true } },
      },
    });
  }

  async allocateStockToTechnician(
    technicianId: string,
    partId: string,
    quantity: number,
  ) {
    this.logger.log(
      `Allocating ${quantity} units of part ${partId} to technician ${technicianId}`,
    );

    return this.prisma.technicianInventory.upsert({
      where: {
        technicianId_partId: {
          technicianId,
          partId,
        },
      },
      update: {
        quantity: { increment: quantity },
        lastSyncAt: new Date(),
      },
      create: {
        technicianId,
        partId,
        quantity,
        lastSyncAt: new Date(),
      },
    });
  }
}
