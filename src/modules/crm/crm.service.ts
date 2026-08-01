import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import {
  IEmailProvider,
  ISmsGateway,
  IWhatsAppProvider,
} from './interfaces/crm-integrations.interface';

@Injectable()
export class CrmService
  implements OnModuleInit, IEmailProvider, ISmsGateway, IWhatsAppProvider
{
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // Start background checking scheduler for loyalty point expiration and survey followups
    // We run the task every 60 seconds (checks for surveys) and every 24 hours for expirations in production,
    // but we can expose manual triggers for testing.
    setInterval(async () => {
      try {
        await this.dispatchPendingNpsSurveys();
      } catch (err) {
        console.error('Error running NPS survey dispatcher:', err);
      }
    }, 60000); // Check every minute
  }

  // ==========================================
  // FUTURE INTEGRATIONS MOCK PROVIDERS
  // ==========================================
  async sendEmail(to: string, subject: string, body: string) {
    console.log(
      `[MOCK EMAIL PROVIDER] Sending email to ${to}. Subject: ${subject}`,
    );
    return {
      success: true,
      messageId: `email-${Date.now()}`,
      status: 'Delivered',
    };
  }

  async sendSms(to: string, message: string) {
    console.log(`[MOCK SMS GATEWAY] Sending SMS to ${to}: ${message}`);
    return {
      success: true,
      messageId: `sms-${Date.now()}`,
      status: 'Delivered',
    };
  }

  async sendWhatsApp(to: string, message: string) {
    console.log(
      `[MOCK WHATSAPP PROVIDER] Sending WhatsApp to ${to}: ${message}`,
    );
    return {
      success: true,
      messageId: `wa-${Date.now()}`,
      status: 'Delivered',
    };
  }

  // ==========================================
  // LOYALTY MODULE CORE BUSINESS LOGIC
  // ==========================================

  // 1. Accrual Points for Payment (1 point per ৳100 spent)
  async accrualPointsForPayment(
    customerId: string,
    paymentAmount: number,
    referenceId?: string,
    txInput?: any,
  ) {
    const points = Math.floor(Number(paymentAmount) / 100);
    if (points <= 0) return null;

    const tx = txInput || this.prisma;

    // Check if customer exists
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer)
      throw new NotFoundException(`Customer with ID ${customerId} not found.`);

    // 1. Increment Customer.loyaltyPoints
    const updatedCustomer = await tx.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: { increment: points } },
    });

    // 2. Create LoyaltyTransaction of type 'EARNED' with remainingPoints
    const transaction = await tx.loyaltyTransaction.create({
      data: {
        customerId,
        pointsDelta: points,
        remainingPoints: points,
        type: 'EARNED',
        description: `Points earned on invoice payment. Amount: ৳${paymentAmount}`,
        referenceId,
      },
    });

    // 3. Log Activity
    await tx.customerActivity.create({
      data: {
        customerId,
        type: 'LOYALTY_EARNED',
        title: 'Loyalty Points Earned',
        description: `Earned ${points} points on payment of ৳${paymentAmount}. New balance: ${updatedCustomer.loyaltyPoints} points.`,
        referenceId,
      },
    });

    return transaction;
  }

  // 2. Redeem Points (1 point = ৳1 discount)
  async redeemPoints(
    dto: RedeemPointsDto,
    staffId?: string,
    staffName?: string,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer)
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found.`,
      );

    if (customer.loyaltyPoints < dto.points) {
      throw new BadRequestException(
        `Insufficient points balance. Customer has ${customer.loyaltyPoints} points, requested redemption of ${dto.points} points.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Decrement Customer.loyaltyPoints
      const updatedCustomer = await tx.customer.update({
        where: { id: dto.customerId },
        data: { loyaltyPoints: { decrement: dto.points } },
      });

      // 2. Create LoyaltyTransaction of type 'REDEEMED'
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          customerId: dto.customerId,
          pointsDelta: -dto.points,
          type: 'REDEEMED',
          description:
            dto.description ||
            `Redeemed ${dto.points} points for invoice discount.`,
          referenceId: dto.referenceId,
          staffId,
          staffName,
        },
      });

      // 3. Deduct from active EARNED transactions in FIFO order (FIFO remainingPoints allocation)
      let pointsToRedeem = dto.points;
      const activeEarnedTx = await tx.loyaltyTransaction.findMany({
        where: {
          customerId: dto.customerId,
          type: 'EARNED',
          remainingPoints: { gt: 0 },
        },
        orderBy: { createdAt: 'asc' },
      });

      for (const et of activeEarnedTx) {
        if (pointsToRedeem <= 0) break;

        const deduct = Math.min(et.remainingPoints, pointsToRedeem);
        await tx.loyaltyTransaction.update({
          where: { id: et.id },
          data: { remainingPoints: { decrement: deduct } },
        });

        pointsToRedeem -= deduct;
      }

      // 4. Log Activity
      await tx.customerActivity.create({
        data: {
          customerId: dto.customerId,
          type: 'LOYALTY_REDEEMED',
          title: 'Loyalty Points Redeemed',
          description: `Redeemed ${dto.points} points. New balance: ${updatedCustomer.loyaltyPoints} points.`,
          referenceId: dto.referenceId,
          staffId,
          staffName,
        },
      });

      return transaction;
    });
  }

  // 3. Manual Point Adjustments (Increments / Decrements)
  async adjustPoints(
    dto: AdjustPointsDto,
    staffId?: string,
    staffName?: string,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer)
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found.`,
      );

    const newPoints = customer.loyaltyPoints + dto.pointsDelta;
    if (newPoints < 0) {
      throw new BadRequestException(
        `Invalid adjustment. Customer loyalty balance cannot fall below zero. Current points: ${customer.loyaltyPoints}.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Customer.loyaltyPoints
      const updatedCustomer = await tx.customer.update({
        where: { id: dto.customerId },
        data: { loyaltyPoints: newPoints },
      });

      // 2. Create LoyaltyTransaction of type 'ADJUSTED'
      // If we are adjusting positive, we should also track remainingPoints so they can expire.
      const remaining = dto.pointsDelta > 0 ? dto.pointsDelta : 0;
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          customerId: dto.customerId,
          pointsDelta: dto.pointsDelta,
          remainingPoints: remaining,
          type: 'ADJUSTED',
          description:
            dto.description ||
            `Loyalty balance adjusted by staff. Delta: ${dto.pointsDelta > 0 ? '+' : ''}${dto.pointsDelta}.`,
          staffId,
          staffName,
        },
      });

      // If we are adjusting negative, we should also deduct from remainingPoints in FIFO order
      if (dto.pointsDelta < 0) {
        let pointsToDeduct = Math.abs(dto.pointsDelta);
        const activeEarnedTx = await tx.loyaltyTransaction.findMany({
          where: {
            customerId: dto.customerId,
            type: { in: ['EARNED', 'ADJUSTED'] },
            remainingPoints: { gt: 0 },
          },
          orderBy: { createdAt: 'asc' },
        });

        for (const et of activeEarnedTx) {
          if (pointsToDeduct <= 0) break;

          const deduct = Math.min(et.remainingPoints, pointsToDeduct);
          await tx.loyaltyTransaction.update({
            where: { id: et.id },
            data: { remainingPoints: { decrement: deduct } },
          });
          pointsToDeduct -= deduct;
        }
      }

      // 3. Log Activity
      await tx.customerActivity.create({
        data: {
          customerId: dto.customerId,
          type: 'LOYALTY_ADJUSTED',
          title: 'Loyalty Points Adjusted',
          description: `Loyalty points manually adjusted by ${dto.pointsDelta > 0 ? 'adding' : 'deducting'} ${Math.abs(dto.pointsDelta)} points. New balance: ${updatedCustomer.loyaltyPoints} points.`,
          staffId,
          staffName,
        },
      });

      return transaction;
    });
  }

  // 4. Loyalty points expiration routine (runs daily / manual triggers)
  async expireLoyaltyPoints(expiryDays: number = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - expiryDays);

    // Get all transactions that have expired and still have remainingPoints
    const expiredTransactions = await this.prisma.loyaltyTransaction.findMany({
      where: {
        createdAt: { lte: cutoffDate },
        remainingPoints: { gt: 0 },
        type: { in: ['EARNED', 'ADJUSTED'] },
      },
      orderBy: { customerId: 'asc' },
    });

    if (expiredTransactions.length === 0) {
      return { success: true, expiredCustomerCount: 0, expiredPointsCount: 0 };
    }

    // Group by customer to consolidate expiration transactions
    const customerExpirations: Record<
      string,
      { totalPoints: number; ids: string[] }
    > = {};
    for (const et of expiredTransactions) {
      if (!customerExpirations[et.customerId]) {
        customerExpirations[et.customerId] = { totalPoints: 0, ids: [] };
      }
      customerExpirations[et.customerId].totalPoints += et.remainingPoints;
      customerExpirations[et.customerId].ids.push(et.id);
    }

    let expiredPointsCount = 0;
    const expiredCustomerCount = Object.keys(customerExpirations).length;

    await this.prisma.$transaction(async (tx) => {
      for (const customerId of Object.keys(customerExpirations)) {
        const { totalPoints, ids } = customerExpirations[customerId];
        expiredPointsCount += totalPoints;

        // Set remainingPoints to 0 for these transactions
        await tx.loyaltyTransaction.updateMany({
          where: { id: { in: ids } },
          data: { remainingPoints: 0 },
        });

        // Decrement customer's loyalty balance
        const updatedCustomer = await tx.customer.update({
          where: { id: customerId },
          data: { loyaltyPoints: { decrement: totalPoints } },
        });

        // Create EXPIRED transaction
        await tx.loyaltyTransaction.create({
          data: {
            customerId,
            pointsDelta: -totalPoints,
            type: 'EXPIRED',
            description: `Expired ${totalPoints} loyalty points due to inactivity period (${expiryDays} days limit).`,
          },
        });

        // Log Activity
        await tx.customerActivity.create({
          data: {
            customerId,
            type: 'LOYALTY_EXPIRED',
            title: 'Loyalty Points Expired',
            description: `Expired ${totalPoints} points due to 365-day age limit. New balance: ${updatedCustomer.loyaltyPoints} points.`,
          },
        });
      }
    });

    return { success: true, expiredCustomerCount, expiredPointsCount };
  }

  // ==========================================
  // COMMUNICATIONS LOG SERVICE
  // ==========================================
  async findAllCommunications(query: {
    search?: string;
    type?: string;
    status?: string;
  }) {
    const where: any = {};
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { message: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
        {
          customer: {
            firstName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            lastName: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    return this.prisma.customerCommunication.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async logCommunication(
    dto: CreateCommunicationDto,
    staffId?: string,
    staffName?: string,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer)
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found.`,
      );

    // Check preferred contact time/channel constraints
    if (customer.doNotDisturb) {
      console.warn(
        `WARNING: Customer ${customer.firstName} ${customer.lastName} is on Do Not Disturb.`,
      );
    }

    let status = dto.status || 'Sent';
    let messageId = `mock-${Date.now()}`;

    // Perform mock dispatching
    if (dto.type === 'SMS') {
      const res = await this.sendSms(customer.phone, dto.message);
      status = res.status;
      messageId = res.messageId;
    } else if (dto.type === 'Email') {
      const res = await this.sendEmail(
        customer.email,
        dto.subject || 'TrustZone Alert',
        dto.message,
      );
      status = res.status;
      messageId = res.messageId;
    } else if (dto.type === 'WhatsApp') {
      const res = await this.sendWhatsApp(customer.phone, dto.message);
      status = res.status;
      messageId = res.messageId;
    }

    const communication = await this.prisma.customerCommunication.create({
      data: {
        customerId: dto.customerId,
        type: dto.type,
        subject: dto.subject || null,
        message: dto.message,
        status,
        staffId,
        staffName,
      },
    });

    // Log Activity
    const activityType =
      dto.type === 'SMS'
        ? 'SMS_SENT'
        : dto.type === 'Email'
          ? 'EMAIL_SENT'
          : 'WHATSAPP_SENT';
    await this.prisma.customerActivity.create({
      data: {
        customerId: dto.customerId,
        type: activityType,
        title: `${dto.type} Logged`,
        description: `Outgoing message sent via ${dto.type}. Status: ${status}. Subject: "${dto.subject || 'N/A'}"`,
        staffId,
        staffName,
      },
    });

    return communication;
  }

  // ==========================================
  // NPS & SATISFACTION FEEDBACK LOGIC
  // ==========================================

  // 1. Find all feedback records
  async findAllFeedback(query: { search?: string; status?: string }) {
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { comments: { contains: query.search, mode: 'insensitive' } },
        {
          customer: {
            firstName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            lastName: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    return this.prisma.customerFeedback.findMany({
      where,
      include: {
        customer: true,
        ticket: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 2. Submit customer response
  async submitFeedback(feedbackId: string, dto: SubmitFeedbackDto) {
    const feedback = await this.prisma.customerFeedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException(
        `Feedback record with ID ${feedbackId} not found.`,
      );
    }

    const completed = await this.prisma.customerFeedback.update({
      where: { id: feedbackId },
      data: {
        npsScore: dto.npsScore,
        comments: dto.comments || null,
        wouldRecommend: dto.wouldRecommend,
        followUpRequired: dto.followUpRequired ?? dto.npsScore <= 6, // Auto follow-up if detractor
        assignedStaffId: dto.assignedStaffId || null,
        assignedStaffName: dto.assignedStaffId ? 'Staff Assigned' : null,
        resolutionStatus: dto.resolutionStatus || 'PENDING',
        responseDate: new Date(),
        status: 'COMPLETED',
        rating: Math.round(dto.npsScore / 2), // Map 10 scale to 5 star rating
      },
    });

    // Log Activity
    await this.prisma.customerActivity.create({
      data: {
        customerId: feedback.customerId,
        type: 'FEEDBACK_SUBMITTED',
        title: 'NPS Survey Feedback Received',
        description: `Customer submitted feedback. Score: ${dto.npsScore}/10 (Rating: ${Math.round(dto.npsScore / 2)} Stars). Comment: "${dto.comments || 'No comment'}". Recommends: ${dto.wouldRecommend}.`,
        referenceId: feedback.ticketId,
      },
    });

    return completed;
  }

  // 3. Automated Survey Dispatcher (Runs daily on tickets delivered 3 days ago)
  async dispatchPendingNpsSurveys() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 3); // 3 days ago

    // Get all tickets delivered around 3 days ago that don't have feedback registered
    const tickets = await this.prisma.ticket.findMany({
      where: {
        status: 'delivered',
        deliveredAt: {
          lte: new Date(targetDate.getTime() + 12 * 60 * 60 * 1000), // +/- 12 hour window
          gte: new Date(targetDate.getTime() - 12 * 60 * 60 * 1000),
        },
        feedback: null,
      },
      include: {
        customer: true,
      },
    });

    if (tickets.length === 0) return { dispatchedCount: 0 };

    let count = 0;
    for (const ticket of tickets) {
      await this.prisma.$transaction(async (tx) => {
        // 1. Create CustomerFeedback record (status SENT)
        const fb = await tx.customerFeedback.create({
          data: {
            customerId: ticket.customerId,
            ticketId: ticket.id,
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        // 2. Log Outgoing communication message inviting customer
        const message = `Hello ${ticket.customer.firstName}, thank you for choosing TrustZone! Please take 1 minute to rate your recent device repair service here: http://trustzone.care/survey/${fb.id}`;

        await tx.customerCommunication.create({
          data: {
            customerId: ticket.customerId,
            type: 'Email',
            subject: 'We value your feedback! - TrustZone Mobile Care',
            message,
            status: 'Delivered',
          },
        });

        // 3. Log Activity: SURVEY_SCHEDULED & SURVEY_SENT
        await tx.customerActivity.create({
          data: {
            customerId: ticket.customerId,
            type: 'SURVEY_SENT',
            title: 'NPS Survey Survey Dispatched',
            description: `Automated NPS satisfaction survey invitation sent to customer email for Ticket: ${ticket.id}.`,
            referenceId: ticket.id,
          },
        });

        count++;
      });
    }

    return { dispatchedCount: count };
  }

  // Helper: Manually seed a pending survey for testing / instant dispatching
  async triggerManualSurvey(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true, feedback: true },
    });

    if (!ticket)
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
    if (ticket.feedback)
      throw new BadRequestException(
        'An NPS feedback survey is already linked to this ticket.',
      );

    return this.prisma.$transaction(async (tx) => {
      const fb = await tx.customerFeedback.create({
        data: {
          customerId: ticket.customerId,
          ticketId: ticket.id,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      const message = `Hello ${ticket.customer.firstName}, thank you for choosing TrustZone! Please take 1 minute to rate your recent device repair service here: http://trustzone.care/survey/${fb.id}`;

      await tx.customerCommunication.create({
        data: {
          customerId: ticket.customerId,
          type: 'SMS',
          message,
          status: 'Delivered',
        },
      });

      await tx.customerActivity.create({
        data: {
          customerId: ticket.customerId,
          type: 'SURVEY_SENT',
          title: 'NPS Survey Survey Dispatched',
          description: `Manual NPS satisfaction survey invitation sent to customer SMS for Ticket: ${ticket.id}.`,
          referenceId: ticket.id,
        },
      });

      return fb;
    });
  }

  // ==========================================
  // NPS ANALYTICS SUMMARY
  // ==========================================
  async getNpsSummary() {
    const feedbacks = await this.prisma.customerFeedback.findMany({
      where: { status: 'COMPLETED' },
    });

    const totalCount = feedbacks.length;
    if (totalCount === 0) {
      return {
        averageNps: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        npsScore: 0,
        responseRate: 0,
        promotersPercent: 0,
        passivesPercent: 0,
        detractorsPercent: 0,
        trend: [],
      };
    }

    let promotersCount = 0;
    let passivesCount = 0;
    let detractorsCount = 0;
    let sumNps = 0;

    feedbacks.forEach((fb) => {
      const score = fb.npsScore || 0;
      sumNps += score;
      if (score >= 9) {
        promotersCount++;
      } else if (score >= 7) {
        passivesCount++;
      } else {
        detractorsCount++;
      }
    });

    const promotersPercent = Math.round((promotersCount / totalCount) * 100);
    const detractorsPercent = Math.round((detractorsCount / totalCount) * 100);
    const passivesPercent = Math.round((passivesCount / totalCount) * 100);
    const npsScore = promotersPercent - detractorsPercent;
    const averageNps = Number((sumNps / totalCount).toFixed(1));

    // Calculate response rate: Completed surveys vs Dispatched surveys
    const totalDispatched = await this.prisma.customerFeedback.count();
    const responseRate =
      totalDispatched > 0
        ? Math.round((totalCount / totalDispatched) * 100)
        : 0;

    // Generate trend (NPS score grouped by month)
    // We group records from last 6 months
    const trend: { month: string; score: number; count: number }[] = [];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Quick grouping logic
    const trendMap: Record<
      string,
      { promoters: number; total: number; detractors: number }
    > = {};

    feedbacks.forEach((fb) => {
      const date = fb.responseDate || fb.createdAt;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!trendMap[key]) {
        trendMap[key] = { promoters: 0, total: 0, detractors: 0 };
      }

      const score = fb.npsScore || 0;
      trendMap[key].total++;
      if (score >= 9) trendMap[key].promoters++;
      else if (score <= 6) trendMap[key].detractors++;
    });

    Object.keys(trendMap)
      .sort()
      .forEach((key) => {
        const parts = key.split('-');
        const monthLabel = `${months[parseInt(parts[1]) - 1]} ${parts[0].substring(2)}`;
        const item = trendMap[key];
        const pPct = (item.promoters / item.total) * 100;
        const dPct = (item.detractors / item.total) * 100;

        trend.push({
          month: monthLabel,
          score: Math.round(pPct - dPct),
          count: item.total,
        });
      });

    return {
      averageNps,
      promoters: promotersCount,
      passives: passivesCount,
      detractors: detractorsCount,
      promotersPercent,
      passivesPercent,
      detractorsPercent,
      npsScore,
      responseRate,
      trend,
    };
  }

  // ==========================================
  // CUSTOMER 360 & TIMELINE
  // ==========================================
  async getCustomerTimeline(
    customerId: string,
    filters?: { type?: string; startDate?: string; endDate?: string },
  ) {
    const where: any = { customerId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.customerActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // CRM DASHBOARD INDEX METRICS
  // ==========================================
  async getCrmDashboardStats() {
    const totalCustomers = await this.prisma.customer.count();
    const activeLoyaltyMembers = await this.prisma.customer.count({
      where: { loyaltyPoints: { gt: 0 } },
    });

    // Sum points
    const earnedTx = await this.prisma.loyaltyTransaction.aggregate({
      where: { pointsDelta: { gt: 0 } },
      _sum: { pointsDelta: true },
    });
    const redeemedTx = await this.prisma.loyaltyTransaction.aggregate({
      where: { type: 'REDEEMED' },
      _sum: { pointsDelta: true },
    });
    const expiredTx = await this.prisma.loyaltyTransaction.aggregate({
      where: { type: 'EXPIRED' },
      _sum: { pointsDelta: true },
    });

    const totalPointsIssued = earnedTx._sum.pointsDelta || 0;
    const totalPointsRedeemed = Math.abs(redeemedTx._sum.pointsDelta || 0);
    const totalExpiredPoints = Math.abs(expiredTx._sum.pointsDelta || 0);

    // NPS Stats
    const nps = await this.getNpsSummary();

    // Communications count
    const totalComms = await this.prisma.customerCommunication.count();
    const commsByChannel = await this.prisma.customerCommunication.groupBy({
      by: ['type'],
      _count: true,
    });
    const communicationActivity = commsByChannel.map((c) => ({
      channel: c.type,
      count: c._count,
    }));

    // Customer growth (last 6 months)
    const customers = await this.prisma.customer.findMany({
      select: { createdAt: true },
    });
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const growthMap: Record<string, number> = {};

    customers.forEach((c) => {
      const date = c.createdAt;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      growthMap[key] = (growthMap[key] || 0) + 1;
    });

    const customerGrowth = Object.keys(growthMap)
      .sort()
      .map((key) => {
        const parts = key.split('-');
        return {
          month: `${months[parseInt(parts[1]) - 1]} ${parts[0].substring(2)}`,
          count: growthMap[key],
        };
      });

    // Top VIP Customers
    const topVipCustomers = await this.prisma.customer.findMany({
      where: { tags: { has: 'VIP' } },
      orderBy: { loyaltyPoints: 'desc' },
      take: 5,
    });

    // Customers requiring followup (NPS <= 6 and resolution status is PENDING)
    const customersRequiringFollowUp =
      await this.prisma.customerFeedback.findMany({
        where: {
          npsScore: { lte: 6 },
          resolutionStatus: 'PENDING',
          status: 'COMPLETED',
        },
        include: {
          customer: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

    return {
      totalCustomers,
      activeLoyaltyMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      totalExpiredPoints,
      surveyResponseRate: nps.responseRate,
      npsScore: nps.npsScore,
      npsAverage: nps.averageNps,
      promotersPercent: nps.promotersPercent,
      passivesPercent: nps.passivesPercent,
      detractorsPercent: nps.detractorsPercent,
      communicationActivity,
      customerGrowth,
      topVipCustomers: topVipCustomers.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        phone: c.phone,
        loyaltyPoints: c.loyaltyPoints,
      })),
      customersRequiringFollowUp: customersRequiringFollowUp.map((f) => ({
        feedbackId: f.id,
        customerId: f.customerId,
        customerName: `${f.customer.firstName} ${f.customer.lastName}`,
        phone: f.customer.phone,
        npsScore: f.npsScore,
        comments: f.comments,
        ticketId: f.ticketId,
        date: f.responseDate || f.updatedAt,
      })),
    };
  }

  // ==========================================
  // LOYALTY HISTORY LOGS LISTING
  // ==========================================
  async findAllLoyaltyTransactions(query: {
    customerId?: string;
    search?: string;
    type?: string;
  }) {
    const where: any = {};
    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        {
          customer: {
            firstName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            lastName: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    return this.prisma.loyaltyTransaction.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
