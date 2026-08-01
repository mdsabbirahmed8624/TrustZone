import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  MicroSegmentationBook3Service,
  CreateMicroSegmentationPolicyDto,
} from '../services/micro-segmentation-book3.service';

@ApiTags('Zero-Trust Micro-Segmentation Security')
@ApiBearerAuth()
@Controller('iam-security')
export class MicroSegmentationBook3Controller {
  constructor(private readonly book3Service: MicroSegmentationBook3Service) {}

  @Post('micro-segmentation-policies/create')
  @ApiOperation({
    summary: 'Create zero-trust micro-segmentation security policy',
  })
  async createMicroSegmentationPolicy(
    @Body() dto: CreateMicroSegmentationPolicyDto,
  ) {
    return this.book3Service.createMicroSegmentationPolicy(dto);
  }

  @Get('micro-segmentation-policies')
  @ApiOperation({
    summary: 'List zero-trust micro-segmentation security policies',
  })
  async getMicroSegmentationPolicies() {
    return this.book3Service.getMicroSegmentationPolicies();
  }
}
