import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('giftcards')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GiftcardsController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async createGiftCard(
    @Body()
    body: {
      cardNumber: string;
      pinCode: string;
      initialBalance: number;
      expiryDays?: number;
    },
  ) {
    return this.couponService.createGiftCard(
      body.cardNumber,
      body.pinCode,
      body.initialBalance,
      body.expiryDays,
    );
  }

  @Post('redeem')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.OK)
  async redeemGiftCard(
    @Body()
    body: {
      cardNumber: string;
      pinCode: string;
      amountToRedeem: number;
    },
  ) {
    return this.couponService.redeemGiftCard(
      body.cardNumber,
      body.pinCode,
      body.amountToRedeem,
    );
  }
}
