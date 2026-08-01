import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerJourneyService {
  private readonly logger = new Logger(CustomerJourneyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initializes or fetches 360-degree Customer Journey
   */
  async getCustomerJourney(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        tickets: true,
        communications: true,
        feedbacks: true,
        warranties: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer '${customerId}' not found.`);
    }

    let journey = await this.prisma.customerJourney.findFirst({
      where: { customerId },
      include: { touchpoints: { orderBy: { timestamp: 'desc' } } },
    });

    if (!journey) {
      // Calculate LTV
      const ltv = customer.tickets.reduce(
        (acc, curr) => acc + Number(curr.estimatedCost || 0),
        0,
      );
      let lifecycleStage:
        'LEAD' | 'ONBOARDED' | 'ACTIVE' | 'LOYAL' | 'AT_RISK' | 'CHURNED' =
        'ONBOARDED';
      if (ltv > 1000) lifecycleStage = 'LOYAL';
      else if (customer.tickets.length > 0) lifecycleStage = 'ACTIVE';

      journey = await this.prisma.customerJourney.create({
        data: {
          customerId,
          lifecycleStage,
          lifetimeValue: ltv,
        },
        include: { touchpoints: { orderBy: { timestamp: 'desc' } } },
      });
    }

    return {
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      loyaltyPoints: customer.loyaltyPoints,
      journeyId: journey.id,
      lifecycleStage: journey.lifecycleStage,
      lifetimeValue: Number(journey.lifetimeValue),
      totalRepairs: customer.tickets.length,
      totalFeedback: customer.feedbacks.length,
      touchpoints: journey.touchpoints,
      tickets: customer.tickets,
    };
  }

  /**
   * Logs a new Customer Touchpoint event across any ERP module
   */
  async logTouchpoint(
    customerId: string,
    channel: string,
    title: string,
    description?: string,
    metadata?: any,
  ) {
    let journey = await this.prisma.customerJourney.findFirst({
      where: { customerId },
    });
    if (!journey) {
      journey = await this.prisma.customerJourney.create({
        data: { customerId, lifecycleStage: 'ACTIVE', lifetimeValue: 0 },
      });
    }

    const touchpoint = await this.prisma.customerTouchpoint.create({
      data: {
        customerJourneyId: journey.id,
        customerId,
        channel,
        title,
        description: description || null,
        metadata: metadata || null,
      },
    });

    this.logger.log(
      `Logged Touchpoint '${title}' [${channel}] for Customer '${customerId}'`,
    );
    return touchpoint;
  }
}
