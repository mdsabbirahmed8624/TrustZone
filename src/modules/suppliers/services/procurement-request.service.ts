import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateRequestDto {
  partId: string;
  quantity: number;
  branchId: string;
  requestedById: string;
}

@Injectable()
export class ProcurementRequestService {
  private readonly logger = new Logger(ProcurementRequestService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createRequest(dto: CreateRequestDto) {
    this.logger.log(
      `Submitting purchase request for part ${dto.partId} by user ${dto.requestedById}`,
    );
    return this.prisma.purchaseRequest.create({
      data: {
        partId: dto.partId,
        quantity: dto.quantity,
        branchId: dto.branchId,
        requestedById: dto.requestedById,
        status: 'PENDING_MANAGER',
      },
      include: {
        part: true,
        requestedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async getRequests(query: {
    status?: string;
    branchId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (query.status) where.status = query.status;
    if (query.branchId) where.branchId = query.branchId;

    if (query.search) {
      where.part = {
        name: { contains: query.search, mode: 'insensitive' },
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.purchaseRequest.count({ where }),
      this.prisma.purchaseRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          part: true,
          branch: { select: { name: true } },
          requestedBy: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    return { total, page, limit, data };
  }

  async approveRequest(
    id: string,
    approverId: string,
    approverRole: 'MANAGER' | 'PROCUREMENT' | 'FINANCE',
  ) {
    this.logger.log(
      `Approving request ${id} by approver ${approverId} (role: ${approverRole})`,
    );

    const request = await this.prisma.purchaseRequest.findFirst({
      where: { id, isDeleted: false },
    });

    if (!request)
      throw new NotFoundException(`PurchaseRequest ${id} not found.`);
    if (request.status === 'REJECTED' || request.status === 'ORDERED') {
      throw new BadRequestException(
        `Cannot approve request in status: ${request.status}`,
      );
    }

    let nextStatus = '';
    const updateData: any = { version: { increment: 1 } };

    if (approverRole === 'MANAGER') {
      if (request.status !== 'PENDING_MANAGER') {
        throw new BadRequestException(
          'Request is not in PENDING_MANAGER status.',
        );
      }
      nextStatus = 'APPROVED_MANAGER';
      updateData.managerApprovedById = approverId;
    } else if (approverRole === 'PROCUREMENT') {
      if (request.status !== 'APPROVED_MANAGER') {
        throw new BadRequestException(
          'Request is not in APPROVED_MANAGER status.',
        );
      }
      nextStatus = 'APPROVED_PROCUREMENT';
      updateData.procurementApprovedById = approverId;
    } else if (approverRole === 'FINANCE') {
      if (request.status !== 'APPROVED_PROCUREMENT') {
        throw new BadRequestException(
          'Request is not in APPROVED_PROCUREMENT status.',
        );
      }
      nextStatus = 'ORDERED'; // Approved by Finance transitions straight to ORDERED once PO is built
      updateData.financeApprovedById = approverId;
    } else {
      throw new BadRequestException('Invalid approver role.');
    }

    updateData.status = nextStatus;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.purchaseRequest.update({
        where: { id },
        data: updateData,
        include: { part: true },
      });

      if (nextStatus === 'ORDERED') {
        const supplierId = updated.part.supplierId;
        if (!supplierId) {
          throw new BadRequestException(
            'Cannot create PO: Part has no default supplier configured.',
          );
        }

        const totalAmount = updated.quantity * Number(updated.part.basePrice);

        const po = await tx.purchaseOrder.create({
          data: {
            supplierId,
            branchId: updated.branchId,
            status: 'DRAFT',
            totalAmount,
            purchaseRequestId: updated.id,
            items: {
              create: {
                partId: updated.partId,
                quantity: updated.quantity,
                unitCost: updated.part.basePrice,
              },
            },
          },
        });

        this.logger.log(
          `Automatically generated PO ${po.id} from approved request ${id}`,
        );
      }

      return updated;
    });
  }

  async rejectRequest(id: string, approverId: string, reason: string) {
    this.logger.log(
      `Rejecting request ${id} by user ${approverId} for reason: ${reason}`,
    );

    const request = await this.prisma.purchaseRequest.findFirst({
      where: { id, isDeleted: false },
    });

    if (!request)
      throw new NotFoundException(`PurchaseRequest ${id} not found.`);

    return this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        version: { increment: 1 },
      },
    });
  }
}
