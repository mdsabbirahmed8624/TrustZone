import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateCustomerPaymentDto } from './dto/create-customer-payment.dto';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ==========================================
  // DASHBOARD
  // ==========================================

  @Get('dashboard')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getDashboard(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.financeService.getDashboardData(branchId),
    };
  }

  // ==========================================
  // ACCOUNTS
  // ==========================================

  @Get('coa')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getAccounts(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.financeService.getAccounts({ branchId }),
    };
  }

  @Post('coa')
  @Permissions('finance.settings')
  @HttpCode(HttpStatus.CREATED)
  async createAccount(@Body() dto: CreateAccountDto) {
    return {
      success: true,
      data: await this.financeService.createAccount(dto),
    };
  }

  @Post('accounts/transfer')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.OK)
  async transferFunds(
    @Body() dto: CreateTransferDto,
    @CurrentUser('id') createdById: string,
  ) {
    return {
      success: true,
      data: await this.financeService.transferFunds(dto, createdById),
    };
  }

  @Post('accounts/adjust')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.OK)
  async adjustBalance(
    @Body() dto: CreateAdjustmentDto,
    @CurrentUser('id') createdById: string,
  ) {
    return {
      success: true,
      data: await this.financeService.adjustBalance(dto, createdById),
    };
  }

  // ==========================================
  // PERIODS & FISCAL YEARS
  // ==========================================

  @Get('periods')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getPeriods() {
    return {
      success: true,
      data: await this.financeService.getPeriods(),
    };
  }

  @Get('fiscal-years')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getFiscalYears() {
    return {
      success: true,
      data: await this.financeService.getFiscalYears(),
    };
  }

  @Post('fiscal-years')
  @Permissions('finance.settings')
  @HttpCode(HttpStatus.CREATED)
  async createFiscalYear(
    @Body() data: { name: string; startDate: string; endDate: string },
  ) {
    return {
      success: true,
      data: await this.financeService.createFiscalYear(data),
    };
  }

  @Patch('periods/:id/lock')
  @Permissions('finance.settings')
  @HttpCode(HttpStatus.OK)
  async togglePeriodLock(
    @Param('id') id: string,
    @Body('isLocked') isLocked: boolean,
  ) {
    return {
      success: true,
      data: await this.financeService.togglePeriodLock(id, isLocked),
    };
  }

  // ==========================================
  // JOURNAL ENTRIES
  // ==========================================

  @Get('journals')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getJournals(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.financeService.getJournals({ branchId }),
    };
  }

  @Post('journals/:id/reverse')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.OK)
  async reverseJournal(
    @Param('id') id: string,
    @CurrentUser('id') createdById: string,
  ) {
    return {
      success: true,
      data: await this.financeService.reverseJournalEntry(id, createdById),
    };
  }

  // ==========================================
  // CUSTOMER PAYMENTS
  // ==========================================

  @Post('payments/customer')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.CREATED)
  async collectCustomerPayment(
    @Body() dto: CreateCustomerPaymentDto,
    @CurrentUser('id') createdById: string,
  ) {
    return {
      success: true,
      data: await this.financeService.collectCustomerPayment(dto, createdById),
    };
  }

  // ==========================================
  // SUPPLIER PAYMENTS
  // ==========================================

  @Post('payments/supplier')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.CREATED)
  async paySupplier(
    @Body() dto: CreateSupplierPaymentDto,
    @CurrentUser('id') createdById: string,
  ) {
    return {
      success: true,
      data: await this.financeService.paySupplier(dto, createdById),
    };
  }

  // ==========================================
  // EXPENSES
  // ==========================================

  @Get('expenses')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getExpenses(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.financeService.getExpenses({ branchId }),
    };
  }

  @Post('expenses')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.CREATED)
  async createExpense(
    @Body() dto: CreateExpenseDto,
    @CurrentUser('id') createdById: string,
  ) {
    return {
      success: true,
      data: await this.financeService.createExpense(dto, createdById),
    };
  }

  @Patch('expenses/:id/approve')
  @Permissions('finance.approve')
  @HttpCode(HttpStatus.OK)
  async approveExpense(
    @Param('id') id: string,
    @Body('approved') approved: boolean,
    @Body('accountId') accountId: string,
    @CurrentUser('id') approvedById: string,
  ) {
    return {
      success: true,
      data: await this.financeService.approveExpense(
        id,
        approved,
        accountId,
        approvedById,
      ),
    };
  }

  // ==========================================
  // INCOME
  // ==========================================

  @Get('incomes')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getIncomes(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.financeService.getIncomes({ branchId }),
    };
  }

  @Post('incomes')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.CREATED)
  async createIncome(
    @Body() dto: CreateIncomeDto,
    @CurrentUser('id') createdById: string,
  ) {
    return {
      success: true,
      data: await this.financeService.createIncome(dto, createdById),
    };
  }

  // ==========================================
  // DAILY CLOSINGS
  // ==========================================

  @Get('daily-closing')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getDailyClosings(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.financeService.getDailyClosings({ branchId }),
    };
  }

  @Post('daily-closing')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.OK)
  async executeDailyClosing(
    @Body('branchId') branchId: string,
    @Body('actualBalance') actualBalance: number,
    @Body('notes') notes: string | undefined,
    @CurrentUser('id') closedById: string,
  ) {
    return {
      success: true,
      data: await this.financeService.executeDailyClosing(
        branchId,
        actualBalance,
        notes,
        closedById,
      ),
    };
  }

  // ==========================================
  // REPORTS
  // ==========================================

  @Get('reports/profit-loss')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getProfitLossReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    return {
      success: true,
      data: await this.financeService.getProfitLossReport({
        startDate,
        endDate,
        branchId,
      }),
    };
  }

  @Get('reports/cash-book')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getCashBookReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    return {
      success: true,
      data: await this.financeService.getCashBookReport({
        startDate,
        endDate,
        branchId,
      }),
    };
  }

  @Get('reports/bank-book')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getBankBookReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    return {
      success: true,
      data: await this.financeService.getBankBookReport({
        startDate,
        endDate,
        branchId,
      }),
    };
  }

  @Get('reports/customer-dues')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getCustomerDuesReport() {
    return {
      success: true,
      data: await this.financeService.getCustomerDuesReport(),
    };
  }

  @Get('reports/supplier-dues')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getSupplierDuesReport() {
    return {
      success: true,
      data: await this.financeService.getSupplierDuesReport(),
    };
  }

  @Get('reports/general-ledger')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getGeneralLedgerReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountId') accountId?: string,
  ) {
    return {
      success: true,
      data: await this.financeService.getGeneralLedgerReport({
        startDate,
        endDate,
        accountId,
      }),
    };
  }

  @Patch('expenses/:id')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.OK)
  async updateExpense(@Param('id') id: string, @Body() dto: any) {
    return {
      success: true,
      data: await this.financeService.updateExpense(id, dto),
    };
  }

  @Delete('expenses/:id')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.OK)
  async deleteExpense(@Param('id') id: string) {
    return await this.financeService.deleteExpense(id);
  }

  @Patch('incomes/:id')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.OK)
  async updateIncome(@Param('id') id: string, @Body() dto: any) {
    return {
      success: true,
      data: await this.financeService.updateIncome(id, dto),
    };
  }

  @Delete('incomes/:id')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.OK)
  async deleteIncome(@Param('id') id: string) {
    return await this.financeService.deleteIncome(id);
  }

  @Post('reconcile')
  @Permissions('finance.write')
  @HttpCode(HttpStatus.OK)
  async reconcileAccount(
    @Body('accountId') accountId: string,
    @Body('statementBalance') statementBalance: number,
    @Body('notes') notes?: string,
  ) {
    return await this.financeService.reconcileAccount({
      accountId,
      statementBalance,
      notes,
    });
  }

  @Get('reports/balance-sheet')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getBalanceSheetReport(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.financeService.getBalanceSheetReport({ branchId }),
    };
  }

  @Get('reports/cash-flow')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getCashFlowReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return {
      success: true,
      data: await this.financeService.getCashFlowReport({
        startDate,
        endDate,
      }),
    };
  }

  @Get('reports/tax-summary')
  @Permissions('finance.read')
  @HttpCode(HttpStatus.OK)
  async getTaxSummaryReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return {
      success: true,
      data: await this.financeService.getTaxSummaryReport({
        startDate,
        endDate,
      }),
    };
  }
}
