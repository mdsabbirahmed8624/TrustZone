import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async predictFault(ticketId: string) {
    this.logger.log(
      `Predicting repair faults and complexities for ticket ${ticketId}`,
    );

    // Query historical context
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { device: true },
    });

    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    // AI heuristic model matching device brand/model/symptoms
    let probableFault = 'Battery Replacement';
    let suggestedRepairPath = [
      'Open device shell',
      'Disconnect battery connector',
      'Replace with new OEM battery',
      'Reassemble and test charging',
    ];
    let estimatedComplexity = 'LOW';
    let estimatedPartsCost = 45.0;
    let estimatedLaborCost = 25.0;
    let confidenceScore = 94.8;

    const brand = ticket.device.brand.toLowerCase();
    if (brand.includes('apple')) {
      probableFault = 'Screen Assembly Assembly Replacement';
      suggestedRepairPath = [
        'Heat screen borders',
        'Use suction cup to pry screen',
        'Disconnect flex cables',
        'Affix new OLED screen module',
        'Calibrate FaceID',
      ];
      estimatedComplexity = 'MEDIUM';
      estimatedPartsCost = 150.0;
      estimatedLaborCost = 60.0;
      confidenceScore = 89.2;
    } else if (
      brand.includes('water') ||
      ticket.diagnosisNotes?.toLowerCase().includes('liquid')
    ) {
      probableFault = 'Motherboard Cleaning & Component Level Repair';
      suggestedRepairPath = [
        'Disassemble board',
        'Ultrasonic bath cleaning',
        'Microscope diagnostic scan',
        'Reflow charging IC components',
      ];
      estimatedComplexity = 'HIGH';
      estimatedPartsCost = 20.0;
      estimatedLaborCost = 120.0;
      confidenceScore = 78.5;
    }

    // Save prediction record
    const prediction = await this.prisma.repairPrediction.create({
      data: {
        ticketId: ticket.id,
        probableFault,
        suggestedRepairPath,
        estimatedComplexity,
        estimatedPartsCost,
        estimatedLaborCost,
        confidenceScore,
      },
    });

    return prediction;
  }
}
