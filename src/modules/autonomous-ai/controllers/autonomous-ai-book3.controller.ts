import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AutonomousAIBook3Service,
  AllocateWorkloadDto,
  LogIncidentDto,
} from '../services/autonomous-ai-book3.service';

@ApiTags('Autonomous AI Capacity Matching & Self-Healing Incidents')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class AutonomousAIBook3Controller {
  constructor(private readonly book3Service: AutonomousAIBook3Service) {}

  @Post('workload-allocations')
  @ApiOperation({
    summary: 'Allocate technician workload based on AI capacity matching',
  })
  async allocateTechnicianWorkload(@Body() dto: AllocateWorkloadDto) {
    return this.book3Service.allocateTechnicianWorkload(dto);
  }

  @Get('workload-allocations')
  @ApiOperation({ summary: 'List AI technician workload allocations' })
  async getWorkloadAllocations(@Query('branchId') branchId?: string) {
    return this.book3Service.getWorkloadAllocations(branchId);
  }

  @Post('incidents')
  @ApiOperation({
    summary: 'Log autonomous AI self-healing incident resolution',
  })
  async logSelfHealingIncident(@Body() dto: LogIncidentDto) {
    return this.book3Service.logSelfHealingIncident(dto);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'List autonomous AI self-healing incidents' })
  async getIncidents() {
    return this.book3Service.getIncidents();
  }
}
