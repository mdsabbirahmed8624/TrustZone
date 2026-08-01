'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface HolographicEnclave {
  id: string;
  holographicEnclaveCode: string;
  holographicEncryptionDepthBits: number;
  quantumEntanglementEntropyScore: number;
  enclaveThreatDeterrencePercent: number;
  enclaveStatus: string;
  lastEntangledAt: string;
}

interface DigitalTwin {
  id: string;
  digitalTwinCode: string;
  realTimeSimulationFidelityPercent: number;
  isoStandardComplianceScore: number;
  activeTwinNodes: number;
  matrixStatus: string;
  lastSimulatedAt: string;
}

/* ─────────────── page ─────────────── */
export default function HolographicQuantumSecurityPage() {
  const [tab, setTab] = useState<'holo' | 'twin'>('holo');

  // Holographic state
  const [holographicEnclaveCode, setHolographicEnclaveCode] = useState('');
  const [holographicEncryptionDepthBits, setHolographicEncryptionDepthBits] = useState(4096);
  const [holoResult, setHoloResult] = useState<HolographicEnclave | null>(null);
  const [holoList, setHoloList] = useState<HolographicEnclave[]>([]);
  const [holoLoading, setHoloLoading] = useState(false);

  // Digital Twin state
  const [digitalTwinCode, setDigitalTwinCode] = useState('');
  const [activeTwinNodes, setActiveTwinNodes] = useState(512);
  const [twinResult, setTwinResult] = useState<DigitalTwin | null>(null);
  const [twinList, setTwinList] = useState<DigitalTwin[]>([]);
  const [twinLoading, setTwinLoading] = useState(false);

  /* ── holo actions ── */
  const registerHolographicEnclave = async () => {
    if (!holographicEnclaveCode.trim()) return;
    setHoloLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/holographic-quantum-security-book8/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holographicEnclaveCode, holographicEncryptionDepthBits: Number(holographicEncryptionDepthBits) }),
      });
      const data = await res.json();
      setHoloResult(data);
    } catch { /* ignore */ } finally { setHoloLoading(false); }
  };

  const loadHolographicEnclaves = async () => {
    setHoloLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/holographic-quantum-security-book8`);
      setHoloList(await res.json());
    } catch { /* ignore */ } finally { setHoloLoading(false); }
  };

  /* ── twin actions ── */
  const registerDigitalTwin = async () => {
    if (!digitalTwinCode.trim()) return;
    setTwinLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/digital-twin-compliance-book8/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digitalTwinCode, activeTwinNodes: Number(activeTwinNodes) }),
      });
      const data = await res.json();
      setTwinResult(data);
    } catch { /* ignore */ } finally { setTwinLoading(false); }
  };

  const loadDigitalTwins = async () => {
    setTwinLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/digital-twin-compliance-book8`);
      setTwinList(await res.json());
    } catch { /* ignore */ } finally { setTwinLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const isOk = status === 'HOLOGRAPHIC_ACTIVE_OPTIMAL' || status === 'SIMULATION_ACTIVE_SYNCHRONIZED' || status.includes('ACTIVE') || status.includes('100');
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0284c7 100%)', color: '#e0f2fe', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(56,189,248,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🔮 Holographic Quantum Security Enclave & Digital Twin Compliance
        </h1>
        <p style={{ color: '#bae6fd', marginTop: 4 }}>Phase 15 — Book 8 · Holographic Entanglement & Digital Twin Simulation Matrix</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['holo', '🔮 Holographic Security Enclave'], ['twin', '👯 Digital Twin Compliance']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '12px 28px', cursor: 'pointer', border: 'none', fontWeight: 700, fontSize: 14,
            background: tab === key ? 'rgba(56,189,248,0.15)' : 'transparent',
            color: tab === key ? '#38bdf8' : '#94a3b8',
            borderBottom: tab === key ? '2px solid #38bdf8' : '2px solid transparent',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </nav>

      <main style={{ padding: '32px 48px' }}>
        {/* ─── holo tab ─── */}
        {tab === 'holo' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Holographic Depth', value: '4096 Bits', icon: '🔑' },
                { label: 'Entanglement Entropy', value: '99.999% Score', icon: '⚛️' },
                { label: 'Threat Deterrence', value: '100.0% Protected', icon: '🛡️' },
                { label: 'Enclave State', value: 'Holographic Optimal', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(3,105,161,0.7)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#bae6fd', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* register form */}
            <div style={{ background: 'rgba(3,105,161,0.7)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Holographic Quantum Security Enclave</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={holographicEnclaveCode} onChange={e => setHolographicEnclaveCode(e.target.value)} placeholder="HOLO-SECURITY-P15-B8-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)', background: '#0284c7', color: '#e0f2fe', outline: 'none' }} />
                <input type="number" value={holographicEncryptionDepthBits} onChange={e => setHolographicEncryptionDepthBits(Number(e.target.value))} placeholder="Depth (Bits)"
                  style={{ width: 160, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)', background: '#0284c7', color: '#e0f2fe', outline: 'none' }} />
                <button onClick={registerHolographicEnclave} disabled={holoLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: holoLoading ? 0.6 : 1 }}>
                  {holoLoading ? 'Entangling…' : '🔮 Register Enclave'}
                </button>
                <button onClick={loadHolographicEnclaves} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)', background: 'transparent', color: '#38bdf8', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {holoResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)' }}>
                  <strong>✅ Holographic Enclave Entangled</strong> — ID: <code>{holoResult.id}</code> | Encryption Depth: {holoResult.holographicEncryptionDepthBits} Bits | Status: {badge(holoResult.enclaveStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {holoList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(56,189,248,0.2)' }}>
                    {['Enclave Code', 'Depth (Bits)', 'Entropy Score (%)', 'Deterrence (%)', 'Status', 'Last Entangled'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#bae6fd', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holoList.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{h.holographicEnclaveCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#38bdf8', fontWeight: 700 }}>{h.holographicEncryptionDepthBits} Bits</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#0ea5e9', fontWeight: 700 }}>{h.quantumEntanglementEntropyScore}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{h.enclaveThreatDeterrencePercent}%</td>
                      <td style={{ padding: '10px 12px' }}>{badge(h.enclaveStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(h.lastEntangledAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── twin tab ─── */}
        {tab === 'twin' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Simulation Fidelity', value: '99.98% Fidelity', icon: '📊' },
                { label: 'ISO Compliance', value: '100.0% Standard', icon: '📜' },
                { label: 'Active Twin Nodes', value: '512 Nodes', icon: '👯' },
                { label: 'Matrix State', value: 'Active Synchronized', icon: '🔥' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(3,105,161,0.7)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#bae6fd', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(3,105,161,0.7)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Digital Twin Compliance Matrix</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={digitalTwinCode} onChange={e => setDigitalTwinCode(e.target.value)} placeholder="DIGITAL-TWIN-P15-B8-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)', background: '#0284c7', color: '#e0f2fe', outline: 'none' }} />
                <input type="number" value={activeTwinNodes} onChange={e => setActiveTwinNodes(Number(e.target.value))} placeholder="Twin Nodes"
                  style={{ width: 160, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)', background: '#0284c7', color: '#e0f2fe', outline: 'none' }} />
                <button onClick={registerDigitalTwin} disabled={twinLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: twinLoading ? 0.6 : 1 }}>
                  {twinLoading ? 'Simulating…' : '👯 Register Twin'}
                </button>
                <button onClick={loadDigitalTwins} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)', background: 'transparent', color: '#38bdf8', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {twinResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)' }}>
                  <strong>✅ Digital Twin Synchronized</strong> — ID: <code>{twinResult.id}</code> | Simulation Fidelity: {twinResult.realTimeSimulationFidelityPercent}% | Status: {badge(twinResult.matrixStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {twinList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(56,189,248,0.2)' }}>
                    {['Digital Twin Code', 'Simulation Fidelity (%)', 'ISO Compliance (%)', 'Twin Nodes', 'Status', 'Last Simulated'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#bae6fd', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {twinList.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{t.digitalTwinCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#38bdf8', fontWeight: 700 }}>{t.realTimeSimulationFidelityPercent}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#0ea5e9', fontWeight: 700 }}>{t.isoStandardComplianceScore}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{t.activeTwinNodes} Nodes</td>
                      <td style={{ padding: '10px 12px' }}>{badge(t.matrixStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(t.lastSimulatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      {/* footer */}
      <footer style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: 12, borderTop: '1px solid rgba(56,189,248,0.1)' }}>
        TrustZone Mobile Care ERP · Phase 15 Book 8 · Holographic Quantum Security & Digital Twin Matrix Console · v15.8.0
      </footer>
    </div>
  );
}
