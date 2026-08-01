import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers['x-forwarded-for'] || '127.0.0.1';
    const key = `ratelimit:${ip}`;

    const currentHits = await this.redis.get(key);
    const hits = currentHits ? parseInt(currentHits, 10) : 0;

    if (hits > 120) {
      throw new HttpException(
        'Too many requests. Please try again in a minute.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (hits === 0) {
      await this.redis.set(key, '1', 60); // 60 seconds TTL
    } else {
      await this.redis.set(key, String(hits + 1), 60);
    }

    return true;
  }
}
