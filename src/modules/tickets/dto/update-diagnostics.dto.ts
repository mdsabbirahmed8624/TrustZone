import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateDiagnosticsDto {
  @IsString()
  diagnosisNotes: string;

  @IsString()
  @IsOptional()
  internalNotes?: string;

  @IsArray()
  @IsString({ each: true })
  faults: string[];

  @IsArray()
  @IsString({ each: true })
  tests: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  partsRequired?: string[];

  @IsNumber()
  estimatedCost: number;

  @IsBoolean()
  @IsOptional()
  customerApproved?: boolean;
}
