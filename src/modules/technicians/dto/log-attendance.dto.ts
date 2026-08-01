import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class LogAttendanceDto {
  @IsString()
  @IsNotEmpty()
  status: string; // present, absent, late, leave

  @IsDateString()
  @IsOptional()
  checkIn?: string;

  @IsDateString()
  @IsOptional()
  checkOut?: string;
}
