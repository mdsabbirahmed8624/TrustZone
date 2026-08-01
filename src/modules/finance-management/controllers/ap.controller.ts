import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AccountsPayableService } from '../services/accounts-payable.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('finance/ap')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApController {
  constructor(private readonly apService: AccountsPayableService) {}

  @Post('invoices')
  @Permissions('finance:write')
  @HttpCode(HttpStatus.CREATED)
  async createVendorInvoice(
    @Body()
    body: {
      vendorName: string;
      totalAmount: number;
      dueDate: Date;
      invoiceNo?: string;
    },
  ) {
    return this.apService.createVendorInvoice(body);
  }

  @Post('invoices/:id/pay')
  @Permissions('finance:write')
  @HttpCode(HttpStatus.OK)
  async processPayment(
    @Param('id') invoiceId: string,
    @Body() body: { amount: number; paymentMode?: string },
  ) {
    return this.apService.processPayment(
      invoiceId,
      body.amount,
      body.paymentMode,
    );
  }
}
