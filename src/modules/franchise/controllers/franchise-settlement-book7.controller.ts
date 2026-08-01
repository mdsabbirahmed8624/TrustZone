import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  FranchiseSettlementBook7Service,
  ProcessSettlementDto,
} from '../services/franchise-settlement-book7.service';

@ApiTags('Franchise Royalty Settlements Book 7')
@ApiBearerAuth()
@Controller('franchise')
export class FranchiseSettlementBook7Controller {
  constructor(private readonly book7Service: FranchiseSettlementBook7Service) {}

  @Post('royalty-settlements-book7/process')
  @ApiOperation({ summary: 'Process franchise royalty settlement Book 7' })
  async processSettlement(@Body() dto: ProcessSettlementDto) {
    return this.book7Service.processSettlement(dto);
  }

  @Get('royalty-settlements-book7')
  @ApiOperation({ summary: 'List franchise royalty settlements Book 7' })
  async getSettlements() {
    return this.book7Service.getSettlements();
  }
}
