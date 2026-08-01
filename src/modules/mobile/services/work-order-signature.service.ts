import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttachmentStorageService } from './attachment-storage.service';

export interface SubmitSignatureDto {
  signeeName: string;
  signatureBase64: string; // Base64 png signature representation
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
}

@Injectable()
export class WorkOrderSignatureService {
  private readonly logger = new Logger(WorkOrderSignatureService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: AttachmentStorageService,
  ) {}

  async submitSignature(ticketId: string, dto: SubmitSignatureDto) {
    this.logger.log(`Storing digital signature for ticket ${ticketId}`);

    // Decode base64 signature
    const base64Data = dto.signatureBase64.replace(
      /^data:image\/\w+;base64,/,
      '',
    );
    const fileBuffer = Buffer.from(base64Data, 'base64');
    const fileName = `signature_ticket_${ticketId}_${Date.now()}.png`;

    // Upload to AttachmentStorageService
    const signatureUrl = await this.storage.storeAttachment(
      fileBuffer,
      fileName,
      'image/png',
    );

    // Save record
    const signature = await this.prisma.workOrderSignature.create({
      data: {
        ticket: { connect: { id: ticketId } },
        signeeName: dto.signeeName,
        signatureUrl,
        latitude: dto.latitude,
        longitude: dto.longitude,
        ipAddress: dto.ipAddress,
      },
    });

    return signature;
  }
}
