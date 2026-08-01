import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WarrantyService {
  private readonly logger = new Logger(WarrantyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a Warranty for a customer device or part
   */
  async registerWarranty(data: {
    customerId?: string;
    warrantyCode?: string;
    durationMonths?: number;
    startDate?: Date;
    terms?: string;
    warrantyType?: string;
    deviceBrand?: string;
    deviceModel?: string;
    serialOrImei?: string;
  }) {
    const start = data.startDate ? new Date(data.startDate) : new Date();
    const months = data.durationMonths || 12;
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + months);

    const warrantyNumber =
      data.warrantyCode || `TZ-WARR-${Date.now().toString().slice(-6)}`;

    const warranty = await this.prisma.warranty.create({
      data: {
        customerId: data.customerId || undefined,
        warrantyNumber,
        warrantyType: data.warrantyType || 'SERVICE',
        deviceBrand: data.deviceBrand || 'Generic',
        deviceModel: data.deviceModel || 'Generic',
        serialOrImei: data.serialOrImei || 'N/A',
        durationMonths: months,
        startDate: start,
        endDate: expiry,
        terms: data.terms || 'Standard Manufacturer & Service Warranty',
        status: 'ACTIVE',
      },
    });

    this.logger.log(
      `Registered Warranty '${warranty.warrantyNumber}' [Expires: ${expiry.toISOString()}]`,
    );
    return warranty;
  }

  /**
   * Submits a Warranty Claim
   */
  async submitClaim(
    warrantyId: string,
    claimReason: string,
    description?: string,
  ) {
    const warranty = await this.prisma.warranty.findUnique({
      where: { id: warrantyId },
    });
    if (!warranty) {
      throw new NotFoundException(`Warranty '${warrantyId}' not found.`);
    }

    const claimNumber = `TZ-CLM-${Date.now().toString().slice(-6)}`;
    const isValid =
      new Date() <= new Date(warranty.endDate) && warranty.status === 'ACTIVE';

    const claim = await this.prisma.warrantyClaim.create({
      data: {
        warrantyId,
        claimNumber,
        issueDescription:
          claimReason || description || 'Warranty Claim Requested',
        notes: description || null,
        status: isValid ? 'PENDING' : 'REJECTED',
      },
    });

    this.logger.log(
      `Submitted Warranty Claim '${claimNumber}' for Warranty '${warranty.warrantyNumber}' [Status: ${claim.status}]`,
    );
    return claim;
  }

  /**
   * Processes warranty claim approval/rejection
   */
  async processClaim(
    claimId: string,
    status: 'APPROVED' | 'REJECTED',
    resolutionNotes?: string,
  ) {
    const claim = await this.prisma.warrantyClaim.update({
      where: { id: claimId },
      data: {
        status,
        resolutionDetails: resolutionNotes || null,
      },
    });

    this.logger.log(`Processed Warranty Claim '${claimId}' -> [${status}]`);
    return claim;
  }
}
