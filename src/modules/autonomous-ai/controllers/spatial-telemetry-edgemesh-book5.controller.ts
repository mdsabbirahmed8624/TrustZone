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
  AutonomousSpatialTelemetryEdgeMeshBook5Service,
  RegisterSpatialMeshDto,
} from '../services/spatial-telemetry-edgemesh-book5.service';

@ApiTags('Phase 15 Book 5 — Autonomous Spatial Telemetry Edge Mesh')
@ApiBearerAuth()
@Controller('api/v15/spatial-telemetry-edgemesh-book5')
export class AutonomousSpatialTelemetryEdgeMeshBook5Controller {
  private readonly logger = new Logger(
    AutonomousSpatialTelemetryEdgeMeshBook5Controller.name,
  );

  constructor(
    private readonly service: AutonomousSpatialTelemetryEdgeMeshBook5Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register autonomous spatial telemetry edge mesh' })
  async registerSpatialMesh(@Body() dto: RegisterSpatialMeshDto) {
    this.logger.log(
      `POST /api/v15/spatial-telemetry-edgemesh-book5/register — ${dto.spatialMeshCode}`,
    );
    return this.service.registerSpatialMesh(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all autonomous spatial telemetry edge meshes',
  })
  async getSpatialMeshes() {
    this.logger.log('GET /api/v15/spatial-telemetry-edgemesh-book5');
    return this.service.getSpatialMeshes();
  }
}
