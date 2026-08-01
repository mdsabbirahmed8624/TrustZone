import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { LedgerService } from './services/ledger.service';
import { JournalService } from './services/journal.service';
import { AccountsPayableService } from './services/accounts-payable.service';
import { AccountsReceivableService } from './services/accounts-receivable.service';
import { BudgetService } from './services/budget.service';
import { CostCenterService } from './services/cost-center.service';
import { BankService } from './services/bank.service';
import { ReconciliationService } from './services/reconciliation.service';
import { FinancialStatementService } from './services/financial-statement.service';
import { FinanceAnalyticsService } from './services/finance-analytics.service';

// Controllers
import { AccountsController } from './controllers/accounts.controller';
import { JournalController } from './controllers/journal.controller';
import { ApController } from './controllers/ap.controller';
import { ArController } from './controllers/ar.controller';
import { BudgetController } from './controllers/budget.controller';
import { BanksController } from './controllers/banks.controller';
import { ReconciliationController } from './controllers/reconciliation.controller';
import { StatementsController } from './controllers/statements.controller';
import { FinanceAnalyticsController } from './controllers/finance-analytics.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    AccountsController,
    JournalController,
    ApController,
    ArController,
    BudgetController,
    BanksController,
    ReconciliationController,
    StatementsController,
    FinanceAnalyticsController,
  ],
  providers: [
    LedgerService,
    JournalService,
    AccountsPayableService,
    AccountsReceivableService,
    BudgetService,
    CostCenterService,
    BankService,
    ReconciliationService,
    FinancialStatementService,
    FinanceAnalyticsService,
  ],
  exports: [
    LedgerService,
    JournalService,
    AccountsPayableService,
    AccountsReceivableService,
    BudgetService,
    CostCenterService,
    BankService,
    ReconciliationService,
    FinancialStatementService,
    FinanceAnalyticsService,
  ],
})
export class FinanceManagementModule {}
