'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Building2,
  User,
  Shield,
  Search,
  Plus,
  Trash2,
  Printer,
  Clock,
  FileText,
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
  FileSpreadsheet,
  DollarSign,
  Truck,
  FileDown,
  ArrowRight,
  Filter,
  Check,
  Layout,
  Layers,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api } from '@/lib/api';

interface Widget {
  id: string;
  title: string;
  visible: boolean;
  size: 'small' | 'large';
  order: number;
}

interface SavedPreset {
  id: string;
  name: string;
  isDefault: boolean;
  filters: {
    dateRange: string;
    branchId: string;
    technicianId: string;
    supplierId: string;
    status: string;
  };
}

export default function AdminAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Tabs: 'executive' | 'finance' | 'repairs' | 'inventory' | 'crm' | 'reports'
  const [activeTab, setActiveTab] = useState<'executive' | 'finance' | 'repairs' | 'inventory' | 'crm' | 'reports'>('executive');

  // Filters state
  const [dateRange, setDateRange] = useState('THIS_MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [branchId, setBranchId] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Saved Presets
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showPresetModal, setShowPresetModal] = useState(false);

  // Dashboard Stats
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Widget customisation
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showLayoutConfig, setShowLayoutConfig] = useState(false);

  // Drill-down drawers
  const [drillDownType, setDrillDownType] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<any[]>([]);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  // Sub-metrics
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [inventoryIntel, setInventoryIntel] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [forecastType, setForecastType] = useState('revenue');

  // Report center
  const [reportType, setReportType] = useState('sales');
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadPresets();
    loadWidgets();
    loadBIStats();
  }, [dateRange, branchId, technicianId, supplierId, statusFilter]);

  useEffect(() => {
    if (activeTab === 'repairs') {
      loadLeaderboard();
    }
    if (activeTab === 'inventory') {
      loadInventoryIntel();
    }
    if (activeTab === 'executive' || activeTab === 'finance') {
      loadForecast();
    }
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, forecastType, reportType, branchId]);

  // Load Presets
  const loadPresets = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('tz_analytics_presets');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPresets(parsed);
      const def = parsed.find((p: any) => p.isDefault);
      if (def) {
        setDateRange(def.filters.dateRange);
        setBranchId(def.filters.branchId);
        setTechnicianId(def.filters.technicianId);
        setSupplierId(def.filters.supplierId);
        setStatusFilter(def.filters.status);
      }
    } else {
      const defaultPresets: SavedPreset[] = [
        {
          id: 'preset-1',
          name: 'Executive Overview',
          isDefault: true,
          filters: { dateRange: 'THIS_MONTH', branchId: '', technicianId: '', supplierId: '', status: '' }
        }
      ];
      localStorage.setItem('tz_analytics_presets', JSON.stringify(defaultPresets));
      setPresets(defaultPresets);
    }
  };

  // Load widgets config
  const loadWidgets = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('tz_analytics_widgets');
    if (stored) {
      setWidgets(JSON.parse(stored));
    } else {
      const defaultWidgets: Widget[] = [
        { id: 'revenue', title: 'Revenue Statistics', visible: true, size: 'large', order: 1 },
        { id: 'repairs', title: 'Active Repairs Load', visible: true, size: 'small', order: 2 },
        { id: 'inventory', title: 'Inventory Stock Assets', visible: true, size: 'small', order: 3 },
        { id: 'warranty', title: 'Warranty Claims Out', visible: true, size: 'small', order: 4 },
        { id: 'crm', title: 'NPS & Loyalty Ratings', visible: true, size: 'large', order: 5 }
      ];
      localStorage.setItem('tz_analytics_widgets', JSON.stringify(defaultWidgets));
      setWidgets(defaultWidgets);
    }
  };

  // Load stats
  const loadBIStats = async () => {
    setLoading(true);
    try {
      const res = await api.analytics.fetchDashboard({
        dateRange,
        customStart,
        customEnd,
        branchId
      }, token);
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await api.analytics.fetchLeaderboard({ branchId }, token);
      if (res.success) setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadInventoryIntel = async () => {
    try {
      const res = await api.analytics.fetchInventoryIntelligence({ branchId }, token);
      if (res.success) setInventoryIntel(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadForecast = async () => {
    try {
      const res = await api.analytics.fetchForecast(forecastType, { branchId }, token);
      if (res.success) setForecastData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async () => {
    setReportLoading(true);
    try {
      const res = await api.analytics.fetchReports(reportType, {
        dateRange,
        customStart,
        customEnd,
        branchId
      }, token);
      if (res.success) setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  // Save Filter Preset
  const handleSavePreset = () => {
    if (!presetName) return;
    const newPreset: SavedPreset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      isDefault: false,
      filters: { dateRange, branchId, technicianId, supplierId, status: statusFilter }
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('tz_analytics_presets', JSON.stringify(updated));
    setPresetName('');
    setShowPresetModal(false);
    api.analytics.logExport('PRESET_SAVED', `Preset "${presetName}" saved successfully`, token);
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem('tz_analytics_presets', JSON.stringify(updated));
  };

  const handleSetDefaultPreset = (id: string) => {
    const updated = presets.map(p => ({
      ...p,
      isDefault: p.id === id
    }));
    setPresets(updated);
    localStorage.setItem('tz_analytics_presets', JSON.stringify(updated));
  };

  const handleApplyPreset = (preset: SavedPreset) => {
    setDateRange(preset.filters.dateRange);
    setBranchId(preset.filters.branchId);
    setTechnicianId(preset.filters.technicianId);
    setSupplierId(preset.filters.supplierId);
    setStatusFilter(preset.filters.status);
  };

  // Widget Layout Updates
  const toggleWidgetVisibility = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgets(updated);
    localStorage.setItem('tz_analytics_widgets', JSON.stringify(updated));
  };

  const handleWidgetOrderUp = (index: number) => {
    if (index === 0) return;
    const updated = [...widgets];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setWidgets(updated);
    localStorage.setItem('tz_analytics_widgets', JSON.stringify(updated));
  };

  // Trigger Drill-down
  const triggerDrilldown = async (type: string) => {
    setDrillDownType(type);
    setDrillDownLoading(true);
    try {
      const res = await api.analytics.fetchDrilldown(type, {
        dateRange,
        customStart,
        customEnd,
        branchId
      }, token);
      if (res.success) setDrillDownData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDrillDownLoading(false);
    }
  };

  const logExportReport = (type: string) => {
    api.analytics.logExport(type, `Report: ${reportType.toUpperCase()}`, token);
    alert(`Exporting ${reportType.toUpperCase()} Report to ${type}...`);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto print:p-0 print:bg-white print:text-black">
          {/* Header Banner */}
          <div className="border-b border-border/60 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Enterprise Analytics & BI Workspace
              </h1>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Real-time dashboard metrics, financial analytics, forecasting, and customizable reporting layouts.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowLayoutConfig(!showLayoutConfig)}
                className="bg-secondary hover:bg-secondary-hover text-foreground font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Layout className="h-4 w-4 text-muted-foreground" />
                Dashboard Grid Layout
              </button>
              <button 
                onClick={() => setShowPresetModal(true)}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Save Filters Preset
              </button>
            </div>
          </div>

          {/* Quick Preset select banner */}
          {presets.length > 0 && (
            <div className="bg-card border border-border/80 rounded-2xl p-3 flex flex-wrap gap-2 items-center print:hidden">
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase mr-2 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Saved Filter Presets:
              </span>
              {presets.map(p => (
                <div key={p.id} className="flex items-center gap-1.5 bg-secondary/40 border border-border/40 px-3 py-1 rounded-xl text-[10px] font-bold">
                  <button onClick={() => handleApplyPreset(p)} className="hover:text-primary transition cursor-pointer">
                    {p.name} {p.isDefault && '★'}
                  </button>
                  <button onClick={() => handleSetDefaultPreset(p.id)} className="text-muted-foreground hover:text-amber-500 transition" title="Set Default">
                    ★
                  </button>
                  <button onClick={() => handleDeletePreset(p.id)} className="text-muted-foreground hover:text-red-500 transition">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Advanced BI Queries Filter
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-muted-foreground font-bold mb-1">Time Period</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                >
                  <option value="TODAY">Today</option>
                  <option value="YESTERDAY">Yesterday</option>
                  <option value="THIS_WEEK">This Week</option>
                  <option value="THIS_MONTH">This Month</option>
                  <option value="LAST_MONTH">Last Month</option>
                  <option value="QUARTER">This Quarter</option>
                  <option value="YEAR">This Year</option>
                  <option value="CUSTOM">Custom Date Range</option>
                </select>
              </div>

              {dateRange === 'CUSTOM' && (
                <>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] text-muted-foreground font-bold mb-1">Branch Filter</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                >
                  <option value="">Cross-Branch (All)</option>
                  <option value="branch-1">Downtown Branch</option>
                  <option value="branch-2">Gulshan Branch</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-bold mb-1">Assigned Technician</label>
                <select
                  value={technicianId}
                  onChange={(e) => setTechnicianId(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                >
                  <option value="">All Technicians</option>
                  <option value="tech-1">Marcus Aurelius</option>
                  <option value="tech-2">Sarah Connor</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-bold mb-1">Supplier Channel</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                >
                  <option value="">All Suppliers</option>
                  <option value="supplier-1">M/S Tech Suppliers Ltd</option>
                </select>
              </div>
            </div>
          </div>

          {/* Widget Layout Customizer Display */}
          {showLayoutConfig && (
            <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-4 print:hidden transition-all duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Rearrange Dashboard Widgets</h3>
                <button onClick={() => setShowLayoutConfig(false)} className="text-xs text-muted-foreground hover:text-foreground">Close Settings</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {widgets.map((widget, idx) => (
                  <div key={widget.id} className="p-3 border border-border/60 rounded-xl flex items-center justify-between gap-2">
                    <span className="font-semibold">{widget.title}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleWidgetVisibility(widget.id)} className="text-muted-foreground hover:text-foreground transition cursor-pointer">
                        {widget.visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleWidgetOrderUp(idx)} className="text-muted-foreground hover:text-foreground transition" disabled={idx === 0}>
                        ↑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB SYSTEM */}
          <div className="flex border-b border-border/60 gap-4 overflow-x-auto pb-1 print:hidden">
            {[
              { id: 'executive', label: 'Executive Dashboard' },
              { id: 'finance', label: 'Financial BI' },
              { id: 'repairs', label: 'Operations & Repairs' },
              { id: 'inventory', label: 'Stock & Vendor BI' },
              { id: 'crm', label: 'CRM & Loyalty' },
              { id: 'reports', label: 'Report Exporter' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                }}
                className={`pb-3 text-xs font-black tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'executive' && stats && (
            <div className="space-y-6">
              {/* 17 Expandable KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { key: 'revenueToday', label: 'Revenue Today', value: stats.revenueToday, format: 'currency', type: 'revenue' },
                  { key: 'revenueThisMonth', label: 'Revenue This Month', value: stats.revenueThisMonth, format: 'currency', type: 'revenue' },
                  { key: 'grossProfit', label: 'Gross Profit', value: stats.grossProfit, format: 'currency', type: 'revenue' },
                  { key: 'netProfit', label: 'Net Profit', value: stats.netProfit, format: 'currency', type: 'revenue' },
                  { key: 'cashBalance', label: 'Cash Balance', value: stats.cashBalance, format: 'currency', type: 'revenue' },
                  { key: 'bankBalance', label: 'Bank Balance', value: stats.bankBalance, format: 'currency', type: 'revenue' },
                  { key: 'mobileBalance', label: 'Mobile Balance', value: stats.mobileBalance, format: 'currency', type: 'revenue' },
                  { key: 'receivables', label: 'Receivables', value: stats.receivables, format: 'currency', type: 'revenue' },
                  { key: 'payables', label: 'Payables', value: stats.payables, format: 'currency', type: 'expenses' },
                  { key: 'pendingRepairs', label: 'Pending Repairs', value: stats.pendingRepairs, format: 'number', type: 'repairs' },
                  { key: 'completedRepairs', label: 'Completed Repairs', value: stats.completedRepairs, format: 'number', type: 'repairs' },
                  { key: 'activeCustomers', label: 'Active Customers', value: stats.activeCustomers, format: 'number', type: 'repairs' },
                  { key: 'activeTechnicians', label: 'Active Technicians', value: stats.activeTechnicians, format: 'number', type: 'repairs' },
                  { key: 'lowStockAlerts', label: 'Low Stock Alerts', value: stats.lowStockAlerts, format: 'number', type: 'inventory' },
                  { key: 'inventoryValue', label: 'Inventory Value', value: stats.inventoryValue, format: 'currency', type: 'inventory' },
                  { key: 'warrantyClaims', label: 'Warranty Claims', value: stats.warrantyClaims, format: 'number', type: 'warranty' },
                  { key: 'avgRepairValue', label: 'Avg Repair Value', value: stats.avgRepairValue, format: 'currency', type: 'repairs' }
                ].map(card => (
                  <div
                    key={card.key}
                    onClick={() => triggerDrilldown(card.type)}
                    className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-primary transition-all duration-300 transform hover:-translate-y-0.5 print:border print:bg-white print:text-black"
                  >
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider block">{card.label}</span>
                    <span className="text-xl font-black text-foreground mt-2 block print:text-black">
                      {card.format === 'currency' ? `৳${Math.round(card.value).toLocaleString()}` : card.value}
                    </span>
                    <div className="absolute right-2.5 bottom-2.5 text-primary/10">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Widget Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {widgets.filter(w => w.visible).map(widget => (
                  <div
                    key={widget.id}
                    className={`bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 print:border print:bg-white print:text-black ${
                      widget.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'
                    }`}
                  >
                    <div className="flex justify-between items-center border-b border-border/60 pb-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-primary" />
                        {widget.title}
                      </h4>
                      <button onClick={() => triggerDrilldown(widget.id)} className="text-[10px] text-primary font-bold hover:underline print:hidden">
                        View Detail Transactions
                      </button>
                    </div>

                    {/* Chart Container placeholder rendering using styled SVG */}
                    <div className="h-48 flex items-center justify-center relative bg-secondary/15 rounded-xl border border-border/40">
                      <svg className="w-full h-full p-4" viewBox="0 0 400 150">
                        {/* Grid lines */}
                        <line x1="20" y1="120" x2="380" y2="120" stroke="#333" strokeWidth="1" />
                        <line x1="20" y1="20" x2="20" y2="120" stroke="#333" strokeWidth="1" />
                        {/* Area graph path */}
                        <path d="M 20 120 L 80 80 L 140 100 L 200 40 L 260 60 L 320 30 L 380 90" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
                        {/* Trend points */}
                        <circle cx="80" cy="80" r="4" fill="hsl(var(--primary))" />
                        <circle cx="200" cy="40" r="4" fill="hsl(var(--primary))" />
                        <circle cx="320" cy="30" r="4" fill="hsl(var(--primary))" />
                      </svg>
                      <span className="absolute bottom-2 right-3 text-[9px] text-muted-foreground font-semibold uppercase">5 Month Growth Trend</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL BI */}
          {activeTab === 'finance' && stats && (
            <div className="space-y-6">
              {/* Financial Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 md:col-span-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Revenues vs Expenses BI Chart</h3>
                  
                  <div className="h-52 flex items-end justify-between p-4 bg-secondary/10 border border-border/40 rounded-xl relative">
                    {/* Mock Bars */}
                    {[
                      { month: 'Feb', rev: 140, exp: 90 },
                      { month: 'Mar', rev: 165, exp: 110 },
                      { month: 'Apr', rev: 152, exp: 120 },
                      { month: 'May', rev: 180, exp: 95 },
                      { month: 'Jun', rev: 184, exp: 105 }
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="flex gap-1.5 items-end h-32 w-12">
                          <div style={{ height: `${bar.rev * 0.6}%` }} className="bg-primary w-5 rounded-t-sm" title={`Revenue: ৳${bar.rev}k`} />
                          <div style={{ height: `${bar.exp * 0.6}%` }} className="bg-amber-500 w-5 rounded-t-sm" title={`Expense: ৳${bar.exp}k`} />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">{bar.month}</span>
                      </div>
                    ))}
                    <div className="absolute top-2 right-3 flex gap-3 text-[10px] font-bold text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-primary rounded-sm" /> Revenue</span>
                      <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-amber-500 rounded-sm" /> Expense</span>
                    </div>
                  </div>
                </div>

                {/* Forecast trend widget */}
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Trends Forecaster
                    </h3>
                    <select
                      value={forecastType}
                      onChange={(e) => setForecastType(e.target.value)}
                      className="bg-secondary border border-border/60 rounded-lg px-2.5 py-1 text-[10px] font-bold focus:outline-none"
                    >
                      <option value="revenue">Revenue Forecast</option>
                      <option value="repairs">Repair Volume Forecast</option>
                    </select>
                  </div>

                  {forecastData && (
                    <div className="space-y-4 text-xs">
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase">Predicted Next Period (Jul 26)</span>
                        <span className="block text-lg font-black text-primary mt-1">
                          {forecastType === 'revenue' ? `৳${forecastData.projections[0].predictedValue.toLocaleString()}` : `${forecastData.projections[0].predictedValue} units`}
                        </span>
                        <span className="text-[8px] text-muted-foreground font-semibold block mt-0.5">Statistical Confidence: 95% (Linear Regression)</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase">Projections</span>
                        {forecastData.projections.map((p: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-xs border-b border-border/40 pb-1.5">
                            <span className="font-semibold text-muted-foreground">{p.period}</span>
                            <span className="font-bold text-foreground">
                              {forecastType === 'revenue' ? `৳${p.predictedValue.toLocaleString()}` : `${p.predictedValue} units`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPERATIONS & REPAIRS */}
          {activeTab === 'repairs' && (
            <div className="space-y-6">
              {/* Technician Leaderboard Grid */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Technician Productivity Leaderboard</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary/40 text-muted-foreground uppercase font-black tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Technician</th>
                        <th className="p-3">Completed Repairs</th>
                        <th className="p-3">Revenue Generated</th>
                        <th className="p-3">Avg Speed</th>
                        <th className="p-3">Rework Rate</th>
                        <th className="p-3">CSAT Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {leaderboard.map((tech) => (
                        <tr key={tech.id} className="hover:bg-secondary/15 transition-colors">
                          <td className="p-3 font-bold">{tech.name}</td>
                          <td className="p-3 font-semibold">{tech.completedRepairs} tickets</td>
                          <td className="p-3 font-bold text-primary">৳{tech.revenueGenerated.toLocaleString()}</td>
                          <td className="p-3 font-semibold">{tech.avgRepairTime}h</td>
                          <td className="p-3 text-red-500 font-bold">{tech.reworkRate}%</td>
                          <td className="p-3 font-bold text-emerald-500">★ {tech.customerSatisfaction.toFixed(1)}/5.0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STOCK & VENDOR BI */}
          {activeTab === 'inventory' && inventoryIntel && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Selling Parts */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Fast Moving / Top Selling Parts</h3>
                <div className="space-y-3 text-xs">
                  {inventoryIntel.topSellingParts.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-border/40 pb-2">
                      <div>
                        <span className="font-bold text-foreground block">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">SKU: {item.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-primary block">৳{item.basePrice.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Stock Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slow Moving & Dead Stock */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground text-amber-500">Slow Moving / Stock Aging Alert</h3>
                <div className="space-y-3 text-xs">
                  {inventoryIntel.slowMovingInventory.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-border/40 pb-2">
                      <div>
                        <span className="font-bold text-foreground block">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">Aging: {item.agingDays} days in bin</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-amber-500 block">Qty: {item.quantity}</span>
                        <span className="text-[10px] text-muted-foreground">Valuation: ৳{item.totalValuation.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CRM & NPS */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              {/* NPS distribution */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Net Promoter Score (NPS) Trend</h3>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">Promoters (9-10)</span>
                    <span className="block text-2xl font-black text-emerald-500 mt-1">75%</span>
                  </div>
                  <div className="p-4 bg-gray-500/5 border border-gray-500/20 rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Passives (7-8)</span>
                    <span className="block text-2xl font-black mt-1">15%</span>
                  </div>
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <span className="text-[10px] text-red-500 font-bold uppercase">Detractors (0-6)</span>
                    <span className="block text-2xl font-black text-red-500 mt-1">10%</span>
                  </div>
                </div>

                <div className="h-4 w-full bg-secondary/40 rounded-full flex overflow-hidden">
                  <div style={{ width: '75%' }} className="bg-emerald-500" title="Promoters" />
                  <div style={{ width: '15%' }} className="bg-gray-500" title="Passives" />
                  <div style={{ width: '10%' }} className="bg-red-500" title="Detractors" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS EXPORTER */}
          {activeTab === 'reports' && (
            <div className="space-y-6 print:hidden">
              <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  {[
                    { id: 'sales', label: 'Sales Invoice Ledger' },
                    { id: 'repairs', label: 'Repairs Workload' },
                    { id: 'warranties', label: 'Warranty Certificates' }
                  ].map(rep => (
                    <button
                      key={rep.id}
                      onClick={() => setReportType(rep.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                        reportType === rep.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary-hover text-foreground'
                      }`}
                    >
                      {rep.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => logExportReport('PDF')}
                    className="px-3.5 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileDown className="h-4 w-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => logExportReport('CSV')}
                    className="px-3.5 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                    CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    Print Report
                  </button>
                </div>
              </div>

              {/* Reports spreadsheet view */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                  Formed Sheet: {reportType.toUpperCase()}
                </h3>

                {reportLoading ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">Formulating records...</div>
                ) : reportData.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">No records match criteria in selected window.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/40 text-muted-foreground uppercase font-black tracking-wider text-[10px]">
                        {reportType === 'sales' && (
                          <tr>
                            <th className="p-3">Invoice Number</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Branch</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Date</th>
                          </tr>
                        )}
                        {reportType === 'repairs' && (
                          <tr>
                            <th className="p-3">Ticket ID</th>
                            <th className="p-3">Device Model</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Technician</th>
                            <th className="p-3">Status</th>
                          </tr>
                        )}
                        {reportType === 'warranties' && (
                          <tr>
                            <th className="p-3">Certificate ID</th>
                            <th className="p-3">Model</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Expiry</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-border/60 font-semibold">
                        {reportType === 'sales' && reportData.map((row: any) => (
                          <tr key={row.id}>
                            <td className="p-3 font-bold">{row.invoiceNumber}</td>
                            <td className="p-3">{row.customer.firstName} {row.customer.lastName}</td>
                            <td className="p-3">{row.branch.name}</td>
                            <td className="p-3 text-primary">৳{row.totalAmount.toLocaleString()}</td>
                            <td className="p-3 text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {reportType === 'repairs' && reportData.map((row: any) => (
                          <tr key={row.id}>
                            <td className="p-3 font-bold">{row.ticketNumber}</td>
                            <td className="p-3">{row.deviceBrand} {row.deviceModel}</td>
                            <td className="p-3">{row.customer.firstName} {row.customer.lastName}</td>
                            <td className="p-3">{row.assignedTech ? `${row.assignedTech.firstName} ${row.assignedTech.lastName}` : 'Unassigned'}</td>
                            <td className="p-3"><span className="uppercase text-[9px] px-2 py-0.5 rounded bg-secondary">{row.status}</span></td>
                          </tr>
                        ))}
                        {reportType === 'warranties' && reportData.map((row: any) => (
                          <tr key={row.id}>
                            <td className="p-3 font-bold">{row.warrantyNumber}</td>
                            <td className="p-3">{row.deviceBrand} {row.deviceModel}</td>
                            <td className="p-3">{row.customer.firstName} {row.customer.lastName}</td>
                            <td className="p-3 text-emerald-500">{row.status}</td>
                            <td className="p-3 text-muted-foreground">{new Date(row.endDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              PRINT PREVIEW OVERLAY VIEW (PRINT ONLY)
             ========================================== */}
          <div className="hidden print:block p-8 space-y-6 bg-white text-black font-sans">
            {/* Header info */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4">
              <div>
                <h1 className="text-xl font-black uppercase text-black">TrustZone Care BI Exporter</h1>
                <span className="text-[10px] text-gray-500 font-bold block mt-0.5">Enterprise Business Intelligence Report Sheet</span>
              </div>
              <div className="text-right text-[10px] font-semibold text-gray-600">
                <span>Branch: {branchId === 'branch-1' ? 'Downtown Desk' : 'All Branches'}</span>
                <span className="block mt-1">Generated: {new Date().toLocaleString()}</span>
                <span className="block mt-1">Filters: {dateRange}</span>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase mt-4">Detailed Spreadsheet: {reportType.toUpperCase()}</h3>

            {/* Print Data Table */}
            <table className="w-full text-left text-xs border-collapse mt-4">
              <thead>
                <tr className="border-b border-black text-gray-700 font-bold text-[10px] uppercase">
                  {reportType === 'sales' && (
                    <>
                      <th className="py-2">Invoice</th>
                      <th className="py-2">Customer</th>
                      <th className="py-2">Branch</th>
                      <th className="py-2">Amount</th>
                    </>
                  )}
                  {reportType === 'repairs' && (
                    <>
                      <th className="py-2">Ticket</th>
                      <th className="py-2">Model</th>
                      <th className="py-2">Customer</th>
                      <th className="py-2">Status</th>
                    </>
                  )}
                  {reportType === 'warranties' && (
                    <>
                      <th className="py-2">Certificate</th>
                      <th className="py-2">Model</th>
                      <th className="py-2">Customer</th>
                      <th className="py-2">Expiry</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {reportType === 'sales' && reportData.map((row: any) => (
                  <tr key={row.id} className="py-1">
                    <td className="py-2 font-bold">{row.invoiceNumber}</td>
                    <td className="py-2">{row.customer.firstName} {row.customer.lastName}</td>
                    <td className="py-2">{row.branch.name}</td>
                    <td className="py-2">৳{row.totalAmount}</td>
                  </tr>
                ))}
                {reportType === 'repairs' && reportData.map((row: any) => (
                  <tr key={row.id} className="py-1">
                    <td className="py-2 font-bold">{row.ticketNumber}</td>
                    <td className="py-2">{row.deviceBrand} {row.deviceModel}</td>
                    <td className="py-2">{row.customer.firstName} {row.customer.lastName}</td>
                    <td className="py-2 uppercase">{row.status}</td>
                  </tr>
                ))}
                {reportType === 'warranties' && reportData.map((row: any) => (
                  <tr key={row.id} className="py-1">
                    <td className="py-2 font-bold">{row.warrantyNumber}</td>
                    <td className="py-2">{row.deviceBrand} {row.deviceModel}</td>
                    <td className="py-2">{row.customer.firstName} {row.customer.lastName}</td>
                    <td className="py-2">{new Date(row.endDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-gray-400 pt-4 text-center text-[10px] text-gray-500 italic mt-8">
              This report represents live database records compiled by TrustZone Care BI platform. Generated by Authorized Staff.
            </div>
          </div>

          {/* ==========================================
              DRILL-DOWN DETAIL SIDE DRAWER
             ========================================== */}
          {drillDownType && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end print:hidden">
              <div className="bg-card border-l border-border/80 w-full max-w-2xl p-6 space-y-6 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center border-b border-border/60 pb-3">
                  <div>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Transactional Drill-down</span>
                    <h3 className="text-sm font-black text-foreground mt-0.5">Details: {drillDownType.toUpperCase()}</h3>
                  </div>
                  <button onClick={() => setDrillDownType(null)} className="text-xs text-muted-foreground hover:text-foreground font-black cursor-pointer">
                    Close Details
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto">
                  {drillDownLoading ? (
                    <div className="text-center py-10 text-xs text-muted-foreground">Aggregating matching logs...</div>
                  ) : drillDownData.length === 0 ? (
                    <div className="text-center py-10 text-xs text-muted-foreground">No transactional matches found in selected date frame.</div>
                  ) : (
                    <div className="space-y-4 text-xs font-semibold">
                      {drillDownType === 'revenue' && drillDownData.map((row: any) => (
                        <div key={row.id} className="p-4 border border-border/60 rounded-2xl flex justify-between items-center bg-secondary/10">
                          <div>
                            <span className="font-bold text-foreground block">Invoice: {row.invoiceNumber}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">Client: {row.invoice.customer.firstName} {row.invoice.customer.lastName}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-primary block">৳{row.amount.toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground font-mono block">{row.method} payment</span>
                          </div>
                        </div>
                      ))}

                      {drillDownType === 'expenses' && drillDownData.map((row: any) => (
                        <div key={row.id} className="p-4 border border-border/60 rounded-2xl flex justify-between items-center bg-secondary/10">
                          <div>
                            <span className="font-bold text-foreground block">{row.category}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">{row.description}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-red-500 block">৳{row.amount.toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground block">{new Date(row.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}

                      {drillDownType === 'repairs' && drillDownData.map((row: any) => (
                        <div key={row.id} className="p-4 border border-border/60 rounded-2xl flex justify-between items-center bg-secondary/10">
                          <div>
                            <span className="font-bold text-foreground block">Ticket: {row.ticketNumber}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">Device: {row.deviceBrand} {row.deviceModel}</span>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 text-[9px] font-extrabold bg-secondary text-foreground rounded uppercase block">{row.status}</span>
                            <span className="text-[10px] text-muted-foreground block mt-1">Client: {row.customer.firstName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SAVE PRESET FILTER MODAL
             ========================================== */}
          {showPresetModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border/80 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Save Dashboard Preset</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Preset Name</label>
                    <input
                      type="text"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="e.g. Dhaka Desk Monthly Audit"
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setShowPresetModal(false)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreset}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Save Preset
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
