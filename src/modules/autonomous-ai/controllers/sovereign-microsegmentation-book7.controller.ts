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
import { SovereignMicrosegmentationBook7Service } from '../services/sovereign-microsegmentation-book7.service';

@ApiTags('Phase 14 Book 7 — Sovereign Microsegmentation Engine')
@ApiBearerAuth()
@Controller('api/v14/sovereign-microsegmentation-book7')
export class SovereignMicrosegmentationBook7Controller {
  private readonly logger = new Logger(
    SovereignMicrosegmentationBook7Controller.name,
  );

  constructor(
    private readonly service: SovereignMicrosegmentationBook7Service,
  ) {}

  @Post('enforce')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enforce zero-trust sovereign microsegmentation policy',
  })
  async enforcePolicy(@Body() body: { segmentCode: string }) {
    this.logger.log(
      `POST /api/v14/sovereign-microsegmentation-book7/enforce — ${body.segmentCode}`,
    );
    return this.service.enforcePolicy(body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all sovereign microsegmentation policies' })
  async getPolicies() {
    this.logger.log('GET /api/v14/sovereign-microsegmentation-book7');
    return this.service.getPolicies();
  }
}
