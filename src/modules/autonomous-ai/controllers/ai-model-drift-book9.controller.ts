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
  AiModelDriftBook9Service,
  RecordDriftAuditDto,
} from '../services/ai-model-drift-book9.service';

@ApiTags('Phase 14 Book 9 — AI Model Drift Monitoring')
@ApiBearerAuth()
@Controller('api/v14/ai-model-drift-book9')
export class AiModelDriftBook9Controller {
  constructor(private readonly book9Service: AiModelDriftBook9Service) {}

  @Post('record')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record autonomous AI model drift audit Book 9' })
  async recordDriftAudit(@Body() dto: RecordDriftAuditDto) {
    return this.book9Service.recordDriftAudit(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List autonomous AI model drift audits Book 9' })
  async getDriftAudits() {
    return this.book9Service.getDriftAudits();
  }
}
