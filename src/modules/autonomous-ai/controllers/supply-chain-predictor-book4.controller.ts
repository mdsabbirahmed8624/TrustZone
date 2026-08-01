import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SupplyChainPredictorBook4Service,
  PredictSupplyChainDemandDto,
} from '../services/supply-chain-predictor-book4.service';

@ApiTags('Phase 14 Book 4 — Supply-Chain Demand Predictor Engine')
@ApiBearerAuth()
@Controller('api/v14/supply-chain-predictor-book4')
export class SupplyChainPredictorBook4Controller {
  constructor(private readonly scService: SupplyChainPredictorBook4Service) {}

  @Post('predict')
  @ApiOperation({
    summary:
      'Predict supply-chain inventory demand & trigger auto-replenishment',
    description:
      'Forecasts component demand quantity, confidence score, and triggers auto-replenishment.',
  })
  async predictDemand(@Body() dto: PredictSupplyChainDemandDto) {
    return this.scService.predictDemand(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all supply-chain demand predictions',
  })
  async findAll() {
    return this.scService.getPredictions();
  }
}
