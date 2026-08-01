import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentConnectorService } from '../services/payment-connector.service';
import { MessagingConnectorService } from '../services/messaging-connector.service';
import { AccountingConnectorService } from '../services/accounting-connector.service';
import { MarketplaceConnectorService } from '../services/marketplace-connector.service';
import { IdempotencyService } from '../services/idempotency.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('connectors')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ConnectorsController {
  constructor(
    private readonly paymentConnector: PaymentConnectorService,
    private readonly messagingConnector: MessagingConnectorService,
    private readonly accountingConnector: AccountingConnectorService,
    private readonly marketplaceConnector: MarketplaceConnectorService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  @Post('payments/process')
  @Permissions('connectors:write')
  @HttpCode(HttpStatus.OK)
  async processPayment(
    @Headers('x-idempotency-key') idempotencyKey: string,
    @Body()
    body: {
      providerCode: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      environment?: 'SANDBOX' | 'PRODUCTION';
      dryRun?: boolean;
    },
  ) {
    if (idempotencyKey) {
      const evalResult = await this.idempotencyService.evaluateIdempotency(
        idempotencyKey,
        '/api/v1/connectors/payments/process',
        body,
      );
      if (evalResult.isReplay) {
        return evalResult.responseBody;
      }
    }

    const result = await this.paymentConnector.processPayment(
      body.providerCode,
      body.amount,
      body.currency || 'USD',
      body.paymentMethod || 'CREDIT_CARD',
      body.environment || 'SANDBOX',
      body.dryRun || false,
    );

    if (idempotencyKey) {
      await this.idempotencyService.saveResponse(idempotencyKey, 200, result);
    }

    return result;
  }

  @Post('messaging/send-sms')
  @Permissions('connectors:write')
  @HttpCode(HttpStatus.OK)
  async sendSms(
    @Body()
    body: {
      phone: string;
      message: string;
      environment?: 'SANDBOX' | 'PRODUCTION';
      dryRun?: boolean;
    },
  ) {
    return this.messagingConnector.sendSms(
      body.phone,
      body.message,
      body.environment || 'SANDBOX',
      body.dryRun || false,
    );
  }

  @Post('accounting/sync-customer')
  @Permissions('connectors:write')
  @HttpCode(HttpStatus.OK)
  async syncCustomer(
    @Body()
    body: {
      providerCode: 'QUICKBOOKS' | 'XERO';
      customerId: string;
      environment?: 'SANDBOX' | 'PRODUCTION';
    },
  ) {
    return this.accountingConnector.syncCustomer(
      body.providerCode,
      body.customerId,
      body.environment || 'SANDBOX',
    );
  }

  @Post('marketplace/sync-product')
  @Permissions('connectors:write')
  @HttpCode(HttpStatus.OK)
  async syncProduct(
    @Body()
    body: {
      providerCode: 'SHOPIFY' | 'WOOCOMMERCE';
      partId: string;
      environment?: 'SANDBOX' | 'PRODUCTION';
    },
  ) {
    return this.marketplaceConnector.syncProduct(
      body.providerCode,
      body.partId,
      body.environment || 'SANDBOX',
    );
  }
}
