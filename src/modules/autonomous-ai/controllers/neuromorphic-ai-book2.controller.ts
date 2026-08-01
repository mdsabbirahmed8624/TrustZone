import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  NeuromorphicAiBook2Service,
  ExecuteNeuromorphicAiJobDto,
} from '../services/neuromorphic-ai-book2.service';

@ApiTags('Phase 14 Book 2 — Neuromorphic AI Processing Engine')
@ApiBearerAuth()
@Controller('api/v14/neuromorphic-ai-book2')
export class NeuromorphicAiBook2Controller {
  constructor(private readonly neuroAiService: NeuromorphicAiBook2Service) {}

  @Post('execute')
  @ApiOperation({
    summary: 'Execute neuromorphic spiking neural network inference job',
    description:
      'Executes ultra-low power neuromorphic SNN hardware acceleration jobs.',
  })
  async executeJob(@Body() dto: ExecuteNeuromorphicAiJobDto) {
    return this.neuroAiService.executeNeuromorphicJob(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all neuromorphic AI processing job benchmarks',
  })
  async findAll() {
    return this.neuroAiService.getNeuromorphicJobs();
  }
}
