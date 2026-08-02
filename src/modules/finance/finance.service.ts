import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateCustomerPaymentDto } from './dto/create-customer-payment.dto';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { eventBus, AutomationEvents } from '../../common/event-bus';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // PERIOD & LOCK CONTROL
  // ==========================================

  private async checkPeriodLock(date: Date) {
    const period = await this.prisma.accountingPeriod.findFirst({
      where: {
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    if (!period) {
      throw new NotFoundException(
        `No accounting period defined for date ${date.toISOString().split('T')[0]}.`,
      );
    }

    if (period.isLocked) {
      throw new BadRequestException(
        `Accounting period '${period.name}' is locked. Posting journals is blocked.`,
      );
    }

    return period;
  }

  async getPeriods() {
    return this.prisma.accountingPeriod.findMany({
      include: {
        fiscalYear: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async getFiscalYears() {
    return this.prisma.fiscalYear.findMany({
      include: {
        periods: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async togglePeriodLock(id: string, isLocked: boolean) {
    const period = await this.prisma.accountingPeriod.findUnique({
      where: { id },
    });

    if (!period) {
      throw new NotFoundException(`Accounting period with ID ${id} not found.`);
    }

    return this.prisma.accountingPeriod.update({
      where: { id },
      data: { isLocked },
    });
  }

  async createFiscalYear(data: {
    name: string;
    startDate: string;
    endDate: string;
  }) {
    const existing = await this.prisma.fiscalYear.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new BadRequestException(
        `Fiscal Year with name ${data.name} already exists.`,
      );
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    const fy = await this.prisma.fiscalYear.create({
      data: {
        name: data.name,
        startDate: start,
        endDate: end,
        status: 'ACTIVE',
      },
    });

    // Automatically generate 12 monthly periods
    const periodNames = [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ];

    const yearNum = start.getFullYear();
    for (let i = 0; i < 12; i++) {
      const startStr = `${yearNum}-${periodNames[i]}-01T00:00:00Z`;
      const endMonth = i === 11 ? 12 : i + 2;
      const endYear = i === 11 ? yearNum + 1 : yearNum;
      const endStr = `${endYear}-${String(endMonth).padStart(2, '0')}-01T00:00:00Z`;

      const startD = new Date(startStr);
      const endD = new Date(endStr);
      endD.setTime(endD.getTime() - 1000); // 1 second before next month

      await this.prisma.accountingPeriod.create({
        data: {
          fiscalYearId: fy.id,
          name: `${yearNum}-${periodNames[i]}`,
          startDate: startD,
          endDate: endD,
          isLocked: false,
        },
      });
    }

    return this.prisma.fiscalYear.findUnique({
      where: { id: fy.id },
      include: { periods: true },
    });
  }

  // ==========================================
  // CHART OF ACCOUNTS (COA)
  // ==========================================

  async getAccounts(query?: { branchId?: string }) {
    const where: any = {};
    if (query?.branchId) {
      where.OR = [
        { branchId: query.branchId },
        { branchId: null }, // Global accounts
      ];
    }

    return this.prisma.financialAccount.findMany({
      where,
      include: {
        parentAccount: { select: { name: true, accountNumber: true } },
      },
      orderBy: { accountNumber: 'asc' },
    });
  }

  async createAccount(dto: CreateAccountDto) {
    const existing = await this.prisma.financialAccount.findUnique({
      where: { accountNumber: dto.accountNumber },
    });
    if (existing) {
      throw new BadRequestException(
        `Account number ${dto.accountNumber} already exists.`,
      );
    }

    let parentId = undefined;
    if (dto.parentAccountId) {
      const parent = await this.prisma.financialAccount.findUnique({
        where: { id: dto.parentAccountId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent account with ID ${dto.parentAccountId} not found.`,
        );
      }
      parentId = parent.id;
    }

    return this.prisma.financialAccount.create({
      data: {
        accountNumber: dto.accountNumber,
        name: dto.name,
        parentAccountId: parentId,
        accountClass: dto.accountClass,
        accountType: dto.accountType,
        normalBalance: dto.normalBalance,
        branchId: dto.branchId || null,
        openingBalance: dto.openingBalance || 0.0,
        currentBalance: dto.openingBalance || 0.0,
        bankName: dto.bankName || null,
        accountNumberStr: dto.accountNumberStr || null,
        bankBranch: dto.bankBranch || null,
        mobileNumber: dto.mobileNumber || null,
      },
    });
  }

  // ==========================================
  // DOUBLE-ENTRY JOURNAL ENGINE
  // ==========================================

  async createJournalEntry(data: {
    date?: Date;
    description?: string;
    referenceModule: string;
    referenceId?: string;
    branchId: string;
    createdById: string;
    isReversal?: boolean;
    reversedEntryId?: string;
    lines: {
      accountId: string;
      debit: number;
      credit: number;
      customerId?: string;
      supplierId?: string;
      description?: string;
    }[];
  }) {
    const date = data.date || new Date();

    // Period lock check
    const period = await this.checkPeriodLock(date);

    // Double-entry validation
    const totalDebits = data.lines.reduce(
      (acc, curr) => acc + Number(curr.debit),
      0,
    );
    const totalCredits = data.lines.reduce(
      (acc, curr) => acc + Number(curr.credit),
      0,
    );

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException(
        `Double-entry imbalance: Debits (৳${totalDebits.toFixed(2)}) must equal Credits (৳${totalCredits.toFixed(2)}).`,
      );
    }

    if (totalDebits <= 0) {
      throw new BadRequestException(
        'Transaction total must be greater than zero.',
      );
    }

    // Generate unique Voucher Number
    const voucherSeq = Math.floor(100000 + Math.random() * 900000);
    const voucherNumber = `JV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${voucherSeq}`;

    // Execute database transaction
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          voucherNumber,
          date,
          description: data.description,
          referenceModule: data.referenceModule,
          referenceId: data.referenceId || null,
          branchId: data.branchId,
          periodId: period.id,
          createdById: data.createdById,
          isReversal: data.isReversal || false,
          reversedEntryId: data.reversedEntryId || null,
        },
      });

      for (const line of data.lines) {
        await tx.journalLine.create({
          data: {
            entryId: entry.id,
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
            description: line.description || null,
            customerId: line.customerId || null,
            supplierId: line.supplierId || null,
          },
        });

        // Update financial account balance
        const account = await tx.financialAccount.findUnique({
          where: { id: line.accountId },
        });

        if (!account) {
          throw new NotFoundException(
            `Financial Account with ID ${line.accountId} not found.`,
          );
        }

        let balanceDelta = 0;
        if (
          account.accountClass === 'ASSET' ||
          account.accountClass === 'EXPENSE'
        ) {
          balanceDelta = Number(line.debit) - Number(line.credit);
        } else {
          balanceDelta = Number(line.credit) - Number(line.debit);
        }

        const updatedAccount = await tx.financialAccount.update({
          where: { id: line.accountId },
          data: { currentBalance: { increment: balanceDelta } },
        });

        // Alert on Negative/Low Cash Balance
        if (
          (updatedAccount.accountType === 'CASH' ||
            updatedAccount.accountType === 'BANK' ||
            updatedAccount.accountType === 'MOBILE_BANKING') &&
          Number(updatedAccount.currentBalance) < 0
        ) {
          // Log alert to console/audit log for notification centers
          console.warn(
            `ALERT: Negative Cash balance detected on Account [${updatedAccount.accountNumber}] ${updatedAccount.name}: ৳${updatedAccount.currentBalance}`,
          );
        }

        // Customer due updates
        if (line.customerId && account.accountNumber === '1200') {
          const dueDelta = Number(line.debit) - Number(line.credit);
          await tx.customer.update({
            where: { id: line.customerId },
            data: { dueBalance: { increment: dueDelta } },
          });
        }

        // Supplier due updates
        if (line.supplierId && account.accountNumber === '2100') {
          const dueDelta = Number(line.credit) - Number(line.debit);
          await tx.supplier.update({
            where: { id: line.supplierId },
            data: { dueBalance: { increment: dueDelta } },
          });
        }
      }

      // Log action
      await tx.auditLog.create({
        data: {
          userId: data.createdById,
          action: `POSTED_JOURNAL: ${voucherNumber}`,
          details: `Reference Module: ${data.referenceModule}, Amount: ৳${totalDebits.toFixed(2)}`,
        },
      });

      return entry;
    });
  }

  async getJournals(query?: { branchId?: string }) {
    const where: any = {};
    if (query?.branchId) {
      where.branchId = query.branchId;
    }

    return this.prisma.journalEntry.findMany({
      where,
      include: {
        lines: {
          include: {
            account: { select: { name: true, accountNumber: true } },
            customer: { select: { firstName: true, lastName: true } },
            supplier: { select: { name: true } },
          },
        },
        createdBy: { select: { firstName: true, lastName: true } },
        branch: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async reverseJournalEntry(id: string, createdById: string) {
    const original = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!original) {
      throw new NotFoundException(`Journal Voucher with ID ${id} not found.`);
    }

    if (original.isReversal) {
      throw new BadRequestException(
        'Cannot reverse a journal voucher that is already a reversal.',
      );
    }

    // Check if already reversed
    const alreadyReversed = await this.prisma.journalEntry.findUnique({
      where: { reversedEntryId: id },
    });
    if (alreadyReversed) {
      throw new BadRequestException(
        `Journal Voucher has already been reversed by voucher: ${alreadyReversed.voucherNumber}`,
      );
    }

    const reversalLines = original.lines.map((l) => ({
      accountId: l.accountId,
      debit: Number(l.credit), // Swap debit/credit
      credit: Number(l.debit),
      customerId: l.customerId || undefined,
      supplierId: l.supplierId || undefined,
      description: `Correction: Reversal line of ${original.voucherNumber}`,
    }));

    return this.createJournalEntry({
      description: `Reversal of voucher ${original.voucherNumber} for correction.`,
      referenceModule: original.referenceModule,
      referenceId: original.referenceId || undefined,
      branchId: original.branchId,
      createdById,
      isReversal: true,
      reversedEntryId: original.id,
      lines: reversalLines,
    });
  }

  // ==========================================
  // CUSTOMER PAYMENTS (INVOICE COLLECTION)
  // ==========================================

  async createInvoiceForTicket(ticketId: string, createdById: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true, invoice: true },
    });

    if (!ticket) {
      throw new NotFoundException(
        `Repair Ticket with ID ${ticketId} not found.`,
      );
    }

    if (ticket.invoice) {
      return ticket.invoice; // Already generated
    }

    const total = Number(ticket.estimatedCost);
    const subtotal = total / 1.15; // 15% VAT internal breakdown
    const tax = total - subtotal;

    return this.prisma.$transaction(async (tx) => {
      const invoiceSeq = Math.floor(100000 + Math.random() * 900000);
      const invoiceNumber = `INV-${ticket.createdAt.getFullYear()}-${invoiceSeq}`;

      const invoice = await tx.invoice.create({
        data: {
          ticketId: ticket.id,
          invoiceNumber,
          subtotal,
          tax,
          total,
          status: 'unpaid',
          branchId: ticket.branchId,
        },
      });

      // Log CRM Activity
      await tx.customerActivity.create({
        data: {
          customerId: ticket.customerId,
          type: 'INVOICE_GENERATED',
          title: 'Invoice Generated',
          description: `Invoice ${invoiceNumber} generated for BDT ${total.toFixed(2)}.`,
          referenceId: invoice.id,
          staffId: createdById,
        },
      });

      // Get standard Accounts Receivable (code 1200) and Repair Income (code 4010) accounts
      const arAccount = await tx.financialAccount.findUnique({
        where: { accountNumber: '1200' },
      });
      const revAccount = await tx.financialAccount.findUnique({
        where: { accountNumber: '4010' },
      });

      if (!arAccount || !revAccount) {
        throw new NotFoundException(
          'Default Chart of Accounts (1200 or 4010) is missing. Seed the database.',
        );
      }

      // Record Journal Voucher: Debit A/R, Credit Repair Income
      await this.createJournalEntry({
        description: `Invoice generated for Ticket ID: ${ticket.id.substring(0, 8)}`,
        referenceModule: 'INVOICE',
        referenceId: invoice.id,
        branchId: ticket.branchId,
        createdById,
        lines: [
          {
            accountId: arAccount.id,
            debit: total,
            credit: 0,
            customerId: ticket.customerId,
            description: `A/R Debit for invoice ${invoiceNumber}`,
          },
          {
            accountId: revAccount.id,
            debit: 0,
            credit: total,
            description: `Revenue Credit for invoice ${invoiceNumber}`,
          },
        ],
      });

      return invoice;
    });
  }

  async collectCustomerPayment(
    dto: CreateCustomerPaymentDto,
    createdById: string,
  ) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
      include: { ticket: true },
    });

    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID ${dto.invoiceId} not found.`,
      );
    }

    if (invoice.status === 'paid') {
      throw new BadRequestException('Invoice is already fully paid.');
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: dto.invoiceId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          transactionReference: dto.transactionReference || null,
          status: 'completed',
          accountId: dto.accountId,
        },
      });

      // Emit Automation Event
      eventBus.emit(AutomationEvents.CUSTOMER_PAYMENT_RECEIVED, {
        paymentId: payment.id,
      });

      // Log Audit Trail
      await tx.auditTrail.create({
        data: {
          userId: createdById || null,
          action: 'CREATE',
          affectedModule: 'FINANCE',
          recordId: payment.id,
          afterValue: JSON.parse(JSON.stringify(payment)),
        },
      });

      // Log PAYMENT_RECEIVED Activity
      await tx.customerActivity.create({
        data: {
          customerId: invoice.ticket.customerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Received',
          description: `Payment of ৳${dto.amount} received via ${dto.paymentMethod}. Ref: ${dto.transactionReference || 'N/A'}.`,
          referenceId: payment.id,
          staffId: createdById,
        },
      });

      // Loyalty Points Accrual (1 point per ৳100 spent)
      const points = Math.floor(Number(dto.amount) / 100);
      if (points > 0) {
        await tx.customer.update({
          where: { id: invoice.ticket.customerId },
          data: { loyaltyPoints: { increment: points } },
        });

        await tx.loyaltyTransaction.create({
          data: {
            customerId: invoice.ticket.customerId,
            pointsDelta: points,
            remainingPoints: points,
            type: 'EARNED',
            description: `Points earned on invoice payment. Amount: ৳${dto.amount}`,
            referenceId: payment.id,
            staffId: createdById,
          },
        });

        await tx.customerActivity.create({
          data: {
            customerId: invoice.ticket.customerId,
            type: 'LOYALTY_EARNED',
            title: 'Loyalty Points Earned',
            description: `Earned ${points} loyalty points on payment of ৳${dto.amount}.`,
            referenceId: payment.id,
            staffId: createdById,
          },
        });
      }

      // Get total payments received on this invoice
      const payments = await tx.payment.findMany({
        where: { invoiceId: dto.invoiceId, status: 'completed' },
      });
      const paidTotal = payments.reduce(
        (acc, curr) => acc + Number(curr.amount),
        0,
      );

      let newStatus = 'partially_paid';
      if (paidTotal >= Number(invoice.total)) {
        newStatus = 'paid';
      }

      await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: { status: newStatus },
      });

      // Get A/R account (1200)
      const arAccount = await tx.financialAccount.findUnique({
        where: { accountNumber: '1200' },
      });
      if (!arAccount)
        throw new NotFoundException(
          'Accounts Receivable account (1200) not found.',
        );

      // Record Journal Voucher: Debit cash/bank/mobile account, Credit Accounts Receivable
      await this.createJournalEntry({
        description: `Customer payment received for Invoice: ${invoice.invoiceNumber}`,
        referenceModule: 'PAYMENT',
        referenceId: payment.id,
        branchId:
          invoice.branchId || arAccount.branchId || invoice.ticket.branchId,
        createdById,
        lines: [
          {
            accountId: dto.accountId,
            debit: dto.amount,
            credit: 0,
            description: `Payment received via ${dto.paymentMethod}`,
          },
          {
            accountId: arAccount.id,
            debit: 0,
            credit: dto.amount,
            customerId: invoice.ticket.customerId,
            description: `A/R credited from invoice collection`,
          },
        ],
      });

      return payment;
    });
  }

  // ==========================================
  // SUPPLIER PAYMENTS
  // ==========================================

  async paySupplier(dto: CreateSupplierPaymentDto, createdById: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException(
        `Supplier with ID ${dto.supplierId} not found.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create supplier ledger debit record (we paid them)
      const ledgerEntry = await tx.supplierLedger.create({
        data: {
          supplierId: dto.supplierId,
          amount: dto.amount,
          type: 'DEBIT',
          reference: dto.reference || 'Supplier dues payment',
        },
      });

      // Get Accounts Payable account (2100)
      const apAccount = await tx.financialAccount.findUnique({
        where: { accountNumber: '2100' },
      });
      if (!apAccount)
        throw new NotFoundException(
          'Accounts Payable account (2100) not found.',
        );

      // Get payment account details
      const payAccount = await tx.financialAccount.findUnique({
        where: { id: dto.accountId },
      });
      if (!payAccount)
        throw new NotFoundException('Payment source account not found.');

      // Record Journal Voucher: Debit Accounts Payable, Credit Cash/Bank/Mobile account
      await this.createJournalEntry({
        description: `Supplier payment made to: ${supplier.name}`,
        referenceModule: 'PURCHASE',
        referenceId: ledgerEntry.id,
        branchId:
          payAccount.branchId ||
          apAccount.branchId ||
          'd1111111-1111-1111-1111-111111111111',
        createdById,
        lines: [
          {
            accountId: apAccount.id,
            debit: dto.amount,
            credit: 0,
            supplierId: dto.supplierId,
            description: `A/P debit for supplier payment`,
          },
          {
            accountId: dto.accountId,
            debit: 0,
            credit: dto.amount,
            description: `Supplier paid from account ${payAccount.name}`,
          },
        ],
      });

      return ledgerEntry;
    });
  }

  // ==========================================
  // INTEGRATED PO ACCOUNTING WORKFLOWS
  // ==========================================

  async recordPOReceiptJournal(poId: string, createdById: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { supplier: true },
    });
    if (!po)
      throw new NotFoundException(`Purchase Order with ID ${poId} not found.`);

    const inventoryAccount = await this.prisma.financialAccount.findUnique({
      where: { accountNumber: '1300' },
    });
    const apAccount = await this.prisma.financialAccount.findUnique({
      where: { accountNumber: '2100' },
    });

    if (!inventoryAccount || !apAccount) {
      throw new NotFoundException(
        'Default Chart of Accounts (1300 or 2100) is missing. Seed the database.',
      );
    }

    const amount = Number(po.totalAmount);

    return this.createJournalEntry({
      description: `Purchase receipt logged for PO: ${po.id.substring(0, 8)}`,
      referenceModule: 'PURCHASE',
      referenceId: po.id,
      branchId: po.branchId,
      createdById,
      lines: [
        {
          accountId: inventoryAccount.id,
          debit: amount,
          credit: 0,
          description: `Inventory stock added from PO receipt`,
        },
        {
          accountId: apAccount.id,
          debit: 0,
          credit: amount,
          supplierId: po.supplierId,
          description: `A/P liability credited for PO receipt`,
        },
      ],
    });
  }

  async recordRepairDeliveryJournal(ticketId: string, createdById: string) {
    // Generate Invoice first
    const invoice = await this.createInvoiceForTicket(ticketId, createdById);

    // Load ticket with parts needed to calculate COGS
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket)
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);

    if (ticket.partsRequired && ticket.partsRequired.length > 0) {
      // 1. Process physical stock reduction & log movements
      let totalPartsCost = 0;

      for (const sku of ticket.partsRequired) {
        const part = await this.prisma.part.findUnique({
          where: { sku },
          include: { branchInventory: true },
        });

        if (!part) continue;

        // Decrement stock from branch inventory
        const bi = part.branchInventory.find(
          (b) => b.branchId === ticket.branchId,
        );
        const currentQty = bi ? bi.quantity : 0;

        if (currentQty > 0) {
          await this.prisma.branchInventory.update({
            where: {
              branchId_partId: {
                branchId: ticket.branchId,
                partId: part.id,
              },
            },
            data: { quantity: { decrement: 1 } },
          });

          // Log stock movement
          await this.prisma.stockMovement.create({
            data: {
              branchId: ticket.branchId,
              partId: part.id,
              quantityDelta: -1,
              type: 'repair_usage',
              referenceTicketId: ticket.id,
            },
          });

          totalPartsCost += Number(part.basePrice);
        }
      }

      // 2. If parts cost > 0, log COGS journal: Debit COGS (5010), Credit Inventory Valuation (1300)
      if (totalPartsCost > 0) {
        const cogsAccount = await this.prisma.financialAccount.findUnique({
          where: { accountNumber: '5010' },
        });
        const inventoryAccount = await this.prisma.financialAccount.findUnique({
          where: { accountNumber: '1300' },
        });

        if (!cogsAccount || !inventoryAccount) {
          throw new NotFoundException(
            'COA COGS (5010) or Inventory Asset (1300) account not found.',
          );
        }

        await this.createJournalEntry({
          description: `COGS recognized for parts consumed in ticket ${ticket.id.substring(0, 8)}`,
          referenceModule: 'REPAIR',
          referenceId: ticket.id,
          branchId: ticket.branchId,
          createdById,
          lines: [
            {
              accountId: cogsAccount.id,
              debit: totalPartsCost,
              credit: 0,
              description: `Debit COGS for parts usage`,
            },
            {
              accountId: inventoryAccount.id,
              debit: 0,
              credit: totalPartsCost,
              description: `Credit Inventory Asset for parts consumption`,
            },
          ],
        });
      }
    }

    return invoice;
  }

  // ==========================================
  // EXPENSE MANAGEMENT
  // ==========================================

  async getExpenses(query?: { branchId?: string }) {
    const where: any = {};
    if (query?.branchId) {
      where.branchId = query.branchId;
    }

    return this.prisma.expense.findMany({
      where,
      include: {
        branch: { select: { name: true } },
        account: { select: { name: true, accountNumber: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createExpense(dto: CreateExpenseDto, createdById: string) {
    // Map categories to default account numbers
    const categoryAccountMap: Record<string, string> = {
      Rent: '5110',
      Salary: '5120',
      Electricity: '5130',
      Internet: '5140',
      Marketing: '5150',
      Equipment: '5160',
      Transport: '5170',
      Maintenance: '5180',
      Miscellaneous: '5190',
    };

    const accNumber = categoryAccountMap[dto.category] || '5190';
    const expenseAcc = await this.prisma.financialAccount.findUnique({
      where: { accountNumber: accNumber },
    });
    if (!expenseAcc) {
      throw new NotFoundException(
        `Expense Account code ${accNumber} not found.`,
      );
    }

    return this.prisma.expense.create({
      data: {
        category: dto.category,
        amount: dto.amount,
        notes: dto.notes || null,
        receiptUrl: dto.receiptUrl || null,
        branchId: dto.branchId,
        accountId: dto.accountId || null,
        createdById,
        status: 'PENDING',
      },
    });
  }

  async approveExpense(
    id: string,
    approved: boolean,
    accountId: string,
    approvedById: string,
  ) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense)
      throw new NotFoundException(`Expense with ID ${id} not found.`);
    if (expense.status !== 'PENDING') {
      throw new BadRequestException(
        `Expense has already been processed. Current status: ${expense.status}`,
      );
    }

    if (!approved) {
      return this.prisma.expense.update({
        where: { id },
        data: {
          status: 'REJECTED',
          approvedById,
        },
      });
    }

    // Process approval double entry
    const categoryAccountMap: Record<string, string> = {
      Rent: '5110',
      Salary: '5120',
      Electricity: '5130',
      Internet: '5140',
      Marketing: '5150',
      Equipment: '5160',
      Transport: '5170',
      Maintenance: '5180',
      Miscellaneous: '5190',
    };

    const expenseCode = categoryAccountMap[expense.category] || '5190';
    const expenseAccount = await this.prisma.financialAccount.findUnique({
      where: { accountNumber: expenseCode },
    });
    const cashAccount = await this.prisma.financialAccount.findUnique({
      where: { id: accountId },
    });

    if (!expenseAccount || !cashAccount) {
      throw new NotFoundException(
        `Financial accounts for expense processing not found.`,
      );
    }

    const amount = Number(expense.amount);

    return this.prisma.$transaction(async (tx) => {
      // 1. Update expense status
      const updated = await tx.expense.update({
        where: { id },
        data: {
          status: 'APPROVED',
          accountId,
          approvedById,
        },
      });

      // 2. Write Journal: Debit Expense Account, Credit Cash/Bank Account
      await this.createJournalEntry({
        description: `Approved Expense payment: [${expense.category}]`,
        referenceModule: 'EXPENSE',
        referenceId: expense.id,
        branchId: expense.branchId,
        createdById: approvedById,
        lines: [
          {
            accountId: expenseAccount.id,
            debit: amount,
            credit: 0,
            description: `Debit expense category: ${expense.category}`,
          },
          {
            accountId,
            debit: 0,
            credit: amount,
            description: `Credit payment source: ${cashAccount.name}`,
          },
        ],
      });

      return updated;
    });
  }

  // ==========================================
  // INCOME MANAGEMENT
  // ==========================================

  async getIncomes(query?: { branchId?: string }) {
    const where: any = {};
    if (query?.branchId) {
      where.branchId = query.branchId;
    }

    return this.prisma.income.findMany({
      where,
      include: {
        branch: { select: { name: true } },
        account: { select: { name: true, accountNumber: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createIncome(dto: CreateIncomeDto, createdById: string) {
    const categoryMap: Record<string, string> = {
      'Repair Income': '4010',
      'Product Sales': '4020',
      'Service Charges': '4030',
      'Delivery Charges': '4040',
      'Other Income': '4090',
    };

    const incomeCode = categoryMap[dto.category] || '4090';
    const incomeAccount = await this.prisma.financialAccount.findUnique({
      where: { accountNumber: incomeCode },
    });
    if (!incomeAccount)
      throw new NotFoundException(
        `Income account code ${incomeCode} not found.`,
      );

    const cashAccount = await this.prisma.financialAccount.findUnique({
      where: { id: dto.accountId },
    });
    if (!cashAccount)
      throw new NotFoundException('Cash/Bank destination account not found.');

    return this.prisma.$transaction(async (tx) => {
      const income = await tx.income.create({
        data: {
          category: dto.category,
          amount: dto.amount,
          description: dto.description || null,
          branchId: dto.branchId,
          accountId: dto.accountId,
          createdById,
        },
      });

      // Journal Entry: Debit Cash/Bank, Credit Income Account
      await this.createJournalEntry({
        description: `Income recorded: [${dto.category}] ${dto.description || ''}`,
        referenceModule: 'INCOME',
        referenceId: income.id,
        branchId: dto.branchId,
        createdById,
        lines: [
          {
            accountId: dto.accountId,
            debit: dto.amount,
            credit: 0,
            description: `Cash received in ${cashAccount.name}`,
          },
          {
            accountId: incomeAccount.id,
            debit: 0,
            credit: dto.amount,
            description: `Income credit: ${dto.category}`,
          },
        ],
      });

      return income;
    });
  }

  // ==========================================
  // CASH TRANSFERS & ADJUSTMENTS
  // ==========================================

  async transferFunds(dto: CreateTransferDto, createdById: string) {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException(
        'Cannot transfer funds to the same account.',
      );
    }

    const fromAcc = await this.prisma.financialAccount.findUnique({
      where: { id: dto.fromAccountId },
    });
    const toAcc = await this.prisma.financialAccount.findUnique({
      where: { id: dto.toAccountId },
    });

    if (!fromAcc || !toAcc)
      throw new NotFoundException('Transfer accounts not found.');

    if (Number(fromAcc.currentBalance) < dto.amount) {
      throw new BadRequestException(
        `Insufficient funds in account: ${fromAcc.name}. Available: ৳${fromAcc.currentBalance}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.accountTransfer.create({
        data: {
          fromAccountId: dto.fromAccountId,
          toAccountId: dto.toAccountId,
          amount: dto.amount,
          reference: dto.reference || null,
          createdById,
        },
      });

      // Journal entry: Debit destination, Credit source
      await this.createJournalEntry({
        description: `Funds transfer: ${fromAcc.name} -> ${toAcc.name}. Ref: ${dto.reference || ''}`,
        referenceModule: 'TRANSFER',
        referenceId: transfer.id,
        branchId:
          fromAcc.branchId ||
          toAcc.branchId ||
          'd1111111-1111-1111-1111-111111111111',
        createdById,
        lines: [
          {
            accountId: dto.toAccountId,
            debit: dto.amount,
            credit: 0,
            description: `Debit destination transfer account`,
          },
          {
            accountId: dto.fromAccountId,
            debit: 0,
            credit: dto.amount,
            description: `Credit source transfer account`,
          },
        ],
      });

      return transfer;
    });
  }

  async adjustBalance(dto: CreateAdjustmentDto, createdById: string) {
    const account = await this.prisma.financialAccount.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) throw new NotFoundException('Account not found.');

    const cogsAccount = await this.prisma.financialAccount.findUnique({
      where: { accountNumber: '5010' },
    });
    const otherIncomeAccount = await this.prisma.financialAccount.findUnique({
      where: { accountNumber: '4090' },
    });
    const miscExpenseAccount = await this.prisma.financialAccount.findUnique({
      where: { accountNumber: '5190' },
    });

    if (!cogsAccount || !otherIncomeAccount || !miscExpenseAccount) {
      throw new NotFoundException(
        'Offset accounts (COGS/Other Income/Misc Expense) not found in COA.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const adj = await tx.accountAdjustment.create({
        data: {
          accountId: dto.accountId,
          amountDelta: dto.amountDelta,
          type: dto.type,
          reason: dto.reason,
          createdById,
        },
      });

      const amount = Math.abs(dto.amountDelta);

      // Log Double Entry
      // If adjustment INCREASE (we add asset value):
      // Debit: Selected Account, Credit: Other Income
      // If adjustment DECREASE (we write off asset value):
      // Debit: Misc Expense, Credit: Selected Account
      const debitAccountId =
        dto.type === 'INCREASE' ? dto.accountId : miscExpenseAccount.id;
      const creditAccountId =
        dto.type === 'INCREASE' ? otherIncomeAccount.id : dto.accountId;

      await this.createJournalEntry({
        description: `Account Balance Adjustment: ${account.name}. Reason: ${dto.reason}`,
        referenceModule: 'ADJUSTMENT',
        referenceId: adj.id,
        branchId: account.branchId || 'd1111111-1111-1111-1111-111111111111',
        createdById,
        lines: [
          {
            accountId: debitAccountId,
            debit: amount,
            credit: 0,
            description: `Adjustment debit line`,
          },
          {
            accountId: creditAccountId,
            debit: 0,
            credit: amount,
            description: `Adjustment credit line`,
          },
        ],
      });

      return adj;
    });
  }

  // ==========================================
  // DAILY BRANCH DRAWER CLOSING
  // ==========================================

  async getDailyClosings(query?: { branchId?: string }) {
    const where: any = {};
    if (query?.branchId) {
      where.branchId = query.branchId;
    }

    return this.prisma.dailyClosing.findMany({
      where,
      include: {
        branch: { select: { name: true } },
        closedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async executeDailyClosing(
    branchId: string,
    actualBalance: number,
    notes: string | undefined,
    closedById: string,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sum up the balances of Cash accounts at this branch
    const branchCashAccounts = await this.prisma.financialAccount.findMany({
      where: {
        branchId,
        accountType: 'CASH',
      },
    });

    const expectedBalance = branchCashAccounts.reduce(
      (acc, curr) => acc + Number(curr.currentBalance),
      0,
    );
    const difference = actualBalance - expectedBalance;

    return this.prisma.dailyClosing.upsert({
      where: {
        branchId_date: {
          branchId,
          date: today,
        },
      },
      update: {
        status: 'CLOSED',
        expectedBalance,
        actualBalance,
        difference,
        closedById,
        notes,
      },
      create: {
        branchId,
        date: today,
        status: 'CLOSED',
        expectedBalance,
        actualBalance,
        difference,
        closedById,
        notes,
      },
    });
  }

  // ==========================================
  // EXEC DASHBOARD ANALYTICS
  // ==========================================

  async getDashboardData(branchId?: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Find accounts
    const accounts = await this.prisma.financialAccount.findMany({
      where: branchId ? { OR: [{ branchId }, { branchId: null }] } : undefined,
    });

    const cashBal = accounts
      .filter((a) => a.accountType === 'CASH')
      .reduce((acc, curr) => acc + Number(curr.currentBalance), 0);
    const bankBal = accounts
      .filter((a) => a.accountType === 'BANK')
      .reduce((acc, curr) => acc + Number(curr.currentBalance), 0);
    const mobileBal = accounts
      .filter((a) => a.accountType === 'MOBILE_BANKING')
      .reduce((acc, curr) => acc + Number(curr.currentBalance), 0);

    const arAccount = accounts.find((a) => a.accountNumber === '1200');
    const apAccount = accounts.find((a) => a.accountNumber === '2100');

    const arBalance = arAccount ? Number(arAccount.currentBalance) : 0;
    const apBalance = apAccount ? Number(apAccount.currentBalance) : 0;

    // Load recent journal lines to compute revenues / expenses
    const journalWhere: any = {};
    if (branchId) journalWhere.branchId = branchId;

    const todayJournals = await this.prisma.journalEntry.findMany({
      where: {
        ...journalWhere,
        date: { gte: todayStart, lte: todayEnd },
      },
      include: { lines: { include: { account: true } } },
    });

    const monthJournals = await this.prisma.journalEntry.findMany({
      where: {
        ...journalWhere,
        date: { gte: monthStart },
      },
      include: { lines: { include: { account: true } } },
    });

    // Helper to calculate revenue (sum of credits to Class INCOME / Type REVENUE accounts)
    const calculateRev = (entries: any[]) => {
      let rev = 0;
      for (const entry of entries) {
        for (const line of entry.lines) {
          if (line.account.accountClass === 'INCOME') {
            rev += Number(line.credit) - Number(line.debit);
          }
        }
      }
      return rev;
    };

    // Helper to calculate expenses (sum of debits to Class EXPENSE accounts)
    const calculateExp = (entries: any[]) => {
      let exp = 0;
      for (const entry of entries) {
        for (const line of entry.lines) {
          if (line.account.accountClass === 'EXPENSE') {
            exp += Number(line.debit) - Number(line.credit);
          }
        }
      }
      return exp;
    };

    // Helper to calculate COGS
    const calculateCOGS = (entries: any[]) => {
      let cogs = 0;
      for (const entry of entries) {
        for (const line of entry.lines) {
          if (line.account.accountType === 'COGS') {
            cogs += Number(line.debit) - Number(line.credit);
          }
        }
      }
      return cogs;
    };

    const todayRevenue = calculateRev(todayJournals);
    const todayExpenses = calculateExp(todayJournals);

    const monthlyRevenue = calculateRev(monthJournals);
    const monthlyExpenses = calculateExp(monthJournals);
    const monthlyCOGS = calculateCOGS(monthJournals);

    const grossProfit = monthlyRevenue - monthlyCOGS;
    const netProfit = monthlyRevenue - monthlyExpenses; // Since expenses include COGS and operating expenses

    // Recent Transactions
    const recentVouchers = await this.prisma.journalEntry.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        lines: {
          include: { account: { select: { name: true, accountNumber: true } } },
        },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    // Group expenses by category for charts
    const expensesGrouped = await this.prisma.expense.groupBy({
      by: ['category'],
      where: {
        status: 'APPROVED',
        branchId: branchId ? branchId : undefined,
      },
      _sum: { amount: true },
    });

    const expenseCategories = expensesGrouped.map((e) => ({
      category: e.category,
      amount: Number(e._sum.amount || 0),
    }));

    // Branch Revenue comparison
    const branches = await this.prisma.branch.findMany();
    const branchComparison = [];

    for (const b of branches) {
      const bJournals = await this.prisma.journalEntry.findMany({
        where: { branchId: b.id, date: { gte: monthStart } },
        include: { lines: { include: { account: true } } },
      });
      const bRev = calculateRev(bJournals);
      const bExp = calculateExp(bJournals);
      branchComparison.push({
        branchName: b.name,
        revenue: bRev,
        expense: bExp,
      });
    }

    return {
      todayRevenue,
      todayExpenses,
      cashBalance: cashBal,
      bankBalance: bankBal,
      mobileBankingBalance: mobileBal,
      accountsReceivable: arBalance,
      accountsPayable: apBalance,
      monthlyRevenue,
      monthlyExpenses,
      grossProfit,
      netProfit,
      branchComparison,
      expenseCategories,
      recentTransactions: recentVouchers,
    };
  }

  // ==========================================
  // PROFIT & LOSS REPORT
  // ==========================================

  async getProfitLossReport(query: {
    startDate: string;
    endDate: string;
    branchId?: string;
  }) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    const where: any = {
      date: { gte: start, lte: end },
    };
    if (query.branchId) {
      where.branchId = query.branchId;
    }

    const journals = await this.prisma.journalEntry.findMany({
      where,
      include: {
        lines: {
          include: { account: true },
        },
      },
    });

    const revenueMap: Record<string, { name: string; amount: number }> = {};
    const expenseMap: Record<string, { name: string; amount: number }> = {};
    let cogsAmount = 0;

    for (const entry of journals) {
      for (const line of entry.lines) {
        const acc = line.account;
        if (acc.accountClass === 'INCOME') {
          const val = Number(line.credit) - Number(line.debit);
          if (!revenueMap[acc.accountNumber]) {
            revenueMap[acc.accountNumber] = { name: acc.name, amount: 0 };
          }
          revenueMap[acc.accountNumber].amount += val;
        } else if (acc.accountClass === 'EXPENSE') {
          const val = Number(line.debit) - Number(line.credit);
          if (acc.accountType === 'COGS') {
            cogsAmount += val;
          } else {
            if (!expenseMap[acc.accountNumber]) {
              expenseMap[acc.accountNumber] = { name: acc.name, amount: 0 };
            }
            expenseMap[acc.accountNumber].amount += val;
          }
        }
      }
    }

    const revenues = Object.keys(revenueMap).map((k) => ({
      accountNumber: k,
      name: revenueMap[k].name,
      amount: revenueMap[k].amount,
    }));

    const operatingExpenses = Object.keys(expenseMap).map((k) => ({
      accountNumber: k,
      name: expenseMap[k].name,
      amount: expenseMap[k].amount,
    }));

    const totalRevenue = revenues.reduce((acc, curr) => acc + curr.amount, 0);
    const totalOperatingExpenses = operatingExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    const grossProfit = totalRevenue - cogsAmount;
    const netProfit = grossProfit - totalOperatingExpenses;

    return {
      startDate: query.startDate,
      endDate: query.endDate,
      totalRevenue,
      cogs: cogsAmount,
      grossProfit,
      operatingExpenses,
      totalOperatingExpenses,
      netProfit,
      revenues,
    };
  }

  // ==========================================
  // GENERAL REPORTS
  // ==========================================

  async getCashBookReport(query: {
    startDate: string;
    endDate: string;
    branchId?: string;
  }) {
    return this.getAccountBook('CASH', query);
  }

  async getBankBookReport(query: {
    startDate: string;
    endDate: string;
    branchId?: string;
  }) {
    return this.getAccountBook('BANK', query);
  }

  private async getAccountBook(
    type: 'CASH' | 'BANK',
    query: { startDate: string; endDate: string; branchId?: string },
  ) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    const accountWhere: any = { accountType: type };
    if (query.branchId) {
      accountWhere.OR = [{ branchId: query.branchId }, { branchId: null }];
    }

    const accounts = await this.prisma.financialAccount.findMany({
      where: accountWhere,
    });
    const accountIds = accounts.map((a) => a.id);

    const lines = await this.prisma.journalLine.findMany({
      where: {
        accountId: { in: accountIds },
        entry: {
          date: { gte: start, lte: end },
          branchId: query.branchId ? query.branchId : undefined,
        },
      },
      include: {
        entry: {
          include: {
            createdBy: { select: { firstName: true, lastName: true } },
          },
        },
        account: true,
      },
      orderBy: { entry: { date: 'asc' } },
    });

    let totalDebit = 0;
    let totalCredit = 0;
    const transactions = lines.map((l) => {
      totalDebit += Number(l.debit);
      totalCredit += Number(l.credit);
      return {
        date: l.entry.date,
        voucherNumber: l.entry.voucherNumber,
        accountName: l.account.name,
        accountNumber: l.account.accountNumber,
        description: l.description || l.entry.description,
        debit: Number(l.debit),
        credit: Number(l.credit),
        createdBy: `${l.entry.createdBy.firstName} ${l.entry.createdBy.lastName}`,
      };
    });

    return {
      startDate: query.startDate,
      endDate: query.endDate,
      transactions,
      totalDebit,
      totalCredit,
    };
  }

  async getCustomerDuesReport() {
    const customers = await this.prisma.customer.findMany({
      where: { dueBalance: { gt: 0 } },
      orderBy: { dueBalance: 'desc' },
    });

    return customers.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phone,
      dueBalance: Number(c.dueBalance),
    }));
  }

  async getSupplierDuesReport() {
    const suppliers = await this.prisma.supplier.findMany({
      where: { dueBalance: { gt: 0 } },
      orderBy: { dueBalance: 'desc' },
    });

    return suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      dueBalance: Number(s.dueBalance),
    }));
  }

  async getGeneralLedgerReport(query: {
    startDate: string;
    endDate: string;
    accountId?: string;
  }) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    const where: any = {
      entry: {
        date: { gte: start, lte: end },
      },
    };
    if (query.accountId) {
      where.accountId = query.accountId;
    }

    const lines = await this.prisma.journalLine.findMany({
      where,
      include: {
        account: true,
        entry: true,
      },
      orderBy: [{ accountId: 'asc' }, { entry: { date: 'asc' } }],
    });

    // Group lines by account
    const accountsGrouped: Record<
      string,
      { account: any; lines: any[]; totalDebit: number; totalCredit: number }
    > = {};

    for (const line of lines) {
      const accId = line.accountId;
      if (!accountsGrouped[accId]) {
        accountsGrouped[accId] = {
          account: line.account,
          lines: [],
          totalDebit: 0,
          totalCredit: 0,
        };
      }
      accountsGrouped[accId].lines.push({
        date: line.entry.date,
        voucherNumber: line.entry.voucherNumber,
        description: line.description || line.entry.description,
        debit: Number(line.debit),
        credit: Number(line.credit),
      });
      accountsGrouped[accId].totalDebit += Number(line.debit);
      accountsGrouped[accId].totalCredit += Number(line.credit);
    }

    return Object.keys(accountsGrouped).map((id) => ({
      accountId: id,
      accountName: accountsGrouped[id].account.name,
      accountNumber: accountsGrouped[id].account.accountNumber,
      normalBalance: accountsGrouped[id].account.normalBalance,
      lines: accountsGrouped[id].lines,
      totalDebit: accountsGrouped[id].totalDebit,
      totalCredit: accountsGrouped[id].totalCredit,
    }));
  }

  async getTaxSummaryReport(query: { startDate: string; endDate: string }) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    // Calculate tax collected from invoices
    const invoices = await this.prisma.invoice.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    const totalInvoiceAmount = invoices.reduce(
      (acc, curr) => acc + Number(curr.total),
      0,
    );
    const taxCollected = invoices.reduce(
      (acc, curr) => acc + Number(curr.tax),
      0,
    );

    return {
      startDate: query.startDate,
      endDate: query.endDate,
      totalSales: totalInvoiceAmount,
      taxCollected,
      taxRate: '15% (VAT included)',
    };
  }

  // Update Expense
  async updateExpense(id: string, dto: any) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException(`Expense ${id} not found.`);

    return this.prisma.expense.update({
      where: { id },
      data: {
        category: dto.category ?? expense.category,
        amount: dto.amount !== undefined ? Number(dto.amount) : expense.amount,
        notes: dto.notes ?? expense.notes,
      },
    });
  }

  // Delete Expense
  async deleteExpense(id: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException(`Expense ${id} not found.`);

    await this.prisma.expense.delete({ where: { id } });
    return { success: true, message: `Expense ${id} deleted successfully.` };
  }

  // Update Income
  async updateIncome(id: string, dto: any) {
    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income) throw new NotFoundException(`Income ${id} not found.`);

    return this.prisma.income.update({
      where: { id },
      data: {
        category: dto.category ?? income.category,
        amount: dto.amount !== undefined ? Number(dto.amount) : income.amount,
        description: dto.description ?? dto.notes ?? income.description,
      },
    });
  }

  // Delete Income
  async deleteIncome(id: string) {
    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income) throw new NotFoundException(`Income ${id} not found.`);

    await this.prisma.income.delete({ where: { id } });
    return { success: true, message: `Income ${id} deleted successfully.` };
  }

  // Cash / Bank Reconciliation
  async reconcileAccount(data: { accountId: string; statementBalance: number; notes?: string }) {
    const account = await this.prisma.financialAccount.findUnique({ where: { id: data.accountId } });
    if (!account) throw new NotFoundException(`Account ${data.accountId} not found.`);

    const systemBalance = Number(account.currentBalance);
    const variance = data.statementBalance - systemBalance;

    return {
      success: true,
      accountId: account.id,
      accountName: account.name,
      systemBalance,
      statementBalance: data.statementBalance,
      variance,
      isReconciled: Math.abs(variance) < 0.01,
      message: Math.abs(variance) < 0.01
        ? 'Account balance reconciled perfectly with bank statement.'
        : `Variance of BDT ${variance.toFixed(2)} detected between system and bank statement.`,
    };
  }

  // Balance Sheet Report
  async getBalanceSheetReport(query?: { branchId?: string }) {
    const accounts = await this.getAccounts({ branchId: query?.branchId });

    const assets = accounts.filter((a) => a.accountClass === 'ASSET');
    const liabilities = accounts.filter((a) => a.accountClass === 'LIABILITY');
    const equity = accounts.filter((a) => a.accountClass === 'EQUITY');

    const totalAssets = assets.reduce((acc, a) => acc + Number(a.currentBalance || 0), 0);
    const totalLiabilities = liabilities.reduce((acc, a) => acc + Number(a.currentBalance || 0), 0);
    const totalEquity = equity.reduce((acc, a) => acc + Number(a.currentBalance || 0), 0);

    return {
      asOfDate: new Date().toISOString(),
      assets: { items: assets, total: totalAssets },
      liabilities: { items: liabilities, total: totalLiabilities },
      equity: { items: equity, total: totalEquity },
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1.0,
    };
  }

  // Cash Flow Report
  async getCashFlowReport(query: { startDate: string; endDate: string }) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);

    const [incomes, expenses] = await Promise.all([
      this.prisma.income.findMany({ where: { date: { gte: start, lte: end } } }),
      this.prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
    ]);

    const operatingInflow = incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);
    const operatingOutflow = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const netCashFlow = operatingInflow - operatingOutflow;

    return {
      startDate: query.startDate,
      endDate: query.endDate,
      operatingActivities: {
        inflow: operatingInflow,
        outflow: operatingOutflow,
        net: netCashFlow,
      },
      netCashIncrease: netCashFlow,
    };
  }
}
