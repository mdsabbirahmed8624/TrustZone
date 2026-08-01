import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateClaimDto {
  @IsUUID()
  @IsNotEmpty()
  warrantyId: string;

  @IsString()
  @IsNotEmpty()
  issueDescription: string;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
