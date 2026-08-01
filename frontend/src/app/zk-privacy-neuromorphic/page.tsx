'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ZkPrivacyMesh {
  id: string;
  zkPrivacyMeshCode: string;
  zkProofGenerationLatencyMs: number;
  privacyShieldAnonymityScore: number;
  activeZkSnarkCircuits: number;
  meshStatus: string;
  lastProofGeneratedAt: string;
}

interface NeuromorphicGrid {
  id: string;
  neuromorphicGridCode: string;
  spikeNeuralNetworkSpikeRateHz: number;
  energyEfficiencyTeraOpsPerWatt: number;
  activeSpikeCoreCount: number;
  gridStatus: string;
  lastSpikeOptimizationAt: string;
}

/* ─────────────── page ─────────────── */
export default function ZkPrivacyNeuromorphicPage() {
  const [tab, setTab] = useState<'zk' | 'neuro'>('zk');

  // ZK Privacy state
  const [zkPrivacyMeshCode, setZkPrivacyMeshCode] = useState('');
  const [activeZkSnarkCircuits, setActiveZkSnarkCircuits] = useState(1024);
  const [zkResult, setZkResult] = useState<ZkPrivacyMesh | null>(null);
  const [zkList, setZkList] = useState<ZkPrivacyMesh[]>([]);
  const [zkLoading, setZkLoading] = useState(false);

  // Neuromorphic state
  const [neuromorphicGridCode, setNeuromorphicGridCode] = useState('');
  const [activeSpikeCoreCount, setActiveSpikeCoreCount] = useState(4096);
  const [neuroResult, setNeuroResult] = useState<NeuromorphicGrid | null>(null);
  const [neuroList, setNeuroList] = useState<NeuromorphicGrid[]>([]);
  const [neuroLoading, setNeuroLoading] = useState(false);

  /* ── zk actions ── */
  const registerZkPrivacyMesh = async () => {
    if (!zkPrivacyMeshCode.trim()) return;
    setZkLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/zk-privacy-neuromorphic-book9/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zkPrivacyMeshCode, activeZkSnarkCircuits: Number(activeZkSnarkCircuits) }),
      });
      const data = await res.json();
      setZkResult(data);
    } catch { /* ignore */ } finally { setZkLoading(false); }
  };

  const loadZkPrivacyMeshes = async () => {
    setZkLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/zk-privacy-neuromorphic-book9`);
      setZkList(await res.json());
    } catch { /* ignore */ } finally { setZkLoading(false); }
  };

  /* ── neuro actions ── */
  const registerNeuromorphicGrid = async () => {
    if (!neuromorphicGridCode.trim()) return;
    setNeuroLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/neuromorphic-edge-grid-book9/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neuromorphicGridCode, activeSpikeCoreCount: Number(activeSpikeCoreCount) }),
      });
      const data = await res.json();
      setNeuroResult(data);
    } catch { /* ignore */ } finally { setNeuroLoading(false); }
  };

  const loadNeuromorphicGrids = async () => {
    setNeuroLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/neuromorphic-edge-grid-book9`);
      setNeuroList(await res.json());
    } catch { /* ignore */ } finally { setNeuroLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const isOk = status === 'ZK_PROTECTION_STRICT_ACTIVE' || status === 'NEUROMORPHIC_SPIKING_ACTIVE' || status.includes('ACTIVE') || status.includes('100');
    return (
      <span style={{
        background: isOk ? '#059669' : '#d97706',
        color: '#fff',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 700,
      }}>{status}</span>
    );
  };

  /* ─────────────── render ─────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #4c1d95 0%, #3b0764 50%, #4c1d95 100%)', color: '#f3e8ff', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #c084fc, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🛡️ Zero-Knowledge Privacy Protection Mesh & Neuromorphic AI Edge Grid
        </h1>
        <p style={{ color: '#e9d5ff', marginTop: 4 }}>Phase 15 — Book 9 · ZK-SNARK Privacy Shield & Spiking Neural Edge Core Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['zk', '🛡️ Zero-Knowledge Privacy Mesh'], ['neuro', '🧠 Neuromorphic AI Edge Grid']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '12px 28px', cursor: 'pointer', border: 'none', fontWeight: 700, fontSize: 14,
            background: tab === key ? 'rgba(168,85,247,0.15)' : 'transparent',
            color: tab === key ? '#c084fc' : '#94a3b8',
            borderBottom: tab === key ? '2px solid #c084fc' : '2px solid transparent',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </nav>

      <main style={{ padding: '32px 48px' }}>
        {/* ─── zk tab ─── */}
        {tab === 'zk' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'ZK Proof Latency', value: '0.42 ms Speed', icon: '⚡' },
                { label: 'Privacy Anonymity', value: '99.999% Shield', icon: '🛡️' },
                { label: 'Active ZK Circuits', value: '1024 Circuits', icon: '🔬' },
                { label: 'Protection State', value: 'ZK Strict Active', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(59,7,100,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#c084fc', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#e9d5ff', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* register form */}
            <div style={{ background: 'rgba(59,7,100,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Zero-Knowledge Privacy Protection Mesh</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={zkPrivacyMeshCode} onChange={e => setZkPrivacyMeshCode(e.target.value)} placeholder="ZK-PRIVACY-P15-B9-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#4c1d95', color: '#f3e8ff', outline: 'none' }} />
                <input type="number" value={activeZkSnarkCircuits} onChange={e => setActiveZkSnarkCircuits(Number(e.target.value))} placeholder="ZK Circuits"
                  style={{ width: 160, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#4c1d95', color: '#f3e8ff', outline: 'none' }} />
                <button onClick={registerZkPrivacyMesh} disabled={zkLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: zkLoading ? 0.6 : 1 }}>
                  {zkLoading ? 'Proving…' : '🛡️ Register ZK Mesh'}
                </button>
                <button onClick={loadZkPrivacyMeshes} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: 'transparent', color: '#c084fc', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {zkResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <strong>✅ ZK Privacy Mesh Verified</strong> — ID: <code>{zkResult.id}</code> | Proof Latency: {zkResult.zkProofGenerationLatencyMs} ms | Status: {badge(zkResult.meshStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {zkList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
                    {['ZK Mesh Code', 'Proof Latency (ms)', 'Anonymity Score (%)', 'ZK Circuits', 'Status', 'Last Proof Generated'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#e9d5ff', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {zkList.map(z => (
                    <tr key={z.id} style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{z.zkPrivacyMeshCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#c084fc', fontWeight: 700 }}>{z.zkProofGenerationLatencyMs} ms</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#a855f7', fontWeight: 700 }}>{z.privacyShieldAnonymityScore}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{z.activeZkSnarkCircuits} Circuits</td>
                      <td style={{ padding: '10px 12px' }}>{badge(z.meshStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(z.lastProofGeneratedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── neuro tab ─── */}
        {tab === 'neuro' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'SNN Spike Rate', value: '10,000 Hz', icon: '🧠' },
                { label: 'Energy Efficiency', value: '120.5 TOPs/W', icon: '🔋' },
                { label: 'Active Spike Cores', value: '4096 Cores', icon: '⚙️' },
                { label: 'Grid State', value: 'Neuromorphic Active', icon: '🔥' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(59,7,100,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#c084fc', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#e9d5ff', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(59,7,100,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Neuromorphic AI Edge Grid</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={neuromorphicGridCode} onChange={e => setNeuromorphicGridCode(e.target.value)} placeholder="NEUROMORPHIC-EDGE-P15-B9-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#4c1d95', color: '#f3e8ff', outline: 'none' }} />
                <input type="number" value={activeSpikeCoreCount} onChange={e => setActiveSpikeCoreCount(Number(e.target.value))} placeholder="Spike Cores"
                  style={{ width: 160, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#4c1d95', color: '#f3e8ff', outline: 'none' }} />
                <button onClick={registerNeuromorphicGrid} disabled={neuroLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: neuroLoading ? 0.6 : 1 }}>
                  {neuroLoading ? 'Spiking…' : '🧠 Register Spike Grid'}
                </button>
                <button onClick={loadNeuromorphicGrids} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: 'transparent', color: '#c084fc', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {neuroResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <strong>✅ Neuromorphic Spike Grid Optimized</strong> — ID: <code>{neuroResult.id}</code> | Energy Efficiency: {neuroResult.energyEfficiencyTeraOpsPerWatt} TOPs/W | Status: {badge(neuroResult.gridStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {neuroList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
                    {['Neuromorphic Code', 'Spike Rate (Hz)', 'Efficiency (TOPs/W)', 'Spike Cores', 'Status', 'Last Optimization'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#e9d5ff', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {neuroList.map(n => (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{n.neuromorphicGridCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#c084fc', fontWeight: 700 }}>{n.spikeNeuralNetworkSpikeRateHz} Hz</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#a855f7', fontWeight: 700 }}>{n.energyEfficiencyTeraOpsPerWatt} TOPs/W</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{n.activeSpikeCoreCount} Cores</td>
                      <td style={{ padding: '10px 12px' }}>{badge(n.gridStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(n.lastSpikeOptimizationAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      {/* footer */}
      <footer style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: 12, borderTop: '1px solid rgba(168,85,247,0.1)' }}>
        TrustZone Mobile Care ERP · Phase 15 Book 9 · ZK-Privacy Shield & Neuromorphic Edge Grid Console · v15.9.0
      </footer>
    </div>
  );
}
