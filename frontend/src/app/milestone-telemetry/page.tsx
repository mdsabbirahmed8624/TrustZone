'use client';

import { useState } from 'react';

interface Certification {
  id: string;
  certCode: string;
  phaseBookTitle: string;
  auditorRole: string;
  certificationStatus: string;
  certifiedAt: string;
}

interface StreamAudit {
  id: string;
  streamId: string;
  sourceService: string;
  eventTopic: string;
  throughputPerSec: number;
  telemetryHealth: string;
  recordedAt: string;
}

export default function MilestoneTelemetryPage() {
  const [activeTab, setActiveTab] = useState<'certifications' | 'telemetry'>('certifications');

  const sampleCertifications: Certification[] = [
    { id: '1', certCode: 'CERT-P13-B6-GA-01', phaseBookTitle: 'PHASE_13_BOOK_6_ENTERPRISE_GA', auditorRole: 'CHIEF_ENTERPRISE_ARCHITECT', certificationStatus: 'CERTIFIED', certifiedAt: '2026-07-26 11:30' },
    { id: '2', certCode: 'CERT-P13-B5-TUNING-02', phaseBookTitle: 'PHASE_13_BOOK_5_GA_TUNING', auditorRole: 'VP_INFRASTRUCTURE', certificationStatus: 'CERTIFIED', certifiedAt: '2026-07-26 11:00' },
  ];

  const sampleStreamAudits: StreamAudit[] = [
    { id: '1', streamId: 'STREAM-AUDIT-IAM-01', sourceService: 'IAM_SECURITY_SERVICE', eventTopic: 'IDENTITY_MESH_EVENTS', throughputPerSec: 14500, telemetryHealth: 'HEALTHY', recordedAt: '2026-07-26 11:45' },
    { id: '2', streamId: 'STREAM-AUDIT-AI-02', sourceService: 'AUTONOMOUS_AI_SERVICE', eventTopic: 'SWARM_REMEDIATIONS', throughputPerSec: 9200, telemetryHealth: 'HEALTHY', recordedAt: '2026-07-26 11:42' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
              Phase 13 — Book 6 Global Milestone Certification & Live Telemetry
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Global Milestone Certification & Real-Time Telemetry Audit Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Enterprise release milestone sign-off certification audits and high-throughput real-time telemetry stream monitoring.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-colors">
              🏆 Issue Certification
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['certifications', 'telemetry'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'certifications' ? 'Global Milestone Certifications' : 'Real-Time Telemetry Streams'}
            </button>
          ))}
        </div>

        {/* Tab 1: Global Milestone Certifications */}
        {activeTab === 'certifications' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Cert Code</th>
                  <th className="px-6 py-4">Phase Book Title</th>
                  <th className="px-6 py-4">Auditor Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Certified Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleCertifications.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{c.certCode}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{c.phaseBookTitle}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{c.auditorRole}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {c.certificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{c.certifiedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Real-Time Telemetry Streams */}
        {activeTab === 'telemetry' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Stream ID</th>
                  <th className="px-6 py-4">Source Service</th>
                  <th className="px-6 py-4">Event Topic</th>
                  <th className="px-6 py-4">Throughput (events/sec)</th>
                  <th className="px-6 py-4">Telemetry Health</th>
                  <th className="px-6 py-4">Recorded Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleStreamAudits.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{s.streamId}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400">{s.sourceService}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{s.eventTopic}</td>
                    <td className="px-6 py-4 font-mono text-amber-400 font-bold">{s.throughputPerSec.toLocaleString()} ops/s</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {s.telemetryHealth}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{s.recordedAt}</td>
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
