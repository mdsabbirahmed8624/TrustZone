import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a Support Ticket with unique ticket number & timeline
   */
  async createTicket(data: {
    subject: string;
    description: string;
    priority?: string;
    channel?: string;
    department?: string;
    customerId?: string;
    assignedToId?: string;
  }) {
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: data.subject,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        channel: data.channel || 'WEB_PORTAL',
        department: data.department || 'Customer Support',
        customerId: data.customerId || null,
        assignedToId: data.assignedToId || null,
        status: 'OPEN',
      },
    });

    // Log timeline
    await this.prisma.ticketTimeline.create({
      data: {
        supportTicketId: ticket.id,
        eventType: 'CREATED',
        description: `Support Ticket '${ticketNumber}' created via ${ticket.channel}`,
      },
    });

    this.logger.log(
      `Created SupportTicket '${ticketNumber}' (${ticket.subject}) [Priority: ${ticket.priority}]`,
    );
    return ticket;
  }

  /**
   * Updates Support Ticket status & logs timeline
   */
  async updateStatus(ticketId: string, status: string, performedBy?: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException(`SupportTicket '${ticketId}' not found.`);
    }

    const isResolved = status === 'RESOLVED';
    const isClosed = status === 'CLOSED';

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        resolvedAt: isResolved ? new Date() : undefined,
        closedAt: isClosed ? new Date() : undefined,
      },
    });

    await this.prisma.ticketTimeline.create({
      data: {
        supportTicketId: ticketId,
        eventType: 'STATUS_CHANGE',
        description: `Status changed from '${ticket.status}' to '${status}'`,
        performedBy: performedBy || 'System',
      },
    });

    this.logger.log(
      `Updated SupportTicket '${ticket.ticketNumber}' status -> [${status}]`,
    );
    return updated;
  }

  /**
   * Adds comment to support ticket
   */
  async addComment(
    ticketId: string,
    comment: string,
    authorName: string,
    isInternal = false,
  ) {
    const record = await this.prisma.ticketComment.create({
      data: {
        supportTicketId: ticketId,
        comment,
        authorName,
        isInternal,
      },
    });

    await this.prisma.ticketTimeline.create({
      data: {
        supportTicketId: ticketId,
        eventType: 'COMMENTED',
        description: `Comment added by ${authorName} ${isInternal ? '(Internal Note)' : ''}`,
        performedBy: authorName,
      },
    });

    return record;
  }

  /**
   * Lists tickets with filtering & pagination
   */
  async getTickets(query: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.search) {
      where.OR = [
        { ticketNumber: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          assignedTo: true,
          comments: true,
          timelines: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
