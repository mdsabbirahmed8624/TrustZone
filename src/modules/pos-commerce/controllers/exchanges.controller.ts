import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExchangeService } from '../services/exchange.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('exchanges')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExchangesController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post()
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async processExchange(
    @Body()
    body: {
      saleId: string;
      returnedSku: string;
      replacementSku: string;
      priceDifference: number;
    },
  ) {
    return this.exchangeService.processExchange(body);
  }
}
