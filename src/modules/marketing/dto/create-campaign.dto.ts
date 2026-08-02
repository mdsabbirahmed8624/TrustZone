import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsDateString } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  channel?: string; // EMAIL, SMS, WHATSAPP, PUSH, IN_APP, COUPON, REFERRAL, FESTIVAL, WARRANTY_REMINDER

  @IsString()
  @IsOptional()
  status?: string; // DRAFT, SCHEDULED, ACTIVE, COMPLETED, PAUSED, CANCELLED

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  bodyContent?: string;

  @IsString()
  @IsOptional()
  targetSegment?: string; // VIP, INACTIVE, RECENT, HIGH_SPENDING, PENDING_PICKUP, PENDING_PAYMENT, WARRANTY_EXPIRING, BRANCH, BRAND

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsArray()
  @IsOptional()
  targetAudienceIds?: string[];
}
