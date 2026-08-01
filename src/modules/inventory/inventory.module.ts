import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { WarehouseService } from './services/warehouse.service';
import { ReservationService } from './services/inventory-reservation.service';
import { PurchaseReceivingService } from './services/purchase-receiving.service';
import { InventoryAlertService } from './services/inventory-alert-dashboard.service';
import { InventorySyncService } from './services/inventory-sync.service';
import { TechnicianInventoryService } from './services/technician-inventory.service';
import { InventoryAuditService } from './services/inventory-audit.service';
import { RoboticsDispatchBook1Service } from './services/robotics-dispatch-book1.service';
import { RoboticsDispatchBook1Controller } from './controllers/robotics-dispatch-book1.controller';
import { SupplyChainPredictorBook4Service } from './services/supply-chain-predictor-book4.service';
import { SupplyChainPredictorBook4Controller } from './controllers/supply-chain-predictor-book4.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    SupplyChainPredictorBook4Controller,
    RoboticsDispatchBook1Controller,
    InventoryController,
  ],
  providers: [
    InventoryService,
    WarehouseService,
    ReservationService,
    PurchaseReceivingService,
    InventoryAlertService,
    InventorySyncService,
    TechnicianInventoryService,
    InventoryAuditService,
    RoboticsDispatchBook1Service,
    SupplyChainPredictorBook4Service,
  ],
  exports: [
    InventoryService,
    WarehouseService,
    ReservationService,
    PurchaseReceivingService,
    InventoryAlertService,
    InventorySyncService,
    TechnicianInventoryService,
    InventoryAuditService,
    RoboticsDispatchBook1Service,
    SupplyChainPredictorBook4Service,
  ],
})
export class InventoryModule {}
