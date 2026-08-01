import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuotationService } from '../services/quotation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('quotations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotationsController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post()
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async createQuotation(
    @Body()
    body: {
      customerName: string;
      validDays?: number;
      items: { productName: string; quantity: number; unitPrice: number }[];
    },
  ) {
    return this.quotationService.createQuotation(body);
  }
}
