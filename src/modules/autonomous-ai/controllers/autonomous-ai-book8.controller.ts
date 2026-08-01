import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AutonomousAIBook8Service,
  VerifyBoundaryDto,
} from '../services/autonomous-ai-book8.service';

@ApiTags('Autonomous AI Safety Boundary Verification')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class AutonomousAIBook8Controller {
  constructor(private readonly book8Service: AutonomousAIBook8Service) {}

  @Post('safety-boundaries')
  @ApiOperation({ summary: 'Verify autonomous AI safety boundary constraints' })
  async verifySafetyBoundary(@Body() dto: VerifyBoundaryDto) {
    return this.book8Service.verifySafetyBoundary(dto);
  }

  @Get('safety-boundaries')
  @ApiOperation({ summary: 'List autonomous AI safety boundary audit logs' })
  async getSafetyVerifications() {
    return this.book8Service.getSafetyVerifications();
  }
}
