import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  brandCompatibility: string;

  @IsArray()
  @IsString({ each: true })
  modelCompatibility: string[];

  @IsNumber()
  basePrice: number;

  @IsNumber()
  @IsOptional()
  minimumStockBuffer?: number;

  @IsString()
  @IsOptional()
  supplierId?: string;
}
