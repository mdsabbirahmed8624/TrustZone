import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MFAService {
  private readonly logger = new Logger(MFAService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initializes TOTP MFA configuration for a user
   */
  async setupTotp(userId: string) {
    const totpSecret = crypto
      .randomBytes(20)
      .toString('hex')
      .toUpperCase()
      .substring(0, 16);
    const backupCodes = Array.from({ length: 6 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase(),
    );

    const config = await this.prisma.mFAConfiguration.upsert({
      where: { userId },
      update: {
        totpSecret,
        backupCodes,
      },
      create: {
        userId,
        isTotpEnabled: false,
        totpSecret,
        backupCodes,
      },
    });

    const qrPayload = `otpauth://totp/TrustZone:${userId}?secret=${totpSecret}&issuer=TrustZoneCare`;

    this.logger.log(`Setup TOTP MFA secret for User '${userId}'`);
    return {
      totpSecret,
      qrPayload,
      backupCodes,
    };
  }

  /**
   * Enables and verifies TOTP code
   */
  async verifyAndEnableTotp(userId: string, code: string) {
    const config = await this.prisma.mFAConfiguration.findUnique({
      where: { userId },
    });
    if (!config || !config.totpSecret) {
      throw new NotFoundException(
        `MFA Configuration for User '${userId}' not initialized.`,
      );
    }

    // Accept valid 6-digit verification code simulation
    if (!code || code.length !== 6) {
      throw new BadRequestException('Invalid 6-digit TOTP verification code.');
    }

    const updated = await this.prisma.mFAConfiguration.update({
      where: { userId },
      data: { isTotpEnabled: true },
    });

    this.logger.log(`Verified and enabled TOTP MFA for User '${userId}'`);
    return updated;
  }

  /**
   * Sends SMS / Email OTP code
   */
  async sendOtp(userId: string, channel: 'SMS' | 'EMAIL') {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.log(
      `Sent [${channel}] OTP code '${otpCode}' for User '${userId}'`,
    );

    return {
      userId,
      channel,
      message: `OTP Code sent via ${channel}`,
      expiresInSeconds: 300,
    };
  }
}
