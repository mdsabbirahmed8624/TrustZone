import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResolutionStrategy, SyncStatus } from '@prisma/client';

@Injectable()
export class ConflictResolverService {
  private readonly logger = new Logger(ConflictResolverService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolveConflict(
    conflictId: string,
    strategy: ResolutionStrategy,
  ): Promise<void> {
    this.logger.log(
      `Resolving conflict ${conflictId} using strategy ${strategy}`,
    );

    const conflict = await this.prisma.syncConflict.findUnique({
      where: { id: conflictId },
    });

    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found.`);
    }

    const clientData = conflict.clientVersion as Record<string, any>;
    const serverData = conflict.serverVersion as Record<string, any>;

    let resolvedData: Record<string, any>;

    switch (strategy) {
      case ResolutionStrategy.CLIENT_WINS:
        resolvedData = clientData;
        break;
      case ResolutionStrategy.MERGED:
        resolvedData = { ...serverData, ...clientData };
        break;
      case ResolutionStrategy.SERVER_WINS:
      default:
        resolvedData = serverData;
        break;
    }

    // Dynamic database update simulation based on table/entity name
    const modelName = conflict.entityName.toLowerCase();

    // Dynamically execute the db update if possible
    if (this.prisma[modelName]) {
      await this.prisma[modelName].update({
        where: { id: conflict.entityId },
        data: resolvedData,
      });
    }

    await this.prisma.syncConflict.update({
      where: { id: conflictId },
      data: {
        resolvedStatus: SyncStatus.SUCCESS,
        strategy,
        resolvedAt: new Date(),
      },
    });

    this.logger.log(`Conflict ${conflictId} successfully resolved.`);
  }
}
