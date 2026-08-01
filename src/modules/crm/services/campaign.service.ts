import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a Marketing Campaign with target segment
   */
  async createCampaign(data: {
    name: string;
    channel?: string;
    subject?: string;
    bodyContent?: string;
    targetSegment?: string;
    budget?: number;
    scheduledAt?: Date;
    createdById?: string;
  }) {
    const campaign = await this.prisma.campaign.create({
      data: {
        name: data.name,
        channel: data.channel || 'EMAIL',
        status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        subject: data.subject || null,
        bodyContent: data.bodyContent || null,
        targetSegment: data.targetSegment || null,
        budget: data.budget || 0,
        scheduledAt: data.scheduledAt || null,
        createdById: data.createdById || null,
      },
    });

    this.logger.log(
      `Created Campaign '${campaign.id}' (${campaign.name}) [Channel: ${campaign.channel}]`,
    );
    return campaign;
  }

  /**
   * Adds recipients to campaign members list
   */
  async addMembers(
    campaignId: string,
    recipients: { recipient: string; name?: string }[],
  ) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new NotFoundException(`Campaign '${campaignId}' not found.`);
    }

    const membersData = recipients.map((r) => ({
      campaignId,
      recipient: r.recipient,
      name: r.name || null,
      status: 'PENDING',
    }));

    await this.prisma.campaignMember.createMany({
      data: membersData,
    });

    this.logger.log(
      `Added ${recipients.length} members to Campaign '${campaignId}'`,
    );
    return { campaignId, membersAdded: recipients.length };
  }

  /**
   * Launches / sends a campaign to all pending members
   */
  async launchCampaign(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { members: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign '${campaignId}' not found.`);
    }

    // Simulate sending multi-channel messages (EMAIL, SMS, WHATSAPP)
    await this.prisma.campaignMember.updateMany({
      where: { campaignId, status: 'PENDING' },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        sentAt: new Date(),
      },
    });

    this.logger.log(
      `Launched Campaign '${campaignId}' to ${campaign.members.length} member(s)`,
    );
    return updated;
  }

  /**
   * Tracks campaign ROI and performance metrics
   */
  async getCampaignAnalytics(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { members: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign '${campaignId}' not found.`);
    }

    const totalMembers = campaign.members.length;
    const sentCount = campaign.members.filter(
      (m) =>
        m.status === 'SENT' ||
        m.status === 'DELIVERED' ||
        m.status === 'OPENED' ||
        m.status === 'CLICKED',
    ).length;
    const openedCount = campaign.members.filter(
      (m) => m.status === 'OPENED' || m.status === 'CLICKED',
    ).length;
    const clickedCount = campaign.members.filter(
      (m) => m.status === 'CLICKED',
    ).length;

    const openRate = sentCount > 0 ? (openedCount / sentCount) * 100 : 0;
    const clickRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;

    const roi =
      Number(campaign.actualCost) > 0
        ? ((Number(campaign.revenueGenerated) - Number(campaign.actualCost)) /
            Number(campaign.actualCost)) *
          100
        : 0;

    return {
      campaignId: campaign.id,
      name: campaign.name,
      channel: campaign.channel,
      status: campaign.status,
      budget: Number(campaign.budget),
      actualCost: Number(campaign.actualCost),
      revenueGenerated: Number(campaign.revenueGenerated),
      totalMembers,
      sentCount,
      openedCount,
      clickedCount,
      openRate: Number(openRate.toFixed(2)),
      clickRate: Number(clickRate.toFixed(2)),
      roiPercentage: Number(roi.toFixed(2)),
    };
  }

  /**
   * Marketing Templates CRUD
   */
  async createTemplate(
    name: string,
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP',
    content: string,
    subject?: string,
  ) {
    return this.prisma.marketingTemplate.create({
      data: {
        name,
        channel,
        content,
        subject: subject || null,
        variables: ['{{firstName}}', '{{lastName}}', '{{loyaltyPoints}}'],
      },
    });
  }
}
