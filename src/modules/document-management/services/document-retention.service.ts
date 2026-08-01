import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentRetentionService {
  private readonly logger = new Logger(DocumentRetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Toggles Legal Hold status on a Document (prevents deletion)
   */
  async setLegalHold(documentId: string, isLegalHold: boolean) {
    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: { isLegalHold },
    });

    this.logger.log(
      `Document '${documentId}' legal hold set to ${isLegalHold}`,
    );
    return updated;
  }

  /**
   * Attaches a Retention Policy to a document
   */
  async attachRetentionPolicy(
    documentId: string,
    policyName: string,
    retentionDays = 365,
    autoAction: 'ARCHIVE' | 'PERMANENT_DELETE' = 'ARCHIVE',
  ) {
    const scheduledActionAt = new Date(Date.now() + retentionDays * 86400000);

    const retention = await this.prisma.documentRetention.create({
      data: {
        documentId,
        policyName,
        retentionDays,
        autoAction,
        scheduledActionAt,
      },
    });

    this.logger.log(
      `Attached Retention Policy '${policyName}' to Document '${documentId}' (Expires: ${scheduledActionAt.toISOString()})`,
    );
    return retention;
  }

  /**
   * Soft deletes a document unless protected by Legal Hold
   */
  async softDeleteDocument(documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) {
      throw new NotFoundException(`Document '${documentId}' not found.`);
    }

    if (doc.isLegalHold) {
      throw new BadRequestException(
        `Document '${documentId}' is protected by LEGAL HOLD and cannot be deleted.`,
      );
    }

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: { isDeleted: true, deletedAt: new Date(), status: 'ARCHIVED' },
    });

    this.logger.log(`Soft deleted Document '${documentId}'`);
    return updated;
  }
}
