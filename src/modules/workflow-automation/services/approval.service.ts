import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submits a new Approval Request
   */
  async submitRequest(
    resourceModule: string,
    resourceId: string,
    approvalType: 'SINGLE' | 'MULTI_LEVEL' | 'PARALLEL' = 'SINGLE',
    requesterId?: string,
    approverId?: string,
    totalSteps = 1,
    timeoutHours = 24,
  ) {
    const expiresAt = new Date(Date.now() + timeoutHours * 3600000);

    const request = await this.prisma.approvalRequest.create({
      data: {
        resourceModule,
        resourceId,
        approvalType,
        requesterId: requesterId || null,
        approverId: approverId || null,
        stepNumber: 1,
        totalSteps,
        timeoutHours,
        expiresAt,
        status: 'PENDING',
      },
    });

    await this.prisma.approvalHistory.create({
      data: {
        requestId: request.id,
        action: 'SUBMITTED',
        actedById: requesterId || null,
        comments: `Submitted ${approvalType} approval request for ${resourceModule} #${resourceId}`,
      },
    });

    this.logger.log(
      `Submitted Approval Request '${request.id}' for ${resourceModule} #${resourceId}`,
    );
    return request;
  }

  /**
   * Approves or rejects an approval step
   */
  async processDecision(
    requestId: string,
    decision: 'APPROVE' | 'REJECT',
    actedById?: string,
    actedByName?: string,
    comments?: string,
  ) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Approval Request '${requestId}' not found.`);
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `Approval Request '${requestId}' is already ${request.status}.`,
      );
    }

    let nextStatus = 'PENDING';
    let nextStep = request.stepNumber;

    if (decision === 'REJECT') {
      nextStatus = 'REJECTED';
    } else if (decision === 'APPROVE') {
      if (request.stepNumber >= request.totalSteps) {
        nextStatus = 'APPROVED';
      } else {
        nextStep = request.stepNumber + 1;
      }
    }

    const updated = await this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: nextStatus,
        stepNumber: nextStep,
      },
    });

    await this.prisma.approvalHistory.create({
      data: {
        requestId: request.id,
        action: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        actedById: actedById || null,
        actedByName: actedByName || 'Approver',
        comments:
          comments || `Step ${request.stepNumber} ${decision.toLowerCase()}d`,
      },
    });

    this.logger.log(
      `Processed decision '${decision}' for Approval Request '${requestId}' -> Status: ${nextStatus}`,
    );
    return updated;
  }

  /**
   * Gets pending approval requests
   */
  async getPendingRequests(approverId?: string) {
    return this.prisma.approvalRequest.findMany({
      where: {
        status: 'PENDING',
        ...(approverId ? { approverId } : {}),
      },
      include: { history: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
