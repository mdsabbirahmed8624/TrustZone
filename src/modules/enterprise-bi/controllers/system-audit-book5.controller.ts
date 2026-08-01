import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SystemAuditBook5Service,
  RunGaAuditDto,
} from '../services/system-audit-book5.service';

@ApiTags('Enterprise Production GA Audit & Readiness')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class SystemAuditBook5Controller {
  constructor(private readonly book5Service: SystemAuditBook5Service) {}

  @Post('system-audits/run-ga')
  @ApiOperation({
    summary: 'Execute final production GA readiness audit verification',
  })
  async runProductionGaAudit(@Body() dto: RunGaAuditDto) {
    return this.book5Service.runProductionGaAudit(dto);
  }

  @Get('system-audits')
  @ApiOperation({ summary: 'List historical production GA system audit logs' })
  async getSystemAudits() {
    return this.book5Service.getSystemAudits();
  }
}
