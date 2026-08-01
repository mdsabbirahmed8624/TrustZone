import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { LogAttendanceDto } from './dto/log-attendance.dto';
import { SubmitLeaveDto } from './dto/submit-leave.dto';

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. List all technicians with workloads, availability, and rating metrics
  async findAll(query?: { branchId?: string }) {
    const where: any = { role: 'TECHNICIAN' };
    if (query?.branchId) {
      where.branchId = query.branchId;
    }

    const techs = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        branchId: true,
        branch: { select: { name: true } },
        skills: true,
        availability: true,
        isOnline: true,
        leaveStatus: true,
        certificationLevel: true,
        rating: true,
        gpsLatitude: true,
        gpsLongitude: true,
      },
      orderBy: { firstName: 'asc' },
    });

    const results = [];
    for (const tech of techs) {
      // Calculate active workloads (tickets currently in diagnosing/repairing status)
      const pendingCount = await this.prisma.ticket.count({
        where: {
          assignedTechId: tech.id,
          status: { in: ['diagnosing', 'repairing'] },
        },
      });

      const completedCount = await this.prisma.ticket.count({
        where: {
          assignedTechId: tech.id,
          status: { in: ['ready', 'delivered'] },
        },
      });

      // Calculate Average Repair Time (completed repairs with repairedAt & diagnosticCompletedAt timestamps)
      const ticketsWithTimes = await this.prisma.ticket.findMany({
        where: {
          assignedTechId: tech.id,
          repairedAt: { not: null },
          diagnosticCompletedAt: { not: null },
        },
        select: {
          diagnosticCompletedAt: true,
          repairedAt: true,
        },
      });

      let totalMinutes = 0;
      let repairTimeCount = 0;
      ticketsWithTimes.forEach((t) => {
        if (t.repairedAt && t.diagnosticCompletedAt) {
          const diffMs =
            t.repairedAt.getTime() - t.diagnosticCompletedAt.getTime();
          if (diffMs > 0) {
            totalMinutes += diffMs / (1000 * 60);
            repairTimeCount++;
          }
        }
      });
      const avgRepairTimeMinutes =
        repairTimeCount > 0 ? Math.round(totalMinutes / repairTimeCount) : 0;

      results.push({
        ...tech,
        workload: pendingCount,
        completedJobsCount: completedCount,
        avgRepairTimeMinutes,
      });
    }

    return results;
  }

  // 2. Fetch single technician metrics & history
  async findOne(id: string) {
    const tech = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        branchId: true,
        branch: { select: { name: true } },
        skills: true,
        availability: true,
        isOnline: true,
        leaveStatus: true,
        certificationLevel: true,
        rating: true,
        gpsLatitude: true,
        gpsLongitude: true,
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        leaveRequests: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!tech || tech.role !== 'TECHNICIAN') {
      throw new NotFoundException(`Technician with ID ${id} not found.`);
    }

    // Load active jobs
    const activeJobs = await this.prisma.ticket.findMany({
      where: {
        assignedTechId: id,
        status: { in: ['diagnosing', 'repairing'] },
      },
      include: {
        customer: true,
        device: true,
      },
      orderBy: { slaDeadline: 'asc' },
    });

    // Load completed jobs (last 10)
    const completedJobs = await this.prisma.ticket.findMany({
      where: {
        assignedTechId: id,
        status: { in: ['ready', 'delivered'] },
      },
      include: {
        customer: true,
        device: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      ...tech,
      activeJobs,
      completedJobs,
    };
  }

  // 3. Update technician profile (skills, availability status, online toggle)
  async update(id: string, dto: UpdateTechnicianDto) {
    // Validate existence
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        skills: dto.skills,
        availability: dto.availability,
        isOnline: dto.isOnline,
        certificationLevel: dto.certificationLevel,
      },
    });
  }

  // 4. Clock In / Out or Manual Attendance logging
  async logAttendance(id: string, dto: LogAttendanceDto) {
    await this.findOne(id); // Validate technician
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    return this.prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: id,
          date: todayDate,
        },
      },
      update: {
        status: dto.status,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
      },
      create: {
        userId: id,
        date: todayDate,
        status: dto.status,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : new Date(),
      },
    });
  }

  // 5. Submit leave request
  async submitLeave(id: string, dto: SubmitLeaveDto) {
    await this.findOne(id); // Validate technician
    return this.prisma.leaveRequest.create({
      data: {
        userId: id,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        status: 'pending',
      },
    });
  }

  // 6. Approve / reject leave request
  async updateLeaveStatus(leaveId: string, status: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException(
        `Leave request with ID ${leaveId} not found.`,
      );
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status },
    });

    // If approved, update technician profile's leaveStatus
    if (status === 'approved') {
      await this.prisma.user.update({
        where: { id: leave.userId },
        data: { leaveStatus: 'on_leave', availability: false },
      });
    } else {
      await this.prisma.user.update({
        where: { id: leave.userId },
        data: { leaveStatus: 'active' },
      });
    }

    return updated;
  }
}
