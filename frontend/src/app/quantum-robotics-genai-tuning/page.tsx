'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SwarmGrid {
  id: string;
  swarmGridCode: string;
  activeRoboticUnits: number;
  swarmDiagnosticPrecisionPercent: number;
  autonomousFleetCollisionRate: number;
  gridStatus: string;
  lastSwarmSyncAt: string;
}

interface HyperTuningEngine {
  id: string;
  hyperTuningEngineCode: string;
  llmModelParametersBillion: number;
  tuningInferenceLatencyMs: number;
  modelAccuracyBenchmark: number;
  engineStatus: string;
  lastTunedAt: string;
}

/* ─────────────── page ─────────────── */
export default function QuantumRoboticsGenAITuningPage() {
  const [tab, setTab] = useState<'swarm' | 'hypertuning'>('swarm');

  // Swarm state
  const [swarmGridCode, setSwarmGridCode] = useState('');
  const [activeRoboticUnits, setActiveRoboticUnits] = useState(128);
  const [swarmResult, setSwarmResult] = useState<SwarmGrid | null>(null);
  const [swarmList, setSwarmList] = useState<SwarmGrid[]>([]);
  const [swarmLoading, setSwarmLoading] = useState(false);

  // Hyper-Tuning state
  const [hyperTuningEngineCode, setHyperTuningEngineCode] = useState('');
  const [llmModelParametersBillion, setLlmModelParametersBillion] = useState(175.0);
  const [tuningResult, setTuningResult] = useState<HyperTuningEngine | null>(null);
  const [tuningList, setTuningList] = useState<HyperTuningEngine[]>([]);
  const [tuningLoading, setTuningLoading] = useState(false);

  /* ── swarm actions ── */
  const registerSwarmGrid = async () => {
    if (!swarmGridCode.trim()) return;
    setSwarmLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/quantum-robotics-book6/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swarmGridCode, activeRoboticUnits: Number(activeRoboticUnits) }),
      });
      const data = await res.json();
      setSwarmResult(data);
    } catch { /* ignore */ } finally { setSwarmLoading(false); }
  };

  const loadSwarmGrids = async () => {
    setSwarmLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/quantum-robotics-book6`);
      setSwarmList(await res.json());
    } catch { /* ignore */ } finally { setSwarmLoading(false); }
  };

  /* ── hyper-tuning actions ── */
  const registerHyperTuningEngine = async () => {
    if (!hyperTuningEngineCode.trim()) return;
    setTuningLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/quantum-robotics-genai-tuning-book6/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hyperTuningEngineCode, llmModelParametersBillion: Number(llmModelParametersBillion) }),
      });
      const data = await res.json();
      setTuningResult(data);
    } catch { /* ignore */ } finally { setTuningLoading(false); }
  };

  const loadHyperTuningEngines = async () => {
    setTuningLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/quantum-robotics-genai-tuning-book6`);
      setTuningList(await res.json());
    } catch { /* ignore */ } finally { setTuningLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const isOk = status === 'SWARM_ACTIVE_OPTIMAL' || status === 'HYPERTUNING_ACTIVE_OPTIMAL' || status.includes('ACTIVE') || status.includes('100');
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 50%, #4c1d95 100%)', color: '#f3e8ff', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #c084fc, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🤖 Swarm Robotics Diagnostics Grid & GenAI Hyper-Tuning Engine
        </h1>
        <p style={{ color: '#e9d5ff', marginTop: 4 }}>Phase 15 — Book 6 · Autonomous Swarm Fleet & Generative AI Hyper-Tuning Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['swarm', '🤖 Autonomous Swarm Robotics'], ['hypertuning', '🧠 GenAI Hyper-Tuning Engine']] as const).map(([key, label]) => (
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
        {/* ─── swarm tab ─── */}
        {tab === 'swarm' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Diagnostic Precision', value: '99.99%', icon: '🎯' },
                { label: 'Active Robotic Fleet', value: '128 Units', icon: '🤖' },
                { label: 'Fleet Collision Rate', value: '0.00% Zero-Crash', icon: '🛡️' },
                { label: 'Swarm Grid State', value: 'Active Optimal', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(30,27,75,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#c084fc', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#e9d5ff', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* register form */}
            <div style={{ background: 'rgba(30,27,75,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Autonomous Swarm Robotics Grid</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={swarmGridCode} onChange={e => setSwarmGridCode(e.target.value)} placeholder="SWARM-ROBOTICS-P15-B6-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#4c1d95', color: '#f3e8ff', outline: 'none' }} />
                <input type="number" value={activeRoboticUnits} onChange={e => setActiveRoboticUnits(Number(e.target.value))} placeholder="Units"
                  style={{ width: 140, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#4c1d95', color: '#f3e8ff', outline: 'none' }} />
                <button onClick={registerSwarmGrid} disabled={swarmLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: swarmLoading ? 0.6 : 1 }}>
                  {swarmLoading ? 'Syncing…' : '🤖 Register Swarm Grid'}
                </button>
                <button onClick={loadSwarmGrids} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: 'transparent', color: '#c084fc', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {swarmResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <strong>✅ Swarm Grid Synced</strong> — ID: <code>{swarmResult.id}</code> | Precision: {swarmResult.swarmDiagnosticPrecisionPercent}% | Status: {badge(swarmResult.gridStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {swarmList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
                    {['Swarm Grid Code', 'Robotic Units', 'Precision (%)', 'Collision Rate (%)', 'Status', 'Last Swarm Sync'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#e9d5ff', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {swarmList.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{s.swarmGridCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#c084fc', fontWeight: 700 }}>{s.activeRoboticUnits} Units</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#a855f7', fontWeight: 700 }}>{s.swarmDiagnosticPrecisionPercent}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{s.autonomousFleetCollisionRate}%</td>
                      <td style={{ padding: '10px 12px' }}>{badge(s.gridStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(s.lastSwarmSyncAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── hypertuning tab ─── */}
        {tab === 'hypertuning' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'LLM Parameters', value: '175B Parameters', icon: '🧠' },
                { label: 'Inference Latency', value: '1.15 ms Speed', icon: '⚡' },
                { label: 'Accuracy Benchmark', value: '99.98% Accuracy', icon: '📊' },
                { label: 'Hyper-Tuning State', value: 'Optimal Retrained', icon: '🔥' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(30,27,75,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#c084fc', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#e9d5ff', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(30,27,75,0.7)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Generative AI Hyper-Tuning Engine</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={hyperTuningEngineCode} onChange={e => setHyperTuningEngineCode(e.target.value)} placeholder="GENAI-HYPERTUNE-P15-B6-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#4c1d95', color: '#f3e8ff', outline: 'none' }} />
                <input type="number" value={llmModelParametersBillion} onChange={e => setLlmModelParametersBillion(Number(e.target.value))} placeholder="Parameters (Billion)"
                  style={{ width: 180, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: '#4c1d95', color: '#f3e8ff', outline: 'none' }} />
                <button onClick={registerHyperTuningEngine} disabled={tuningLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: tuningLoading ? 0.6 : 1 }}>
                  {tuningLoading ? 'Retraining…' : '🧠 Hyper-Tune Engine'}
                </button>
                <button onClick={loadHyperTuningEngines} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: 'transparent', color: '#c084fc', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {tuningResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <strong>✅ GenAI Model Hyper-Tuned</strong> — ID: <code>{tuningResult.id}</code> | Inference Latency: {tuningResult.tuningInferenceLatencyMs}ms | Accuracy: {tuningResult.modelAccuracyBenchmark}%
                </div>
              )}
            </div>

            {/* list */}
            {tuningList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
                    {['Engine Code', 'Parameters (Billion)', 'Inference Latency', 'Accuracy Benchmark', 'Status', 'Last Tuned'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#e9d5ff', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tuningList.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{t.hyperTuningEngineCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#c084fc', fontWeight: 700 }}>{t.llmModelParametersBillion} B</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{t.tuningInferenceLatencyMs} ms</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#a855f7', fontWeight: 700 }}>{t.modelAccuracyBenchmark}%</td>
                      <td style={{ padding: '10px 12px' }}>{badge(t.engineStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(t.lastTunedAt).toLocaleString()}</td>
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
        TrustZone Mobile Care ERP · Phase 15 Book 6 · Swarm Robotics & GenAI Hyper-Tuning Console · v15.6.0
      </footer>
    </div>
  );
}
