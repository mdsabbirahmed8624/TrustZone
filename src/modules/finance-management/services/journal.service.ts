import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates & posts double-entry Journal Voucher (Debit === Credit validation)
   */
  async createJournalEntry(data: {
    description?: string;
    referenceModule?: string;
    lines: {
      accountCode: string;
      debit: number;
      credit: number;
      description?: string;
    }[];
  }) {
    const totalDebit = data.lines.reduce(
      (sum, l) => sum + Number(l.debit || 0),
      0,
    );
    const totalCredit = data.lines.reduce(
      (sum, l) => sum + Number(l.credit || 0),
      0,
    );

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Journal Entry unbalanced. Total Debit ($${totalDebit.toFixed(2)}) must equal Total Credit ($${totalCredit.toFixed(2)}).`,
      );
    }

    // Lookup active branch & accounting period or create fallback
    let branch = await this.prisma.branch.findFirst();
    if (!branch) {
      branch = await this.prisma.branch.create({
        data: {
          name: 'Main Head Office',
          address: 'Central Plaza',
          timezone: 'UTC+6',
          status: 'ACTIVE',
        },
      });
    }

    let fy = await this.prisma.fiscalYear.findFirst();
    if (!fy) {
      fy = await this.prisma.fiscalYear.create({
        data: {
          name: 'FY2026',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
        },
      });
    }

    let period = await this.prisma.accountingPeriod.findFirst();
    if (!period) {
      period = await this.prisma.accountingPeriod.create({
        data: {
          fiscalYearId: fy.id,
          name: '2026-07',
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-07-31'),
        },
      });
    }

    const user = await this.prisma.user.findFirst();

    const voucherNumber = `JV-${Date.now().toString().slice(-6)}`;

    // Create entry
    const entry = await this.prisma.journalEntry.create({
      data: {
        voucherNumber,
        description: data.description || 'Manual Journal Voucher',
        referenceModule: data.referenceModule || 'GENERAL_LEDGER',
        branchId: branch.id,
        periodId: period.id,
        createdById: user ? user.id : branch.id, // Fallback
      },
    });

    // Post to ledger accounts
    for (const line of data.lines) {
      const db = Number(line.debit || 0);
      const cr = Number(line.credit || 0);

      await this.prisma.ledgerAccount.upsert({
        where: { accountCode: line.accountCode },
        update: {
          debitBalance: { increment: db },
          creditBalance: { increment: cr },
          netBalance: { increment: db - cr },
        },
        create: {
          accountCode: line.accountCode,
          accountName: `Account ${line.accountCode}`,
          category: 'GENERAL_LEDGER',
          debitBalance: db,
          creditBalance: cr,
          netBalance: db - cr,
        },
      });
    }

    this.logger.log(
      `Posted JournalEntry '${entry.voucherNumber}' [Amount: $${totalDebit.toFixed(2)}]`,
    );
    return entry;
  }
}
