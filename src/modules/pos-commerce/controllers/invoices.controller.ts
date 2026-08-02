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
import { InvoiceService } from '../services/invoice.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('dashboard/stats')
  @Permissions('pos:read')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.invoiceService.getDashboardStats(branchId),
    };
  }

  @Post('generate/:saleId')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async generateRetailInvoice(@Param('saleId') saleId: string) {
    return this.invoiceService.generateFromTicket(saleId);
  }

  @Post('from-ticket/:ticketId')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async generateFromTicket(@Param('ticketId') ticketId: string) {
    return {
      success: true,
      data: await this.invoiceService.generateFromTicket(ticketId),
    };
  }

  @Post('create')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async createInvoice(
    @Body() dto: { customerName: string; subtotal: number; taxAmount?: number; discountAmount?: number; items: any[] },
  ) {
    return {
      success: true,
      data: await this.invoiceService.createInvoice(dto),
    };
  }

  @Get()
  @Permissions('pos:read')
  async getInvoices(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return {
      success: true,
      data: await this.invoiceService.listInvoices({ search, status, branchId, page, limit }),
    };
  }

  @Get(':id')
  @Permissions('pos:read')
  async getInvoice(@Param('id') id: string) {
    return {
      success: true,
      data: await this.invoiceService.getInvoice(id),
    };
  }

  @Post(':id/payment')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async recordPayment(
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod: string,
    @Body('amount') amount: number,
    @Body('reference') reference?: string,
  ) {
    return await this.invoiceService.recordPayment(id, paymentMethod, amount, reference);
  }

  @Post(':id/refund')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.OK)
  async processRefund(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('reason') reason?: string,
  ) {
    return await this.invoiceService.processRefund(id, amount, reason);
  }
}
