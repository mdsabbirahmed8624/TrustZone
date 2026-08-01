import {
  IsUUID,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateSupplierPaymentDto {
  @IsUUID()
  supplierId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsUUID()
  accountId: string; // The CASH/BANK account paid from

  @IsString()
  @IsOptional()
  reference?: string;
}
