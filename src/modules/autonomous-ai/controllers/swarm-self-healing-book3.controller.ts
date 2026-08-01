import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SwarmSelfHealingBook3Service,
  RegisterSwarmAgentDto,
} from '../services/swarm-self-healing-book3.service';

@ApiTags('Autonomous AI Swarm Self-Healing Engine')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class SwarmSelfHealingBook3Controller {
  constructor(private readonly book3Service: SwarmSelfHealingBook3Service) {}

  @Post('swarm-agents/register')
  @ApiOperation({ summary: 'Register autonomous AI self-healing swarm agent' })
  async registerSwarmAgent(@Body() dto: RegisterSwarmAgentDto) {
    return this.book3Service.registerSwarmAgent(dto);
  }

  @Get('swarm-agents')
  @ApiOperation({ summary: 'List autonomous AI self-healing swarm agents' })
  async getSwarmAgents() {
    return this.book3Service.getSwarmAgents();
  }
}
