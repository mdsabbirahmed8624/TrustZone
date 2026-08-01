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
import {
  Phase15AIGovernanceEthicsComplianceBook10Service,
  RegisterPhase15AIGovernanceDto,
} from '../services/phase15-ai-governance-book10.service';

@ApiTags('Phase 15 Book 10 — AI Governance Ethics Compliance')
@ApiBearerAuth()
@Controller('api/v15/phase15-ai-governance-book10')
export class Phase15AIGovernanceEthicsComplianceBook10Controller {
  private readonly logger = new Logger(
    Phase15AIGovernanceEthicsComplianceBook10Controller.name,
  );

  constructor(
    private readonly service: Phase15AIGovernanceEthicsComplianceBook10Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register Phase 15 AI Governance Ethics Compliance record',
  })
  async registerGovernanceRecord(@Body() dto: RegisterPhase15AIGovernanceDto) {
    this.logger.log(
      `POST /api/v15/phase15-ai-governance-book10/register — ${dto.governanceRecordCode}`,
    );
    return this.service.registerGovernanceRecord(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all Phase 15 AI Governance Ethics Compliance records',
  })
  async getGovernanceRecords() {
    this.logger.log('GET /api/v15/phase15-ai-governance-book10');
    return this.service.getGovernanceRecords();
  }
}
