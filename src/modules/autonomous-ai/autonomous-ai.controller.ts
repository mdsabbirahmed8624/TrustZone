import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutonomousAIService } from './autonomous-ai.service';

@ApiTags('Autonomous AI & Self-Healing Platform')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class AutonomousAIController {
  constructor(private readonly aiService: AutonomousAIService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get autonomous AI system summary and status' })
  async getAutonomousAISummary() {
    return this.aiService.getAutonomousAISummary();
  }

  @Post('self-heal')
  @ApiOperation({
    summary:
      'Trigger AI self-healing cycle for stuck tickets and background jobs',
  })
  async triggerSelfHealing() {
    return this.aiService.triggerSelfHealing();
  }

  @Post('auto-reorder')
  @ApiOperation({ summary: 'Trigger AI autonomous stock reordering cycle' })
  async triggerAutonomousReorder() {
    return this.aiService.triggerAutonomousReorder();
  }

  @Get('operations')
  @ApiOperation({ summary: 'List recent autonomous AI operations audit log' })
  async getOperationsList(@Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 20;
    return this.aiService.getOperationsList(take);
  }
}
