import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header.',
      );
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted in Redis (Logout verification)
    const isBlacklisted = await this.redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked.');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET_KEY');
      const payload = jwt.verify(token, secret) as any;

      const cacheKey = `auth:user:${payload.sub}`;
      const cachedUserStr = await this.redis.get(cacheKey);
      if (cachedUserStr) {
        try {
          const cachedUser = JSON.parse(cachedUserStr);
          if (
            cachedUser.lockoutUntil &&
            new Date(cachedUser.lockoutUntil) > new Date()
          ) {
            throw new UnauthorizedException('Account is temporarily locked.');
          }
          request.user = cachedUser;
          return true;
        } catch (parseErr) {
          if (parseErr instanceof UnauthorizedException) throw parseErr;
        }
      }

      // Fetch fresh user data from database to check active roles and account state
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { roleRelation: true },
      });

      if (!user) {
        throw new UnauthorizedException('User no longer exists.');
      }

      // Check if account is locked out
      if (user.lockoutUntil && user.lockoutUntil > new Date()) {
        throw new UnauthorizedException('Account is temporarily locked.');
      }

      const userContext = {
        id: user.id,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        permissions: user.roleRelation?.permissions || [],
        lockoutUntil: user.lockoutUntil,
      };

      await this.redis.set(cacheKey, JSON.stringify(userContext), 60);

      // Bind decoded claims to request context
      request.user = userContext;

      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
