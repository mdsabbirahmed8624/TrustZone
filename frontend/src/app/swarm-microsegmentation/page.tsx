'use client';

import { useState } from 'react';

interface SwarmAgent {
  id: string;
  agentCode: string;
  swarmClusterId: string;
  targetService: string;
  remediationAction: string;
  recoveryTimeMs: number;
  status: string;
}

interface MicroSegmentationPolicy {
  id: string;
  policyId: string;
  workloadGroup: string;
  sourceSegment: string;
  targetSegment: string;
  allowedPortsJson: string;
  enforcementMode: string;
  status: string;
}

export default function SwarmMicroSegmentationPage() {
  const [activeTab, setActiveTab] = useState<'swarm' | 'microsegmentation'>('swarm');

  const sampleAgents: SwarmAgent[] = [
    { id: '1', agentCode: 'SWARM-AGENT-RECOVERY-01', swarmClusterId: 'SWARM-CLUSTER-US-EAST', targetService: 'PAYMENT_GATEWAY_V2', remediationAction: 'AUTO_FAILOVER', recoveryTimeMs: 350, status: 'HEALTHY' },
    { id: '2', agentCode: 'SWARM-AGENT-RECOVERY-02', swarmClusterId: 'SWARM-CLUSTER-EU-WEST', targetService: 'INVENTORY_SYNC', remediationAction: 'POD_RESTART', recoveryTimeMs: 420, status: 'RECOVERED' },
  ];

  const samplePolicies: MicroSegmentationPolicy[] = [
    { id: '1', policyId: 'ZTRUST-SEG-PAY-TO-DB', workloadGroup: 'FINANCE_CORE', sourceSegment: 'WEB_TIER', targetSegment: 'DB_TIER', allowedPortsJson: '[5432, 6379]', enforcementMode: 'STRICT_ENFORCE', status: 'ACTIVE' },
    { id: '2', policyId: 'ZTRUST-SEG-EDGE-TO-MQ', workloadGroup: 'INVENTORY_EDGE', sourceSegment: 'ROBOTICS_INGRESS', targetSegment: 'KAFKA_MQ', allowedPortsJson: '[9092]', enforcementMode: 'STRICT_ENFORCE', status: 'ACTIVE' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
              Phase 13 — Book 3 AI Swarm Self-Healing & Micro-Segmentation
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Autonomous AI Swarm Recovery & Zero-Trust Micro-Segmentation
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-agent autonomous self-healing recovery swarm agents and identity-based zero-trust workload micro-segmentation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-colors">
              🤖 Deploy Swarm Agent
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['swarm', 'microsegmentation'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'swarm' ? 'Autonomous AI Self-Healing Swarm Agents' : 'Zero-Trust Workload Micro-Segmentation'}
            </button>
          ))}
        </div>

        {/* Tab 1: Swarm Agents */}
        {activeTab === 'swarm' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Agent Code</th>
                  <th className="px-6 py-4">Swarm Cluster</th>
                  <th className="px-6 py-4">Target Service</th>
                  <th className="px-6 py-4">Remediation Action</th>
                  <th className="px-6 py-4">Recovery Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleAgents.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{a.agentCode}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">{a.swarmClusterId}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{a.targetService}</td>
                    <td className="px-6 py-4 font-mono text-xs text-cyan-400">{a.remediationAction}</td>
                    <td className="px-6 py-4 font-mono text-xs text-amber-400">{a.recoveryTimeMs} ms</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Micro-Segmentation Policies */}
        {activeTab === 'microsegmentation' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Policy ID</th>
                  <th className="px-6 py-4">Workload Group</th>
                  <th className="px-6 py-4">Source ➔ Target Segment</th>
                  <th className="px-6 py-4">Allowed Ports</th>
                  <th className="px-6 py-4">Enforcement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {samplePolicies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{p.policyId}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{p.workloadGroup}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{p.sourceSegment} ➔ {p.targetSegment}</td>
                    <td className="px-6 py-4 font-mono text-xs text-cyan-400">{p.allowedPortsJson}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {p.enforcementMode}
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
