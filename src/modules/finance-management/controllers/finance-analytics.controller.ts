import { Controller, Get, UseGuards } from '@nestjs/common';
import { FinanceAnalyticsService } from '../services/finance-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('finance/analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceAnalyticsController {
  constructor(private readonly analyticsService: FinanceAnalyticsService) {}

  @Get('dashboard')
  @Permissions('finance:read')
  async getExecutiveDashboard() {
    return this.analyticsService.getExecutiveDashboard();
  }
}
