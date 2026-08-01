import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentVersionService {
  private readonly logger = new Logger(DocumentVersionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Uploads or creates a new Major / Minor Version for a Document
   */
  async createVersion(
    documentId: string,
    filePath: string,
    fileSize: number,
    mimeType: string,
    checksumSha256: string,
    isMajor = false,
    comment?: string,
    storageProvider = 'LOCAL',
  ) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        versions: {
          orderBy: [{ majorVersion: 'desc' }, { minorVersion: 'desc' }],
          take: 1,
        },
      },
    });

    if (!doc) {
      throw new NotFoundException(`Document '${documentId}' not found.`);
    }

    const latest = doc.versions[0];
    let majorVersion = 1;
    let minorVersion = 0;

    if (latest) {
      if (latest.isLocked) {
        throw new BadRequestException(
          `Document version ${latest.majorVersion}.${latest.minorVersion} is LOCKED.`,
        );
      }

      if (isMajor) {
        majorVersion = latest.majorVersion + 1;
        minorVersion = 0;
      } else {
        majorVersion = latest.majorVersion;
        minorVersion = latest.minorVersion + 1;
      }
    }

    const version = await this.prisma.documentVersion.create({
      data: {
        documentId,
        majorVersion,
        minorVersion,
        filePath,
        fileSize,
        mimeType,
        checksumSha256,
        storageProvider,
        comment: comment || null,
      },
    });

    this.logger.log(
      `Created Document Version ${majorVersion}.${minorVersion} for Document '${documentId}'`,
    );
    return version;
  }

  /**
   * Rollback document to a previous version
   */
  async rollbackVersion(documentId: string, targetVersionId: string) {
    const targetVersion = await this.prisma.documentVersion.findUnique({
      where: { id: targetVersionId },
    });

    if (!targetVersion || targetVersion.documentId !== documentId) {
      throw new NotFoundException(
        `Target Version '${targetVersionId}' not found for Document '${documentId}'.`,
      );
    }

    // Create a new version representing the rollback state
    return this.createVersion(
      documentId,
      targetVersion.filePath,
      targetVersion.fileSize,
      targetVersion.mimeType,
      targetVersion.checksumSha256,
      false,
      `Rollback to version ${targetVersion.majorVersion}.${targetVersion.minorVersion}`,
      targetVersion.storageProvider,
    );
  }

  /**
   * Locks or unlocks a version from further modification
   */
  async toggleVersionLock(versionId: string, isLocked: boolean) {
    const updated = await this.prisma.documentVersion.update({
      where: { id: versionId },
      data: { isLocked },
    });

    this.logger.log(`Version '${versionId}' lock state set to ${isLocked}`);
    return updated;
  }
}
