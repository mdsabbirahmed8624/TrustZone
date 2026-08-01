import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Performs Bank Statement Reconciliation
   */
  async reconcileStatement(
    bankAccountId: string,
    statementBal: number,
    statementDate?: Date,
  ) {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });
    if (!account) {
      throw new NotFoundException(`BankAccount '${bankAccountId}' not found.`);
    }

    const ledgerBal = Number(account.balance);
    const stmtBal = Number(statementBal);
    const diff = stmtBal - ledgerBal;
    const isReconciled = Math.abs(diff) < 0.01;

    const recon = await this.prisma.bankReconciliation.create({
      data: {
        bankAccountId,
        statementDate: statementDate ? new Date(statementDate) : new Date(),
        statementBal: stmtBal,
        ledgerBal,
        difference: diff,
        isReconciled,
      },
    });

    if (isReconciled) {
      await this.prisma.bankTransaction.updateMany({
        where: { bankAccountId, isReconciled: false },
        data: { isReconciled: true },
      });
    }

    this.logger.log(
      `Reconciled Statement for BankAccount '${account.accountNumber}' [Reconciled: ${isReconciled}, Diff: $${diff.toFixed(2)}]`,
    );
    return recon;
  }
}
