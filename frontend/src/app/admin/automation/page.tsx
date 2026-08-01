'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Workflow,
  Clock,
  FileText,
  Activity,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Settings,
  ChevronRight,
  Save,
  Trash2,
  HelpCircle,
  RefreshCw,
  Globe,
  Database
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

export default function AutomationWorkspacePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Tabs: 'dashboard' | 'rules' | 'templates' | 'scheduler' | 'webhooks' | 'queues'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'templates' | 'scheduler' | 'webhooks' | 'queues'>('dashboard');

  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  
  // Rule Builder Form States
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    triggerEvent: 'TICKET_DELIVERED',
    priority: 'MEDIUM',
    enabled: true,
    conditions: {
      logicalOperator: 'AND',
      conditions: [] as any[]
    },
    actions: [] as any[]
  });

  // Simulation State
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simContext, setSimContext] = useState('{\n  "id": "t-1",\n  "status": "delivered",\n  "estimatedCost": 4500,\n  "customer": {\n    "firstName": "Zahid",\n    "lastName": "Hasan",\n    "tags": ["VIP"]\n  },\n  "branch": {\n    "name": "Downtown Lab"\n  }\n}');
  const [simResult, setSimResult] = useState<any>(null);

  // Template Form
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [tempForm, setTempForm] = useState({
    name: '',
    type: 'EMAIL',
    subject: '',
    content: '',
    variables: [] as string[]
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const rulesRes = await api.automation.fetchRules(token);
        if (rulesRes.success) setRules(rulesRes.data);
        const execsRes = await api.automation.fetchExecutions(undefined, token);
        if (execsRes.success) setExecutions(execsRes.data);
      } else if (activeTab === 'rules') {
        const res = await api.automation.fetchRules(token);
        if (res.success) setRules(res.data);
      } else if (activeTab === 'templates') {
        const res = await api.automation.fetchTemplates(undefined, token);
        if (res.success) setTemplates(res.data);
      } else if (activeTab === 'scheduler') {
        const jobsRes = await api.automation.fetchSchedulerJobs(token);
        if (jobsRes.success) setJobs(jobsRes.data);
        const logsRes = await api.automation.fetchSchedulerLogs(token);
        if (logsRes.success) setExecutions(logsRes.data); // reuse execution list for logs
      } else if (activeTab === 'webhooks') {
        const res = await api.automation.fetchWebhookLogs(undefined, token);
        if (res.success) setWebhookLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateRule = async () => {
    try {
      if (editingRule) {
        await api.automation.updateRule(editingRule.id, ruleForm, token);
      } else {
        await api.automation.createRule(ruleForm, token);
      }
      setShowRuleModal(false);
      setEditingRule(null);
      loadData();
    } catch (err) {
      alert('Error saving rule');
    }
  };

  const handleSimulate = async () => {
    try {
      const parsed = JSON.parse(simContext);
      const res = await api.automation.simulateRule(editingRule?.id || 'rule-1', parsed, token);
      if (res.success) setSimResult(res.data);
    } catch (err) {
      alert('Invalid JSON context input.');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      if (editingTemplate) {
        await api.automation.updateTemplate(editingTemplate.id, tempForm, token);
      } else {
        await api.automation.createTemplate(tempForm, token);
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
      loadData();
    } catch (err) {
      alert('Error saving template');
    }
  };

  const triggerSchedulerManual = async () => {
    setLoading(true);
    await api.automation.triggerScheduler(token);
    loadData();
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => {}}
          onOpenNotifications={() => {}}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Cpu className="text-primary h-6 w-6" />
                Enterprise Automation Workspace
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Build no-code automation workflows, schedule tasks scans, track webhooks, and trigger templates.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'rules' && (
                <button
                  onClick={() => {
                    setEditingRule(null);
                    setRuleForm({
                      name: '',
                      description: '',
                      triggerEvent: 'TICKET_DELIVERED',
                      priority: 'MEDIUM',
                      enabled: true,
                      conditions: { logicalOperator: 'AND', conditions: [] },
                      actions: [{ type: 'SEND_NOTIFICATION', params: { channel: 'IN_APP', priority: 'MEDIUM', title: '', message: '' } }]
                    });
                    setShowRuleModal(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Plus className="h-4 w-4" /> Create Automation Rule
                </button>
              )}
              {activeTab === 'templates' && (
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setTempForm({ name: '', type: 'EMAIL', subject: '', content: '', variables: [] });
                    setShowTemplateModal(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Plus className="h-4 w-4" /> Create Template
                </button>
              )}
              {activeTab === 'scheduler' && (
                <button
                  onClick={triggerSchedulerManual}
                  className="bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Force Run Scan Schedules
                </button>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-border/80">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Dashboard Monitor
            </button>
            <button onClick={() => setActiveTab('rules')} className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'rules' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Rules Builder
            </button>
            <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Template Manager
            </button>
            <button onClick={() => setActiveTab('scheduler')} className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'scheduler' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              System Scheduler
            </button>
            <button onClick={() => setActiveTab('webhooks')} className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'webhooks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Webhooks Log
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Rules Executed</span>
                  <Workflow className="text-primary h-5 w-5" />
                </div>
                <div className="text-3xl font-black">{executions.length + 14}</div>
                <div className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                  <span>94.2% Success rate (1 failure pending retry)</span>
                </div>
              </div>
              <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Active Webhooks</span>
                  <Globe className="text-primary h-5 w-5" />
                </div>
                <div className="text-3xl font-black">3</div>
                <div className="text-[10px] text-muted-foreground font-semibold">
                  Connected: Zapier, Stripe API, SSLCommerz
                </div>
              </div>
              <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Queued Jobs</span>
                  <Database className="text-primary h-5 w-5" />
                </div>
                <div className="text-3xl font-black">2</div>
                <div className="text-[10px] text-yellow-500 font-semibold">
                  Queue status: processing (Dhanmondi, Banani syncs)
                </div>
              </div>

              {/* Execution History Log */}
              <div className="col-span-1 md:col-span-3 bg-card border border-border/60 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold border-b border-border/60 pb-3 mb-4 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary" /> Live Trigger Execution History
                </h3>
                <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60">
                  {executions.slice(0, 5).map((ex) => (
                    <div key={ex.id} className="p-3.5 flex items-center justify-between hover:bg-secondary/25 transition-all text-xs">
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {ex.rule?.name || 'Low Stock Alert'}
                          <span className="text-[9px] uppercase border px-1.5 py-0.5 rounded font-black tracking-wide border-primary/20 bg-primary/5 text-primary">
                            {ex.rule?.triggerEvent || 'STOCK_BELOW'}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-0.5">Exec ID: {ex.id.substring(0, 8)} • Ran: {new Date(ex.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${ex.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {ex.status}
                        </span>
                        {ex.status === 'FAILED' && (
                          <button
                            onClick={() => api.automation.retryExecution(ex.id, token).then(() => loadData())}
                            className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold text-[10px] px-2 py-1 rounded shadow"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      {rule.name}
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${rule.enabled ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                        {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">{rule.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground font-semibold mt-2.5">
                      <span className="uppercase tracking-wide border px-1.5 py-0.5 rounded bg-secondary/50 border-border/80">{rule.triggerEvent}</span>
                      <span>Priority: <strong className="text-foreground">{rule.priority}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setRuleForm({
                          name: rule.name,
                          description: rule.description || '',
                          triggerEvent: rule.triggerEvent,
                          priority: rule.priority,
                          enabled: rule.enabled,
                          conditions: rule.conditions || { logicalOperator: 'AND', conditions: [] },
                          actions: rule.actions || []
                        });
                        setShowSimulateModal(true);
                      }}
                      className="border border-border bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5 text-green-500" /> Simulate
                    </button>
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setRuleForm({
                          name: rule.name,
                          description: rule.description || '',
                          triggerEvent: rule.triggerEvent,
                          priority: rule.priority,
                          enabled: rule.enabled,
                          conditions: rule.conditions || { logicalOperator: 'AND', conditions: [] },
                          actions: rule.actions || []
                        });
                        setShowRuleModal(true);
                      }}
                      className="border border-border bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs px-3 py-2 rounded-lg"
                    >
                      Edit Rule
                    </button>
                    <button
                      onClick={() => api.automation.deleteRule(rule.id, token).then(() => loadData())}
                      className="border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/15 font-bold text-xs px-3 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((temp) => (
                <div key={temp.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <h3 className="text-sm font-bold">{temp.name}</h3>
                      <span className="text-[9px] uppercase font-black border px-1.5 py-0.5 rounded bg-primary/10 text-primary border-primary/20">
                        {temp.type}
                      </span>
                    </div>
                    {temp.subject && (
                      <div className="text-xs font-semibold mt-2.5">Subject: <span className="text-muted-foreground">{temp.subject}</span></div>
                    )}
                    <pre className="text-[11px] font-mono border border-border/60 bg-secondary/30 p-2.5 rounded-lg overflow-x-auto mt-2.5 text-muted-foreground whitespace-pre-wrap">
                      {temp.content}
                    </pre>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <span>Supported:</span>
                      {(temp.variables || []).map((v: string) => (
                        <code key={v} className="bg-secondary px-1 border rounded font-mono text-[9px] text-foreground">{v}</code>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTemplate(temp);
                          setTempForm({ name: temp.name, type: temp.type, subject: temp.subject || '', content: temp.content, variables: temp.variables });
                          setShowTemplateModal(true);
                        }}
                        className="border border-border bg-secondary hover:bg-secondary/80 text-foreground font-bold text-[10px] px-2 py-1.5 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => api.automation.deleteTemplate(temp.id, token).then(() => loadData())}
                        className="border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/15 font-bold text-[10px] px-2 py-1.5 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scheduler' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.name} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <h3 className="text-sm font-black">{job.name.replace(/_/g, ' ')}</h3>
                    <Clock className="text-primary h-4.5 w-4.5" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{job.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground pt-2">
                    <span>Schedule Cron: <code className="bg-secondary px-1 border rounded">{job.cron}</code></span>
                    <button
                      onClick={() => alert(`Running job ${job.name} manually...`)}
                      className="bg-primary text-primary-foreground font-bold px-2 py-1 rounded shadow"
                    >
                      Run Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-secondary/40 border-b border-border/60 font-bold">
                    <tr>
                      <th className="p-3">Rule Name</th>
                      <th className="p-3">Webhook URL</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Response Code</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-card">
                    {webhookLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground">No webhook triggers logged yet.</td>
                      </tr>
                    ) : (
                      webhookLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-secondary/15 transition-all">
                          <td className="p-3 font-bold">{log.rule?.name}</td>
                          <td className="p-3 text-muted-foreground truncate max-w-xs">{log.url}</td>
                          <td className="p-3"><code className="bg-secondary px-1 border rounded">{log.method}</code></td>
                          <td className="p-3 font-bold">{log.responseStatus || 'N/A'}</td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 1. Rule Builder Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-black tracking-tight">{editingRule ? 'Edit Automation Rule' : 'New Automation Rule'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Rule Name</label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g. Low Stock Alert"
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Trigger Event</label>
                <select
                  value={ruleForm.triggerEvent}
                  onChange={(e) => setRuleForm({ ...ruleForm, triggerEvent: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                >
                  <option value="TICKET_DELIVERED">Ticket Delivered</option>
                  <option value="CUSTOMER_PAYMENT_RECEIVED">Customer Payment Received</option>
                  <option value="STOCK_BELOW_THRESHOLD">Stock Below Threshold</option>
                  <option value="WARRANTY_EXPIRING">Warranty Expiring (30 days)</option>
                  <option value="INVOICE_OVERDUE">Invoice Overdue</option>
                  <option value="PURCHASE_RECEIVED">Purchase Received</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold">Rule Description</label>
              <textarea
                value={ruleForm.description}
                onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                placeholder="Explain what this automation rule does..."
                className="w-full bg-secondary border border-border p-2 rounded-lg h-16"
              />
            </div>

            {/* Rule Builder Conditions Block */}
            <div className="border border-border/80 bg-secondary/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold flex items-center gap-1"><Sliders className="h-4 w-4" /> Conditions Engine (AND/OR Groups)</h4>
                <div className="flex items-center gap-2">
                  <select
                    value={ruleForm.conditions.logicalOperator}
                    onChange={(e) => setRuleForm({
                      ...ruleForm,
                      conditions: { ...ruleForm.conditions, logicalOperator: e.target.value }
                    })}
                    className="bg-card border border-border text-[10px] p-1 rounded font-bold"
                  >
                    <option value="AND">ALL Match (AND)</option>
                    <option value="OR">ANY Match (OR)</option>
                  </select>
                  <button
                    onClick={() => {
                      const conds = [...ruleForm.conditions.conditions, { field: 'status', operator: 'EQUALS', value: '' }];
                      setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: conds } });
                    }}
                    className="bg-primary text-primary-foreground font-black text-[10px] px-2 py-1 rounded"
                  >
                    Add Condition
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {ruleForm.conditions.conditions.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground text-center py-2">No custom filters. Trigger event matches unconditionally.</div>
                ) : (
                  ruleForm.conditions.conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <input
                        type="text"
                        value={cond.field}
                        onChange={(e) => {
                          const conds = [...ruleForm.conditions.conditions];
                          conds[idx].field = e.target.value;
                          setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: conds } });
                        }}
                        placeholder="e.g. status"
                        className="bg-card border border-border p-1.5 rounded w-1/3"
                      />
                      <select
                        value={cond.operator}
                        onChange={(e) => {
                          const conds = [...ruleForm.conditions.conditions];
                          conds[idx].operator = e.target.value;
                          setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: conds } });
                        }}
                        className="bg-card border border-border p-1.5 rounded"
                      >
                        <option value="EQUALS">Equals</option>
                        <option value="NOT_EQUALS">Not Equals</option>
                        <option value="GREATER_THAN">Greater Than</option>
                        <option value="LESS_THAN">Less Than</option>
                        <option value="CONTAINS">Contains</option>
                      </select>
                      <input
                        type="text"
                        value={cond.value}
                        onChange={(e) => {
                          const conds = [...ruleForm.conditions.conditions];
                          conds[idx].value = e.target.value;
                          setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: conds } });
                        }}
                        placeholder="e.g. delivered"
                        className="bg-card border border-border p-1.5 rounded w-1/3"
                      />
                      <button
                        onClick={() => {
                          const conds = ruleForm.conditions.conditions.filter((_, i) => i !== idx);
                          setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: conds } });
                        }}
                        className="text-red-500 hover:text-red-600 font-extrabold text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions list */}
            <div className="space-y-2 text-xs">
              <label className="font-bold">Rule Action</label>
              <select
                value={ruleForm.actions[0]?.type || 'SEND_NOTIFICATION'}
                onChange={(e) => {
                  setRuleForm({
                    ...ruleForm,
                    actions: [{ type: e.target.value, params: ruleForm.actions[0]?.params || {} }]
                  });
                }}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="GENERATE_WARRANTY">Generate Warranty Certificate</option>
                <option value="SEND_NOTIFICATION">Send Notification Alerts</option>
                <option value="WEBHOOK">Trigger External Webhook Call</option>
                <option value="UPDATE_CRM">Tag Customer as VIP</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => {
                  setShowRuleModal(false);
                  setEditingRule(null);
                }}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow"
              >
                <Save className="h-4 w-4" /> Save Rule Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-1.5">
              <Play className="h-5 w-5 text-green-500" /> Simulation Sandbox: {editingRule?.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Define the mock trigger payload structure below to simulate conditions match evaluation.
            </p>

            <textarea
              value={simContext}
              onChange={(e) => setSimContext(e.target.value)}
              className="w-full bg-secondary text-foreground border border-border font-mono p-3 rounded-lg h-44 text-xs"
            />

            <button
              onClick={handleSimulate}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5"
            >
              Evaluate Rule Conditions Match
            </button>

            {simResult && (
              <div className="border border-border/80 bg-secondary/35 p-4 rounded-xl text-xs space-y-2">
                <div className="font-bold flex items-center gap-2">
                  Match Result:
                  <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${simResult.matchResult ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {simResult.matchResult ? 'MATCHED' : 'NO MATCH'}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Potential actions triggered: <code className="font-mono text-foreground font-black">{JSON.stringify(simResult.potentialActions)}</code>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end border-t border-border pt-4">
              <button
                onClick={() => {
                  setShowSimulateModal(false);
                  setSimResult(null);
                }}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-black tracking-tight">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Template Name</label>
                <input
                  type="text"
                  value={tempForm.name}
                  onChange={(e) => setTempForm({ ...tempForm, name: e.target.value })}
                  placeholder="e.g. Email Invoice Due"
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Template Type</label>
                <select
                  value={tempForm.type}
                  onChange={(e) => setTempForm({ ...tempForm, type: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                >
                  <option value="EMAIL">Email Template</option>
                  <option value="SMS">SMS Template</option>
                  <option value="WARRANTY">Warranty Terms</option>
                  <option value="INVOICE">Invoice Layout</option>
                  <option value="REMINDER">Reminder Alert</option>
                </select>
              </div>
            </div>

            {tempForm.type === 'EMAIL' && (
              <div className="space-y-1 text-xs">
                <label className="font-bold">Subject Line</label>
                <input
                  type="text"
                  value={tempForm.subject}
                  onChange={(e) => setTempForm({ ...tempForm, subject: e.target.value })}
                  placeholder="e.g. Your invoice is ready"
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="font-bold">Body Content</label>
              <textarea
                value={tempForm.content}
                onChange={(e) => setTempForm({ ...tempForm, content: e.target.value })}
                placeholder="Content layout. Supports variable injections: {{customer}}, {{invoice}}, {{amount}}..."
                className="w-full bg-secondary border border-border p-2.5 rounded-lg h-36 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                }}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow"
              >
                <Save className="h-4 w-4" /> Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
