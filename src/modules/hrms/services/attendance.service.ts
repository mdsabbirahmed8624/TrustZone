import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Performs Check-In with GPS and Biometric Verification support
   */
  async checkIn(
    userId: string,
    latitude?: number,
    longitude?: number,
    biometricVerification = false,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing && existing.checkIn) {
      throw new BadRequestException('Already checked in for today.');
    }

    const now = new Date();
    const isLate = now.getHours() >= 9 && now.getMinutes() > 15; // 09:15 AM threshold

    const attendance = await this.prisma.attendance.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        checkIn: now,
        status: isLate ? 'late' : 'present',
        lateArrival: isLate,
        latitude: latitude || null,
        longitude: longitude || null,
        biometricVerification,
      },
      create: {
        userId,
        date: today,
        checkIn: now,
        status: isLate ? 'late' : 'present',
        lateArrival: isLate,
        latitude: latitude || null,
        longitude: longitude || null,
        biometricVerification,
      },
    });

    this.logger.log(
      `Check-In recorded for User '${userId}' [Status: ${attendance.status}]`,
    );
    return attendance;
  }

  /**
   * Performs Check-Out
   */
  async checkOut(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!existing || !existing.checkIn) {
      throw new BadRequestException('No check-in record found for today.');
    }

    const now = new Date();
    const isEarly = now.getHours() < 17; // 05:00 PM threshold

    const attendance = await this.prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: now,
        earlyLeave: isEarly,
      },
    });

    this.logger.log(`Check-Out recorded for User '${userId}'`);
    return attendance;
  }

  /**
   * Submits Attendance Correction Request
   */
  async requestCorrection(
    userId: string,
    date: Date,
    requestedIn?: Date,
    requestedOut?: Date,
    reason?: string,
  ) {
    const correction = await this.prisma.attendanceCorrection.create({
      data: {
        userId,
        date,
        requestedIn: requestedIn || null,
        requestedOut: requestedOut || null,
        reason: reason || 'Missed Check-in/out',
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Attendance Correction requested for User '${userId}' on ${date}`,
    );
    return correction;
  }

  /**
   * Retrieves Monthly Attendance Report
   */
  async getMonthlyReport(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const logs = await this.prisma.attendance.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    const totalPresent = logs.filter((l) => l.status === 'present').length;
    const totalLate = logs.filter((l) => l.lateArrival).length;
    const totalEarlyLeave = logs.filter((l) => l.earlyLeave).length;

    return {
      userId,
      year,
      month,
      totalLogs: logs.length,
      totalPresent,
      totalLate,
      totalEarlyLeave,
      logs,
    };
  }
}
