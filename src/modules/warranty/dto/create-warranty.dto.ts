import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateWarrantyDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsOptional()
  ticketId?: string;

  @IsUUID()
  @IsOptional()
  invoiceId?: string;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  warrantyType: string; // SERVICE, PARTS, DEVICE, EXTENDED, MANUFACTURER

  @IsString()
  @IsNotEmpty()
  deviceBrand: string;

  @IsString()
  @IsNotEmpty()
  deviceModel: string;

  @IsString()
  @IsNotEmpty()
  serialOrImei: string;

  @IsNumber()
  @IsOptional()
  durationMonths?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  coverageDetails?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  exclusions?: string[];

  @IsString()
  @IsOptional()
  terms?: string;
}
