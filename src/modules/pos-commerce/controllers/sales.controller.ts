import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BillingService } from '../services/billing.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async processSale(
    @Body()
    body: {
      shiftId?: string;
      customerName?: string;
      items: {
        sku: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
      }[];
      payments: {
        paymentMethod: string;
        amount: number;
        referenceNo?: string;
      }[];
      couponCode?: string;
    },
  ) {
    return this.billingService.processSale(body);
  }
}
