import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SyncStep {
  id: string; // unique scan ID or operation UUID (prevents duplicate scans)
  inventoryItemId: string;
  quantityDelta: number;
  timestamp: string; // ISO Date String
  userId: string;
  barcode?: string;
}

@Injectable()
export class InventorySyncService {
  private readonly logger = new Logger(InventorySyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async syncOfflineMovements(steps: SyncStep[]) {
    this.logger.log(
      `Synchronizing batch of ${steps.length} offline stock operations.`,
    );
    const results = [];

    for (const step of steps) {
      // 1. Barcode/QR Duplicate Scan Detection
      if (step.barcode) {
        const loggedAudit = await this.prisma.inventoryAuditLog.findFirst({
          where: {
            action: 'SCAN_AUDIT',
            details: { contains: `ScanID:${step.id}` },
          },
        });

        if (loggedAudit) {
          this.logger.warn(`Duplicate scan detected and rejected: ${step.id}`);
          results.push({
            id: step.id,
            status: 'REJECTED',
            reason: 'Duplicate scan registered.',
          });
          continue;
        }
      }

      // 2. Process with Last-Write-Wins (LWW) conflict verification
      try {
        const item = await this.prisma.inventoryItem.findUnique({
          where: { id: step.inventoryItemId },
        });

        if (!item) {
          results.push({
            id: step.id,
            status: 'FAILED',
            reason: 'InventoryItem not found.',
          });
          continue;
        }

        // LWW check: If database record has a newer modification time than the client transaction, skip/reject modification
        if (
          new Date(item.updatedAt).getTime() >
          new Date(step.timestamp).getTime()
        ) {
          this.logger.warn(
            `LWW Conflict: Client update for item ${step.inventoryItemId} is older than server record. Server Wins.`,
          );
          results.push({
            id: step.id,
            status: 'SKIPPED',
            reason: 'LWW Conflict: Server version is newer.',
          });
          continue;
        }

        // Apply modification in transaction
        await this.prisma.$transaction(async (tx) => {
          const beforeQty = item.quantity;
          const afterQty = Math.max(0, beforeQty + step.quantityDelta);

          // Update Item
          await tx.inventoryItem.update({
            where: { id: item.id, version: item.version },
            data: {
              quantity: afterQty,
              version: { increment: 1 },
            },
          });

          // Log Immutable Ledger Movement
          await tx.inventoryMovement.create({
            data: {
              inventoryItemId: item.id,
              beforeQuantity: beforeQty,
              afterQuantity: afterQty,
              quantityDelta: step.quantityDelta,
              type: step.quantityDelta >= 0 ? 'IN' : 'OUT',
              sourceModule: 'OFFLINE_SYNC',
              userId: step.userId,
              reference:
                `Offline sync step ${step.id}` +
                (step.barcode ? ` Barcode: ${step.barcode}` : ''),
            },
          });

          // Log Scan Audit to database
          if (step.barcode) {
            await tx.inventoryAuditLog.create({
              data: {
                userId: step.userId,
                action: 'SCAN_AUDIT',
                details: `ScanID:${step.id} Barcode:${step.barcode} Item:${item.id}`,
              },
            });
          }
        });

        results.push({ id: step.id, status: 'SUCCESS' });
      } catch (e) {
        this.logger.error(
          `Failed to process offline sync step ${step.id}: ${e.message}`,
        );
        results.push({ id: step.id, status: 'FAILED', reason: e.message });
      }
    }

    return results;
  }
}
