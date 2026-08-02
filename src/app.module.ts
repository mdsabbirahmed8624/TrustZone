import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { CustomersModule } from './modules/customers/customers.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { FinanceModule } from './modules/finance/finance.module';
import { CrmModule } from './modules/crm/crm.module';
import { WarrantyModule } from './modules/warranty/warranty.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AutomationModule } from './modules/automation/automation.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TaskModule } from './modules/task/task.module';
import { ChatModule } from './modules/chat/chat.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { SearchModule } from './modules/search/search.module';
import { ExportModule } from './modules/export/export.module';
import { HrmsModule } from './modules/hrms/hrms.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { AIModule } from './modules/ai/ai.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { WorkflowAutomationModule } from './modules/workflow-automation/workflow-automation.module';
import { DocumentManagementModule } from './modules/document-management/document-management.module';
import { IamSecurityModule } from './modules/iam-security/iam-security.module';
import { SupportModule } from './modules/support/support.module';
import { AssetsModule } from './modules/assets/assets.module';
import { FinanceManagementModule } from './modules/finance-management/finance-management.module';
import { PosCommerceModule } from './modules/pos-commerce/pos-commerce.module';
import { FranchiseModule } from './modules/franchise/franchise.module';
import { EnterpriseBIModule } from './modules/enterprise-bi/enterprise-bi.module';
import { AutonomousAIModule } from './modules/autonomous-ai/autonomous-ai.module';
import { IamModule } from './modules/iam/iam.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { BranchesModule } from './modules/branches/branches.module';
import { UsersModule } from './modules/users/users.module';
import { HealthController } from './health/health.controller';

function validateEnvironment(config: Record<string, any>): Record<string, any> {
  const nodeEnv = config.NODE_ENV || process.env.NODE_ENV || 'development';
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`[ENV VALIDATION FAILED] Invalid NODE_ENV: ${nodeEnv}`);
  }

  const databaseUrl = config.DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl || typeof databaseUrl !== 'string') {
    throw new Error(
      '[ENV VALIDATION FAILED] DATABASE_URL environment variable is required.',
    );
  }

  const jwtSecret = config.JWT_SECRET_KEY || process.env.JWT_SECRET_KEY;
  if (!jwtSecret || typeof jwtSecret !== 'string') {
    throw new Error(
      '[ENV VALIDATION FAILED] JWT_SECRET_KEY environment variable is required.',
    );
  }

  const jwtRefreshSecret =
    config.JWT_REFRESH_SECRET_KEY || process.env.JWT_REFRESH_SECRET_KEY;
  if (!jwtRefreshSecret || typeof jwtRefreshSecret !== 'string') {
    throw new Error(
      '[ENV VALIDATION FAILED] JWT_REFRESH_SECRET_KEY environment variable is required.',
    );
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLER_TTL', 60000),
          limit: config.get<number>('THROTTLER_LIMIT', 60),
        },
      ],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    RolesModule,
    TicketsModule,
    CustomersModule,
    TechniciansModule,
    InventoryModule,
    SuppliersModule,
    FinanceManagementModule,
    FinanceModule,
    CrmModule,
    WarrantyModule,
    AnalyticsModule,
    AutomationModule,
    NotificationModule,
    TaskModule,
    ChatModule,
    AnnouncementModule,
    TimelineModule,
    CalendarModule,
    SearchModule,
    ExportModule,
    HrmsModule,
    MobileModule,
    AIModule,
    IntegrationsModule,
    WorkflowAutomationModule,
    DocumentManagementModule,
    IamSecurityModule,
    SupportModule,
    AssetsModule,
    PosCommerceModule,
    FranchiseModule,
    EnterpriseBIModule,
    AutonomousAIModule,
    IamModule,
    MarketingModule,
    BranchesModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
