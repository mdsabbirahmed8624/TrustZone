import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinanceAnalyticsService {
  private readonly logger = new Logger(FinanceAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executive Financial Analytics Dashboard
   */
  async getExecutiveDashboard() {
    const apInvoices = await this.prisma.vendorInvoice.findMany();
    const arInvoices = await this.prisma.customerInvoice.findMany();

    const totalAP = apInvoices.reduce(
      (acc, i) => acc + (Number(i.totalAmount) - Number(i.paidAmount)),
      0,
    );
    const totalAR = arInvoices.reduce(
      (acc, i) => acc + (Number(i.totalAmount) - Number(i.paidAmount)),
      0,
    );

    const bankAccounts = await this.prisma.bankAccount.findMany();
    const totalCashBank = bankAccounts.reduce(
      (acc, b) => acc + Number(b.balance),
      0,
    );

    const totalBudgets = await this.prisma.budget.count();
    const totalJournalEntries = await this.prisma.journalEntry.count();

    return {
      overview: {
        totalAccountsPayable: Number(totalAP.toFixed(2)),
        totalAccountsReceivable: Number(totalAR.toFixed(2)),
        totalLiquidityBankBalance: Number(totalCashBank.toFixed(2)),
        totalBudgetsCount: totalBudgets,
        totalJournalEntriesCount: totalJournalEntries,
        netWorkingCapital: Number(
          (totalAR + totalCashBank - totalAP).toFixed(2),
        ),
        financialHealthStatus: 'EXCELLENT',
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
