import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a Retail Invoice from Sale
   */
  async generateRetailInvoice(saleId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });
    if (!sale) {
      throw new NotFoundException(`Sale '${saleId}' not found.`);
    }

    const invoiceNo = `INV-POS-${Date.now().toString().slice(-6)}`;

    const invoice = await this.prisma.retailInvoice.create({
      data: {
        invoiceNo,
        saleId,
        customerName: sale.customerName,
        subtotal: sale.subtotal,
        taxAmount: sale.taxAmount,
        totalAmount: sale.totalAmount,
        items: {
          create: sale.items.map((item) => ({
            description: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.lineTotal,
          })),
        },
      },
      include: { items: true },
    });

    this.logger.log(
      `Generated RetailInvoice '${invoice.invoiceNo}' for Sale '${sale.saleNo}'`,
    );
    return invoice;
  }

  /**
   * Retrieves all retail invoices
   */
  async getInvoices() {
    return this.prisma.retailInvoice.findMany({
      include: { items: true },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
