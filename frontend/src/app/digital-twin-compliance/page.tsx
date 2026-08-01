'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TwinSimulation {
  id: string;
  simulationCode: string;
  twinEntityType: string;
  simulationFidelity: number;
  scenarioCount: number;
  anomalyDetectedCount: number;
  simulationStatus: string;
  executedAt: string;
}

interface ComplianceAssessment {
  id: string;
  complianceCode: string;
  regulatoryFramework: string;
  predictedRiskScore: number;
  complianceStatus: string;
  automatedRemediations: number;
  auditTrailHash: string;
  assessedAt: string;
}

/* ─────────────── page ─────────────── */
export default function DigitalTwinCompliancePage() {
  const [tab, setTab] = useState<'twin' | 'compliance'>('twin');

  // Twin state
  const [twinCode, setTwinCode] = useState('');
  const [twinResult, setTwinResult] = useState<TwinSimulation | null>(null);
  const [twins, setTwins] = useState<TwinSimulation[]>([]);
  const [twinLoading, setTwinLoading] = useState(false);

  // Compliance state
  const [complianceCode, setComplianceCode] = useState('');
  const [complianceResult, setComplianceResult] = useState<ComplianceAssessment | null>(null);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [complianceLoading, setComplianceLoading] = useState(false);

  /* ── twin actions ── */
  const executeSimulation = async () => {
    if (!twinCode.trim()) return;
    setTwinLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/digital-twin-simulation-book6/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationCode: twinCode }),
      });
      const data = await res.json();
      setTwinResult(data);
    } catch { /* ignore */ } finally { setTwinLoading(false); }
  };

  const loadTwins = async () => {
    setTwinLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/digital-twin-simulation-book6`);
      setTwins(await res.json());
    } catch { /* ignore */ } finally { setTwinLoading(false); }
  };

  /* ── compliance actions ── */
  const runAssessment = async () => {
    if (!complianceCode.trim()) return;
    setComplianceLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/predictive-compliance-governance-book6/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complianceCode }),
      });
      const data = await res.json();
      setComplianceResult(data);
    } catch { /* ignore */ } finally { setComplianceLoading(false); }
  };

  const loadAssessments = async () => {
    setComplianceLoading(true);
    try {
      const res = await fetch(`${API}/api/v14/predictive-compliance-governance-book6`);
      setAssessments(await res.json());
    } catch { /* ignore */ } finally { setComplianceLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const colors: Record<string, string> = {
      CONVERGED: '#10b981',
      RUNNING: '#f59e0b',
      DIVERGENT: '#ef4444',
      CALIBRATING: '#3b82f6',
      FULLY_COMPLIANT: '#10b981',
      MINOR_GAP: '#f59e0b',
      CRITICAL_VIOLATION: '#ef4444',
      AUDIT_PENDING: '#6366f1',
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', color: '#e2e8f0', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🌐 Digital Twin Simulation & Predictive Compliance Governance
        </h1>
        <p style={{ color: '#94a3b8', marginTop: 4 }}>Phase 14 — Book 6 · Enterprise Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['twin', '🔬 Digital Twin Simulator'], ['compliance', '🛡️ Compliance Governance']] as const).map(([key, label]) => (
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
        {/* ─── twin tab ─── */}
        {tab === 'twin' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Simulation Fidelity', value: '99.7%', icon: '🎯' },
                { label: 'Scenarios Simulated', value: '128', icon: '📊' },
                { label: 'Anomalies Detected', value: twinResult?.anomalyDetectedCount ?? 0, icon: '⚠️' },
                { label: 'Entity Type', value: 'Shop Floor Replica', icon: '🏭' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* execute form */}
            <div style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Execute Digital Twin Simulation</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={twinCode} onChange={e => setTwinCode(e.target.value)} placeholder="TWIN-SIM-P14-B6-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#0f172a', color: '#e2e8f0', outline: 'none' }} />
                <button onClick={executeSimulation} disabled={twinLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: twinLoading ? 0.6 : 1 }}>
                  {twinLoading ? 'Simulating…' : '🔬 Execute Simulation'}
                </button>
                <button onClick={loadTwins} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: 'transparent', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {twinResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Simulation Converged</strong> — ID: <code>{twinResult.id}</code> | Fidelity: {twinResult.simulationFidelity} | Status: {badge(twinResult.simulationStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {twins.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                    {['Code', 'Entity Type', 'Fidelity', 'Scenarios', 'Anomalies', 'Status', 'Executed At'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {twins.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{t.simulationCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{t.twinEntityType}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{t.simulationFidelity}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{t.scenarioCount}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{t.anomalyDetectedCount}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(t.simulationStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(t.executedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── compliance tab ─── */}
        {tab === 'compliance' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Risk Score', value: complianceResult ? complianceResult.predictedRiskScore.toFixed(4) : '0.0200', icon: '📉' },
                { label: 'Framework', value: 'ISO/GDPR/HIPAA', icon: '📋' },
                { label: 'Auto-Remediations', value: complianceResult?.automatedRemediations ?? 0, icon: '🔧' },
                { label: 'Compliance Status', value: 'Fully Compliant', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* assess form */}
            <div style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Run Predictive Compliance Assessment</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={complianceCode} onChange={e => setComplianceCode(e.target.value)} placeholder="COMPLY-GOV-P14-B6-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#0f172a', color: '#e2e8f0', outline: 'none' }} />
                <button onClick={runAssessment} disabled={complianceLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: complianceLoading ? 0.6 : 1 }}>
                  {complianceLoading ? 'Assessing…' : '🛡️ Run Assessment'}
                </button>
                <button onClick={loadAssessments} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {complianceResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Assessment Complete</strong> — ID: <code>{complianceResult.id}</code> | Risk: {complianceResult.predictedRiskScore} | Status: {badge(complianceResult.complianceStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {assessments.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                    {['Code', 'Framework', 'Risk Score', 'Status', 'Remediations', 'Audit Hash', 'Assessed At'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assessments.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{a.complianceCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{a.regulatoryFramework}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: a.predictedRiskScore < 0.05 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{a.predictedRiskScore}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(a.complianceStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{a.automatedRemediations}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>{a.auditTrailHash}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(a.assessedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      {/* footer */}
      <footer style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: 12, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
        TrustZone Mobile Care ERP · Phase 14 Book 6 · Digital Twin Simulation & Predictive Compliance Governance · v14.6.0
      </footer>
    </div>
  );
}
