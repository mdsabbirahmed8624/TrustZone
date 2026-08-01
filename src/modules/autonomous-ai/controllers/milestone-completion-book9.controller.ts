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
import { MilestoneCompletionBook9Service } from '../services/milestone-completion-book9.service';

@ApiTags('Phase 14 Book 9 — Milestone Completion Certificates')
@ApiBearerAuth()
@Controller('api/v14/milestone-completion-book9')
export class MilestoneCompletionBook9Controller {
  private readonly logger = new Logger(MilestoneCompletionBook9Controller.name);

  constructor(private readonly service: MilestoneCompletionBook9Service) {}

  @Post('certify')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Certify Phase 14 enterprise milestone completion' })
  async certifyMilestoneCompletion(
    @Body()
    body: {
      completionCode: string;
      milestoneTitle?: string;
      certifiedByRole?: string;
    },
  ) {
    this.logger.log(
      `POST /api/v14/milestone-completion-book9/certify — ${body.completionCode}`,
    );
    return this.service.certifyMilestoneCompletion(body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all milestone completion certificates' })
  async getCertificates() {
    this.logger.log('GET /api/v14/milestone-completion-book9');
    return this.service.getCertificates();
  }
}
