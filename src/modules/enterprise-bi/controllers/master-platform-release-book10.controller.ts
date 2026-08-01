import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  MasterPlatformReleaseBook10Service,
  CertifyMasterPlatformReleaseDto,
} from '../services/master-platform-release-book10.service';

@ApiTags('Phase 13 Book 10 — Master Platform Release Certification')
@ApiBearerAuth()
@Controller('api/v13/master-platform-release-book10')
export class MasterPlatformReleaseBook10Controller {
  constructor(
    private readonly masterReleaseService: MasterPlatformReleaseBook10Service,
  ) {}

  @Post('certify')
  @ApiOperation({
    summary: 'Certify Phase 13 Master Platform Release',
    description:
      'Issues the final GA production release certification for the Phase 13 Quantum-Resistant Enterprise ERP platform.',
  })
  async certify(@Body() dto: CertifyMasterPlatformReleaseDto) {
    return this.masterReleaseService.certifyMasterRelease(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all Phase 13 master platform release certifications',
  })
  async findAll() {
    return this.masterReleaseService.getMasterCertifications();
  }
}
