import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  transferType: string; // INVENTORY, TICKET, CUSTOMER, TECHNICIAN

  @IsString()
  fromBranchId: string;

  @IsString()
  toBranchId: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  entityName?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
