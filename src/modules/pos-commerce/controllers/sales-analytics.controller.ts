import { Controller, Get, UseGuards } from '@nestjs/common';
import { SalesAnalyticsService } from '../services/sales-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('sales/analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesAnalyticsController {
  constructor(private readonly analyticsService: SalesAnalyticsService) {}

  @Get('dashboard')
  @Permissions('pos:read')
  async getExecutiveDashboard() {
    return this.analyticsService.getExecutiveDashboard();
  }
}
