import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  @IsNotEmpty()
  category: string; // Repair Income, Product Sales, Service Charges, Delivery Charges, Other Income

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  branchId: string;

  @IsUUID()
  accountId: string; // Account where cash was received
}
