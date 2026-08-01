import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecruitmentService } from '../services/recruitment.service';
import { InterviewService } from '../services/interview.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('hr/recruitment')
export class RecruitmentController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly interviewService: InterviewService,
  ) {}

  @Post('jobs')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async createJobOpening(
    @Body()
    body: {
      title: string;
      department: string;
      description: string;
      location?: string;
      employmentType?: string;
      openings?: number;
      requirements?: string;
    },
  ) {
    return this.recruitmentService.createJobOpening(body);
  }

  @Post('jobs/:id/apply')
  @HttpCode(HttpStatus.CREATED)
  async applyForJob(
    @Param('id') jobId: string,
    @Body()
    body: {
      fullName: string;
      email: string;
      phone: string;
      resumeUrl?: string;
    },
  ) {
    return this.recruitmentService.applyForJob(
      jobId,
      body.fullName,
      body.email,
      body.phone,
      body.resumeUrl,
    );
  }

  @Post('applicants/:id/stage')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('hr:write')
  @HttpCode(HttpStatus.OK)
  async updateStage(@Param('id') id: string, @Body('stage') stage: string) {
    return this.recruitmentService.updateApplicantStage(id, stage);
  }

  @Post('applicants/:id/interview')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async scheduleInterview(
    @Param('id') applicantId: string,
    @Body()
    body: { interviewDate: Date; interviewerName: string; mode?: string },
  ) {
    return this.interviewService.scheduleInterview(
      applicantId,
      body.interviewDate,
      body.interviewerName,
      body.mode,
    );
  }

  @Post('interviews/:id/feedback')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('hr:write')
  @HttpCode(HttpStatus.OK)
  async submitFeedback(
    @Param('id') interviewId: string,
    @Body() body: { rating: number; comments?: string; decision?: string },
  ) {
    return this.interviewService.submitFeedback(
      interviewId,
      body.rating,
      body.comments,
      body.decision,
    );
  }
}
