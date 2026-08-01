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
  GlobalMultiCloudSovereignMeshBook1Service,
  RegisterMultiCloudMeshDto,
} from '../services/global-multicloud-mesh-book1.service';

@ApiTags('Phase 15 Book 1 — Global Multi-Cloud Sovereign Mesh')
@ApiBearerAuth()
@Controller('api/v15/global-multicloud-mesh-book1')
export class GlobalMultiCloudSovereignMeshBook1Controller {
  private readonly logger = new Logger(
    GlobalMultiCloudSovereignMeshBook1Controller.name,
  );

  constructor(
    private readonly service: GlobalMultiCloudSovereignMeshBook1Service,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register global multi-cloud sovereign mesh node network',
  })
  async registerMeshNode(@Body() dto: RegisterMultiCloudMeshDto) {
    this.logger.log(
      `POST /api/v15/global-multicloud-mesh-book1/register — ${dto.meshCode}`,
    );
    return this.service.registerMeshNode(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all global multi-cloud sovereign meshes' })
  async getMeshes() {
    this.logger.log('GET /api/v15/global-multicloud-mesh-book1');
    return this.service.getMeshes();
  }
}
