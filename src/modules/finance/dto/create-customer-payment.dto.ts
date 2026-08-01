import {
  IsUUID,
  IsNumber,
  IsPositive,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateCustomerPaymentDto {
  @IsUUID()
  invoiceId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // Cash, Card, Bank, bKash, Nagad, Rocket, Cheque

  @IsString()
  @IsOptional()
  transactionReference?: string;

  @IsUUID()
  accountId: string; // The CASH/BANK/MOBILE account receiving the money
}
