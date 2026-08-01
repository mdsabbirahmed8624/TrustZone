import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncStatus } from '@prisma/client';

export interface MutationStep {
  entityName: string;
  entityId: string;
  clientUpdatedAt: string;
  data: Record<string, any>;
}

@Injectable()
export class SyncEngineService {
  private readonly logger = new Logger(SyncEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processSyncBatch(
    userId: string,
    deviceUUID: string,
    steps: MutationStep[],
  ): Promise<{ batchId: string; status: SyncStatus; conflictsCount: number }> {
    this.logger.log(
      `Processing sync batch from device ${deviceUUID} for user ${userId}`,
    );

    // Create sync batch record
    const batch = await this.prisma.offlineSyncBatch.create({
      data: {
        userId,
        deviceUUID,
        payload: steps as any,
        syncStatus: SyncStatus.PENDING,
      },
    });

    let conflictsCount = 0;

    for (const step of steps) {
      const modelName = step.entityName.toLowerCase();

      // Check if model exists in prisma client
      if (!this.prisma[modelName]) {
        this.logger.warn(
          `Model ${step.entityName} is not registered in Prisma.`,
        );
        continue;
      }

      // Fetch current server version
      const serverRecord = await this.prisma[modelName].findUnique({
        where: { id: step.entityId },
      });

      if (!serverRecord) {
        // Record does not exist on server, treat as fresh insert
        await this.prisma[modelName].create({
          data: { id: step.entityId, ...step.data },
        });
        continue;
      }

      // Last-Write-Wins (LWW) conflict logic comparing client vs server timestamps
      const serverUpdatedAt = new Date(
        serverRecord.updatedAt || serverRecord.createdAt || 0,
      );
      const clientUpdatedAt = new Date(step.clientUpdatedAt);

      if (clientUpdatedAt.getTime() > serverUpdatedAt.getTime()) {
        // Client update is newer, apply change directly
        await this.prisma[modelName].update({
          where: { id: step.entityId },
          data: step.data,
        });
      } else {
        // Client update is older, detect conflict
        conflictsCount++;
        await this.prisma.syncConflict.create({
          data: {
            batchId: batch.id,
            entityName: step.entityName,
            entityId: step.entityId,
            clientVersion: step.data,
            serverVersion: JSON.parse(JSON.stringify(serverRecord)),
            resolvedStatus: SyncStatus.CONFLICT,
          },
        });
        this.logger.warn(
          `Conflict detected on ${step.entityName} #${step.entityId}`,
        );
      }
    }

    const finalStatus =
      conflictsCount > 0 ? SyncStatus.CONFLICT : SyncStatus.SUCCESS;

    await this.prisma.offlineSyncBatch.update({
      where: { id: batch.id },
      data: { syncStatus: finalStatus },
    });

    return {
      batchId: batch.id,
      status: finalStatus,
      conflictsCount,
    };
  }

  async getIncrementalUpdates(lastSyncTimestamp: string) {
    const syncDate = new Date(lastSyncTimestamp);
    // In production, pulls records modified since last sync date across core entities
    const tickets = await this.prisma.ticket.findMany({
      where: { createdAt: { gt: syncDate } },
    });
    return {
      serverTimestamp: new Date().toISOString(),
      updates: {
        tickets,
      },
    };
  }
}
