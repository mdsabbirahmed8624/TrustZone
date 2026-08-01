import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  GovernanceBook4Service,
  UpsertMdmRuleDto,
  RecordDrAuditDto,
  EvaluateSlaDto,
} from '../services/governance-book4.service';

@ApiTags('Enterprise MDM Governance, DR Audits & SLA Benchmarks')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class GovernanceBook4Controller {
  constructor(private readonly book4Service: GovernanceBook4Service) {}

  // --- MDM Rules ---
  @Post('mdm-rules')
  @ApiOperation({ summary: 'Create or update master data governance rule' })
  async upsertMdmRule(@Body() dto: UpsertMdmRuleDto) {
    return this.book4Service.upsertMdmRule(dto);
  }

  @Get('mdm-rules')
  @ApiOperation({ summary: 'List all configured master data governance rules' })
  async getMdmRules() {
    return this.book4Service.getMdmRules();
  }

  // --- DR Audits ---
  @Post('dr-audits')
  @ApiOperation({
    summary: 'Record multi-region disaster recovery audit drill',
  })
  async recordDrAudit(@Body() dto: RecordDrAuditDto) {
    return this.book4Service.recordDrAudit(dto);
  }

  @Get('dr-audits')
  @ApiOperation({ summary: 'List disaster recovery audit drill history' })
  async getDrAudits() {
    return this.book4Service.getDrAudits();
  }

  // --- SLA Benchmarks ---
  @Post('sla-benchmarks')
  @ApiOperation({
    summary: 'Record regional/franchise SLA compliance benchmark evaluation',
  })
  async evaluateSlaBenchmark(@Body() dto: EvaluateSlaDto) {
    return this.book4Service.evaluateSlaBenchmark(dto);
  }

  @Get('sla-benchmarks')
  @ApiOperation({ summary: 'List SLA benchmarks by evaluation month' })
  async getSlaBenchmarks(@Query('month') month?: string) {
    return this.book4Service.getSlaBenchmarks(month);
  }
}
