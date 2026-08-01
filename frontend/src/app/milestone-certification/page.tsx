'use client';

import { useState } from 'react';

interface MilestoneCertification {
  id: string;
  milestoneCode: string;
  certifiedVersion: string;
  signingExecutive: string;
  status: string;
  certifiedAt: string;
}

interface TelemetryLog {
  id: string;
  serviceName: string;
  regionCode: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  throughputRps: number;
  errorRatePercent: number;
}

export default function MilestoneCertificationPage() {
  const [activeTab, setActiveTab] = useState<'certification' | 'telemetry'>('certification');

  const sampleCertifications: MilestoneCertification[] = [
    { id: '1', milestoneCode: 'PHASE-12-FINAL-GA-RELEASE', certifiedVersion: '12.6.0-GA', signingExecutive: 'ENTERPRISE_VP_OF_ENGINEERING', status: 'APPROVED_AND_CERTIFIED', certifiedAt: '2026-07-24' },
  ];

  const sampleTelemetry: TelemetryLog[] = [
    { id: '1', serviceName: 'TRUSTZONE_ERP_API', regionCode: 'US-EAST-1', cpuUsagePercent: 18.4, memoryUsagePercent: 42.1, throughputRps: 1450.0, errorRatePercent: 0.00 },
    { id: '2', serviceName: 'AUTONOMOUS_AI_ENGINE', regionCode: 'EU-CENTRAL-1', cpuUsagePercent: 24.2, memoryUsagePercent: 51.8, throughputRps: 820.0, errorRatePercent: 0.00 },
    { id: '3', serviceName: 'DATABASE_CLUSTER_PRIMARY', regionCode: 'US-EAST-1', cpuUsagePercent: 15.0, memoryUsagePercent: 38.5, throughputRps: 3200.0, errorRatePercent: 0.00 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
              Phase 12 — Book 6 Milestone Release Certification
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Global Milestone Release Certification & Live Telemetry
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Final executive release certification sign-off, live multi-region system telemetry audit logs, and operational handoff verification.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-colors">
              🏆 Sign-off & Certify Release
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['certification', 'telemetry'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'certification' ? 'Executive Certifications' : 'Live System Telemetry'}
            </button>
          ))}
        </div>

        {/* Tab 1: Executive Certifications */}
        {activeTab === 'certification' && (
          <div className="space-y-6">
            {sampleCertifications.map((c) => (
              <div key={c.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{c.milestoneCode}</h3>
                    <span className="text-xs text-slate-400">Certified Version: <span className="font-mono text-emerald-400">{c.certifiedVersion}</span></span>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                    {c.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Signing Authority</span>
                    <p className="text-md font-bold text-white mt-1">{c.signingExecutive}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Certification Timestamp</span>
                    <p className="text-md font-mono text-emerald-400 mt-1">{c.certifiedAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Live Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Service Name</th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">CPU Usage</th>
                  <th className="px-6 py-4">Memory Usage</th>
                  <th className="px-6 py-4">Throughput (RPS)</th>
                  <th className="px-6 py-4">Error Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleTelemetry.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{t.serviceName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-400">{t.regionCode}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">{t.cpuUsagePercent}%</td>
                    <td className="px-6 py-4 font-mono text-cyan-300">{t.memoryUsagePercent}%</td>
                    <td className="px-6 py-4 font-mono font-bold text-amber-300">{t.throughputRps} rps</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{t.errorRatePercent}%</td>
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
