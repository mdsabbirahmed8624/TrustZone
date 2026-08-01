import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeviceTrustService {
  private readonly logger = new Logger(DeviceTrustService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a device fingerprint hash
   */
  generateFingerprintHash(
    userAgent: string,
    ipAddress: string,
    acceptLanguage = 'en-US',
  ): string {
    const raw = `${userAgent}|${ipAddress}|${acceptLanguage}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Registers or updates a trusted device for a user
   */
  async registerDevice(
    userId: string,
    deviceFingerprint: string,
    deviceName: string,
    deviceType = 'DESKTOP',
    osName = 'Windows',
    browserName = 'Chrome',
  ) {
    const device = await this.prisma.trustedDevice.upsert({
      where: { userId_deviceFingerprint: { userId, deviceFingerprint } },
      update: { lastUsedAt: new Date(), isTrusted: true },
      create: {
        userId,
        deviceFingerprint,
        deviceName,
        deviceType,
        osName,
        browserName,
        isTrusted: true,
      },
    });

    this.logger.log(
      `Registered Trusted Device '${deviceName}' for User '${userId}'`,
    );
    return device;
  }

  /**
   * Checks if a device is trusted for a user
   */
  async isDeviceTrusted(userId: string, deviceFingerprint: string) {
    const device = await this.prisma.trustedDevice.findUnique({
      where: { userId_deviceFingerprint: { userId, deviceFingerprint } },
    });

    return {
      isKnownDevice: !!device,
      isTrusted: device ? device.isTrusted : false,
      device: device || null,
    };
  }
}
