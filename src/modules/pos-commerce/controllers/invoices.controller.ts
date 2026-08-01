import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('generate/:saleId')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async generateRetailInvoice(@Param('saleId') saleId: string) {
    return this.invoiceService.generateRetailInvoice(saleId);
  }

  @Get()
  @Permissions('pos:read')
  async getInvoices() {
    return this.invoiceService.getInvoices();
  }
}
