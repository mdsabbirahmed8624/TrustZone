import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initializes default sales pipeline and default stages if none exist
   */
  async ensureDefaultPipeline() {
    let pipeline = await this.prisma.salesPipeline.findFirst({
      where: { isDefault: true },
      include: { stages: { orderBy: { displayOrder: 'asc' } } },
    });

    if (!pipeline) {
      pipeline = await this.prisma.salesPipeline.create({
        data: {
          name: 'Standard Mobile Service Pipeline',
          description: 'Default sales pipeline for repair and service leads',
          isDefault: true,
          stages: {
            create: [
              { name: 'Lead Qualified', displayOrder: 1, probability: 10 },
              {
                name: 'Diagnostic / Quote Sent',
                displayOrder: 2,
                probability: 35,
              },
              { name: 'Repair Approval', displayOrder: 3, probability: 60 },
              { name: 'In Repair', displayOrder: 4, probability: 85 },
              { name: 'Ready for Pickup', displayOrder: 5, probability: 95 },
              { name: 'Closed Won', displayOrder: 6, probability: 100 },
            ],
          },
        },
        include: { stages: { orderBy: { displayOrder: 'asc' } } },
      });
      this.logger.log(`Initialized default SalesPipeline '${pipeline.name}'`);
    }

    return pipeline;
  }

  /**
   * Retrieves Kanban Board view for a pipeline
   */
  async getKanbanBoard(pipelineId?: string) {
    const pipeline = pipelineId
      ? await this.prisma.salesPipeline.findUnique({
          where: { id: pipelineId },
          include: { stages: { orderBy: { displayOrder: 'asc' } } },
        })
      : await this.ensureDefaultPipeline();

    if (!pipeline) {
      throw new NotFoundException('Sales Pipeline not found.');
    }

    const kanbanStages = await Promise.all(
      pipeline.stages.map(async (stage) => {
        const opportunities = await this.prisma.opportunity.findMany({
          where: { stageId: stage.id, status: 'OPEN' },
          include: { customer: true, assignedTo: true },
          orderBy: { createdAt: 'desc' },
        });

        const totalValue = opportunities.reduce(
          (acc, curr) => acc + Number(curr.amount),
          0,
        );
        const weightedValue = opportunities.reduce(
          (acc, curr) => acc + Number(curr.expectedRevenue),
          0,
        );

        return {
          ...stage,
          totalValue,
          weightedValue,
          opportunityCount: opportunities.length,
          opportunities,
        };
      }),
    );

    return {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      stages: kanbanStages,
    };
  }

  /**
   * Configures a new Sales Pipeline with custom stages
   */
  async createPipeline(
    name: string,
    stages: { name: string; probability: number }[],
    description?: string,
  ) {
    const pipeline = await this.prisma.salesPipeline.create({
      data: {
        name,
        description: description || null,
        stages: {
          create: stages.map((s, idx) => ({
            name: s.name,
            probability: s.probability,
            displayOrder: idx + 1,
          })),
        },
      },
      include: { stages: true },
    });

    this.logger.log(`Created custom SalesPipeline '${pipeline.name}'`);
    return pipeline;
  }
}
