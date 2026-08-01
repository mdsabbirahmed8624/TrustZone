import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReturnService {
  private readonly logger = new Logger(ReturnService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processes a Customer Product Return Order
   */
  async processReturn(data: {
    saleId: string;
    reason: string;
    items: { sku: string; quantity: number; refundPrice: number }[];
  }) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: data.saleId },
    });
    if (!sale) {
      throw new NotFoundException(`Sale '${data.saleId}' not found.`);
    }

    const refundAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * Number(item.refundPrice),
      0,
    );
    const returnNo = `RET-${Date.now().toString().slice(-6)}`;

    const returnOrder = await this.prisma.returnOrder.create({
      data: {
        returnNo,
        saleId: data.saleId,
        refundAmount,
        reason: data.reason,
        status: 'COMPLETED',
        items: {
          create: data.items.map((i) => ({
            sku: i.sku,
            quantity: i.quantity,
            refundPrice: Number(i.refundPrice),
          })),
        },
      },
      include: { items: true },
    });

    await this.prisma.sale.update({
      where: { id: data.saleId },
      data: { paymentStatus: 'REFUNDED' },
    });

    this.logger.log(
      `Processed ReturnOrder '${returnOrder.returnNo}' for Sale '${sale.saleNo}' [Refund: $${refundAmount.toFixed(2)}]`,
    );
    return returnOrder;
  }
}
