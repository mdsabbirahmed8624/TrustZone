import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import {
  ProcurementRequestService,
  CreateRequestDto,
} from './services/procurement-request.service';
import {
  PurchaseApprovalEngineService,
  ApprovePoDto,
} from './services/purchase-approval-engine.service';
import { SupplierPerformanceService } from './services/supplier-performance.service';
import { ProcurementDashboardService } from './services/procurement-dashboard.service';
import {
  ProcurementValidationService,
  GoodsReceiptItemDto,
} from './services/procurement-validation.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('procurement')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProcurementController {
  constructor(
    private readonly requestService: ProcurementRequestService,
    private readonly approvalService: PurchaseApprovalEngineService,
    private readonly performanceService: SupplierPerformanceService,
    private readonly dashboardService: ProcurementDashboardService,
    private readonly validationService: ProcurementValidationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('requests')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @Body() dto: Omit<CreateRequestDto, 'requestedById'>,
    @CurrentUser('id') userId: string,
  ) {
    return {
      success: true,
      data: await this.requestService.createRequest({
        ...dto,
        requestedById: userId,
      }),
    };
  }

  @Get('requests')
  @Permissions('read:suppliers')
  @HttpCode(HttpStatus.OK)
  async getRequests(
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return {
      success: true,
      data: await this.requestService.getRequests({
        status,
        branchId,
        search,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      }),
    };
  }

  @Post('requests/:id/approve')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.OK)
  async approveRequest(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('role') role: 'MANAGER' | 'PROCUREMENT' | 'FINANCE',
  ) {
    return {
      success: true,
      data: await this.requestService.approveRequest(id, userId, role),
    };
  }

  @Post('requests/:id/reject')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.OK)
  async rejectRequest(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason: string,
  ) {
    return {
      success: true,
      data: await this.requestService.rejectRequest(id, userId, reason),
    };
  }

  @Post('orders/:id/approve')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.OK)
  async approvePurchaseOrder(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('level') level: number,
    @Body('comments') comments?: string,
  ) {
    return {
      success: true,
      data: await this.approvalService.approvePurchaseOrder({
        poId: id,
        approverId: userId,
        level,
        comments,
      }),
    };
  }

  @Post('orders/:id/reject')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.OK)
  async rejectPurchaseOrder(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('comments') comments: string,
  ) {
    return {
      success: true,
      data: await this.approvalService.rejectPurchaseOrder(
        id,
        userId,
        comments,
      ),
    };
  }

  @Post('orders/:id/receive')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.OK)
  async receiveGoods(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('warehouseId') warehouseId: string,
    @Body('items') items: GoodsReceiptItemDto[],
  ) {
    return {
      success: true,
      data: await this.validationService.validateAndReceiveGoods(
        id,
        warehouseId,
        userId,
        items,
      ),
    };
  }

  @Get('dashboard')
  @Permissions('read:suppliers')
  @HttpCode(HttpStatus.OK)
  async getDashboardSummary() {
    return {
      success: true,
      data: await this.dashboardService.getDashboardSummary(),
    };
  }

  @Get('suppliers/:id/performance')
  @Permissions('read:suppliers')
  @HttpCode(HttpStatus.OK)
  async getSupplierPerformance(@Param('id') id: string) {
    return {
      success: true,
      data: await this.performanceService.getSupplierPerformance(id),
    };
  }

  @Post('suppliers/:id/documents')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.CREATED)
  async uploadSupplierDocument(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('fileUrl') fileUrl: string,
    @Body('documentType') documentType: string,
  ) {
    const doc = await this.prisma.supplierDocument.create({
      data: {
        supplierId: id,
        name,
        fileUrl,
        documentType,
      },
    });

    return {
      success: true,
      data: doc,
    };
  }
}
