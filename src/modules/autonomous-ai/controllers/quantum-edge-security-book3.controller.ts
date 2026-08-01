import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  QuantumEdgeSecurityBook3Service,
  EnforceQuantumEdgeSecurityPolicyDto,
} from '../services/quantum-edge-security-book3.service';

@ApiTags('Phase 14 Book 3 — Quantum Edge Security Policy Engine')
@ApiBearerAuth()
@Controller('api/v14/quantum-edge-security-book3')
export class QuantumEdgeSecurityBook3Controller {
  constructor(
    private readonly securityService: QuantumEdgeSecurityBook3Service,
  ) {}

  @Post('enforce')
  @ApiOperation({
    summary: 'Enforce quantum-resistant zero-trust edge security policy',
    description:
      'Enforces post-quantum ML-KEM cryptographic key rotation and zero-trust policies.',
  })
  async enforcePolicy(@Body() dto: EnforceQuantumEdgeSecurityPolicyDto) {
    return this.securityService.enforceSecurityPolicy(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all quantum edge security policies',
  })
  async findAll() {
    return this.securityService.getSecurityPolicies();
  }
}
