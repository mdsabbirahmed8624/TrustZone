import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OpportunityService {
  private readonly logger = new Logger(OpportunityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates an Opportunity
   */
  async createOpportunity(data: {
    title: string;
    amount: number;
    stageId: string;
    customerId?: string;
    assignedToId?: string;
    closeDate?: Date;
    competitor?: string;
  }) {
    const stage = await this.prisma.opportunityStage.findUnique({
      where: { id: data.stageId },
    });
    if (!stage) {
      throw new NotFoundException(
        `OpportunityStage '${data.stageId}' not found.`,
      );
    }

    const expectedRevenue = data.amount * (stage.probability / 100);

    const opportunity = await this.prisma.opportunity.create({
      data: {
        title: data.title,
        amount: data.amount,
        expectedRevenue,
        probability: stage.probability,
        stageId: data.stageId,
        customerId: data.customerId || null,
        assignedToId: data.assignedToId || null,
        closeDate: data.closeDate || null,
        competitor: data.competitor || null,
        status: 'OPEN',
      },
    });

    this.logger.log(
      `Created Opportunity '${opportunity.id}' (${opportunity.title}) - $${opportunity.amount}`,
    );
    return opportunity;
  }

  /**
   * Moves Opportunity to a new stage
   */
  async moveStage(opportunityId: string, stageId: string) {
    const stage = await this.prisma.opportunityStage.findUnique({
      where: { id: stageId },
    });
    if (!stage) {
      throw new NotFoundException(`Stage '${stageId}' not found.`);
    }

    const opp = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });
    if (!opp) {
      throw new NotFoundException(`Opportunity '${opportunityId}' not found.`);
    }

    const expectedRevenue = Number(opp.amount) * (stage.probability / 100);

    const updated = await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        stageId,
        probability: stage.probability,
        expectedRevenue,
      },
    });

    this.logger.log(
      `Moved Opportunity '${opportunityId}' to Stage '${stage.name}' (${stage.probability}%)`,
    );
    return updated;
  }

  /**
   * Marks Opportunity as WON or LOST
   */
  async closeOpportunity(
    opportunityId: string,
    status: 'WON' | 'LOST',
    lossReason?: string,
  ) {
    const updated = await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        status,
        lossReason: status === 'LOST' ? lossReason : null,
        probability: status === 'WON' ? 100 : 0,
        expectedRevenue: status === 'WON' ? undefined : 0,
        closeDate: new Date(),
      },
    });

    this.logger.log(`Closed Opportunity '${opportunityId}' as [${status}]`);
    return updated;
  }

  /**
   * Retrieves opportunities with filtering & stage relations
   */
  async getOpportunities(query: {
    stageId?: string;
    status?: string;
    search?: string;
  }) {
    const where: any = {};
    if (query.stageId) where.stageId = query.stageId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    return this.prisma.opportunity.findMany({
      where,
      include: { stage: true, customer: true, assignedTo: true, tasks: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
