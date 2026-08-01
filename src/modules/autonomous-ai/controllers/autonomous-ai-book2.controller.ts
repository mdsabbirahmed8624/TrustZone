import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AutonomousAIBook2Service,
  UpsertRuleDto,
} from '../services/autonomous-ai-book2.service';

@ApiTags('Autonomous AI Engine & Rules')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class AutonomousAIBook2Controller {
  constructor(private readonly book2Service: AutonomousAIBook2Service) {}

  @Post('rules')
  @ApiOperation({ summary: 'Create or update autonomous AI rule' })
  async upsertRule(@Body() dto: UpsertRuleDto) {
    return this.book2Service.upsertRule(dto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List all configured autonomous AI rules' })
  async getRules() {
    return this.book2Service.getRules();
  }

  @Patch('rules/:id/toggle')
  @ApiOperation({ summary: 'Enable or disable an autonomous AI rule' })
  async toggleRule(
    @Param('id') id: string,
    @Body('isEnabled') isEnabled: boolean,
  ) {
    return this.book2Service.toggleRule(id, isEnabled);
  }

  @Post('execute-rules')
  @ApiOperation({ summary: 'Trigger autonomous AI rule evaluation cycle' })
  async evaluateAndExecuteRules() {
    return this.book2Service.evaluateAndExecuteRules();
  }
}
