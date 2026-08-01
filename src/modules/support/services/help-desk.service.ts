import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HelpDeskService {
  private readonly logger = new Logger(HelpDeskService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assigns or transfers support ticket to an agent
   */
  async assignTicket(
    ticketId: string,
    assignedToId: string,
    reason?: string,
    assignedFrom?: string,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException(`SupportTicket '${ticketId}' not found.`);
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToId,
        status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
      },
    });

    await this.prisma.ticketAssignment.create({
      data: {
        supportTicketId: ticketId,
        assignedFrom: assignedFrom || ticket.assignedToId || null,
        assignedTo: assignedToId,
        reason: reason || 'Assigned to Support Agent',
      },
    });

    await this.prisma.ticketTimeline.create({
      data: {
        supportTicketId: ticketId,
        eventType: 'ASSIGNED',
        description: `Ticket assigned to Agent '${assignedToId}'`,
        performedBy: assignedFrom || 'Routing Agent',
      },
    });

    this.logger.log(
      `Assigned Ticket '${ticket.ticketNumber}' to Agent '${assignedToId}'`,
    );
    return updated;
  }
}
