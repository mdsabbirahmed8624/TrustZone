import { Module, forwardRef } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { SchedulerService } from './scheduler.service';
import { WorkflowService } from './workflow.service';
import { AutomationController } from './automation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { WarrantyModule } from '../warranty/warranty.module';
import { FinanceModule } from '../finance/finance.module';
import { CrmModule } from '../crm/crm.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    forwardRef(() => WarrantyModule),
    forwardRef(() => FinanceModule),
    forwardRef(() => CrmModule),
    forwardRef(() => AnalyticsModule),
    forwardRef(() => InventoryModule),
  ],
  controllers: [AutomationController],
  providers: [AutomationService, SchedulerService, WorkflowService],
  exports: [AutomationService, SchedulerService, WorkflowService],
})
export class AutomationModule {}
