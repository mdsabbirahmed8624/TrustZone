import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AutomationEngineService {
  private readonly logger = new Logger(AutomationEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async triggerRuleEvaluation(event: string, payload: any) {
    this.logger.log(
      `Evaluating automation engine rules for trigger event "${event}"`,
    );

    // Fetch enabled rules matching this event
    const rules = await this.prisma.automationRule.findMany({
      where: {
        triggerEvent: event,
        enabled: true,
      },
    });

    const executionResults = await Promise.all(
      rules.map(async (rule) => {
        // Simple condition matching evaluation
        let passed = true;

        // Try evaluating simple condition fields if present
        const conditions = rule.conditions as any[];
        if (Array.isArray(conditions)) {
          conditions.forEach((cond) => {
            const val = payload[cond.field];
            if (
              val !== undefined &&
              cond.operator === 'EQUALS' &&
              val !== cond.value
            ) {
              passed = false;
            }
          });
        }

        let status = 'PENDING';
        let errorDetails = null;

        if (passed) {
          try {
            this.logger.log(`Executing automation rule "${rule.name}"...`);
            // Run action stubs (e.g. notifications trigger)
            status = 'SUCCESS';
          } catch (err: any) {
            status = 'FAILED';
            errorDetails = err.message;
            this.logger.error(
              `Failed to execute automation rule "${rule.name}": ${err.message}`,
            );
          }

          // Record execution
          await this.prisma.automationExecution.create({
            data: {
              ruleId: rule.id,
              status,
              triggerData: payload,
              errorDetails,
            },
          });
        }

        return {
          ruleId: rule.id,
          ruleName: rule.name,
          evaluated: passed,
          status,
        };
      }),
    );

    return {
      event,
      rulesEvaluated: rules.length,
      executions: executionResults,
    };
  }
}
