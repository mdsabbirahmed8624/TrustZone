import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AccountsReceivableService } from '../services/accounts-receivable.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('finance/ar')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArController {
  constructor(private readonly arService: AccountsReceivableService) {}

  @Post('invoices')
  @Permissions('finance:write')
  @HttpCode(HttpStatus.CREATED)
  async createCustomerInvoice(
    @Body()
    body: {
      customerName: string;
      totalAmount: number;
      dueDate: Date;
      invoiceNo?: string;
    },
  ) {
    return this.arService.createCustomerInvoice(body);
  }

  @Post('invoices/:id/receipt')
  @Permissions('finance:write')
  @HttpCode(HttpStatus.OK)
  async recordReceipt(
    @Param('id') invoiceId: string,
    @Body() body: { amount: number; paymentMode?: string },
  ) {
    return this.arService.recordReceipt(
      invoiceId,
      body.amount,
      body.paymentMode,
    );
  }
}
