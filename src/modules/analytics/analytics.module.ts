import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { DashboardController } from './dashboard.controller';
import { ReportsController } from './reports.controller';
import { KPIController } from './kpi.controller';
import { ForecastController } from './forecast.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { DashboardService } from './services/dashboard.service';
import { KPIEngineService } from './services/kpi-engine.service';
import { BusinessIntelligenceService } from './services/business-intelligence.service';
import { ForecastService } from './services/forecast.service';
import { ReportService } from './services/report.service';
import { AlertAnalyticsService } from './services/alert-analytics.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AnalyticsController,
    DashboardController,
    ReportsController,
    KPIController,
    ForecastController,
  ],
  providers: [
    AnalyticsService,
    DashboardService,
    KPIEngineService,
    BusinessIntelligenceService,
    ForecastService,
    ReportService,
    AlertAnalyticsService,
  ],
  exports: [
    AnalyticsService,
    DashboardService,
    KPIEngineService,
    BusinessIntelligenceService,
    ForecastService,
    ReportService,
    AlertAnalyticsService,
  ],
})
export class AnalyticsModule {}
