import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RuleEngineService } from './rule-engine.service';
import { BackgroundJobService } from './background-job.service';

@Injectable()
export class EventAutomationService {
  private readonly logger = new Logger(EventAutomationService.name);

  // Core supported domain event catalog
  public readonly supportedEvents = [
    'CUSTOMER_CREATED',
    'ORDER_CREATED',
    'INVOICE_PAID',
    'INVENTORY_LOW',
    'PAYMENT_FAILED',
    'USER_LOGIN',
    'USER_REGISTRATION',
    'TICKET_CREATED',
    'TICKET_CLOSED',
    'CUSTOM_EVENT',
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleEngine: RuleEngineService,
    private readonly jobService: BackgroundJobService,
  ) {}

  /**
   * Emits a domain event into the automation platform
   */
  async emitEvent(event: string, payload: Record<string, any>) {
    this.logger.log(
      `Received Domain Event '${event}' with payload: ${JSON.stringify(payload)}`,
    );

    // Evaluate matching business rules
    const rulesResult = await this.ruleEngine.evaluateEventRules(
      event,
      payload,
    );

    // Auto-enqueue a background job for downstream event handlers
    const job = await this.jobService.enqueueJob(
      `EVENT_HANDLER_${event}`,
      { event, payload, rulesTriggered: rulesResult.matchingRulesCount },
      'DEFAULT',
      'HIGH',
    );

    return {
      event,
      payload,
      rulesProcessed: rulesResult.matchingRulesCount,
      automationJobId: job.id,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Lists all supported event triggers
   */
  getSupportedEvents() {
    return {
      supportedEvents: this.supportedEvents,
      totalSupported: this.supportedEvents.length,
    };
  }
}
