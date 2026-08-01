import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssetCategoryService {
  private readonly logger = new Logger(AssetCategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates or updates an Asset Category
   */
  async upsertCategory(
    name: string,
    code: string,
    description?: string,
    depreciationMethod = 'STRAIGHT_LINE',
    defaultUsefulLife = 60,
  ) {
    const category = await this.prisma.assetCategory.upsert({
      where: { code },
      update: {
        name,
        description: description || null,
        depreciationMethod,
        defaultUsefulLife,
      },
      create: {
        name,
        code,
        description: description || null,
        depreciationMethod,
        defaultUsefulLife,
      },
    });

    this.logger.log(
      `Upserted AssetCategory '${category.name}' (${category.code})`,
    );
    return category;
  }

  /**
   * Retrieves all asset categories
   */
  async getCategories() {
    return this.prisma.assetCategory.findMany({ orderBy: { name: 'asc' } });
  }
}
