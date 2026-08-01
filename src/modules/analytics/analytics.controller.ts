import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getDashboard(
    @Query('dateRange') dateRange?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() staff?: any,
  ) {
    // If user is a Branch Manager, restrict branchId filter to their own branch
    const enforcedBranchId =
      staff?.role?.name === 'Branch Manager' ? staff.branchId : branchId;

    const data = await this.analyticsService.getDashboardStats({
      dateRange,
      customStart,
      customEnd,
      branchId: enforcedBranchId,
    });

    // Write audit log for dashboard viewing with filters
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    await this.analyticsService.writeAuditLog(
      'VIEW_DASHBOARD',
      `User viewed dashboard metrics with filter dateRange=${dateRange || 'default'}`,
      staff?.id,
    );

    return {
      success: true,
      data,
    };
  }

  @Get('drilldown')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getDrillDown(
    @Query('type') type: string,
    @Query('dateRange') dateRange?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() staff?: any,
  ) {
    const enforcedBranchId =
      staff?.role?.name === 'Branch Manager' ? staff.branchId : branchId;

    const data = await this.analyticsService.getDrillDownDetails(type, {
      dateRange,
      customStart,
      customEnd,
      branchId: enforcedBranchId,
    });

    return {
      success: true,
      data,
    };
  }

  @Get('leaderboard')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getLeaderboard(
    @Query('branchId') branchId?: string,
    @CurrentUser() staff?: any,
  ) {
    const enforcedBranchId =
      staff?.role?.name === 'Branch Manager' ? staff.branchId : branchId;
    const data = await this.analyticsService.getTechnicianLeaderboard({
      branchId: enforcedBranchId,
    });

    return {
      success: true,
      data,
    };
  }

  @Get('inventory-intelligence')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getInventoryIntelligence(
    @Query('branchId') branchId?: string,
    @CurrentUser() staff?: any,
  ) {
    const enforcedBranchId =
      staff?.role?.name === 'Branch Manager' ? staff.branchId : branchId;
    const data = await this.analyticsService.getInventoryIntelligence({
      branchId: enforcedBranchId,
    });

    return {
      success: true,
      data,
    };
  }

  @Get('forecast')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getForecast(
    @Query('type') type: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() staff?: any,
  ) {
    const enforcedBranchId =
      staff?.role?.name === 'Branch Manager' ? staff.branchId : branchId;
    const data = await this.analyticsService.getTrendsForecast(type, {
      branchId: enforcedBranchId,
    });

    return {
      success: true,
      data,
    };
  }

  @Get('reports')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getDetailedReports(
    @Query('reportType') reportType: string,
    @Query('dateRange') dateRange?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() staff?: any,
  ) {
    const enforcedBranchId =
      staff?.role?.name === 'Branch Manager' ? staff.branchId : branchId;
    const data = await this.analyticsService.getDetailedReports(reportType, {
      dateRange,
      customStart,
      customEnd,
      branchId: enforcedBranchId,
    });

    return {
      success: true,
      data,
    };
  }

  @Post('log-export')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.CREATED)
  async logExport(
    @Body('exportType') exportType: string,
    @Body('reportName') reportName: string,
    @CurrentUser() staff?: any,
  ) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    await this.analyticsService.writeAuditLog(
      'EXPORT_REPORT',
      `User exported report "${reportName}" as format "${exportType}"`,
      staff?.id,
    );

    return {
      success: true,
    };
  }
}
