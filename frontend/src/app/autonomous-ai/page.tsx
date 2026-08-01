'use client';

import { useState } from 'react';

interface WorkloadAllocation {
  id: string;
  technicianName: string;
  predictedCapacityHours: number;
  allocatedWorkloadHours: number;
  optimizationScore: number;
}

interface IncidentLog {
  id: string;
  incidentCode: string;
  severity: string;
  rootCause: string;
  resolutionAction: string;
  status: string;
}

interface ReplicationLog {
  clusterId: string;
  sourceRegion: string;
  targetRegion: string;
  replicationLagMs: number;
  status: string;
}

export default function AutonomousAIDashboardPage() {
  const [activeTab, setActiveTab] = useState<'workload' | 'incidents' | 'replication'>('workload');

  const sampleAllocations: WorkloadAllocation[] = [
    { id: '1', technicianName: 'Alex Mercer (Lead Tech)', predictedCapacityHours: 8.0, allocatedWorkloadHours: 7.5, optimizationScore: 95.0 },
    { id: '2', technicianName: 'Sarah Jenkins (Microsoldering Specialist)', predictedCapacityHours: 7.0, allocatedWorkloadHours: 6.8, optimizationScore: 98.0 },
    { id: '3', technicianName: 'David Chen (Display Tech)', predictedCapacityHours: 8.5, allocatedWorkloadHours: 8.2, optimizationScore: 97.0 },
  ];

  const sampleIncidents: IncidentLog[] = [
    { id: '1', incidentCode: 'INC-2026-089', severity: 'HIGH', rootCause: 'Redis queue connection drop during peak batch', resolutionAction: 'Auto-reconnected via exponential backoff & flushed pending retry buffer', status: 'RESOLVED' },
    { id: '2', incidentCode: 'INC-2026-090', severity: 'MEDIUM', rootCause: 'Technician SLA breach warning on repair ticket #8942', resolutionAction: 'Reassigned repair ticket to next available bench technician automatically', status: 'RESOLVED' },
  ];

  const sampleReplications: ReplicationLog[] = [
    { clusterId: 'cluster-us-east', sourceRegion: 'us-east-1', targetRegion: 'eu-west-1', replicationLagMs: 120, status: 'HEALTHY' },
    { clusterId: 'cluster-ap-south', sourceRegion: 'us-east-1', targetRegion: 'ap-south-1', replicationLagMs: 450, status: 'HEALTHY' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/80 px-3 py-1 rounded-full">
              Phase 12 — Book 3 Enterprise
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Autonomous AI Workload & Self-Healing Incident Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Predictive bench capacity matching, automated self-healing incident logs, and cross-cluster replication monitoring.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg transition-colors">
              ⚡ Trigger Self-Healing Cycle
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['workload', 'incidents', 'replication'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'workload' ? 'AI Capacity Matching' : tab === 'incidents' ? 'Self-Healing Incidents' : 'Cluster Replication'}
            </button>
          ))}
        </div>

        {/* Tab 1: AI Capacity Matching */}
        {activeTab === 'workload' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Technician</th>
                  <th className="px-6 py-4">Predicted Capacity</th>
                  <th className="px-6 py-4">Allocated Workload</th>
                  <th className="px-6 py-4">AI Optimization Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleAllocations.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-white">{w.technicianName}</td>
                    <td className="px-6 py-4">{w.predictedCapacityHours} hrs</td>
                    <td className="px-6 py-4 font-semibold text-purple-300">{w.allocatedWorkloadHours} hrs</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{w.optimizationScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Incidents */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            {sampleIncidents.map((inc) => (
              <div key={inc.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">{inc.incidentCode}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                      inc.severity === 'HIGH' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {inc.severity} SEVERITY
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                    {inc.status}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-slate-400">Root Cause:</span> <span className="text-slate-200">{inc.rootCause}</span></p>
                  <p><span className="text-slate-400">Resolution Action:</span> <span className="text-emerald-400 font-medium">{inc.resolutionAction}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Replication */}
        {activeTab === 'replication' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Cluster ID</th>
                  <th className="px-6 py-4">Source Region</th>
                  <th className="px-6 py-4">Target Region</th>
                  <th className="px-6 py-4">Replication Lag</th>
                  <th className="px-6 py-4">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleReplications.map((rep, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-semibold text-white">{rep.clusterId}</td>
                    <td className="px-6 py-4">{rep.sourceRegion}</td>
                    <td className="px-6 py-4">{rep.targetRegion}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{rep.replicationLagMs} ms</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {rep.status}
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
