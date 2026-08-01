import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FeedbackService } from '../services/feedback.service';
import { SurveyService } from '../services/survey.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('support/feedback')
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly surveyService: SurveyService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('support:write')
  @HttpCode(HttpStatus.CREATED)
  async submitFeedback(
    @Body()
    body: {
      customerId: string;
      rating: number;
      comments?: string;
      channel?: string;
    },
  ) {
    return this.feedbackService.submitFeedback(
      body.customerId,
      body.rating,
      body.comments,
      body.channel,
    );
  }

  @Post('surveys')
  @HttpCode(HttpStatus.CREATED)
  async submitSurvey(
    @Body()
    body: {
      customerId: string;
      rating: number;
      npsScore: number;
      ticketNumber?: string;
      feedbackText?: string;
    },
  ) {
    return this.surveyService.submitSurvey(
      body.customerId,
      body.rating,
      body.npsScore,
      body.ticketNumber,
      body.feedbackText,
    );
  }
}
