import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  category: string; // Rent, Salary, Electricity, Internet, Marketing, Equipment, Transport, Maintenance, Miscellaneous

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsUUID()
  branchId: string;

  @IsUUID()
  @IsOptional()
  accountId?: string; // Optional during creation, required when paying/approving
}
