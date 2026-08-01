import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateTechnicianDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsBoolean()
  @IsOptional()
  availability?: boolean;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @IsString()
  @IsOptional()
  certificationLevel?: string;
}
