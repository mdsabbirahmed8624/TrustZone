import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupportAnalyticsService } from '../services/support-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('support/analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SupportAnalyticsController {
  constructor(private readonly analyticsService: SupportAnalyticsService) {}

  @Get('dashboard')
  @Permissions('support:read')
  async getExecutiveDashboard() {
    return this.analyticsService.getExecutiveDashboard();
  }
}
