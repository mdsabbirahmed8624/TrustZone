import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmployeePortalService {
  private readonly logger = new Logger(EmployeePortalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves Employee Self-Service Overview Data
   */
  async getMyPortalData(userId: string) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      throw new NotFoundException(
        `Employee Profile for User '${userId}' not found.`,
      );
    }

    const leaveBalances = await this.prisma.leaveBalance.findMany({
      where: { userId, year: 2026 },
    });

    const recentAttendance = await this.prisma.attendance.findMany({
      where: { userId },
      take: 10,
      orderBy: { date: 'desc' },
    });

    const recentPayslips = await this.prisma.payrollItem.findMany({
      where: { userId },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    const activeGoals = await this.prisma.employeeGoal.findMany({
      where: { userId, status: 'IN_PROGRESS' },
    });

    return {
      userId,
      employeeName: `${profile.user.firstName} ${profile.user.lastName}`,
      department: profile.department,
      designation: profile.designation,
      employeeNumber: profile.employeeNumber,
      leaveBalances,
      recentAttendance,
      recentPayslips,
      activeGoals,
    };
  }
}
