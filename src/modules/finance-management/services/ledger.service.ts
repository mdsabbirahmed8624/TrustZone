import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upserts a Chart of Account entry & Financial Account
   */
  async upsertAccount(
    codeOrNum: string,
    name: string,
    accountType: string,
    description?: string,
    accountClass = 'ASSET',
    normalBalance = 'DEBIT',
  ) {
    const code = codeOrNum;
    const existing = await this.prisma.chartOfAccount.findUnique({
      where: { code },
    });
    let coa;
    if (existing) {
      coa = await this.prisma.chartOfAccount.update({
        where: { code },
        data: { name, accountType, description: description || null },
      });
    } else {
      coa = await this.prisma.chartOfAccount.create({
        data: { code, name, accountType, description: description || null },
      });
    }

    await this.prisma.ledgerAccount.upsert({
      where: { accountCode: code },
      update: { accountName: name },
      create: {
        accountCode: code,
        accountName: name,
        category: `${accountType}_OPERATING`,
      },
    });

    // Also sync with FinancialAccount
    await this.prisma.financialAccount.upsert({
      where: { accountNumber: code },
      update: { name, accountType, accountClass, normalBalance },
      create: {
        accountNumber: code,
        name,
        accountType,
        accountClass,
        normalBalance,
        openingBalance: 0,
        currentBalance: 0,
      },
    });

    this.logger.log(`Upserted ChartOfAccount '${coa.name}' (${coa.code})`);
    return coa;
  }

  /**
   * Retrieves all Chart of Accounts
   */
  async getAccounts(branchId?: string) {
    const coaList = await this.prisma.chartOfAccount.findMany({
      orderBy: { code: 'asc' },
    });
    if (!branchId || !this.prisma.financialAccount?.findMany) {
      return coaList;
    }
    const faList = await this.prisma.financialAccount.findMany({
      where: { OR: [{ branchId }, { branchId: null }] },
      orderBy: { accountNumber: 'asc' },
    });
    return faList.length > 0 ? faList : coaList;
  }
}
