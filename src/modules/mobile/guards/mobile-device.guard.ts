import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MobileDeviceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const deviceUUID = request.headers['x-device-uuid'];

    if (!deviceUUID) {
      throw new UnauthorizedException('Missing x-device-uuid header.');
    }

    const device = await this.prisma.userDevice.findUnique({
      where: {
        userId_deviceUUID: {
          userId: user.id,
          deviceUUID,
        },
      },
    });

    if (!device) {
      throw new ForbiddenException('Device is not registered.');
    }

    if (device.status === 'BLOCKED') {
      throw new ForbiddenException('Device is blocked.');
    }

    if (device.status === 'LOST') {
      throw new ForbiddenException('Device is marked as lost.');
    }

    if (device.status === 'SUSPICIOUS') {
      throw new ForbiddenException('Device is marked as suspicious.');
    }

    if (device.riskLevel === 'CRITICAL') {
      throw new ForbiddenException('Device risk level is critical.');
    }

    // Keep last IP and agent updated on request
    const ip = request.ip || request.connection.remoteAddress;
    const ua = request.headers['user-agent'] || 'Mobile Client';

    await this.prisma.userDevice.update({
      where: { id: device.id },
      data: {
        lastUsedAt: new Date(),
        lastIpAddress: ip || device.lastIpAddress,
        lastUserAgent: ua || device.lastUserAgent,
      },
    });

    return true;
  }
}
