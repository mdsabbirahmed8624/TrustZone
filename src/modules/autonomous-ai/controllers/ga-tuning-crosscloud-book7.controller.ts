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
  GlobalCrossCloudGATuningGridBook7Service,
  RegisterCrossCloudGATuningDto,
} from '../services/ga-tuning-crosscloud-book7.service';

@ApiTags('Phase 15 Book 7 — Global Cross-Cloud GA Tuning Grid')
@ApiBearerAuth()
@Controller('api/v15/ga-tuning-crosscloud-book7')
export class GlobalCrossCloudGATuningGridBook7Controller {
  private readonly logger = new Logger(
    GlobalCrossCloudGATuningGridBook7Controller.name,
  );

  constructor(
    private readonly service: GlobalCrossCloudGATuningGridBook7Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register global cross-cloud GA tuning grid' })
  async registerGATuningGrid(@Body() dto: RegisterCrossCloudGATuningDto) {
    this.logger.log(
      `POST /api/v15/ga-tuning-crosscloud-book7/register — ${dto.crossCloudTuningCode}`,
    );
    return this.service.registerGATuningGrid(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all global cross-cloud GA tuning grids' })
  async getGATuningGrids() {
    this.logger.log('GET /api/v15/ga-tuning-crosscloud-book7');
    return this.service.getGATuningGrids();
  }
}
