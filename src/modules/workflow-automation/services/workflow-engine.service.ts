import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new Workflow Definition
   */
  async createDefinition(
    name: string,
    module: string,
    triggerRule: any,
    steps: any,
  ) {
    const def = await this.prisma.workflowDefinition.create({
      data: {
        name,
        module,
        triggerRule: triggerRule || {},
        steps: steps || [],
        enabled: true,
      },
    });

    // Create initial draft version
    await this.prisma.workflowVersion.create({
      data: {
        definitionId: def.id,
        versionNumber: 1,
        status: 'DRAFT',
        graphDefinition: { nodes: steps || [] },
      },
    });

    this.logger.log(`Created Workflow Definition '${def.name}' (${def.id})`);
    return def;
  }

  /**
   * Publishes a workflow version graph
   */
  async publishVersion(
    definitionId: string,
    versionNumber: number,
    graphDefinition: any,
  ) {
    const existing = await this.prisma.workflowVersion.findUnique({
      where: {
        definitionId_versionNumber: {
          definitionId,
          versionNumber,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Workflow Version ${versionNumber} for Definition '${definitionId}' not found.`,
      );
    }

    const updated = await this.prisma.workflowVersion.update({
      where: { id: existing.id },
      data: {
        status: 'PUBLISHED',
        graphDefinition: graphDefinition || existing.graphDefinition,
      },
    });

    this.logger.log(
      `Published Workflow Version ${versionNumber} for Definition '${definitionId}'`,
    );
    return updated;
  }

  /**
   * Executes a workflow graph instance for a record and trigger event
   */
  async executeWorkflow(
    definitionId: string,
    triggerEvent: string,
    recordId?: string,
    userId?: string,
    initialVariables: Record<string, any> = {},
  ) {
    const version = await this.prisma.workflowVersion.findFirst({
      where: {
        definitionId,
        status: 'PUBLISHED',
        isDeleted: false,
      },
      orderBy: { versionNumber: 'desc' },
    });

    if (!version) {
      throw new BadRequestException(
        `No PUBLISHED version available for Workflow Definition '${definitionId}'.`,
      );
    }

    const execution = await this.prisma.workflowExecution.create({
      data: {
        versionId: version.id,
        userId: userId || null,
        recordId: recordId || null,
        triggerEvent,
        status: 'RUNNING',
        variables: initialVariables,
        currentStepNode: 'START_NODE',
      },
    });

    this.logger.log(
      `Started Workflow Execution '${execution.id}' for event '${triggerEvent}'`,
    );

    // Simulate multi-step graph processing (sequential & conditional logic)
    const nodes = (version.graphDefinition as any)?.nodes || [];
    const logs = [];

    for (let i = 0; i < Math.min(nodes.length, 5); i++) {
      const node = nodes[i];
      const stepLog = await this.prisma.workflowLog.create({
        data: {
          executionId: execution.id,
          stepNode: node.name || `STEP_${i + 1}`,
          status: 'SUCCESS',
          output: { stepIndex: i, actionExecuted: node.type || 'ACTION' },
        },
      });
      logs.push(stepLog);
    }

    const completed = await this.prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        currentStepNode: 'END_NODE',
        finishedAt: new Date(),
      },
    });

    return {
      execution: completed,
      stepLogs: logs,
    };
  }

  /**
   * Retrieves execution history and status
   */
  async getExecutionHistory(executionId: string) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { logs: true, version: { include: { definition: true } } },
    });

    if (!execution) {
      throw new NotFoundException(
        `Workflow Execution '${executionId}' not found.`,
      );
    }

    return execution;
  }
}
