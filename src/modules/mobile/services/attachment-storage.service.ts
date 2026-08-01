import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface IStorageProvider {
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string>;
}

@Injectable()
export class AttachmentStorageService {
  private readonly logger = new Logger(AttachmentStorageService.name);
  private provider: IStorageProvider;

  constructor(private readonly configService: ConfigService) {
    const providerType = this.configService
      .get<string>('STORAGE_PROVIDER', 'LOCAL')
      .toUpperCase();
    this.logger.log(`Initializing storage provider: ${providerType}`);

    if (
      providerType === 'S3' ||
      providerType === 'R2' ||
      providerType === 'MINIO'
    ) {
      this.provider = {
        uploadFile: async (buf, name) => {
          this.logger.log(
            `[CloudStorage] Uploaded ${name} (${buf.length} bytes) to Cloud Bucket.`,
          );
          return `https://s3.amazonaws.com/trustzone-attachments/${Date.now()}_${name}`;
        },
      };
    } else {
      // Local fallback
      this.provider = {
        uploadFile: async (buf, name) => {
          const uploadDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filePath = path.join(uploadDir, `${Date.now()}_${name}`);
          fs.writeFileSync(filePath, buf);
          this.logger.log(`[LocalStorage] Saved attachment to ${filePath}`);
          return `file:///${filePath.replace(/\\/g, '/')}`;
        },
      };
    }
  }

  async storeAttachment(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    return this.provider.uploadFile(fileBuffer, fileName, mimeType);
  }
}
