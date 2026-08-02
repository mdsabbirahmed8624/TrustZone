import { IsString, IsEmail, IsOptional, MinLength, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  role: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  status?: string; // ACTIVE, INACTIVE, SUSPENDED, LOCKED

  @IsString()
  @IsOptional()
  joiningDate?: string;
}
