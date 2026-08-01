import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InspectionService {
  private readonly logger = new Logger(InspectionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submits asset condition inspection report
   */
  async submitInspection(data: {
    assetId: string;
    inspectorName: string;
    condition?: string;
    score?: number;
    notes?: string;
    passed?: boolean;
  }) {
    const inspection = await this.prisma.assetInspection.create({
      data: {
        assetId: data.assetId,
        inspectorName: data.inspectorName,
        condition: data.condition || 'GOOD',
        score: Number(data.score ?? 100),
        notes: data.notes || null,
        passed: data.passed ?? true,
      },
    });

    this.logger.log(
      `Submitted Asset Inspection for Asset '${data.assetId}' - Score: ${inspection.score}/100 [Condition: ${inspection.condition}]`,
    );
    return inspection;
  }
}
