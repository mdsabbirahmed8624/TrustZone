import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BusinessIntelligenceService {
  private readonly logger = new Logger(BusinessIntelligenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBusinessIntelligence(branchId?: string) {
    this.logger.log(
      `Compiling Business Intelligence insights for branch ${branchId || 'ALL'}`,
    );

    const filter: any = {};
    if (branchId) {
      filter.branchId = branchId;
    }

    // 1. Brand-wise Repairs (e.g. Apple, Samsung, Xiaomi)
    const brandRepairs = await (this.prisma.device as any).groupBy({
      by: ['brand'],
      where: branchId ? { tickets: { some: { branchId } } } : {},
      _count: { id: true },
    });
    const brandWiseRepairs = brandRepairs.map((br: any) => ({
      brand: br.brand,
      count: br._count.id,
    }));

    // 2. Model-wise Repairs
    const modelRepairs = await (this.prisma.device as any).groupBy({
      by: ['modelName'],
      where: branchId ? { tickets: { some: { branchId } } } : {},
      _count: { id: true },
    });
    const modelWiseRepairs = modelRepairs.map((mr: any) => ({
      model: mr.modelName,
      count: mr._count.id,
    }));

    // 3. Common Fault Analysis (relying on ticket issue descriptions)
    const tickets = await this.prisma.ticket.findMany({
      where: filter,
      select: { diagnosisNotes: true },
    });
    const faultKeywords = [
      'screen',
      'battery',
      'charging',
      'water',
      'software',
      'camera',
    ];
    const faultCounts = faultKeywords.map((keyword) => ({
      issue: keyword,
      count: tickets.filter((t: any) =>
        t.diagnosisNotes?.toLowerCase().includes(keyword),
      ).length,
    }));

    // 4. Warranty Claims Trend
    const claims = await this.prisma.warrantyClaim.findMany({
      where: branchId ? { branchId } : {},
      select: { status: true, createdAt: true },
    });
    const claimStats = {
      total: claims.length,
      approved: claims.filter((c) => c.status === 'APPROVED').length,
      rejected: claims.filter((c) => c.status === 'REJECTED').length,
    };

    return {
      brandWiseRepairs,
      modelWiseRepairs,
      commonFaults: faultCounts,
      warrantyClaimsSummary: claimStats,
      timestamp: new Date(),
    };
  }
}
