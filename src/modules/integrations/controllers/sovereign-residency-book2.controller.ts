import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SovereignResidencyBook2Service,
  CreateResidencyPolicyDto,
} from '../services/sovereign-residency-book2.service';

@ApiTags('Multi-Cloud Sovereign Data Residency')
@ApiBearerAuth()
@Controller('integrations')
export class SovereignResidencyBook2Controller {
  constructor(private readonly book2Service: SovereignResidencyBook2Service) {}

  @Post('sovereign-residency-policies/create')
  @ApiOperation({
    summary: 'Create multi-cloud sovereign data residency policy',
  })
  async createResidencyPolicy(@Body() dto: CreateResidencyPolicyDto) {
    return this.book2Service.createResidencyPolicy(dto);
  }

  @Get('sovereign-residency-policies')
  @ApiOperation({
    summary: 'List multi-cloud sovereign data residency policies',
  })
  async getResidencyPolicies() {
    return this.book2Service.getResidencyPolicies();
  }
}
