import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DisposalService {
  private readonly logger = new Logger(DisposalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processes Asset Disposal (Scrap, Sale, Donation, Trade-In)
   */
  async disposeAsset(
    assetId: string,
    disposalType = 'SCRAP',
    salePrice = 0,
    reason?: string,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset '${assetId}' not found.`);
    }

    const bookValueAtDisp = Number(asset.netBookValue);
    const gainLossAmount = Number(salePrice) - bookValueAtDisp;

    const disposal = await this.prisma.assetDisposal.create({
      data: {
        assetId,
        disposalType,
        salePrice: Number(salePrice),
        bookValueAtDisp,
        gainLossAmount,
        reason: reason || null,
      },
    });

    await this.prisma.asset.update({
      where: { id: assetId },
      data: { status: 'DISPOSED' },
    });

    this.logger.log(
      `Disposed Asset '${asset.assetTag}' [Type: ${disposalType}, Gain/Loss: $${gainLossAmount.toFixed(2)}]`,
    );
    return disposal;
  }
}
