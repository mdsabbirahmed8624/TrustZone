import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountsReceivableService {
  private readonly logger = new Logger(AccountsReceivableService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a Customer Invoice & AR Record
   */
  async createCustomerInvoice(data: {
    customerName: string;
    totalAmount: number;
    dueDate: Date;
    invoiceNo?: string;
  }) {
    const invoiceNo =
      data.invoiceNo || `C-INV-${Date.now().toString().slice(-6)}`;
    const amount = Number(data.totalAmount);

    const invoice = await this.prisma.customerInvoice.create({
      data: {
        invoiceNo,
        customerName: data.customerName,
        totalAmount: amount,
        dueDate: new Date(data.dueDate),
        status: 'UNPAID',
      },
    });

    await this.prisma.accountsReceivable.create({
      data: {
        customerInvoiceId: invoice.id,
        customerName: data.customerName,
        amountDue: amount,
        dueDate: new Date(data.dueDate),
        agingBucket: '0-30',
        status: 'OUTSTANDING',
      },
    });

    this.logger.log(
      `Created CustomerInvoice '${invoice.invoiceNo}' for '${data.customerName}' [Amount: $${amount}]`,
    );
    return invoice;
  }

  /**
   * Processes Receipt Voucher for AR
   */
  async recordReceipt(
    invoiceId: string,
    receiptAmount: number,
    paymentMode = 'BANK_TRANSFER',
  ) {
    const invoice = await this.prisma.customerInvoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(`CustomerInvoice '${invoiceId}' not found.`);
    }

    const currentPaid = Number(invoice.paidAmount);
    const newPaid = currentPaid + Number(receiptAmount);
    const total = Number(invoice.totalAmount);

    const status = newPaid >= total ? 'PAID' : 'PARTIAL';

    const updated = await this.prisma.customerInvoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaid, status },
    });

    const voucherNo = `RV-${Date.now().toString().slice(-6)}`;
    await this.prisma.receiptVoucher.create({
      data: {
        voucherNo,
        payerName: invoice.customerName,
        amount: Number(receiptAmount),
        paymentMode,
      },
    });

    this.logger.log(
      `Recorded Receipt Voucher '${voucherNo}' from '${invoice.customerName}' [Received: $${receiptAmount}]`,
    );
    return updated;
  }
}
