import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnterpriseBIService } from './enterprise-bi.service';

@ApiTags('Enterprise BI & Global Analytics')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class EnterpriseBIController {
  constructor(private readonly biService: EnterpriseBIService) {}

  @Post('rollup')
  @ApiOperation({
    summary: 'Generate global enterprise financial & operational rollup report',
  })
  async generateGlobalRollup(@Query('period') period: string) {
    return this.biService.generateGlobalRollup(period || '2026-07');
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get franchise comparative matrix' })
  async getFranchiseMatrix() {
    return this.biService.getFranchiseMatrix();
  }

  @Get('forecast')
  @ApiOperation({
    summary: 'Get 12-month executive revenue & profit trajectory forecast',
  })
  async getExecutiveForecast(@Query('months') months?: string) {
    const horizon = months ? parseInt(months, 10) : 12;
    return this.biService.getExecutiveForecast(horizon);
  }

  @Get('regions')
  @ApiOperation({
    summary: 'List configured multi-region enterprise data clusters',
  })
  async getMultiRegionConfigs() {
    return this.biService.getMultiRegionConfigs();
  }

  @Post('regions')
  @ApiOperation({
    summary: 'Register or update a multi-region data cluster node',
  })
  async upsertRegionConfig(
    @Body('regionCode') regionCode: string,
    @Body('regionName') regionName: string,
    @Body('primaryDbUrl') primaryDbUrl: string,
    @Body('currency') currency: string,
  ) {
    return this.biService.upsertRegionConfig(
      regionCode,
      regionName,
      primaryDbUrl,
      currency || 'USD',
    );
  }
}
