import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  FederatedLearningBook2Service,
  CreateFederatedJobDto,
} from '../services/federated-learning-book2.service';

@ApiTags('Autonomous AI Federated Learning Orchestration')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class FederatedLearningBook2Controller {
  constructor(private readonly book2Service: FederatedLearningBook2Service) {}

  @Post('federated-learning-jobs/create')
  @ApiOperation({
    summary: 'Create privacy-preserving AI federated learning job',
  })
  async createFederatedJob(@Body() dto: CreateFederatedJobDto) {
    return this.book2Service.createFederatedJob(dto);
  }

  @Get('federated-learning-jobs')
  @ApiOperation({
    summary: 'List privacy-preserving AI federated learning jobs',
  })
  async getFederatedJobs() {
    return this.book2Service.getFederatedJobs();
  }
}
