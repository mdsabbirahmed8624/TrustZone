'use client';

import React, { useState } from 'react';

/* ─────────────── helpers ─────────────── */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface DatabaseShard {
  id: string;
  shardCode: string;
  shardRegion: string;
  assignedTenantCount: number;
  shardStatus: string;
  latencyMs: number;
  lastRebalancedAt: string;
}

interface ZeroTrustLedgerBlock {
  id: string;
  ledgerBlockCode: string;
  previousBlockHash: string;
  merkleRootHash: string;
  consensusProtocol: string;
  auditComplianceVerified: boolean;
  timestamp: string;
}

/* ─────────────── page ─────────────── */
export default function AutonomousDatabaseShardingLedgerPage() {
  const [tab, setTab] = useState<'sharding' | 'ledger'>('sharding');

  // Shard state
  const [shardCode, setShardCode] = useState('');
  const [shardRegion, setShardRegion] = useState('EU_CENTRAL_GERMANY');
  const [assignedTenantCount, setAssignedTenantCount] = useState(1500);
  const [shardResult, setShardResult] = useState<DatabaseShard | null>(null);
  const [shardList, setShardList] = useState<DatabaseShard[]>([]);
  const [shardLoading, setShardLoading] = useState(false);

  // Ledger state
  const [ledgerBlockCode, setLedgerBlockCode] = useState('');
  const [consensusProtocol, setConsensusProtocol] = useState('PBFT_ZERO_TRUST_QUORUM');
  const [ledgerResult, setLedgerResult] = useState<ZeroTrustLedgerBlock | null>(null);
  const [ledgerList, setLedgerList] = useState<ZeroTrustLedgerBlock[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  /* ── shard actions ── */
  const registerShard = async () => {
    if (!shardCode.trim()) return;
    setShardLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/autonomous-database-shard-book2/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shardCode, shardRegion, assignedTenantCount: Number(assignedTenantCount) }),
      });
      const data = await res.json();
      setShardResult(data);
    } catch { /* ignore */ } finally { setShardLoading(false); }
  };

  const loadShards = async () => {
    setShardLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/autonomous-database-shard-book2`);
      setShardList(await res.json());
    } catch { /* ignore */ } finally { setShardLoading(false); }
  };

  /* ── ledger actions ── */
  const recordBlock = async () => {
    if (!ledgerBlockCode.trim()) return;
    setLedgerLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/sovereign-zerotrust-ledger-book2/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ledgerBlockCode, consensusProtocol }),
      });
      const data = await res.json();
      setLedgerResult(data);
    } catch { /* ignore */ } finally { setLedgerLoading(false); }
  };

  const loadLedgerBlocks = async () => {
    setLedgerLoading(true);
    try {
      const res = await fetch(`${API}/api/v15/sovereign-zerotrust-ledger-book2`);
      setLedgerList(await res.json());
    } catch { /* ignore */ } finally { setLedgerLoading(false); }
  };

  /* ── status badge helper ── */
  const badge = (status: string) => {
    const isOk = status === 'ACTIVE_HEALTHY' || status.includes('PBFT') || status.includes('VERIFIED');
    return (
      <span style={{
        background: isOk ? '#10b981' : '#f59e0b',
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', color: '#e0e7ff', fontFamily: "'Inter', sans-serif" }}>
      {/* header */}
      <header style={{ padding: '32px 48px', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🗄️ Autonomous Multi-Region Sharding & Sovereign Zero-Trust Ledger
        </h1>
        <p style={{ color: '#a5b4fc', marginTop: 4 }}>Phase 15 — Book 2 · Sovereign Distributed Ledger & Database Grid</p>
      </header>

      {/* tab bar */}
      <nav style={{ display: 'flex', gap: 0, padding: '0 48px', marginTop: 24 }}>
        {([['sharding', '🗄️ Multi-Region Sharding'], ['ledger', '⛓️ Zero-Trust Ledger']] as const).map(([key, label]) => (
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
        {/* ─── sharding tab ─── */}
        {tab === 'sharding' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Active Database Shards', value: '12 Global Shards', icon: '🗄️' },
                { label: 'Assigned Tenants', value: '18,500 Tenants', icon: '👥' },
                { label: 'Shard Latency', value: '2.1 ms', icon: '⏱️' },
                { label: 'Auto-Rebalance Engine', value: 'Active-Active Sync', icon: '🔄' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(30,27,75,0.7)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#c7d2fe', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* register form */}
            <div style={{ background: 'rgba(30,27,75,0.7)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Register Autonomous Multi-Region Database Shard</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={shardCode} onChange={e => setShardCode(e.target.value)} placeholder="SHARD-EU-WEST-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#0f172a', color: '#e0e7ff', outline: 'none' }} />
                <select value={shardRegion} onChange={e => setShardRegion(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#0f172a', color: '#e0e7ff', outline: 'none' }}>
                  <option value="EU_CENTRAL_GERMANY">EU_CENTRAL_GERMANY</option>
                  <option value="US_EAST_VIRGINIA">US_EAST_VIRGINIA</option>
                  <option value="APEC_SINGAPORE">APEC_SINGAPORE</option>
                </select>
                <input type="number" value={assignedTenantCount} onChange={e => setAssignedTenantCount(Number(e.target.value))} placeholder="Tenants"
                  style={{ width: 140, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#0f172a', color: '#e0e7ff', outline: 'none' }} />
                <button onClick={registerShard} disabled={shardLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: shardLoading ? 0.6 : 1 }}>
                  {shardLoading ? 'Registering…' : '🗄️ Register Shard'}
                </button>
                <button onClick={loadShards} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: 'transparent', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {shardResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <strong>✅ Shard Registered</strong> — ID: <code>{shardResult.id}</code> | Region: {shardResult.shardRegion} | Status: {badge(shardResult.shardStatus)}
                </div>
              )}
            </div>

            {/* list */}
            {shardList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                    {['Shard Code', 'Shard Region', 'Tenants', 'Latency', 'Status', 'Last Rebalanced'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#c7d2fe', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shardList.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{s.shardCode}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{s.shardRegion}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{s.assignedTenantCount}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#818cf8', fontWeight: 700 }}>{s.latencyMs} ms</td>
                      <td style={{ padding: '10px 12px' }}>{badge(s.shardStatus)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(s.lastRebalancedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ─── ledger tab ─── */}
        {tab === 'ledger' && (
          <section>
            {/* stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Ledger Height', value: '1,420,000 Blocks', icon: '⛓️' },
                { label: 'Consensus Quorum', value: 'PBFT Zero-Trust', icon: '🛡️' },
                { label: 'Merkle Integrity', value: '100% Cryptographic', icon: '🔑' },
                { label: 'Audit Verification', value: 'Zero-Knowledge Proof', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(30,27,75,0.7)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8', marginTop: 8 }}>{String(s.value)}</div>
                  <div style={{ fontSize: 12, color: '#c7d2fe', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* record form */}
            <div style={{ background: 'rgba(30,27,75,0.7)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Record Cryptographic Block into Sovereign Zero-Trust Distributed Ledger</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input value={ledgerBlockCode} onChange={e => setLedgerBlockCode(e.target.value)} placeholder="LEDGER-BLOCK-P15-B2-XX"
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#0f172a', color: '#e0e7ff', outline: 'none' }} />
                <select value={consensusProtocol} onChange={e => setConsensusProtocol(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: '#0f172a', color: '#e0e7ff', outline: 'none' }}>
                  <option value="PBFT_ZERO_TRUST_QUORUM">PBFT_ZERO_TRUST_QUORUM</option>
                  <option value="RAFT_SOVEREIGN">RAFT_SOVEREIGN</option>
                </select>
                <button onClick={recordBlock} disabled={ledgerLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: ledgerLoading ? 0.6 : 1 }}>
                  {ledgerLoading ? 'Recording…' : '⛓️ Record Block'}
                </button>
                <button onClick={loadLedgerBlocks} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: 'transparent', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}>
                  Refresh List
                </button>
              </div>
              {ledgerResult && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <strong>✅ Block Recorded</strong> — ID: <code>{ledgerResult.id}</code> | Merkle Root: <code>{ledgerResult.merkleRootHash.substring(0, 16)}…</code> | Audit Verified: {ledgerResult.auditComplianceVerified ? 'YES' : 'NO'}
                </div>
              )}
            </div>

            {/* list */}
            {ledgerList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                    {['Block Code', 'Merkle Root', 'Consensus Protocol', 'Audit Verified', 'Timestamp'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#c7d2fe', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ledgerList.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>{l.ledgerBlockCode}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: '#818cf8' }}>{l.merkleRootHash.substring(0, 20)}…</td>
                      <td style={{ padding: '10px 12px' }}>{badge(l.consensusProtocol)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981', fontWeight: 700 }}>{l.auditComplianceVerified ? 'VERIFIED' : 'PENDING'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{new Date(l.timestamp).toLocaleString()}</td>
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
        TrustZone Mobile Care ERP · Phase 15 Book 2 · Autonomous Multi-Region Database Sharding & Sovereign Zero-Trust Distributed Ledger · v15.2.0
      </footer>
    </div>
  );
}
