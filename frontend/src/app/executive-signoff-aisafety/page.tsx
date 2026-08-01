'use client';

import { useState } from 'react';

interface ExecutiveSignoff {
  id: string;
  signoffCode: string;
  releaseVersion: string;
  signoffRole: string;
  approvalStatus: string;
  signedOffAt: string;
}

interface AiSafetyBoundary {
  id: string;
  verificationCode: string;
  targetModel: string;
  safetyBoundaryStatus: string;
  guardrailScore: number;
  verifiedAt: string;
}

export default function ExecutiveSignoffAiSafetyPage() {
  const [activeTab, setActiveTab] = useState<'signoff' | 'safety'>('signoff');

  const sampleSignoffs: ExecutiveSignoff[] = [
    { id: '1', signoffCode: 'SIGNOFF-P13-B8-EXEC-01', releaseVersion: '13.8.0-GA', signoffRole: 'CHIEF_TECHNOLOGY_OFFICER', approvalStatus: 'APPROVED', signedOffAt: '2026-07-26 12:30' },
    { id: '2', signoffCode: 'SIGNOFF-P13-B8-EXEC-02', releaseVersion: '13.8.0-GA', signoffRole: 'CHIEF_EXECUTIVE_OFFICER', approvalStatus: 'APPROVED', signedOffAt: '2026-07-26 12:15' },
  ];

  const sampleBoundaries: AiSafetyBoundary[] = [
    { id: '1', verificationCode: 'SAFETY-VERIFY-LLM-01', targetModel: 'AUTONOMOUS_REPAIR_ADVISOR', safetyBoundaryStatus: 'PASSED_COMPLIANT', guardrailScore: 99.8, verifiedAt: '2026-07-26 12:35' },
    { id: '2', verificationCode: 'SAFETY-VERIFY-SWARM-02', targetModel: 'SWARM_ORCHESTRATOR', safetyBoundaryStatus: 'PASSED_COMPLIANT', guardrailScore: 99.5, verifiedAt: '2026-07-26 12:20' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/80 px-3 py-1 rounded-full">
              Phase 13 — Book 8 Release Sign-off & AI Safety Boundaries
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Executive Release Sign-off & AI Safety Boundary Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Executive platform release sign-off approvals and real-time autonomous AI safety boundary compliance verification.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg transition-colors">
              ✒️ Executive Sign-off
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
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'signoff' ? 'Executive Release Sign-offs' : 'AI Safety Boundaries'}
            </button>
          ))}
        </div>

        {/* Tab 1: Executive Release Sign-offs */}
        {activeTab === 'signoff' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Sign-off Code</th>
                  <th className="px-6 py-4">Release Version</th>
                  <th className="px-6 py-4">Executive Role</th>
                  <th className="px-6 py-4">Approval Status</th>
                  <th className="px-6 py-4">Signed-off Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleSignoffs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{s.signoffCode}</td>
                    <td className="px-6 py-4 font-mono text-purple-400 font-bold">{s.releaseVersion}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{s.signoffRole}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {s.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{s.signedOffAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: AI Safety Boundaries */}
        {activeTab === 'safety' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Verification Code</th>
                  <th className="px-6 py-4">Target AI Model</th>
                  <th className="px-6 py-4">Safety Status</th>
                  <th className="px-6 py-4">Guardrail Score</th>
                  <th className="px-6 py-4">Verified Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleBoundaries.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{b.verificationCode}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400 font-bold">{b.targetModel}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {b.safetyBoundaryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{b.guardrailScore}%</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{b.verifiedAt}</td>
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
