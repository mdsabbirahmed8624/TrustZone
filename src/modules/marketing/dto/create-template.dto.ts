import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  channel: string; // EMAIL, SMS, WHATSAPP, PUSH, IN_APP

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  variables?: string[];

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}
