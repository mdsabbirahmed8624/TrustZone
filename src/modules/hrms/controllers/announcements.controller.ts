import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnnouncementService } from '../services/announcement.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('hr/announcements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnnouncementsController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async createAnnouncement(
    @Body()
    body: {
      title: string;
      content: string;
      department?: string;
      priority?: string;
    },
  ) {
    return this.announcementService.createAnnouncement(
      body.title,
      body.content,
      body.department,
      body.priority,
    );
  }

  @Get()
  @Permissions('hr:read')
  async getAnnouncements(@Query('department') department?: string) {
    return this.announcementService.getAnnouncements(department);
  }
}
