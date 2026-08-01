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
  HolographicQuantumSecurityEnclaveBook8Service,
  RegisterHolographicEnclaveDto,
} from '../services/holographic-quantum-security-book8.service';

@ApiTags('Phase 15 Book 8 — Holographic Quantum Security Enclave')
@ApiBearerAuth()
@Controller('api/v15/holographic-quantum-security-book8')
export class HolographicQuantumSecurityEnclaveBook8Controller {
  private readonly logger = new Logger(
    HolographicQuantumSecurityEnclaveBook8Controller.name,
  );

  constructor(
    private readonly service: HolographicQuantumSecurityEnclaveBook8Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register holographic quantum security enclave' })
  async registerHolographicEnclave(@Body() dto: RegisterHolographicEnclaveDto) {
    this.logger.log(
      `POST /api/v15/holographic-quantum-security-book8/register — ${dto.holographicEnclaveCode}`,
    );
    return this.service.registerHolographicEnclave(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all holographic quantum security enclaves' })
  async getHolographicEnclaves() {
    this.logger.log('GET /api/v15/holographic-quantum-security-book8');
    return this.service.getHolographicEnclaves();
  }
}
