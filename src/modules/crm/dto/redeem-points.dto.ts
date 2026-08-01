import {
  IsUUID,
  IsInt,
  IsPositive,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class RedeemPointsDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  points: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  referenceId?: string;
}
