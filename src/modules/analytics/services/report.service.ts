import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateReportDto {
  name: string;
  reportType: 'EXECUTIVE' | 'INVENTORY' | 'FINANCE' | 'REPAIR';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recipients: string[];
  branchId?: string;
}

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createScheduledReport(dto: CreateReportDto) {
    this.logger.log(
      `Configuring scheduled report ${dto.name} with frequency ${dto.frequency}`,
    );
    return this.prisma.scheduledReport.create({
      data: {
        name: dto.name,
        reportType: dto.reportType,
        frequency: dto.frequency,
        recipients: dto.recipients,
        branchId: dto.branchId,
      },
    });
  }

  async getScheduledReports() {
    return this.prisma.scheduledReport.findMany({
      where: { isDeleted: false },
      include: { histories: true },
    });
  }

  async triggerReportGeneration(
    reportId: string,
    format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON',
    userId?: string,
  ) {
    this.logger.log(`Manual trigger report ID ${reportId} format ${format}`);

    const report = await this.prisma.scheduledReport.findFirst({
      where: { id: reportId, isDeleted: false },
    });

    if (!report)
      throw new NotFoundException(`Scheduled report ${reportId} not found.`);

    // Generate output file reference
    const timestamp = Date.now();
    const fileUrl = `/exports/reports/${report.name.toLowerCase().replace(/ /g, '_')}_${timestamp}.${format.toLowerCase()}`;

    // Create ReportHistory log
    return this.prisma.reportHistory.create({
      data: {
        scheduledReportId: report.id,
        reportName: report.name,
        fileUrl,
        format,
        generatedById: userId,
      },
    });
  }
}
