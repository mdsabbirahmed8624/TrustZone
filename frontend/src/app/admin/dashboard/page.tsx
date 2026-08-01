'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  Package, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { ActivityFeed } from '../components/activity-feed';

// ----------------------------------------------------
// Reusable Widget Component
// ----------------------------------------------------
interface StatWidgetProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    positive: boolean;
  };
  colorClass?: string;
  loading?: boolean;
}

const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  colorClass = 'text-primary bg-primary/10 border-primary/20',
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-card border border-border/80 p-5 rounded-xl shadow-sm animate-pulse space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded-lg" />
        </div>
        <div className="h-8 w-16 bg-muted rounded" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/80 p-5 rounded-xl shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between relative overflow-hidden group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${colorClass}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-foreground tracking-tight mb-1">{value}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {trend && (
            <span className={`font-bold flex items-center ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.positive ? '+' : ''}{trend.value}
            </span>
          )}
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Dashboard Page Component
// ----------------------------------------------------
export default function AdminDashboardPage() {
  // Navigation layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [branchContext, setBranchContext] = useState('dhanmondi');

  // Load context from local storage
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);

    const handleBranchChange = () => {
      if (typeof window !== 'undefined') {
        setBranchContext(localStorage.getItem('tz_admin_branch') || 'dhanmondi');
      }
    };

    window.addEventListener('admin_branch_changed', handleBranchChange);
    handleBranchChange();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('admin_branch_changed', handleBranchChange);
    };
  }, []);

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar navigation drawer */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main dashboard body container */}
      <div 
        className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-transparent to-accent/5 p-4 rounded-2xl border border-border/80">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Executive Control Panel</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-primary-foreground rounded-full">v1.2.0</span>
              </div>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Lab diagnostic operations and resource overview for: <span className="text-foreground font-bold capitalize">{branchContext} Branch</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground shrink-0 bg-card border border-border px-3.5 py-1.5 rounded-xl shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              <span>Real-Time Sync Active</span>
            </div>
          </div>

          {/* 12 Grid Statistics Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatWidget
              title="Today's Repairs"
              value={18}
              description="allocated in repair queues"
              icon={Wrench}
              trend={{ value: '12%', positive: true }}
              colorClass="text-blue-500 bg-blue-500/10 border-blue-500/20"
              loading={loading}
            />
            <StatWidget
              title="Pending Repairs"
              value={42}
              description="devices in diagnosis/parts back-order"
              icon={Clock}
              colorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
              loading={loading}
            />
            <StatWidget
              title="Completed Repairs"
              value={124}
              description="repaired this calendar month"
              icon={CheckCircle}
              trend={{ value: '24%', positive: true }}
              colorClass="text-green-500 bg-green-500/10 border-green-500/20"
              loading={loading}
            />
            <StatWidget
              title="Revenue Today"
              value="৳48,500"
              description="invoiced from billing desk"
              icon={TrendingUp}
              trend={{ value: '8%', positive: true }}
              colorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
              loading={loading}
            />
            <StatWidget
              title="Revenue Month"
              value="৳1,245,000"
              description="total branch income target BDT 1.5M"
              icon={TrendingUp}
              trend={{ value: '14%', positive: true }}
              colorClass="text-green-500 bg-green-500/10 border-green-500/20"
              loading={loading}
            />
            <StatWidget
              title="Today's Bookings"
              value={23}
              description="online booking requests logs"
              icon={Calendar}
              trend={{ value: '5%', positive: false }}
              colorClass="text-purple-500 bg-purple-500/10 border-purple-500/20"
              loading={loading}
            />
            <StatWidget
              title="Pickup Requests"
              value={9}
              description="repaired devices ready for courier"
              icon={Smartphone}
              colorClass="text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
              loading={loading}
            />
            <StatWidget
              title="Warranty Claims"
              value={3}
              description="active warranty review tickets"
              icon={ShieldCheck}
              trend={{ value: '-20%', positive: true }}
              colorClass="text-red-500 bg-red-500/10 border-red-500/20"
              loading={loading}
            />
            <StatWidget
              title="Active Customers"
              value="1,480"
              description="loyalty customer profile ledger"
              icon={Users}
              trend={{ value: '18%', positive: true }}
              colorClass="text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
              loading={loading}
            />
            <StatWidget
              title="Active Technicians"
              value={14}
              description="on-duty diagnostic lab engineers"
              icon={Users}
              colorClass="text-slate-500 bg-slate-500/10 border-slate-500/20"
              loading={loading}
            />
            <StatWidget
              title="Low Stock Buffer"
              value={6}
              description="parts SKUs under safety buffers"
              icon={Package}
              colorClass="text-red-500 bg-red-500/10 border-red-500/20"
              loading={loading}
            />
            <StatWidget
              title="Pending Payments"
              value={12}
              description="invoices awaiting bank settlement"
              icon={CreditCard}
              colorClass="text-pink-500 bg-pink-500/10 border-pink-500/20"
              loading={loading}
            />
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Quick Actions Console</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="flex flex-col items-center justify-center p-4 bg-secondary/20 hover:bg-secondary/40 border border-border/60 rounded-xl transition text-center group cursor-pointer">
                <Wrench className="h-5 w-5 text-primary group-hover:scale-105 transition" />
                <span className="text-xs font-bold text-foreground mt-2">Log Diagnostic Ticket</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Add device repair entry</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-secondary/20 hover:bg-secondary/40 border border-border/60 rounded-xl transition text-center group cursor-pointer">
                <Users className="h-5 w-5 text-green-500 group-hover:scale-105 transition" />
                <span className="text-xs font-bold text-foreground mt-2">Register Customer</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Add loyalty customer log</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-secondary/20 hover:bg-secondary/40 border border-border/60 rounded-xl transition text-center group cursor-pointer">
                <Smartphone className="h-5 w-5 text-purple-500 group-hover:scale-105 transition" />
                <span className="text-xs font-bold text-foreground mt-2">Assign Lab Technician</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Dispatch repair load</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-secondary/20 hover:bg-secondary/40 border border-border/60 rounded-xl transition text-center group cursor-pointer">
                <ShieldCheck className="h-5 w-5 text-emerald-500 group-hover:scale-105 transition" />
                <span className="text-xs font-bold text-foreground mt-2">Database Backup</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Execute immediate snapshot</span>
              </button>
            </div>
          </div>

          {/* Handcrafted Interactive SVG Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Repair Trend & Monthly Revenue */}
            <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">Repair Load Trend (Weekly)</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Weekly volume comparison of diagnostic and repair requests</p>
              </div>
              <div className="h-60 mt-4 flex items-end justify-between relative border-b border-l border-border/80 pl-2 pb-2">
                {/* SVG Line chart representing repair trends */}
                <svg className="absolute inset-0 h-full w-full p-6 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="100" y2="25" stroke="var(--border)" strokeWidth="0.25" strokeDasharray="2" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border)" strokeWidth="0.25" strokeDasharray="2" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="var(--border)" strokeWidth="0.25" strokeDasharray="2" />
                  
                  {/* Trend Area path */}
                  <path
                    d="M 0 80 Q 20 40 40 60 T 80 20 T 100 30 L 100 100 L 0 100 Z"
                    fill="url(#gradient-blue)"
                    opacity="0.15"
                  />
                  {/* Trend Line path */}
                  <path
                    d="M 0 80 Q 20 40 40 60 T 80 20 T 100 30"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Defs for gradient */}
                  <defs>
                    <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Weekly indicators */}
                <div className="absolute bottom-1 left-4 text-[9px] font-bold text-muted-foreground">Week 1</div>
                <div className="absolute bottom-1 left-1/4 text-[9px] font-bold text-muted-foreground">Week 2</div>
                <div className="absolute bottom-1 left-1/2 text-[9px] font-bold text-muted-foreground">Week 3</div>
                <div className="absolute bottom-1 left-3/4 text-[9px] font-bold text-muted-foreground">Week 4</div>
              </div>
            </div>

            {/* Chart 2: Monthly Revenue */}
            <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">Monthly Revenue Performance</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Net invoice billing target performance (BDT Millions)</p>
              </div>
              <div className="h-60 mt-4 flex items-end justify-around border-b border-l border-border/80 pl-2 pb-2">
                {/* SVG Bar chart */}
                {[
                  { m: 'Jan', v: 40, c: 'bg-primary' },
                  { m: 'Feb', v: 60, c: 'bg-primary' },
                  { m: 'Mar', v: 50, c: 'bg-primary' },
                  { m: 'Apr', v: 75, c: 'bg-accent' },
                  { m: 'May', v: 90, c: 'bg-accent' },
                  { m: 'Jun', v: 85, c: 'bg-accent' }
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center w-8 group">
                    <div 
                      className={`w-full rounded-t-md transition-all duration-500 group-hover:opacity-90 ${bar.c}`}
                      style={{ height: `${bar.v}%` }}
                      title={`BDT ${bar.v * 15}K`}
                    />
                    <span className="text-[9px] font-bold text-muted-foreground mt-2">{bar.m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 3: Top Brands compatibility & Repair Types */}
            <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">Device Brand Mix</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Distribution of repair requests by smartphone manufacturers</p>
              </div>
              <div className="h-56 mt-4 flex items-center justify-around">
                {/* Donut chart simulation */}
                <div className="relative h-32 w-32 shrink-0">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeDasharray="45 100" strokeDashoffset="25" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeDasharray="30 100" strokeDashoffset="70" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e879f9" strokeWidth="3.5" strokeDasharray="25 100" strokeDashoffset="0" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-extrabold text-foreground">Apple</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">45% Share</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="space-y-2.5 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-primary" />
                    <span>Apple (45%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-accent" />
                    <span>Samsung (30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-fuchsia-400" />
                    <span>Xiaomi / Others (25%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 4: Technician Output Performance */}
            <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">Technician SLA Performance</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Average repair turnaround and SLA compliance (Target: 95%)</p>
              </div>
              <div className="h-56 mt-4 space-y-4 flex flex-col justify-center">
                {[
                  { name: 'Kamrul Hasan (Lead)', val: 98, status: 'text-green-500' },
                  { name: 'Sabbir Ahmed (Micro-Soldering)', val: 96, status: 'text-green-500' },
                  { name: 'Anisur Rahman (Diagnostics)', val: 92, status: 'text-amber-500' },
                  { name: 'Mehedi Hasan (Apprentice)', val: 86, status: 'text-red-500' }
                ].map((tech, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground">{tech.name}</span>
                      <span className={tech.status}>{tech.val}% SLA</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-primary`}
                        style={{ width: `${tech.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed and Quick Reports row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Global Activity Feed */}
            <div className="lg:col-span-2 bg-card border border-border/80 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">ERP Activity Logs</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Audit trace of administrative operations</p>
                </div>
                <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  Central Audit System
                </span>
              </div>
              <ActivityFeed maxItems={5} />
            </div>

            {/* System Status Indicators */}
            <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Diagnostic Systems</h3>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3.5 bg-green-500/5 border border-green-500/25 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                      <span>PostgreSQL DB</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-green-600">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-green-500/5 border border-green-500/25 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                      <span>Redis Cache Gateway</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-green-600">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-amber-500/5 border border-amber-500/25 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                      <span>SMTP Mailer Adapter</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-600">STAGING</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3.5 bg-secondary/35 border border-border rounded-xl text-[10px] text-muted-foreground font-mono leading-relaxed mt-4">
                <span className="font-extrabold text-foreground block mb-0.5">ERP Security Notice:</span>
                Automatic session timeout terminates after 15 minutes of user inactivity. Keep panel locked when away.
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dynamic Overlays */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      <NotificationCenter 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
}
