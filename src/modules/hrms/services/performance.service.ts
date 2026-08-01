import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates an Employee Goal
   */
  async createGoal(
    userId: string,
    title: string,
    targetDate: Date,
    description?: string,
  ) {
    const goal = await this.prisma.employeeGoal.create({
      data: {
        userId,
        title,
        description: description || null,
        targetDate,
        progress: 0,
        status: 'IN_PROGRESS',
      },
    });

    this.logger.log(`Created Goal '${goal.title}' for User '${userId}'`);
    return goal;
  }

  /**
   * Updates goal progress
   */
  async updateGoalProgress(goalId: string, progress: number) {
    const updated = await this.prisma.employeeGoal.update({
      where: { id: goalId },
      data: {
        progress,
        status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
      },
    });

    return updated;
  }

  /**
   * Creates a Performance Review record
   */
  async createPerformanceReview(
    userId: string,
    reviewerId: string,
    rating: number,
    achievements?: string,
    warnings?: string,
    comments?: string,
  ) {
    const review = await this.prisma.performanceReview.create({
      data: {
        userId,
        reviewerId,
        rating,
        achievements: achievements || null,
        warnings: warnings || null,
        comments: comments || null,
      },
    });

    this.logger.log(
      `Created Performance Review (Score: ${rating}) for User '${userId}'`,
    );
    return review;
  }

  /**
   * Issues Warning Letter or Reward
   */
  async issueReward(
    userId: string,
    title: string,
    cashValue = 0,
    description?: string,
  ) {
    return this.prisma.reward.create({
      data: {
        userId,
        title,
        cashValue,
        description: description || null,
      },
    });
  }
}
