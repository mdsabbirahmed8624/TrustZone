import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  category?: string; // INTERNAL, FOLLOW_UP, TECHNICIAN, RECEPTION, MANAGER

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}
