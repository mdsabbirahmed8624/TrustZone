'use client';

import { useState } from 'react';

interface Settlement {
  id: string;
  franchiseName: string;
  settlementPeriod: string;
  grossRevenue: number;
  royaltyFeeAmount: number;
  settlementStatus: string;
}

interface SelfOptimizationMetric {
  id: string;
  engineComponent: string;
  efficiencyGainPercent: number;
  automatedDecisionsCount: number;
  status: string;
}

export default function EnterpriseOperationsPage() {
  const [activeTab, setActiveTab] = useState<'settlement' | 'optimization'>('settlement');

  const sampleSettlements: Settlement[] = [
    { id: '1', franchiseName: 'Dallas Central Franchise', settlementPeriod: '2026-Q3', grossRevenue: 450000.0, royaltyFeeAmount: 22500.0, settlementStatus: 'SETTLED' },
    { id: '2', franchiseName: 'Houston Metro Franchise', settlementPeriod: '2026-Q3', grossRevenue: 380000.0, royaltyFeeAmount: 19000.0, settlementStatus: 'SETTLED' },
  ];

  const sampleOptimization: SelfOptimizationMetric[] = [
    { id: '1', engineComponent: 'INVENTORY_REBALANCE_ENGINE', efficiencyGainPercent: 22.4, automatedDecisionsCount: 1450, status: 'OPTIMAL' },
    { id: '2', engineComponent: 'WORKLOAD_CAPACITY_OPTIMIZER', efficiencyGainPercent: 18.2, automatedDecisionsCount: 980, status: 'OPTIMAL' },
    { id: '3', engineComponent: 'TICKET_SELF_HEALING_AGENT', efficiencyGainPercent: 31.0, automatedDecisionsCount: 3120, status: 'OPTIMAL' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/80 px-3 py-1 rounded-full">
              Phase 12 — Book 7 Final Operations Handoff
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Enterprise Operations & AI Self-Optimization Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Quarterly franchise royalty fee disbursement ledgers, autonomous AI engine efficiency scorecards, and final operations handoff.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg transition-colors">
              💳 Process Quarterly Royalty Settlement
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['settlement', 'optimization'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'settlement' ? 'Royalty Settlements' : 'AI Self-Optimization'}
            </button>
          ))}
        </div>

        {/* Tab 1: Royalty Settlements */}
        {activeTab === 'settlement' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Franchise</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Gross Revenue</th>
                  <th className="px-6 py-4">Royalty Fee (5%)</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleSettlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-white">{s.franchiseName}</td>
                    <td className="px-6 py-4 font-mono text-purple-300">{s.settlementPeriod}</td>
                    <td className="px-6 py-4 font-mono">${s.grossRevenue.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">${s.royaltyFeeAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {s.settlementStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: AI Self-Optimization */}
        {activeTab === 'optimization' && (
          <div className="space-y-4">
            {sampleOptimization.map((o) => (
              <div key={o.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{o.engineComponent}</h3>
                  <p className="text-sm text-slate-400 mt-1">Automated Decisions Executed: <span className="text-purple-300 font-mono font-bold">{o.automatedDecisionsCount.toLocaleString()}</span></p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Efficiency Gain</span>
                    <p className="text-2xl font-mono font-bold text-emerald-400">+{o.efficiencyGainPercent}%</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
