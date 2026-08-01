import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Adds or redeems points for customer loyalty account
   */
  async updateLoyaltyPoints(customerName: string, pointsDelta: number) {
    const existing = await this.prisma.loyaltyAccount.findUnique({
      where: { customerName },
    });
    let totalPoints = pointsDelta;
    let activePoints = pointsDelta;

    if (existing) {
      totalPoints = Math.max(
        0,
        existing.totalPoints + (pointsDelta > 0 ? pointsDelta : 0),
      );
      activePoints = Math.max(0, existing.activePoints + pointsDelta);
    }

    let tier = 'BRONZE';
    if (totalPoints >= 1000) tier = 'PLATINUM';
    else if (totalPoints >= 500) tier = 'GOLD';
    else if (totalPoints >= 200) tier = 'SILVER';

    const account = await this.prisma.loyaltyAccount.upsert({
      where: { customerName },
      update: { totalPoints, activePoints, tier },
      create: { customerName, totalPoints, activePoints, tier },
    });

    this.logger.log(
      `Updated LoyaltyAccount for '${customerName}' [Active Points: ${account.activePoints}, Tier: ${account.tier}]`,
    );
    return account;
  }
}
