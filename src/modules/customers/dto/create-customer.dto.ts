import {
  IsString,
  IsOptional,
  IsArray,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

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
