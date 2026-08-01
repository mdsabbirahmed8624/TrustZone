import {
  IsUUID,
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class AdjustPointsDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsInt()
  @IsNotEmpty()
  pointsDelta: number;

  @IsString()
  @IsOptional()
  description?: string;
}
