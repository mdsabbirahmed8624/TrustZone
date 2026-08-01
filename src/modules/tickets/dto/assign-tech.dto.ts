import { IsUUID, IsOptional } from 'class-validator';

export class AssignTechDto {
  @IsUUID()
  @IsOptional()
  assignedTechId?: string;
}
