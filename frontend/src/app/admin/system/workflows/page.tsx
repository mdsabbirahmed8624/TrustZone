'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import {
  Network,
  Plus,
  Save,
  Play,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Trash2,
  Edit2,
  Power,
  Download,
  Upload,
  History,
  FileCode,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface WorkflowRule {
  id: string;
  name: string;
  module: 'TICKETS' | 'FINANCE' | 'HRMS' | 'INVENTORY' | 'CUSTOMERS';
  triggerEvent: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DRAFT' | 'DISABLED';
  logicOperator: 'AND' | 'OR';
  field: string;
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'CONTAINS';
  value: string;
  actionType: 'REQUIRE_APPROVAL' | 'SEND_NOTIFICATION' | 'WEBHOOK' | 'GENERATE_DISPATCH';
  actionTarget: string;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
}

export default function WorkflowsBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Workflows List State
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'workflows' | 'history'>('workflows');

  // Form / Modal State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [module, setModule] = useState<WorkflowRule['module']>('TICKETS');
  const [triggerEvent, setTriggerEvent] = useState('TICKET_CREATED');
  const [priority, setPriority] = useState<WorkflowRule['priority']>('HIGH');
  const [logicOperator, setLogicOperator] = useState<'AND' | 'OR'>('AND');
  const [triggerField, setTriggerField] = useState('estimatedCost');
  const [operator, setOperator] = useState<WorkflowRule['operator']>('GREATER_THAN');
  const [triggerValue, setTriggerValue] = useState('5000');
  const [actionType, setActionType] = useState<WorkflowRule['actionType']>('REQUIRE_APPROVAL');
  const [actionTarget, setActionTarget] = useState('SUPER_ADMIN');

  // Execution History State
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);

  useEffect(() => {
    loadMockWorkflows();
  }, []);

  const loadMockWorkflows = () => {
    const defaults: WorkflowRule[] = [
      {
        id: 'wf-101',
        name: 'High-Value Repair Ticket Approval',
        module: 'TICKETS',
        triggerEvent: 'TICKET_ESTIMATE_GENERATED',
        priority: 'CRITICAL',
        status: 'ACTIVE',
        logicOperator: 'AND',
        field: 'estimatedCost',
        operator: 'GREATER_THAN',
        value: '10000',
        actionType: 'REQUIRE_APPROVAL',
        actionTarget: 'SUPER_ADMIN & BRANCH_MANAGER',
        executionCount: 42,
        lastExecutedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'wf-102',
        name: 'VIP Customer Refund Approval Routine',
        module: 'FINANCE',
        triggerEvent: 'REFUND_REQUESTED',
        priority: 'HIGH',
        status: 'ACTIVE',
        logicOperator: 'AND',
        field: 'amount',
        operator: 'GREATER_THAN',
        value: '3000',
        actionType: 'REQUIRE_APPROVAL',
        actionTarget: 'FINANCE_HEAD',
        executionCount: 19,
        lastExecutedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'wf-103',
        name: 'Overtime Shift Escalation Notice',
        module: 'HRMS',
        triggerEvent: 'SHIFT_OVERTIME_EXCEEDED',
        priority: 'MEDIUM',
        status: 'ACTIVE',
        logicOperator: 'OR',
        field: 'overtimeHours',
        operator: 'GREATER_THAN',
        value: '4',
        actionType: 'SEND_NOTIFICATION',
        actionTarget: 'HR_MANAGER',
        executionCount: 8,
        lastExecutedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ];

    const logs = [
      { id: 'log-1', workflowName: 'High-Value Repair Ticket Approval', triggerEvent: 'TICKET_ESTIMATE_GENERATED', recordId: 'TZ-TKT-9081', status: 'SUCCESS', latencyMs: 14, timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
      { id: 'log-2', workflowName: 'VIP Customer Refund Approval Routine', triggerEvent: 'REFUND_REQUESTED', recordId: 'TZ-INV-4410', status: 'SUCCESS', latencyMs: 22, timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
      { id: 'log-3', workflowName: 'Overtime Shift Escalation Notice', triggerEvent: 'SHIFT_OVERTIME_EXCEEDED', recordId: 'EMP-902', status: 'SUCCESS', latencyMs: 18, timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
    ];

    setWorkflows(defaults);
    setHistoryLogs(logs);
  };

  const handleSave = () => {
    if (!name.trim()) return alert('Workflow Name is required.');

    if (editingId) {
      setWorkflows(prev =>
        prev.map(w =>
          w.id === editingId
            ? {
                ...w,
                name,
                module,
                triggerEvent,
                priority,
                logicOperator,
                field: triggerField,
                operator,
                value: triggerValue,
                actionType,
                actionTarget,
              }
            : w
        )
      );
      setEditingId(null);
      alert('Workflow rule updated successfully!');
    } else {
      const newRule: WorkflowRule = {
        id: `wf-${Date.now()}`,
        name,
        module,
        triggerEvent,
        priority,
        status: 'ACTIVE',
        logicOperator,
        field: triggerField,
        operator,
        value: triggerValue,
        actionType,
        actionTarget,
        executionCount: 0,
        createdAt: new Date().toISOString(),
      };
      setWorkflows([newRule, ...workflows]);
      alert('New Enterprise Workflow rule created!');
    }

    // Reset Form
    setName('');
    setTriggerValue('5000');
  };

  const handleToggleStatus = (id: string) => {
    setWorkflows(prev =>
      prev.map(w => {
        if (w.id === id) {
          const nextStatus = w.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
          return { ...w, status: nextStatus };
        }
        return w;
      })
    );
  };

  const handleDuplicate = (rule: WorkflowRule) => {
    const dupe: WorkflowRule = {
      ...rule,
      id: `wf-${Date.now()}`,
      name: `${rule.name} (Copy)`,
      executionCount: 0,
      createdAt: new Date().toISOString(),
    };
    setWorkflows([dupe, ...workflows]);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow rule?')) return;
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const handleTestTrigger = (rule: WorkflowRule) => {
    alert(`[TEST MODE EXECUTION]\nSimulating trigger for "${rule.name}"...\nRule evaluated to TRUE. Triggered Action: ${rule.actionType} -> ${rule.actionTarget}`);
    const testLog = {
      id: `log-${Date.now()}`,
      workflowName: rule.name,
      triggerEvent: rule.triggerEvent,
      recordId: `TEST-SIM-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: 'SUCCESS',
      latencyMs: Math.floor(Math.random() * 15 + 5),
      timestamp: new Date().toISOString(),
    };
    setHistoryLogs([testLog, ...historyLogs]);
  };

  const filteredWorkflows = workflows.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = selectedModule === 'ALL' || w.module === selectedModule;
    const matchStatus = selectedStatus === 'ALL' || w.status === selectedStatus;
    return matchSearch && matchModule && matchStatus;
  });

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/60 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                <Network className="text-primary h-6 w-6" />
                Enterprise Workflow & Approval Engine
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Build automated conditional rules, multi-step approval chains, and real-time event webhooks.
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button onClick={() => setActiveTab(activeTab === 'workflows' ? 'history' : 'workflows')} className="bg-secondary/40 border border-border hover:bg-secondary text-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                <History className="h-4 w-4" /> {activeTab === 'workflows' ? 'Execution History' : 'Workflow Rules'}
              </button>
            </div>
          </div>

          {activeTab === 'history' ? (
            <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-foreground">Workflow Execution Audit Log</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-secondary/40 border-b border-border/60 font-bold text-muted-foreground">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Workflow Name</th>
                      <th className="p-3">Trigger Event</th>
                      <th className="p-3">Target Record</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {historyLogs.map(log => (
                      <tr key={log.id} className="hover:bg-secondary/15">
                        <td className="p-3 font-mono text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-bold text-foreground">{log.workflowName}</td>
                        <td className="p-3 font-mono text-primary">{log.triggerEvent}</td>
                        <td className="p-3 font-mono text-foreground">{log.recordId}</td>
                        <td className="p-3">
                          <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">{log.latencyMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Form Builder */}
              <div className="bg-card border border-border/60 p-5 rounded-xl space-y-4 text-xs font-semibold shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-primary" /> {editingId ? 'Edit Workflow Rule' : 'Build Workflow Rule'}
                  </h2>
                  {editingId && (
                    <button onClick={() => setEditingId(null)} className="text-[10px] font-bold text-muted-foreground hover:underline">
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Workflow Name</label>
                  <input
                    type="text"
                    placeholder="e.g. High Value Repair Approval"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary/20 border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Target Module</label>
                    <select value={module} onChange={(e) => setModule(e.target.value as any)} className="w-full bg-secondary/20 border border-border p-2 rounded-lg text-foreground font-bold outline-none focus:border-primary">
                      <option value="TICKETS">Tickets / Repairs</option>
                      <option value="FINANCE">Finance / Cashier</option>
                      <option value="HRMS">HRMS & Roster</option>
                      <option value="INVENTORY">Parts Inventory</option>
                      <option value="CUSTOMERS">CRM & Customers</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Priority Level</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full bg-secondary/20 border border-border p-2 rounded-lg text-foreground font-bold outline-none focus:border-primary">
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                {/* IF Logic Condition Box */}
                <div className="space-y-3 bg-secondary/20 border border-border/60 p-3.5 rounded-xl">
                  <h3 className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider flex items-center justify-between">
                    <span>IF Condition Rule</span>
                    <select value={logicOperator} onChange={e => setLogicOperator(e.target.value as any)} className="bg-card border border-border px-1.5 py-0.5 rounded text-[9px] font-bold">
                      <option value="AND">ALL (AND)</option>
                      <option value="OR">ANY (OR)</option>
                    </select>
                  </h3>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">Target Field</label>
                      <input type="text" value={triggerField} onChange={e => setTriggerField(e.target.value)} className="w-full bg-card border border-border p-1.5 rounded font-mono text-foreground" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-1">Operator</label>
                        <select value={operator} onChange={e => setOperator(e.target.value as any)} className="w-full bg-card border border-border p-1.5 rounded text-foreground font-mono">
                          <option value="GREATER_THAN">Greater Than (&gt;)</option>
                          <option value="LESS_THAN">Less Than (&lt;)</option>
                          <option value="EQUALS">Equals (==)</option>
                          <option value="CONTAINS">Contains</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-1">Threshold Value</label>
                        <input type="text" value={triggerValue} onChange={e => setTriggerValue(e.target.value)} className="w-full bg-card border border-border p-1.5 rounded font-mono text-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* THEN Action Box */}
                <div className="space-y-3 bg-primary/5 border border-primary/20 p-3.5 rounded-xl">
                  <h3 className="font-bold text-[10px] uppercase text-primary tracking-wider">THEN Action Trigger</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">Action Type</label>
                      <select value={actionType} onChange={e => setActionType(e.target.value as any)} className="w-full bg-card border border-border p-1.5 rounded text-foreground font-bold">
                        <option value="REQUIRE_APPROVAL">Require Approval</option>
                        <option value="SEND_NOTIFICATION">Send Multi-Channel Alert</option>
                        <option value="GENERATE_DISPATCH">Generate Inventory Dispatch</option>
                        <option value="WEBHOOK">Trigger External Webhook</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">Target Recipient / Role</label>
                      <input type="text" value={actionTarget} onChange={e => setActionTarget(e.target.value)} className="w-full bg-card border border-border p-1.5 rounded font-mono text-foreground" />
                    </div>
                  </div>
                </div>

                <button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow">
                  <Save className="h-4 w-4" /> {editingId ? 'Update Rule' : 'Save Workflow Rule'}
                </button>
              </div>

              {/* Right Column: Workflows List */}
              <div className="lg:col-span-2 space-y-4">

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border/60 p-3.5 rounded-xl shadow-sm">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search workflows..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-secondary/20 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} className="bg-secondary/20 border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground">
                      <option value="ALL">All Modules</option>
                      <option value="TICKETS">Tickets</option>
                      <option value="FINANCE">Finance</option>
                      <option value="HRMS">HRMS</option>
                    </select>

                    <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="bg-secondary/20 border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground">
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="DISABLED">Disabled</option>
                    </select>
                  </div>
                </div>

                {/* Rules List Cards */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredWorkflows.length === 0 ? (
                    <div className="bg-card border border-border/60 p-8 rounded-xl text-center text-muted-foreground text-xs">
                      No workflows match the selected criteria.
                    </div>
                  ) : (
                    filteredWorkflows.map((wf) => (
                      <div key={wf.id} className="bg-card border border-border/60 p-4 rounded-xl space-y-3 shadow-sm hover:border-primary/40 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-foreground text-xs">{wf.name}</h3>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                wf.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                                {wf.priority}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Module: <span className="font-bold text-foreground">{wf.module}</span> | Executions: <span className="font-bold text-foreground">{wf.executionCount}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(wf.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                                wf.status === 'ACTIVE'
                                  ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                                  : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
                              }`}
                            >
                              {wf.status}
                            </button>
                            <button onClick={() => handleTestTrigger(wf)} className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded border border-primary/20" title="Run Test Execution">
                              <Play className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDuplicate(wf)} className="p-1.5 bg-secondary text-foreground hover:bg-secondary/80 rounded border border-border" title="Duplicate Rule">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDelete(wf.id)} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded border border-red-500/20" title="Delete Rule">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Logic Expression Bar */}
                        <div className="bg-secondary/20 border border-border/60 p-2.5 rounded-lg flex items-center justify-between text-[11px] font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-bold">IF</span>
                            <span className="text-foreground">{wf.field} {wf.operator === 'GREATER_THAN' ? '>' : wf.operator === 'LESS_THAN' ? '<' : '=='} {wf.value}</span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="flex items-center gap-2">
                            <span className="text-green-500 font-bold">THEN</span>
                            <span className="text-foreground">{wf.actionType} ({wf.actionTarget})</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
