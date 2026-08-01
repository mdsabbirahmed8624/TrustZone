'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface OptimizationAnalytics {
  id: string;
  optimizationCode: string;
  targetModel: string;
  hyperParameterConfigJson: string;
  efficiencyGainPercent: number;
  evaluationStatus: string;
  evaluatedAt: string;
}

interface MicrosegmentationPolicy {
  id: string;
  segmentCode: string;
  workloadGroup: string;
  sourceSegment: string;
  targetSegment: string;
  allowedPortsJson: string;
  enforcementStatus: string;
  createdAt: string;
}

/* ─────────────── page ─────────────── */
export default function SelfOptimizationMicrosegmentationPage() {
  const [tab, setTab] = useState<'optimization' | 'microsegmentation'>('optimization');

  // Optimization state
  const [optCode, setOptCode] = useState('');
  const [targetModel, setTargetModel] = useState('LLM_INFERENCE_ENGINE');
  const [optResult, setOptResult] = useState<OptimizationAnalytics | null>(null);
  const [optList, setOptList] = useState<OptimizationAnalytics[]>([]);
  const [optLoading, setOptLoading] = useState(false);

  // Microsegmentation state
  const [segmentCode, setSegmentCode] = useState('');
  const [microResult, setMicroResult] = useState<MicrosegmentationPolicy | null>(null);
  const [microList, setMicroList] = useState<MicrosegmentationPolicy[]>([]);
  const [microLoading, setMicroLoading] = useState(false);

  /* ── optimization actions ── */
  const recordOptimization = async () => {
    if (!optCode.trim()) return;
    setOptLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/self-optimization-book7/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optimizationCode: optCode, targetModel }),
      });
      const data = await res.json();
      setOptResult(data);
    } catch { /* ignore */ } finally { setOptLoading(false); }
  };

  const loadOptimizations = async () => {
    setOptLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/self-optimization-book7`);
      setOptList(await res.json());
    } catch { /* ignore */ } finally { setOptLoading(false); }
  };

  /* ── microsegmentation actions ── */
  const enforcePolicy = async () => {
    if (!segmentCode.trim()) return;
    setMicroLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/sovereign-microsegmentation-book7/enforce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentCode }),
      });
      const data = await res.json();
      setMicroResult(data);
    } catch { /* ignore */ } finally { setMicroLoading(false); }
  };

  const loadPolicies = async () => {
    setMicroLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/sovereign-microsegmentation-book7`);
      setMicroList(await res.json());
    } catch { /* ignore */ } finally { setMicroLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const colors: Record<string, string> = {
      PASSED: '#10b981',
      OPTIMAL: '#10b981',
      STRICT_ENFORCED: '#10b981',
      TUNING_REQUIRED: '#f59e0b',
      ISOLATED: '#3b82f6',
      AUDIT_ONLY: '#6366f1',
      DEGRADED: '#ef4444',
    };
    return (
      <span style={{
        background: colors[status] || '#6b7280',
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #0b132b 100%)', color: '#e0e1dd', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #f59e0b, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ⚡ Autonomous AI Self-Optimization & Sovereign Microsegmentation
        </h1>
        <p style={{ color: '#94a3b8', marginTop: 4 }}>Phase 14 — Book 7 · Enterprise Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['optimization', '🚀 Self-Optimization Analytics'], ['microsegmentation', '🔒 Sovereign Microsegmentation']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '12px 28px', cursor: 'pointer', border: 'none', fontWeight: 700, fontSize: 14,
            background: tab === key ? 'rgba(245,158,11,0.15)' : 'transparent',
            color: tab === key ? '#f59e0b' : '#94a3b8',
            borderBottom: tab === key ? '2px solid #f59e0b' : '2px solid transparent',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </nav>

      <main style={{ padding: '32px 48px' }}>
        {/* ─── optimization tab ─── */}
        {tab === 'optimization' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Efficiency Gain', value: '+21.4%', icon: '📈' },
                { label: 'Evaluation Status', value: 'OPTIMAL', icon: '🎯' },
                { label: 'Hyperparameters Evaluated', value: '1,024', icon: '⚙️' },
                { label: 'Target Engine', value: 'LLM Inference', icon: '🧠' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(28,37,65,0.7)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(28,37,65,0.7)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Record Self-Optimization Analytics</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={optCode} onChange={e => setOptCode(e.target.value)} placeholder="OPT-ANALYTICS-P14-B7-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)', background: '#0b132b', color: '#e0e1dd', outline: 'none' }} />
                <select value={targetModel} onChange={e => setTargetModel(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)', background: '#0b132b', color: '#e0e1dd', outline: 'none' }}>
                  <option value="LLM_INFERENCE_ENGINE">LLM_INFERENCE_ENGINE</option>
                  <option value="SWARM_ALLOCATOR">SWARM_ALLOCATOR</option>
                  <option value="VISION_TRANSFORMER">VISION_TRANSFORMER</option>
                </select>
                <button onClick={recordOptimization} disabled={optLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #10b981)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: optLoading ? 0.6 : 1 }}>
                  {optLoading ? 'Recording…' : '🚀 Record Analytics'}
                </button>
                <button onClick={loadOptimizations} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)', background: 'transparent', color: '#f59e0b', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {optResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Optimization Recorded</strong> — ID: <code>{optResult.id}</code> | Gain: +{optResult.efficiencyGainPercent}% | Status: {badge(optResult.evaluationStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {optList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
                    {['Code', 'Target Model', 'Hyperparameters', 'Efficiency Gain', 'Status', 'Evaluated At'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {optList.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(245,158,11,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{o.optimizationCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{o.targetModel}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>{o.hyperParameterConfigJson}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>+{o.efficiencyGainPercent}%</td>
                      <td style={{ padding: '10px 12px' }}>{badge(o.evaluationStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(o.evaluatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── microsegmentation tab ─── */}
        {tab === 'microsegmentation' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Workload Isolation', value: 'Strict Enforced', icon: '🛡️' },
                { label: 'Allowed Ports', value: '[5432, 6379, 4000]', icon: '🔌' },
                { label: 'Source ➔ Target', value: 'EDGE ➔ QUANTUM_DB', icon: '🔄' },
                { label: 'Zero-Trust Status', value: '100% Active', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(28,37,65,0.7)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* enforce form */}
            <div style={{ background: 'rgba(28,37,65,0.7)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Enforce Sovereign Microsegmentation Policy</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={segmentCode} onChange={e => setSegmentCode(e.target.value)} placeholder="SOV-SEG-P14-B7-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#0b132b', color: '#e0e1dd', outline: 'none' }} />
                <button onClick={enforcePolicy} disabled={microLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: microLoading ? 0.6 : 1 }}>
                  {microLoading ? 'Enforcing…' : '🔒 Enforce Policy'}
                </button>
                <button onClick={loadPolicies} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {microResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Policy Enforced</strong> — ID: <code>{microResult.id}</code> | Code: {microResult.segmentCode} | Status: {badge(microResult.enforcementStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {microList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                    {['Code', 'Workload Group', 'Source ➔ Target', 'Allowed Ports', 'Status', 'Created At'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {microList.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{m.segmentCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{m.workloadGroup}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{m.sourceSegment} ➔ {m.targetSegment}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#06b6d4' }}>{m.allowedPortsJson}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(m.enforcementStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(m.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      {/* footer */}
      <footer style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: 12, borderTop: '1px solid rgba(245,158,11,0.1)' }}>
        TrustZone Mobile Care ERP · Phase 14 Book 7 · Autonomous AI Self-Optimization & Sovereign Microsegmentation · v14.7.0
      </footer>
    </div>
  );
}
