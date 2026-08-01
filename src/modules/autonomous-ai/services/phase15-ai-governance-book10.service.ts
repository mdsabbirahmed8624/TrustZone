import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterPhase15AIGovernanceDto {
  governanceRecordCode: string;
  aiSafetyPolicyAlignmentPercent?: number;
  modelDriftRiskIndex?: number;
  auditedModelsCount?: number;
  governanceStatus?: string;
}

@Injectable()
export class Phase15AIGovernanceEthicsComplianceBook10Service {
  private readonly logger = new Logger(
    Phase15AIGovernanceEthicsComplianceBook10Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or certify Phase 15 AI Governance Ethics Compliance record.
   */
  async registerGovernanceRecord(dto: RegisterPhase15AIGovernanceDto) {
    this.logger.log(
      `Registering Phase 15 AI Governance Ethics record: ${dto.governanceRecordCode}`,
    );

    return this.prisma.phase15AIGovernanceEthicsComplianceBook10.upsert({
      where: { governanceRecordCode: dto.governanceRecordCode },
      update: {
        aiSafetyPolicyAlignmentPercent:
          dto.aiSafetyPolicyAlignmentPercent ?? 100.0,
        modelDriftRiskIndex: dto.modelDriftRiskIndex ?? 0.0,
        auditedModelsCount: dto.auditedModelsCount ?? 128,
        governanceStatus: dto.governanceStatus ?? 'ETHICS_COMPLIANT_CERTIFIED',
        lastAuditedAt: new Date(),
      },
      create: {
        governanceRecordCode: dto.governanceRecordCode,
        aiSafetyPolicyAlignmentPercent:
          dto.aiSafetyPolicyAlignmentPercent ?? 100.0,
        modelDriftRiskIndex: dto.modelDriftRiskIndex ?? 0.0,
        auditedModelsCount: dto.auditedModelsCount ?? 128,
        governanceStatus: dto.governanceStatus ?? 'ETHICS_COMPLIANT_CERTIFIED',
        lastAuditedAt: new Date(),
      },
    });
  }

  /**
   * List all Phase 15 AI Governance Ethics Compliance records.
   */
  async getGovernanceRecords() {
    return this.prisma.phase15AIGovernanceEthicsComplianceBook10.findMany({
      orderBy: { lastAuditedAt: 'desc' },
    });
  }
}
