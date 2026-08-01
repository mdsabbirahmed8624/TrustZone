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
  NeuromorphicAIEdgeGridBook9Service,
  RegisterNeuromorphicGridDto,
} from '../services/neuromorphic-edge-grid-book9.service';

@ApiTags('Phase 15 Book 9 — Neuromorphic AI Edge Grid')
@ApiBearerAuth()
@Controller('api/v15/neuromorphic-edge-grid-book9')
export class NeuromorphicAIEdgeGridBook9Controller {
  private readonly logger = new Logger(
    NeuromorphicAIEdgeGridBook9Controller.name,
  );

  constructor(private readonly service: NeuromorphicAIEdgeGridBook9Service) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register neuromorphic AI edge grid' })
  async registerNeuromorphicGrid(@Body() dto: RegisterNeuromorphicGridDto) {
    this.logger.log(
      `POST /api/v15/neuromorphic-edge-grid-book9/register — ${dto.neuromorphicGridCode}`,
    );
    return this.service.registerNeuromorphicGrid(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all neuromorphic AI edge grids' })
  async getNeuromorphicGrids() {
    this.logger.log('GET /api/v15/neuromorphic-edge-grid-book9');
    return this.service.getNeuromorphicGrids();
  }
}
