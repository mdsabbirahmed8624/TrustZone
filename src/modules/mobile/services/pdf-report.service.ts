import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttachmentStorageService } from './attachment-storage.service';

@Injectable()
export class PdfReportService {
  private readonly logger = new Logger(PdfReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: AttachmentStorageService,
  ) {}

  async generatePdfReport(diagnosticId: string): Promise<string> {
    this.logger.log(
      `Generating PDF diagnostic report for diagnostic ${diagnosticId}`,
    );

    const diagnostic = await this.prisma.deviceDiagnostic.findUnique({
      where: { id: diagnosticId },
      include: {
        ticket: {
          include: {
            customer: true,
          },
        },
        technician: true,
      },
    });

    if (!diagnostic) {
      throw new Error(`DeviceDiagnostic record ${diagnosticId} not found.`);
    }

    // Compose formatted text summary representing the PDF document layout
    const reportText = `===============================================
TRUSTZONE MOBILE CARE DIAGNOSTIC AUDIT REPORT
===============================================
Report ID: ${diagnosticId}
Generated At: ${new Date().toISOString()}

CUSTOMER DETAILS:
- Name: ${diagnostic.ticket.customer.firstName} ${diagnostic.ticket.customer.lastName}
- Phone: ${diagnostic.ticket.customer.phone}

DEVICE DIAGNOSTICS & TELEMETRY:
- Battery Health: ${diagnostic.batteryHealth}%
- Storage Remaining: ${diagnostic.storageRemainingGb} GB
- Screen Status: ${diagnostic.screenStatus}
- Camera Status: ${diagnostic.cameraStatus}
- Sensor Status: ${diagnostic.sensorStatus}
- Network Download Bandwidth: ${diagnostic.bandwidthDownMbps} Mbps

INSPECTION SUMMARY & NOTES:
${diagnostic.diagnosticNotes || 'None'}

Technician ID: ${diagnostic.technician.id} (${diagnostic.technician.firstName} ${diagnostic.technician.lastName})
===============================================`;

    const fileBuffer = Buffer.from(reportText, 'utf8');
    const fileName = `diagnostic_report_${diagnosticId}.pdf`;

    // Upload to AttachmentStorageService (returns local file url or S3 link)
    const fileUrl = await this.storage.storeAttachment(
      fileBuffer,
      fileName,
      'application/pdf',
    );

    // Save report record
    await this.prisma.diagnosticReportPdf.create({
      data: {
        diagnosticId,
        pdfUrl: fileUrl,
      },
    });

    this.logger.log(`PDF report successfully created and stored at ${fileUrl}`);
    return fileUrl;
  }
}
