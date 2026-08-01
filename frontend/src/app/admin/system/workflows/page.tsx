'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { Network, Plus, Save, Play, CheckCircle2 } from 'lucide-react';

export default function WorkflowsBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [module, setModule] = useState('TICKETS');
  const [triggerField, setTriggerField] = useState('estimatedCost');
  const [triggerValue, setTriggerValue] = useState('5000');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setWorkflows([
      { id: 'wf-1', name: 'High Cost Ticket Approval', module: 'TICKETS', triggerRule: { field: 'estimatedCost', operator: 'GREATER_THAN', value: '5000' } }
    ]);
  };

  const handleSave = () => {
    if (!name) return alert('Please enter workflow name');
    alert('Workflow definition successfully saved!');
    setName('');
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Network className="text-primary h-6 w-6" />
              Enterprise Workflow Engine
            </h1>
            <p className="text-xs text-muted-foreground">Configure custom conditional triggers and branch approvals routines.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-4 text-xs font-semibold shadow-sm">
              <h2 className="text-sm font-black tracking-tight">Create Workflow Trigger</h2>
              
              <div className="space-y-1">
                <label className="font-bold">Workflow Name</label>
                <input
                  type="text"
                  placeholder="e.g. High Value Expense"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Target Module</label>
                <select value={module} onChange={(e) => setModule(e.target.value)} className="w-full bg-secondary border border-border p-2 rounded-lg font-bold">
                  <option value="TICKETS">Tickets</option>
                  <option value="FINANCE">Finance</option>
                  <option value="HRMS">HRMS</option>
                </select>
              </div>

              <div className="space-y-1 bg-secondary/15 border border-border p-3.5 rounded-lg">
                <h3 className="font-bold text-[10px] uppercase text-muted-foreground pb-2">Trigger Rule (IF-Condition)</h3>
                <div className="flex gap-2">
                  <span className="font-mono pt-1 text-primary uppercase font-bold text-[10px]">IF</span>
                  <span className="font-mono pt-1 text-foreground font-bold">{triggerField} &gt; {triggerValue}</span>
                </div>
              </div>

              <button onClick={handleSave} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow">
                <Save className="h-4 w-4" /> Save Workflow
              </button>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Workflows</h2>
              <div className="grid grid-cols-1 gap-4">
                {workflows.map((wf) => (
                  <div key={wf.id} className="bg-card border border-border/60 p-4 rounded-xl flex items-center justify-between text-xs shadow-sm">
                    <div>
                      <h3 className="font-bold text-foreground">{wf.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">IF {wf.triggerRule.field} &gt; {wf.triggerRule.value}</p>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-500/10 text-green-500 border border-green-500/25 rounded uppercase">ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
