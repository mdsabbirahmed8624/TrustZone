import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
} from 'class-validator';

export class CreateCommunicationDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsIn(['SMS', 'Email', 'WhatsApp'])
  type: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  @IsIn(['Pending', 'Queued', 'Sent', 'Delivered', 'Failed', 'Read'])
  status?: string;
}
