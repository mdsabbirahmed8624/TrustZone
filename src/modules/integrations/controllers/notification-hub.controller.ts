import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationHubService } from '../services/notification-hub.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('notification-hub')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationHubController {
  constructor(
    private readonly notificationHubService: NotificationHubService,
  ) {}

  @Post('templates')
  @Permissions('notifications:write')
  @HttpCode(HttpStatus.CREATED)
  async upsertTemplate(
    @Body()
    body: {
      code: string;
      name: string;
      channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP';
      bodyTemplate: string;
      subject?: string;
      placeholders?: string[];
    },
  ) {
    return this.notificationHubService.upsertTemplate(
      body.code,
      body.name,
      body.channel,
      body.bodyTemplate,
      body.subject,
      body.placeholders || [],
    );
  }

  @Post('send')
  @Permissions('notifications:write')
  @HttpCode(HttpStatus.OK)
  async sendNotification(
    @Body()
    body: {
      templateCode: string;
      recipient: string;
      variables?: Record<string, any>;
      environment?: 'SANDBOX' | 'PRODUCTION';
    },
  ) {
    return this.notificationHubService.sendNotification(
      body.templateCode,
      body.recipient,
      body.variables || {},
      body.environment || 'SANDBOX',
    );
  }

  @Get('stats')
  @Permissions('notifications:read')
  async getNotificationStats() {
    return this.notificationHubService.getNotificationStats();
  }
}
