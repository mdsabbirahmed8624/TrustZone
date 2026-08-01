import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Escalates a ticket manually or via automated trigger
   */
  async escalateTicket(
    ticketId: string,
    escalatedTo: string,
    reason: string,
    level = 1,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException(`SupportTicket '${ticketId}' not found.`);
    }

    const history = await this.prisma.escalationHistory.create({
      data: {
        ticketNumber: ticket.ticketNumber,
        escalatedTo,
        reason,
        level,
      },
    });

    await this.prisma.ticketTimeline.create({
      data: {
        supportTicketId: ticketId,
        eventType: 'ESCALATED',
        description: `Ticket escalated to ${escalatedTo} (Level ${level}): ${reason}`,
        performedBy: 'Escalation Engine',
      },
    });

    // Update ticket priority to HIGH/CRITICAL if Level > 1
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        priority: level >= 2 ? 'CRITICAL' : 'HIGH',
      },
    });

    this.logger.log(
      `Escalated Ticket '${ticket.ticketNumber}' to '${escalatedTo}' [Level ${level}]`,
    );
    return history;
  }
}
