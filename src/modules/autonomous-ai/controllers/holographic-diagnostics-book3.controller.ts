import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  HolographicDiagnosticsBook3Service,
  StartHolographicDiagnosticSessionDto,
} from '../services/holographic-diagnostics-book3.service';

@ApiTags('Phase 14 Book 3 — Holographic Diagnostics Engine')
@ApiBearerAuth()
@Controller('api/v14/holographic-diagnostics-book3')
export class HolographicDiagnosticsBook3Controller {
  constructor(
    private readonly holoService: HolographicDiagnosticsBook3Service,
  ) {}

  @Post('start')
  @ApiOperation({
    summary: 'Start 3D AR/VR holographic spatial diagnostic session',
    description:
      'Initiates 8K voxel resolution spatial AR/VR hologram overlay session.',
  })
  async startSession(@Body() dto: StartHolographicDiagnosticSessionDto) {
    return this.holoService.startDiagnosticSession(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all active holographic diagnostic sessions',
  })
  async findAll() {
    return this.holoService.getDiagnosticSessions();
  }
}
