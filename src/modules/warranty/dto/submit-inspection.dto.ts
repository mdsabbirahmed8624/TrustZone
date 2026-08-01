import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';

export class SubmitInspectionDto {
  @IsString()
  @IsNotEmpty()
  inspectionNotes: string;

  @IsString()
  @IsNotEmpty()
  inspectionDiagnosis: string;

  @IsBoolean()
  @IsNotEmpty()
  isCovered: boolean;

  @IsNumber()
  @IsOptional()
  estimatedCost?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inspectionPhotos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  // For parts replacement approvals
  @IsUUID()
  @IsOptional()
  oldPartId?: string;

  @IsUUID()
  @IsOptional()
  newPartId?: string;

  @IsString()
  @IsOptional()
  replacementSerialNumber?: string;

  @IsNumber()
  @IsOptional()
  replacementCost?: number;
}
