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
import { BackgroundJobService } from '../services/background-job.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('jobs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JobsController {
  constructor(private readonly backgroundJobService: BackgroundJobService) {}

  @Post('enqueue')
  @Permissions('jobs:write')
  @HttpCode(HttpStatus.CREATED)
  async enqueueJob(
    @Body()
    body: {
      jobType: string;
      payload: any;
      queueName?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      delaySeconds?: number;
    },
  ) {
    return this.backgroundJobService.enqueueJob(
      body.jobType,
      body.payload,
      body.queueName || 'DEFAULT',
      body.priority || 'MEDIUM',
      body.delaySeconds || 0,
    );
  }

  @Post('process-next')
  @Permissions('jobs:write')
  @HttpCode(HttpStatus.OK)
  async processNextJob(
    @Body() body: { queueName?: string; workerId?: string },
  ) {
    return this.backgroundJobService.processNextJob(
      body.queueName || 'DEFAULT',
      body.workerId || 'worker-node-1',
    );
  }

  @Get('dlq')
  @Permissions('jobs:read')
  async getDlqJobs() {
    return this.backgroundJobService.getDlqJobs();
  }

  @Get('health')
  @Permissions('jobs:read')
  async getWorkerHealthMetrics() {
    return this.backgroundJobService.getWorkerHealthMetrics();
  }
}
