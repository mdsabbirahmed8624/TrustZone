import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { IdempotencyService } from './services/idempotency.service';
import { ApiGatewayService } from './services/api-gateway.service';
import { WebhookService } from './services/webhook.service';
import { IntegrationService } from './services/integration.service';
import { ConnectorService } from './services/connector.service';
import { PaymentConnectorService } from './services/payment-connector.service';
import { MessagingConnectorService } from './services/messaging-connector.service';
import { AccountingConnectorService } from './services/accounting-connector.service';
import { MarketplaceConnectorService } from './services/marketplace-connector.service';
import { NotificationHubService } from './services/notification-hub.service';
import { SyncEngineService } from './services/sync-engine.service';
import { SovereignResidencyBook2Service } from './services/sovereign-residency-book2.service';

// Controllers
import { ApiGatewayController } from './controllers/api-gateway.controller';
import { WebhooksController } from './controllers/webhooks.controller';
import { IntegrationsController } from './controllers/integrations.controller';
import { ConnectorsController } from './controllers/connectors.controller';
import { NotificationHubController } from './controllers/notification-hub.controller';
import { SyncEngineController } from './controllers/sync-engine.controller';
import { SovereignResidencyBook2Controller } from './controllers/sovereign-residency-book2.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    IdempotencyService,
    ApiGatewayService,
    WebhookService,
    IntegrationService,
    ConnectorService,
    PaymentConnectorService,
    MessagingConnectorService,
    AccountingConnectorService,
    MarketplaceConnectorService,
    NotificationHubService,
    SyncEngineService,
    SovereignResidencyBook2Service,
  ],
  controllers: [
    SovereignResidencyBook2Controller,
    ApiGatewayController,
    WebhooksController,
    IntegrationsController,
    ConnectorsController,
    NotificationHubController,
    SyncEngineController,
  ],
  exports: [
    IdempotencyService,
    ApiGatewayService,
    WebhookService,
    IntegrationService,
    ConnectorService,
    PaymentConnectorService,
    MessagingConnectorService,
    AccountingConnectorService,
    MarketplaceConnectorService,
    NotificationHubService,
    SyncEngineService,
    SovereignResidencyBook2Service,
  ],
})
export class IntegrationsModule {}
