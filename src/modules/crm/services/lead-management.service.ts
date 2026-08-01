import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeadManagementService {
  private readonly logger = new Logger(LeadManagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new Lead with automatic lead scoring and duplicate detection
   */
  async createLead(data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    estimatedValue?: number;
    assignedToId?: string;
    notes?: string;
    tags?: string[];
  }) {
    // Duplicate detection check
    let isDuplicate = false;
    if (data.email || data.phone) {
      const existing = await this.prisma.lead.findFirst({
        where: {
          OR: [
            data.email ? { email: data.email } : undefined,
            data.phone ? { phone: data.phone } : undefined,
          ].filter(Boolean) as any[],
          status: { not: 'ARCHIVED' },
        },
      });
      if (existing) {
        isDuplicate = true;
        this.logger.warn(
          `Duplicate lead detected for email '${data.email}' / phone '${data.phone}'`,
        );
      }
    }

    // Auto Lead Scoring (0 - 100)
    let leadScore = 20; // Base score
    if (data.company) leadScore += 20;
    if (data.email) leadScore += 15;
    if (data.phone) leadScore += 15;
    if (data.estimatedValue && data.estimatedValue > 1000) leadScore += 20;
    if (data.source === 'REFERRAL' || data.source === 'PARTNER')
      leadScore += 10;

    let rating: 'COLD' | 'WARM' | 'HOT' = 'COLD';
    if (leadScore >= 70) rating = 'HOT';
    else if (leadScore >= 40) rating = 'WARM';

    const lead = await this.prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        source: data.source || 'WEBSITE',
        status: isDuplicate ? 'NEW' : 'NEW',
        leadScore,
        rating,
        estimatedValue: data.estimatedValue || 0,
        assignedToId: data.assignedToId || null,
        notes: data.notes || null,
        tags: data.tags || [],
      },
    });

    // Log activity
    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'NOTE',
        subject: 'Lead Captured',
        description: `Lead created via ${lead.source} [Initial Score: ${leadScore}]`,
      },
    });

    this.logger.log(
      `Created Lead '${lead.id}' (${lead.firstName} ${lead.lastName}) - Score: ${leadScore}`,
    );
    return lead;
  }

  /**
   * Retrieves paginated leads with filtering
   */
  async getLeads(query: {
    status?: string;
    source?: string;
    search?: string;
    assignedToId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;
    if (query.assignedToId) where.assignedToId = query.assignedToId;

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: true, activities: true },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Converts Lead into Customer and/or Opportunity
   */
  async convertLead(
    leadId: string,
    options: { createOpportunity?: boolean; stageId?: string },
  ) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException(`Lead '${leadId}' not found.`);
    }
    if (lead.status === 'CONVERTED') {
      throw new BadRequestException(`Lead '${leadId}' is already converted.`);
    }

    // 1. Create or find Customer
    let customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          lead.email ? { email: lead.email } : undefined,
          lead.phone ? { phone: lead.phone } : undefined,
        ].filter(Boolean) as any[],
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email || `lead-${lead.id}@trustzone.care`,
          phone: lead.phone || '0000000000',
          tags: [...lead.tags, 'LeadConverted'],
          notes: lead.notes,
        },
      });
    }

    let opportunityId: string | null = null;

    // 2. Create Opportunity if requested
    if (options.createOpportunity && options.stageId) {
      const opp = await this.prisma.opportunity.create({
        data: {
          title: `${lead.company || lead.firstName}'s Service Opportunity`,
          amount: lead.estimatedValue,
          expectedRevenue: Number(lead.estimatedValue) * 0.5,
          probability: 50,
          stageId: options.stageId,
          customerId: customer.id,
          assignedToId: lead.assignedToId,
          status: 'OPEN',
        },
      });
      opportunityId = opp.id;
    }

    // 3. Mark Lead as CONVERTED
    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'CONVERTED',
        convertedCustomerId: customer.id,
        convertedOpportunityId: opportunityId,
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId,
        type: 'STAGE_CHANGE',
        subject: 'Lead Converted',
        description: `Lead converted to Customer '${customer.id}'${opportunityId ? ` and Opportunity '${opportunityId}'` : ''}`,
      },
    });

    this.logger.log(`Converted Lead '${leadId}' -> Customer '${customer.id}'`);
    return {
      lead: updatedLead,
      customer,
      opportunityId,
    };
  }

  /**
   * Assigns Lead to staff
   */
  async assignLead(leadId: string, staffId: string) {
    const lead = await this.prisma.lead.update({
      where: { id: leadId },
      data: { assignedToId: staffId },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId,
        type: 'TASK',
        subject: 'Lead Assigned',
        description: `Lead assigned to User '${staffId}'`,
      },
    });

    return lead;
  }
}
