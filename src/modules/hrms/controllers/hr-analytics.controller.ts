import { Controller, Get, UseGuards } from '@nestjs/common';
import { HRAnalyticsService } from '../services/hr-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('hr/analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrAnalyticsController {
  constructor(private readonly analyticsService: HRAnalyticsService) {}

  @Get('dashboard')
  @Permissions('hr:read')
  async getExecutiveDashboard() {
    return this.analyticsService.getExecutiveDashboard();
  }
}
