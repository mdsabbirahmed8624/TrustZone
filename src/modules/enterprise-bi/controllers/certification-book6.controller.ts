import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  CertificationBook6Service,
  CertifyMilestoneDto,
  RecordTelemetryDto,
} from '../services/certification-book6.service';

@ApiTags('Enterprise Release Certification & Live Telemetry')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class CertificationBook6Controller {
  constructor(private readonly book6Service: CertificationBook6Service) {}

  // --- Milestone Certification ---
  @Post('certifications/certify')
  @ApiOperation({
    summary: 'Sign off and certify enterprise milestone release',
  })
  async certifyMilestoneRelease(@Body() dto: CertifyMilestoneDto) {
    return this.book6Service.certifyMilestoneRelease(dto);
  }

  @Get('certifications')
  @ApiOperation({ summary: 'List all milestone release certifications' })
  async getCertifications() {
    return this.book6Service.getCertifications();
  }

  // --- Live Telemetry ---
  @Post('telemetry')
  @ApiOperation({ summary: 'Record live production telemetry log entry' })
  async recordTelemetryLog(@Body() dto: RecordTelemetryDto) {
    return this.book6Service.recordTelemetryLog(dto);
  }

  @Get('telemetry')
  @ApiOperation({ summary: 'List recent live production telemetry logs' })
  async getTelemetryLogs(@Query('serviceName') serviceName?: string) {
    return this.book6Service.getTelemetryLogs(serviceName);
  }
}
