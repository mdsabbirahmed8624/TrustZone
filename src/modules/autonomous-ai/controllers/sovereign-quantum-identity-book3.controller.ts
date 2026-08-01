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
  SovereignQuantumIdentityFederationBook3Service,
  RegisterQuantumIdentityDto,
} from '../services/sovereign-quantum-identity-book3.service';

@ApiTags('Phase 15 Book 3 — Sovereign Quantum-Resistant Identity Federation')
@ApiBearerAuth()
@Controller('api/v15/sovereign-quantum-identity-book3')
export class SovereignQuantumIdentityFederationBook3Controller {
  private readonly logger = new Logger(
    SovereignQuantumIdentityFederationBook3Controller.name,
  );

  constructor(
    private readonly service: SovereignQuantumIdentityFederationBook3Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register sovereign quantum-resistant federated identity',
  })
  async registerIdentity(@Body() dto: RegisterQuantumIdentityDto) {
    this.logger.log(
      `POST /api/v15/sovereign-quantum-identity-book3/register — ${dto.identityCode}`,
    );
    return this.service.registerIdentity(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all sovereign quantum-resistant federated identities',
  })
  async getIdentities() {
    this.logger.log('GET /api/v15/sovereign-quantum-identity-book3');
    return this.service.getIdentities();
  }
}
