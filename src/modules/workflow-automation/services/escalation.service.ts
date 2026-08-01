import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates an SLA Escalation Rule
   */
  async createRule(
    name: string,
    module: string,
    thresholdHours: number,
    escalateToRole: string,
    action: 'NOTIFY' | 'REASSIGN' | 'AUTO_APPROVE' = 'NOTIFY',
  ) {
    const rule = await this.prisma.escalationRule.create({
      data: {
        name,
        module,
        thresholdHours,
        escalateToRole,
        action,
        enabled: true,
      },
    });

    this.logger.log(
      `Created Escalation Rule '${rule.name}' for module '${module}'`,
    );
    return rule;
  }

  /**
   * Scans and evaluates SLA breach escalations for pending approvals and tickets
   */
  async evaluateSlaBreaches() {
    const expiredApprovals = await this.prisma.approvalRequest.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { lte: new Date() },
      },
    });

    const escalated = [];
    for (const req of expiredApprovals) {
      const updated = await this.prisma.approvalRequest.update({
        where: { id: req.id },
        data: { status: 'ESCALATED' },
      });

      await this.prisma.approvalHistory.create({
        data: {
          requestId: req.id,
          action: 'ESCALATED',
          comments: 'Automated SLA timeout breach escalation triggered',
        },
      });

      escalated.push(updated);
    }

    this.logger.log(
      `Evaluated SLA breaches: Escalated ${escalated.length} request(s)`,
    );
    return {
      expiredApprovalsCount: expiredApprovals.length,
      escalatedCount: escalated.length,
      escalated,
    };
  }
}
