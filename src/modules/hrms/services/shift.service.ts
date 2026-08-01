import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShiftService {
  private readonly logger = new Logger(ShiftService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates or updates a Shift template
   */
  async createShift(
    name: string,
    startTime: string,
    endTime: string,
    graceMinutes = 15,
    overtimeMultiplier = 1.5,
  ) {
    const shift = await this.prisma.shift.create({
      data: {
        name,
        startTime,
        endTime,
        graceMinutes,
        overtimeMultiplier,
      },
    });

    this.logger.log(
      `Created Shift '${shift.name}' (${shift.startTime} - ${shift.endTime})`,
    );
    return shift;
  }

  /**
   * Assigns shift to an employee
   */
  async assignShift(
    userId: string,
    shiftId: string,
    startDate: Date,
    endDate?: Date,
  ) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });
    if (!shift) {
      throw new NotFoundException(`Shift '${shiftId}' not found.`);
    }

    const assignment = await this.prisma.shiftAssignment.create({
      data: {
        userId,
        shiftId,
        startDate,
        endDate: endDate || null,
      },
    });

    this.logger.log(`Assigned Shift '${shift.name}' to User '${userId}'`);
    return assignment;
  }
}
