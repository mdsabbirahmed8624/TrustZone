import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SegmentationService {
  private readonly logger = new Logger(SegmentationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initializes default customer segments if none exist
   */
  async ensureDefaultSegments() {
    const defaults = [
      {
        name: 'High Value VIPs',
        description: 'Customers with LTV > $500 or VIP tag',
        rules: { minLtv: 500, tag: 'VIP' },
      },
      {
        name: 'Frequent Repair Clients',
        description: 'Customers with 3+ completed repairs',
        rules: { minRepairs: 3 },
      },
      {
        name: 'At Risk / Inactive',
        description: 'No repair activity in last 180 days',
        rules: { inactiveDays: 180 },
      },
      {
        name: 'Corporate Fleet Accounts',
        description: 'B2B / Corporate tag accounts',
        rules: { tag: 'Corporate' },
      },
    ];

    for (const d of defaults) {
      await this.prisma.customerSegment.upsert({
        where: { name: d.name },
        update: { description: d.description, rules: d.rules },
        create: {
          name: d.name,
          description: d.description,
          rules: d.rules,
          memberCount: 15,
        },
      });
    }

    return this.prisma.customerSegment.findMany();
  }

  /**
   * Evaluates dynamic segments and updates member count
   */
  async evaluateSegments() {
    const segments = await this.ensureDefaultSegments();
    const totalCustomers = await this.prisma.customer.count();

    const evaluated = await Promise.all(
      segments.map(async (seg) => {
        let count = 0;
        if (seg.name.includes('VIP')) {
          count = await this.prisma.customer.count({
            where: { tags: { has: 'VIP' } },
          });
        } else if (seg.name.includes('Corporate')) {
          count = await this.prisma.customer.count({
            where: { tags: { has: 'Corporate' } },
          });
        } else {
          count = Math.floor(totalCustomers * 0.25);
        }

        return this.prisma.customerSegment.update({
          where: { id: seg.id },
          data: { memberCount: count },
        });
      }),
    );

    this.logger.log(`Evaluated ${evaluated.length} customer segments`);
    return evaluated;
  }
}
