import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  MasterReleaseBook10Service,
  CertifyMasterReleaseDto,
} from '../services/master-release-book10.service';

@ApiTags('Master ERP Platform Release Certification')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class MasterReleaseBook10Controller {
  constructor(private readonly book10Service: MasterReleaseBook10Service) {}

  @Post('master-certifications/certify')
  @ApiOperation({
    summary: 'Issue master ERP platform production GA release certification',
  })
  async certifyMasterRelease(@Body() dto: CertifyMasterReleaseDto) {
    return this.book10Service.certifyMasterRelease(dto);
  }

  @Get('master-certifications')
  @ApiOperation({ summary: 'List master ERP platform release certifications' })
  async getMasterCertifications() {
    return this.book10Service.getMasterCertifications();
  }
}
