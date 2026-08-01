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
  SovereignMultiTenantMicrosegmentationBook7Service,
  RegisterTenantSegmentDto,
} from '../services/sovereign-multitenant-book7.service';

@ApiTags('Phase 15 Book 7 — Sovereign Multi-Tenant Microsegmentation')
@ApiBearerAuth()
@Controller('api/v15/sovereign-multitenant-book7')
export class SovereignMultiTenantMicrosegmentationBook7Controller {
  private readonly logger = new Logger(
    SovereignMultiTenantMicrosegmentationBook7Controller.name,
  );

  constructor(
    private readonly service: SovereignMultiTenantMicrosegmentationBook7Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register sovereign multi-tenant microsegmentation',
  })
  async registerTenantSegment(@Body() dto: RegisterTenantSegmentDto) {
    this.logger.log(
      `POST /api/v15/sovereign-multitenant-book7/register — ${dto.tenantSegmentCode}`,
    );
    return this.service.registerTenantSegment(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all sovereign multi-tenant microsegmentations',
  })
  async getTenantSegments() {
    this.logger.log('GET /api/v15/sovereign-multitenant-book7');
    return this.service.getTenantSegments();
  }
}
