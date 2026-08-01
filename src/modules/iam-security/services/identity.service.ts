import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upserts identity profile for a user
   */
  async upsertProfile(
    userId: string,
    department?: string,
    organizationUnit?: string,
    jobTitle?: string,
    employeeId?: string,
    identityProvider = 'LOCAL',
  ) {
    const profile = await this.prisma.identityProfile.upsert({
      where: { userId },
      update: {
        department: department || null,
        organizationUnit: organizationUnit || null,
        jobTitle: jobTitle || null,
        employeeId: employeeId || null,
        identityProvider,
      },
      create: {
        userId,
        department: department || null,
        organizationUnit: organizationUnit || null,
        jobTitle: jobTitle || null,
        employeeId: employeeId || null,
        identityProvider,
        profileStatus: 'ACTIVE',
      },
    });

    this.logger.log(`Upserted Identity Profile for User '${userId}'`);
    return profile;
  }

  /**
   * Links external third-party identity (Google, Microsoft, GitHub, SAML2)
   */
  async linkExternalIdentity(
    userId: string,
    provider: string,
    externalSubjectId: string,
  ) {
    const profile = await this.prisma.identityProfile.findUnique({
      where: { userId },
    });
    const existingLinks = (profile?.linkedAccounts as any[]) || [];

    const updatedLinks = existingLinks.filter(
      (l: any) => l.provider !== provider,
    );
    updatedLinks.push({
      provider,
      externalSubjectId,
      linkedAt: new Date().toISOString(),
    });

    const updated = await this.prisma.identityProfile.upsert({
      where: { userId },
      update: { linkedAccounts: updatedLinks },
      create: {
        userId,
        identityProvider: provider,
        externalSubjectId,
        linkedAccounts: updatedLinks,
      },
    });

    this.logger.log(
      `Linked external identity '${provider}' for User '${userId}'`,
    );
    return updated;
  }

  /**
   * Retrieves full Identity Profile for a user
   */
  async getProfile(userId: string) {
    const profile = await this.prisma.identityProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      throw new NotFoundException(
        `Identity Profile for User '${userId}' not found.`,
      );
    }

    return profile;
  }
}
