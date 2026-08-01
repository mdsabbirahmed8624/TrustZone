import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface RecordPaymentDto {
  amount: number;
  method: PaymentMethod;
  transactionRef?: string;
}

@Injectable()
export class MobileBillingService {
  private readonly logger = new Logger(MobileBillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateInvoiceDetails(ticketId: string) {
    this.logger.log(
      `Calculating dynamic invoice parts + labor for ticket ${ticketId}`,
    );

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        technicianTelemetries: true,
      },
    });

    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found.`);
    }

    // 1. Calculate Labor Duration Cost
    const completedLogs = ticket.technicianTelemetries.filter(
      (t) => t.action === 'REPAIR_COMPLETE',
    );
    const totalDurationMin = completedLogs.reduce(
      (sum, log) => sum + (log.durationMin || 0),
      0,
    );

    // Charge $1 per minute of labor ($60 / hour) with a minimum base charge of $50
    const laborDuration = totalDurationMin > 0 ? totalDurationMin : 60;
    const laborCost = Math.max(50, laborDuration * 1.0);

    // 2. Calculate Parts Cost
    // Each string in partsRequired adds $35 flat material cost
    const partsCount = ticket.partsRequired ? ticket.partsRequired.length : 0;
    const partsCost = partsCount * 35.0;

    const subtotal = laborCost + partsCost;
    const taxRate = 0.08; // 8% standard tax
    const tax = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    return {
      ticketId,
      laborMinutes: laborDuration,
      laborCost,
      partsCount,
      partsCost,
      subtotal,
      tax,
      total,
    };
  }

  async recordMobilePayment(ticketId: string, dto: RecordPaymentDto) {
    this.logger.log(
      `Recording mobile payment for ticket ${ticketId} of amount $${dto.amount}`,
    );

    const paymentLog = await this.prisma.mobilePaymentLog.create({
      data: {
        ticket: { connect: { id: ticketId } },
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.SUCCESS,
        transactionRef:
          dto.transactionRef ||
          `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      },
    });

    // Automatically transition ticket status to completed/delivered upon successful checkout payment
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'delivered',
        deliveredAt: new Date(),
      },
    });

    return paymentLog;
  }

  async getWorkOrderSummary(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        workOrderSignatures: true,
        mobilePaymentLogs: true,
        deviceDiagnostics: true,
      },
    });

    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found.`);
    }

    const completedPayments = ticket.mobilePaymentLogs.filter(
      (p) => p.status === PaymentStatus.SUCCESS,
    );
    const isPaid = completedPayments.length > 0;
    const hasSignature = ticket.workOrderSignatures.length > 0;

    return {
      ticketId,
      status: ticket.status,
      hasSignature,
      isPaid,
      signatureDetails: ticket.workOrderSignatures,
      paymentDetails: ticket.mobilePaymentLogs,
      diagnosticsCount: ticket.deviceDiagnostics.length,
    };
  }
}
