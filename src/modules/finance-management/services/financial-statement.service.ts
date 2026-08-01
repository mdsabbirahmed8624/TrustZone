import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinancialStatementService {
  private readonly logger = new Logger(FinancialStatementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates Financial Statement (Trial Balance, Balance Sheet, Income Statement P&L)
   */
  async generateStatement(statementType: string, period = '2026-07') {
    const ledgerAccounts = await this.prisma.ledgerAccount.findMany({
      orderBy: { accountCode: 'asc' },
    });
    const bankAccounts = await this.prisma.bankAccount.findMany();
    const assets = await this.prisma.asset.findMany();

    const totalDebit = ledgerAccounts.reduce(
      (acc, a) => acc + Number(a.debitBalance),
      0,
    );
    const totalCredit = ledgerAccounts.reduce(
      (acc, a) => acc + Number(a.creditBalance),
      0,
    );

    const totalBankBalance = bankAccounts.reduce(
      (acc, b) => acc + Number(b.balance),
      0,
    );
    const totalNetBookValue = assets.reduce(
      (acc, a) => acc + Number(a.netBookValue),
      0,
    );

    const statementData = {
      statementType,
      period,
      ledgerAccountsCount: ledgerAccounts.length,
      totalDebit: Number(totalDebit.toFixed(2)),
      totalCredit: Number(totalCredit.toFixed(2)),
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      totalAssetsValue: Number(
        (totalBankBalance + totalNetBookValue).toFixed(2),
      ),
      generatedAt: new Date().toISOString(),
    };

    const statement = await this.prisma.financialStatement.create({
      data: {
        statementType,
        period,
        statementData,
      },
    });

    this.logger.log(
      `Generated FinancialStatement '${statementType}' [Period: ${period}]`,
    );
    return statement;
  }
}
