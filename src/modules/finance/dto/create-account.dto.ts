import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  parentAccountId?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'])
  accountClass: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

  @IsString()
  @IsNotEmpty()
  accountType: string; // CASH, BANK, MOBILE_BANKING, RECEIVABLE, PAYABLE, INVENTORY, COGS, REVENUE, EXPENSE, etc.

  @IsString()
  @IsNotEmpty()
  @IsEnum(['DEBIT', 'CREDIT'])
  normalBalance: 'DEBIT' | 'CREDIT';

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsNumber()
  @IsOptional()
  openingBalance?: number;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  accountNumberStr?: string;

  @IsString()
  @IsOptional()
  bankBranch?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
