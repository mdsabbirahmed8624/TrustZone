import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './services/dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getSummary(
    @Query('branchId') branchId?: string,
    @CurrentUser() staff?: any,
  ) {
    const enforcedBranchId =
      staff?.role === 'Branch Manager' ? staff.branchId : branchId;

    return {
      success: true,
      data: await this.dashboardService.getExecutiveDashboard(enforcedBranchId),
    };
  }
}
