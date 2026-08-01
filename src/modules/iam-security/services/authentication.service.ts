import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enforces password history (prevents reusing last 5 passwords)
   */
  async validatePasswordHistory(userId: string, newPasswordPlain: string) {
    const history = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const record of history) {
      const matches = await argon2.verify(
        record.passwordHash,
        newPasswordPlain,
      );
      if (matches) {
        throw new BadRequestException(
          'New password cannot be one of your last 5 used passwords.',
        );
      }
    }

    return true;
  }

  /**
   * Updates password and records history hash
   */
  async updatePassword(userId: string, newPasswordPlain: string) {
    await this.validatePasswordHistory(userId, newPasswordPlain);

    const passwordHash = await argon2.hash(newPasswordPlain);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });

    await this.prisma.passwordHistory.create({
      data: {
        userId,
        passwordHash,
      },
    });

    this.logger.log(
      `Password updated and history recorded for User '${userId}'`,
    );
    return { success: true };
  }

  /**
   * Generates passwordless login token link
   */
  async generatePasswordlessToken(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException(`User with email '${email}' not found.`);
    }

    const token = crypto.randomBytes(32).toString('hex');
    this.logger.log(`Generated Passwordless Login Token for '${email}'`);

    return {
      email,
      token,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(), // 15 mins
    };
  }
}
