import { Injectable, BadRequestException } from '@nestjs/common';
import { IPushProvider } from './push-provider.interface';
import {
  FcmPushProvider,
  ApnsPushProvider,
  HuaweiPushProvider,
  MockPushProvider,
} from './push-providers';

@Injectable()
export class PushProviderFactory {
  constructor(
    private readonly fcmProvider: FcmPushProvider,
    private readonly apnsProvider: ApnsPushProvider,
    private readonly huaweiProvider: HuaweiPushProvider,
    private readonly mockProvider: MockPushProvider,
  ) {}

  getProvider(providerType: string): IPushProvider {
    const type = providerType.toUpperCase();
    switch (type) {
      case 'FCM':
        return this.fcmProvider;
      case 'APNS':
        return this.apnsProvider;
      case 'HUAWEI':
        return this.huaweiProvider;
      case 'MOCK':
        return this.mockProvider;
      default:
        // Default to Mock for grace fallback
        return this.mockProvider;
    }
  }
}
