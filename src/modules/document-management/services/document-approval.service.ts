import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentApprovalService {
  private readonly logger = new Logger(DocumentApprovalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assigns document review task
   */
  async assignReview(documentId: string, reviewerId?: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) {
      throw new NotFoundException(`Document '${documentId}' not found.`);
    }

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: 'UNDER_REVIEW' },
    });

    const review = await this.prisma.documentReview.create({
      data: {
        documentId,
        reviewerId: reviewerId || null,
        status: 'PENDING',
      },
    });

    this.logger.log(`Assigned review for Document '${documentId}'`);
    return review;
  }

  /**
   * Submits review decision (APPROVED or REJECTED)
   */
  async submitDecision(
    documentId: string,
    decision: 'APPROVED' | 'REJECTED',
    approverId?: string,
    comments?: string,
  ) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) {
      throw new NotFoundException(`Document '${documentId}' not found.`);
    }

    const nextStatus = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: nextStatus },
    });

    const approval = await this.prisma.documentApproval.create({
      data: {
        documentId,
        approverId: approverId || null,
        decision,
        comments: comments || null,
      },
    });

    this.logger.log(
      `Approval decision '${decision}' recorded for Document '${documentId}'`,
    );
    return approval;
  }
}
