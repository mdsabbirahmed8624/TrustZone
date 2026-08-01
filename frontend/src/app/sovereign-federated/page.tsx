'use client';

import { useState } from 'react';

interface ResidencyPolicy {
  id: string;
  policyCode: string;
  regionZone: string;
  jurisdictionCountry: string;
  cloudProvider: string;
  encryptionMode: string;
  complianceStatus: string;
}

interface FederatedJob {
  id: string;
  jobId: string;
  modelName: string;
  participatingNodesCount: number;
  privacyBudgetEpsilon: number;
  aggregationRound: number;
  status: string;
}

export default function SovereignFederatedPage() {
  const [activeTab, setActiveTab] = useState<'residency' | 'federated'>('residency');

  const samplePolicies: ResidencyPolicy[] = [
    { id: '1', policyCode: 'RESIDENCY-EU-GERMANY-01', regionZone: 'eu-central-1', jurisdictionCountry: 'DE', cloudProvider: 'AWS_SOVEREIGN_EU', encryptionMode: 'HOMOMORPHIC_ENCRYPTED', complianceStatus: 'COMPLIANT' },
    { id: '2', policyCode: 'RESIDENCY-APAC-SINGAPORE-02', regionZone: 'ap-southeast-1', jurisdictionCountry: 'SG', cloudProvider: 'GCP_SOVEREIGN', encryptionMode: 'HARDWARE_HSM', complianceStatus: 'COMPLIANT' },
  ];

  const sampleJobs: FederatedJob[] = [
    { id: '1', jobId: 'FED-JOB-REPAIR-V4', modelName: 'DIAGNOSTIC_NN_PRIVACY_V4', participatingNodesCount: 16, privacyBudgetEpsilon: 0.5, aggregationRound: 3, status: 'AGGREGATING' },
    { id: '2', jobId: 'FED-JOB-FORECAST-V2', modelName: 'SUPPLY_DEMAND_FED_V2', participatingNodesCount: 24, privacyBudgetEpsilon: 0.2, aggregationRound: 5, status: 'CONVERGED' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/80 px-3 py-1 rounded-full">
              Phase 13 — Book 2 Sovereign Residency & Federated AI
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Multi-Cloud Sovereign Data Residency & Federated Learning
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-cloud sovereign data residency governance and privacy-preserving decentralized AI federated learning orchestration.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg transition-colors">
              🛡️ Create Sovereign Policy
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['residency', 'federated'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'residency' ? 'Multi-Cloud Sovereign Data Residency' : 'Privacy-Preserving Federated Learning'}
            </button>
          ))}
        </div>

        {/* Tab 1: Sovereign Data Residency Policies */}
        {activeTab === 'residency' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Policy Code</th>
                  <th className="px-6 py-4">Region / Country</th>
                  <th className="px-6 py-4">Cloud Provider</th>
                  <th className="px-6 py-4">Encryption Mode</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {samplePolicies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{p.policyCode}</td>
                    <td className="px-6 py-4 font-mono text-purple-400">{p.regionZone} ({p.jurisdictionCountry})</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{p.cloudProvider}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{p.encryptionMode}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {p.complianceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Federated Learning Jobs */}
        {activeTab === 'federated' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Job ID</th>
                  <th className="px-6 py-4">Model Name</th>
                  <th className="px-6 py-4">Nodes Count</th>
                  <th className="px-6 py-4">Privacy Budget (ε)</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{j.jobId}</td>
                    <td className="px-6 py-4 font-mono text-purple-400 font-bold">{j.modelName}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{j.participatingNodesCount} nodes</td>
                    <td className="px-6 py-4 font-mono text-xs text-amber-400">ε = {j.privacyBudgetEpsilon}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-800 rounded-full">
                        {j.status}
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
