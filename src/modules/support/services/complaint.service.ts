import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ComplaintService {
  private readonly logger = new Logger(ComplaintService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submits a formal Customer Complaint
   */
  async submitComplaint(
    customerId: string,
    subject: string,
    details: string,
    severity = 'MEDIUM',
  ) {
    const complaintNumber = `CMP-${Date.now().toString().slice(-6)}`;

    const complaint = await this.prisma.customerComplaint.create({
      data: {
        complaintNumber,
        customerId,
        subject,
        details,
        severity,
        status: 'SUBMITTED',
      },
    });

    this.logger.log(
      `Submitted Customer Complaint '${complaintNumber}' for Customer '${customerId}' [Severity: ${severity}]`,
    );
    return complaint;
  }

  /**
   * Resolves a Customer Complaint
   */
  async resolveComplaint(complaintId: string, resolutionNotes: string) {
    const complaint = await this.prisma.customerComplaint.update({
      where: { id: complaintId },
      data: {
        status: 'RESOLVED',
        resolutionNotes,
        resolvedAt: new Date(),
      },
    });

    this.logger.log(`Resolved Customer Complaint '${complaintId}'`);
    return complaint;
  }
}
