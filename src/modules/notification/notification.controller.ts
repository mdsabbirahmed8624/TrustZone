import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ==========================================
  // In-App Notifications Management
  // ==========================================

  @Get()
  @Permissions('read:support')
  async getNotifications(
    @CurrentUser() user: any,
    @Query('read') read?: string,
    @Query('archived') archived?: string,
    @Query('search') search?: string,
  ) {
    const isRead =
      read === 'true' ? true : read === 'false' ? false : undefined;
    const isArchived =
      archived === 'true' ? true : archived === 'false' ? false : undefined;
    const data = await this.notificationService.listUserNotifications(user.id, {
      read: isRead,
      archived: isArchived,
      search,
    });
    return { success: true, data };
  }

  @Get('unread-count')
  @Permissions('read:support')
  async getUnreadCount(@CurrentUser() user: any) {
    const data = await this.notificationService.getUnreadCount(user.id);
    return { success: true, data };
  }

  @Patch(':id/read')
  @Permissions('write:support')
  async markRead(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.notificationService.markRead(id, user.id);
    return { success: true, data };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:support')
  async markAllRead(@CurrentUser() user: any) {
    const data = await this.notificationService.markAllRead(user.id);
    return { success: true, data };
  }

  @Patch(':id/archive')
  @Permissions('write:support')
  async archiveNotification(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.notificationService.archiveNotification(
      id,
      user.id,
    );
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('write:support')
  async deleteNotification(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.notificationService.deleteNotification(id, user.id);
    return { success: true, data };
  }

  // ==========================================
  // User Preferences
  // ==========================================

  @Get('preferences')
  @Permissions('read:support')
  async getPreferences(@CurrentUser() user: any) {
    const data = await this.notificationService.getPreferences(user.id);
    return { success: true, data };
  }

  @Put('preferences')
  @Permissions('write:support')
  async updatePreferences(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.notificationService.updatePreferences(
      user.id,
      body,
    );
    return { success: true, data };
  }

  // ==========================================
  // Templates Management
  // ==========================================

  @Get('templates')
  @Permissions('read:settings')
  async getTemplates(@Query('type') type?: string) {
    const data = await this.notificationService.listTemplates(type);
    return { success: true, data };
  }

  @Get('templates/:id')
  @Permissions('read:settings')
  async getTemplate(@Param('id') id: string) {
    const data = await this.notificationService.getTemplate(id);
    return { success: true, data };
  }

  @Post('templates')
  @Permissions('write:settings')
  async createTemplate(
    @Body()
    body: {
      name: string;
      type: string;
      subject?: string;
      content: string;
      variables: string[];
    },
  ) {
    const data = await this.notificationService.createTemplate(body);
    return { success: true, data };
  }

  @Put('templates/:id')
  @Permissions('write:settings')
  async updateTemplate(@Param('id') id: string, @Body() body: any) {
    const data = await this.notificationService.updateTemplate(id, body);
    return { success: true, data };
  }

  @Delete('templates/:id')
  @Permissions('write:settings')
  async deleteTemplate(@Param('id') id: string) {
    const data = await this.notificationService.deleteTemplate(id);
    return { success: true, data };
  }
}
