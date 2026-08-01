'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  User,
  Clock,
  Database,
  ArrowLeftRight
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

export default function AdminTimelinePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Tabs: 'activity' | 'audit'
  const [activeTab, setActiveTab] = useState<'activity' | 'audit'>('activity');

  const [items, setItems] = useState<any[]>([]);
  const [moduleFilter, setModuleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [recordIdFilter, setRecordIdFilter] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadTimeline();
  }, [activeTab, moduleFilter, recordIdFilter]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      if (activeTab === 'activity') {
        const res = await api.timeline.fetchTimeline({ module: moduleFilter, search: searchTerm }, token);
        if (res.success) setItems(res.data.items);
      } else {
        const res = await api.timeline.fetchAuditLogs({ module: moduleFilter, recordId: recordIdFilter }, token);
        if (res.success) setItems(res.data.items);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getModuleBadge = (mod: string) => {
    switch (mod.toUpperCase()) {
      case 'AUTH': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'FINANCE': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'TICKETS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'SUPPLIERS': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  // Helper to render before/after changes structure
  const renderAuditDiff = (before: any, after: any) => {
    if (!before && !after) return <span>No data change recorded.</span>;
    if (!before) {
      return (
        <div className="bg-green-500/5 border border-green-500/20 p-2.5 rounded-lg text-[10px] space-y-1">
          <div className="font-bold text-green-500">Record Created:</div>
          <pre className="font-mono text-[9px] text-muted-foreground max-h-32 overflow-y-auto">{JSON.stringify(after, null, 2)}</pre>
        </div>
      );
    }
    if (!after) {
      return (
        <div className="bg-red-500/5 border border-red-500/20 p-2.5 rounded-lg text-[10px] space-y-1">
          <div className="font-bold text-red-500">Record Deleted:</div>
          <pre className="font-mono text-[9px] text-muted-foreground max-h-32 overflow-y-auto">{JSON.stringify(before, null, 2)}</pre>
        </div>
      );
    }

    const diffKeys = Object.keys(after).filter(k => before[k] !== after[k]);
    if (diffKeys.length === 0) return <span className="text-muted-foreground text-[10px]">No differences found in direct attributes.</span>;

    return (
      <div className="border border-border bg-secondary/15 rounded-lg overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/40 border-b border-border/80 font-bold text-[10px]">
              <th className="p-2">Property</th>
              <th className="p-2">Before Value</th>
              <th className="p-2">After Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {diffKeys.map(k => (
              <tr key={k} className="hover:bg-secondary/5">
                <td className="p-2 font-mono text-[10px] font-bold text-foreground">{k}</td>
                <td className="p-2 text-red-500 line-through bg-red-500/5 truncate max-w-[150px]">{JSON.stringify(before[k])}</td>
                <td className="p-2 text-green-500 bg-green-500/5 truncate max-w-[150px]">{JSON.stringify(after[k])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
                <Activity className="text-primary h-6 w-6" />
                Audit Trail & Operation Feed
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Advanced audit logs monitoring, state comparison changes, user logins, and database integrity records.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex border-b border-border/80">
            <button onClick={() => { setActiveTab('activity'); setItems([]); }} className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              System Activities Timeline
            </button>
            <button onClick={() => { setActiveTab('audit'); setItems([]); }} className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Advanced Audit Trail (Field Diffs)
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border/60 p-3 rounded-xl shadow-sm text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg font-bold text-[11px]"
              >
                <option value="">All Modules</option>
                <option value="AUTH">Auth</option>
                <option value="FINANCE">Finance</option>
                <option value="TICKETS">Tickets</option>
                <option value="SUPPLIERS">Suppliers</option>
              </select>
              {activeTab === 'audit' && (
                <input
                  type="text"
                  value={recordIdFilter}
                  onChange={(e) => setRecordIdFilter(e.target.value)}
                  placeholder="Record ID Filter..."
                  className="bg-secondary border border-border p-2 rounded-lg text-xs w-44"
                />
              )}
            </div>
            {activeTab === 'activity' && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadTimeline()}
                  placeholder="Search activities..."
                  className="w-full bg-secondary border border-border pl-8 pr-3 py-2 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          {/* Timeline Feed Container */}
          <div className="space-y-4 max-w-4xl">
            {items.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground bg-card border border-border/60 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="h-8 w-8 text-muted-foreground/60" />
                No logs recorded matching these filter criteria.
              </div>
            ) : activeTab === 'activity' ? (
              <div className="relative border-l border-border/80 pl-6 ml-3 space-y-6 py-2">
                {items.map((act) => (
                  <div key={act.id} className="relative space-y-1.5 text-xs">
                    {/* Circle timeline pin */}
                    <div className="absolute -left-[30.5px] top-0.5 h-4 w-4 rounded-full border bg-card border-primary flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase border px-1.5 py-0.5 rounded font-black tracking-wide ${getModuleBadge(act.module)}`}>
                        {act.module}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-bold text-foreground">{act.action.replace(/_/g, ' ')}</div>
                    <p className="text-muted-foreground pr-4 leading-relaxed">{act.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              // Audit Trails Diffs Timeline
              <div className="space-y-6">
                {items.map((audit) => (
                  <div key={audit.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs">
                      <div className="flex items-center gap-2 font-bold">
                        <span className={`text-[9px] uppercase border px-1.5 py-0.5 rounded font-black tracking-wide ${getModuleBadge(audit.affectedModule)}`}>
                          {audit.affectedModule}
                        </span>
                        <code className="text-[10px] text-muted-foreground font-mono">Record ID: {audit.recordId.substring(0, 8)}</code>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-2">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {audit.userEmail || 'System Process'} ({audit.userRole || 'SYSTEM'})</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(audit.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-xs font-bold flex items-center gap-1 text-primary">
                      <ArrowLeftRight className="h-4 w-4" /> State Modification Diffs ({audit.action})
                    </div>

                    {renderAuditDiff(audit.beforeValue, audit.afterValue)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
