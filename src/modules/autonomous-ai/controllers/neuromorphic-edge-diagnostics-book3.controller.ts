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
  NeuromorphicEdgeDiagnosticsMeshBook3Service,
  RegisterNeuromorphicMeshDto,
} from '../services/neuromorphic-edge-diagnostics-book3.service';

@ApiTags('Phase 15 Book 3 — Neuromorphic Edge Diagnostics Mesh')
@ApiBearerAuth()
@Controller('api/v15/neuromorphic-edge-diagnostics-book3')
export class NeuromorphicEdgeDiagnosticsMeshBook3Controller {
  private readonly logger = new Logger(
    NeuromorphicEdgeDiagnosticsMeshBook3Controller.name,
  );

  constructor(
    private readonly service: NeuromorphicEdgeDiagnosticsMeshBook3Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register neuromorphic edge diagnostics mesh node' })
  async registerMeshNode(@Body() dto: RegisterNeuromorphicMeshDto) {
    this.logger.log(
      `POST /api/v15/neuromorphic-edge-diagnostics-book3/register — ${dto.meshNodeCode}`,
    );
    return this.service.registerMeshNode(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all neuromorphic edge diagnostics mesh nodes',
  })
  async getMeshNodes() {
    this.logger.log('GET /api/v15/neuromorphic-edge-diagnostics-book3');
    return this.service.getMeshNodes();
  }
}
