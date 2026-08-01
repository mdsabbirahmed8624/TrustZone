import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ReceiveItemDto {
  partId: string;
  quantity: number;
  unitCost: number;
  expiryDate?: string;
}

export interface ReceivePurchaseDto {
  purchaseOrderId: string;
  warehouseId: string;
  receivedById: string;
  items: ReceiveItemDto[];
}

@Injectable()
export class PurchaseReceivingService {
  private readonly logger = new Logger(PurchaseReceivingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async receivePurchaseOrder(dto: ReceivePurchaseDto) {
    this.logger.log(
      `Receiving PurchaseOrder ${dto.purchaseOrderId} at warehouse ${dto.warehouseId}`,
    );

    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: dto.purchaseOrderId },
        include: { items: true },
      });

      if (!po) {
        throw new NotFoundException(
          `PurchaseOrder ${dto.purchaseOrderId} not found.`,
        );
      }

      // Create receiving transaction record
      const receiving = await tx.purchaseReceiving.create({
        data: {
          purchaseOrderId: dto.purchaseOrderId,
          warehouseId: dto.warehouseId,
          receivedById: dto.receivedById,
        },
      });

      for (const itemDto of dto.items) {
        // Validate PurchaseOrderItem compatibility
        const poItem = po.items.find((i) => i.partId === itemDto.partId);
        if (!poItem) {
          throw new BadRequestException(
            `Part ${itemDto.partId} is not in PurchaseOrder details.`,
          );
        }

        // Update quantityReceived on PO Item
        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: {
            quantityReceived: { increment: itemDto.quantity },
          },
        });

        // Find or create InventoryItem in warehouse (with locking)
        let invItem = await tx.inventoryItem.findFirst({
          where: {
            warehouseId: dto.warehouseId,
            partId: itemDto.partId,
            isDeleted: false,
          },
        });

        if (!invItem) {
          invItem = await tx.inventoryItem.create({
            data: {
              warehouseId: dto.warehouseId,
              partId: itemDto.partId,
              quantity: 0,
            },
          });
        }

        // Lock row
        await tx.$queryRaw`
          SELECT * FROM inventory_items WHERE id = ${invItem.id}::uuid FOR UPDATE
        `;

        const beforeQty = invItem.quantity;
        const afterQty = beforeQty + itemDto.quantity;

        // Create new costed FIFO InventoryBatch
        const batchNumber = `LOT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        await tx.inventoryBatch.create({
          data: {
            inventoryItemId: invItem.id,
            batchNumber,
            quantity: itemDto.quantity,
            unitCost: itemDto.unitCost,
            expiryDate: itemDto.expiryDate
              ? new Date(itemDto.expiryDate)
              : null,
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
            quantityDelta: itemDto.quantity,
            type: 'IN',
            sourceModule: 'PURCHASE_RECEIVING',
            userId: dto.receivedById,
            warehouseId: dto.warehouseId,
            reference: `Received PO #${dto.purchaseOrderId} Batch ${batchNumber}`,
          },
        });
      }

      // If all items received, update PO status
      const updatedPo = await tx.purchaseOrder.findUnique({
        where: { id: dto.purchaseOrderId },
        include: { items: true },
      });

      const allReceived = updatedPo.items.every(
        (i) => i.quantityReceived >= i.quantity,
      );
      if (allReceived) {
        await tx.purchaseOrder.update({
          where: { id: dto.purchaseOrderId },
          data: { status: 'RECEIVED' },
        });
      }

      return receiving;
    });
  }
}
