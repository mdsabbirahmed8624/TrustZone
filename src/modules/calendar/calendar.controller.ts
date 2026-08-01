import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @Permissions('read:support')
  async getCalendarFeed(
    @CurrentUser() user: any,
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.calendarService.getCalendarFeed(user.id, {
      branchId,
      startDate,
      endDate,
    });
    return { success: true, data };
  }

  @Post()
  @Permissions('write:support')
  async createEvent(
    @CurrentUser() user: any,
    @Body()
    body: {
      title: string;
      description?: string;
      startDate: string;
      endDate: string;
      type: string;
      branchId?: string;
    },
  ) {
    const data = await this.calendarService.createEvent(user.id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('write:support')
  async deleteEvent(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.calendarService.deleteEvent(id, user.id);
    return { success: true, data };
  }
}
