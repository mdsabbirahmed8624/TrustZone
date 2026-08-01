import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AutomationService } from './automation.service';
import { SchedulerService } from './scheduler.service';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('automation')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AutomationController {
  constructor(
    private readonly automationService: AutomationService,
    private readonly schedulerService: SchedulerService,
    private readonly workflowService: WorkflowService,
  ) {}

  // ==========================================
  // Rules Management (CRUD)
  // ==========================================

  @Get('rules')
  @Permissions('read:automation')
  async getRules() {
    const data = await this.automationService.listRules();
    return { success: true, data };
  }

  @Get('rules/:id')
  @Permissions('read:automation')
  async getRule(@Param('id') id: string) {
    const data = await this.automationService.getRule(id);
    return { success: true, data };
  }

  @Post('rules')
  @Permissions('write:automation')
  async createRule(
    @Body()
    body: {
      name: string;
      description?: string;
      triggerEvent: string;
      conditions: any;
      actions: any;
      priority: string;
      enabled?: boolean;
    },
  ) {
    const data = await this.automationService.createRule(body);
    return { success: true, data };
  }

  @Put('rules/:id')
  @Permissions('write:automation')
  async updateRule(@Param('id') id: string, @Body() body: any) {
    const data = await this.automationService.updateRule(id, body);
    return { success: true, data };
  }

  @Delete('rules/:id')
  @Permissions('write:automation')
  async deleteRule(@Param('id') id: string) {
    const data = await this.automationService.deleteRule(id);
    return { success: true, data };
  }

  @Post('rules/:id/simulate')
  @HttpCode(HttpStatus.OK)
  @Permissions('read:automation')
  async simulateRule(@Param('id') id: string, @Body() contextObj: any) {
    const data = await this.automationService.simulateRule(id, contextObj);
    return { success: true, data };
  }

  // ==========================================
  // Execution logs & retries
  // ==========================================

  @Get('executions')
  @Permissions('read:automation')
  async getExecutions(@Query('ruleId') ruleId?: string) {
    const data = await this.automationService.getExecutions(ruleId);
    return { success: true, data };
  }

  @Get('executions/logs')
  @Permissions('read:automation')
  async getExecutionLogs(@Query('executionId') executionId?: string) {
    const data = await this.automationService.getLogs(executionId);
    return { success: true, data };
  }

  @Get('webhook-logs')
  @Permissions('read:automation')
  async getWebhookLogs(@Query('ruleId') ruleId?: string) {
    const data = await this.automationService.getWebhookLogs(ruleId);
    return { success: true, data };
  }

  @Post('executions/:id/retry')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:automation')
  async retryExecution(@Param('id') id: string) {
    const data = await this.automationService.retryExecution(id);
    return { success: true, data };
  }

  // ==========================================
  // Scheduler controls
  // ==========================================

  @Get('scheduler/jobs')
  @Permissions('read:scheduler')
  async getSchedulerJobs() {
    const data = await this.schedulerService.listSchedulerJobs();
    return { success: true, data };
  }

  @Get('scheduler/logs')
  @Permissions('read:scheduler')
  async getSchedulerLogs() {
    const data = await this.schedulerService.getSchedulerLogs();
    return { success: true, data };
  }

  @Post('scheduler/trigger')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:scheduler')
  async triggerSchedulerJobs() {
    await this.schedulerService.runScheduledScans();
    return {
      success: true,
      message: 'All scheduled scans triggered successfully.',
    };
  }

  // ==========================================
  // Workflow Engine execution
  // ==========================================

  @Post('workflows/expense/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:finance')
  async approveExpense(
    @Param('id') id: string,
    @Body('approved') approved: boolean,
    @Body('notes') notes: string,
    @CurrentUser() staff: any,
  ) {
    const data = await this.workflowService.processExpenseApproval(
      id,
      staff.id,
      approved,
      notes,
    );
    return { success: true, data };
  }

  @Post('workflows/po/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:suppliers')
  async approvePurchaseOrder(
    @Param('id') id: string,
    @Body('approved') approved: boolean,
  ) {
    const data = await this.workflowService.processPurchaseOrderApproval(
      id,
      approved,
    );
    return { success: true, data };
  }

  @Post('workflows/ticket/:id/escalate')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:repairs')
  async escalateTicket(@Param('id') id: string) {
    const data = await this.workflowService.escalateTicketSla(id);
    return { success: true, data };
  }

  @Post('workflows/ticket/:id/auto-assign')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:repairs')
  async autoAssignTicket(@Param('id') id: string) {
    const data = await this.workflowService.autoAssignTicket(id);
    return { success: true, data };
  }
}
