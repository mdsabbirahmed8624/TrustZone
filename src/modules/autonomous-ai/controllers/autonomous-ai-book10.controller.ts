import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AutonomousAIBook10Service,
  AuditEthicsDto,
} from '../services/autonomous-ai-book10.service';

@ApiTags('Autonomous AI Governance & Ethics Audits')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class AutonomousAIBook10Controller {
  constructor(private readonly book10Service: AutonomousAIBook10Service) {}

  @Post('ethics-audits')
  @ApiOperation({
    summary: 'Audit autonomous AI governance & ethics policy compliance',
  })
  async auditEthicsPolicy(@Body() dto: AuditEthicsDto) {
    return this.book10Service.auditEthicsPolicy(dto);
  }

  @Get('ethics-audits')
  @ApiOperation({
    summary: 'List autonomous AI ethics policy audit scorecards',
  })
  async getEthicsAudits() {
    return this.book10Service.getEthicsAudits();
  }
}
