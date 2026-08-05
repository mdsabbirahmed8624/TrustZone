import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateFollowUpDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  ticketId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsNotEmpty()
  remindAt: string;

  @IsString()
  @IsOptional()
  priority?: string; // LOW, MEDIUM, HIGH, URGENT

  @IsString()
  @IsOptional()
  channel?: string; // IN_APP, EMAIL, SMS, WHATSAPP, PHONE

  @IsString()
  @IsOptional()
  assignedStaffId?: string;

  @IsString()
  @IsOptional()
  assignedStaffName?: string;
}
