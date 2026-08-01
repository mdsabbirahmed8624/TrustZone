import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SurveyService {
  private readonly logger = new Logger(SurveyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submits Satisfaction Survey (CSAT / NPS)
   */
  async submitSurvey(
    customerId: string,
    rating: number,
    npsScore: number,
    ticketNumber?: string,
    feedbackText?: string,
  ) {
    const survey = await this.prisma.satisfactionSurvey.create({
      data: {
        customerId,
        rating,
        npsScore,
        ticketNumber: ticketNumber || null,
        feedbackText: feedbackText || null,
      },
    });

    this.logger.log(
      `Submitted CSAT Survey for Customer '${customerId}' - CSAT: ${rating}/5, NPS: ${npsScore}/10`,
    );
    return survey;
  }
}
