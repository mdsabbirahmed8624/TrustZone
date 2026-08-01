'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SafetyBoundary {
  id: string;
  verificationCode: string;
  targetModel: string;
  safetyBoundaryStatus: string;
  guardrailScore: number;
  verifiedAt: string;
}

interface ExecutiveSignoff {
  id: string;
  signoffCode: string;
  releaseVersion: string;
  signoffRole: string;
  approvalStatus: string;
  signedOffAt: string;
}

/* ─────────────── page ─────────────── */
export default function AiSafetyExecutiveSignoffPage() {
  const [tab, setTab] = useState<'safety' | 'signoff'>('safety');

  // Safety state
  const [verifyCode, setVerifyCode] = useState('');
  const [targetModel, setTargetModel] = useState('TRUSTZONE_LLM_70B');
  const [safetyResult, setSafetyResult] = useState<SafetyBoundary | null>(null);
  const [safetyList, setSafetyList] = useState<SafetyBoundary[]>([]);
  const [safetyLoading, setSafetyLoading] = useState(false);

  // Signoff state
  const [signoffCode, setSignoffCode] = useState('');
  const [signoffRole, setSignoffRole] = useState('CHIEF_TECHNOLOGY_OFFICER');
  const [signoffResult, setSignoffResult] = useState<ExecutiveSignoff | null>(null);
  const [signoffList, setSignoffList] = useState<ExecutiveSignoff[]>([]);
  const [signoffLoading, setSignoffLoading] = useState(false);

  /* ── safety actions ── */
  const verifyBoundary = async () => {
    if (!verifyCode.trim()) return;
    setSafetyLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/ai-safety-boundary-book8/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode: verifyCode, targetModel }),
      });
      const data = await res.json();
      setSafetyResult(data);
    } catch { /* ignore */ } finally { setSafetyLoading(false); }
  };

  const loadSafetyBoundaries = async () => {
    setSafetyLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/ai-safety-boundary-book8`);
      setSafetyList(await res.json());
    } catch { /* ignore */ } finally { setSafetyLoading(false); }
  };

  /* ── signoff actions ── */
  const approveSignoff = async () => {
    if (!signoffCode.trim()) return;
    setSignoffLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/executive-signoff-book8/signoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signoffCode, signoffRole }),
      });
      const data = await res.json();
      setSignoffResult(data);
    } catch { /* ignore */ } finally { setSignoffLoading(false); }
  };

  const loadSignoffs = async () => {
    setSignoffLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/executive-signoff-book8`);
      setSignoffList(await res.json());
    } catch { /* ignore */ } finally { setSignoffLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const colors: Record<string, string> = {
      PASSED_COMPLIANT: '#10b981',
      APPROVED: '#10b981',
      GUARDRAIL_ENFORCED: '#3b82f6',
      PENDING_REVIEW: '#f59e0b',
      VIOLATION_FLAGGED: '#ef4444',
      REJECTED: '#ef4444',
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #180e29 0%, #2a1b4e 50%, #180e29 100%)', color: '#f3e8ff', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🛡️ AI Safety Boundary Verification & Executive Sign-off
        </h1>
        <p style={{ color: '#c084fc', marginTop: 4 }}>Phase 14 — Book 8 · Enterprise Governance Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['safety', '🛡️ AI Safety Boundaries'], ['signoff', '✒️ Executive Sign-offs']] as const).map(([key, label]) => (
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
        {/* ─── safety tab ─── */}
        {tab === 'safety' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Guardrail Score', value: '99.8%', icon: '🛡️' },
                { label: 'Safety Status', value: 'PASSED', icon: '✅' },
                { label: 'Max Action Threshold', value: '100.0', icon: '⚡' },
                { label: 'Evaluated Value', value: '12.4', icon: '📊' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(42,27,78,0.7)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#c084fc', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#d8b4fe', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* verify form */}
            <div style={{ background: 'rgba(42,27,78,0.7)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Verify AI Safety Boundary</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={verifyCode} onChange={e => setVerifyCode(e.target.value)} placeholder="SAFETY-VERIFY-P14-B8-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#180e29', color: '#f3e8ff', outline: 'none' }} />
                <select value={targetModel} onChange={e => setTargetModel(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#180e29', color: '#f3e8ff', outline: 'none' }}>
                  <option value="TRUSTZONE_LLM_70B">TRUSTZONE_LLM_70B</option>
                  <option value="SWARM_ROBOTICS_ARM">SWARM_ROBOTICS_ARM</option>
                  <option value="VISION_TRANSFORMER">VISION_TRANSFORMER</option>
                </select>
                <button onClick={verifyBoundary} disabled={safetyLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #a855f7, #38bdf8)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: safetyLoading ? 0.6 : 1 }}>
                  {safetyLoading ? 'Verifying…' : '🛡️ Verify Safety Boundary'}
                </button>
                <button onClick={loadSafetyBoundaries} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: 'transparent', color: '#c084fc', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {safetyResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Boundary Verified</strong> — ID: <code>{safetyResult.id}</code> | Guardrail Score: {safetyResult.guardrailScore}% | Status: {badge(safetyResult.safetyBoundaryStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {safetyList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
                    {['Code', 'Target Model', 'Safety Status', 'Guardrail Score', 'Verified At'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#d8b4fe', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safetyList.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{s.verificationCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{s.targetModel}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(s.safetyBoundaryStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{s.guardrailScore}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(s.verifiedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── signoff tab ─── */}
        {tab === 'signoff' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Release Version', value: '14.8.0-GA', icon: '🚀' },
                { label: 'CTO Approval', value: 'APPROVED', icon: '✒️' },
                { label: 'CEO Approval', value: 'APPROVED', icon: '🏛️' },
                { label: 'CISO Approval', value: 'APPROVED', icon: '🔒' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(42,27,78,0.7)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#d8b4fe', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* signoff form */}
            <div style={{ background: 'rgba(42,27,78,0.7)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Execute Executive Platform Release Sign-off</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={signoffCode} onChange={e => setSignoffCode(e.target.value)} placeholder="SIGNOFF-P14-B8-EXEC-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#180e29', color: '#f3e8ff', outline: 'none' }} />
                <select value={signoffRole} onChange={e => setSignoffRole(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#180e29', color: '#f3e8ff', outline: 'none' }}>
                  <option value="CHIEF_TECHNOLOGY_OFFICER">CTO — Chief Technology Officer</option>
                  <option value="CHIEF_EXECUTIVE_OFFICER">CEO — Chief Executive Officer</option>
                  <option value="CHIEF_INFORMATION_SECURITY_OFFICER">CISO — Chief Information Security Officer</option>
                </select>
                <button onClick={approveSignoff} disabled={signoffLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #38bdf8)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: signoffLoading ? 0.6 : 1 }}>
                  {signoffLoading ? 'Signing off…' : '✒️ Approve Sign-off'}
                </button>
                <button onClick={loadSignoffs} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {signoffResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Sign-off Approved</strong> — ID: <code>{signoffResult.id}</code> | Version: {signoffResult.releaseVersion} | Role: {signoffResult.signoffRole} | Status: {badge(signoffResult.approvalStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {signoffList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                    {['Code', 'Release Version', 'Role', 'Status', 'Signed Off At'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#d8b4fe', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {signoffList.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{s.signoffCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{s.releaseVersion}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{s.signoffRole}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(s.approvalStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(s.signedOffAt).toLocaleString()}</td>
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
        TrustZone Mobile Care ERP · Phase 14 Book 8 · AI Safety Boundary Verification & Executive Sign-off · v14.8.0
      </footer>
    </div>
  );
}
