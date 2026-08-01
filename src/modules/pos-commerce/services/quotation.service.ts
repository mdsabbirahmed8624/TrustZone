import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuotationService {
  private readonly logger = new Logger(QuotationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a Sales Quotation
   */
  async createQuotation(data: {
    customerName: string;
    validDays?: number;
    items: { productName: string; quantity: number; unitPrice: number }[];
  }) {
    let totalAmount = 0;
    const items = data.items.map((item) => {
      const lineTotal = item.quantity * Number(item.unitPrice);
      totalAmount += lineTotal;
      return {
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal,
      };
    });

    const quoteNo = `QTN-${Date.now().toString().slice(-6)}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (data.validDays || 14));

    const quotation = await this.prisma.quotation.create({
      data: {
        quoteNo,
        customerName: data.customerName,
        totalAmount,
        validUntil,
        status: 'SENT',
        items: { create: items },
      },
      include: { items: true },
    });

    this.logger.log(
      `Created Quotation '${quotation.quoteNo}' for '${data.customerName}' [Total: $${totalAmount}]`,
    );
    return quotation;
  }
}
