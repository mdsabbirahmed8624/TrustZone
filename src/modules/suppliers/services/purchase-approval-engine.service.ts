import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ApprovePoDto {
  poId: string;
  approverId: string;
  level: number; // 1 = Branch Manager, 2 = Procurement Officer, 3 = Finance Officer
  comments?: string;
}

@Injectable()
export class PurchaseApprovalEngineService {
  private readonly logger = new Logger(PurchaseApprovalEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async approvePurchaseOrder(dto: ApprovePoDto) {
    this.logger.log(
      `Recording PO approval: PO ID ${dto.poId}, Level ${dto.level} by user ${dto.approverId}`,
    );

    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: dto.poId, isDeleted: false },
      include: { approvals: true },
    });

    if (!po)
      throw new NotFoundException(`PurchaseOrder ${dto.poId} not found.`);
    if (
      po.status === 'RECEIVED' ||
      po.status === 'CANCELLED' ||
      po.status === 'REJECTED'
    ) {
      throw new BadRequestException(
        `Cannot approve PO in status: ${po.status}`,
      );
    }

    // Verify approval level progression
    if (dto.level > 1) {
      const prevLevelApproved = po.approvals.some(
        (a) => a.level === dto.level - 1 && a.status === 'APPROVED',
      );
      if (!prevLevelApproved) {
        throw new BadRequestException(
          `Level ${dto.level} approval requires previous level approval.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Create Approval Record
      const approval = await tx.purchaseOrderApproval.create({
        data: {
          purchaseOrderId: dto.poId,
          approverId: dto.approverId,
          level: dto.level,
          status: 'APPROVED',
          comments: dto.comments,
        },
      });

      // Update PO Status if all 3 levels are satisfied
      let newStatus = po.status;
      if (dto.level === 3) {
        newStatus = 'APPROVED';
      }

      await tx.purchaseOrder.update({
        where: { id: dto.poId, version: po.version },
        data: {
          status: newStatus,
          version: { increment: 1 },
        },
      });

      // Log audit trail
      await tx.inventoryAuditLog.create({
        data: {
          userId: dto.approverId,
          action: 'PO_APPROVAL',
          details: `Approved PO ${dto.poId} at level ${dto.level} Comments: ${dto.comments || 'none'}`,
        },
      });

      return approval;
    });
  }

  async rejectPurchaseOrder(
    poId: string,
    approverId: string,
    comments: string,
  ) {
    this.logger.log(
      `Rejecting PO ID ${poId} by user ${approverId} Reason: ${comments}`,
    );

    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: poId, isDeleted: false },
    });

    if (!po) throw new NotFoundException(`PurchaseOrder ${poId} not found.`);

    return this.prisma.$transaction(async (tx) => {
      // Log rejection
      const approval = await tx.purchaseOrderApproval.create({
        data: {
          purchaseOrderId: poId,
          approverId,
          level: 1, // Defaulting rejection logger
          status: 'REJECTED',
          comments,
        },
      });

      // Set status
      await tx.purchaseOrder.update({
        where: { id: poId, version: po.version },
        data: {
          status: 'REJECTED',
          version: { increment: 1 },
        },
      });

      // Log audit
      await tx.inventoryAuditLog.create({
        data: {
          userId: approverId,
          action: 'PO_REJECTION',
          details: `Rejected PO ${poId}. Reason: ${comments}`,
        },
      });

      return approval;
    });
  }
}
