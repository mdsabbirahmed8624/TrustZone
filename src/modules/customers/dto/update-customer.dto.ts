import { IsString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @IsString()
  @IsOptional()
  preferredContactTime?: string;

  @IsString()
  @IsOptional()
  preferredCommunicationChannel?: string;

  @IsOptional()
  marketingOptIn?: boolean;

  @IsOptional()
  doNotDisturb?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
