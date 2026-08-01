import {
  IsUUID,
  IsNumber,
  IsNotEmpty,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateAdjustmentDto {
  @IsUUID()
  accountId: string;

  @IsNumber()
  amountDelta: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['INCREASE', 'DECREASE'])
  type: 'INCREASE' | 'DECREASE';

  @IsString()
  @IsNotEmpty()
  reason: string;
}
