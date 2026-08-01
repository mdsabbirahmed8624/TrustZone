import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentSharingService {
  private readonly logger = new Logger(DocumentSharingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a tokenized Share Link for internal or external access
   */
  async createShareLink(
    documentId: string,
    sharedById?: string,
    recipientEmail?: string,
    isViewOnly = true,
    isWatermarked = true,
    expiresInHours = 48,
    maxDownloads = 5,
    watermarkText = 'TRUSTZONE CONFIDENTIAL',
  ) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) {
      throw new NotFoundException(`Document '${documentId}' not found.`);
    }

    const expiresAt = new Date(Date.now() + expiresInHours * 3600000);

    const share = await this.prisma.documentShare.create({
      data: {
        documentId,
        sharedById: sharedById || null,
        recipientEmail: recipientEmail || null,
        isViewOnly,
        isWatermarked,
        watermarkText,
        maxDownloads,
        expiresAt,
      },
    });

    this.logger.log(
      `Created Share Link '${share.shareToken}' for Document '${documentId}'`,
    );
    return share;
  }

  /**
   * Validates share link access by token
   */
  async accessShareToken(shareToken: string) {
    const share = await this.prisma.documentShare.findUnique({
      where: { shareToken },
      include: {
        document: {
          include: {
            versions: {
              orderBy: [{ majorVersion: 'desc' }, { minorVersion: 'desc' }],
              take: 1,
            },
          },
        },
      },
    });

    if (!share) {
      throw new NotFoundException(`Share Token '${shareToken}' not found.`);
    }

    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new BadRequestException(`Share Token '${shareToken}' has EXPIRED.`);
    }

    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      throw new BadRequestException(
        `Share Token '${shareToken}' download limit reached.`,
      );
    }

    // Increment download count
    await this.prisma.documentShare.update({
      where: { id: share.id },
      data: { downloadCount: share.downloadCount + 1 },
    });

    return {
      shareId: share.id,
      shareToken: share.shareToken,
      isViewOnly: share.isViewOnly,
      isWatermarked: share.isWatermarked,
      watermarkText: share.watermarkText,
      document: share.document,
    };
  }
}
