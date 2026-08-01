import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  QuantumMeshBook1Service,
  RegisterMeshKeyDto,
} from '../services/quantum-mesh-book1.service';

@ApiTags('Quantum-Resistant Mesh Key Governance')
@ApiBearerAuth()
@Controller('iam')
export class QuantumMeshBook1Controller {
  constructor(private readonly book1Service: QuantumMeshBook1Service) {}

  @Post('quantum-mesh-keys/register')
  @ApiOperation({
    summary: 'Register quantum-resistant zero-trust encryption mesh key',
  })
  async registerMeshKey(@Body() dto: RegisterMeshKeyDto) {
    return this.book1Service.registerMeshKey(dto);
  }

  @Get('quantum-mesh-keys')
  @ApiOperation({ summary: 'List quantum-resistant zero-trust mesh keys' })
  async getMeshKeys() {
    return this.book1Service.getMeshKeys();
  }
}
