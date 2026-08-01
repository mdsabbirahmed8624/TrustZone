import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryAlertService {
  private readonly logger = new Logger(InventoryAlertService.name);

  constructor(private readonly prisma: PrismaService) {}

  async runAlertSweeper() {
    this.logger.log(
      'Executing low stock and batch expiry validation sweeps...',
    );

    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: { isDeleted: false },
      include: {
        part: true,
        batches: true,
      },
    });

    const createdAlerts = [];

    for (const item of inventoryItems) {
      // 1. Low Stock Buffer Check
      if (item.quantity < item.part.minimumStockBuffer) {
        const message = `Low stock alert: Part ${item.part.name} (SKU: ${item.part.sku}) has current stock ${item.quantity} (Buffer limit: ${item.part.minimumStockBuffer}).`;

        // Check if alert already exists
        const existing = await this.prisma.inventoryAlert.findFirst({
          where: {
            inventoryItemId: item.id,
            alertType: 'LOW_STOCK',
            isResolved: false,
          },
        });

        if (!existing) {
          const alert = await this.prisma.inventoryAlert.create({
            data: {
              inventoryItemId: item.id,
              alertType: 'LOW_STOCK',
              message,
            },
          });
          createdAlerts.push(alert);
        }
      }

      // 2. Batch Expiry Sweep
      const now = new Date();
      const nearExpiryThreshold = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ); // 30 days

      for (const batch of item.batches) {
        if (!batch.expiryDate) continue;

        const expiry = new Date(batch.expiryDate);
        let alertType: 'EXPIRED' | 'NEAR_EXPIRY' | null = null;
        let message = '';

        if (expiry <= now) {
          alertType = 'EXPIRED';
          message = `Expired batch alert: LOT ${batch.batchNumber} for Part ${item.part.name} expired on ${expiry.toISOString().split('T')[0]}.`;
        } else if (expiry <= nearExpiryThreshold) {
          alertType = 'NEAR_EXPIRY';
          message = `Near expiry warning: LOT ${batch.batchNumber} for Part ${item.part.name} will expire on ${expiry.toISOString().split('T')[0]}.`;
        }

        if (alertType) {
          const existing = await this.prisma.inventoryAlert.findFirst({
            where: {
              inventoryItemId: item.id,
              alertType,
              message,
              isResolved: false,
            },
          });

          if (!existing) {
            const alert = await this.prisma.inventoryAlert.create({
              data: {
                inventoryItemId: item.id,
                alertType,
                message,
              },
            });
            createdAlerts.push(alert);
          }
        }
      }
    }

    return createdAlerts;
  }

  async getReorderSuggestions() {
    const lowStockItems = await this.prisma.inventoryItem.findMany({
      where: {
        isDeleted: false,
        quantity: { lt: 5 }, // default standard fallback buffer limit
      },
      include: {
        part: true,
        warehouse: true,
      },
    });

    return lowStockItems.map((item) => {
      const buffer = item.part.minimumStockBuffer;
      const currentQty = item.quantity;
      const reorderQty = Math.max(10, buffer * 3 - currentQty); // order enough to be safely above buffer

      return {
        partId: item.partId,
        sku: item.part.sku,
        name: item.part.name,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouse.name,
        currentQuantity: currentQty,
        bufferLimit: buffer,
        recommendedOrderQuantity: reorderQty,
        estimatedCost: reorderQty * Number(item.part.basePrice),
      };
    });
  }

  async getGlobalInventoryMetrics() {
    const items = await this.prisma.inventoryItem.findMany({
      where: { isDeleted: false },
      include: { part: true, reservations: { where: { isDeleted: false } } },
    });

    let totalValuation = 0;
    let totalItemsCount = 0;
    let totalReservationsCount = 0;

    const fastMoving = [];
    const slowMoving = [];

    for (const item of items) {
      totalItemsCount += item.quantity;
      const reserved = item.reservations.reduce(
        (sum, r) => sum + r.quantity,
        0,
      );
      totalReservationsCount += reserved;
      totalValuation += item.quantity * Number(item.part.basePrice);

      // Fast vs slow moving classification metrics based on reservation volumes
      if (reserved > 5) {
        fastMoving.push({
          sku: item.part.sku,
          name: item.part.name,
          reservations: reserved,
        });
      } else {
        slowMoving.push({
          sku: item.part.sku,
          name: item.part.name,
          stock: item.quantity,
        });
      }
    }

    return {
      totalValuation,
      totalItemsCount,
      totalReservationsCount,
      availableStockCount: totalItemsCount - totalReservationsCount,
      fastMovingParts: fastMoving.slice(0, 5),
      slowMovingParts: slowMoving.slice(0, 5),
      alertCount: await this.prisma.inventoryAlert.count({
        where: { isResolved: false },
      }),
    };
  }
}
