import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  GenerativeAiTuningEngineBook5Service,
  ExecuteGenAiTuningJobDto,
} from '../services/generative-ai-tuning-engine-book5.service';

@ApiTags('Phase 14 Book 5 — Generative AI Cross-Cloud Tuning Engine')
@ApiBearerAuth()
@Controller('api/v14/generative-ai-tuning-engine-book5')
export class GenerativeAiTuningEngineBook5Controller {
  constructor(
    private readonly genAiService: GenerativeAiTuningEngineBook5Service,
  ) {}

  @Post('execute')
  @ApiOperation({
    summary: 'Execute cross-cloud generative AI hyperparameter fine-tuning job',
    description:
      'Runs hyperparameter search across multi-cloud infrastructure and logs training convergence.',
  })
  async executeJob(@Body() dto: ExecuteGenAiTuningJobDto) {
    return this.genAiService.executeTuningJob(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all generative AI cross-cloud tuning jobs',
  })
  async findAll() {
    return this.genAiService.getTuningJobs();
  }
}
