import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Schedules an Interview for an applicant
   */
  async scheduleInterview(
    applicantId: string,
    interviewDate: Date,
    interviewerName: string,
    mode = 'ONLINE',
  ) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
    });
    if (!applicant) {
      throw new NotFoundException(`Applicant '${applicantId}' not found.`);
    }

    const interview = await this.prisma.interview.create({
      data: {
        applicantId,
        interviewDate,
        interviewerName,
        mode,
        status: 'SCHEDULED',
      },
    });

    // Update applicant stage
    await this.prisma.applicant.update({
      where: { id: applicantId },
      data: { stage: 'INTERVIEW' },
    });

    this.logger.log(
      `Scheduled Interview for Applicant '${applicant.fullName}' on ${interviewDate}`,
    );
    return interview;
  }

  /**
   * Submits Interview Feedback & Scorecard
   */
  async submitFeedback(
    interviewId: string,
    rating: number,
    comments?: string,
    decision = 'HIRE',
  ) {
    const feedback = await this.prisma.interviewFeedback.create({
      data: {
        interviewId,
        rating,
        comments: comments || null,
        decision,
      },
    });

    await this.prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(
      `Submitted Interview Feedback for '${interviewId}' - Score: ${rating}/5 [Decision: ${decision}]`,
    );
    return feedback;
  }
}
