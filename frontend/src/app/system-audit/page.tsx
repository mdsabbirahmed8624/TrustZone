'use client';

import { useState } from 'react';

interface SystemAudit {
  id: string;
  auditScope: string;
  securityPassScore: number;
  performancePassScore: number;
  complianceStatus: string;
  auditedBy: string;
  auditedAt: string;
}

interface AiTuning {
  id: string;
  modelName: string;
  accuracyScore: number;
  latencyMs: number;
  status: string;
}

export default function ProductionGaAuditPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'tuning'>('audit');

  const sampleAudits: SystemAudit[] = [
    { id: '1', auditScope: 'PHASE_12_FINAL_GA_RELEASE', securityPassScore: 99.5, performancePassScore: 98.8, complianceStatus: 'PASSED', auditedBy: 'AUTOMATED_ENTERPRISE_AUDITOR', auditedAt: '2026-07-24' },
  ];

  const sampleTunings: AiTuning[] = [
    { id: '1', modelName: 'CAPACITY_MATCHING_V2', accuracyScore: 96.4, latencyMs: 14, status: 'ACTIVE' },
    { id: '2', modelName: 'INVENTORY_REORDER_V3', accuracyScore: 98.1, latencyMs: 9, status: 'ACTIVE' },
    { id: '3', modelName: 'TICKET_SELF_HEAL_V1', accuracyScore: 99.2, latencyMs: 12, status: 'ACTIVE' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1 rounded-full">
              Phase 12 — Book 5 Enterprise Final GA
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Production GA Audit & AI Tuning Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Final enterprise production GA audit verification, security compliance scores, and autonomous AI hyperparameter performance tuning.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg transition-colors">
              🚀 Run Full System Audit
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['audit', 'tuning'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'audit' ? 'GA System Audits' : 'AI Model Tuning'}
            </button>
          ))}
        </div>

        {/* Tab 1: System Audits */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {sampleAudits.map((a) => (
              <div key={a.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Scope: {a.auditScope}</h3>
                    <span className="text-xs text-slate-400">Audited By: {a.auditedBy} on {a.auditedAt}</span>
                  </div>
                  <span className="px-3 py-1 text-sm font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                    {a.complianceStatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                    <span className="text-xs text-slate-400">Security Audit Score</span>
                    <p className="text-3xl font-mono font-bold text-emerald-400 mt-1">{a.securityPassScore}%</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                    <span className="text-xs text-slate-400">Performance Audit Score</span>
                    <p className="text-3xl font-mono font-bold text-cyan-400 mt-1">{a.performancePassScore}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: AI Tuning */}
        {activeTab === 'tuning' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Model Name</th>
                  <th className="px-6 py-4">Accuracy Score</th>
                  <th className="px-6 py-4">Inference Latency</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleTunings.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{t.modelName}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{t.accuracyScore}%</td>
                    <td className="px-6 py-4 font-mono text-cyan-300">{t.latencyMs} ms</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {t.status}
                      </span>
                    </td>
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
