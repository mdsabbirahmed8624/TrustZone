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
  ArrowLeftRight,
  Bookmark,
  Download,
  Printer,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Globe,
  Laptop,
  Building,
  FileText,
  X,
  Radio,
  Layers,
  Calendar
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

// Inline EmptyState component using semantic tokens for Light/Dark theme consistency
const EmptyState = ({
  title,
  description,
  icon: Icon = ShieldCheck,
  action
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card/40 border border-dashed border-border rounded-xl min-h-[280px]">
      <div className="p-4 bg-secondary/60 rounded-full text-muted-foreground mb-3.5 border border-border/50">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default function AdminTimelinePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Tabs: 'activity' | 'audit'
  const [activeTab, setActiveTab] = useState<'activity' | 'audit'>('activity');

  const [items, setItems] = useState<any[]>([]);
  const [moduleFilter, setModuleFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [timeframeFilter, setTimeframeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [recordIdFilter, setRecordIdFilter] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // Event Detail Modal
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadTimeline();
  }, [activeTab, moduleFilter, severityFilter, timeframeFilter, recordIdFilter]);

  // Real-time polling when autoRefresh is enabled
  useEffect(() => {
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadTimeline();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab, moduleFilter, severityFilter, timeframeFilter]);

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
      console.error('Failed to load timeline items:', err);
    }
    setLoading(false);
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      await api.timeline.bookmarkEvent(id, token);
      loadTimeline();
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return alert('No timeline records available to export.');
    const headers = ['ID', 'Module', 'Action', 'Severity', 'User', 'IP Address', 'Timestamp', 'Details'];
    const rows = items.map((i) => [
      i.id,
      i.module || i.affectedModule,
      i.action,
      i.severity || 'INFO',
      i.userEmail || 'System',
      i.ipAddress || 'Internal',
      new Date(i.createdAt).toLocaleString(),
      `"${(i.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tz_timeline_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getModuleBadge = (mod: string) => {
    switch ((mod || '').toUpperCase()) {
      case 'AUTH': return 'bg-red-500/15 text-red-500 border-red-500/25';
      case 'FINANCE': return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25';
      case 'REPAIRS': case 'TICKETS': return 'bg-blue-500/15 text-blue-500 border-blue-500/25';
      case 'INVENTORY': case 'SUPPLIERS': return 'bg-amber-500/15 text-amber-500 border-amber-500/25';
      case 'USERS': case 'ROLES': return 'bg-purple-500/15 text-purple-500 border-purple-500/25';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500/15 text-red-500 border-red-500/25 font-black';
      case 'HIGH': return 'bg-amber-500/15 text-amber-500 border-amber-500/25 font-bold';
      case 'MEDIUM': return 'bg-blue-500/15 text-blue-500 border-blue-500/25 font-bold';
      default: return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25 font-semibold';
    }
  };

  // Filtered timeline items
  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (item.details && item.details.toLowerCase().includes(term)) ||
      (item.action && item.action.toLowerCase().includes(term)) ||
      (item.userEmail && item.userEmail.toLowerCase().includes(term)) ||
      (item.recordId && item.recordId.toLowerCase().includes(term));

    const matchesSeverity = !severityFilter || (item.severity || 'INFO') === severityFilter;
    const matchesBookmark = !bookmarkedOnly || item.isBookmarked;

    return matchesSearch && matchesSeverity && matchesBookmark;
  });

  // Calculate Metrics
  const totalEvents = items.length;
  const criticalCount = items.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
  const bookmarkedCount = items.filter((i) => i.isBookmarked).length;

  // Helper to render before/after changes structure
  const renderAuditDiff = (before: any, after: any) => {
    if (!before && !after) return <span className="text-muted-foreground text-xs">No data change recorded.</span>;
    if (!before) {
      return (
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg text-xs space-y-1">
          <div className="font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Record Created:</div>
          <pre className="font-mono text-[10px] text-muted-foreground max-h-36 overflow-y-auto">{JSON.stringify(after, null, 2)}</pre>
        </div>
      );
    }
    if (!after) {
      return (
        <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg text-xs space-y-1">
          <div className="font-bold text-red-500 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Record Deleted:</div>
          <pre className="font-mono text-[10px] text-muted-foreground max-h-36 overflow-y-auto">{JSON.stringify(before, null, 2)}</pre>
        </div>
      );
    }

    const diffKeys = Object.keys(after).filter(k => before[k] !== after[k]);
    if (diffKeys.length === 0) return <span className="text-muted-foreground text-xs">No differences found in direct attributes.</span>;

    return (
      <div className="border border-border bg-secondary/15 rounded-lg overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/40 border-b border-border/80 font-bold text-[10px] text-muted-foreground">
              <th className="p-2.5">Field / Property</th>
              <th className="p-2.5">Previous Value (Before)</th>
              <th className="p-2.5">New Value (After)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {diffKeys.map(k => (
              <tr key={k} className="hover:bg-secondary/5">
                <td className="p-2.5 font-mono text-[11px] font-bold text-foreground">{k}</td>
                <td className="p-2.5 text-red-500 line-through bg-red-500/5 truncate max-w-[180px]">{JSON.stringify(before[k])}</td>
                <td className="p-2.5 text-emerald-500 bg-emerald-500/5 truncate max-w-[180px] font-semibold">{JSON.stringify(after[k])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => {}}
          onOpenNotifications={() => {}}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Header Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-4 gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                <Activity className="text-primary h-6 w-6" />
                Audit Trail & Operation Feed
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Advanced audit logs monitoring, state comparison changes, user logins, and database integrity records.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  autoRefresh ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Radio className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-pulse text-emerald-500' : ''}`} />
                <span>{autoRefresh ? 'Live Polling On' : 'Live Auto Refresh'}</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold p-1.5 rounded-lg shadow-sm"
                title="Print Timeline Report"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/80 text-xs font-bold gap-6">
            <button 
              onClick={() => { setActiveTab('activity'); setItems([]); }} 
              className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'activity' ? 'border-primary text-primary font-black' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Activity className="h-4 w-4" /> System Activities Timeline
            </button>
            <button 
              onClick={() => { setActiveTab('audit'); setItems([]); }} 
              className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'audit' ? 'border-primary text-primary font-black' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <ArrowLeftRight className="h-4 w-4" /> Advanced Audit Trail (Field Diffs)
            </button>
          </div>

          {/* Metrics Summary Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-xs">
            <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Activity Events</span>
              <div className="text-xl font-black text-foreground">{totalEvents}</div>
            </div>
            <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Critical & High Severity
              </span>
              <div className="text-xl font-black text-foreground">{criticalCount}</div>
            </div>
            <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <Bookmark className="h-3 w-3" /> Bookmarked Logs
              </span>
              <div className="text-xl font-black text-foreground">{bookmarkedCount}</div>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card border border-border/60 p-3.5 rounded-xl shadow-sm text-xs">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg font-bold text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="">All Modules</option>
                <option value="AUTH">Auth System</option>
                <option value="FINANCE">Finance & Invoices</option>
                <option value="REPAIRS">Repair Tickets</option>
                <option value="INVENTORY">Inventory & Parts</option>
                <option value="USERS">Users & Roles</option>
              </select>

              {activeTab === 'activity' && (
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-secondary border border-border p-2 rounded-lg font-bold text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value="">All Severities</option>
                  <option value="CRITICAL">Critical Alerts</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="INFO">Informational</option>
                </select>
              )}

              {activeTab === 'audit' && (
                <input
                  type="text"
                  value={recordIdFilter}
                  onChange={(e) => setRecordIdFilter(e.target.value)}
                  placeholder="Record ID Filter (e.g. TZ-TKT-901)"
                  className="bg-secondary border border-border p-2 rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary w-48"
                />
              )}

              {activeTab === 'activity' && (
                <button
                  onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                  className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                    bookmarkedOnly ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" /> Bookmarked Only
                </button>
              )}
            </div>

            {activeTab === 'activity' && (
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search activity logs..."
                  className="w-full bg-secondary border border-border pl-8 pr-3 py-2 rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Timeline Feed Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground mt-3 font-semibold">Loading operation activity feed...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title="No Operations Logs Found"
              description="No timeline events or audit records match your selected filter criteria."
              icon={Activity}
            />
          ) : activeTab === 'activity' ? (
            <div className="space-y-4 max-w-4xl">
              <div className="relative border-l-2 border-border/80 pl-6 ml-3 space-y-6 py-2">
                {filteredItems.map((act) => (
                  <div key={act.id} className="relative space-y-2 text-xs group">
                    {/* Circle timeline node */}
                    <div className="absolute -left-[31.5px] top-0.5 h-4 w-4 rounded-full border-2 bg-card border-primary flex items-center justify-center shadow-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 bg-card border border-border/60 p-4 rounded-xl shadow-sm hover:border-primary/40 transition-all">
                      <div className="space-y-2 flex-1 min-w-[240px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black tracking-wider ${getModuleBadge(act.module)}`}>
                            {act.module}
                          </span>
                          {act.severity && (
                            <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black ${getSeverityBadge(act.severity)}`}>
                              {act.severity}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(act.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="font-extrabold text-foreground text-sm flex items-center gap-2">
                          <span>{(act.action || '').replace(/_/g, ' ')}</span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">{act.details}</p>

                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold pt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-primary" />
                            {act.userEmail || 'System Process'} ({act.userRole || 'SYSTEM'})
                          </span>
                          {act.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" /> IP: {act.ipAddress}
                            </span>
                          )}
                          {act.branch && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" /> {act.branch}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-start">
                        <button
                          onClick={() => handleToggleBookmark(act.id)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                            act.isBookmarked ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                          }`}
                          title={act.isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${act.isBookmarked ? 'fill-primary' : ''}`} />
                        </button>
                        <button
                          onClick={() => setSelectedEvent(act)}
                          className="border border-border text-foreground hover:bg-secondary text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Audit Trails Diffs View
            <div className="space-y-4 max-w-4xl">
              {filteredItems.map((audit) => (
                <div key={audit.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4 hover:shadow transition-all">
                  <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-3 text-xs gap-2">
                    <div className="flex items-center gap-2 font-bold flex-wrap">
                      <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black tracking-wider ${getModuleBadge(audit.affectedModule)}`}>
                        {audit.affectedModule}
                      </span>
                      <code className="text-[10px] text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded">Record ID: {audit.recordId}</code>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-primary" /> {audit.userEmail || 'System Process'} ({audit.userRole || 'SYSTEM'})</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(audit.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-xs font-black flex items-center gap-1.5 text-primary">
                    <ArrowLeftRight className="h-4 w-4" /> Field Modification Diffs ({audit.action})
                  </div>

                  {renderAuditDiff(audit.beforeValue, audit.afterValue)}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Event Audit Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className={`text-[9px] uppercase border px-2 py-0.5 rounded-full font-black tracking-wider ${getModuleBadge(selectedEvent.module)}`}>
                  {selectedEvent.module}
                </span>
                <h2 className="text-base font-black tracking-tight text-foreground mt-1">{(selectedEvent.action || '').replace(/_/g, ' ')}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-bold">Timestamp</span>
                <span className="font-semibold text-foreground">{new Date(selectedEvent.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-bold">Actor User</span>
                <span className="font-semibold text-foreground">{selectedEvent.userEmail || 'System'} ({selectedEvent.userRole || 'SYSTEM'})</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-bold">IP Address</span>
                <span className="font-mono text-foreground">{selectedEvent.ipAddress || 'Internal Loopback'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-bold">User Agent / Client</span>
                <span className="font-mono text-[10px] text-foreground">{selectedEvent.userAgent || 'Web Client'}</span>
              </div>
              {selectedEvent.branch && (
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-bold">Branch Outlet</span>
                  <span className="font-semibold text-foreground">{selectedEvent.branch}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Detailed Event Message</label>
              <div className="bg-secondary/40 border border-border p-3 rounded-lg text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedEvent.details}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={() => handleToggleBookmark(selectedEvent.id)}
                className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 ${
                  selectedEvent.isBookmarked ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-secondary'
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" /> {selectedEvent.isBookmarked ? 'Bookmarked' : 'Bookmark Event'}
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
