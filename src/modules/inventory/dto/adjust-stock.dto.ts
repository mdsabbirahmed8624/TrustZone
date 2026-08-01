import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsNumber()
  @IsNotEmpty()
  quantityDelta: number; // positive or negative

  @IsString()
  @IsNotEmpty()
  type: string; // manual_correction, purchase_receipt, repair_consume

  @IsString()
  @IsOptional()
  notes?: string;
}
