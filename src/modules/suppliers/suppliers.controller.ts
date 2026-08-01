import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePODto } from './dto/create-po.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @Permissions('read:suppliers')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return {
      success: true,
      data: await this.suppliersService.findAll(),
    };
  }

  @Get('orders')
  @Permissions('read:suppliers')
  @HttpCode(HttpStatus.OK)
  async findAllPurchaseOrders(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.suppliersService.findAllPurchaseOrders({ branchId }),
    };
  }

  @Get('orders/:id')
  @Permissions('read:suppliers')
  @HttpCode(HttpStatus.OK)
  async findOnePurchaseOrder(@Param('id') id: string) {
    return {
      success: true,
      data: await this.suppliersService.findOnePurchaseOrder(id),
    };
  }

  @Get(':id')
  @Permissions('read:suppliers')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.suppliersService.findOne(id),
    };
  }

  @Post()
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return {
      success: true,
      data: await this.suppliersService.create(createSupplierDto),
    };
  }

  @Post(':id/payment')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.CREATED)
  async recordPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('reference') reference?: string,
  ) {
    return {
      success: true,
      data: await this.suppliersService.recordPayment(id, amount, reference),
    };
  }

  @Post('orders')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.CREATED)
  async createPurchaseOrder(@Body() createPODto: CreatePODto) {
    return {
      success: true,
      data: await this.suppliersService.createPurchaseOrder(createPODto),
    };
  }

  @Patch('orders/:id/status')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.OK)
  async updatePurchaseOrderStatus(
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED',
    @Body('receivedItems')
    receivedItems?: { itemId: string; quantityReceived: number }[],
  ) {
    return {
      success: true,
      data: await this.suppliersService.updatePurchaseOrderStatus(
        id,
        status,
        receivedItems,
      ),
    };
  }

  @Patch('orders/:id/payment')
  @Permissions('write:suppliers')
  @HttpCode(HttpStatus.OK)
  async updatePOPaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: 'unpaid' | 'partially_paid' | 'paid',
  ) {
    return {
      success: true,
      data: await this.suppliersService.updatePOPaymentStatus(
        id,
        paymentStatus,
      ),
    };
  }
}
