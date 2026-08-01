import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class POSService {
  private readonly logger = new Logger(POSService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a POS Counter Terminal
   */
  async registerCounter(
    name: string,
    code: string,
    branchId?: string,
    terminalIp?: string,
  ) {
    const existing = await this.prisma.pOSCounter.findUnique({
      where: { code },
    });
    if (existing) {
      return this.prisma.pOSCounter.update({
        where: { code },
        data: {
          name,
          branchId: branchId || null,
          terminalIp: terminalIp || null,
        },
      });
    }
    const counter = await this.prisma.pOSCounter.create({
      data: {
        name,
        code,
        branchId: branchId || null,
        terminalIp: terminalIp || null,
        status: 'ACTIVE',
      },
    });
    this.logger.log(
      `Registered POS Counter '${counter.name}' (${counter.code})`,
    );
    return counter;
  }

  /**
   * Opens a Cashier Shift Session
   */
  async openShift(
    counterId: string,
    cashierName: string,
    startingCash: number,
  ) {
    const counter = await this.prisma.pOSCounter.findUnique({
      where: { id: counterId },
    });
    if (!counter) {
      throw new NotFoundException(`POSCounter '${counterId}' not found.`);
    }

    const openShift = await this.prisma.pOSShift.findFirst({
      where: { counterId, status: 'OPEN' },
    });
    if (openShift) {
      throw new BadRequestException(
        `Shift is already OPEN on counter '${counter.name}'.`,
      );
    }

    const shift = await this.prisma.pOSShift.create({
      data: {
        counterId,
        cashierName,
        startingCash: Number(startingCash),
        status: 'OPEN',
      },
    });

    this.logger.log(
      `Opened POSShift for Cashier '${cashierName}' on Counter '${counter.code}' [Starting Cash: $${startingCash}]`,
    );
    return shift;
  }

  /**
   * Closes a Cashier Shift Session with cash count & variance
   */
  async closeShift(shiftId: string, closingCashCount: number) {
    const shift = await this.prisma.pOSShift.findUnique({
      where: { id: shiftId },
      include: { sales: { include: { payments: true } } },
    });
    if (!shift) {
      throw new NotFoundException(`POSShift '${shiftId}' not found.`);
    }

    const totalCashSales = shift.sales.reduce((acc, sale) => {
      const cashPayments = sale.payments
        .filter((p) => p.paymentMethod === 'CASH')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return acc + cashPayments;
    }, 0);

    const expectedCash = Number(shift.startingCash) + totalCashSales;
    const closing = Number(closingCashCount);
    const cashVariance = closing - expectedCash;

    const updated = await this.prisma.pOSShift.update({
      where: { id: shiftId },
      data: {
        endTime: new Date(),
        closingCashCount: closing,
        expectedCash,
        cashVariance,
        status: 'CLOSED',
      },
    });

    this.logger.log(
      `Closed POSShift '${shiftId}' [Expected: $${expectedCash}, Closing: $${closing}, Variance: $${cashVariance}]`,
    );
    return updated;
  }
}
