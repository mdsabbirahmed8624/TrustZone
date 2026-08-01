import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UseFilters,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from '../../../notification/notification.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { MonitoringDashboardService } from '../../services/monitoring-dashboard.service';
import { NotificationSchedulerService } from '../../services/notification-scheduler.service';
import { AiNotificationGeneratorService } from '../../services/ai-generator.service';
import { OtelService } from '../../services/otel.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';
import { IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationChannel } from '@prisma/client';

export class UpdatePreferencesDto {
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  inAppEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  whatsappEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  dndEnabled?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mutedCategories?: string[];

  @IsString()
  @IsOptional()
  workingHoursStart?: string;

  @IsString()
  @IsOptional()
  workingHoursEnd?: string;

  @IsBoolean()
  @IsOptional()
  allowSilentMode?: boolean;

  @IsBoolean()
  @IsOptional()
  emergencyOverride?: boolean;

  @IsArray()
  @IsOptional()
  preferredChannels?: NotificationChannel[];
}

@ApiTags('Mobile API')
@ApiBearerAuth()
@Controller('mobile/notifications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileNotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
    private readonly dashboard: MonitoringDashboardService,
    private readonly scheduler: NotificationSchedulerService,
    private readonly aiGenerator: AiNotificationGeneratorService,
    private readonly otel: OtelService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List in-app notifications with pagination support',
  })
  @ApiResponse({ status: 200, description: 'Notifications list' })
  async list(
    @CurrentUser('id') userId: string,
    @Query('read') read?: boolean,
    @Query('archived') archived?: boolean,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    // Build filter query
    const where: any = { recipientId: userId };
    if (read !== undefined) {
      where.isRead = read;
    }
    if (archived !== undefined) {
      where.isArchived = archived;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      message: 'Notifications retrieved successfully.',
      data: {
        notifications,
        pagination: {
          page: p,
          limit: l,
          total,
          totalPages: Math.ceil(total / l),
        },
      },
    };
  }

  @Patch(':id/read')
  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark single notification as read' })
  @ApiResponse({ status: 200, description: 'Notification updated' })
  async markRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      throw new BadRequestException('Notification not found.');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date(),
        isRead: true,
      },
    });

    // Update analytics
    await this.prisma.notificationAnalytics.updateMany({
      where: { notificationId: id },
      data: { read: true },
    });

    return {
      message: 'Notification marked as read.',
      data: updated,
    };
  }

  @Patch('all/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications updated' })
  async markAllRead(@CurrentUser('id') userId: string) {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: {
        status: 'READ',
        readAt: new Date(),
        isRead: true,
      },
    });

    return {
      message: 'All notifications marked as read.',
    };
  }

  @Put(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive single notification' })
  async archive(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      throw new BadRequestException('Notification not found.');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        isArchived: true,
      },
    });

    return {
      message: 'Notification archived successfully.',
      data: updated,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      throw new BadRequestException('Notification not found.');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return {
      message: 'Notification deleted successfully.',
    };
  }

  @Get('preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notification channels preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences details' })
  async getPreferences(@CurrentUser('id') userId: string) {
    let prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await this.prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return {
      message: 'Preferences retrieved successfully.',
      data: prefs,
    };
  }

  @Put('preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated' })
  async updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    const prefs = await this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        mutedCategories: dto.mutedCategories,
        workingHoursStart: dto.workingHoursStart || null,
        workingHoursEnd: dto.workingHoursEnd || null,
        allowSilentMode:
          dto.allowSilentMode !== undefined ? dto.allowSilentMode : false,
        emergencyOverride:
          dto.emergencyOverride !== undefined ? dto.emergencyOverride : true,
        preferredChannels: dto.preferredChannels,
      },
      create: {
        userId,
        mutedCategories: dto.mutedCategories,
        workingHoursStart: dto.workingHoursStart || null,
        workingHoursEnd: dto.workingHoursEnd || null,
        allowSilentMode:
          dto.allowSilentMode !== undefined ? dto.allowSilentMode : false,
        emergencyOverride:
          dto.emergencyOverride !== undefined ? dto.emergencyOverride : true,
        preferredChannels: dto.preferredChannels || [
          NotificationChannel.WEBSOCKET,
          NotificationChannel.PUSH,
        ],
      },
    });

    return {
      message: 'Preferences updated successfully.',
      data: prefs,
    };
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get live notification delivery metrics and SLAs' })
  async getMetrics() {
    const liveMetrics = await this.dashboard.getLiveDeliveryMetrics();
    const slaMetrics = await this.dashboard.getSLAMetrics();
    return {
      message: 'Metrics aggregated successfully.',
      data: {
        liveMetrics,
        slaMetrics,
      },
    };
  }

  @Get('queue-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get live queue and worker health status' })
  async getQueueStatus() {
    const status = await this.dashboard.getQueueAndWorkerStatus();
    return {
      message: 'Queue statuses retrieved.',
      data: status,
    };
  }

  @Post('schedule')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule a notification' })
  async schedule(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      templateCode: string;
      variables: any;
      expression: string;
      timezone?: string;
    },
  ) {
    const job = await this.scheduler.scheduleNotification(
      userId,
      body.templateCode,
      body.variables,
      body.expression,
      body.timezone || 'UTC',
    );
    return {
      message: 'Notification scheduled successfully.',
      data: job,
    };
  }

  @Post('ai-generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Use AI template foundation to draft a notification',
  })
  async aiGenerate(@Body() body: { prompt: string; context?: any }) {
    const draft = await this.aiGenerator.generateNotificationDraft(
      body.prompt,
      body.context,
    );
    return {
      message: 'AI notification draft generated.',
      data: draft,
    };
  }

  @Get('metrics/prometheus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get metrics in Prometheus format' })
  async getPrometheus() {
    const prom = await this.otel.getPrometheusFormat();
    return prom;
  }
}
