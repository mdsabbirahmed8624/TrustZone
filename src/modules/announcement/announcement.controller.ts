import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('announcements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  @Permissions('read:support')
  async getAnnouncements(@CurrentUser() user: any) {
    const data = await this.announcementService.listAnnouncements(user.id);
    return { success: true, data };
  }

  @Post()
  @Permissions('write:support')
  async createAnnouncement(
    @CurrentUser() user: any,
    @Body()
    body: {
      title: string;
      content: string;
      targetType: 'ALL' | 'BRANCH' | 'ROLE';
      targetValue?: string;
      scheduledFor?: string;
    },
  ) {
    const data = await this.announcementService.createAnnouncement(
      user.id,
      body,
    );
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('write:support')
  async deleteAnnouncement(@Param('id') id: string) {
    const data = await this.announcementService.deleteAnnouncement(id);
    return { success: true, data };
  }
}
