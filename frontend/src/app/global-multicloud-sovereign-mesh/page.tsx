'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SovereignMesh {
  id: string;
  meshCode: string;
  cloudProvider: string;
  sovereigntyRegion: string;
  activeNodesCount: number;
  healthScorePercent: number;
  meshStatus: string;
  lastSyncedAt: string;
}

interface LoadBalancingGrid {
  id: string;
  gridCode: string;
  trafficRps: number;
  latencyMs: number;
  routingStrategy: string;
  balancedAt: string;
}

/* ─────────────── page ─────────────── */
export default function GlobalMultiCloudSovereignMeshPage() {
  const [tab, setTab] = useState<'mesh' | 'grid'>('mesh');

  // Mesh state
  const [meshCode, setMeshCode] = useState('');
  const [cloudProvider, setCloudProvider] = useState('AWS_GCP_AZURE_HYBRID');
  const [sovereigntyRegion, setSovereigntyRegion] = useState('EU_GDPR_SOVEREIGN');
  const [meshResult, setMeshResult] = useState<SovereignMesh | null>(null);
  const [meshList, setMeshList] = useState<SovereignMesh[]>([]);
  const [meshLoading, setMeshLoading] = useState(false);

  // Grid state
  const [gridCode, setGridCode] = useState('');
  const [trafficRps, setTrafficRps] = useState(25000);
  const [routingStrategy, setRoutingStrategy] = useState('GEO_LATENCY_SOVEREIGN_OPTIMIZED');
  const [gridResult, setGridResult] = useState<LoadBalancingGrid | null>(null);
  const [gridList, setGridList] = useState<LoadBalancingGrid[]>([]);
  const [gridLoading, setGridLoading] = useState(false);

  /* ── mesh actions ── */
  const registerMesh = async () => {
    if (!meshCode.trim()) return;
    setMeshLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/global-multicloud-mesh-book1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meshCode, cloudProvider, sovereigntyRegion }),
      });
      const data = await res.json();
      setMeshResult(data);
    } catch { /* ignore */ } finally { setMeshLoading(false); }
  };

  const loadMeshes = async () => {
    setMeshLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/global-multicloud-mesh-book1`);
      setMeshList(await res.json());
    } catch { /* ignore */ } finally { setMeshLoading(false); }
  };

  /* ── grid actions ── */
  const balanceGrid = async () => {
    if (!gridCode.trim()) return;
    setGridLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/autonomous-load-balancing-book1/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridCode, trafficRps: Number(trafficRps), routingStrategy }),
      });
      const data = await res.json();
      setGridResult(data);
    } catch { /* ignore */ } finally { setGridLoading(false); }
  };

  const loadGrids = async () => {
    setGridLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/autonomous-load-balancing-book1`);
      setGridList(await res.json());
    } catch { /* ignore */ } finally { setGridLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const isHealthy = status === 'ONLINE_HEALTHY' || status.includes('SOVEREIGN') || status.includes('OPTIMIZED');
    return (
      <span style={{
        background: isHealthy ? '#06b6d4' : '#f59e0b',
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #083344 0%, #155e75 50%, #083344 100%)', color: '#cffaff', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(6,182,212,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #22d3ee, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🌐 Global Multi-Cloud Sovereign Mesh & Autonomous Load-Balancing Grid
        </h1>
        <p style={{ color: '#67e8f9', marginTop: 4 }}>Phase 15 — Book 1 · Sovereign Orchestration Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['mesh', '🌐 Sovereign Cloud Mesh'], ['grid', '⚡ Autonomous Load Balancer']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '12px 28px', cursor: 'pointer', border: 'none', fontWeight: 700, fontSize: 14,
            background: tab === key ? 'rgba(6,182,212,0.15)' : 'transparent',
            color: tab === key ? '#22d3ee' : '#94a3b8',
            borderBottom: tab === key ? '2px solid #22d3ee' : '2px solid transparent',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </nav>

      <main style={{ padding: '32px 48px' }}>
        {/* ─── mesh tab ─── */}
        {tab === 'mesh' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Cloud Provider', value: 'AWS/GCP/Azure Hybrid', icon: '🌐' },
                { label: 'Active Mesh Nodes', value: '64 Global Nodes', icon: '📡' },
                { label: 'Health Score', value: '99.99%', icon: '💚' },
                { label: 'Sovereignty Compliance', value: 'EU GDPR / HIPAA', icon: '🛡️' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(21,94,117,0.7)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#22d3ee', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#a5f3fc', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* register form */}
            <div style={{ background: 'rgba(21,94,117,0.7)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Global Multi-Cloud Sovereign Mesh</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={meshCode} onChange={e => setMeshCode(e.target.value)} placeholder="GRID-MESH-P15-B1-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)', background: '#083344', color: '#cffaff', outline: 'none' }} />
                <select value={cloudProvider} onChange={e => setCloudProvider(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)', background: '#083344', color: '#cffaff', outline: 'none' }}>
                  <option value="AWS_GCP_AZURE_HYBRID">AWS_GCP_AZURE_HYBRID</option>
                  <option value="AWS_US_EAST">AWS_US_EAST</option>
                  <option value="GCP_EUROPE_WEST">GCP_EUROPE_WEST</option>
                  <option value="AZURE_ASIA_SOUTH">AZURE_ASIA_SOUTH</option>
                </select>
                <select value={sovereigntyRegion} onChange={e => setSovereigntyRegion(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)', background: '#083344', color: '#cffaff', outline: 'none' }}>
                  <option value="EU_GDPR_SOVEREIGN">EU_GDPR_SOVEREIGN</option>
                  <option value="US_HIPAA_SOVEREIGN">US_HIPAA_SOVEREIGN</option>
                  <option value="APEC_DATA_SOVEREIGN">APEC_DATA_SOVEREIGN</option>
                </select>
                <button onClick={registerMesh} disabled={meshLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: meshLoading ? 0.6 : 1 }}>
                  {meshLoading ? 'Registering…' : '🌐 Register Mesh'}
                </button>
                <button onClick={loadMeshes} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)', background: 'transparent', color: '#22d3ee', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {meshResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
                  <strong>✅ Sovereign Mesh Registered</strong> — ID: <code>{meshResult.id}</code> | Health: {meshResult.healthScorePercent}% | Status: {badge(meshResult.meshStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {meshList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(6,182,212,0.2)' }}>
                    {['Mesh Code', 'Cloud Provider', 'Sovereignty Region', 'Nodes', 'Health', 'Status', 'Last Synced'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#a5f3fc', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meshList.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(6,182,212,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{m.meshCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{m.cloudProvider}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#22d3ee', fontWeight: 700 }}>{m.sovereigntyRegion}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{m.activeNodesCount}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{m.healthScorePercent}%</td>
                      <td style={{ padding: '10px 12px' }}>{badge(m.meshStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(m.lastSyncedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── grid tab ─── */}
        {tab === 'grid' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Grid Traffic', value: '25,000 RPS', icon: '⚡' },
                { label: 'Routing Latency', value: '1.8 ms', icon: '⏱️' },
                { label: 'Routing Strategy', value: 'Geo-Latency Sovereign', icon: '🧠' },
                { label: 'High Availability', value: 'Active-Active Dual Cloud', icon: '🔄' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(21,94,117,0.7)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#22d3ee', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#a5f3fc', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* balance form */}
            <div style={{ background: 'rgba(21,94,117,0.7)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Execute Autonomous Grid Load-Balancing Optimization</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={gridCode} onChange={e => setGridCode(e.target.value)} placeholder="GRID-BALANCER-P15-B1-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)', background: '#083344', color: '#cffaff', outline: 'none' }} />
                <input type="number" value={trafficRps} onChange={e => setTrafficRps(Number(e.target.value))} placeholder="RPS"
                  style={{ width: 140, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)', background: '#083344', color: '#cffaff', outline: 'none' }} />
                <select value={routingStrategy} onChange={e => setRoutingStrategy(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)', background: '#083344', color: '#cffaff', outline: 'none' }}>
                  <option value="GEO_LATENCY_SOVEREIGN_OPTIMIZED">GEO_LATENCY_SOVEREIGN_OPTIMIZED</option>
                  <option value="FAILOVER_HIGH_AVAILABILITY">FAILOVER_HIGH_AVAILABILITY</option>
                </select>
                <button onClick={balanceGrid} disabled={gridLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: gridLoading ? 0.6 : 1 }}>
                  {gridLoading ? 'Optimizing…' : '⚡ Optimize Grid'}
                </button>
                <button onClick={loadGrids} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)', background: 'transparent', color: '#22d3ee', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {gridResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
                  <strong>✅ Load-Balancing Grid Optimized</strong> — ID: <code>{gridResult.id}</code> | Latency: {gridResult.latencyMs}ms | RPS: {gridResult.trafficRps}
                </div>
              )}
            </div>

            {/* list */}
            {gridList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(6,182,212,0.2)' }}>
                    {['Grid Code', 'Traffic RPS', 'Latency (ms)', 'Routing Strategy', 'Balanced Time'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#a5f3fc', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridList.map(g => (
                    <tr key={g.id} style={{ borderBottom: '1px solid rgba(6,182,212,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{g.gridCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{g.trafficRps} RPS</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#22d3ee', fontWeight: 700 }}>{g.latencyMs} ms</td>
                      <td style={{ padding: '10px 12px' }}>{badge(g.routingStrategy)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(g.balancedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      {/* footer */}
      <footer style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: 12, borderTop: '1px solid rgba(6,182,212,0.1)' }}>
        TrustZone Mobile Care ERP · Phase 15 Book 1 · Global Multi-Cloud Sovereign Mesh & Autonomous Load-Balancing Grid · v15.1.0
      </footer>
    </div>
  );
}
