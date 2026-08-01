import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreatePOItemDto {
  @IsString()
  @IsNotEmpty()
  partId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitCost: number;
}

export class CreatePODto {
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsArray()
  items: CreatePOItemDto[];
}
