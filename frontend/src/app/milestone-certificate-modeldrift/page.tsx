'use client';

import { useState } from 'react';

interface MilestoneCertificate {
  id: string;
  certificateCode: string;
  milestoneTitle: string;
  certifiedByRole: string;
  certificationStatus: string;
  issuedAt: string;
}

interface AiModelDrift {
  id: string;
  monitoringCode: string;
  targetModel: string;
  driftScore: number;
  anomalyStatus: string;
  monitoredAt: string;
}

export default function MilestoneCertificateModelDriftPage() {
  const [activeTab, setActiveTab] = useState<'certificates' | 'drift'>('certificates');

  const sampleCertificates: MilestoneCertificate[] = [
    { id: '1', certificateCode: 'CERT-P13-MILESTONE-09', milestoneTitle: 'PHASE_13_QUANTUM_RESISTANT_ENTERPRISE_ERP', certifiedByRole: 'CHIEF_ENTERPRISE_ARCHITECT', certificationStatus: 'PASSED_CERTIFIED', issuedAt: '2026-07-26 12:40' },
    { id: '2', certificateCode: 'CERT-P13-MILESTONE-08', milestoneTitle: 'EXECUTIVE_RELEASE_SIGN_OFF_V13_8_0', certifiedByRole: 'CHIEF_TECHNOLOGY_OFFICER', certificationStatus: 'PASSED_CERTIFIED', issuedAt: '2026-07-26 12:30' },
  ];

  const sampleDrifts: AiModelDrift[] = [
    { id: '1', monitoringCode: 'DRIFT-MONITOR-LLM-01', targetModel: 'AUTONOMOUS_SWARM_HEALER', driftScore: 0.012, anomalyStatus: 'STABLE_NO_DRIFT', monitoredAt: '2026-07-26 12:42' },
    { id: '2', monitoringCode: 'DRIFT-MONITOR-ROBOTICS-02', targetModel: 'ROBOTICS_DISPATCH_ENGINE', driftScore: 0.009, anomalyStatus: 'STABLE_NO_DRIFT', monitoredAt: '2026-07-26 12:35' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-800/80 px-3 py-1 rounded-full">
              Phase 13 — Book 9 Milestone Certificates & AI Model Drift
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Phase 13 Milestone Certificates & AI Model Drift Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Phase 13 enterprise milestone completion certificates and real-time autonomous AI model drift monitoring audits.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg transition-colors">
              🏅 Issue Certificate
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['certificates', 'drift'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'certificates' ? 'Phase 13 Milestone Certificates' : 'AI Model Drift Audits'}
            </button>
          ))}
        </div>

        {/* Tab 1: Phase 13 Milestone Certificates */}
        {activeTab === 'certificates' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Certificate Code</th>
                  <th className="px-6 py-4">Milestone Title</th>
                  <th className="px-6 py-4">Certified By Role</th>
                  <th className="px-6 py-4">Certification Status</th>
                  <th className="px-6 py-4">Issued Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleCertificates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{c.certificateCode}</td>
                    <td className="px-6 py-4 font-mono text-teal-400 font-bold">{c.milestoneTitle}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{c.certifiedByRole}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {c.certificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{c.issuedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: AI Model Drift Audits */}
        {activeTab === 'drift' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Monitoring Code</th>
                  <th className="px-6 py-4">Target AI Model</th>
                  <th className="px-6 py-4">Drift Score</th>
                  <th className="px-6 py-4">Anomaly Status</th>
                  <th className="px-6 py-4">Monitored Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleDrifts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{d.monitoringCode}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400 font-bold">{d.targetModel}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{d.driftScore}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {d.anomalyStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{d.monitoredAt}</td>
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
