import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MobileAuthController } from './controllers/v1/mobile-auth.controller';
import { MobileCustomerController } from './controllers/v1/mobile-customer.controller';
import { MobileDashboardController } from './controllers/v1/mobile-dashboard.controller';
import { MobileBookingController } from './controllers/v1/mobile-booking.controller';
import { MobileTrackingController } from './controllers/v1/mobile-tracking.controller';
import { MobileProfileController } from './controllers/v1/mobile-profile.controller';
import { MobileNotificationsController } from './controllers/v1/mobile-notifications.controller';
import { MobileDeviceController } from './controllers/v1/mobile-device.controller';
import { MobileAuthV2Controller } from './controllers/v2/mobile-auth.controller';
import { MobileRequestIdMiddleware } from './middleware/mobile-request-id.middleware';
import { AuthModule } from '../auth/auth.module';
import { CustomersModule } from '../customers/customers.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TicketsModule } from '../tickets/tickets.module';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

import { MobileDeviceMgmtController } from './controllers/v1/mobile-device-mgmt.controller';
import { SessionCleanupScheduler } from './schedulers/session-cleanup.scheduler';
import { MobileDeviceGuard } from './guards/mobile-device.guard';
import { MobileRbacGuard } from './guards/mobile-rbac.guard';

import { MobileDevicePushController } from './controllers/v1/mobile-device-push.controller';
import { RealtimeGateway } from './gateways/realtime.gateway';
import { TemplateEngineService } from './services/template-engine.service';
import { NotificationOrchestratorService } from './services/notification-orchestrator.service';
import {
  FcmPushProvider,
  ApnsPushProvider,
  HuaweiPushProvider,
  MockPushProvider,
} from './providers/push-providers';
import { PushProviderFactory } from './providers/push-provider.factory';

import { AttachmentStorageService } from './services/attachment-storage.service';
import { RedisLockService } from './services/redis-lock.service';
import { MonitoringDashboardService } from './services/monitoring-dashboard.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { AiNotificationGeneratorService } from './services/ai-generator.service';
import { OtelService } from './services/otel.service';
import { EventBusService } from './services/event-bus.service';

import { MobileSyncController } from './controllers/v1/mobile-sync.controller';
import { MobileSecurityPolicyController } from './controllers/v1/mobile-security-policy.controller';
import { MobileSecurityGuard } from './guards/mobile-security.guard';
import { SyncEngineService } from './services/sync-engine.service';
import { ConflictResolverService } from './services/conflict-resolver.service';

import { MobileDiagnosticsController } from './controllers/v1/mobile-diagnostics.controller';
import { MobileTelemetryController } from './controllers/v1/mobile-telemetry.controller';
import { MobileWorkOrdersController } from './controllers/v1/mobile-work-orders.controller';
import { DiagnosticsService } from './services/diagnostics.service';
import { TelemetryTrackerService } from './services/telemetry-tracker.service';
import { PdfReportService } from './services/pdf-report.service';
import { WorkOrderSignatureService } from './services/work-order-signature.service';
import { MobileBillingService } from './services/mobile-billing.service';

@Module({
  imports: [
    AuthModule,
    CustomersModule,
    AnalyticsModule,
    TicketsModule,
    NotificationModule,
    PrismaModule,
    RedisModule,
  ],
  controllers: [
    MobileAuthController,
    MobileCustomerController,
    MobileDashboardController,
    MobileBookingController,
    MobileTrackingController,
    MobileProfileController,
    MobileNotificationsController,
    MobileDeviceController,
    MobileAuthV2Controller,
    MobileDeviceMgmtController,
    MobileDevicePushController,
    MobileSyncController,
    MobileSecurityPolicyController,
    MobileDiagnosticsController,
    MobileTelemetryController,
    MobileWorkOrdersController,
  ],
  providers: [
    SessionCleanupScheduler,
    MobileDeviceGuard,
    MobileRbacGuard,
    RealtimeGateway,
    TemplateEngineService,
    NotificationOrchestratorService,
    FcmPushProvider,
    ApnsPushProvider,
    HuaweiPushProvider,
    MockPushProvider,
    PushProviderFactory,
    AttachmentStorageService,
    RedisLockService,
    MonitoringDashboardService,
    NotificationSchedulerService,
    AiNotificationGeneratorService,
    OtelService,
    EventBusService,
    MobileSecurityGuard,
    SyncEngineService,
    ConflictResolverService,
    DiagnosticsService,
    TelemetryTrackerService,
    PdfReportService,
    WorkOrderSignatureService,
    MobileBillingService,
  ],
  exports: [
    MobileDeviceGuard,
    MobileRbacGuard,
    RealtimeGateway,
    NotificationOrchestratorService,
    AttachmentStorageService,
    RedisLockService,
    MonitoringDashboardService,
    NotificationSchedulerService,
    AiNotificationGeneratorService,
    OtelService,
    EventBusService,
    MobileSecurityGuard,
    SyncEngineService,
    ConflictResolverService,
    DiagnosticsService,
    TelemetryTrackerService,
    PdfReportService,
    WorkOrderSignatureService,
    MobileBillingService,
  ],
})
export class MobileModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MobileRequestIdMiddleware)
      .forRoutes('mobile/*', 'api/v2/mobile/*');
  }
}
