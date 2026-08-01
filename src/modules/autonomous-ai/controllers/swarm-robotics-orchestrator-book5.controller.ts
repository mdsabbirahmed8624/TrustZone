import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SwarmRoboticsOrchestratorBook5Service,
  DispatchSwarmFleetDto,
} from '../services/swarm-robotics-orchestrator-book5.service';

@ApiTags('Phase 14 Book 5 — Swarm Robotics Fleet Orchestrator')
@ApiBearerAuth()
@Controller('api/v14/swarm-robotics-orchestrator-book5')
export class SwarmRoboticsOrchestratorBook5Controller {
  constructor(
    private readonly swarmService: SwarmRoboticsOrchestratorBook5Service,
  ) {}

  @Post('dispatch')
  @ApiOperation({
    summary: 'Dispatch autonomous repair robotics fleet to shop floor units',
    description:
      'Orchestrates task allocations, unit dispatch status, and fleet efficiency scoring.',
  })
  async dispatchFleet(@Body() dto: DispatchSwarmFleetDto) {
    return this.swarmService.dispatchFleet(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all swarm robotics fleet dispatch records',
  })
  async findAll() {
    return this.swarmService.getFleets();
  }
}
