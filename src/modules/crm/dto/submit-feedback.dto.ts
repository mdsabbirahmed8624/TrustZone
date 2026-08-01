import {
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsIn,
} from 'class-validator';

export class SubmitFeedbackDto {
  @IsInt()
  @Min(0)
  @Max(10)
  npsScore: number;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsIn(['Yes', 'No'])
  wouldRecommend: string;

  @IsBoolean()
  @IsOptional()
  followUpRequired?: boolean;

  @IsUUID()
  @IsOptional()
  assignedStaffId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'RESOLVED'])
  resolutionStatus?: string;
}
