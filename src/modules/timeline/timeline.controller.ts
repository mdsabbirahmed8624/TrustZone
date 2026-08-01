import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('timeline')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @Permissions('read:timeline')
  async getTimeline(
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const data = await this.timelineService.getTimeline({
      module,
      action,
      userId,
      startDate,
      endDate,
      search,
      limit,
      offset,
    });
    return { success: true, data };
  }

  @Get('audit')
  @Permissions('read:timeline')
  async getAuditTrails(
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('recordId') recordId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const data = await this.timelineService.getAuditTrails({
      module,
      action,
      recordId,
      limit,
      offset,
    });
    return { success: true, data };
  }
}
