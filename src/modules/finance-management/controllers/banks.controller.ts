import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BankService } from '../services/bank.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('finance/banks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BanksController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  @Permissions('finance:write')
  @HttpCode(HttpStatus.CREATED)
  async registerBankAccount(
    @Body()
    body: {
      bankName: string;
      accountNumber: string;
      iban?: string;
      swiftCode?: string;
      initialBalance?: number;
    },
  ) {
    return this.bankService.registerBankAccount(body);
  }

  @Post('transactions')
  @Permissions('finance:write')
  @HttpCode(HttpStatus.CREATED)
  async logTransaction(
    @Body()
    body: {
      bankAccountId: string;
      txnType: string;
      amount: number;
      reference?: string;
    },
  ) {
    return this.bankService.logTransaction(
      body.bankAccountId,
      body.txnType,
      body.amount,
      body.reference,
    );
  }
}
