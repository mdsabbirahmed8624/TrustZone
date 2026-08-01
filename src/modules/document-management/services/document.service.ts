import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new Document in the repository
   */
  async createDocument(
    title: string,
    ownerId?: string,
    folderId?: string,
    categoryId?: string,
    department?: string,
    description?: string,
  ) {
    const document = await this.prisma.document.create({
      data: {
        title,
        description: description || null,
        ownerId: ownerId || null,
        folderId: folderId || null,
        categoryId: categoryId || null,
        department: department || 'GENERAL',
        status: 'DRAFT',
      },
      include: { folder: true, category: true, tags: true },
    });

    this.logger.log(`Created Document '${document.title}' (${document.id})`);
    return document;
  }

  /**
   * Manages folders (nested hierarchy)
   */
  async createFolder(
    name: string,
    parentId?: string,
    department?: string,
    ownerId?: string,
  ) {
    const folder = await this.prisma.documentFolder.create({
      data: {
        name,
        parentId: parentId || null,
        department: department || null,
        ownerId: ownerId || null,
      },
      include: { children: true },
    });

    this.logger.log(`Created Folder '${folder.name}' (${folder.id})`);
    return folder;
  }

  /**
   * Attaches tags and metadata key-values to a document
   */
  async attachMetadata(
    documentId: string,
    metadata: Record<string, string>,
    tagNames: string[] = [],
  ) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) {
      throw new NotFoundException(`Document '${documentId}' not found.`);
    }

    // Attach metadata
    for (const [key, value] of Object.entries(metadata)) {
      await this.prisma.documentMetadata.upsert({
        where: { documentId_key: { documentId, key } },
        update: { value },
        create: { documentId, key, value },
      });
    }

    // Connect tags
    if (tagNames.length > 0) {
      const tagConnections = [];
      for (const tagName of tagNames) {
        const tag = await this.prisma.documentTag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
        tagConnections.push({ id: tag.id });
      }

      await this.prisma.document.update({
        where: { id: documentId },
        data: { tags: { connect: tagConnections } },
      });
    }

    return this.prisma.document.findUnique({
      where: { id: documentId },
      include: { metadata: true, tags: true },
    });
  }

  /**
   * Updates Document Lifecycle Status
   */
  async updateStatus(documentId: string, status: string) {
    const validStatuses = [
      'DRAFT',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
      'PUBLISHED',
      'EXPIRED',
      'ARCHIVED',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid document status '${status}'.`);
    }

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: { status },
    });

    this.logger.log(`Updated Document '${documentId}' status -> ${status}`);
    return updated;
  }
}
