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
  Phase15MasterPlatformReleaseBook10Service,
  RegisterPhase15MasterReleaseDto,
} from '../services/phase15-master-release-book10.service';

@ApiTags('Phase 15 Book 10 — Master Platform Release')
@ApiBearerAuth()
@Controller('api/v15/phase15-master-release-book10')
export class Phase15MasterPlatformReleaseBook10Controller {
  private readonly logger = new Logger(
    Phase15MasterPlatformReleaseBook10Controller.name,
  );

  constructor(
    private readonly service: Phase15MasterPlatformReleaseBook10Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register Phase 15 Master Platform Release' })
  async registerMasterRelease(@Body() dto: RegisterPhase15MasterReleaseDto) {
    this.logger.log(
      `POST /api/v15/phase15-master-release-book10/register — ${dto.masterReleaseCode}`,
    );
    return this.service.registerMasterRelease(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all Phase 15 Master Platform Releases' })
  async getMasterReleases() {
    this.logger.log('GET /api/v15/phase15-master-release-book10');
    return this.service.getMasterReleases();
  }
}
