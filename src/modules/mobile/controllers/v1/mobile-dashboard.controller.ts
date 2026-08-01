import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from '../../../analytics/analytics.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';

@ApiTags('Mobile API')
@ApiBearerAuth()
@Controller('mobile/dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileDashboardController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Permissions('read:dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve dashboard metrics and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboard(
    @Query('dateRange') dateRange?: string,
    @Query('customStart') customStart?: string,
    @Query('customEnd') customEnd?: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() user?: any,
  ) {
    // If the user has a specific branch restricted to them, enforce it
    const enforcedBranchId = user?.branchId || branchId;

    const data = await this.analyticsService.getDashboardStats({
      dateRange,
      customStart,
      customEnd,
      branchId: enforcedBranchId,
    });

    return {
      message: 'Dashboard metrics retrieved successfully.',
      data,
    };
  }
}
