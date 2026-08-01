'use client';

import { useState } from 'react';

interface RoyaltySettlement {
  id: string;
  settlementCode: string;
  franchiseOrgId: string;
  netRoyaltyAmount: number;
  escrowStatus: string;
  settledAt: string;
}

interface SelfOptimizationAnalytics {
  id: string;
  optimizationCode: string;
  targetModel: string;
  hyperParameterConfigJson: string;
  efficiencyGainPercent: number;
  evaluationStatus: string;
  evaluatedAt: string;
}

export default function FranchiseRoyaltySelfOptPage() {
  const [activeTab, setActiveTab] = useState<'settlements' | 'optimization'>('settlements');

  const sampleSettlements: RoyaltySettlement[] = [
    { id: '1', settlementCode: 'SETTLE-FRAN-2026-Q3-01', franchiseOrgId: 'FRAN-ORG-TX-881', netRoyaltyAmount: 12500.0, escrowStatus: 'ESCROW_RELEASED', settledAt: '2026-07-26 12:00' },
    { id: '2', settlementCode: 'SETTLE-FRAN-2026-Q3-02', franchiseOrgId: 'FRAN-ORG-CA-992', netRoyaltyAmount: 18400.5, escrowStatus: 'ESCROW_HELD', settledAt: '2026-07-26 11:45' },
  ];

  const sampleAnalytics: SelfOptimizationAnalytics[] = [
    { id: '1', optimizationCode: 'OPT-ANALYTICS-LLM-01', targetModel: 'LLM_INFERENCE_ENGINE', hyperParameterConfigJson: '{"learningRate": 0.001, "batchSize": 64}', efficiencyGainPercent: 21.4, evaluationStatus: 'PASSED', evaluatedAt: '2026-07-26 12:15' },
    { id: '2', optimizationCode: 'OPT-ANALYTICS-SWARM-02', targetModel: 'SWARM_ALLOCATOR', hyperParameterConfigJson: '{"maxThreads": 128, "timeoutMs": 500}', efficiencyGainPercent: 16.8, evaluationStatus: 'PASSED', evaluatedAt: '2026-07-26 12:10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-full">
              Phase 13 — Book 7 Royalty Settlements & AI Self-Optimization
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Franchise Royalty Settlements & AI Self-Optimization Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Automated franchise net royalty settlements, escrow release tracking, and real-time AI hyper-parameter self-optimization analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-lg transition-colors">
              💰 Process Settlement
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['settlements', 'optimization'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'settlements' ? 'Franchise Royalty Settlements' : 'AI Self-Optimization Analytics'}
            </button>
          ))}
        </div>

        {/* Tab 1: Franchise Royalty Settlements */}
        {activeTab === 'settlements' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Settlement Code</th>
                  <th className="px-6 py-4">Franchise Org ID</th>
                  <th className="px-6 py-4">Net Royalty Amount</th>
                  <th className="px-6 py-4">Escrow Status</th>
                  <th className="px-6 py-4">Settled Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleSettlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{s.settlementCode}</td>
                    <td className="px-6 py-4 font-mono text-amber-400">{s.franchiseOrgId}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-bold">${s.netRoyaltyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        s.escrowStatus === 'ESCROW_RELEASED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        {s.escrowStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{s.settledAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: AI Self-Optimization Analytics */}
        {activeTab === 'optimization' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Optimization Code</th>
                  <th className="px-6 py-4">Target Model</th>
                  <th className="px-6 py-4">Hyper-Parameters</th>
                  <th className="px-6 py-4">Efficiency Gain</th>
                  <th className="px-6 py-4">Evaluation Status</th>
                  <th className="px-6 py-4">Evaluated Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleAnalytics.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{a.optimizationCode}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400 font-bold">{a.targetModel}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{a.hyperParameterConfigJson}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-bold">+{a.efficiencyGainPercent}%</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {a.evaluationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{a.evaluatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
