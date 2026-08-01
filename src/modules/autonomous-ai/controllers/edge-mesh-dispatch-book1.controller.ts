import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  EdgeMeshDispatchBook1Service,
  RecordEdgeDispatchDto,
} from '../services/edge-mesh-dispatch-book1.service';

@ApiTags('Phase 14 Book 1 — Edge Mesh Node Dispatch')
@ApiBearerAuth()
@Controller('api/v14/edge-mesh-dispatch-book1')
export class EdgeMeshDispatchBook1Controller {
  constructor(
    private readonly edgeDispatchService: EdgeMeshDispatchBook1Service,
  ) {}

  @Post('record')
  @ApiOperation({
    summary: 'Record autonomous edge mesh node dispatch event',
    description:
      'Records an edge computing node dispatch event for real-time low-latency workload allocation.',
  })
  async recordDispatch(@Body() dto: RecordEdgeDispatchDto) {
    return this.edgeDispatchService.recordEdgeDispatch(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all active edge mesh node dispatch records',
  })
  async findAll() {
    return this.edgeDispatchService.getEdgeDispatches();
  }
}
