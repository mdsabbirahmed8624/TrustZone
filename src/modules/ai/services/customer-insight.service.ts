import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerInsightService {
  private readonly logger = new Logger(CustomerInsightService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculateInsights(customerId: string) {
    this.logger.log(
      `Evaluating churn risks and customer insights for customer ${customerId}`,
    );

    // Query historical tickets
    const ticketCount = await this.prisma.ticket.count({
      where: { customerId },
    });

    const feedbacks = await this.prisma.customerFeedback.findMany({
      where: { ticket: { customerId } },
    });

    const averageRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 4.5;

    // SLA violation ticket check
    const SLA_LIMIT_MS = 48 * 60 * 60 * 1000;
    const resolvedTickets = await this.prisma.ticket.findMany({
      where: {
        customerId,
        status: { in: ['ready', 'delivered'] },
      },
      include: { ticketHistory: true },
    });

    let slaViolations = 0;
    resolvedTickets.forEach((t) => {
      const resolvedHistory = t.ticketHistory.find(
        (h) => h.notes?.includes('ready') || h.notes?.includes('delivered'),
      );
      const duration = resolvedHistory
        ? resolvedHistory.createdAt.getTime() - t.createdAt.getTime()
        : Date.now() - t.createdAt.getTime();
      if (duration > SLA_LIMIT_MS) slaViolations++;
    });

    // Compute churn probability (higher rating & tickets resolved = lower risk, higher SLA violations = higher risk)
    let churnRisk = Math.max(0, 100 - averageRating * 20);
    if (slaViolations > 0) {
      churnRisk += 15.0;
    }
    churnRisk = Math.min(100, Math.max(0, churnRisk));

    // LTV (Lifetime Value) based on payment invoices total
    const invoices = await this.prisma.invoice.findMany({
      where: { ticket: { customerId } },
    });
    const lifetimeValue = invoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0,
    );

    const insight = await this.prisma.customerInsight.upsert({
      where: { id: customerId }, // Stub unique lookup
      update: {
        churnRisk,
        lifetimeValue,
        satisfactionScore: averageRating,
        warrantyLikelihood: 12.5,
      },
      create: {
        id: customerId,
        customerId,
        churnRisk,
        lifetimeValue,
        satisfactionScore: averageRating,
        warrantyLikelihood: 12.5,
      },
    });

    return insight;
  }
}
