import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApprovalService } from '../services/approval.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('approvals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApprovalsController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post('submit')
  @Permissions('approvals:write')
  @HttpCode(HttpStatus.CREATED)
  async submitRequest(
    @Body()
    body: {
      resourceModule: string;
      resourceId: string;
      approvalType?: 'SINGLE' | 'MULTI_LEVEL' | 'PARALLEL';
      approverId?: string;
      totalSteps?: number;
      timeoutHours?: number;
    },
    @Request() req: any,
  ) {
    return this.approvalService.submitRequest(
      body.resourceModule,
      body.resourceId,
      body.approvalType || 'SINGLE',
      req.user?.id,
      body.approverId,
      body.totalSteps || 1,
      body.timeoutHours || 24,
    );
  }

  @Post(':id/decision')
  @Permissions('approvals:write')
  @HttpCode(HttpStatus.OK)
  async processDecision(
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVE' | 'REJECT'; comments?: string },
    @Request() req: any,
  ) {
    return this.approvalService.processDecision(
      id,
      body.decision,
      req.user?.id,
      req.user?.firstName || 'Approver',
      body.comments,
    );
  }

  @Get('pending')
  @Permissions('approvals:read')
  async getPendingRequests(@Query('approverId') approverId?: string) {
    return this.approvalService.getPendingRequests(approverId);
  }
}
