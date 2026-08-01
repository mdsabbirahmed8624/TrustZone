import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initiates asset transfer request
   */
  async requestTransfer(
    assetId: string,
    toLocation: string,
    fromLocation?: string,
    requestedBy?: string,
    notes?: string,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset '${assetId}' not found.`);
    }

    const transfer = await this.prisma.assetTransfer.create({
      data: {
        assetId,
        fromLocation: fromLocation || 'Head Office',
        toLocation,
        requestedBy: requestedBy || null,
        status: 'PENDING',
        notes: notes || null,
      },
    });

    await this.prisma.asset.update({
      where: { id: assetId },
      data: { status: 'IN_TRANSIT' },
    });

    this.logger.log(
      `Initiated Asset Transfer for '${asset.assetTag}' -> Location '${toLocation}'`,
    );
    return transfer;
  }

  /**
   * Approves asset transfer
   */
  async approveTransfer(transferId: string) {
    const transfer = await this.prisma.assetTransfer.update({
      where: { id: transferId },
      data: { status: 'APPROVED' },
    });

    await this.prisma.asset.update({
      where: { id: transfer.assetId },
      data: { status: 'AVAILABLE' },
    });

    this.logger.log(`Approved Asset Transfer '${transferId}'`);
    return transfer;
  }
}
