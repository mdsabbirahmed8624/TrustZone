import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class SavePresetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsNotEmpty()
  filters: {
    dateRange?: string;
    branchId?: string;
    technicianId?: string;
    supplierId?: string;
    customerId?: string;
    status?: string;
  };
}
