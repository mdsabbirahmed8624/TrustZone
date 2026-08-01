'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ModelDriftAudit {
  id: string;
  monitoringCode: string;
  targetModel: string;
  driftScore: number;
  anomalyStatus: string;
  monitoredAt: string;
}

interface MilestoneCertificate {
  id: string;
  completionCode: string;
  milestoneTitle: string;
  certifiedByRole: string;
  completionStatus: string;
  verifiedAt: string;
}

/* ─────────────── page ─────────────── */
export default function MilestoneCompletionModelDriftPage() {
  const [tab, setTab] = useState<'drift' | 'certificates'>('drift');

  // Drift state
  const [monitoringCode, setMonitoringCode] = useState('');
  const [targetModel, setTargetModel] = useState('AUTONOMOUS_SWARM_HEALER');
  const [driftResult, setDriftResult] = useState<ModelDriftAudit | null>(null);
  const [driftList, setDriftList] = useState<ModelDriftAudit[]>([]);
  const [driftLoading, setDriftLoading] = useState(false);

  // Certificate state
  const [completionCode, setCompletionCode] = useState('');
  const [certifiedRole, setCertifiedRole] = useState('CHIEF_ENTERPRISE_ARCHITECT');
  const [certResult, setCertResult] = useState<MilestoneCertificate | null>(null);
  const [certList, setCertList] = useState<MilestoneCertificate[]>([]);
  const [certLoading, setCertLoading] = useState(false);

  /* ── drift actions ── */
  const recordDriftAudit = async () => {
    if (!monitoringCode.trim()) return;
    setDriftLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/ai-model-drift-book9/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitoringCode, targetModel }),
      });
      const data = await res.json();
      setDriftResult(data);
    } catch { /* ignore */ } finally { setDriftLoading(false); }
  };

  const loadDriftAudits = async () => {
    setDriftLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/ai-model-drift-book9`);
      setDriftList(await res.json());
    } catch { /* ignore */ } finally { setDriftLoading(false); }
  };

  /* ── certificate actions ── */
  const certifyMilestone = async () => {
    if (!completionCode.trim()) return;
    setCertLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/milestone-completion-book9/certify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionCode, certifiedByRole: certifiedRole }),
      });
      const data = await res.json();
      setCertResult(data);
    } catch { /* ignore */ } finally { setCertLoading(false); }
  };

  const loadCertificates = async () => {
    setCertLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/milestone-completion-book9`);
      setCertList(await res.json());
    } catch { /* ignore */ } finally { setCertLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const colors: Record<string, string> = {
      STABLE_NO_DRIFT: '#10b981',
      PASSED_CERTIFIED: '#10b981',
      DRIFT_ALERT: '#ef4444',
      IN_PROGRESS: '#f59e0b',
      AUDITED: '#3b82f6',
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #042f2e 0%, #115e59 50%, #042f2e 100%)', color: '#ccfbf1', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(20,184,166,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #2dd4bf, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🏅 AI Model Drift Monitoring & Milestone Completion Certificates
        </h1>
        <p style={{ color: '#2dd4bf', marginTop: 4 }}>Phase 14 — Book 9 · Enterprise Certification Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['drift', '📈 AI Model Drift Audits'], ['certificates', '🏅 Milestone Certificates']] as const).map(([key, label]) => (
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
        {/* ─── drift tab ─── */}
        {tab === 'drift' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Drift Score', value: '0.012', icon: '📈' },
                { label: 'Anomaly Status', value: 'STABLE', icon: '✅' },
                { label: 'Target Model', value: 'Swarm Healer', icon: '🧠' },
                { label: 'Monitoring Frequency', value: 'Real-time', icon: '⚡' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(17,94,89,0.7)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2dd4bf', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#99f6e4', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(17,94,89,0.7)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Record AI Model Drift Audit</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={monitoringCode} onChange={e => setMonitoringCode(e.target.value)} placeholder="DRIFT-MONITOR-P14-B9-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(20,184,166,0.3)', background: '#042f2e', color: '#ccfbf1', outline: 'none' }} />
                <select value={targetModel} onChange={e => setTargetModel(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(20,184,166,0.3)', background: '#042f2e', color: '#ccfbf1', outline: 'none' }}>
                  <option value="AUTONOMOUS_SWARM_HEALER">AUTONOMOUS_SWARM_HEALER</option>
                  <option value="ROBOTICS_DISPATCH_ENGINE">ROBOTICS_DISPATCH_ENGINE</option>
                  <option value="QUANTUM_IDENTITY_VERIFIER">QUANTUM_IDENTITY_VERIFIER</option>
                </select>
                <button onClick={recordDriftAudit} disabled={driftLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #14b8a6, #06b6d4)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: driftLoading ? 0.6 : 1 }}>
                  {driftLoading ? 'Recording…' : '📈 Record Drift Audit'}
                </button>
                <button onClick={loadDriftAudits} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(20,184,166,0.3)', background: 'transparent', color: '#2dd4bf', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {driftResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Drift Audit Recorded</strong> — ID: <code>{driftResult.id}</code> | Drift Score: {driftResult.driftScore} | Status: {badge(driftResult.anomalyStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {driftList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(20,184,166,0.2)' }}>
                    {['Code', 'Target Model', 'Drift Score', 'Anomaly Status', 'Monitored At'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#99f6e4', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {driftList.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(20,184,166,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{d.monitoringCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{d.targetModel}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{d.driftScore}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(d.anomalyStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(d.monitoredAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── certificates tab ─── */}
        {tab === 'certificates' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Milestone Title', value: 'Phase 14 Enterprise ERP', icon: '🏆' },
                { label: 'Certified By', value: 'Chief Architect', icon: '🎖️' },
                { label: 'Certification Status', value: 'PASSED_CERTIFIED', icon: '✅' },
                { label: 'Compliance Index', value: '100%', icon: '⭐' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(17,94,89,0.7)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#99f6e4', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* certify form */}
            <div style={{ background: 'rgba(17,94,89,0.7)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Certify Phase 14 Enterprise Milestone Completion</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={completionCode} onChange={e => setCompletionCode(e.target.value)} placeholder="COMPLETION-P14-B9-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#042f2e', color: '#ccfbf1', outline: 'none' }} />
                <select value={certifiedRole} onChange={e => setCertifiedRole(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#042f2e', color: '#ccfbf1', outline: 'none' }}>
                  <option value="CHIEF_ENTERPRISE_ARCHITECT">CHIEF_ENTERPRISE_ARCHITECT</option>
                  <option value="CHIEF_TECHNOLOGY_OFFICER">CHIEF_TECHNOLOGY_OFFICER</option>
                  <option value="LEAD_AI_GOVERNANCE_AUDITOR">LEAD_AI_GOVERNANCE_AUDITOR</option>
                </select>
                <button onClick={certifyMilestone} disabled={certLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: certLoading ? 0.6 : 1 }}>
                  {certLoading ? 'Certifying…' : '🏅 Issue Certificate'}
                </button>
                <button onClick={loadCertificates} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {certResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Milestone Certified</strong> — ID: <code>{certResult.id}</code> | Title: {certResult.milestoneTitle} | Status: {badge(certResult.completionStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {certList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                    {['Code', 'Milestone Title', 'Certified Role', 'Status', 'Verified At'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#99f6e4', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certList.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{c.completionCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{c.milestoneTitle}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{c.certifiedByRole}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(c.completionStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(c.verifiedAt).toLocaleString()}</td>
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
        TrustZone Mobile Care ERP · Phase 14 Book 9 · AI Model Drift Monitoring & Milestone Completion Certificates · v14.9.0
      </footer>
    </div>
  );
}
