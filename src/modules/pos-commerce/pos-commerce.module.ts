import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { POSService } from './services/pos.service';
import { BillingService } from './services/billing.service';
import { InvoiceService } from './services/invoice.service';
import { QuotationService } from './services/quotation.service';
import { ReturnService } from './services/return.service';
import { ExchangeService } from './services/exchange.service';
import { LoyaltyService } from './services/loyalty.service';
import { CouponService } from './services/coupon.service';
import { PaymentService } from './services/payment.service';
import { SalesAnalyticsService } from './services/sales-analytics.service';

// Controllers
import { PosController } from './controllers/pos.controller';
import { ShiftsController } from './controllers/shifts.controller';
import { CountersController } from './controllers/counters.controller';
import { SalesController } from './controllers/sales.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { QuotationsController } from './controllers/quotations.controller';
import { ReturnsController } from './controllers/returns.controller';
import { ExchangesController } from './controllers/exchanges.controller';
import { LoyaltyController } from './controllers/loyalty.controller';
import { CouponsController } from './controllers/coupons.controller';
import { GiftcardsController } from './controllers/giftcards.controller';
import { SalesAnalyticsController } from './controllers/sales-analytics.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    PosController,
    ShiftsController,
    CountersController,
    SalesController,
    InvoicesController,
    QuotationsController,
    ReturnsController,
    ExchangesController,
    LoyaltyController,
    CouponsController,
    GiftcardsController,
    SalesAnalyticsController,
  ],
  providers: [
    POSService,
    BillingService,
    InvoiceService,
    QuotationService,
    ReturnService,
    ExchangeService,
    LoyaltyService,
    CouponService,
    PaymentService,
    SalesAnalyticsService,
  ],
  exports: [
    POSService,
    BillingService,
    InvoiceService,
    QuotationService,
    ReturnService,
    ExchangeService,
    LoyaltyService,
    CouponService,
    PaymentService,
    SalesAnalyticsService,
  ],
})
export class PosCommerceModule {}
