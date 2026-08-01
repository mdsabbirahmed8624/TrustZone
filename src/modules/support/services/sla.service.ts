import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SLAService {
  private readonly logger = new Logger(SLAService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Configures SLA targets for a priority level
   */
  async upsertSLA(
    priority: string,
    targetResponseHours: number,
    targetResolutionHours: number,
  ) {
    const name = `${priority} Priority SLA`;
    const sla = await this.prisma.sLA.upsert({
      where: { priority },
      update: { targetResponseHours, targetResolutionHours, name },
      create: { priority, targetResponseHours, targetResolutionHours, name },
    });

    this.logger.log(
      `Upserted SLA for Priority '${priority}' [Response: ${targetResponseHours}h, Resolution: ${targetResolutionHours}h]`,
    );
    return sla;
  }

  /**
   * Evaluates ticket compliance against SLA targets
   */
  async evaluateTicketSLA(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) return null;

    const sla = await this.prisma.sLA.findUnique({
      where: { priority: ticket.priority },
    });
    const targetHours = sla ? sla.targetResolutionHours : 24;

    const now = ticket.resolvedAt || new Date();
    const elapsedHours =
      (now.getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 3600);
    const isBreached = elapsedHours > targetHours;

    if (isBreached && !ticket.isSlaBreached) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { isSlaBreached: true },
      });
    }

    if (sla) {
      await this.prisma.sLAHistory.create({
        data: {
          slaId: sla.id,
          ticketNumber: ticket.ticketNumber,
          responseHours: 1.0,
          resolutionHours: Number(elapsedHours.toFixed(2)),
          isBreached,
        },
      });
    }

    return {
      ticketId,
      ticketNumber: ticket.ticketNumber,
      elapsedHours: Number(elapsedHours.toFixed(2)),
      targetHours,
      isBreached,
    };
  }
}
