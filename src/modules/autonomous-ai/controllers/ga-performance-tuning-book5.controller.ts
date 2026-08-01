import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  GaPerformanceTuningBook5Service,
  ExecuteTuningJobDto,
} from '../services/ga-performance-tuning-book5.service';

@ApiTags('Autonomous AI GA Performance Tuning')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class GaPerformanceTuningBook5Controller {
  constructor(private readonly book5Service: GaPerformanceTuningBook5Service) {}

  @Post('ga-tuning-jobs/execute')
  @ApiOperation({ summary: 'Execute autonomous AI GA performance tuning job' })
  async executeTuningJob(@Body() dto: ExecuteTuningJobDto) {
    return this.book5Service.executeTuningJob(dto);
  }

  @Get('ga-tuning-jobs')
  @ApiOperation({ summary: 'List autonomous AI GA performance tuning jobs' })
  async getTuningJobs() {
    return this.book5Service.getTuningJobs();
  }
}
