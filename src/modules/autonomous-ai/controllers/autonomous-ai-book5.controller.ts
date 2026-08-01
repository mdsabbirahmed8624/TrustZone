import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AutonomousAIBook5Service,
  TuneModelDto,
} from '../services/autonomous-ai-book5.service';

@ApiTags('Autonomous AI Model Optimization & Tuning')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class AutonomousAIBook5Controller {
  constructor(private readonly book5Service: AutonomousAIBook5Service) {}

  @Post('tuning/tune')
  @ApiOperation({ summary: 'Execute AI model hyperparameter tuning cycle' })
  async tuneAiModel(@Body() dto: TuneModelDto) {
    return this.book5Service.tuneAiModel(dto);
  }

  @Get('tuning')
  @ApiOperation({
    summary: 'List tuned autonomous AI model performance metrics',
  })
  async getTuningList() {
    return this.book5Service.getTuningList();
  }
}
