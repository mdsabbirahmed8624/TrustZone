import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TechnicianRecommendationService {
  private readonly logger = new Logger(TechnicianRecommendationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recommendTechnician(ticketId: string) {
    this.logger.log(
      `Evaluating technician availability and skill scoring for ticket ${ticketId}`,
    );

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { device: true },
    });

    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    // Heuristics: find technicians in the same branch
    const technicians = await this.prisma.user.findMany({
      where: {
        branchId: ticket.branchId,
        role: { in: ['TECHNICIAN', 'SENIOR_TECHNICIAN'] },
      },
    });

    const recommendations = await Promise.all(
      technicians.map(async (tech) => {
        // Query active assigned tickets
        const activeCount = await this.prisma.ticket.count({
          where: {
            assignedTechId: tech.id,
            status: { in: ['booked', 'diagnosing'] },
          },
        });

        // Heuristic score: lower active workload, higher score
        const score = Math.max(0, 100 - activeCount * 10);

        return {
          technicianId: tech.id,
          name: `${tech.firstName} ${tech.lastName}`,
          workloadCount: activeCount,
          score,
        };
      }),
    );

    // Sort by highest score
    recommendations.sort((a, b) => b.score - a.score);

    // Save history record
    const recommendation = await this.prisma.recommendationHistory.create({
      data: {
        recommendationType: 'TECHNICIAN_ASSIGNMENT',
        targetId: ticketId,
        recommendationData: {
          candidates: recommendations,
          bestCandidate: recommendations[0] || null,
        },
        confidenceLevel: 90.0,
      },
    });

    return recommendation;
  }
}
