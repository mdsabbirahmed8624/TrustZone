import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a Cash Drawer drop or payout transaction
   */
  async logCashDrawer(
    shiftId: string,
    entryType: string,
    amount: number,
    reason?: string,
  ) {
    const drawer = await this.prisma.cashDrawer.create({
      data: {
        shiftId,
        entryType,
        amount: Number(amount),
        reason: reason || null,
      },
    });

    this.logger.log(
      `Logged CashDrawer '${entryType}' [Amount: $${amount}] for Shift '${shiftId}'`,
    );
    return drawer;
  }
}
