import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SpatialTelemetryBook1Service,
  RegisterSpatialGridNodeDto,
} from '../services/spatial-telemetry-book1.service';

@ApiTags('Phase 14 Book 1 — Spatial Telemetry Grid')
@ApiBearerAuth()
@Controller('api/v14/spatial-telemetry-book1')
export class SpatialTelemetryBook1Controller {
  constructor(private readonly spatialService: SpatialTelemetryBook1Service) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register or calibrate spatial telemetry grid node',
    description:
      'Registers a 3D spatial telemetry grid node for AR/VR device diagnostics and remote guidance.',
  })
  async registerNode(@Body() dto: RegisterSpatialGridNodeDto) {
    return this.spatialService.registerSpatialGridNode(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all active spatial telemetry grid nodes',
  })
  async findAll() {
    return this.spatialService.getSpatialGridNodes();
  }
}
