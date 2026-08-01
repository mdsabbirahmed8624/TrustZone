import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates or updates a Business Rule definition
   */
  async createRule(
    name: string,
    triggerEvent: string,
    conditionGroup: any,
    actions: any[],
    priority = 10,
    description?: string,
  ) {
    const rule = await this.prisma.businessRule.create({
      data: {
        name,
        description: description || null,
        triggerEvent,
        conditionGroup: conditionGroup || { operator: 'AND', conditions: [] },
        actions: actions || [],
        priority,
        enabled: true,
      },
    });

    this.logger.log(
      `Created Business Rule '${rule.name}' for event '${triggerEvent}'`,
    );
    return rule;
  }

  /**
   * Evaluates business rules against event payload
   */
  async evaluateEventRules(triggerEvent: string, payload: Record<string, any>) {
    const rules = await this.prisma.businessRule.findMany({
      where: {
        triggerEvent,
        enabled: true,
        isDeleted: false,
      },
      orderBy: { priority: 'asc' },
    });

    const matchingRules = [];
    for (const rule of rules) {
      // Evaluate condition group (AND / OR)
      const matches = this.evaluateConditionGroup(rule.conditionGroup, payload);
      if (matches) {
        matchingRules.push(rule);
      }
    }

    this.logger.log(
      `Evaluated ${rules.length} rules for '${triggerEvent}': ${matchingRules.length} matched`,
    );

    return {
      triggerEvent,
      totalRulesEvaluated: rules.length,
      matchingRulesCount: matchingRules.length,
      matchingRules,
    };
  }

  /**
   * Evaluates condition tree
   */
  private evaluateConditionGroup(
    conditionGroup: any,
    payload: Record<string, any>,
  ): boolean {
    if (
      !conditionGroup ||
      !conditionGroup.conditions ||
      conditionGroup.conditions.length === 0
    ) {
      return true;
    }

    const operator = conditionGroup.operator || 'AND';
    const results = conditionGroup.conditions.map((cond: any) => {
      const val = payload[cond.field];
      if (cond.operator === 'EQUALS') return val === cond.value;
      if (cond.operator === 'GREATER_THAN')
        return Number(val) > Number(cond.value);
      if (cond.operator === 'CONTAINS')
        return String(val).includes(String(cond.value));
      return true;
    });

    return operator === 'AND'
      ? results.every((r: boolean) => r)
      : results.some((r: boolean) => r);
  }
}
