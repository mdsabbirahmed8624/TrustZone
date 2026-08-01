import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface GoodsReceiptItemDto {
  itemId: string; // PurchaseOrderItem ID
  quantityReceived: number;
  expiryDate?: string;
}

@Injectable()
export class ProcurementValidationService {
  private readonly logger = new Logger(ProcurementValidationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async validateAndReceiveGoods(
    purchaseOrderId: string,
    warehouseId: string,
    receivedById: string,
    items: GoodsReceiptItemDto[],
  ) {
    this.logger.log(
      `Validating and receiving goods for PO ${purchaseOrderId} at Warehouse ${warehouseId}`,
    );

    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: { items: true },
      });

      if (!po)
        throw new NotFoundException(
          `PurchaseOrder ${purchaseOrderId} not found.`,
        );
      if (po.status === 'RECEIVED' || po.status === 'CANCELLED') {
        throw new BadRequestException(
          `Cannot receive items for PO in status: ${po.status}`,
        );
      }

      // Create Goods Receipt Log
      const receiving = await tx.purchaseReceiving.create({
        data: {
          purchaseOrderId,
          warehouseId,
          receivedById,
        },
      });

      for (const input of items) {
        const poItem = po.items.find((i) => i.id === input.itemId);
        if (!poItem) {
          throw new BadRequestException(
            `PurchaseOrderItem ${input.itemId} not found on this PO.`,
          );
        }

        // 1. Over-receiving prevention validation check
        const totalProjected = poItem.quantityReceived + input.quantityReceived;
        if (totalProjected > poItem.quantity) {
          throw new BadRequestException(
            `Over-receiving prevented. Part ID ${poItem.partId}: Ordered: ${poItem.quantity}, Already Received: ${poItem.quantityReceived}, Attempting to Receive: ${input.quantityReceived}`,
          );
        }

        // Update purchase order item quantities received
        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: {
            quantityReceived: totalProjected,
          },
        });

        // 2. Find or create InventoryItem in warehouse (with locking)
        let invItem = await tx.inventoryItem.findFirst({
          where: { warehouseId, partId: poItem.partId, isDeleted: false },
        });

        if (!invItem) {
          invItem = await tx.inventoryItem.create({
            data: {
              warehouseId,
              partId: poItem.partId,
              quantity: 0,
            },
          });
        }

        // Lock row
        await tx.$queryRaw`
          SELECT * FROM inventory_items WHERE id = ${invItem.id}::uuid FOR UPDATE
        `;

        const beforeQty = invItem.quantity;
        const afterQty = beforeQty + input.quantityReceived;

        // Create new FIFO batch lot
        const batchNumber = `LOT-PO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        await tx.inventoryBatch.create({
          data: {
            inventoryItemId: invItem.id,
            batchNumber,
            quantity: input.quantityReceived,
            unitCost: poItem.unitCost,
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
          },
        });

        // Update overall Item Quantity
        await tx.inventoryItem.update({
          where: { id: invItem.id, version: invItem.version },
          data: {
            quantity: afterQty,
            version: { increment: 1 },
          },
        });

        // Log Immutable Ledger Movement
        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: invItem.id,
            beforeQuantity: beforeQty,
            afterQuantity: afterQty,
            quantityDelta: input.quantityReceived,
            type: 'IN',
            sourceModule: 'PROCUREMENT_RECEIVING',
            userId: receivedById,
            warehouseId,
            reference: `Received goods for PO #${purchaseOrderId} Item ID: ${poItem.id}`,
          },
        });
      }

      // Check if PO is fully received
      const reloadedPo = await tx.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: { items: true },
      });

      const fullyReceived = reloadedPo.items.every(
        (i) => i.quantityReceived >= i.quantity,
      );
      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          status: fullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
        },
      });

      return receiving;
    });
  }
}
