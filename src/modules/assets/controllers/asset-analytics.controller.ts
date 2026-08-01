import { Controller, Get, UseGuards } from '@nestjs/common';
import { AssetAnalyticsService } from '../services/asset-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets/analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssetAnalyticsController {
  constructor(private readonly analyticsService: AssetAnalyticsService) {}

  @Get('dashboard')
  @Permissions('assets:read')
  async getExecutiveDashboard() {
    return this.analyticsService.getExecutiveDashboard();
  }
}
