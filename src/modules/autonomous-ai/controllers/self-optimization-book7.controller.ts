import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SelfOptimizationBook7Service,
  RecordOptimizationAnalyticsDto,
} from '../services/self-optimization-book7.service';

@ApiTags('Phase 14 Book 7 — Autonomous AI Self-Optimization Analytics')
@ApiBearerAuth()
@Controller('api/v14/self-optimization-book7')
export class SelfOptimizationBook7Controller {
  constructor(private readonly book7Service: SelfOptimizationBook7Service) {}

  @Post('record')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Record autonomous AI self-optimization analytics Book 7',
  })
  async recordOptimizationAnalytics(
    @Body() dto: RecordOptimizationAnalyticsDto,
  ) {
    return this.book7Service.recordOptimizationAnalytics(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List autonomous AI self-optimization analytics Book 7',
  })
  async getOptimizationAnalytics() {
    return this.book7Service.getOptimizationAnalytics();
  }
}
