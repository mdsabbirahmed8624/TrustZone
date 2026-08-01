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
  SelfHealingQuantumVaultBook4Service,
  RegisterQuantumVaultDto,
} from '../services/self-healing-quantum-vault-book4.service';

@ApiTags('Phase 15 Book 4 — Self-Healing Quantum Cryptographic Vault')
@ApiBearerAuth()
@Controller('api/v15/self-healing-quantum-vault-book4')
export class SelfHealingQuantumVaultBook4Controller {
  private readonly logger = new Logger(
    SelfHealingQuantumVaultBook4Controller.name,
  );

  constructor(private readonly service: SelfHealingQuantumVaultBook4Service) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register self-healing quantum cryptographic vault',
  })
  async registerVault(@Body() dto: RegisterQuantumVaultDto) {
    this.logger.log(
      `POST /api/v15/self-healing-quantum-vault-book4/register — ${dto.vaultCode}`,
    );
    return this.service.registerVault(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all self-healing quantum cryptographic vaults',
  })
  async getVaults() {
    this.logger.log('GET /api/v15/self-healing-quantum-vault-book4');
    return this.service.getVaults();
  }
}
