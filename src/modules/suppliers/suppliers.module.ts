import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { ProcurementController } from './procurement.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FinanceModule } from '../finance/finance.module';

import { ProcurementRequestService } from './services/procurement-request.service';
import { PurchaseApprovalEngineService } from './services/purchase-approval-engine.service';
import { SupplierPerformanceService } from './services/supplier-performance.service';
import { ProcurementDashboardService } from './services/procurement-dashboard.service';
import { ProcurementValidationService } from './services/procurement-validation.service';

@Module({
  imports: [PrismaModule, FinanceModule],
  controllers: [SuppliersController, ProcurementController],
  providers: [
    SuppliersService,
    ProcurementRequestService,
    PurchaseApprovalEngineService,
    SupplierPerformanceService,
    ProcurementDashboardService,
    ProcurementValidationService,
  ],
  exports: [
    SuppliersService,
    ProcurementRequestService,
    PurchaseApprovalEngineService,
    SupplierPerformanceService,
    ProcurementDashboardService,
    ProcurementValidationService,
  ],
})
export class SuppliersModule {}
