import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  MilestoneBook9Service,
  IssueCertificateDto,
} from '../services/milestone-book9.service';

@ApiTags('Enterprise Milestone Completion Certificates')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class MilestoneBook9Controller {
  constructor(private readonly book9Service: MilestoneBook9Service) {}

  @Post('milestone-certificates/issue')
  @ApiOperation({
    summary: 'Issue official Phase 12 milestone completion certificate',
  })
  async issueMilestoneCertificate(@Body() dto: IssueCertificateDto) {
    return this.book9Service.issueMilestoneCertificate(dto);
  }

  @Get('milestone-certificates')
  @ApiOperation({ summary: 'List Phase 12 milestone completion certificates' })
  async getMilestoneCertificates() {
    return this.book9Service.getMilestoneCertificates();
  }
}
