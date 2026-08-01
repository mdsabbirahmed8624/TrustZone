import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submits Customer Feedback
   */
  async submitFeedback(
    customerId: string,
    rating: number,
    comments?: string,
    channel = 'WEB_PORTAL',
  ) {
    const feedback = await this.prisma.customerFeedback.create({
      data: {
        customerId,
        rating,
        comments: comments || null,
        channel,
      },
    });

    this.logger.log(
      `Received Feedback from Customer '${customerId}' - Rating: ${rating}/5`,
    );
    return feedback;
  }
}
