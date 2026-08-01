import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  ZeroKnowledgePrivacyBook2Service,
  VerifyZeroKnowledgeProofDto,
} from '../services/zero-knowledge-privacy-book2.service';

@ApiTags('Phase 14 Book 2 — Zero-Knowledge Privacy Ledger')
@ApiBearerAuth()
@Controller('api/v14/zero-knowledge-privacy-book2')
export class ZeroKnowledgePrivacyBook2Controller {
  constructor(private readonly zkService: ZeroKnowledgePrivacyBook2Service) {}

  @Post('verify')
  @ApiOperation({
    summary: 'Verify zero-knowledge proof transaction on privacy ledger',
    description:
      'Verifies zk-SNARK cryptographic proofs for privacy-preserving enterprise transactions.',
  })
  async verifyProof(@Body() dto: VerifyZeroKnowledgeProofDto) {
    return this.zkService.verifyZkProof(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all zero-knowledge privacy ledger proofs',
  })
  async findAll() {
    return this.zkService.getZkProofs();
  }
}
