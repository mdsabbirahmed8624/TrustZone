import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  QuantumIdentityMeshBook4Service,
  RegisterIdentityLedgerDto,
} from '../services/quantum-identity-mesh-book4.service';

@ApiTags('Quantum-Safe Zero-Trust Identity Mesh')
@ApiBearerAuth()
@Controller('iam-security')
export class QuantumIdentityMeshBook4Controller {
  constructor(private readonly book4Service: QuantumIdentityMeshBook4Service) {}

  @Post('quantum-identity-ledgers/register')
  @ApiOperation({
    summary: 'Register quantum-safe zero-trust identity mesh ledger',
  })
  async registerIdentityLedger(@Body() dto: RegisterIdentityLedgerDto) {
    return this.book4Service.registerIdentityLedger(dto);
  }

  @Get('quantum-identity-ledgers')
  @ApiOperation({
    summary: 'List quantum-safe zero-trust identity mesh ledgers',
  })
  async getIdentityLedgers() {
    return this.book4Service.getIdentityLedgers();
  }
}
