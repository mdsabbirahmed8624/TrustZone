import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SchedulerEngineService } from '../services/scheduler-engine.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('scheduler')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerEngineService) {}

  @Post('tasks')
  @Permissions('scheduler:write')
  @HttpCode(HttpStatus.CREATED)
  async registerTask(
    @Body()
    body: {
      taskName: string;
      cronExpression: string;
      actionType: string;
      timezone?: string;
      businessHoursOnly?: boolean;
      holidayExclusion?: boolean;
    },
  ) {
    return this.schedulerService.registerTask(
      body.taskName,
      body.cronExpression,
      body.actionType,
      body.timezone || 'UTC',
      body.businessHoursOnly || false,
      body.holidayExclusion || false,
    );
  }

  @Post('run-due')
  @Permissions('scheduler:write')
  @HttpCode(HttpStatus.OK)
  async runDueTasks() {
    return this.schedulerService.runDueTasks();
  }

  @Get('calendar')
  @Permissions('scheduler:read')
  async getJobCalendar() {
    return this.schedulerService.getJobCalendar();
  }
}
