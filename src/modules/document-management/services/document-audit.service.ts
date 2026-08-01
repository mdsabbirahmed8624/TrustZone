import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentAuditService {
  private readonly logger = new Logger(DocumentAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs an immutable Document Audit record
   */
  async logAudit(
    documentId: string,
    action: 'VIEW' | 'DOWNLOAD' | 'EDIT' | 'SHARE' | 'DELETE' | 'ROLLBACK',
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const audit = await this.prisma.documentAudit.create({
      data: {
        documentId,
        userId: userId || null,
        action,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    this.logger.log(
      `Audit Record: Action '${action}' on Document '${documentId}' by User '${userId || 'ANONYMOUS'}'`,
    );
    return audit;
  }

  /**
   * Retrieves Audit Trail history for a Document
   */
  async getAuditHistory(documentId: string) {
    return this.prisma.documentAudit.findMany({
      where: { documentId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
