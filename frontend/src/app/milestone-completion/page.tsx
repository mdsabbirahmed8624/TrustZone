'use client';

import { useState } from 'react';

interface Certificate {
  id: string;
  certificateCode: string;
  milestoneTitle: string;
  completedBooksCount: number;
  completionStatus: string;
  signoffOfficer: string;
  certifiedAt: string;
}

interface ModelDrift {
  id: string;
  modelName: string;
  conceptDriftScore: number;
  retrainingStatus: string;
  evaluatedAt: string;
}

export default function MilestoneCompletionPage() {
  const [activeTab, setActiveTab] = useState<'certificate' | 'drift'>('certificate');

  const sampleCertificates: Certificate[] = [
    { id: '1', certificateCode: 'CERT-PHASE-12-COMPLETE', milestoneTitle: 'PHASE 12 ENTERPRISE PLATFORM MILESTONE COMPLETE', completedBooksCount: 9, completionStatus: 'MILESTONE_SUCCESSFULLY_COMPLETED', signoffOfficer: 'CHIEF_ENTERPRISE_ARCHITECT', certifiedAt: '2026-07-26' },
  ];

  const sampleDrifts: ModelDrift[] = [
    { id: '1', modelName: 'REV_PREDICT_V2', conceptDriftScore: 0.08, retrainingStatus: 'STABLE', evaluatedAt: '2026-07-26' },
    { id: '2', modelName: 'WORKLOAD_ALLOCATION_V3', conceptDriftScore: 0.12, retrainingStatus: 'STABLE', evaluatedAt: '2026-07-26' },
    { id: '3', modelName: 'TICKET_SELF_HEAL_V1', conceptDriftScore: 0.04, retrainingStatus: 'STABLE', evaluatedAt: '2026-07-26' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-800/80 px-3 py-1 rounded-full">
              Phase 12 Final Milestone Completion
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Phase 12 Milestone Completion & AI Model Drift Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Official Phase 12 milestone completion certificates (Books 1–9 100% verified), autonomous AI concept drift tracking, and post-launch health surveillance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg transition-colors">
              🏆 Issue Official Milestone Certificate
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['certificate', 'drift'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'certificate' ? 'Milestone Certificates' : 'AI Model Drift Monitoring'}
            </button>
          ))}
        </div>

        {/* Tab 1: Milestone Certificate */}
        {activeTab === 'certificate' && (
          <div className="space-y-6">
            {sampleCertificates.map((c) => (
              <div key={c.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-teal-400">{c.certificateCode}</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{c.milestoneTitle}</h3>
                  </div>
                  <span className="px-4 py-1.5 text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                    {c.completionStatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Books Completed</span>
                    <p className="text-4xl font-mono font-extrabold text-teal-400 mt-2">{c.completedBooksCount} / 9</p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Sign-off Officer</span>
                    <p className="text-lg font-bold text-white mt-2">{c.signoffOfficer}</p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">Certified Date</span>
                    <p className="text-lg font-mono text-emerald-400 mt-2">{c.certifiedAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: AI Model Drift */}
        {activeTab === 'drift' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Model Name</th>
                  <th className="px-6 py-4">Concept Drift Score</th>
                  <th className="px-6 py-4">Retraining Status</th>
                  <th className="px-6 py-4">Evaluated Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleDrifts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{d.modelName}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{d.conceptDriftScore}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {d.retrainingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{d.evaluatedAt}</td>
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
