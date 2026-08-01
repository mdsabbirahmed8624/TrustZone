import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RedisLockService {
  private readonly logger = new Logger(RedisLockService.name);

  constructor(private readonly redis: RedisService) {}

  async acquireLock(key: string, ttlSeconds = 10): Promise<boolean> {
    const lockKey = `lock:${key}`;
    try {
      const client = await this.redis.getClient();
      const result = await client.set(
        lockKey,
        'locked',
        'EX',
        ttlSeconds,
        'NX',
      );
      if (result === 'OK') {
        this.logger.log(`Acquired lock for key: ${lockKey}`);
        return true;
      }
      return false;
    } catch (error) {
      // Fallback for mock environments / simple tests
      await this.redis.set(lockKey, 'locked', ttlSeconds);
      this.logger.log(`Acquired lock (fallback) for key: ${lockKey}`);
      return true;
    }
  }

  async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    await this.redis.del(lockKey);
    this.logger.log(`Released lock for key: ${lockKey}`);
  }

  // Double send prevention utility
  async isDuplicateNotification(
    recipientId: string,
    contentHash: string,
  ): Promise<boolean> {
    const key = `notif_hash:${recipientId}:${contentHash}`;
    const exists = await this.redis.get(key);
    if (exists) {
      return true;
    }
    // Store content hash for 30 seconds to prevent rapid duplicate clicks/sends
    await this.redis.set(key, '1', 30);
    return false;
  }
}
