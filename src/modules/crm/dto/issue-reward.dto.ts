import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class IssueRewardDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  rewardType: string; // REFERRAL, BIRTHDAY, FESTIVAL, WARRANTY_BONUS, FREE_SERVICE, COUPON

  @IsString()
  @IsOptional()
  discountType?: string; // PERCENTAGE, FIXED_AMOUNT

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsNumber()
  @IsOptional()
  minOrderValue?: number;

  @IsNumber()
  @IsOptional()
  expiryDays?: number;

  @IsString()
  @IsOptional()
  code?: string;
}
