import { IsArray, IsString, IsOptional } from 'class-validator';

export class BulkUserActionDto {
  @IsArray()
  userIds: string[];

  @IsString()
  action:
    | 'ACTIVATE'
    | 'DEACTIVATE'
    | 'SUSPEND'
    | 'DELETE'
    | 'ASSIGN_ROLE'
    | 'ASSIGN_BRANCH'
    | 'RESET_PASSWORD';

  @IsString()
  @IsOptional()
  targetValue?: string; // Role name, Branch ID, or new Password
}
