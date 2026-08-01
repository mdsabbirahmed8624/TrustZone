import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  QuantumIdentityMeshBook4Service,
  VerifyQuantumIdentityMeshDto,
} from '../services/quantum-identity-mesh-book4.service';

@ApiTags('Phase 14 Book 4 — Quantum Identity Mesh Ledger')
@ApiBearerAuth()
@Controller('api/v14/quantum-identity-mesh-book4')
export class QuantumIdentityMeshBook4Controller {
  constructor(private readonly qIdService: QuantumIdentityMeshBook4Service) {}

  @Post('verify')
  @ApiOperation({
    summary: 'Verify decentralized quantum identity (DID) for edge mesh node',
    description:
      'Authenticates DID identifiers, cryptographic public keys, and node zero-trust roles.',
  })
  async verifyIdentity(@Body() dto: VerifyQuantumIdentityMeshDto) {
    return this.qIdService.verifyNodeIdentity(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all quantum identity mesh node verifications',
  })
  async findAll() {
    return this.qIdService.getIdentities();
  }
}
