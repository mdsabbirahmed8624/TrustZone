import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CostCenterService {
  private readonly logger = new Logger(CostCenterService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upserts a Cost Center
   */
  async upsertCostCenter(
    code: string,
    name: string,
    department?: string,
    managerName?: string,
  ) {
    const existing = await this.prisma.costCenter.findUnique({
      where: { code },
    });
    let costCenter;
    if (existing) {
      costCenter = await this.prisma.costCenter.update({
        where: { code },
        data: {
          name,
          department: department || null,
          managerName: managerName || null,
        },
      });
    } else {
      costCenter = await this.prisma.costCenter.create({
        data: {
          code,
          name,
          department: department || null,
          managerName: managerName || null,
        },
      });
    }

    this.logger.log(
      `Upserted CostCenter '${costCenter.name}' (${costCenter.code})`,
    );
    return costCenter;
  }
}
