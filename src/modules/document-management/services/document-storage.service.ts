import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);

  // Allowed MIME types whitelist
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'video/mp4',
    'audio/mpeg',
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates file size, MIME type, and computes SHA-256 checksum
   */
  validateAndComputeChecksum(
    fileBuffer: Buffer,
    mimeType: string,
    maxSizeMb = 50,
  ) {
    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `File type '${mimeType}' is not permitted.`,
      );
    }

    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (fileBuffer.length > maxSizeBytes) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSizeMb}MB.`,
      );
    }

    const checksum = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    return {
      isValid: true,
      fileSize: fileBuffer.length,
      mimeType,
      checksumSha256: checksum,
    };
  }

  /**
   * Checks for duplicate file content based on SHA-256 checksum
   */
  async checkForDuplicate(checksumSha256: string) {
    const existing = await this.prisma.documentVersion.findFirst({
      where: { checksumSha256 },
      include: { document: true },
    });

    return {
      isDuplicate: !!existing,
      existingVersion: existing || null,
    };
  }

  /**
   * Virus scan hook simulation
   */
  async runVirusScan(fileBuffer: Buffer) {
    // Simulated clean virus scan result
    return {
      isClean: true,
      scanEngine: 'ClamAV-Enterprise-Engine',
      scannedAt: new Date().toISOString(),
    };
  }
}
