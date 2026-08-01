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
  ZeroKnowledgePrivacyProtectionMeshBook9Service,
  RegisterZkPrivacyMeshDto,
} from '../services/zk-privacy-neuromorphic-book9.service';

@ApiTags('Phase 15 Book 9 — Zero-Knowledge Privacy Protection Mesh')
@ApiBearerAuth()
@Controller('api/v15/zk-privacy-neuromorphic-book9')
export class ZeroKnowledgePrivacyProtectionMeshBook9Controller {
  private readonly logger = new Logger(
    ZeroKnowledgePrivacyProtectionMeshBook9Controller.name,
  );

  constructor(
    private readonly service: ZeroKnowledgePrivacyProtectionMeshBook9Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register zero-knowledge privacy protection mesh' })
  async registerZkPrivacyMesh(@Body() dto: RegisterZkPrivacyMeshDto) {
    this.logger.log(
      `POST /api/v15/zk-privacy-neuromorphic-book9/register — ${dto.zkPrivacyMeshCode}`,
    );
    return this.service.registerZkPrivacyMesh(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all zero-knowledge privacy protection meshes',
  })
  async getZkPrivacyMeshes() {
    this.logger.log('GET /api/v15/zk-privacy-neuromorphic-book9');
    return this.service.getZkPrivacyMeshes();
  }
}
