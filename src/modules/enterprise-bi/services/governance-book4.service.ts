import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpsertMdmRuleDto {
  entityType: string;
  ruleCode: string;
  goldenSourceCluster?: string;
  syncFrequency?: string;
  status?: string;
  validationPattern: string;
}

export interface RecordDrAuditDto {
  regionCluster: string;
  auditType?: string;
  rtoTargetSeconds: number;
  rtoAchievedSeconds: number;
  rpoTargetSeconds: number;
  rpoAchievedSeconds: number;
}

export interface EvaluateSlaDto {
  tenantOrRegionCode: string;
  serviceCategory: string;
  targetSlaPercentage?: number;
  achievedSlaPercentage: number;
  evaluatedMonth: string;
}

@Injectable()
export class GovernanceBook4Service {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // 1. MASTER DATA GOVERNANCE (MDM)
  // ----------------------------------------------------
  async upsertMdmRule(dto: UpsertMdmRuleDto) {
    return this.prisma.masterDataGovernanceRule.upsert({
      where: { ruleCode: dto.ruleCode },
      update: {
        entityType: dto.entityType,
        goldenSourceCluster: dto.goldenSourceCluster ?? 'PRIMARY-US-EAST',
        syncFrequency: dto.syncFrequency ?? 'REALTIME',
        status: dto.status ?? 'ACTIVE',
        validationPattern: dto.validationPattern,
      },
      create: {
        entityType: dto.entityType,
        ruleCode: dto.ruleCode,
        goldenSourceCluster: dto.goldenSourceCluster ?? 'PRIMARY-US-EAST',
        syncFrequency: dto.syncFrequency ?? 'REALTIME',
        status: dto.status ?? 'ACTIVE',
        validationPattern: dto.validationPattern,
      },
    });
  }

  async getMdmRules() {
    return this.prisma.masterDataGovernanceRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------------------------------------------------
  // 2. DISASTER RECOVERY (DR) & FAILOVER DRILLS
  // ----------------------------------------------------
  async recordDrAudit(dto: RecordDrAuditDto) {
    const drillResult =
      dto.rtoAchievedSeconds <= dto.rtoTargetSeconds &&
      dto.rpoAchievedSeconds <= dto.rpoTargetSeconds
        ? 'PASSED'
        : dto.rtoAchievedSeconds <= dto.rtoTargetSeconds * 1.2
          ? 'PASSED_WITH_WARNINGS'
          : 'FAILED';

    return this.prisma.disasterRecoveryAudit.create({
      data: {
        regionCluster: dto.regionCluster,
        auditType: dto.auditType ?? 'FAILOVER_DRILL',
        rtoTargetSeconds: dto.rtoTargetSeconds,
        rtoAchievedSeconds: dto.rtoAchievedSeconds,
        rpoTargetSeconds: dto.rpoTargetSeconds,
        rpoAchievedSeconds: dto.rpoAchievedSeconds,
        drillResult,
      },
    });
  }

  async getDrAudits() {
    return this.prisma.disasterRecoveryAudit.findMany({
      orderBy: { auditedAt: 'desc' },
    });
  }

  // ----------------------------------------------------
  // 3. GLOBAL SLA COMPLIANCE BENCHMARKING
  // ----------------------------------------------------
  async evaluateSlaBenchmark(dto: EvaluateSlaDto) {
    const target = dto.targetSlaPercentage ?? 98.0;
    const status =
      dto.achievedSlaPercentage >= target
        ? 'COMPLIANT'
        : dto.achievedSlaPercentage >= target - 3.0
          ? 'WARNING'
          : 'NON_COMPLIANT';

    return this.prisma.globalSLABenchmark.create({
      data: {
        tenantOrRegionCode: dto.tenantOrRegionCode,
        serviceCategory: dto.serviceCategory,
        targetSlaPercentage: target,
        achievedSlaPercentage: dto.achievedSlaPercentage,
        complianceStatus: status,
        evaluatedMonth: dto.evaluatedMonth,
      },
    });
  }

  async getSlaBenchmarks(month?: string) {
    return this.prisma.globalSLABenchmark.findMany({
      where: month ? { evaluatedMonth: month } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
