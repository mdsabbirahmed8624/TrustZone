import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('hr/leaves')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeavesController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post('balance/init')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.OK)
  async initBalance(
    @Body()
    body: { userId?: string; leaveType?: string; yearlyEntitlement?: number },
    @Request() req: any,
  ) {
    return this.leaveService.initializeLeaveBalance(
      body.userId || req.user?.id,
      body.leaveType || 'ANNUAL',
      body.yearlyEntitlement || 14,
    );
  }

  @Post('request')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async submitLeaveRequest(
    @Body()
    body: { startDate: Date; endDate: Date; leaveType: string; reason: string },
    @Request() req: any,
  ) {
    return this.leaveService.submitLeaveRequest(
      req.user?.id,
      body.startDate,
      body.endDate,
      body.leaveType,
      body.reason,
    );
  }

  @Post('process')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.OK)
  async processLeaveRequest(
    @Body()
    body: {
      requestId: string;
      status: 'approved' | 'rejected';
      rejectionReason?: string;
    },
    @Request() req: any,
  ) {
    return this.leaveService.processLeaveRequest(
      body.requestId,
      body.status,
      req.user?.id,
      body.rejectionReason,
    );
  }
}
