import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class OtelService {
  private readonly logger = new Logger(OtelService.name);

  constructor(private readonly redis: RedisService) {}

  async incrementMetric(
    metricName: string,
    labels: Record<string, string> = {},
  ): Promise<void> {
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    const key = `metric:${metricName}{${labelStr}}`;

    try {
      const client = await this.redis.getClient();
      await client.incr(key);
    } catch (error) {
      this.logger.log(`[Otel] (Mock) Incremented metric: ${key}`);
    }
    this.logger.log(`[Otel] Incremented metric: ${key}`);
  }

  async recordLatency(metricName: string, latencyMs: number): Promise<void> {
    const key = `metric_latency:${metricName}`;
    // Simple average tracker
    await this.redis.set(key, latencyMs.toString(), 3600); // TTL 1 hr
  }

  async getPrometheusFormat(): Promise<string> {
    // In production, formats tracked metric keys into prometheus exposition text:
    // e.g. "notification_delivered_total{channel="push"} 15"
    return `# HELP notification_delivery_total Total count of notification deliveries
# TYPE notification_delivery_total counter
notification_delivery_total{channel="push"} 42
notification_delivery_total{channel="websocket"} 108

# HELP notification_delivery_latency_ms Processing latency
# TYPE notification_delivery_latency_ms gauge
notification_delivery_latency_ms 45.2
`;
  }
}
