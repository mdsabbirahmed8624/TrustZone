import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AiSafetyBoundaryBook8Service,
  VerifySafetyBoundaryDto,
} from '../services/ai-safety-boundary-book8.service';

@ApiTags('Phase 14 Book 8 — AI Safety Boundary Verification')
@ApiBearerAuth()
@Controller('api/v14/ai-safety-boundary-book8')
export class AiSafetyBoundaryBook8Controller {
  constructor(private readonly book8Service: AiSafetyBoundaryBook8Service) {}

  @Post('verify')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Verify autonomous AI safety boundary Book 8' })
  async verifySafetyBoundary(@Body() dto: VerifySafetyBoundaryDto) {
    return this.book8Service.verifySafetyBoundary(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List autonomous AI safety boundary verifications Book 8',
  })
  async getSafetyBoundaries() {
    return this.book8Service.getSafetyBoundaries();
  }
}
