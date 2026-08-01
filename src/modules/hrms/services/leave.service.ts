import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initializes Leave Balance for a user
   */
  async initializeLeaveBalance(
    userId: string,
    leaveType = 'ANNUAL',
    yearlyEntitlement = 14,
    year = 2026,
  ) {
    return this.prisma.leaveBalance.upsert({
      where: { userId_leaveType_year: { userId, leaveType, year } },
      update: { yearlyEntitlement },
      create: {
        userId,
        leaveType,
        yearlyEntitlement,
        used: 0,
        year,
      },
    });
  }

  /**
   * Submits a Leave Request with balance check
   */
  async submitLeaveRequest(
    userId: string,
    startDate: Date,
    endDate: Date,
    leaveType: string,
    reason: string,
  ) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { userId_leaveType_year: { userId, leaveType, year: 2026 } },
    });

    const diffDays =
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 3600 * 24),
      ) + 1;

    if (balance && balance.yearlyEntitlement - balance.used < diffDays) {
      throw new BadRequestException(
        `Insufficient ${leaveType} leave balance. Available: ${balance.yearlyEntitlement - balance.used} day(s)`,
      );
    }

    const request = await this.prisma.leaveRequest.create({
      data: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType,
        reason,
        status: 'pending',
      },
    });

    this.logger.log(
      `Leave Request submitted for User '${userId}' [${diffDays} day(s)]`,
    );
    return request;
  }

  /**
   * Approves or Rejects a Leave Request
   */
  async processLeaveRequest(
    requestId: string,
    status: 'approved' | 'rejected',
    approverId: string,
    rejectionReason?: string,
  ) {
    const leaveReq = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });
    if (!leaveReq) {
      throw new NotFoundException(`LeaveRequest '${requestId}' not found.`);
    }

    if (status === 'approved') {
      const diffDays =
        Math.ceil(
          (new Date(leaveReq.endDate).getTime() -
            new Date(leaveReq.startDate).getTime()) /
            (1000 * 3600 * 24),
        ) + 1;

      await this.prisma.leaveBalance.updateMany({
        where: {
          userId: leaveReq.userId,
          leaveType: leaveReq.leaveType,
          year: 2026,
        },
        data: { used: { increment: diffDays } },
      });
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status,
        approvedById: approverId,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
      },
    });

    this.logger.log(
      `Leave Request '${requestId}' processed as [${status}] by '${approverId}'`,
    );
    return updated;
  }
}
