import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpsertPortalConfigDto {
  franchiseId: string;
  customDomain?: string;
  primaryColor?: string;
  featureToggles: Record<string, boolean>;
  apiRateLimitPerMin?: number;
}

export interface LogReplicationDto {
  clusterId: string;
  sourceRegion: string;
  targetRegion: string;
  replicationLagMs: number;
  replicatedRecordsCount: number;
}

@Injectable()
export class FranchiseBook3Service {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // 1. FRANCHISEE PORTAL CONFIGURATION & WHITE-LABELING
  // ----------------------------------------------------
  async upsertPortalConfig(dto: UpsertPortalConfigDto) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id: dto.franchiseId },
    });
    if (!franchise) {
      throw new NotFoundException(`Franchise '${dto.franchiseId}' not found.`);
    }

    return this.prisma.franchiseePortalConfig.upsert({
      where: { franchiseId: dto.franchiseId },
      update: {
        customDomain: dto.customDomain,
        primaryColor: dto.primaryColor ?? '#0f172a',
        featureTogglesJson: JSON.stringify(dto.featureToggles || {}),
        apiRateLimitPerMin: dto.apiRateLimitPerMin ?? 600,
      },
      create: {
        franchiseId: dto.franchiseId,
        customDomain: dto.customDomain,
        primaryColor: dto.primaryColor ?? '#0f172a',
        featureTogglesJson: JSON.stringify(dto.featureToggles || {}),
        apiRateLimitPerMin: dto.apiRateLimitPerMin ?? 600,
      },
    });
  }

  async getPortalConfig(franchiseId: string) {
    const config = await this.prisma.franchiseePortalConfig.findUnique({
      where: { franchiseId },
    });
    if (!config) {
      // Default white-label fallback config
      return {
        franchiseId,
        customDomain: null,
        primaryColor: '#0f172a',
        featureTogglesJson: JSON.stringify({
          billing: true,
          inventory: true,
          analytics: true,
        }),
        apiRateLimitPerMin: 600,
      };
    }
    return config;
  }

  // ----------------------------------------------------
  // 2. CROSS-CLUSTER MULTI-REGION REPLICATION MONITORING
  // ----------------------------------------------------
  async logReplicationSync(dto: LogReplicationDto) {
    const status =
      dto.replicationLagMs > 5000
        ? 'DESYNCED'
        : dto.replicationLagMs > 1000
          ? 'LAG_WARNING'
          : 'HEALTHY';

    return this.prisma.crossClusterReplicationLog.create({
      data: {
        clusterId: dto.clusterId,
        sourceRegion: dto.sourceRegion,
        targetRegion: dto.targetRegion,
        replicationLagMs: dto.replicationLagMs,
        status,
        replicatedRecordsCount: dto.replicatedRecordsCount,
      },
    });
  }

  async getReplicationStatus() {
    return this.prisma.crossClusterReplicationLog.findMany({
      orderBy: { lastSyncedAt: 'desc' },
      take: 20,
    });
  }
}
