import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseFloatPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  EnterpriseBIBook2Service,
  SetExchangeRateDto,
  GenerateForecastDto,
  ConsolidateLedgerDto,
} from '../services/enterprise-bi-book2.service';

@ApiTags('Enterprise BI Book 2 & Currency Engine')
@ApiBearerAuth()
@Controller('enterprise-bi')
export class EnterpriseBIBook2Controller {
  constructor(private readonly book2Service: EnterpriseBIBook2Service) {}

  // --- Currency Exchange Engine ---
  @Post('currency-rates')
  @ApiOperation({ summary: 'Set or update multi-region exchange rate' })
  async setExchangeRate(@Body() dto: SetExchangeRateDto) {
    return this.book2Service.setExchangeRate(dto);
  }

  @Get('currency-convert')
  @ApiOperation({ summary: 'Convert amount between global currencies' })
  async convertCurrency(
    @Query('amount', ParseFloatPipe) amount: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.book2Service.convertCurrency(amount, from, to);
  }

  @Get('currency-rates')
  @ApiOperation({ summary: 'List all multi-region currency exchange rates' })
  async getExchangeRates() {
    return this.book2Service.getExchangeRates();
  }

  // --- Predictive BI Forecasting ---
  @Post('predictive-forecast')
  @ApiOperation({
    summary: 'Generate predictive revenue and EBITDA forecast model',
  })
  async generatePredictiveForecast(@Body() dto: GenerateForecastDto) {
    return this.book2Service.generatePredictiveForecast(dto);
  }

  @Get('predictive-forecasts')
  @ApiOperation({ summary: 'List historical predictive executive forecasts' })
  async getForecasts() {
    return this.book2Service.getForecasts();
  }

  // --- Global Consolidated Ledger ---
  @Post('consolidated-ledger')
  @ApiOperation({ summary: 'Consolidate cross-tenant general ledger entries' })
  async consolidateGlobalLedger(@Body() dto: ConsolidateLedgerDto) {
    return this.book2Service.consolidateGlobalLedger(dto);
  }

  @Get('consolidated-ledgers')
  @ApiOperation({ summary: 'List cross-tenant consolidated ledgers' })
  async getConsolidatedLedgers(@Query('period') period?: string) {
    return this.book2Service.getConsolidatedLedgers(period);
  }
}
