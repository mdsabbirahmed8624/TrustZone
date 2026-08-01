import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  MilestoneCertificationBook6Service,
  IssueCertificationDto,
} from '../services/milestone-certification-book6.service';

@ApiTags('Global Milestone Certification Audits Book 6')
@ApiBearerAuth()
@Controller('system-audit')
export class MilestoneCertificationBook6Controller {
  constructor(
    private readonly book6Service: MilestoneCertificationBook6Service,
  ) {}

  @Post('milestone-certifications-book6/issue')
  @ApiOperation({
    summary: 'Issue global milestone certification audit Book 6',
  })
  async issueCertification(@Body() dto: IssueCertificationDto) {
    return this.book6Service.issueCertification(dto);
  }

  @Get('milestone-certifications-book6')
  @ApiOperation({
    summary: 'List global milestone certification audits Book 6',
  })
  async getCertifications() {
    return this.book6Service.getCertifications();
  }
}
