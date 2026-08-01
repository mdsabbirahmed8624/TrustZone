import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEthicsDto {
  policyCode: string;
  policyTitle: string;
  complianceScorePercent: number;
}

@Injectable()
export class AutonomousAIBook10Service {
  constructor(private readonly prisma: PrismaService) {}

  async auditEthicsPolicy(dto: AuditEthicsDto) {
    const auditStatus =
      dto.complianceScorePercent >= 90.0
        ? 'COMPLIANT'
        : dto.complianceScorePercent >= 75.0
          ? 'REVIEW_REQUIRED'
          : 'NON_COMPLIANT';

    return this.prisma.aIGovernanceEthicsAudit.create({
      data: {
        policyCode: dto.policyCode,
        policyTitle: dto.policyTitle,
        complianceScorePercent: dto.complianceScorePercent,
        auditStatus,
      },
    });
  }

  async getEthicsAudits() {
    return this.prisma.aIGovernanceEthicsAudit.findMany({
      orderBy: { evaluatedAt: 'desc' },
    });
  }
}
