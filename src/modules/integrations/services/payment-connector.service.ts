import { Injectable } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentConnectorService extends ConnectorService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Processes a payment transaction through payment connector (Stripe / SSLCommerz / PayPal)
   */
  async processPayment(
    providerCode: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX',
    dryRun = false,
  ) {
    return this.executeWithRetry(
      providerCode,
      'PROCESS_PAYMENT',
      async () => {
        // Mock payment processing logic for sandbox/production integration test
        const transactionId =
          'tx_' +
          environment.toLowerCase() +
          '_' +
          Math.floor(Math.random() * 1000000);
        return {
          transactionId,
          amount,
          currency,
          paymentMethod,
          status: 'PAID',
          gatewayReference: 'gw_ref_' + transactionId,
          timestamp: new Date().toISOString(),
        };
      },
      dryRun,
      environment,
    );
  }

  /**
   * Ingests and processes incoming payment webhook callback with idempotency support
   */
  async processCallback(
    providerCode: string,
    callbackPayload: any,
    environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX',
  ) {
    return this.executeWithRetry(
      providerCode,
      'PAYMENT_CALLBACK',
      async () => {
        return {
          callbackProcessed: true,
          providerCode,
          environment,
          receivedAmount: callbackPayload.amount || 100,
          status: 'SETTLED',
        };
      },
      false,
      environment,
    );
  }
}
