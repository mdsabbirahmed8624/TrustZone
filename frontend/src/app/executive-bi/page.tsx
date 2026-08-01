'use client';

import { useState } from 'react';

interface CurrencyRate {
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  effectiveDate: string;
}

interface ExecutiveForecast {
  period: string;
  projectedRevenue: number;
  projectedExpense: number;
  predictedEbitda: number;
  confidenceLower: number;
  confidenceUpper: number;
}

interface AIRule {
  id: string;
  ruleName: string;
  triggerCondition: string;
  actionType: string;
  isEnabled: boolean;
  priority: number;
}

export default function ExecutiveBIDashboardPage() {
  const [activeTab, setActiveTab] = useState<'forecast' | 'currency' | 'ledger' | 'ai-rules'>('forecast');
  const [convertFrom, setConvertFrom] = useState('USD');
  const [convertTo, setConvertTo] = useState('EUR');
  const [amount, setAmount] = useState<number>(1000);
  const [convertedResult, setConvertedResult] = useState<number | null>(920);

  const sampleRates: CurrencyRate[] = [
    { fromCurrency: 'USD', toCurrency: 'EUR', exchangeRate: 0.92, effectiveDate: '2026-07-23' },
    { fromCurrency: 'USD', toCurrency: 'GBP', exchangeRate: 0.78, effectiveDate: '2026-07-23' },
    { fromCurrency: 'USD', toCurrency: 'BDT', exchangeRate: 117.5, effectiveDate: '2026-07-23' },
    { fromCurrency: 'USD', toCurrency: 'AED', exchangeRate: 3.67, effectiveDate: '2026-07-23' },
  ];

  const sampleForecasts: ExecutiveForecast[] = [
    { period: '2026-Q4', projectedRevenue: 450000, projectedExpense: 180000, predictedEbitda: 270000, confidenceLower: 248400, confidenceUpper: 291600 },
    { period: '2027-Q1', projectedRevenue: 510000, projectedExpense: 200000, predictedEbitda: 310000, confidenceLower: 285200, confidenceUpper: 334800 },
  ];

  const sampleAIRules: AIRule[] = [
    { id: '1', ruleName: 'SLA Auto-Reassignment', triggerCondition: 'TICKET_SLA_BREACH', actionType: 'SELF_HEAL_QUEUE', isEnabled: true, priority: 1 },
    { id: '2', ruleName: 'Inventory Auto-Reorder', triggerCondition: 'STOCK_BELOW_REORDER_POINT', actionType: 'AUTO_REORDER', isEnabled: true, priority: 2 },
    { id: '3', ruleName: 'Escalate High Priority Ticket', triggerCondition: 'CRITICAL_HARDWARE_FAIL', actionType: 'ESCALATE_MANAGER', isEnabled: true, priority: 3 },
  ];

  const handleConvert = () => {
    const rate = sampleRates.find(r => r.fromCurrency === convertFrom && r.toCurrency === convertTo)?.exchangeRate || 1.0;
    setConvertedResult(Number((amount * rate).toFixed(2)));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
              Phase 12 — Book 2 Enterprise
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Global Executive BI, Currency & AI Rules Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-month predictive forecasting, cross-tenant general ledger consolidation, and multi-region FX conversion.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-colors">
              + Generate Forecast
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['forecast', 'currency', 'ledger', 'ai-rules'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'forecast' ? 'Predictive BI Forecast' : tab === 'currency' ? 'Currency Exchange' : tab === 'ledger' ? 'Consolidated Ledger' : 'Autonomous AI Rules'}
            </button>
          ))}
        </div>

        {/* Tab 1: Predictive BI Forecast */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleForecasts.map((f) => (
                <div key={f.period} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-white">Period: {f.period}</h3>
                    <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-medium">
                      EBITDA Margin: {((f.predictedEbitda / f.projectedRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex justify-between"><span className="text-slate-400">Projected Revenue:</span><span className="font-bold text-white">${f.projectedRevenue.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Projected Expense:</span><span className="font-bold text-rose-400">${f.projectedExpense.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t border-slate-800 pt-2"><span className="text-slate-400">Predicted EBITDA:</span><span className="font-bold text-emerald-400">${f.predictedEbitda.toLocaleString()}</span></div>
                    <div className="text-xs text-slate-500 pt-2">Confidence Band (92%-108%): ${f.confidenceLower.toLocaleString()} — ${f.confidenceUpper.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Currency Exchange */}
        {activeTab === 'currency' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 shadow-md">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Currency Calculator</h3>
              <div>
                <label className="text-xs text-slate-400">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">From</label>
                  <select
                    value={convertFrom}
                    onChange={(e) => setConvertFrom(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BDT">BDT</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">To</label>
                  <select
                    value={convertTo}
                    onChange={(e) => setConvertTo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BDT">BDT</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleConvert}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
              >
                Convert Currency
              </button>
              {convertedResult !== null && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <span className="text-xs text-slate-400">Converted Output</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{convertedResult} {convertTo}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
              <div className="p-4 border-b border-slate-800 font-bold text-white">Active Multi-Region Exchange Rates</div>
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">From</th>
                    <th className="px-6 py-3">To</th>
                    <th className="px-6 py-3">Exchange Rate</th>
                    <th className="px-6 py-3">Effective Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sampleRates.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="px-6 py-3 font-semibold text-white">{r.fromCurrency}</td>
                      <td className="px-6 py-3 font-semibold text-white">{r.toCurrency}</td>
                      <td className="px-6 py-3 font-mono font-bold text-emerald-400">{r.exchangeRate}</td>
                      <td className="px-6 py-3 text-slate-400">{r.effectiveDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Autonomous AI Rules */}
        {activeTab === 'ai-rules' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Rule Name</th>
                  <th className="px-6 py-4">Trigger Condition</th>
                  <th className="px-6 py-4">Action Type</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleAIRules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-white">{r.ruleName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-400">{r.triggerCondition}</td>
                    <td className="px-6 py-4 font-mono text-xs text-amber-400">{r.actionType}</td>
                    <td className="px-6 py-4 font-semibold">{r.priority}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Ledger */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <p className="text-base">
              Global Consolidated General Ledger Service mapped at <code className="text-emerald-400">/api/v1/enterprise-bi/consolidated-ledger</code>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
