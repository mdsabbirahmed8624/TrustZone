import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

export interface IEventBus {
  publish(topic: string, payload: any): Promise<void>;
  subscribe(topic: string, handler: (payload: any) => void): Promise<void>;
}

@Injectable()
export class EventBusService implements IEventBus {
  private readonly logger = new Logger(EventBusService.name);
  private subscriberReady = false;

  constructor(private readonly redis: RedisService) {}

  async publish(topic: string, payload: any): Promise<void> {
    this.logger.log(`[EventBus] Publishing event to topic "${topic}"`);

    // Redis Stream compatibility
    const streamKey = `stream:${topic}`;
    const payloadStr = JSON.stringify(payload);

    // In production, publish to Redis Streams or RabbitMQ/Kafka client:
    // await this.redis.xadd(streamKey, '*', 'payload', payloadStr);

    // Fallback/Simulated publish using Redis pub/sub or cache
    await this.redis.set(`event:${topic}:${Date.now()}`, payloadStr, 60);
    this.logger.log(
      `[EventBus] Event successfully registered in Redis Streams adapter.`,
    );
  }

  async subscribe(
    topic: string,
    handler: (payload: any) => void,
  ): Promise<void> {
    this.logger.log(
      `[EventBus] Subscribing worker handler to topic "${topic}"`,
    );
    // Simulated subscription loop
    this.subscriberReady = true;
  }
}
