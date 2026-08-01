'use client';

import { useState } from 'react';

interface PlatformSignoff {
  id: string;
  releaseCode: string;
  versionTag: string;
  vpEngineeringSignoff: boolean;
  ctoSignoff: boolean;
  auditPassed: boolean;
  signoffDate: string;
}

interface SafetyVerification {
  id: string;
  safetyCheckCode: string;
  maxActionThreshold: number;
  evaluatedValue: number;
  safetyStatus: string;
}

export default function PlatformSignoffPage() {
  const [activeTab, setActiveTab] = useState<'signoff' | 'safety'>('signoff');

  const sampleSignoffs: PlatformSignoff[] = [
    { id: '1', releaseCode: 'TRUSTZONE-ERP-V12-FINAL', versionTag: 'v12.8.0-book8-final', vpEngineeringSignoff: true, ctoSignoff: true, auditPassed: true, signoffDate: '2026-07-24' },
  ];

  const sampleSafety: SafetyVerification[] = [
    { id: '1', safetyCheckCode: 'SAFE-BOUND-CREDIT-LIMIT-01', maxActionThreshold: 50000.0, evaluatedValue: 12500.0, safetyStatus: 'PASSED' },
    { id: '2', safetyCheckCode: 'SAFE-BOUND-INVENTORY-DRAIN-02', maxActionThreshold: 500.0, evaluatedValue: 120.0, safetyStatus: 'PASSED' },
    { id: '3', safetyCheckCode: 'SAFE-BOUND-FEE-DISCOUNT-03', maxActionThreshold: 15.0, evaluatedValue: 5.0, safetyStatus: 'PASSED' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
              Phase 12 — Book 8 Final Platform Release Sign-Off
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              ERP Platform Executive Sign-Off & AI Safety Boundaries
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Final executive platform sign-offs (VP Engineering & CTO approvals), autonomous AI safety constraint verification logs, and release readiness.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-colors">
              🏆 Execute Executive Platform Sign-Off
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['signoff', 'safety'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'signoff' ? 'Executive Sign-Off Log' : 'AI Safety Boundaries'}
            </button>
          ))}
        </div>

        {/* Tab 1: Executive Sign-off */}
        {activeTab === 'signoff' && (
          <div className="space-y-6">
            {sampleSignoffs.map((s) => (
              <div key={s.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{s.releaseCode}</h3>
                    <span className="text-xs text-slate-400">Release Tag: <span className="font-mono text-emerald-400">{s.versionTag}</span></span>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                    GA RELEASE APPROVED
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">VP of Engineering Approval</span>
                    <p className="text-lg font-bold text-emerald-400 mt-1">APPROVED ✅</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Chief Technology Officer (CTO)</span>
                    <p className="text-lg font-bold text-emerald-400 mt-1">APPROVED ✅</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Full Audit Cleared</span>
                    <p className="text-lg font-bold text-emerald-400 mt-1">PASSED (100%) ✅</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: AI Safety Boundaries */}
        {activeTab === 'safety' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Safety Check Code</th>
                  <th className="px-6 py-4">Action Threshold</th>
                  <th className="px-6 py-4">Evaluated Value</th>
                  <th className="px-6 py-4">Safety Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleSafety.map((sf) => (
                  <tr key={sf.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{sf.safetyCheckCode}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">&lt;= {sf.maxActionThreshold.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{sf.evaluatedValue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {sf.safetyStatus}
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
