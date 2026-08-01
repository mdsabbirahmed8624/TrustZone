import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AutonomousAIBook9Service,
  RecordDriftDto,
} from '../services/autonomous-ai-book9.service';

@ApiTags('Autonomous AI Model Drift Monitoring')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class AutonomousAIBook9Controller {
  constructor(private readonly book9Service: AutonomousAIBook9Service) {}

  @Post('model-drifts')
  @ApiOperation({
    summary: 'Record autonomous AI model drift & feature attribution metric',
  })
  async recordModelDrift(@Body() dto: RecordDriftDto) {
    return this.book9Service.recordModelDrift(dto);
  }

  @Get('model-drifts')
  @ApiOperation({ summary: 'List autonomous AI model drift scorecards' })
  async getModelDrifts(@Query('modelId') modelId?: string) {
    return this.book9Service.getModelDrifts(modelId);
  }
}
