import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a promotional Coupon
   */
  async createCoupon(data: {
    code: string;
    discountType?: string;
    discountValue: number;
    minOrderValue?: number;
    expiryDate?: Date;
  }) {
    const expiryDate = data.expiryDate
      ? new Date(data.expiryDate)
      : new Date(Date.now() + 30 * 86400000);
    const coupon = await this.prisma.coupon.create({
      data: {
        code: data.code,
        discountType: data.discountType || 'PERCENTAGE',
        discountValue: Number(data.discountValue),
        minOrderValue: Number(data.minOrderValue || 0),
        expiryDate,
        isActive: true,
      },
    });

    this.logger.log(
      `Created Coupon '${coupon.code}' [Value: ${coupon.discountValue}]`,
    );
    return coupon;
  }

  /**
   * Creates a Stored-Value Gift Card
   */
  async createGiftCard(
    cardNumber: string,
    pinCode: string,
    initialBalance: number,
    expiryDays = 365,
  ) {
    const balance = Number(initialBalance);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const giftCard = await this.prisma.giftCard.create({
      data: {
        cardNumber,
        pinCode,
        initialBalance: balance,
        currentBalance: balance,
        expiryDate,
        status: 'ACTIVE',
      },
    });

    this.logger.log(
      `Created GiftCard '${giftCard.cardNumber}' [Balance: $${balance}]`,
    );
    return giftCard;
  }

  /**
   * Redeems stored-value balance from Gift Card
   */
  async redeemGiftCard(
    cardNumber: string,
    pinCode: string,
    amountToRedeem: number,
  ) {
    const card = await this.prisma.giftCard.findUnique({
      where: { cardNumber },
    });
    if (!card || card.status !== 'ACTIVE') {
      throw new NotFoundException(
        `GiftCard '${cardNumber}' not found or inactive.`,
      );
    }

    if (card.pinCode !== pinCode) {
      throw new BadRequestException(
        `Invalid PIN code for GiftCard '${cardNumber}'.`,
      );
    }

    const currentBal = Number(card.currentBalance);
    const redeemVal = Number(amountToRedeem);

    if (currentBal < redeemVal) {
      throw new BadRequestException(
        `Insufficient GiftCard balance. Available: $${currentBal.toFixed(2)}.`,
      );
    }

    const newBal = currentBal - redeemVal;
    const updated = await this.prisma.giftCard.update({
      where: { cardNumber },
      data: {
        currentBalance: newBal,
        status: newBal === 0 ? 'USED' : 'ACTIVE',
      },
    });

    this.logger.log(
      `Redeemed $${redeemVal} from GiftCard '${cardNumber}' [Remaining: $${newBal.toFixed(2)}]`,
    );
    return updated;
  }
}
