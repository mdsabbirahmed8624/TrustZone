import { IsString, IsIn, IsOptional } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['booked', 'diagnosing', 'repairing', 'ready', 'delivered'])
  status: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
