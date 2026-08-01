import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterMultiCloudMeshDto {
  meshCode: string;
  cloudProvider?: string;
  sovereigntyRegion?: string;
  activeNodesCount?: number;
  healthScorePercent?: number;
  meshStatus?: string;
}

@Injectable()
export class GlobalMultiCloudSovereignMeshBook1Service {
  private readonly logger = new Logger(
    GlobalMultiCloudSovereignMeshBook1Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or update a global multi-cloud sovereign mesh node network.
   */
  async registerMeshNode(dto: RegisterMultiCloudMeshDto) {
    this.logger.log(
      `Registering global multi-cloud sovereign mesh: ${dto.meshCode}`,
    );

    return this.prisma.globalMultiCloudSovereignMeshBook1.upsert({
      where: { meshCode: dto.meshCode },
      update: {
        cloudProvider: dto.cloudProvider ?? 'AWS_GCP_AZURE_HYBRID',
        sovereigntyRegion: dto.sovereigntyRegion ?? 'EU_GDPR_SOVEREIGN',
        activeNodesCount: dto.activeNodesCount ?? 64,
        healthScorePercent: dto.healthScorePercent ?? 99.99,
        meshStatus: dto.meshStatus ?? 'ONLINE_HEALTHY',
        lastSyncedAt: new Date(),
      },
      create: {
        meshCode: dto.meshCode,
        cloudProvider: dto.cloudProvider ?? 'AWS_GCP_AZURE_HYBRID',
        sovereigntyRegion: dto.sovereigntyRegion ?? 'EU_GDPR_SOVEREIGN',
        activeNodesCount: dto.activeNodesCount ?? 64,
        healthScorePercent: dto.healthScorePercent ?? 99.99,
        meshStatus: dto.meshStatus ?? 'ONLINE_HEALTHY',
        lastSyncedAt: new Date(),
      },
    });
  }

  /**
   * List all global multi-cloud sovereign meshes.
   */
  async getMeshes() {
    return this.prisma.globalMultiCloudSovereignMeshBook1.findMany({
      orderBy: { lastSyncedAt: 'desc' },
    });
  }
}
