import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a new Fixed Asset with QR & Barcode tag generation
   */
  async registerAsset(data: {
    name: string;
    categoryId: string;
    description?: string;
    serialNumber?: string;
    locationId?: string;
    department?: string;
    branchId?: string;
    ownership?: string;
    purchaseCost: number;
    salvageValue?: number;
    usefulLifeMonths?: number;
    purchaseDate?: Date;
  }) {
    const assetTag = `AST-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const cost = Number(data.purchaseCost);
    const salvage = Number(data.salvageValue || 0);

    const asset = await this.prisma.asset.create({
      data: {
        assetTag,
        name: data.name,
        categoryId: data.categoryId,
        description: data.description || null,
        serialNumber: data.serialNumber || null,
        locationId: data.locationId || null,
        department: data.department || 'General Operations',
        branchId: data.branchId || null,
        ownership: data.ownership || 'OWNED',
        purchaseCost: cost,
        salvageValue: salvage,
        usefulLifeMonths: data.usefulLifeMonths || 60,
        accumulatedDepr: 0,
        netBookValue: cost,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : new Date(),
        qrCode: `QR-${assetTag}`,
        barcode: `BAR-${assetTag}`,
        status: 'AVAILABLE',
      },
    });

    this.logger.log(
      `Registered Asset '${asset.assetTag}' (${asset.name}) [Cost: $${cost}]`,
    );
    return asset;
  }

  /**
   * Updates asset status
   */
  async updateStatus(assetId: string, status: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset '${assetId}' not found.`);
    }

    const updated = await this.prisma.asset.update({
      where: { id: assetId },
      data: { status },
    });

    this.logger.log(`Updated Asset '${asset.assetTag}' status -> [${status}]`);
    return updated;
  }

  /**
   * Gets list of assets with search, filter, and pagination
   */
  async getAssets(query: {
    status?: string;
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) {
      where.OR = [
        { assetTag: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        include: { category: true, location: true, branch: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
