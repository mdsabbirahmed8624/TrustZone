import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreatePartDto } from './dto/create-part.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

import {
  WarehouseService,
  CreateWarehouseDto,
} from './services/warehouse.service';
import {
  ReservationService,
  CreateReservationDto,
} from './services/inventory-reservation.service';
import {
  PurchaseReceivingService,
  ReceivePurchaseDto,
} from './services/purchase-receiving.service';
import { InventoryAlertService } from './services/inventory-alert-dashboard.service';
import {
  InventorySyncService,
  SyncStep,
} from './services/inventory-sync.service';
import { TechnicianInventoryService } from './services/technician-inventory.service';
import { InventoryAuditService } from './services/inventory-audit.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly warehouseService: WarehouseService,
    private readonly reservationService: ReservationService,
    private readonly receivingService: PurchaseReceivingService,
    private readonly alertService: InventoryAlertService,
    private readonly syncService: InventorySyncService,
    private readonly techInventoryService: TechnicianInventoryService,
    private readonly auditService: InventoryAuditService,
  ) {}

  @Get('parts')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async findAllParts(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('branchId') branchId?: string,
  ) {
    return {
      success: true,
      data: await this.inventoryService.findAllParts({
        search,
        category,
        brand,
        branchId,
      }),
    };
  }

  @Get('parts/:id')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async findOnePart(@Param('id') id: string) {
    return {
      success: true,
      data: await this.inventoryService.findOnePart(id),
    };
  }

  @Post('parts')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.CREATED)
  async createPart(@Body() createPartDto: CreatePartDto) {
    return {
      success: true,
      data: await this.inventoryService.createPart(createPartDto),
    };
  }

  @Post('parts/:id/adjust')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.OK)
  async adjustStock(
    @Param('id') id: string,
    @Body() adjustStockDto: AdjustStockDto,
  ) {
    return {
      success: true,
      data: await this.inventoryService.adjustStock(id, adjustStockDto),
    };
  }

  @Post('parts/:id/transfer')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.CREATED)
  async createTransfer(
    @Param('id') id: string,
    @Body() createTransferDto: CreateTransferDto,
  ) {
    return {
      success: true,
      data: await this.inventoryService.createTransfer(id, createTransferDto),
    };
  }

  @Patch('transfers/:transferId')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.OK)
  async executeTransferStatus(
    @Param('transferId') transferId: string,
    @Body('status') status: 'TRANSFERRED' | 'CANCELLED',
  ) {
    return {
      success: true,
      data: await this.inventoryService.executeTransferStatus(
        transferId,
        status,
      ),
    };
  }

  @Get('movements')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async findAllMovements() {
    return {
      success: true,
      data: await this.inventoryService.findAllMovements(),
    };
  }

  @Get('transfers')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async findAllTransfers() {
    return {
      success: true,
      data: await this.inventoryService.findAllTransfers(),
    };
  }

  // ==========================================
  // Book 7: Warehouses, Reservations & Syncs
  // ==========================================

  @Post('warehouses')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.CREATED)
  async createWarehouse(@Body() dto: CreateWarehouseDto) {
    return {
      success: true,
      data: await this.warehouseService.createWarehouse(dto),
    };
  }

  @Get('warehouses')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async getWarehouses() {
    return {
      success: true,
      data: await this.warehouseService.getWarehouses(),
    };
  }

  @Get('warehouses/:id/summary')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async getWarehouseSummary(@Param('id') id: string) {
    return {
      success: true,
      data: await this.warehouseService.getWarehouseSummary(id),
    };
  }

  @Post('reservations')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.CREATED)
  async reserveParts(@Body() dto: CreateReservationDto) {
    return {
      success: true,
      data: await this.reservationService.reserveParts(dto),
    };
  }

  @Delete('reservations/:id')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.OK)
  async releaseReservation(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return {
      success: true,
      data: await this.reservationService.releaseReservation(id, userId),
    };
  }

  @Post('reservations/:id/consume')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.OK)
  async consumeReservedParts(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return {
      success: true,
      data: await this.reservationService.consumeReservedParts(id, userId),
    };
  }

  @Post('purchases/receive')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.OK)
  async receivePurchase(@Body() dto: ReceivePurchaseDto) {
    return {
      success: true,
      data: await this.receivingService.receivePurchaseOrder(dto),
    };
  }

  @Get('technician/:id')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async getTechnicianStock(@Param('id') id: string) {
    return {
      success: true,
      data: await this.techInventoryService.getTechnicianStock(id),
    };
  }

  @Post('sync')
  @Permissions('write:inventory')
  @HttpCode(HttpStatus.OK)
  async syncOfflineMovements(@Body('steps') steps: SyncStep[]) {
    return {
      success: true,
      data: await this.syncService.syncOfflineMovements(steps),
    };
  }

  @Get('alerts/low-stock')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async getLowStockAlerts() {
    await this.alertService.runAlertSweeper();
    return {
      success: true,
      data: await this.alertService.getReorderSuggestions(),
    };
  }

  @Get('dashboard/metrics')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async getDashboardMetrics() {
    return {
      success: true,
      data: await this.alertService.getGlobalInventoryMetrics(),
    };
  }

  @Get('audit')
  @Permissions('read:inventory')
  @HttpCode(HttpStatus.OK)
  async getAuditLogs() {
    return {
      success: true,
      data: await this.auditService.getAuditLogs(),
    };
  }
}
