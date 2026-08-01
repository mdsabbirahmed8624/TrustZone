'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SovereignIdentity {
  id: string;
  identityCode: string;
  quantumAlgorithm: string;
  identityProvider: string;
  verifiableCredentialCount: number;
  identityStatus: string;
  lastAuthenticatedAt: string;
}

interface NeuromorphicMeshNode {
  id: string;
  meshNodeCode: string;
  spikeNeuralLatencyMs: number;
  diagnosticAccuracyPercent: number;
  hardwareAcceleratedEngine: string;
  meshStatus: string;
  lastDiagnosedAt: string;
}

/* ─────────────── page ─────────────── */
export default function QuantumIdentityNeuromorphicDiagnosticsPage() {
  const [tab, setTab] = useState<'identity' | 'neuromorphic'>('identity');

  // Identity state
  const [identityCode, setIdentityCode] = useState('');
  const [quantumAlgorithm, setQuantumAlgorithm] = useState('CRYSTALS_DILITHIUM_KYBER');
  const [verifiableCredentialCount, setVerifiableCredentialCount] = useState(4500);
  const [identityResult, setIdentityResult] = useState<SovereignIdentity | null>(null);
  const [identityList, setIdentityList] = useState<SovereignIdentity[]>([]);
  const [identityLoading, setIdentityLoading] = useState(false);

  // Neuromorphic state
  const [meshNodeCode, setMeshNodeCode] = useState('');
  const [hardwareAcceleratedEngine, setHardwareAcceleratedEngine] = useState('TENSOR_NEUROMORPHIC_NPU');
  const [meshResult, setMeshResult] = useState<NeuromorphicMeshNode | null>(null);
  const [meshList, setMeshList] = useState<NeuromorphicMeshNode[]>([]);
  const [meshLoading, setMeshLoading] = useState(false);

  /* ── identity actions ── */
  const registerIdentity = async () => {
    if (!identityCode.trim()) return;
    setIdentityLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/sovereign-quantum-identity-book3/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityCode, quantumAlgorithm, verifiableCredentialCount: Number(verifiableCredentialCount) }),
      });
      const data = await res.json();
      setIdentityResult(data);
    } catch { /* ignore */ } finally { setIdentityLoading(false); }
  };

  const loadIdentities = async () => {
    setIdentityLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/sovereign-quantum-identity-book3`);
      setIdentityList(await res.json());
    } catch { /* ignore */ } finally { setIdentityLoading(false); }
  };

  /* ── neuromorphic actions ── */
  const registerMeshNode = async () => {
    if (!meshNodeCode.trim()) return;
    setMeshLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/neuromorphic-edge-diagnostics-book3/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meshNodeCode, hardwareAcceleratedEngine }),
      });
      const data = await res.json();
      setMeshResult(data);
    } catch { /* ignore */ } finally { setMeshLoading(false); }
  };

  const loadMeshNodes = async () => {
    setMeshLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/neuromorphic-edge-diagnostics-book3`);
      setMeshList(await res.json());
    } catch { /* ignore */ } finally { setMeshLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const isOk = status === 'VERIFIED_ACTIVE' || status === 'ACTIVE_HEALTHY' || status.includes('CRYSTALS') || status.includes('NPU');
    return (
      <span style={{
        background: isOk ? '#a855f7' : '#f59e0b',
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #1e1b4b 100%)', color: '#f3e8ff', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #c084fc, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🔐 Sovereign Quantum Identity Federation & Neuromorphic Diagnostics
        </h1>
        <p style={{ color: '#d8b4fe', marginTop: 4 }}>Phase 15 — Book 3 · Quantum Security & Neuromorphic Edge NPU Mesh Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['identity', '🔐 Sovereign Quantum DID'], ['neuromorphic', '🧠 Neuromorphic NPU Mesh']] as const).map(([key, label]) => (
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
        {/* ─── identity tab ─── */}
        {tab === 'identity' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Quantum Algorithm', value: 'Dilithium / Kyber', icon: '🔐' },
                { label: 'Verifiable Credentials', value: '4,500 DIDs', icon: '🆔' },
                { label: 'Identity Provider', value: 'TrustZone Sovereign IdP', icon: '🛡️' },
                { label: 'Security Standard', value: 'PQC NIST Round-4', icon: '⚡' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(49,16,75,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#c084fc', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#e9d5ff', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* register form */}
            <div style={{ background: 'rgba(49,16,75,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Sovereign Quantum-Resistant Federated Identity</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={identityCode} onChange={e => setIdentityCode(e.target.value)} placeholder="DID-SOVEREIGN-P15-B3-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#1e1b4b', color: '#f3e8ff', outline: 'none' }} />
                <select value={quantumAlgorithm} onChange={e => setQuantumAlgorithm(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#1e1b4b', color: '#f3e8ff', outline: 'none' }}>
                  <option value="CRYSTALS_DILITHIUM_KYBER">CRYSTALS_DILITHIUM_KYBER</option>
                  <option value="FALCON_SPHINCS_PLUS">FALCON_SPHINCS_PLUS</option>
                </select>
                <input type="number" value={verifiableCredentialCount} onChange={e => setVerifiableCredentialCount(Number(e.target.value))} placeholder="Credentials"
                  style={{ width: 140, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#1e1b4b', color: '#f3e8ff', outline: 'none' }} />
                <button onClick={registerIdentity} disabled={identityLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #a855f7, #d946ef)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: identityLoading ? 0.6 : 1 }}>
                  {identityLoading ? 'Registering…' : '🔐 Register DID'}
                </button>
                <button onClick={loadIdentities} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: 'transparent', color: '#c084fc', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {identityResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <strong>✅ Quantum Identity Registered</strong> — ID: <code>{identityResult.id}</code> | Algorithm: {identityResult.quantumAlgorithm} | Status: {badge(identityResult.identityStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {identityList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
                    {['Identity DID', 'Quantum Algorithm', 'Credentials', 'Status', 'Last Authenticated'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#e9d5ff', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {identityList.map(i => (
                    <tr key={i.id} style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{i.identityCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#c084fc', fontWeight: 700 }}>{i.quantumAlgorithm}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{i.verifiableCredentialCount}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(i.identityStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(i.lastAuthenticatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── neuromorphic tab ─── */}
        {tab === 'neuromorphic' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Spike Neural Latency', value: '0.42 ms', icon: '⚡' },
                { label: 'Diagnostic Accuracy', value: '99.98%', icon: '🎯' },
                { label: 'Hardware NPU Engine', value: 'Tensor Neuromorphic', icon: '🧠' },
                { label: 'Edge Mesh Status', value: 'Active Healthy Sync', icon: '📡' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(49,16,75,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#c084fc', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#e9d5ff', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(49,16,75,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Neuromorphic Edge Diagnostics Mesh Node</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={meshNodeCode} onChange={e => setMeshNodeCode(e.target.value)} placeholder="NEURO-EDGE-NODE-P15-B3-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#1e1b4b', color: '#f3e8ff', outline: 'none' }} />
                <select value={hardwareAcceleratedEngine} onChange={e => setHardwareAcceleratedEngine(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#1e1b4b', color: '#f3e8ff', outline: 'none' }}>
                  <option value="TENSOR_NEUROMORPHIC_NPU">TENSOR_NEUROMORPHIC_NPU</option>
                  <option value="SPIKING_NEURAL_PROCESSING_UNIT">SPIKING_NEURAL_PROCESSING_UNIT</option>
                </select>
                <button onClick={registerMeshNode} disabled={meshLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #a855f7, #d946ef)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: meshLoading ? 0.6 : 1 }}>
                  {meshLoading ? 'Calibrating…' : '🧠 Calibrate NPU'}
                </button>
                <button onClick={loadMeshNodes} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: 'transparent', color: '#c084fc', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {meshResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <strong>✅ NPU Node Calibrated</strong> — ID: <code>{meshResult.id}</code> | Spike Latency: {meshResult.spikeNeuralLatencyMs}ms | Accuracy: {meshResult.diagnosticAccuracyPercent}%
                </div>
              )}
            </div>

            {/* list */}
            {meshList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
                    {['Node Code', 'Spike Latency (ms)', 'Accuracy (%)', 'Hardware Engine', 'Status', 'Last Diagnosed'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#e9d5ff', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meshList.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{m.meshNodeCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#c084fc', fontWeight: 700 }}>{m.spikeNeuralLatencyMs} ms</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{m.diagnosticAccuracyPercent}%</td>
                      <td style={{ padding: '10px 12px' }}>{badge(m.hardwareAcceleratedEngine)}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(m.meshStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(m.lastDiagnosedAt).toLocaleString()}</td>
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
        TrustZone Mobile Care ERP · Phase 15 Book 3 · Sovereign Quantum Identity Federation & Neuromorphic Diagnostics Mesh · v15.3.0
      </footer>
    </div>
  );
}
