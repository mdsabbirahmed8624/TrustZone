'use client';

import { useState } from 'react';

interface MeshKey {
  id: string;
  keyId: string;
  algorithm: string;
  keyLengthBits: number;
  status: string;
  expiresAt: string;
}

interface RoboticsDispatch {
  id: string;
  dispatchId: string;
  roboticsUnitCode: string;
  dispatchStatus: string;
  dispatchedAt: string;
}

export default function QuantumRoboticsPage() {
  const [activeTab, setActiveTab] = useState<'quantum' | 'robotics'>('quantum');

  const sampleKeys: MeshKey[] = [
    { id: '1', keyId: 'QKEY-MESH-US-EAST-01', algorithm: 'CRYSTALS-Kyber-1024', keyLengthBits: 1024, status: 'ACTIVE', expiresAt: '2026-08-25' },
    { id: '2', keyId: 'QKEY-MESH-EU-WEST-02', algorithm: 'Falcon-1024', keyLengthBits: 1024, status: 'ACTIVE', expiresAt: '2026-08-25' },
  ];

  const sampleDispatches: RoboticsDispatch[] = [
    { id: '1', dispatchId: 'DISPATCH-ROBOT-8801', roboticsUnitCode: 'ROBOT-AGV-04', dispatchStatus: 'IN_TRANSIT', dispatchedAt: '2026-07-26 08:15' },
    { id: '2', dispatchId: 'DISPATCH-DRONE-9902', roboticsUnitCode: 'DRONE-HEAVY-02', dispatchStatus: 'DELIVERED', dispatchedAt: '2026-07-26 07:45' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1 rounded-full">
              Phase 13 — Book 1 Quantum Mesh & Autonomous Robotics
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Quantum Security Mesh & Robotics Dispatch Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Quantum-resistant cryptographic lattice key governance (Kyber-1024) and autonomous warehouse robotics drone supply-chain dispatch engine.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-lg transition-colors">
              🔐 Register Quantum Mesh Key
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['quantum', 'robotics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'quantum' ? 'Quantum Cryptographic Keys' : 'Autonomous Robotics & Drone Dispatch'}
            </button>
          ))}
        </div>

        {/* Tab 1: Quantum Mesh Keys */}
        {activeTab === 'quantum' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Key ID</th>
                  <th className="px-6 py-4">Algorithm</th>
                  <th className="px-6 py-4">Key Length</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expires Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{k.keyId}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400">{k.algorithm}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{k.keyLengthBits} bits</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {k.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{k.expiresAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Robotics Dispatch */}
        {activeTab === 'robotics' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Dispatch ID</th>
                  <th className="px-6 py-4">Robotics Unit</th>
                  <th className="px-6 py-4">Dispatch Status</th>
                  <th className="px-6 py-4">Dispatched Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleDispatches.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-white">{r.dispatchId}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400 font-bold">{r.roboticsUnitCode}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full">
                        {r.dispatchStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{r.dispatchedAt}</td>
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
