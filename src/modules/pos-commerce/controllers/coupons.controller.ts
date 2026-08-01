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

@Controller('coupons')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CouponsController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async createCoupon(
    @Body()
    body: {
      code: string;
      discountType?: string;
      discountValue: number;
      minOrderValue?: number;
      expiryDate?: Date;
    },
  ) {
    return this.couponService.createCoupon(body);
  }
}
