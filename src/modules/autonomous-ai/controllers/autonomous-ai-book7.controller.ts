import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AutonomousAIBook7Service,
  RecordMetricDto,
} from '../services/autonomous-ai-book7.service';

@ApiTags('Autonomous AI Self-Optimization Analytics')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class AutonomousAIBook7Controller {
  constructor(private readonly book7Service: AutonomousAIBook7Service) {}

  @Post('self-optimization')
  @ApiOperation({
    summary: 'Record autonomous AI self-optimization efficiency metric',
  })
  async recordOptimizationMetric(@Body() dto: RecordMetricDto) {
    return this.book7Service.recordOptimizationMetric(dto);
  }

  @Get('self-optimization')
  @ApiOperation({
    summary: 'List autonomous AI self-optimization performance scorecards',
  })
  async getOptimizationMetrics() {
    return this.book7Service.getOptimizationMetrics();
  }
}
