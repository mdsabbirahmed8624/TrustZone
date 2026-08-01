import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  LiveTelemetryStreamBook6Service,
  RecordStreamAuditDto,
} from '../services/live-telemetry-stream-book6.service';

@ApiTags('Real-Time Live Telemetry Stream Audits Book 6')
@ApiBearerAuth()
@Controller('system-audit')
export class LiveTelemetryStreamBook6Controller {
  constructor(private readonly book6Service: LiveTelemetryStreamBook6Service) {}

  @Post('live-telemetry-streams-book6/record')
  @ApiOperation({
    summary: 'Record real-time live telemetry stream audit Book 6',
  })
  async recordStreamAudit(@Body() dto: RecordStreamAuditDto) {
    return this.book6Service.recordStreamAudit(dto);
  }

  @Get('live-telemetry-streams-book6')
  @ApiOperation({
    summary: 'List real-time live telemetry stream audits Book 6',
  })
  async getStreamAudits() {
    return this.book6Service.getStreamAudits();
  }
}
