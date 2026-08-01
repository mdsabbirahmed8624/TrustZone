import { Controller, Get, UseGuards } from '@nestjs/common';
import { CRMAnalyticsService } from '../services/crm-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('crm/analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CrmAnalyticsController {
  constructor(private readonly analyticsService: CRMAnalyticsService) {}

  @Get('dashboard')
  @Permissions('crm:read')
  async getDashboardAnalytics() {
    return this.analyticsService.getDashboardAnalytics();
  }
}
