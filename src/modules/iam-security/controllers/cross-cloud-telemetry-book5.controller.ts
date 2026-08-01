import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  CrossCloudTelemetryBook5Service,
  RecordTelemetryAuditDto,
} from '../services/cross-cloud-telemetry-book5.service';

@ApiTags('Zero-Trust Cross-Cloud Telemetry Audit')
@ApiBearerAuth()
@Controller('iam-security')
export class CrossCloudTelemetryBook5Controller {
  constructor(private readonly book5Service: CrossCloudTelemetryBook5Service) {}

  @Post('cross-cloud-telemetry/record')
  @ApiOperation({
    summary: 'Record zero-trust cross-cloud telemetry audit log',
  })
  async recordTelemetryAudit(@Body() dto: RecordTelemetryAuditDto) {
    return this.book5Service.recordTelemetryAudit(dto);
  }

  @Get('cross-cloud-telemetry')
  @ApiOperation({ summary: 'List zero-trust cross-cloud telemetry audit logs' })
  async getTelemetryAudits() {
    return this.book5Service.getTelemetryAudits();
  }
}
