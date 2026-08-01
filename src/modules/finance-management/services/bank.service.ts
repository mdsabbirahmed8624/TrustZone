import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BankService {
  private readonly logger = new Logger(BankService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a Bank Account
   */
  async registerBankAccount(data: {
    bankName: string;
    accountNumber: string;
    iban?: string;
    swiftCode?: string;
    initialBalance?: number;
  }) {
    const balance = Number(data.initialBalance || 0);

    const bankAccount = await this.prisma.bankAccount.create({
      data: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        iban: data.iban || null,
        swiftCode: data.swiftCode || null,
        balance,
        status: 'ACTIVE',
      },
    });

    this.logger.log(
      `Registered BankAccount '${bankAccount.bankName}' (${bankAccount.accountNumber})`,
    );
    return bankAccount;
  }

  /**
   * Logs a Bank Transaction (Deposit / Withdrawal)
   */
  async logTransaction(
    bankAccountId: string,
    txnType: string,
    amount: number,
    reference?: string,
  ) {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });
    if (!account) {
      throw new NotFoundException(`BankAccount '${bankAccountId}' not found.`);
    }

    const val = Number(amount);
    const txn = await this.prisma.bankTransaction.create({
      data: {
        bankAccountId,
        txnType,
        amount: val,
        reference: reference || null,
        isReconciled: false,
      },
    });

    const balanceChange = txnType === 'DEPOSIT' ? val : -val;
    await this.prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: { balance: { increment: balanceChange } },
    });

    this.logger.log(
      `Logged BankTransaction '${txnType}' [Amount: $${val}] for Bank '${account.bankName}'`,
    );
    return txn;
  }
}
