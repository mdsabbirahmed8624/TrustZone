import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processes a Retail Sale with items and split payments
   */
  async processSale(data: {
    shiftId?: string;
    customerName?: string;
    items: {
      sku: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      taxRate?: number;
    }[];
    payments: { paymentMethod: string; amount: number; referenceNo?: string }[];
    couponCode?: string;
  }) {
    let subtotal = 0;
    let totalTax = 0;

    const formattedItems = data.items.map((item) => {
      const qty = item.quantity || 1;
      const price = Number(item.unitPrice);
      const taxRate = Number(item.taxRate || 0);
      const itemSub = qty * price;
      const itemTax = itemSub * (taxRate / 100);

      subtotal += itemSub;
      totalTax += itemTax;

      return {
        sku: item.sku,
        productName: item.productName,
        quantity: qty,
        unitPrice: price,
        taxRate,
        lineTotal: itemSub + itemTax,
      };
    });

    let discountAmount = 0;
    if (data.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: data.couponCode },
      });
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = subtotal * (Number(coupon.discountValue) / 100);
        } else {
          discountAmount = Number(coupon.discountValue);
        }
        await this.prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    const netTotal = Math.max(0, subtotal + totalTax - discountAmount);

    const totalPaid = data.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    if (totalPaid < netTotal) {
      throw new BadRequestException(
        `Insufficient payment. Required: $${netTotal.toFixed(2)}, Provided: $${totalPaid.toFixed(2)}.`,
      );
    }

    const saleNo = `SALE-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const sale = await this.prisma.sale.create({
      data: {
        saleNo,
        shiftId: data.shiftId || null,
        customerName: data.customerName || 'Walk-in Customer',
        subtotal,
        taxAmount: totalTax,
        discountAmount,
        totalAmount: netTotal,
        paymentStatus: 'PAID',
        items: { create: formattedItems },
        payments: {
          create: data.payments.map((p) => ({
            paymentMethod: p.paymentMethod,
            amount: Number(p.amount),
            referenceNo: p.referenceNo || null,
          })),
        },
      },
      include: { items: true, payments: true },
    });

    this.logger.log(
      `Processed Sale '${sale.saleNo}' for '${sale.customerName}' [Total: $${netTotal.toFixed(2)}]`,
    );
    return sale;
  }
}
