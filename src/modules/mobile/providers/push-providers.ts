import { Injectable, Logger } from '@nestjs/common';
import { IPushProvider } from './push-provider.interface';

@Injectable()
export class MockPushProvider implements IPushProvider {
  private readonly logger = new Logger(MockPushProvider.name);

  async send(
    token: string,
    payload: { title: string; body: string; data?: Record<string, any> },
  ): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(
      `[MockPushProvider] Sending push to token "${token}": Title="${payload.title}", Body="${payload.body}"`,
    );
    return {
      success: true,
      messageId: `mock-msg-${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}

@Injectable()
export class FcmPushProvider implements IPushProvider {
  private readonly logger = new Logger(FcmPushProvider.name);

  async send(
    token: string,
    payload: { title: string; body: string; data?: Record<string, any> },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    this.logger.log(`[FcmPushProvider] Routing FCM push message to "${token}"`);
    // In production, communicate with firebase-admin SDK:
    // admin.messaging().send({ token, notification: { title, body }, data })
    return {
      success: true,
      messageId: `fcm-msg-${Date.now()}`,
    };
  }
}

@Injectable()
export class ApnsPushProvider implements IPushProvider {
  private readonly logger = new Logger(ApnsPushProvider.name);

  async send(
    token: string,
    payload: { title: string; body: string; data?: Record<string, any> },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    this.logger.log(
      `[ApnsPushProvider] Routing APNS push message to "${token}"`,
    );
    // In production, communicate with APNS HTTP/2 gateway
    return {
      success: true,
      messageId: `apns-msg-${Date.now()}`,
    };
  }
}

@Injectable()
export class HuaweiPushProvider implements IPushProvider {
  private readonly logger = new Logger(HuaweiPushProvider.name);

  async send(
    token: string,
    payload: { title: string; body: string; data?: Record<string, any> },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    this.logger.log(
      `[HuaweiPushProvider] Routing Huawei push message to "${token}"`,
    );
    // In production, communicate with Huawei Push Kit API
    return {
      success: true,
      messageId: `huawei-msg-${Date.now()}`,
    };
  }
}
