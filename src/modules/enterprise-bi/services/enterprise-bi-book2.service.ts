import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SetExchangeRateDto {
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  isCustomRate?: boolean;
}

export interface GenerateForecastDto {
  forecastPeriod: string; // e.g. "2026-Q4"
  growthRateMultiplier?: number; // e.g. 1.05 = 5% growth
}

export interface ConsolidateLedgerDto {
  ledgerPeriod: string; // e.g. "2026-07"
  tenantCode: string;
  accountCategory: string;
  totalDebit: number;
  totalCredit: number;
  currency?: string;
}

@Injectable()
export class EnterpriseBIBook2Service {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // 1. MULTI-CURRENCY CONVERSION ENGINE
  // ----------------------------------------------------
  async setExchangeRate(dto: SetExchangeRateDto) {
    if (dto.fromCurrency === dto.toCurrency) {
      throw new BadRequestException(
        'Source and target currencies cannot be identical.',
      );
    }

    const effectiveDate = new Date();
    effectiveDate.setHours(0, 0, 0, 0);

    return this.prisma.currencyExchangeRate.upsert({
      where: {
        fromCurrency_toCurrency_effectiveDate: {
          fromCurrency: dto.fromCurrency.toUpperCase(),
          toCurrency: dto.toCurrency.toUpperCase(),
          effectiveDate,
        },
      },
      update: {
        exchangeRate: dto.exchangeRate,
        isCustomRate: dto.isCustomRate ?? false,
      },
      create: {
        fromCurrency: dto.fromCurrency.toUpperCase(),
        toCurrency: dto.toCurrency.toUpperCase(),
        exchangeRate: dto.exchangeRate,
        effectiveDate,
        isCustomRate: dto.isCustomRate ?? false,
      },
    });
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ) {
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1.0,
      };
    }

    const rateRecord = await this.prisma.currencyExchangeRate.findFirst({
      where: {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
      },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!rateRecord) {
      // Fallback default exchange rate calculation if not explicit in DB
      const defaultRates: Record<string, number> = {
        'USD-EUR': 0.92,
        'EUR-USD': 1.08,
        'USD-GBP': 0.78,
        'GBP-USD': 1.28,
        'USD-BDT': 117.5,
        'BDT-USD': 0.0085,
        'USD-AED': 3.67,
        'AED-USD': 0.27,
      };

      const key = `${fromCurrency.toUpperCase()}-${toCurrency.toUpperCase()}`;
      const fallbackRate = defaultRates[key] || 1.0;

      return {
        originalAmount: amount,
        convertedAmount: Number((amount * fallbackRate).toFixed(2)),
        exchangeRate: fallbackRate,
        isFallback: true,
      };
    }

    return {
      originalAmount: amount,
      convertedAmount: Number((amount * rateRecord.exchangeRate).toFixed(2)),
      exchangeRate: rateRecord.exchangeRate,
      isFallback: false,
    };
  }

  async getExchangeRates() {
    return this.prisma.currencyExchangeRate.findMany({
      orderBy: { effectiveDate: 'desc' },
    });
  }

  // ----------------------------------------------------
  // 2. EXECUTIVE MOM BI PREDICTIVE FORECASTING ENGINE
  // ----------------------------------------------------
  async generatePredictiveForecast(dto: GenerateForecastDto) {
    const growth = dto.growthRateMultiplier ?? 1.05;

    // Aggregate recent historical financials for baseline
    const totalIncome = await this.prisma.income.aggregate({
      _sum: { amount: true },
    });
    const totalExpense = await this.prisma.expense.aggregate({
      _sum: { amount: true },
    });
    const totalSales = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
    });

    const baseRevenue =
      Number(totalIncome._sum.amount || 0) +
        Number(totalSales._sum.totalAmount || 0) || 100000;
    const baseExpense = Number(totalExpense._sum.amount || 0) || 40000;

    const projectedRevenue = Number((baseRevenue * growth).toFixed(2));
    const projectedExpense = Number(
      (baseExpense * (1 + (growth - 1) * 0.5)).toFixed(2),
    );
    const predictedEbitda = Number(
      (projectedRevenue - projectedExpense).toFixed(2),
    );

    const confidenceIntervalLower = Number((predictedEbitda * 0.92).toFixed(2));
    const confidenceIntervalUpper = Number((predictedEbitda * 1.08).toFixed(2));

    const assumptions = {
      growthRateMultiplier: growth,
      baselineRevenue: baseRevenue,
      baselineExpense: baseExpense,
      confidenceBandPercentage: 8,
    };

    return this.prisma.executiveBIForecast.create({
      data: {
        forecastPeriod: dto.forecastPeriod,
        projectedRevenue,
        projectedExpense,
        predictedEbitda,
        confidenceIntervalLower,
        confidenceIntervalUpper,
        assumptionsJson: JSON.stringify(assumptions),
      },
    });
  }

  async getForecasts() {
    return this.prisma.executiveBIForecast.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------------------------------------------------
  // 3. CROSS-TENANT GLOBAL CONSOLIDATED LEDGER
  // ----------------------------------------------------
  async consolidateGlobalLedger(dto: ConsolidateLedgerDto) {
    const netBalance = Number((dto.totalDebit - dto.totalCredit).toFixed(2));

    return this.prisma.globalConsolidatedLedger.create({
      data: {
        ledgerPeriod: dto.ledgerPeriod,
        tenantCode: dto.tenantCode,
        accountCategory: dto.accountCategory,
        totalDebit: dto.totalDebit,
        totalCredit: dto.totalCredit,
        netBalance,
        currency: dto.currency ?? 'USD',
      },
    });
  }

  async getConsolidatedLedgers(ledgerPeriod?: string) {
    return this.prisma.globalConsolidatedLedger.findMany({
      where: ledgerPeriod ? { ledgerPeriod } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
