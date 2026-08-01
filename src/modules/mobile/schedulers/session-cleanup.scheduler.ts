import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class SessionCleanupScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SessionCleanupScheduler.name);
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly authService: AuthService) {}

  onModuleInit() {
    this.logger.log('Initializing hourly session cleanup scheduler...');
    // Run cleanup every hour (60 * 60 * 1000 ms)
    this.cleanupInterval = setInterval(() => this.runCleanup(), 3600000);

    // Trigger an initial cleanup 10 seconds after boot
    setTimeout(() => this.runCleanup(), 10000);
  }

  async runCleanup() {
    try {
      this.logger.log('Starting hourly expired sessions cleanup task...');
      const cleaned = await this.authService.cleanupExpiredSessions();
      this.logger.log(
        `Hourly expired sessions cleanup completed. Removed ${cleaned} expired sessions.`,
      );
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions:', error);
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
