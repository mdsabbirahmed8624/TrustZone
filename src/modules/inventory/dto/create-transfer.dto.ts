import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  fromBranchId: string;

  @IsString()
  @IsNotEmpty()
  toBranchId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
