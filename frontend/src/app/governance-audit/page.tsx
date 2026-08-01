'use client';

import { useState } from 'react';

interface MdmRule {
  id: string;
  entityType: string;
  ruleCode: string;
  goldenSourceCluster: string;
  syncFrequency: string;
  status: string;
}

interface DrAudit {
  id: string;
  regionCluster: string;
  auditType: string;
  rtoTargetSeconds: number;
  rtoAchievedSeconds: number;
  rpoTargetSeconds: number;
  rpoAchievedSeconds: number;
  drillResult: string;
}

interface SlaBenchmark {
  id: string;
  tenantOrRegionCode: string;
  serviceCategory: string;
  targetSlaPercentage: number;
  achievedSlaPercentage: number;
  complianceStatus: string;
}

interface PredictiveMaintenance {
  id: string;
  assetName: string;
  branchName: string;
  predictedFailureRiskScore: number;
  recommendedAction: string;
  scheduledDate: string;
  status: string;
}

export default function GovernanceAuditPage() {
  const [activeTab, setActiveTab] = useState<'mdm' | 'dr' | 'sla' | 'maintenance'>('mdm');

  const sampleMdmRules: MdmRule[] = [
    { id: '1', entityType: 'CUSTOMER', ruleCode: 'MDM-CUST-DEDUP-01', goldenSourceCluster: 'PRIMARY-US-EAST', syncFrequency: 'REALTIME', status: 'ACTIVE' },
    { id: '2', entityType: 'PART_CATALOG', ruleCode: 'MDM-PARTS-SYNC-02', goldenSourceCluster: 'PRIMARY-US-EAST', syncFrequency: 'HOURLY', status: 'ACTIVE' },
    { id: '3', entityType: 'FINANCIAL_LEDGER', ruleCode: 'MDM-FIN-ROLLUP-03', goldenSourceCluster: 'PRIMARY-US-EAST', syncFrequency: 'REALTIME', status: 'ACTIVE' },
  ];

  const sampleDrAudits: DrAudit[] = [
    { id: '1', regionCluster: 'EU-CENTRAL-1 (Frankfurt)', auditType: 'FAILOVER_DRILL', rtoTargetSeconds: 300, rtoAchievedSeconds: 145, rpoTargetSeconds: 60, rpoAchievedSeconds: 12, drillResult: 'PASSED' },
    { id: '2', regionCluster: 'AP-SOUTH-1 (Mumbai)', auditType: 'PITR_VALIDATION', rtoTargetSeconds: 300, rtoAchievedSeconds: 210, rpoTargetSeconds: 60, rpoAchievedSeconds: 25, drillResult: 'PASSED' },
  ];

  const sampleSlaBenchmarks: SlaBenchmark[] = [
    { id: '1', tenantOrRegionCode: 'FRANCHISE-TX01', serviceCategory: 'SCREEN_REPAIR', targetSlaPercentage: 98.0, achievedSlaPercentage: 99.4, complianceStatus: 'COMPLIANT' },
    { id: '2', tenantOrRegionCode: 'FRANCHISE-CA02', serviceCategory: 'BOARD_MICROSOLDERING', targetSlaPercentage: 95.0, achievedSlaPercentage: 96.2, complianceStatus: 'COMPLIANT' },
  ];

  const sampleMaintenance: PredictiveMaintenance[] = [
    { id: '1', assetName: 'BGA Reflow Workstation #04', branchName: 'Dallas Downtown Branch', predictedFailureRiskScore: 84.5, recommendedAction: 'Replace heating element calibration sensor', scheduledDate: '2026-07-28', status: 'SCHEDULED' },
    { id: '2', assetName: 'Ultrasound Cleaning Tank #02', branchName: 'Houston Central Branch', predictedFailureRiskScore: 62.0, recommendedAction: 'Transducer fluid flushing & filter check', scheduledDate: '2026-08-02', status: 'SCHEDULED' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-full">
              Phase 12 — Book 4 Enterprise
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Master Data Governance, DR Drills & Predictive Maintenance
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Golden source MDM synchronization, RTO/RPO failover audit verification, SLA benchmarking, and AI asset risk schedules.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-lg transition-colors">
              + Run DR Failover Drill
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['mdm', 'dr', 'sla', 'maintenance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'mdm' ? 'MDM Governance' : tab === 'dr' ? 'Disaster Recovery (DR)' : tab === 'sla' ? 'Global SLA Benchmarks' : 'Predictive Maintenance'}
            </button>
          ))}
        </div>

        {/* Tab 1: MDM Governance */}
        {activeTab === 'mdm' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Rule Code</th>
                  <th className="px-6 py-4">Entity Type</th>
                  <th className="px-6 py-4">Golden Source Cluster</th>
                  <th className="px-6 py-4">Sync Frequency</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleMdmRules.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{m.ruleCode}</td>
                    <td className="px-6 py-4">{m.entityType}</td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-400">{m.goldenSourceCluster}</td>
                    <td className="px-6 py-4 font-semibold text-amber-300">{m.syncFrequency}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Disaster Recovery */}
        {activeTab === 'dr' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleDrAudits.map((dr) => (
              <div key={dr.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white">{dr.regionCluster}</h3>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                    {dr.drillResult}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">RTO (Recovery Time)</span>
                    <p className="text-lg font-mono font-bold text-emerald-400 mt-1">{dr.rtoAchievedSeconds}s <span className="text-xs font-normal text-slate-500">(target &lt; {dr.rtoTargetSeconds}s)</span></p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">RPO (Recovery Point)</span>
                    <p className="text-lg font-mono font-bold text-emerald-400 mt-1">{dr.rpoAchievedSeconds}s <span className="text-xs font-normal text-slate-500">(target &lt; {dr.rpoTargetSeconds}s)</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: SLA Benchmarks */}
        {activeTab === 'sla' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Tenant / Region</th>
                  <th className="px-6 py-4">Service Category</th>
                  <th className="px-6 py-4">Target SLA</th>
                  <th className="px-6 py-4">Achieved SLA</th>
                  <th className="px-6 py-4">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleSlaBenchmarks.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-white">{s.tenantOrRegionCode}</td>
                    <td className="px-6 py-4">{s.serviceCategory}</td>
                    <td className="px-6 py-4 font-mono">{s.targetSlaPercentage}%</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{s.achievedSlaPercentage}%</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {s.complianceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Predictive Maintenance */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            {sampleMaintenance.map((m) => (
              <div key={m.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-white">{m.assetName}</h3>
                    <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full font-mono">{m.branchName}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">Recommended: <span className="text-amber-400">{m.recommendedAction}</span></p>
                  <p className="text-xs text-slate-500 mt-1">Scheduled for: {m.scheduledDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Failure Risk</span>
                    <p className="text-xl font-mono font-bold text-rose-400">{m.predictedFailureRiskScore}%</p>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
