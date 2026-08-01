import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEthicsComplianceDto {
  policyCode: string;
  policyTitle: string;
  complianceScorePercent: number;
  auditedByRole?: string;
}

@Injectable()
export class AiGovernanceEthicsBook10Service {
  private readonly logger = new Logger(AiGovernanceEthicsBook10Service.name);

  constructor(private readonly prisma: PrismaService) {}

  async auditEthicsPolicy(dto: AuditEthicsComplianceDto) {
    this.logger.log(`Auditing AI governance ethics policy: ${dto.policyCode}`);

    const auditStatus =
      dto.complianceScorePercent >= 90.0
        ? 'COMPLIANT'
        : dto.complianceScorePercent >= 75.0
          ? 'REVIEW_REQUIRED'
          : 'NON_COMPLIANT';

    return this.prisma.aiGovernanceEthicsComplianceBook10.upsert({
      where: { policyCode: dto.policyCode },
      update: {
        policyTitle: dto.policyTitle,
        complianceScorePercent: dto.complianceScorePercent,
        auditStatus,
        auditedByRole: dto.auditedByRole ?? 'CHIEF_AI_ETHICS_OFFICER',
        evaluatedAt: new Date(),
      },
      create: {
        policyCode: dto.policyCode,
        policyTitle: dto.policyTitle,
        complianceScorePercent: dto.complianceScorePercent,
        auditStatus,
        auditedByRole: dto.auditedByRole ?? 'CHIEF_AI_ETHICS_OFFICER',
        evaluatedAt: new Date(),
      },
    });
  }

  async getEthicsAudits() {
    return this.prisma.aiGovernanceEthicsComplianceBook10.findMany({
      orderBy: { evaluatedAt: 'desc' },
    });
  }
}
