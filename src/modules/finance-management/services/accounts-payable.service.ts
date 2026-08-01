import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountsPayableService {
  private readonly logger = new Logger(AccountsPayableService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a Vendor Bill & AP Record
   */
  async createVendorInvoice(data: {
    vendorName: string;
    totalAmount: number;
    dueDate: Date;
    invoiceNo?: string;
  }) {
    const invoiceNo =
      data.invoiceNo || `V-INV-${Date.now().toString().slice(-6)}`;
    const amount = Number(data.totalAmount);

    const invoice = await this.prisma.vendorInvoice.create({
      data: {
        invoiceNo,
        vendorName: data.vendorName,
        totalAmount: amount,
        dueDate: new Date(data.dueDate),
        status: 'UNPAID',
      },
    });

    await this.prisma.accountsPayable.create({
      data: {
        vendorInvoiceId: invoice.id,
        vendorName: data.vendorName,
        amountDue: amount,
        dueDate: new Date(data.dueDate),
        agingBucket: '0-30',
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Created VendorInvoice '${invoice.invoiceNo}' for '${data.vendorName}' [Amount: $${amount}]`,
    );
    return invoice;
  }

  /**
   * Processes Payment Voucher for AP
   */
  async processPayment(
    invoiceId: string,
    paymentAmount: number,
    paymentMode = 'BANK_TRANSFER',
  ) {
    const invoice = await this.prisma.vendorInvoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(`VendorInvoice '${invoiceId}' not found.`);
    }

    const currentPaid = Number(invoice.paidAmount);
    const newPaid = currentPaid + Number(paymentAmount);
    const total = Number(invoice.totalAmount);

    const status = newPaid >= total ? 'PAID' : 'PARTIAL';

    const updated = await this.prisma.vendorInvoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaid, status },
    });

    const voucherNo = `PV-${Date.now().toString().slice(-6)}`;
    await this.prisma.paymentVoucher.create({
      data: {
        voucherNo,
        payeeName: invoice.vendorName,
        amount: Number(paymentAmount),
        paymentMode,
      },
    });

    this.logger.log(
      `Processed Payment Voucher '${voucherNo}' for '${invoice.vendorName}' [Paid: $${paymentAmount}]`,
    );
    return updated;
  }
}
