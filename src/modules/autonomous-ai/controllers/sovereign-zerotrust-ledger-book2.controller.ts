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
  SovereignZeroTrustLedgerBook2Service,
  RecordLedgerBlockDto,
} from '../services/sovereign-zerotrust-ledger-book2.service';

@ApiTags('Phase 15 Book 2 — Sovereign Zero-Trust Distributed Ledger')
@ApiBearerAuth()
@Controller('api/v15/sovereign-zerotrust-ledger-book2')
export class SovereignZeroTrustLedgerBook2Controller {
  private readonly logger = new Logger(
    SovereignZeroTrustLedgerBook2Controller.name,
  );

  constructor(private readonly service: SovereignZeroTrustLedgerBook2Service) {}

  @Post('record')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Record cryptographic block into sovereign zero-trust distributed ledger',
  })
  async recordLedgerBlock(@Body() dto: RecordLedgerBlockDto) {
    this.logger.log(
      `POST /api/v15/sovereign-zerotrust-ledger-book2/record — ${dto.ledgerBlockCode}`,
    );
    return this.service.recordLedgerBlock(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all sovereign zero-trust distributed ledger blocks',
  })
  async getLedgerBlocks() {
    this.logger.log('GET /api/v15/sovereign-zerotrust-ledger-book2');
    return this.service.getLedgerBlocks();
  }
}
