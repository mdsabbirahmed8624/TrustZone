import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutiveSignoffBook8Service {
  private readonly logger = new Logger(ExecutiveSignoffBook8Service.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute executive platform release sign-off approval.
   */
  async approveReleaseSignoff(dto: {
    signoffCode: string;
    releaseVersion?: string;
    signoffRole?: string;
  }) {
    this.logger.log(
      `Executing executive platform release sign-off: ${dto.signoffCode}`,
    );

    const signoff = await this.prisma.executiveSignoffBook8.create({
      data: {
        signoffCode: dto.signoffCode,
        releaseVersion: dto.releaseVersion ?? '14.8.0-GA',
        signoffRole: dto.signoffRole ?? 'CHIEF_TECHNOLOGY_OFFICER',
        approvalStatus: 'APPROVED',
        signedOffAt: new Date(),
      },
    });

    this.logger.log(
      `Executive platform release sign-off approved: ${signoff.id}`,
    );
    return signoff;
  }

  /**
   * Retrieve all executive release sign-off records.
   */
  async getSignoffs() {
    return this.prisma.executiveSignoffBook8.findMany({
      orderBy: { signedOffAt: 'desc' },
    });
  }
}
