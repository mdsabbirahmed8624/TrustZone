import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IdentityService } from './identity.service';

@Injectable()
export class SSOService {
  private readonly logger = new Logger(SSOService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly identityService: IdentityService,
  ) {}

  /**
   * Registers or updates an Enterprise SSO Provider
   */
  async configureProvider(
    code: string,
    name: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    issuerUrl?: string,
  ) {
    const provider = await this.prisma.sSOProvider.upsert({
      where: { code },
      update: {
        name,
        clientId,
        clientSecret,
        redirectUri,
        issuerUrl: issuerUrl || null,
        enabled: true,
      },
      create: {
        code,
        name,
        clientId,
        clientSecret,
        redirectUri,
        issuerUrl: issuerUrl || null,
        enabled: true,
      },
    });

    this.logger.log(`Configured SSO Provider '${code}' (${name})`);
    return provider;
  }

  /**
   * Processes federated SSO login callback and provisions identity
   */
  async processSsoCallback(
    code: string,
    externalUser: { id: string; email: string; name: string },
  ) {
    const provider = await this.prisma.sSOProvider.findUnique({
      where: { code },
    });
    if (!provider || !provider.enabled) {
      throw new BadRequestException(
        `SSO Provider '${code}' is disabled or not configured.`,
      );
    }

    // Find or link user
    let user = await this.prisma.user.findUnique({
      where: { email: externalUser.email },
    });

    if (!user) {
      // Provision user
      const nameParts = externalUser.name.split(' ');
      user = await this.prisma.user.create({
        data: {
          email: externalUser.email,
          password: 'SSO_FEDERATED_USER_NO_PASSWORD',
          firstName: nameParts[0] || 'SSO',
          lastName: nameParts.slice(1).join(' ') || 'User',
          role: 'STAFF',
          isEmailVerified: true,
        },
      });
    }

    // Link identity
    await this.identityService.linkExternalIdentity(
      user.id,
      code,
      externalUser.id,
    );

    this.logger.log(
      `Successfully authenticated user '${user.email}' via SSO Provider '${code}'`,
    );
    return {
      user,
      ssoProvider: code,
      externalSubjectId: externalUser.id,
    };
  }
}
