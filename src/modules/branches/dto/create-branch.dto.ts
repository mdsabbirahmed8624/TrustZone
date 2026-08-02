import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  thana?: string;

  @IsString()
  @IsOptional()
  mapUrl?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  openingHours?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  status?: string; // ACTIVE, INACTIVE, MAINTENANCE

  @IsString()
  @IsOptional()
  logo?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  managerId?: string;
}
