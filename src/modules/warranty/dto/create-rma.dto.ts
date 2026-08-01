import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateRmaDto {
  @IsUUID()
  @IsNotEmpty()
  partId: string;

  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  courier?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  vendorReference?: string;

  @IsDateString()
  @IsOptional()
  replacementEta?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
