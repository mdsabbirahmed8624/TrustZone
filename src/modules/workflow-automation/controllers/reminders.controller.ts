import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ReminderService } from '../services/reminder.service';
import { EscalationService } from '../services/escalation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('reminders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemindersController {
  constructor(
    private readonly reminderService: ReminderService,
    private readonly escalationService: EscalationService,
  ) {}

  @Post('schedule')
  @Permissions('reminders:write')
  @HttpCode(HttpStatus.CREATED)
  async scheduleReminder(
    @Body()
    body: {
      recipient: string;
      channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
      message: string;
      sendAt: string;
      subject?: string;
    },
    @Request() req: any,
  ) {
    return this.reminderService.scheduleReminder(
      body.recipient,
      body.channel,
      body.message,
      new Date(body.sendAt),
      body.subject,
      req.user?.id,
    );
  }

  @Post('process-due')
  @Permissions('reminders:write')
  @HttpCode(HttpStatus.OK)
  async processDueReminders() {
    return this.reminderService.processDueReminders();
  }

  @Post('escalations/create')
  @Permissions('reminders:write')
  @HttpCode(HttpStatus.CREATED)
  async createEscalationRule(
    @Body()
    body: {
      name: string;
      module: string;
      thresholdHours: number;
      escalateToRole: string;
      action?: 'NOTIFY' | 'REASSIGN' | 'AUTO_APPROVE';
    },
  ) {
    return this.escalationService.createRule(
      body.name,
      body.module,
      body.thresholdHours,
      body.escalateToRole,
      body.action || 'NOTIFY',
    );
  }

  @Post('escalations/evaluate')
  @Permissions('reminders:write')
  @HttpCode(HttpStatus.OK)
  async evaluateSlaBreaches() {
    return this.escalationService.evaluateSlaBreaches();
  }
}
