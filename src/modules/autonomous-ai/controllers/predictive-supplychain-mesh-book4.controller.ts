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
  PredictiveAutonomousSupplyChainMeshBook4Service,
  RegisterSupplyChainMeshDto,
} from '../services/predictive-supplychain-mesh-book4.service';

@ApiTags('Phase 15 Book 4 — Predictive Autonomous Supply Chain Mesh')
@ApiBearerAuth()
@Controller('api/v15/predictive-supplychain-mesh-book4')
export class PredictiveAutonomousSupplyChainMeshBook4Controller {
  private readonly logger = new Logger(
    PredictiveAutonomousSupplyChainMeshBook4Controller.name,
  );

  constructor(
    private readonly service: PredictiveAutonomousSupplyChainMeshBook4Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register predictive autonomous supply chain mesh' })
  async registerSupplyChain(@Body() dto: RegisterSupplyChainMeshDto) {
    this.logger.log(
      `POST /api/v15/predictive-supplychain-mesh-book4/register — ${dto.supplyChainCode}`,
    );
    return this.service.registerSupplyChain(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all predictive autonomous supply chain meshes',
  })
  async getSupplyChains() {
    this.logger.log('GET /api/v15/predictive-supplychain-mesh-book4');
    return this.service.getSupplyChains();
  }
}
