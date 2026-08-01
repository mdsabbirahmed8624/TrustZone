import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterDatabaseShardDto {
  shardCode: string;
  shardRegion?: string;
  assignedTenantCount?: number;
  shardStatus?: string;
  latencyMs?: number;
}

@Injectable()
export class AutonomousDatabaseShardBook2Service {
  private readonly logger = new Logger(
    AutonomousDatabaseShardBook2Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or rebalance an autonomous multi-region database shard.
   */
  async registerShard(dto: RegisterDatabaseShardDto) {
    this.logger.log(
      `Registering autonomous multi-region database shard: ${dto.shardCode}`,
    );

    return this.prisma.autonomousDatabaseShardBook2.upsert({
      where: { shardCode: dto.shardCode },
      update: {
        shardRegion: dto.shardRegion ?? 'EU_CENTRAL_GERMANY',
        assignedTenantCount: dto.assignedTenantCount ?? 1500,
        shardStatus: dto.shardStatus ?? 'ACTIVE_HEALTHY',
        latencyMs: dto.latencyMs ?? 2.1,
        lastRebalancedAt: new Date(),
      },
      create: {
        shardCode: dto.shardCode,
        shardRegion: dto.shardRegion ?? 'EU_CENTRAL_GERMANY',
        assignedTenantCount: dto.assignedTenantCount ?? 1500,
        shardStatus: dto.shardStatus ?? 'ACTIVE_HEALTHY',
        latencyMs: dto.latencyMs ?? 2.1,
        lastRebalancedAt: new Date(),
      },
    });
  }

  /**
   * List all autonomous multi-region database shards.
   */
  async getShards() {
    return this.prisma.autonomousDatabaseShardBook2.findMany({
      orderBy: { lastRebalancedAt: 'desc' },
    });
  }
}
