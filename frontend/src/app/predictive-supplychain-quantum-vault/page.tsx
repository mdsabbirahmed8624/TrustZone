'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SupplyChainMesh {
  id: string;
  supplyChainCode: string;
  predictiveReorderAccuracyPercent: number;
  supplierFulfillmentLatencyHours: number;
  activeGlobalWarehouses: number;
  meshStatus: string;
  lastPredictedAt: string;
}

interface SelfHealingQuantumVault {
  id: string;
  vaultCode: string;
  latticeEncryptionAlgorithm: string;
  selfHealingCycleMs: number;
  tamperProofIntegrityScore: number;
  vaultStatus: string;
  lastHealedAt: string;
}

/* ─────────────── page ─────────────── */
export default function PredictiveSupplyChainQuantumVaultPage() {
  const [tab, setTab] = useState<'supplychain' | 'vault'>('supplychain');

  // Supply Chain state
  const [supplyChainCode, setSupplyChainCode] = useState('');
  const [activeGlobalWarehouses, setActiveGlobalWarehouses] = useState(48);
  const [supplyResult, setSupplyResult] = useState<SupplyChainMesh | null>(null);
  const [supplyList, setSupplyList] = useState<SupplyChainMesh[]>([]);
  const [supplyLoading, setSupplyLoading] = useState(false);

  // Vault state
  const [vaultCode, setVaultCode] = useState('');
  const [latticeEncryptionAlgorithm, setLatticeEncryptionAlgorithm] = useState('NIST_ROUND4_KYBER1024');
  const [vaultResult, setVaultResult] = useState<SelfHealingQuantumVault | null>(null);
  const [vaultList, setVaultList] = useState<SelfHealingQuantumVault[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);

  /* ── supply chain actions ── */
  const registerSupplyChain = async () => {
    if (!supplyChainCode.trim()) return;
    setSupplyLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/predictive-supplychain-mesh-book4/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplyChainCode, activeGlobalWarehouses: Number(activeGlobalWarehouses) }),
      });
      const data = await res.json();
      setSupplyResult(data);
    } catch { /* ignore */ } finally { setSupplyLoading(false); }
  };

  const loadSupplyChains = async () => {
    setSupplyLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/predictive-supplychain-mesh-book4`);
      setSupplyList(await res.json());
    } catch { /* ignore */ } finally { setSupplyLoading(false); }
  };

  /* ── vault actions ── */
  const registerVault = async () => {
    if (!vaultCode.trim()) return;
    setVaultLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/self-healing-quantum-vault-book4/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaultCode, latticeEncryptionAlgorithm }),
      });
      const data = await res.json();
      setVaultResult(data);
    } catch { /* ignore */ } finally { setVaultLoading(false); }
  };

  const loadVaults = async () => {
    setVaultLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/self-healing-quantum-vault-book4`);
      setVaultList(await res.json());
    } catch { /* ignore */ } finally { setVaultLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const isOk = status === 'OPTIMAL_HEALTHY' || status === 'VAULT_SECURED_ACTIVE' || status.includes('KYBER') || status.includes('100');
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #064e3b 100%)', color: '#ecfdf5', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #34d399, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📦 Predictive Autonomous Supply Chain & Self-Healing Quantum Vault
        </h1>
        <p style={{ color: '#6ee7b7', marginTop: 4 }}>Phase 15 — Book 4 · Autonomous Supply Chain Mesh & Cryptographic Vault Console</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['supplychain', '📦 Autonomous Supply Chain'], ['vault', '🔒 Self-Healing Vault']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '12px 28px', cursor: 'pointer', border: 'none', fontWeight: 700, fontSize: 14,
            background: tab === key ? 'rgba(16,185,129,0.15)' : 'transparent',
            color: tab === key ? '#34d399' : '#94a3b8',
            borderBottom: tab === key ? '2px solid #34d399' : '2px solid transparent',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </nav>

      <main style={{ padding: '32px 48px' }}>
        {/* ─── supplychain tab ─── */}
        {tab === 'supplychain' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Reorder Accuracy', value: '99.95%', icon: '🎯' },
                { label: 'Fulfillment Latency', value: '1.2 Hours', icon: '⏱️' },
                { label: 'Active Warehouses', value: '48 Global Nodes', icon: '🏬' },
                { label: 'Mesh Optimization', value: 'Real-Time Autonomous', icon: '🤖' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(2,44,34,0.7)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#a7f3d0', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* register form */}
            <div style={{ background: 'rgba(2,44,34,0.7)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Predictive Autonomous Supply Chain Mesh</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={supplyChainCode} onChange={e => setSupplyChainCode(e.target.value)} placeholder="SUPPLY-CHAIN-P15-B4-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#064e3b', color: '#ecfdf5', outline: 'none' }} />
                <input type="number" value={activeGlobalWarehouses} onChange={e => setActiveGlobalWarehouses(Number(e.target.value))} placeholder="Warehouses"
                  style={{ width: 140, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#064e3b', color: '#ecfdf5', outline: 'none' }} />
                <button onClick={registerSupplyChain} disabled={supplyLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: supplyLoading ? 0.6 : 1 }}>
                  {supplyLoading ? 'Optimizing…' : '📦 Register Mesh'}
                </button>
                <button onClick={loadSupplyChains} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: '#34d399', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {supplyResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Supply Chain Optimized</strong> — ID: <code>{supplyResult.id}</code> | Reorder Accuracy: {supplyResult.predictiveReorderAccuracyPercent}% | Status: {badge(supplyResult.meshStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {supplyList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                    {['Supply Chain Code', 'Accuracy (%)', 'Latency (Hours)', 'Warehouses', 'Status', 'Last Predicted'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#a7f3d0', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {supplyList.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{s.supplyChainCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{s.predictiveReorderAccuracyPercent}%</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#34d399', fontWeight: 700 }}>{s.supplierFulfillmentLatencyHours} hrs</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{s.activeGlobalWarehouses}</td>
                      <td style={{ padding: '10px 12px' }}>{badge(s.meshStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(s.lastPredictedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── vault tab ─── */}
        {tab === 'vault' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Lattice Cryptography', value: 'Kyber1024 NIST-4', icon: '🛡️' },
                { label: 'Self-Healing Cycle', value: '150 ms', icon: '🔄' },
                { label: 'Integrity Score', value: '100.0% Tamper-Proof', icon: '🔒' },
                { label: 'Vault State', value: 'Secured Active', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(2,44,34,0.7)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#a7f3d0', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(2,44,34,0.7)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Self-Healing Quantum Cryptographic Vault</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={vaultCode} onChange={e => setVaultCode(e.target.value)} placeholder="VAULT-QUANTUM-P15-B4-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#064e3b', color: '#ecfdf5', outline: 'none' }} />
                <select value={latticeEncryptionAlgorithm} onChange={e => setLatticeEncryptionAlgorithm(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: '#064e3b', color: '#ecfdf5', outline: 'none' }}>
                  <option value="NIST_ROUND4_KYBER1024">NIST_ROUND4_KYBER1024</option>
                  <option value="NIST_ROUND4_DILITHIUM5">NIST_ROUND4_DILITHIUM5</option>
                </select>
                <button onClick={registerVault} disabled={vaultLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: vaultLoading ? 0.6 : 1 }}>
                  {vaultLoading ? 'Securing…' : '🔒 Secure Vault'}
                </button>
                <button onClick={loadVaults} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'transparent', color: '#34d399', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {vaultResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <strong>✅ Vault Secured & Self-Healed</strong> — ID: <code>{vaultResult.id}</code> | Healing Cycle: {vaultResult.selfHealingCycleMs}ms | Score: {vaultResult.tamperProofIntegrityScore}%
                </div>
              )}
            </div>

            {/* list */}
            {vaultList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                    {['Vault Code', 'Encryption Algorithm', 'Healing Cycle', 'Integrity Score', 'Status', 'Last Healed'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#a7f3d0', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vaultList.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{v.vaultCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#34d399', fontWeight: 700 }}>{v.latticeEncryptionAlgorithm}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{v.selfHealingCycleMs} ms</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{v.tamperProofIntegrityScore}%</td>
                      <td style={{ padding: '10px 12px' }}>{badge(v.vaultStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(v.lastHealedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      {/* footer */}
      <footer style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', fontSize: 12, borderTop: '1px solid rgba(16,185,129,0.1)' }}>
        TrustZone Mobile Care ERP · Phase 15 Book 4 · Predictive Autonomous Supply Chain & Self-Healing Quantum Vault · v15.4.0
      </footer>
    </div>
  );
}
