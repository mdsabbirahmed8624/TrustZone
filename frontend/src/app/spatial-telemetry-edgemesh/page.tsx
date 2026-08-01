'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SpatialMesh {
  id: string;
  spatialMeshCode: string;
  edgeNodeLatencyMs: number;
  spatialTelemetryBandwidthGbps: number;
  meshGeoRegions: number;
  meshStatus: string;
  lastTelemetryAt: string;
}

interface Microsegment {
  id: string;
  microsegmentCode: string;
  isolationSecurityPolicy: string;
  threatMitigationSpeedMs: number;
  complianceSecurityScore: number;
  segmentStatus: string;
  lastPolicyEnforcedAt: string;
}

/* ─────────────── page ─────────────── */
export default function SpatialTelemetryEdgeMeshPage() {
  const [tab, setTab] = useState<'spatial' | 'microsegment'>('spatial');

  // Spatial Mesh state
  const [spatialMeshCode, setSpatialMeshCode] = useState('');
  const [meshGeoRegions, setMeshGeoRegions] = useState(64);
  const [spatialResult, setSpatialResult] = useState<SpatialMesh | null>(null);
  const [spatialList, setSpatialList] = useState<SpatialMesh[]>([]);
  const [spatialLoading, setSpatialLoading] = useState(false);

  // Microsegment state
  const [microsegmentCode, setMicrosegmentCode] = useState('');
  const [isolationSecurityPolicy, setIsolationSecurityPolicy] = useState('ZERO_TRUST_STRICT_ENCLAVE');
  const [microsegmentResult, setMicrosegmentResult] = useState<Microsegment | null>(null);
  const [microsegmentList, setMicrosegmentList] = useState<Microsegment[]>([]);
  const [microsegmentLoading, setMicrosegmentLoading] = useState(false);

  /* ── spatial actions ── */
  const registerSpatialMesh = async () => {
    if (!spatialMeshCode.trim()) return;
    setSpatialLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/spatial-telemetry-edgemesh-book5/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spatialMeshCode, meshGeoRegions: Number(meshGeoRegions) }),
      });
      const data = await res.json();
      setSpatialResult(data);
    } catch { /* ignore */ } finally { setSpatialLoading(false); }
  };

  const loadSpatialMeshes = async () => {
    setSpatialLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/spatial-telemetry-edgemesh-book5`);
      setSpatialList(await res.json());
    } catch { /* ignore */ } finally { setSpatialLoading(false); }
  };

  /* ── microsegment actions ── */
  const registerMicrosegment = async () => {
    if (!microsegmentCode.trim()) return;
    setMicrosegmentLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/self-optimization-microsegmentation-book5/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ microsegmentCode, isolationSecurityPolicy }),
      });
      const data = await res.json();
      setMicrosegmentResult(data);
    } catch { /* ignore */ } finally { setMicrosegmentLoading(false); }
  };

  const loadMicrosegments = async () => {
    setMicrosegmentLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/self-optimization-microsegmentation-book5`);
      setMicrosegmentList(await res.json());
    } catch { /* ignore */ } finally { setMicrosegmentLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const isOk = status === 'SPATIAL_ACTIVE_OPTIMAL' || status === 'ENCLAVE_ISOLATED_ACTIVE' || status.includes('ZERO_TRUST') || status.includes('100');
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%)', color: '#e0e7ff', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🛰️ Autonomous Spatial Telemetry Edge Mesh & Microsegmentation
        </h1>
        <p style={{ color: '#a5b4fc', marginTop: 4 }}>Phase 15 — Book 5 · Spatial Edge Mesh & Zero-Trust Microsegmentation Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['spatial', '🛰️ Spatial Edge Mesh'], ['microsegment', '🛡️ Zero-Trust Microsegmentation']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '12px 28px', cursor: 'pointer', border: 'none', fontWeight: 700, fontSize: 14,
            background: tab === key ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: tab === key ? '#818cf8' : '#94a3b8',
            borderBottom: tab === key ? '2px solid #818cf8' : '2px solid transparent',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </nav>

      <main style={{ padding: '32px 48px' }}>
        {/* ─── spatial tab ─── */}
        {tab === 'spatial' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Edge Latency', value: '0.18 ms', icon: '⚡' },
                { label: 'Telemetry Bandwidth', value: '100 Gbps', icon: '📡' },
                { label: 'Geographic Regions', value: '64 Global Zones', icon: '🌐' },
                { label: 'Mesh Health', value: 'Spatial Optimal', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#c7d2fe', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* register form */}
            <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Autonomous Spatial Telemetry Edge Mesh</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={spatialMeshCode} onChange={e => setSpatialMeshCode(e.target.value)} placeholder="SPATIAL-TELEMETRY-P15-B5-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#1e1b4b', color: '#e0e7ff', outline: 'none' }} />
                <input type="number" value={meshGeoRegions} onChange={e => setMeshGeoRegions(Number(e.target.value))} placeholder="Regions"
                  style={{ width: 140, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#1e1b4b', color: '#e0e7ff', outline: 'none' }} />
                <button onClick={registerSpatialMesh} disabled={spatialLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: spatialLoading ? 0.6 : 1 }}>
                  {spatialLoading ? 'Calibrating…' : '🛰️ Register Spatial Mesh'}
                </button>
                <button onClick={loadSpatialMeshes} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: 'transparent', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {spatialResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <strong>✅ Spatial Mesh Active</strong> — ID: <code>{spatialResult.id}</code> | Edge Latency: {spatialResult.edgeNodeLatencyMs}ms | Status: {badge(spatialResult.meshStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {spatialList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                    {['Spatial Mesh Code', 'Latency (ms)', 'Bandwidth (Gbps)', 'Geo Regions', 'Status', 'Last Telemetry'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#c7d2fe', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spatialList.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{s.spatialMeshCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#818cf8', fontWeight: 700 }}>{s.edgeNodeLatencyMs} ms</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#6366f1', fontWeight: 700 }}>{s.spatialTelemetryBandwidthGbps} Gbps</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{s.meshGeoRegions}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(s.meshStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(s.lastTelemetryAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── microsegment tab ─── */}
        {tab === 'microsegment' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Security Policy', value: 'Zero-Trust Enclave', icon: '🛡️' },
                { label: 'Threat Mitigation', value: '45 ms Speed', icon: '⚡' },
                { label: 'Compliance Score', value: '100.0% Enforced', icon: '🎯' },
                { label: 'Microsegment State', value: 'Isolated Active', icon: '🔒' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#c7d2fe', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Self-Optimizing Zero-Trust Microsegmentation</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={microsegmentCode} onChange={e => setMicrosegmentCode(e.target.value)} placeholder="MICROSEGMENT-P15-B5-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#1e1b4b', color: '#e0e7ff', outline: 'none' }} />
                <select value={isolationSecurityPolicy} onChange={e => setIsolationSecurityPolicy(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#1e1b4b', color: '#e0e7ff', outline: 'none' }}>
                  <option value="ZERO_TRUST_STRICT_ENCLAVE">ZERO_TRUST_STRICT_ENCLAVE</option>
                  <option value="ZERO_TRUST_DYNAMIC_AIRGAP">ZERO_TRUST_DYNAMIC_AIRGAP</option>
                </select>
                <button onClick={registerMicrosegment} disabled={microsegmentLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: microsegmentLoading ? 0.6 : 1 }}>
                  {microsegmentLoading ? 'Enforcing…' : '🛡️ Enforce Policy'}
                </button>
                <button onClick={loadMicrosegments} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: 'transparent', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {microsegmentResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <strong>✅ Microsegment Enforced</strong> — ID: <code>{microsegmentResult.id}</code> | Threat Mitigation: {microsegmentResult.threatMitigationSpeedMs}ms | Score: {microsegmentResult.complianceSecurityScore}%
                </div>
              )}
            </div>

            {/* list */}
            {microsegmentList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                    {['Microsegment Code', 'Security Policy', 'Threat Mitigation', 'Compliance Score', 'Status', 'Last Enforced'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#c7d2fe', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {microsegmentList.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{m.microsegmentCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#818cf8', fontWeight: 700 }}>{m.isolationSecurityPolicy}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{m.threatMitigationSpeedMs} ms</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#6366f1', fontWeight: 700 }}>{m.complianceSecurityScore}%</td>
                      <td style={{ padding: '10px 12px' }}>{badge(m.segmentStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(m.lastPolicyEnforcedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      {/* footer */}
      <footer style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: 12, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
        TrustZone Mobile Care ERP · Phase 15 Book 5 · Spatial Telemetry Edge Mesh & Microsegmentation · v15.5.0
      </footer>
    </div>
  );
}
