import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { AssetService } from './services/asset.service';
import { AssetCategoryService } from './services/asset-category.service';
import { AssignmentService } from './services/assignment.service';
import { TransferService } from './services/transfer.service';
import { MaintenanceService } from './services/maintenance.service';
import { InspectionService } from './services/inspection.service';
import { DepreciationService } from './services/depreciation.service';
import { DisposalService } from './services/disposal.service';
import { WorkOrderService } from './services/work-order.service';
import { AssetAnalyticsService } from './services/asset-analytics.service';

// Controllers
import { AssetsController } from './controllers/assets.controller';
import { CategoriesController } from './controllers/categories.controller';
import { AssignmentsController } from './controllers/assignments.controller';
import { TransfersController } from './controllers/transfers.controller';
import { MaintenanceController } from './controllers/maintenance.controller';
import { InspectionsController } from './controllers/inspections.controller';
import { DepreciationController } from './controllers/depreciation.controller';
import { DisposalController } from './controllers/disposal.controller';
import { AssetAnalyticsController } from './controllers/asset-analytics.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    AssetsController,
    CategoriesController,
    AssignmentsController,
    TransfersController,
    MaintenanceController,
    InspectionsController,
    DepreciationController,
    DisposalController,
    AssetAnalyticsController,
  ],
  providers: [
    AssetService,
    AssetCategoryService,
    AssignmentService,
    TransferService,
    MaintenanceService,
    InspectionService,
    DepreciationService,
    DisposalService,
    WorkOrderService,
    AssetAnalyticsService,
  ],
  exports: [
    AssetService,
    AssetCategoryService,
    AssignmentService,
    TransferService,
    MaintenanceService,
    InspectionService,
    DepreciationService,
    DisposalService,
    WorkOrderService,
    AssetAnalyticsService,
  ],
})
export class AssetsModule {}
