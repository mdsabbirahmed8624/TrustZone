'use client';

import { useState } from 'react';

interface MasterRelease {
  id: string;
  masterReleaseCode: string;
  versionTag: string;
  totalBooksCompleted: number;
  productionGAApproved: boolean;
  certifiedBy: string;
  certifiedAt: string;
}

interface EthicsAudit {
  id: string;
  policyCode: string;
  policyTitle: string;
  complianceScorePercent: number;
  auditStatus: string;
}

export default function MasterReleasePage() {
  const [activeTab, setActiveTab] = useState<'master' | 'ethics'>('master');

  const sampleMaster: MasterRelease[] = [
    { id: '1', masterReleaseCode: 'TRUSTZONE-ERP-MASTER-GA-RELEASE', versionTag: 'v12.10.0-book10-final', totalBooksCompleted: 10, productionGAApproved: true, certifiedBy: 'GLOBAL_EXECUTIVE_BOARD', certifiedAt: '2026-07-26' },
  ];

  const sampleEthics: EthicsAudit[] = [
    { id: '1', policyCode: 'ETHICS-POL-AI-01', policyTitle: 'Algorithmic Bias & Fair Treatment Policy', complianceScorePercent: 98.5, auditStatus: 'COMPLIANT' },
    { id: '2', policyCode: 'ETHICS-POL-AI-02', policyTitle: 'Data Privacy & Anonymization Policy', complianceScorePercent: 99.2, auditStatus: 'COMPLIANT' },
    { id: '3', policyCode: 'ETHICS-POL-AI-03', policyTitle: 'Autonomous Decision Transparency Policy', complianceScorePercent: 97.8, auditStatus: 'COMPLIANT' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-full">
              Phase 12 — Book 10 Final Production GA Certification
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Master ERP Release Certification & AI Ethics Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Grand final Phase 12 master ERP platform release certification (10/10 Books Completed), autonomous AI governance & ethics policy audits, and production GA deployment readiness.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-xl transition-colors">
              👑 Issue Grand Master ERP GA Release Certification
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['master', 'ethics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'master' ? 'Master ERP Release Certification' : 'AI Ethics & Governance Audits'}
            </button>
          ))}
        </div>

        {/* Tab 1: Master ERP Release */}
        {activeTab === 'master' && (
          <div className="space-y-6">
            {sampleMaster.map((m) => (
              <div key={m.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-amber-400">{m.masterReleaseCode}</span>
                    <h3 className="text-2xl font-black text-white mt-1">PRODUCTION GA RELEASE GOLD MASTER</h3>
                  </div>
                  <span className="px-4 py-1.5 text-xs font-extrabold bg-amber-500 text-slate-950 rounded-full shadow-md">
                    PRODUCTION GA RELEASED 🏆
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Total Books Completed</span>
                    <p className="text-4xl font-mono font-extrabold text-amber-400 mt-2">{m.totalBooksCompleted} / 10</p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Version Release Tag</span>
                    <p className="text-lg font-mono font-bold text-white mt-2">{m.versionTag}</p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Certified By</span>
                    <p className="text-sm font-bold text-amber-300 mt-2">{m.certifiedBy}</p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Production GA Approved</span>
                    <p className="text-lg font-bold text-emerald-400 mt-2">APPROVED (100%) ✅</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: AI Ethics Audits */}
        {activeTab === 'ethics' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Policy Code</th>
                  <th className="px-6 py-4">Policy Title</th>
                  <th className="px-6 py-4">Compliance Score</th>
                  <th className="px-6 py-4">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleEthics.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{e.policyCode}</td>
                    <td className="px-6 py-4 text-slate-200">{e.policyTitle}</td>
                    <td className="px-6 py-4 font-mono font-bold text-amber-400">{e.complianceScorePercent}%</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {e.auditStatus}
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
