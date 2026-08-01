'use client';

import { useState } from 'react';

interface SupplyChainPrediction {
  id: string;
  predictionCode: string;
  partCategory: string;
  predictedDemandQuantity: number;
  reorderConfidenceScore: number;
  replenishmentStatus: string;
  predictedAt: string;
}

interface QuantumIdentityMeshNode {
  id: string;
  didIdentifier: string;
  meshNodeRole: string;
  cryptographicPublicKey: string;
  verificationStatus: string;
  lastVerifiedAt: string;
}

export default function QuantumIdentitySupplychainPage() {
  const [activeTab, setActiveTab] = useState<'supplychain' | 'identity'>('supplychain');

  const samplePredictions: SupplyChainPrediction[] = [
    {
      id: '1',
      predictionCode: 'SC-PRED-P14-B4-01',
      partCategory: 'OLED_DISPLAY_ASSEMBLIES',
      predictedDemandQuantity: 450,
      reorderConfidenceScore: 0.985,
      replenishmentStatus: 'AUTO_REORDER_TRIGGERED',
      predictedAt: '2026-07-27 08:00',
    },
    {
      id: '2',
      predictionCode: 'SC-PRED-P14-B4-02',
      partCategory: 'BATTERY_PACKS_5000MAH',
      predictedDemandQuantity: 620,
      reorderConfidenceScore: 0.992,
      replenishmentStatus: 'AUTO_REORDER_TRIGGERED',
      predictedAt: '2026-07-27 07:55',
    },
  ];

  const sampleIdentities: QuantumIdentityMeshNode[] = [
    {
      id: '1',
      didIdentifier: 'did:trustzone:quantum:mesh:node-8801',
      meshNodeRole: 'EDGE_TELEMETRY_ROUTER',
      cryptographicPublicKey: '0x04f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
      verificationStatus: 'AUTHENTICATED_ACTIVE',
      lastVerifiedAt: '2026-07-27 08:00',
    },
    {
      id: '2',
      didIdentifier: 'did:trustzone:quantum:mesh:swarm-9902',
      meshNodeRole: 'SWARM_COORDINATOR',
      cryptographicPublicKey: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      verificationStatus: 'AUTHENTICATED_ACTIVE',
      lastVerifiedAt: '2026-07-27 07:58',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full uppercase tracking-wider">
                Phase 14 — Book 4
              </span>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold rounded-full uppercase tracking-wider">
                v14.4.0 Enterprise
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 text-white">
              Autonomous Supply-Chain Demand Predictor & Quantum Identity Mesh
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              AI predictive inventory replenishment & decentralized DID zero-trust identity authentication for edge mesh nodes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-amber-600/20">
              Trigger Demand Forecast
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-purple-600/20">
              Verify DID Node
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              Forecast Accuracy
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-2">98.5%</div>
            <div className="text-slate-500 text-xs mt-1">Confidence Score</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              Auto-Reorder Volume
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">1,070 Units</div>
            <div className="text-slate-500 text-xs mt-1">Autonomous PO Generation</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              Decentralized DIDs
            </div>
            <div className="text-2xl font-bold text-purple-400 mt-2">100% Verified</div>
            <div className="text-slate-500 text-xs mt-1">Quantum Mesh Public Keys</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl p-5">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              Zero-Trust Auth
            </div>
            <div className="text-2xl font-bold text-cyan-400 mt-2">Active</div>
            <div className="text-slate-500 text-xs mt-1">Zero Challenge Failures</div>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('supplychain')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'supplychain'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📦 Supply-Chain Demand Forecasting
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'identity'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔑 Quantum Identity Mesh DIDs
          </button>
        </div>

        {/* Tab 1: Supply-Chain Demand Forecasting */}
        {activeTab === 'supplychain' && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                AI Demand Forecasts & Auto-Replenishment Orders
              </h2>
              <span className="text-xs text-slate-400">Showing 2 Forecasts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Prediction Code</th>
                    <th className="px-6 py-4">Part Category</th>
                    <th className="px-6 py-4">Predicted Demand</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Replenishment Status</th>
                    <th className="px-6 py-4">Predicted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {samplePredictions.map((pred) => (
                    <tr key={pred.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-amber-400">
                        {pred.predictionCode}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {pred.partCategory}
                      </td>
                      <td className="px-6 py-4 text-emerald-300 font-bold">
                        {pred.predictedDemandQuantity} Units
                      </td>
                      <td className="px-6 py-4 text-amber-300 font-mono">
                        {(pred.reorderConfidenceScore * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-md">
                          {pred.replenishmentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{pred.predictedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Quantum Identity Mesh DIDs */}
        {activeTab === 'identity' && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Quantum Identity Decentralized Node Authentications
              </h2>
              <span className="text-xs text-slate-400">Showing 2 Verified DIDs</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">DID Identifier</th>
                    <th className="px-6 py-4">Node Role</th>
                    <th className="px-6 py-4">Cryptographic Public Key</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sampleIdentities.map((idNode) => (
                    <tr key={idNode.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-purple-400">
                        {idNode.didIdentifier}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {idNode.meshNodeRole}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {idNode.cryptographicPublicKey}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-md">
                          {idNode.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{idNode.lastVerifiedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
