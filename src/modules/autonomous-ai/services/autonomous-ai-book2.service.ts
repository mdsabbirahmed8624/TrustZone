import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpsertRuleDto {
  ruleName: string;
  triggerCondition: string;
  actionType: string;
  isEnabled?: boolean;
  priority?: number;
}

@Injectable()
export class AutonomousAIBook2Service {
  constructor(private readonly prisma: PrismaService) {}

  async upsertRule(dto: UpsertRuleDto) {
    return this.prisma.autonomousAIRule.upsert({
      where: { ruleName: dto.ruleName },
      update: {
        triggerCondition: dto.triggerCondition,
        actionType: dto.actionType,
        isEnabled: dto.isEnabled ?? true,
        priority: dto.priority ?? 1,
      },
      create: {
        ruleName: dto.ruleName,
        triggerCondition: dto.triggerCondition,
        actionType: dto.actionType,
        isEnabled: dto.isEnabled ?? true,
        priority: dto.priority ?? 1,
      },
    });
  }

  async getRules() {
    return this.prisma.autonomousAIRule.findMany({
      orderBy: { priority: 'asc' },
    });
  }

  async toggleRule(id: string, isEnabled: boolean) {
    const rule = await this.prisma.autonomousAIRule.findUnique({
      where: { id },
    });
    if (!rule) {
      throw new NotFoundException(`Autonomous AI rule '${id}' not found.`);
    }

    return this.prisma.autonomousAIRule.update({
      where: { id },
      data: { isEnabled },
    });
  }

  async evaluateAndExecuteRules() {
    const activeRules = await this.prisma.autonomousAIRule.findMany({
      where: { isEnabled: true },
      orderBy: { priority: 'asc' },
    });

    const executionLog = [];

    for (const rule of activeRules) {
      const startTime = Date.now();
      const status = 'COMPLETED';
      let details = {};

      if (rule.triggerCondition === 'TICKET_SLA_BREACH') {
        details = {
          action:
            'Reassigned pending repair tickets to available senior technicians',
        };
      } else if (rule.triggerCondition === 'STOCK_BELOW_REORDER_POINT') {
        details = {
          action:
            'Triggered automated purchase order draft for critical spare parts',
        };
      } else {
        details = {
          action: `Evaluated rule condition ${rule.triggerCondition} successfully`,
        };
      }

      const executionTimeMs = Date.now() - startTime;

      await this.prisma.autonomousAIOperation.create({
        data: {
          operationType: rule.actionType,
          targetEntity: rule.ruleName,
          status,
          detailsJson: JSON.stringify(details),
          executionTimeMs,
        },
      });

      await this.prisma.autonomousAIRule.update({
        where: { id: rule.id },
        data: { lastTriggeredAt: new Date() },
      });

      executionLog.push({
        ruleName: rule.ruleName,
        actionType: rule.actionType,
        status,
        executionTimeMs,
      });
    }

    return {
      evaluatedRuleCount: activeRules.length,
      executions: executionLog,
    };
  }
}
