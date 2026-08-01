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
import { MasterPlatformReleaseBook10Service } from '../services/master-platform-release-book10.service';

@ApiTags('Phase 14 Book 10 — Master Platform Release Certification')
@ApiBearerAuth()
@Controller('api/v14/master-platform-release-book10')
export class MasterPlatformReleaseBook10Controller {
  private readonly logger = new Logger(
    MasterPlatformReleaseBook10Controller.name,
  );

  constructor(private readonly service: MasterPlatformReleaseBook10Service) {}

  @Post('certify')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Certify Phase 14 capstone master platform GA release',
  })
  async certifyMasterRelease(
    @Body()
    body: {
      masterReleaseCode: string;
      versionTag?: string;
      phaseTitle?: string;
      certifiedBy?: string;
    },
  ) {
    this.logger.log(
      `POST /api/v14/master-platform-release-book10/certify — ${body.masterReleaseCode}`,
    );
    return this.service.certifyMasterRelease(body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all master platform release certifications' })
  async getMasterReleases() {
    this.logger.log('GET /api/v14/master-platform-release-book10');
    return this.service.getMasterReleases();
  }
}
