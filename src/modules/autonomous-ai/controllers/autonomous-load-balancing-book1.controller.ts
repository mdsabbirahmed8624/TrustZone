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
  AutonomousLoadBalancingGridBook1Service,
  ExecuteLoadBalancingDto,
} from '../services/autonomous-load-balancing-book1.service';

@ApiTags('Phase 15 Book 1 — Autonomous Load-Balancing Grid')
@ApiBearerAuth()
@Controller('api/v15/autonomous-load-balancing-book1')
export class AutonomousLoadBalancingGridBook1Controller {
  private readonly logger = new Logger(
    AutonomousLoadBalancingGridBook1Controller.name,
  );

  constructor(
    private readonly service: AutonomousLoadBalancingGridBook1Service,
  ) {}

  @Post('balance')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Execute autonomous grid load-balancing optimization',
  })
  async executeLoadBalancing(@Body() dto: ExecuteLoadBalancingDto) {
    this.logger.log(
      `POST /api/v15/autonomous-load-balancing-book1/balance — ${dto.gridCode}`,
    );
    return this.service.executeLoadBalancing(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all autonomous load-balancing grid configurations',
  })
  async getGrids() {
    this.logger.log('GET /api/v15/autonomous-load-balancing-book1');
    return this.service.getGrids();
  }
}
