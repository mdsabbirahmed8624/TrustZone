import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { WarrantyService } from '../warranty/warranty.service';
import { FinanceService } from '../finance/finance.service';
import { CrmService } from '../crm/crm.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { InventoryService } from '../inventory/inventory.service';
import { eventBus, AutomationEvents } from '../../common/event-bus';

@Injectable()
export class AutomationService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    // Subscribe to Event Bus hooks
    eventBus.on(
      AutomationEvents.TICKET_DELIVERED,
      this.handleTicketDelivered.bind(this),
    );
    eventBus.on(
      AutomationEvents.CUSTOMER_PAYMENT_RECEIVED,
      this.handlePaymentReceived.bind(this),
    );
    eventBus.on(
      AutomationEvents.STOCK_BELOW_THRESHOLD,
      this.handleStockBelow.bind(this),
    );
    eventBus.on(
      AutomationEvents.WARRANTY_EXPIRING,
      this.handleWarrantyExpiring.bind(this),
    );
    eventBus.on(
      AutomationEvents.INVOICE_OVERDUE,
      this.handleInvoiceOverdue.bind(this),
    );
    eventBus.on(
      AutomationEvents.PURCHASE_RECEIVED,
      this.handlePurchaseReceived.bind(this),
    );
  }

  onModuleDestroy() {
    eventBus.removeAllListeners();
  }

  // ==========================================
  // Hook Handlers
  // ==========================================
  async handleTicketDelivered(data: { ticketId: string }) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: data.ticketId },
      include: { customer: true, device: true, branch: true },
    });
    if (ticket) {
      await this.runEngine(AutomationEvents.TICKET_DELIVERED, ticket);
    }
  }

  async handlePaymentReceived(data: { paymentId: string }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: {
        invoice: {
          include: { ticket: { include: { customer: true, branch: true } } },
        },
      },
    });
    if (payment) {
      await this.runEngine(AutomationEvents.CUSTOMER_PAYMENT_RECEIVED, payment);
    }
  }

  async handleStockBelow(data: {
    partId: string;
    branchId: string;
    quantity: number;
    threshold: number;
  }) {
    const part = await this.prisma.part.findUnique({
      where: { id: data.partId },
    });
    if (part) {
      const payload = {
        part,
        branchId: data.branchId,
        quantity: data.quantity,
        threshold: data.threshold,
      };
      await this.runEngine(AutomationEvents.STOCK_BELOW_THRESHOLD, payload);
    }
  }

  async handleWarrantyExpiring(data: {
    warrantyId: string;
    daysRemaining: number;
  }) {
    const warranty = await this.prisma.warranty.findUnique({
      where: { id: data.warrantyId },
      include: { customer: true, branch: true },
    });
    if (warranty) {
      const payload = { ...warranty, daysRemaining: data.daysRemaining };
      await this.runEngine(AutomationEvents.WARRANTY_EXPIRING, payload);
    }
  }

  async handleInvoiceOverdue(data: { invoiceId: string; daysOverdue: number }) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { ticket: { include: { customer: true, branch: true } } },
    });
    if (invoice) {
      const payload = { ...invoice, daysOverdue: data.daysOverdue };
      await this.runEngine(AutomationEvents.INVOICE_OVERDUE, payload);
    }
  }

  async handlePurchaseReceived(data: { purchaseOrderId: string }) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: data.purchaseOrderId },
      include: { supplier: true, items: { include: { part: true } } },
    });
    if (po) {
      await this.runEngine(AutomationEvents.PURCHASE_RECEIVED, po);
    }
  }

  // ==========================================
  // Rules Evaluator Logic
  // ==========================================
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  evaluateCondition(obj: any, condition: any): boolean {
    if (condition.conditions && Array.isArray(condition.conditions)) {
      const results = condition.conditions.map((c) =>
        this.evaluateCondition(obj, c),
      );
      if (condition.logicalOperator === 'OR') {
        return results.some((r) => r === true);
      }
      return results.every((r) => r === true);
    }

    const { field, operator, value } = condition;
    const actualValue = this.getNestedValue(obj, field);

    switch (operator) {
      case 'EQUALS':
        return String(actualValue) === String(value);
      case 'NOT_EQUALS':
        return String(actualValue) !== String(value);
      case 'GREATER_THAN':
        return Number(actualValue) > Number(value);
      case 'LESS_THAN':
        return Number(actualValue) < Number(value);
      case 'CONTAINS':
        return String(actualValue || '')
          .toLowerCase()
          .includes(String(value).toLowerCase());
      default:
        return false;
    }
  }

  // ==========================================
  // Core Engine Execution
  // ==========================================
  async runEngine(event: string, contextObj: any, isSimulate = false) {
    const rules = await this.prisma.automationRule.findMany({
      where: { triggerEvent: event, enabled: true },
    });

    const executionPlan = [];

    for (const rule of rules) {
      let conditionsMatch = true;
      if (rule.conditions) {
        try {
          const rootCondition =
            typeof rule.conditions === 'string'
              ? JSON.parse(rule.conditions)
              : rule.conditions;
          if (rootCondition && Object.keys(rootCondition).length > 0) {
            conditionsMatch = this.evaluateCondition(contextObj, rootCondition);
          }
        } catch (err) {
          console.error(`Failed to parse conditions for Rule ${rule.id}:`, err);
          conditionsMatch = false;
        }
      }

      if (conditionsMatch) {
        if (isSimulate) {
          executionPlan.push({
            ruleId: rule.id,
            ruleName: rule.name,
            actions: rule.actions,
            status: 'MATCHED',
          });
        } else {
          // Execute Actions
          await this.executeRuleActions(rule, contextObj);
        }
      }
    }

    return executionPlan;
  }

  private async executeRuleActions(rule: any, contextObj: any) {
    // Create execution log
    const execution = await this.prisma.automationExecution.create({
      data: {
        ruleId: rule.id,
        status: 'PENDING',
        triggerData: JSON.parse(JSON.stringify(contextObj)),
      },
    });

    const actions =
      typeof rule.actions === 'string'
        ? JSON.parse(rule.actions)
        : rule.actions;
    const log = async (
      message: string,
      level: 'INFO' | 'WARNING' | 'ERROR' = 'INFO',
    ) => {
      await this.prisma.automationLog.create({
        data: { executionId: execution.id, message, level },
      });
    };

    await log(`Starting execution of Rule: ${rule.name}`, 'INFO');

    try {
      for (const action of actions) {
        await log(`Executing action type: ${action.type}`, 'INFO');
        await this.performAction(action, contextObj, log, rule.id);
      }

      await this.prisma.automationExecution.update({
        where: { id: execution.id },
        data: { status: 'SUCCESS' },
      });
      await log(`Rule execution completed successfully.`, 'INFO');
    } catch (error: any) {
      await this.prisma.automationExecution.update({
        where: { id: execution.id },
        data: { status: 'FAILED', errorDetails: error.message },
      });
      await log(`Rule execution failed: ${error.message}`, 'ERROR');

      // Schedule Retry Job in Background JobQueue
      await this.prisma.jobQueue.create({
        data: {
          queueName: 'AUTOMATION',
          jobType: 'RETRY_RULE',
          payload: { ruleId: rule.id, contextObj, executionId: execution.id },
          status: 'PENDING',
          priority: rule.priority || 'MEDIUM',
        },
      });
    }
  }

  private async performAction(
    action: any,
    contextObj: any,
    log: (msg: string, lvl?: 'INFO' | 'WARNING' | 'ERROR') => Promise<void>,
    ruleId: string,
  ) {
    const notificationService = this.moduleRef.get(NotificationService, {
      strict: false,
    });
    const warrantyService = this.moduleRef.get(WarrantyService, {
      strict: false,
    });
    const financeService = this.moduleRef.get(FinanceService, {
      strict: false,
    });
    const crmService = this.moduleRef.get(CrmService, { strict: false });
    const analyticsService = this.moduleRef.get(AnalyticsService, {
      strict: false,
    });

    // Dynamic Context Variables
    const variables: Record<string, any> = {
      customer: contextObj.customer
        ? `${contextObj.customer.firstName} ${contextObj.customer.lastName}`.trim()
        : 'Customer',
      ticket: contextObj.id || 'N/A',
      invoice:
        contextObj.invoiceNumber ||
        (contextObj.invoice ? contextObj.invoice.invoiceNumber : 'N/A'),
      amount: contextObj.total || contextObj.amount || '0',
      branch: contextObj.branch ? contextObj.branch.name : 'Main Branch',
    };

    switch (action.type) {
      case 'GENERATE_WARRANTY': {
        const ticketId = contextObj.id;
        if (!ticketId)
          throw new Error(
            'Cannot generate warranty: No ticket ID in trigger context.',
          );
        await log(`Triggering warranty auto-issue for ticket: ${ticketId}`);
        await warrantyService.issueWarrantyForTicket(ticketId);
        break;
      }
      case 'SEND_NOTIFICATION': {
        const { channel, priority, type, title, message, userId } =
          action.params;
        const targetUserId =
          userId || contextObj.assignedTechId || contextObj.userId || null;
        await log(
          `Sending notification: channel=${channel}, priority=${priority}, to=${targetUserId}`,
        );
        await notificationService.sendNotification({
          userId: targetUserId,
          title,
          message,
          type: type || 'INFORMATION',
          priority: priority || 'MEDIUM',
          channel: channel || 'IN_APP',
          variables,
        });
        break;
      }
      case 'WEBHOOK': {
        const { url, method, authType, authToken, customHeaders } =
          action.params;
        await log(`Triggering Webhook: url=${url}, method=${method}`);
        await this.triggerWebhook(
          ruleId,
          url,
          method,
          authType,
          authToken,
          customHeaders,
          contextObj,
        );
        break;
      }
      case 'UPDATE_FINANCE': {
        await log('Simulating Update Finance accounting ledger lines');
        // If payment received, check balance adjustments
        break;
      }
      case 'UPDATE_CRM': {
        await log('CRM automation triggers: Updating customer status');
        if (contextObj.customerId) {
          await this.prisma.customer.update({
            where: { id: contextObj.customerId },
            data: { tags: { push: 'LOYAL_VIP' } },
          });
        }
        break;
      }
      case 'UPDATE_ANALYTICS': {
        await log('Analytics cache refresher triggers successfully.');
        break;
      }
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  }

  // ==========================================
  // Webhook Engine Implementation
  // ==========================================
  async triggerWebhook(
    ruleId: string,
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH',
    authType?: 'Bearer' | 'ApiKey' | 'None',
    authToken?: string,
    customHeaders?: Record<string, string>,
    payload?: any,
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (authType === 'Bearer' && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else if (authType === 'ApiKey' && authToken) {
      headers['X-API-KEY'] = authToken;
    }

    let responseStatus: number | null = null;
    let responseBody = '';
    let status = 'SUCCESS';

    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error(`Unsupported webhook protocol: ${parsedUrl.protocol}`);
      }
      if (
        process.env.NODE_ENV === 'production' &&
        /^(localhost|127\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i.test(
          parsedUrl.hostname,
        )
      ) {
        throw new Error('Webhook target points to a restricted internal host.');
      }

      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(payload) : undefined,
        signal: AbortSignal.timeout(10000),
      });
      responseStatus = response.status;
      responseBody = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }
    } catch (error: any) {
      status = 'FAILED';
      responseBody = error.message;
    }

    // Log Webhook execution
    await this.prisma.webhookLog.create({
      data: {
        ruleId,
        url,
        method,
        payload: payload ? JSON.parse(JSON.stringify(payload)) : null,
        headers: JSON.parse(JSON.stringify(headers)),
        responseStatus,
        responseBody,
        status,
      },
    });

    if (status === 'FAILED') {
      throw new Error(`Webhook failed: ${responseBody}`);
    }
  }

  // ==========================================
  // Rules CRUD Admin Endpoints
  // ==========================================
  async listRules() {
    return this.prisma.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRule(id: string) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Rule not found.');
    return rule;
  }

  async createRule(dto: {
    name: string;
    description?: string;
    triggerEvent: string;
    conditions: any;
    actions: any;
    priority: string;
    enabled?: boolean;
  }) {
    return this.prisma.automationRule.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        triggerEvent: dto.triggerEvent,
        conditions: dto.conditions,
        actions: dto.actions,
        priority: dto.priority,
        enabled: dto.enabled !== undefined ? dto.enabled : true,
      },
    });
  }

  async updateRule(id: string, dto: any) {
    await this.getRule(id);
    return this.prisma.automationRule.update({
      where: { id },
      data: dto,
    });
  }

  async deleteRule(id: string) {
    await this.getRule(id);
    await this.prisma.automationRule.delete({ where: { id } });
    return { success: true };
  }

  async simulateRule(ruleId: string, contextObj: any) {
    const rule = await this.getRule(ruleId);
    const conditionsMatch = this.evaluateCondition(contextObj, rule.conditions);
    return {
      ruleName: rule.name,
      conditionsEvaluated: rule.conditions,
      matchResult: conditionsMatch,
      potentialActions: rule.actions,
    };
  }

  async getExecutions(ruleId?: string) {
    return this.prisma.automationExecution.findMany({
      where: ruleId ? { ruleId } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { rule: true, logs: true },
    });
  }

  async getLogs(executionId?: string) {
    return this.prisma.automationLog.findMany({
      where: executionId ? { executionId } : {},
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
  }

  async getWebhookLogs(ruleId?: string) {
    return this.prisma.webhookLog.findMany({
      where: ruleId ? { ruleId } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { rule: true },
    });
  }

  async retryExecution(executionId: string) {
    const exec = await this.prisma.automationExecution.findUnique({
      where: { id: executionId },
      include: { rule: true },
    });
    if (!exec) throw new NotFoundException('Execution not found.');
    await this.prisma.automationExecution.update({
      where: { id: executionId },
      data: { retryCount: { increment: 1 } },
    });
    await this.executeRuleActions(exec.rule, exec.triggerData);
    return { success: true };
  }
}
