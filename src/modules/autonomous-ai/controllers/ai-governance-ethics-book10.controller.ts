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
  AiGovernanceEthicsBook10Service,
  AuditEthicsComplianceDto,
} from '../services/ai-governance-ethics-book10.service';

@ApiTags('Phase 14 Book 10 — AI Governance Ethics Compliance')
@ApiBearerAuth()
@Controller('api/v14/ai-governance-ethics-book10')
export class AiGovernanceEthicsBook10Controller {
  constructor(
    private readonly ethicsService: AiGovernanceEthicsBook10Service,
  ) {}

  @Post('audit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Audit AI Governance Ethics Compliance Policy',
    description:
      'Evaluates an AI governance ethics compliance policy against enterprise standards.',
  })
  async audit(@Body() dto: AuditEthicsComplianceDto) {
    return this.ethicsService.auditEthicsPolicy(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all AI governance ethics compliance audits',
  })
  async findAll() {
    return this.ethicsService.getEthicsAudits();
  }
}
