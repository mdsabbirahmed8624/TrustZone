'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Settings,
  Shield,
  FileText,
  Database,
  Activity,
  AlertTriangle,
  Server,
  Layers,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Save,
  Lock,
  Download,
  UploadCloud,
  Clock,
  Trash2,
  Key,
  ShieldAlert,
  Play,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

export default function SystemAdministrationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    'settings' | 'security' | 'audit' | 'backup' | 'health' | 'maintenance' | 'errors' | 'jobs' | 'cache' | 'files' | 'version'
  >('settings');

  const [loading, setLoading] = useState(true);

  // State Data
  const [settings, setSettings] = useState<any>({});
  const [securityPolicy, setSecurityPolicy] = useState<any>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [maintenance, setMaintenance] = useState<any>({});
  const [errors, setErrors] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any>({});
  const [cacheStats, setCacheStats] = useState<any>({});
  const [storageData, setStorageData] = useState<any>({});
  const [versionInfo, setVersionInfo] = useState<any>({});

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'settings') {
        const res = await api.system.fetchSettings(token);
        if (res.success) setSettings(res.data);
      } else if (activeTab === 'security') {
        const res = await api.system.fetchSecurityPolicy(token);
        if (res.success) setSecurityPolicy(res.data);
      } else if (activeTab === 'audit') {
        const res = await api.system.fetchAuditLogs(undefined, token);
        if (res.success) setAuditLogs(res.data?.logs || []);
      } else if (activeTab === 'backup') {
        const res = await api.system.fetchBackups(token);
        if (res.success) setBackups(res.data);
      } else if (activeTab === 'health') {
        const res = await api.system.fetchHealth(token);
        if (res.success) setHealth(res.data);
      } else if (activeTab === 'maintenance') {
        const res = await api.system.fetchMaintenance(token);
        if (res.success) setMaintenance(res.data);
      } else if (activeTab === 'errors') {
        const res = await api.system.fetchErrors(token);
        if (res.success) setErrors(res.data);
      } else if (activeTab === 'jobs') {
        const res = await api.system.fetchJobs(token);
        if (res.success) setJobs(res.data);
      } else if (activeTab === 'cache') {
        const res = await api.system.fetchCacheStats(token);
        if (res.success) setCacheStats(res.data);
      } else if (activeTab === 'files') {
        const res = await api.system.fetchFiles(token);
        if (res.success) setStorageData(res.data);
      } else if (activeTab === 'version') {
        const res = await api.system.fetchVersion(token);
        if (res.success) setVersionInfo(res.data);
      }
    } catch (err) {
      console.error('Failed to load system data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleSaveSettings = async () => {
    try {
      await api.system.updateSettings(settings, token);
      alert('System Settings updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings.');
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await api.system.updateSecurityPolicy(securityPolicy, token);
      alert('Security Policy updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update security policy.');
    }
  };

  const handleCreateBackup = async (type: string) => {
    try {
      await api.system.createBackup(type, token);
      alert(`Backup snapshot created successfully!`);
      loadTabData();
    } catch (err: any) {
      alert(err.message || 'Failed to create backup.');
    }
  };

  const handleRestoreBackup = async (id: string) => {
    if (!confirm('Are you sure you want to restore this backup snapshot? System state will be reverted.')) return;
    try {
      await api.system.restoreBackup(id, token);
      alert('Backup snapshot restored successfully!');
      loadTabData();
    } catch (err: any) {
      alert(err.message || 'Failed to restore backup.');
    }
  };

  const handleToggleMaintenance = async (enabled: boolean) => {
    try {
      await api.system.updateMaintenance({ ...maintenance, enabled }, token);
      setMaintenance({ ...maintenance, enabled });
      alert(`Maintenance Mode ${enabled ? 'ENABLED' : 'DISABLED'}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle maintenance mode.');
    }
  };

  const handleClearCache = async () => {
    try {
      await api.system.clearCache(token);
      alert('Cache flushed and cleared successfully!');
      loadTabData();
    } catch (err: any) {
      alert(err.message || 'Failed to clear cache.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                <Cpu className="h-8 w-8 text-blue-400" />
                System Administration & Security Center
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                System Settings, Security Center, Audit Logs, Backup Engine, Maintenance Mode & Health Monitoring
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button onClick={loadTabData} className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 transition-colors">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-1 overflow-x-auto">
            {[
              { id: 'settings', label: 'General Settings', icon: Settings },
              { id: 'security', label: 'Security Policy', icon: Shield },
              { id: 'audit', label: 'Audit Logs', icon: FileText },
              { id: 'backup', label: 'Backup & Restore', icon: Database },
              { id: 'health', label: 'System Health', icon: Activity },
              { id: 'maintenance', label: 'Maintenance Mode', icon: Lock },
              { id: 'errors', label: 'Error Logs', icon: AlertTriangle },
              { id: 'jobs', label: 'Job Queue', icon: Server },
              { id: 'cache', label: 'Cache Management', icon: Layers },
              { id: 'files', label: 'File Manager', icon: HardDrive },
              { id: 'version', label: 'License & Version', icon: Info },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-xs transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-sm mt-4">Retrieving system telemetry and configurations...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: SYSTEM SETTINGS */}
              {activeTab === 'settings' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">System & Business Configuration</h3>
                      <p className="text-xs text-slate-400">Configure core business information, tax, currency, and module defaults</p>
                    </div>
                    <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2 rounded text-xs">
                      <Save className="h-4 w-4" /> Save Settings
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Business & Contact Info</span>
                      <div>
                        <label className="block text-slate-400 mb-1">Company / Business Name</label>
                        <input type="text" value={settings.businessName || ''} onChange={e => setSettings({ ...settings, businessName: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Tax Registration ID</label>
                        <input type="text" value={settings.taxId || ''} onChange={e => setSettings({ ...settings, taxId: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">Currency Code</label>
                          <input type="text" value={settings.currency || 'BDT'} onChange={e => setSettings({ ...settings, currency: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Currency Symbol</label>
                          <input type="text" value={settings.currencySymbol || '৳'} onChange={e => setSettings({ ...settings, currencySymbol: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Timezone</label>
                        <input type="text" value={settings.timezone || 'Asia/Dhaka'} onChange={e => setSettings({ ...settings, timezone: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Module Defaults & SLA</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">Default Tax Rate (%)</label>
                          <input type="number" value={settings.taxRate || 15} onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Default Warranty (Days)</label>
                          <input type="number" value={settings.warrantyDefaultDays || 90} onChange={e => setSettings({ ...settings, warrantyDefaultDays: parseInt(e.target.value, 10) })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Invoice Prefix</label>
                        <input type="text" value={settings.invoicePrefix || 'TZ-INV-'} onChange={e => setSettings({ ...settings, invoicePrefix: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Invoice Footer Terms</label>
                        <textarea rows={2} value={settings.invoiceFooter || ''} onChange={e => setSettings({ ...settings, invoiceFooter: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SECURITY CENTER */}
              {activeTab === 'security' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">Security Policies & Access Controls</h3>
                      <p className="text-xs text-slate-400">Password complexity, lockout rules, session timeouts, and IP whitelists</p>
                    </div>
                    <button onClick={handleSaveSecurity} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2 rounded text-xs">
                      <Save className="h-4 w-4" /> Save Security Policy
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Password Complexity Rules</span>
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-slate-200">Minimum Password Length</span>
                        <input type="number" value={securityPolicy.minPasswordLength || 8} onChange={e => setSecurityPolicy({ ...securityPolicy, minPasswordLength: parseInt(e.target.value, 10) })} className="w-20 bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-center" />
                      </div>
                      {[
                        { key: 'requireUppercase', label: 'Require Uppercase Letter' },
                        { key: 'requireNumbers', label: 'Require Numeric Digits' },
                        { key: 'requireSymbols', label: 'Require Special Characters (!@#$)' },
                        { key: 'deviceTrustEnabled', label: 'Enable Device Trust Verification' },
                        { key: 'twoFactorAuthRequired', label: 'Enforce Mandatory 2FA for Admin Roles' },
                      ].map(item => (
                        <div key={item.key} className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <span className="text-slate-200">{item.label}</span>
                          <input type="checkbox" checked={!!securityPolicy[item.key]} onChange={e => setSecurityPolicy({ ...securityPolicy, [item.key]: e.target.checked })} className="rounded" />
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Lockout & Session Controls</span>
                      <div>
                        <label className="block text-slate-400 mb-1">Max Failed Login Attempts</label>
                        <input type="number" value={securityPolicy.maxLoginAttempts || 5} onChange={e => setSecurityPolicy({ ...securityPolicy, maxLoginAttempts: parseInt(e.target.value, 10) })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Session Inactivity Timeout (Minutes)</label>
                        <input type="number" value={securityPolicy.sessionTimeoutMinutes || 60} onChange={e => setSecurityPolicy({ ...securityPolicy, sessionTimeoutMinutes: parseInt(e.target.value, 10) })} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-200">System Audit Trail Logs</h3>
                    <span className="text-xs text-slate-400 font-mono">Total Logs: {auditLogs.length}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3">Timestamp</th>
                          <th className="py-3">User</th>
                          <th className="py-3">Action</th>
                          <th className="py-3">Description</th>
                          <th className="py-3">IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map(log => (
                          <tr key={log.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 font-mono text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="py-3 font-bold text-slate-200">{log.user}</td>
                            <td className="py-3 font-mono text-blue-400">{log.action}</td>
                            <td className="py-3 text-slate-300">{log.description}</td>
                            <td className="py-3 font-mono text-slate-400">{log.ipAddress}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: BACKUP & RESTORE */}
              {activeTab === 'backup' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">Database & Media Backup Engine</h3>
                      <p className="text-xs text-slate-400">Trigger manual backups or restore system snapshots</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleCreateBackup('FULL_DATABASE')} className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" /> Full DB Backup
                      </button>
                      <button onClick={() => handleCreateBackup('MEDIA_FILES')} className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1">
                        <UploadCloud className="h-3.5 w-3.5" /> Media Backup
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3">Snapshot Filename</th>
                          <th className="py-3">Backup Type</th>
                          <th className="py-3">File Size</th>
                          <th className="py-3">Status</th>
                          <th className="py-3">Created At</th>
                          <th className="py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backups.map(b => (
                          <tr key={b.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 font-mono font-bold text-slate-200">{b.filename}</td>
                            <td className="py-3 font-mono text-purple-400">{b.type}</td>
                            <td className="py-3 font-mono text-slate-300">{b.sizeMb} MB</td>
                            <td className="py-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">{b.status}</span></td>
                            <td className="py-3 font-mono text-slate-400">{new Date(b.createdAt).toLocaleString()}</td>
                            <td className="py-3">
                              <button onClick={() => handleRestoreBackup(b.id)} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                                <RotateCcw className="h-3 w-3" /> Restore
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: SYSTEM HEALTH */}
              {activeTab === 'health' && health && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                      <span className="text-xs font-bold text-slate-400 uppercase">System Status</span>
                      <h3 className="text-2xl font-black text-emerald-400 mt-1">{health.status}</h3>
                      <p className="text-xs text-slate-400 mt-1 font-mono">Uptime: {health.uptimeSeconds}s</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                      <span className="text-xs font-bold text-slate-400 uppercase">Database Latency</span>
                      <h3 className="text-2xl font-black text-blue-400 mt-1">{health.database.latencyMs} ms</h3>
                      <p className="text-xs text-slate-400 mt-1">PostgreSQL Connection Active</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                      <span className="text-xs font-bold text-slate-400 uppercase">Memory Heap Used</span>
                      <h3 className="text-2xl font-black text-indigo-400 mt-1">{health.memory.heapUsedMb} MB</h3>
                      <p className="text-xs text-slate-400 mt-1">Total Heap: {health.memory.heapTotalMb} MB</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                      <span className="text-xs font-bold text-slate-400 uppercase">Redis Cache Hit Rate</span>
                      <h3 className="text-2xl font-black text-purple-400 mt-1">{health.redisCache.hitRatePercentage}%</h3>
                      <p className="text-xs text-slate-400 mt-1">Memory: {health.redisCache.memoryUsedMb} MB</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: MAINTENANCE MODE */}
              {activeTab === 'maintenance' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">System Maintenance Mode</h3>
                      <p className="text-xs text-slate-400">Lock non-admin user access during scheduled upgrades</p>
                    </div>
                    <button
                      onClick={() => handleToggleMaintenance(!maintenance.enabled)}
                      className={`px-4 py-2 rounded text-xs font-bold ${
                        maintenance.enabled ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
                      }`}
                    >
                      {maintenance.enabled ? 'Disable Maintenance' : 'Enable Maintenance'}
                    </button>
                  </div>

                  <div className="text-xs space-y-4 max-w-xl">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Maintenance Banner Message</label>
                      <textarea
                        rows={3}
                        value={maintenance.message || ''}
                        onChange={e => setMaintenance({ ...maintenance, message: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: LICENSE & VERSION */}
              {activeTab === 'version' && versionInfo && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6 text-xs">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-200">ERP Version & License Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Build Specifications</span>
                      <p className="text-slate-200"><strong>ERP Version:</strong> {versionInfo.erpVersion}</p>
                      <p className="text-slate-200"><strong>Database Engine:</strong> {versionInfo.databaseVersion}</p>
                      <p className="text-slate-200"><strong>Backend Stack:</strong> {versionInfo.backendFramework}</p>
                      <p className="text-slate-200"><strong>Frontend Stack:</strong> {versionInfo.frontendFramework}</p>
                      <p className="text-slate-200"><strong>Git Commit Hash:</strong> <span className="font-mono text-blue-400">{versionInfo.gitCommitHash}</span></p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Enterprise License Status</span>
                      <p className="text-slate-200"><strong>Licensee:</strong> {versionInfo.licenseInfo?.licensedTo}</p>
                      <p className="text-slate-200"><strong>License Key:</strong> <span className="font-mono text-purple-400">{versionInfo.licenseInfo?.licenseKey}</span></p>
                      <p className="text-slate-200"><strong>Status:</strong> <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">{versionInfo.licenseInfo?.status}</span></p>
                      <p className="text-slate-200"><strong>Valid Until:</strong> {versionInfo.licenseInfo?.validUntil}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
