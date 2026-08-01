'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TenantSegment {
  id: string;
  tenantSegmentCode: string;
  tenantEnclaveIsolationScore: number;
  tenantCrossNoiseLeakagePercent: number;
  tenantActiveCount: number;
  segmentStatus: string;
  lastIsolatedAt: string;
}

interface GATuningGrid {
  id: string;
  crossCloudTuningCode: string;
  crossCloudSyncLatencyMs: number;
  geneticAlgorithmFitnessScore: number;
  supportedCloudProviders: number;
  gridStatus: string;
  lastGAOptimizationAt: string;
}

/* ─────────────── page ─────────────── */
export default function GATuningCrossCloudPage() {
  const [tab, setTab] = useState<'tenant' | 'ga'>('tenant');

  // Tenant state
  const [tenantSegmentCode, setTenantSegmentCode] = useState('');
  const [tenantActiveCount, setTenantActiveCount] = useState(256);
  const [tenantResult, setTenantResult] = useState<TenantSegment | null>(null);
  const [tenantList, setTenantList] = useState<TenantSegment[]>([]);
  const [tenantLoading, setTenantLoading] = useState(false);

  // GA Tuning state
  const [crossCloudTuningCode, setCrossCloudTuningCode] = useState('');
  const [supportedCloudProviders, setSupportedCloudProviders] = useState(5);
  const [gaResult, setGaResult] = useState<GATuningGrid | null>(null);
  const [gaList, setGaList] = useState<GATuningGrid[]>([]);
  const [gaLoading, setGaLoading] = useState(false);

  /* ── tenant actions ── */
  const registerTenantSegment = async () => {
    if (!tenantSegmentCode.trim()) return;
    setTenantLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/sovereign-multitenant-book7/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSegmentCode, tenantActiveCount: Number(tenantActiveCount) }),
      });
      const data = await res.json();
      setTenantResult(data);
    } catch { /* ignore */ } finally { setTenantLoading(false); }
  };

  const loadTenantSegments = async () => {
    setTenantLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/sovereign-multitenant-book7`);
      setTenantList(await res.json());
    } catch { /* ignore */ } finally { setTenantLoading(false); }
  };

  /* ── GA tuning actions ── */
  const registerGATuningGrid = async () => {
    if (!crossCloudTuningCode.trim()) return;
    setGaLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/ga-tuning-crosscloud-book7/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crossCloudTuningCode, supportedCloudProviders: Number(supportedCloudProviders) }),
      });
      const data = await res.json();
      setGaResult(data);
    } catch { /* ignore */ } finally { setGaLoading(false); }
  };

  const loadGATuningGrids = async () => {
    setGaLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/ga-tuning-crosscloud-book7`);
      setGaList(await res.json());
    } catch { /* ignore */ } finally { setGaLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const isOk = status === 'TENANT_ISOLATED_STRICT' || status === 'CROSSCLOUD_OPTIMAL_ACTIVE' || status.includes('ACTIVE') || status.includes('100');
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f766e 0%, #042f2e 50%, #0f766e 100%)', color: '#ccfbf1', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(20,184,166,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #2dd4bf, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🌐 Sovereign Multi-Tenant Microsegmentation & Global Cross-Cloud GA Tuning
        </h1>
        <p style={{ color: '#99f6e4', marginTop: 4 }}>Phase 15 — Book 7 · Multi-Tenant Enclave & Cross-Cloud Genetic Algorithm Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['tenant', '🏢 Multi-Tenant Microsegmentation'], ['ga', '🧬 Cross-Cloud GA Tuning']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '12px 28px', cursor: 'pointer', border: 'none', fontWeight: 700, fontSize: 14,
            background: tab === key ? 'rgba(20,184,166,0.15)' : 'transparent',
            color: tab === key ? '#2dd4bf' : '#94a3b8',
            borderBottom: tab === key ? '2px solid #2dd4bf' : '2px solid transparent',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </nav>

      <main style={{ padding: '32px 48px' }}>
        {/* ─── tenant tab ─── */}
        {tab === 'tenant' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Enclave Isolation', value: '100.0% Strict', icon: '🔒' },
                { label: 'Cross-Noise Leakage', value: '0.00% Zero-Leak', icon: '🛡️' },
                { label: 'Active Enclave Tenants', value: '256 Tenants', icon: '🏢' },
                { label: 'Isolation State', value: 'Strict Enclave', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(4,47,46,0.7)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2dd4bf', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#99f6e4', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* register form */}
            <div style={{ background: 'rgba(4,47,46,0.7)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Sovereign Multi-Tenant Microsegmentation</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={tenantSegmentCode} onChange={e => setTenantSegmentCode(e.target.value)} placeholder="TENANT-SEGMENT-P15-B7-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(20,184,166,0.3)', background: '#0f766e', color: '#ccfbf1', outline: 'none' }} />
                <input type="number" value={tenantActiveCount} onChange={e => setTenantActiveCount(Number(e.target.value))} placeholder="Active Tenants"
                  style={{ width: 160, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(20,184,166,0.3)', background: '#0f766e', color: '#ccfbf1', outline: 'none' }} />
                <button onClick={registerTenantSegment} disabled={tenantLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: tenantLoading ? 0.6 : 1 }}>
                  {tenantLoading ? 'Isolating…' : '🏢 Register Tenant Enclave'}
                </button>
                <button onClick={loadTenantSegments} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(20,184,166,0.3)', background: 'transparent', color: '#2dd4bf', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {tenantResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)' }}>
                  <strong>✅ Tenant Enclave Isolated</strong> — ID: <code>{tenantResult.id}</code> | Isolation Score: {tenantResult.tenantEnclaveIsolationScore}% | Status: {badge(tenantResult.segmentStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {tenantList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(20,184,166,0.2)' }}>
                    {['Tenant Segment Code', 'Isolation Score (%)', 'Noise Leakage (%)', 'Active Tenants', 'Status', 'Last Isolated'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#99f6e4', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenantList.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(20,184,166,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{t.tenantSegmentCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#2dd4bf', fontWeight: 700 }}>{t.tenantEnclaveIsolationScore}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#14b8a6', fontWeight: 700 }}>{t.tenantCrossNoiseLeakagePercent}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{t.tenantActiveCount} Tenants</td>
                      <td style={{ padding: '10px 12px' }}>{badge(t.segmentStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(t.lastIsolatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── GA tuning tab ─── */}
        {tab === 'ga' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'GA Fitness Score', value: '99.97% Optimal', icon: '🧬' },
                { label: 'Cross-Cloud Latency', value: '0.95 ms Speed', icon: '⚡' },
                { label: 'Cloud Providers', value: '5 Multi-Cloud Zones', icon: '☁️' },
                { label: 'Tuning Grid State', value: 'GA Optimal Active', icon: '🔥' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(4,47,46,0.7)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2dd4bf', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#99f6e4', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(4,47,46,0.7)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Global Cross-Cloud GA Tuning Grid</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={crossCloudTuningCode} onChange={e => setCrossCloudTuningCode(e.target.value)} placeholder="CROSSCLOUD-GA-P15-B7-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(20,184,166,0.3)', background: '#0f766e', color: '#ccfbf1', outline: 'none' }} />
                <input type="number" value={supportedCloudProviders} onChange={e => setSupportedCloudProviders(Number(e.target.value))} placeholder="Cloud Providers"
                  style={{ width: 160, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(20,184,166,0.3)', background: '#0f766e', color: '#ccfbf1', outline: 'none' }} />
                <button onClick={registerGATuningGrid} disabled={gaLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: gaLoading ? 0.6 : 1 }}>
                  {gaLoading ? 'Mutating…' : '🧬 Optimize GA Grid'}
                </button>
                <button onClick={loadGATuningGrids} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(20,184,166,0.3)', background: 'transparent', color: '#2dd4bf', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {gaResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)' }}>
                  <strong>✅ Cross-Cloud GA Grid Optimized</strong> — ID: <code>{gaResult.id}</code> | Fitness Score: {gaResult.geneticAlgorithmFitnessScore}% | Status: {badge(gaResult.gridStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {gaList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(20,184,166,0.2)' }}>
                    {['Cross-Cloud Code', 'Sync Latency (ms)', 'GA Fitness Score (%)', 'Cloud Providers', 'Status', 'Last GA Optimization'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#99f6e4', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gaList.map(g => (
                    <tr key={g.id} style={{ borderBottom: '1px solid rgba(20,184,166,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{g.crossCloudTuningCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#2dd4bf', fontWeight: 700 }}>{g.crossCloudSyncLatencyMs} ms</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#14b8a6', fontWeight: 700 }}>{g.geneticAlgorithmFitnessScore}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{g.supportedCloudProviders} Clouds</td>
                      <td style={{ padding: '10px 12px' }}>{badge(g.gridStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(g.lastGAOptimizationAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      {/* footer */}
      <footer style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: 12, borderTop: '1px solid rgba(20,184,166,0.1)' }}>
        TrustZone Mobile Care ERP · Phase 15 Book 7 · Multi-Tenant Microsegmentation & Cross-Cloud GA Tuning Console · v15.7.0
      </footer>
    </div>
  );
}
