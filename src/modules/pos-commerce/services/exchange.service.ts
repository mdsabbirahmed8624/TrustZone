import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processes a Product Exchange Order
   */
  async processExchange(data: {
    saleId: string;
    returnedSku: string;
    replacementSku: string;
    priceDifference: number;
  }) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: data.saleId },
    });
    if (!sale) {
      throw new NotFoundException(`Sale '${data.saleId}' not found.`);
    }

    const exchangeNo = `EXC-${Date.now().toString().slice(-6)}`;

    const exchange = await this.prisma.exchangeOrder.create({
      data: {
        exchangeNo,
        saleId: data.saleId,
        returnedSku: data.returnedSku,
        replacementSku: data.replacementSku,
        priceDifference: Number(data.priceDifference),
      },
    });

    this.logger.log(
      `Processed ExchangeOrder '${exchange.exchangeNo}' for Sale '${sale.saleNo}' [Price Diff: $${data.priceDifference}]`,
    );
    return exchange;
  }
}
