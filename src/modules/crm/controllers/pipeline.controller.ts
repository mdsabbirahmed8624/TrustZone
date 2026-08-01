import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PipelineService } from '../services/pipeline.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('crm/pipeline')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get('kanban')
  @Permissions('crm:read')
  async getKanbanBoard(@Query('pipelineId') pipelineId?: string) {
    return this.pipelineService.getKanbanBoard(pipelineId);
  }

  @Post()
  @Permissions('crm:write')
  @HttpCode(HttpStatus.CREATED)
  async createPipeline(
    @Body()
    body: {
      name: string;
      stages: { name: string; probability: number }[];
      description?: string;
    },
  ) {
    return this.pipelineService.createPipeline(
      body.name,
      body.stages,
      body.description,
    );
  }
}
