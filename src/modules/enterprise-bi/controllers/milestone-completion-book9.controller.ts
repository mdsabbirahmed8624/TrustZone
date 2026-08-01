import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  MilestoneCompletionBook9Service,
  IssueCertificateDto,
} from '../services/milestone-completion-book9.service';

@ApiTags('Milestone Completion Certificates Book 9')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class MilestoneCompletionBook9Controller {
  constructor(private readonly book9Service: MilestoneCompletionBook9Service) {}

  @Post('milestone-certificates-book9/issue')
  @ApiOperation({
    summary: 'Issue Phase 13 milestone completion certificate Book 9',
  })
  async issueCertificate(@Body() dto: IssueCertificateDto) {
    return this.book9Service.issueCertificate(dto);
  }

  @Get('milestone-certificates-book9')
  @ApiOperation({
    summary: 'List Phase 13 milestone completion certificates Book 9',
  })
  async getCertificates() {
    return this.book9Service.getCertificates();
  }
}
