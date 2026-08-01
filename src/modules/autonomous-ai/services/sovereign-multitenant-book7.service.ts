import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterTenantSegmentDto {
  tenantSegmentCode: string;
  tenantEnclaveIsolationScore?: number;
  tenantCrossNoiseLeakagePercent?: number;
  tenantActiveCount?: number;
  segmentStatus?: string;
}

@Injectable()
export class SovereignMultiTenantMicrosegmentationBook7Service {
  private readonly logger = new Logger(
    SovereignMultiTenantMicrosegmentationBook7Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or enforce sovereign multi-tenant microsegmentation enclave.
   */
  async registerTenantSegment(dto: RegisterTenantSegmentDto) {
    this.logger.log(
      `Registering sovereign multi-tenant microsegmentation: ${dto.tenantSegmentCode}`,
    );

    return this.prisma.sovereignMultiTenantMicrosegmentationBook7.upsert({
      where: { tenantSegmentCode: dto.tenantSegmentCode },
      update: {
        tenantEnclaveIsolationScore: dto.tenantEnclaveIsolationScore ?? 100.0,
        tenantCrossNoiseLeakagePercent:
          dto.tenantCrossNoiseLeakagePercent ?? 0.0,
        tenantActiveCount: dto.tenantActiveCount ?? 256,
        segmentStatus: dto.segmentStatus ?? 'TENANT_ISOLATED_STRICT',
        lastIsolatedAt: new Date(),
      },
      create: {
        tenantSegmentCode: dto.tenantSegmentCode,
        tenantEnclaveIsolationScore: dto.tenantEnclaveIsolationScore ?? 100.0,
        tenantCrossNoiseLeakagePercent:
          dto.tenantCrossNoiseLeakagePercent ?? 0.0,
        tenantActiveCount: dto.tenantActiveCount ?? 256,
        segmentStatus: dto.segmentStatus ?? 'TENANT_ISOLATED_STRICT',
        lastIsolatedAt: new Date(),
      },
    });
  }

  /**
   * List all sovereign multi-tenant microsegmentations.
   */
  async getTenantSegments() {
    return this.prisma.sovereignMultiTenantMicrosegmentationBook7.findMany({
      orderBy: { lastIsolatedAt: 'desc' },
    });
  }
}
