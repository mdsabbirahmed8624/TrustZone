import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SupplyChainPredictorBook4Service,
  CreateSupplyChainPredictionDto,
} from '../services/supply-chain-predictor-book4.service';

@ApiTags('Autonomous AI Supply-Chain Predictor')
@ApiBearerAuth()
@Controller('inventory')
export class SupplyChainPredictorBook4Controller {
  constructor(
    private readonly book4Service: SupplyChainPredictorBook4Service,
  ) {}

  @Post('supply-chain-predictions/create')
  @ApiOperation({
    summary: 'Create autonomous AI supply-chain depletion prediction',
  })
  async createSupplyChainPrediction(
    @Body() dto: CreateSupplyChainPredictionDto,
  ) {
    return this.book4Service.createSupplyChainPrediction(dto);
  }

  @Get('supply-chain-predictions')
  @ApiOperation({
    summary: 'List autonomous AI supply-chain depletion predictions',
  })
  async getSupplyChainPredictions() {
    return this.book4Service.getSupplyChainPredictions();
  }
}
