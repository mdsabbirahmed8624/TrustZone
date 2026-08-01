import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MilestoneCompletionBook9Service {
  private readonly logger = new Logger(MilestoneCompletionBook9Service.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Certify Phase 14 enterprise milestone completion.
   */
  async certifyMilestoneCompletion(dto: {
    completionCode: string;
    milestoneTitle?: string;
    certifiedByRole?: string;
  }) {
    this.logger.log(
      `Certifying Phase 14 enterprise milestone completion: ${dto.completionCode}`,
    );

    const certificate =
      await this.prisma.autonomousMilestoneCompletionBook9.create({
        data: {
          completionCode: dto.completionCode,
          milestoneTitle:
            dto.milestoneTitle ?? 'PHASE_14_AUTONOMOUS_ENTERPRISE_OPERATIONS',
          certifiedByRole: dto.certifiedByRole ?? 'CHIEF_ENTERPRISE_ARCHITECT',
          completionStatus: 'PASSED_CERTIFIED',
          verifiedAt: new Date(),
        },
      });

    this.logger.log(`Milestone completion certified: ${certificate.id}`);
    return certificate;
  }

  /**
   * Retrieve all milestone completion certificates.
   */
  async getCertificates() {
    return this.prisma.autonomousMilestoneCompletionBook9.findMany({
      orderBy: { verifiedAt: 'desc' },
    });
  }
}
