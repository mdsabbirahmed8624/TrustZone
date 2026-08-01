import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExportService {
  private readonly exportsDir = process.env.EXPORTS_DIR
    ? path.resolve(process.env.EXPORTS_DIR)
    : path.join('/tmp', 'exports');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  async triggerExport(
    userId: string,
    module: string,
    format: 'CSV' | 'EXCEL' | 'PDF',
  ) {
    // Create Job
    const job = await this.prisma.exportJob.create({
      data: {
        userId,
        module,
        exportType: format,
        status: 'PENDING',
      },
    });

    // Start background processing without awaiting
    this.processExportJob(job.id);

    return job;
  }

  async processExportJob(jobId: string) {
    await this.prisma.exportJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    try {
      const job = await this.prisma.exportJob.findUnique({
        where: { id: jobId },
      });
      if (!job) return;

      let csvContent = '';
      const data = await this.fetchModuleData(job.module);

      if (job.exportType === 'CSV' || job.exportType === 'EXCEL') {
        csvContent = this.convertToCSV(data, job.module);
      } else if (job.exportType === 'PDF') {
        csvContent = this.convertToHTMLPrint(data, job.module);
      }

      const fileExt = job.exportType === 'PDF' ? 'html' : 'csv';
      const fileName = `export-${job.module.toLowerCase()}-${jobId.substring(0, 8)}.${fileExt}`;
      const filePath = path.join(this.exportsDir, fileName);

      fs.writeFileSync(filePath, csvContent);
      const stats = fs.statSync(filePath);

      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          fileUrl: `/export/download/${jobId}`,
          fileSize: stats.size,
        },
      });
    } catch (err: any) {
      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', errorDetails: err.message },
      });
      console.error(`[Export Job Failed] Job: ${jobId}, Error: ${err.message}`);
    }
  }

  private async fetchModuleData(module: string): Promise<any[]> {
    const term = module.toUpperCase();
    if (term === 'TICKETS') {
      return this.prisma.ticket.findMany({
        include: { customer: true, device: true },
      });
    } else if (term === 'INVOICES') {
      return this.prisma.invoice.findMany({
        include: { ticket: { include: { customer: true } } },
      });
    } else if (term === 'CUSTOMERS') {
      return this.prisma.customer.findMany();
    } else if (term === 'INVENTORY') {
      return this.prisma.part.findMany({ include: { branchInventory: true } });
    } else if (term === 'AUDIT_LOGS') {
      return this.prisma.auditTrail.findMany({
        take: 500,
        orderBy: { createdAt: 'desc' },
      });
    }
    return [];
  }

  private convertToCSV(data: any[], module: string): string {
    if (data.length === 0) return 'No data available';

    // Resolve headers based on module
    let headers: string[] = [];
    let rowMapper: (item: any) => string[] = () => [];

    if (module.toUpperCase() === 'TICKETS') {
      headers = [
        'Ticket ID',
        'Customer',
        'Device',
        'Status',
        'SLA Deadline',
        'Cost',
        'Created At',
      ];
      rowMapper = (t) => [
        t.id,
        `${t.customer.firstName} ${t.customer.lastName}`,
        `${t.device.brand} ${t.device.model}`,
        t.status,
        t.slaDeadline?.toISOString(),
        t.estimatedCost?.toString(),
        t.createdAt?.toISOString(),
      ];
    } else if (module.toUpperCase() === 'INVOICES') {
      headers = [
        'Invoice ID',
        'Invoice Number',
        'Customer',
        'Subtotal',
        'Tax',
        'Total',
        'Status',
        'Created At',
      ];
      rowMapper = (inv) => [
        inv.id,
        inv.invoiceNumber,
        inv.ticket?.customer
          ? `${inv.ticket.customer.firstName} ${inv.ticket.customer.lastName}`
          : 'N/A',
        inv.subtotal.toString(),
        inv.tax.toString(),
        inv.total.toString(),
        inv.status,
        inv.createdAt.toISOString(),
      ];
    } else if (module.toUpperCase() === 'CUSTOMERS') {
      headers = [
        'Customer ID',
        'Name',
        'Email',
        'Phone',
        'Loyalty Points',
        'Due Balance',
        'Created At',
      ];
      rowMapper = (c) => [
        c.id,
        `${c.firstName} ${c.lastName}`,
        c.email,
        c.phone,
        c.loyaltyPoints.toString(),
        c.dueBalance.toString(),
        c.createdAt.toISOString(),
      ];
    } else {
      // General fall-back
      headers = Object.keys(data[0] || {});
      rowMapper = (item) => headers.map((h) => String(item[h] || ''));
    }

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const item of data) {
      const values = rowMapper(item).map((val) => {
        const escaped = (val || '').replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private convertToHTMLPrint(data: any[], module: string): string {
    // Return clean HTML wrapper for PDF print
    const rowsHtml = data
      .map((item) => {
        const cells = Object.keys(item)
          .map(
            (key) =>
              `<td>${typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key]}</td>`,
          )
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('\n');

    const headersHtml = Object.keys(data[0] || {})
      .map((key) => `<th>${key}</th>`)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TrustZone Export - ${module}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { text-align: center; }
        </style>
      </head>
      <body>
        <h1>TrustZone Care - ${module} Export</h1>
        <table>
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
  }

  async listJobs(userId: string) {
    return this.prisma.exportJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getFilePath(jobId: string, userId: string) {
    const job = await this.prisma.exportJob.findFirst({
      where: { id: jobId, userId },
    });
    if (!job || job.status !== 'COMPLETED' || !job.fileUrl) {
      throw new NotFoundException('Export file not found.');
    }

    const fileExt = job.exportType === 'PDF' ? 'html' : 'csv';
    const fileName = `export-${job.module.toLowerCase()}-${jobId.substring(0, 8)}.${fileExt}`;
    const filePath = path.join(this.exportsDir, fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Physical file has expired or was removed.');
    }

    return { filePath, fileName };
  }
}
