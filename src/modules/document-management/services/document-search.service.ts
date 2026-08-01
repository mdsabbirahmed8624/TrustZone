import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentSearchService {
  private readonly logger = new Logger(DocumentSearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enterprise Multi-Field Full-Text & Metadata Search
   */
  async searchDocuments(query: {
    searchTerm?: string;
    department?: string;
    ownerId?: string;
    status?: string;
    tagName?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const whereClause: any = {
      isDeleted: false,
    };

    if (query.department) {
      whereClause.department = query.department;
    }

    if (query.ownerId) {
      whereClause.ownerId = query.ownerId;
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.tagName) {
      whereClause.tags = {
        some: { name: query.tagName },
      };
    }

    if (query.startDate || query.endDate) {
      whereClause.createdAt = {};
      if (query.startDate) whereClause.createdAt.gte = query.startDate;
      if (query.endDate) whereClause.createdAt.lte = query.endDate;
    }

    if (query.searchTerm) {
      whereClause.OR = [
        { title: { contains: query.searchTerm, mode: 'insensitive' } },
        { description: { contains: query.searchTerm, mode: 'insensitive' } },
        {
          ocrResults: {
            some: {
              extractedText: {
                contains: query.searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    const documents = await this.prisma.document.findMany({
      where: whereClause,
      include: {
        folder: true,
        category: true,
        tags: true,
        versions: {
          orderBy: [{ majorVersion: 'desc' }, { minorVersion: 'desc' }],
          take: 1,
        },
        ocrResults: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(
      `Enterprise Search query '${query.searchTerm || '*'}' returned ${documents.length} document(s)`,
    );
    return {
      query,
      totalResults: documents.length,
      documents,
    };
  }
}
