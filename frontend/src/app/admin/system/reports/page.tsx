'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import {
  FileSpreadsheet,
  BarChart3,
  Settings,
  Play,
  Printer,
  Download,
  Calendar,
  Filter,
  PieChart,
  TrendingUp,
  Award,
  Users,
  Search,
  Save,
  Share2,
  Clock,
  CheckCircle2,
  RefreshCw,
  FileText,
  Bookmark,
} from 'lucide-react';

interface ReportFilter {
  moduleScope: 'TICKETS' | 'FINANCE' | 'INVENTORY' | 'WARRANTY' | 'CUSTOMERS' | 'HRMS';
  dateRange: 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR';
  branchId: string;
  groupBy: 'STATUS' | 'BRANCH' | 'TECHNICIAN' | 'MONTH';
}

export default function ReportsBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'builder' | 'templates'>('builder');

  // Filters State
  const [filters, setFilters] = useState<ReportFilter>({
    moduleScope: 'TICKETS',
    dateRange: 'THIS_MONTH',
    branchId: 'ALL',
    groupBy: 'STATUS',
  });

  const [loading, setLoading] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);

  // Saved Templates State
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);

  useEffect(() => {
    loadMockTemplates();
    handleRunReport();
  }, []);

  const loadMockTemplates = () => {
    setSavedTemplates([
      { id: 'tmpl-1', name: 'Top Technicians SLA & Diagnostics Performance', scope: 'TICKETS', author: 'Super Admin', category: 'PERFORMANCE', lastRun: '2 hours ago' },
      { id: 'tmpl-2', name: 'Monthly Outlet Gross Revenue & Tax Settlement', scope: 'FINANCE', author: 'Accounts Lead', category: 'FINANCE', lastRun: 'Yesterday' },
      { id: 'tmpl-3', name: 'Critical Spare Parts Inventory Consumption Rate', scope: 'INVENTORY', author: 'Warehouse Manager', category: 'INVENTORY', lastRun: '3 days ago' },
      { id: 'tmpl-4', name: 'Warranty Claim Rejection & Fraud Analysis', scope: 'WARRANTY', author: 'Quality Control', category: 'WARRANTY', lastRun: '5 days ago' },
    ]);
  };

  const handleRunReport = async () => {
    setLoading(true);
    setTimeout(() => {
      if (filters.moduleScope === 'TICKETS') {
        setReportResult({
          totalRecords: 148,
          totalValue: 452000,
          avgCompletionDays: 1.8,
          successRate: 98.4,
          data: [
            { id: 'TZ-901', customer: 'Tanvir Ahmed', branch: 'Dhanmondi Central', tech: 'Lead Tech Rafiq', model: 'iPhone 13 Pro Max', issue: 'OLED Assembly', cost: 12500, status: 'DELIVERED' },
            { id: 'TZ-902', customer: 'Nasrin Sultana', branch: 'Banani Lab', tech: 'Micro-Tech Kazi', model: 'Samsung S22 Ultra', issue: 'Battery & Charging IC', cost: 8500, status: 'REPAIR_IN_PROGRESS' },
            { id: 'TZ-903', customer: 'Mahbubur Rahman', branch: 'Uttara Hub', tech: 'Tech Jamil', model: 'MacBook Air M1', issue: 'Liquid Damage Clean', cost: 16500, status: 'DIAGNOSING' },
            { id: 'TZ-904', customer: 'Kazi Farhan', branch: 'Dhanmondi Central', tech: 'Lead Tech Rafiq', model: 'iPad Pro 11"', issue: 'Digitizer Replacement', cost: 9800, status: 'DELIVERED' },
          ],
        });
      } else if (filters.moduleScope === 'FINANCE') {
        setReportResult({
          totalRecords: 112,
          totalValue: 890000,
          avgInvoice: 7946,
          paidRate: 94.2,
          data: [
            { id: 'TZ-INV-1091', customer: 'SSL Payment Batch #90', branch: 'Dhanmondi Central', method: 'SSLCOMMERZ', cost: 45000, status: 'SETTLED' },
            { id: 'TZ-INV-1092', customer: 'Walk-in Cash Deposit', branch: 'Banani Lab', method: 'CASH', cost: 12500, status: 'SETTLED' },
            { id: 'TZ-INV-1093', customer: 'Corporate Account B2B', branch: 'Uttara Hub', method: 'BANK_TRANSFER', cost: 38000, status: 'PENDING' },
          ],
        });
      } else {
        setReportResult({
          totalRecords: 86,
          totalValue: 310000,
          avgStock: 42,
          reorderAlerts: 4,
          data: [
            { id: 'SKU-BAT-S22', customer: 'Vendor M/S Tech Corp', branch: 'Dhanmondi Central', tech: 'Stock Mgr', model: 'Samsung Battery', cost: 1450, status: 'LOW_STOCK' },
            { id: 'SKU-OLED-IP13', customer: 'Vendor Apple Parts', branch: 'Banani Lab', tech: 'Stock Mgr', model: 'iPhone OLED', cost: 8900, status: 'IN_STOCK' },
          ],
        });
      }
      setLoading(false);
    }, 300);
  };

  const handleExportCSV = () => {
    if (!reportResult) return;
    const csvContent = 'data:text/csv;charset=utf-8,' + JSON.stringify(reportResult.data, null, 2);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enterprise_Report_${filters.moduleScope}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <FileSpreadsheet className="text-primary h-6 w-6" />
                Enterprise Report Builder & Analytics Engine
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compile multi-module analytical reports, groupings, KPI metrics, and export formatted datasets.
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button onClick={() => setActiveTab(activeTab === 'builder' ? 'templates' : 'builder')} className="bg-secondary/40 border border-border hover:bg-secondary text-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                <Bookmark className="h-4 w-4" /> {activeTab === 'builder' ? 'Report Templates Library' : 'Report Builder Engine'}
              </button>
            </div>
          </div>

          {activeTab === 'templates' ? (
            <div className="space-y-4">
              <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-foreground">Pre-Built Enterprise Analytics Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedTemplates.map(t => (
                    <div key={t.id} className="bg-secondary/20 border border-border/60 p-4 rounded-xl space-y-3 hover:border-primary/40 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-xs text-foreground">{t.name}</h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Category: <span className="font-bold text-foreground">{t.category}</span> | Author: {t.author}</p>
                        </div>
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                          {t.scope}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border/60 pt-3 text-[10px]">
                        <span className="text-muted-foreground">Last Run: {t.lastRun}</span>
                        <button onClick={() => { setFilters({ ...filters, moduleScope: t.scope }); setActiveTab('builder'); handleRunReport(); }} className="bg-primary text-primary-foreground font-bold px-2.5 py-1 rounded">
                          Run Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

              {/* Left Column: Filter Controls */}
              <div className="bg-card border border-border/60 p-5 rounded-xl space-y-4 text-xs font-semibold shadow-sm">
                <h2 className="text-sm font-bold flex items-center gap-1 text-foreground border-b border-border/60 pb-3">
                  <Settings className="h-4 w-4 text-primary" /> Report Parameters
                </h2>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Module Scope</label>
                  <select value={filters.moduleScope} onChange={(e) => setFilters({ ...filters, moduleScope: e.target.value as any })} className="w-full bg-secondary/20 border border-border p-2 rounded-lg font-bold text-foreground outline-none focus:border-primary">
                    <option value="TICKETS">Tickets & Repairs</option>
                    <option value="FINANCE">Invoices & Revenue</option>
                    <option value="INVENTORY">Parts & Stock</option>
                    <option value="WARRANTY">Warranty Claims</option>
                    <option value="CUSTOMERS">CRM & Customers</option>
                    <option value="HRMS">HR & Technician Roster</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Date Range</label>
                  <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })} className="w-full bg-secondary/20 border border-border p-2 rounded-lg font-bold text-foreground outline-none focus:border-primary">
                    <option value="THIS_WEEK">This Week</option>
                    <option value="THIS_MONTH">This Month</option>
                    <option value="LAST_MONTH">Last Month</option>
                    <option value="THIS_YEAR">This Year</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Branch Filter</label>
                  <select value={filters.branchId} onChange={(e) => setFilters({ ...filters, branchId: e.target.value })} className="w-full bg-secondary/20 border border-border p-2 rounded-lg font-bold text-foreground outline-none focus:border-primary">
                    <option value="ALL">All Service Outlets</option>
                    <option value="br-1">Dhanmondi Central</option>
                    <option value="br-2">Banani Lab</option>
                    <option value="br-3">Uttara Hub</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Group By Aggregation</label>
                  <select value={filters.groupBy} onChange={(e) => setFilters({ ...filters, groupBy: e.target.value as any })} className="w-full bg-secondary/20 border border-border p-2 rounded-lg font-bold text-foreground outline-none focus:border-primary">
                    <option value="STATUS">Record Status</option>
                    <option value="BRANCH">Outlet Location</option>
                    <option value="TECHNICIAN">Assigned Staff</option>
                    <option value="MONTH">Calendar Month</option>
                  </select>
                </div>

                <button onClick={handleRunReport} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow">
                  <Play className="h-4 w-4" /> Run Analytics Report
                </button>
              </div>

              {/* Right Column: Analytics Canvas */}
              <div className="lg:col-span-3 space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center min-h-[40vh] bg-card border border-border/60 rounded-xl p-8 shadow-sm">
                    <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground mt-4 font-medium">Aggregating analytical records across branch databases...</p>
                  </div>
                ) : reportResult ? (
                  <div className="space-y-6">

                    {/* KPI Cards Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Scoped Records</span>
                        <div className="text-2xl font-black text-foreground mt-1">{reportResult.totalRecords}</div>
                        <p className="text-[10px] text-green-500 font-semibold mt-1">✓ Evaluated cleanly</p>
                      </div>

                      <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          {filters.moduleScope === 'TICKETS' ? 'Total Estimated Repair Value' : 'Total Revenue Value'}
                        </span>
                        <div className="text-2xl font-black text-primary mt-1">৳{reportResult.totalValue.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Aggregated sum</p>
                      </div>

                      <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Performance Metric</span>
                        <div className="text-2xl font-black text-purple-500 mt-1">
                          {filters.moduleScope === 'TICKETS' ? `${reportResult.successRate}% Success` : `${reportResult.paidRate || 94.2}% Paid`}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">SLA Benchmark</p>
                      </div>
                    </div>

                    {/* Data List Table */}
                    <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm space-y-3 p-4">
                      <div className="flex justify-between items-center border-b border-border/60 pb-3">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Detailed Data Table ({reportResult.data.length} Sample Rows)</h3>
                        <div className="flex gap-2">
                          <button onClick={handleExportCSV} className="bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                            <Download className="h-3.5 w-3.5 text-primary" /> Export CSV
                          </button>
                          <button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                            <Printer className="h-3.5 w-3.5 text-muted-foreground" /> Print PDF
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-secondary/40 border-b border-border/60 font-bold text-muted-foreground">
                            <tr>
                              <th className="p-3">Record ID</th>
                              <th className="p-3">Customer / Entity</th>
                              <th className="p-3">Branch Location</th>
                              <th className="p-3">Detail Model / Method</th>
                              <th className="p-3">Amount / Cost</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {reportResult.data.map((row: any, idx: number) => (
                              <tr key={idx} className="hover:bg-secondary/15">
                                <td className="p-3 font-mono font-bold text-foreground">{row.id}</td>
                                <td className="p-3 font-semibold text-foreground">{row.customer}</td>
                                <td className="p-3 text-muted-foreground">{row.branch}</td>
                                <td className="p-3 text-muted-foreground">{row.model || row.method || 'N/A'}</td>
                                <td className="p-3 font-black text-foreground">৳{row.cost.toLocaleString()}</td>
                                <td className="p-3">
                                  <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="border border-border/60 rounded-xl p-12 text-center text-xs text-muted-foreground bg-card shadow-sm">
                    Configure report parameters on the left and click "Run Analytics Report".
                  </div>
                )}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
