import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalendarFeed(
    userId: string,
    filters: { branchId?: string; startDate?: string; endDate?: string },
  ) {
    const start = filters.startDate
      ? new Date(filters.startDate)
      : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = filters.endDate
      ? new Date(filters.endDate)
      : new Date(Date.now() + 30 * 24 * 3600 * 1000);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const userBranchId = filters.branchId || user?.branchId || undefined;

    const calendarItems: any[] = [];

    // 1. Fetch Repairs (Tickets) based on SLA Deadline
    const tickets = await this.prisma.ticket.findMany({
      where: {
        branchId: userBranchId,
        slaDeadline: { gte: start, lte: end },
      },
      include: { customer: true, device: true },
    });
    tickets.forEach((t) => {
      calendarItems.push({
        id: `ticket-${t.id}`,
        title: `Repair SLA: ${t.device.brand} ${t.device.model} (${t.customer.firstName})`,
        start: t.slaDeadline,
        end: t.slaDeadline,
        type: 'repair',
        priority: 'HIGH',
        status: t.status,
        originalId: t.id,
      });
    });

    // 2. Fetch Tasks
    const tasks = await this.prisma.task.findMany({
      where: {
        assignedToId: userId,
        deadline: { gte: start, lte: end },
      },
    });
    tasks.forEach((tk) => {
      calendarItems.push({
        id: `task-${tk.id}`,
        title: `Task: ${tk.title}`,
        start: tk.deadline,
        end: tk.deadline,
        type: 'task',
        priority: tk.priority,
        status: tk.status,
        originalId: tk.id,
      });
    });

    // 3. Fetch Leave Requests
    const leaves = await this.prisma.leaveRequest.findMany({
      where: {
        userId,
        startDate: { lte: end },
        endDate: { gte: start },
        status: 'approved',
      },
      include: { user: true },
    });
    leaves.forEach((l) => {
      calendarItems.push({
        id: `leave-${l.id}`,
        title: `Leave: ${l.user.firstName} ${l.user.lastName} (${l.reason})`,
        start: l.startDate,
        end: l.endDate,
        type: 'leave',
        priority: 'LOW',
        status: 'APPROVED',
        originalId: l.id,
      });
    });

    // 4. Fetch Warranty Expirations
    const warranties = await this.prisma.warranty.findMany({
      where: {
        branchId: userBranchId,
        endDate: { gte: start, lte: end },
      },
    });
    warranties.forEach((w) => {
      calendarItems.push({
        id: `warranty-${w.id}`,
        title: `Warranty Expiring: ${w.warrantyNumber} (${w.deviceBrand} ${w.deviceModel})`,
        start: w.endDate,
        end: w.endDate,
        type: 'warranty',
        priority: 'MEDIUM',
        status: w.status,
        originalId: w.id,
      });
    });

    // 5. Fetch PO Replacement ETAs (Supplier RMAs)
    const rmas = await this.prisma.supplierRma.findMany({
      where: {
        branchId: userBranchId,
        replacementEta: { gte: start, lte: end },
      },
    });
    rmas.forEach((r) => {
      calendarItems.push({
        id: `rma-${r.id}`,
        title: `PO Replacement ETA: RMA ${r.rmaNumber}`,
        start: r.replacementEta,
        end: r.replacementEta,
        type: 'purchase',
        priority: 'MEDIUM',
        status: r.status,
        originalId: r.id,
      });
    });

    // 6. Fetch Custom Events (CalendarEvent)
    const customEvents = await this.prisma.calendarEvent.findMany({
      where: {
        OR: [
          { userId },
          { branchId: userBranchId },
          { userId: null, branchId: null },
        ],
        startDate: { gte: start },
        endDate: { lte: end },
      },
    });
    customEvents.forEach((ce) => {
      calendarItems.push({
        id: `event-${ce.id}`,
        title: ce.title,
        description: ce.description,
        start: ce.startDate,
        end: ce.endDate,
        type: ce.type.toLowerCase(),
        priority: 'MEDIUM',
        status: 'ACTIVE',
        originalId: ce.id,
      });
    });

    return calendarItems;
  }

  async createEvent(
    userId: string,
    dto: {
      title: string;
      description?: string;
      startDate: string;
      endDate: string;
      type: string;
      branchId?: string;
    },
  ) {
    return this.prisma.calendarEvent.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        type: dto.type,
        userId,
        branchId: dto.branchId || null,
      },
    });
  }

  async deleteEvent(id: string, userId: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (event && event.userId === userId) {
      await this.prisma.calendarEvent.delete({ where: { id } });
    }
    return { success: true };
  }
}
