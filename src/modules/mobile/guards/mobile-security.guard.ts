import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MobileSecurityGuard implements CanActivate {
  private readonly logger = new Logger(MobileSecurityGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const deviceUUID = request.headers['x-device-uuid'];
    const isJailbroken = request.headers['x-security-root'] === 'true';

    // 1. Root / Jailbreak check
    if (isJailbroken) {
      this.logger.warn(`Access denied: Jailbroken device detected.`);
      throw new ForbiddenException(
        'Security Block: Compromised/jailbroken device.',
      );
    }

    // 2. Remote Wipe verification
    if (deviceUUID) {
      const device = await this.prisma.userDevice.findFirst({
        where: { deviceUUID },
      });

      if (device && (device.status === 'LOST' || device.status === 'BLOCKED')) {
        this.logger.warn(
          `Device ${deviceUUID} status is ${device.status}. Triggering remote wipe.`,
        );
        // Set standard remote wipe header response
        const response = context.switchToHttp().getResponse();
        response.setHeader('x-mobile-wipe', 'true');
        throw new ForbiddenException('Access Denied: Remote wipe triggered.');
      }
    }

    return true;
  }
}
