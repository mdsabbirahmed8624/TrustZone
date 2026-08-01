import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { WorkflowEngineService } from '../services/workflow-engine.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('workflows')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkflowsController {
  constructor(private readonly workflowService: WorkflowEngineService) {}

  @Post('definitions')
  @Permissions('workflows:write')
  @HttpCode(HttpStatus.CREATED)
  async createDefinition(
    @Body()
    body: {
      name: string;
      module: string;
      triggerRule?: any;
      steps?: any;
    },
  ) {
    return this.workflowService.createDefinition(
      body.name,
      body.module,
      body.triggerRule,
      body.steps,
    );
  }

  @Post(':definitionId/publish')
  @Permissions('workflows:write')
  @HttpCode(HttpStatus.OK)
  async publishVersion(
    @Param('definitionId') definitionId: string,
    @Body() body: { versionNumber: number; graphDefinition?: any },
  ) {
    return this.workflowService.publishVersion(
      definitionId,
      body.versionNumber,
      body.graphDefinition,
    );
  }

  @Post(':definitionId/execute')
  @Permissions('workflows:write')
  @HttpCode(HttpStatus.OK)
  async executeWorkflow(
    @Param('definitionId') definitionId: string,
    @Body()
    body: {
      triggerEvent: string;
      recordId?: string;
      variables?: Record<string, any>;
    },
    @Request() req: any,
  ) {
    return this.workflowService.executeWorkflow(
      definitionId,
      body.triggerEvent,
      body.recordId,
      req.user?.id,
      body.variables || {},
    );
  }

  @Get('executions/:id')
  @Permissions('workflows:read')
  async getExecutionHistory(@Param('id') id: string) {
    return this.workflowService.getExecutionHistory(id);
  }
}
