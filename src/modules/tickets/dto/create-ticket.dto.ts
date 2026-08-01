import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  customerFirstName?: string;

  @IsString()
  @IsOptional()
  customerLastName?: string;

  @IsString()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  deviceBrand?: string;

  @IsString()
  @IsOptional()
  deviceModel?: string;

  @IsString()
  @IsOptional()
  deviceSerialNumber?: string;

  @IsString()
  @IsOptional()
  deviceImei?: string;

  @IsString()
  branchId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  faults?: string[];

  @IsDateString()
  slaDeadline: string;

  @IsNumber()
  @IsOptional()
  estimatedCost?: number;
}
