import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  discountType?: string; // PERCENTAGE, FIXED_AMOUNT

  @IsNumber()
  discountValue: number;

  @IsNumber()
  @IsOptional()
  minOrderValue?: number;

  @IsDateString()
  expiryDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
