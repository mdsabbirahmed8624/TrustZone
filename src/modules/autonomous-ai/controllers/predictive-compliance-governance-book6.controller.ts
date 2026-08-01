import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PredictiveComplianceGovernanceBook6Service } from '../services/predictive-compliance-governance-book6.service';

@ApiTags('Phase 14 Book 6 — Predictive Compliance Governance')
@ApiBearerAuth()
@Controller('api/v14/predictive-compliance-governance-book6')
export class PredictiveComplianceGovernanceBook6Controller {
  private readonly logger = new Logger(
    PredictiveComplianceGovernanceBook6Controller.name,
  );

  constructor(
    private readonly service: PredictiveComplianceGovernanceBook6Service,
  ) {}

  @Post('assess')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Run predictive compliance governance assessment' })
  async runAssessment(@Body() body: { complianceCode: string }) {
    this.logger.log(
      `POST /api/v14/predictive-compliance-governance-book6/assess — ${body.complianceCode}`,
    );
    return this.service.runComplianceAssessment(body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all compliance governance assessments' })
  async getAssessments() {
    this.logger.log('GET /api/v14/predictive-compliance-governance-book6');
    return this.service.getAssessments();
  }
}
