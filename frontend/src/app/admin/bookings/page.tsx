'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarRange,
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Wrench,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  RotateCcw,
  Copy,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Phone,
  Mail,
  MapPin,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Zap,
  Building2,
  CreditCard,
  Tag,
  Paperclip,
  Activity,
  Layers,
  BarChart2,
  PieChart,
  Sliders,
  Bell,
  Check,
  X,
  Send,
  MessageSquare,
  Pin,
  ImageIcon,
  FileCode,
  Flame,
  Grid,
  ListFilter,
  UserPlus,
  Cpu,
  QrCode,
  Printer,
  FileCheck,
  Battery,
  PenTool,
  CheckSquare2,
  LogIn,
  Camera,
  Maximize2,
  FileSignature,
  Receipt,
  Wallet,
  Gift,
  Award,
  PackageCheck,
  KeyRound,
  Shield,
  MessageCircle,
  History,
  Bot,
  UserCheck2,
  Share2,
  Timer,
  Kanban,
  Brain,
  Gauge,
  Siren,
  Sparkle,
  Target,
  LineChart
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api, BookingModel, DeviceIntakeDetail, BookingInvoiceModel, BookingPaymentRecord, BookingWarrantyModel, TechnicianAssignmentRecord, SmartReminderRecord, BookingIntelligenceReport, ExecutiveAnalyticsData } from '@/lib/api';

// Workflow Lifecycle Status Configuration
const LIFECYCLE_STEPS = [
  { key: 'PENDING', label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { key: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { key: 'CUSTOMER_ARRIVED', label: 'Arrived', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { key: 'CHECKED_IN', label: 'Checked In', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { key: 'DIAGNOSIS_STARTED', label: 'Diagnosing', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { key: 'WAITING_PARTS', label: 'Waiting Parts', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { key: 'REPAIR_STARTED', label: 'Repairing', color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  { key: 'QUALITY_CHECK', label: 'QC Test', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
  { key: 'READY_FOR_PICKUP', label: 'Ready', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { key: 'DELIVERED', label: 'Delivered', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { key: 'COMPLETED', label: 'Completed', color: 'bg-emerald-600/15 text-emerald-600 border-emerald-600/30' },
];

const ALTERNATIVE_STATUSES = [
  { key: 'CANCELLED', label: 'Cancelled', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { key: 'RESCHEDULED', label: 'Rescheduled', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
  { key: 'NO_SHOW', label: 'No Show', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = [...LIFECYCLE_STEPS, ...ALTERNATIVE_STATUSES].reduce((acc, curr) => {
  acc[curr.key] = { label: curr.label, color: curr.color };
  return acc;
}, {} as Record<string, { label: string; color: string }>);

export default function EnterpriseBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Active View Tab: 'list' | 'executive_ai' | 'kanban' | 'tech_workspace' | 'intelligence' | 'trash'
  const [activeTab, setActiveTab] = useState<'list' | 'executive_ai' | 'kanban' | 'tech_workspace' | 'intelligence' | 'trash'>('list');

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [intelligenceReport, setIntelligenceReport] = useState<BookingIntelligenceReport | null>(null);
  const [executiveData, setExecutiveData] = useState<ExecutiveAnalyticsData | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals & Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIntakeWizardModal, setShowIntakeWizardModal] = useState<BookingModel | null>(null);
  const [showPaymentCenterModal, setShowPaymentCenterModal] = useState<BookingModel | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<BookingModel | null>(null);
  const [showPickupModal, setShowPickupModal] = useState<BookingModel | null>(null);
  const [showReassignModal, setShowReassignModal] = useState<BookingModel | null>(null);
  const [showReminderModal, setShowReminderModal] = useState<BookingModel | null>(null);
  const [showEscalationModal, setShowEscalationModal] = useState<BookingModel | null>(null);

  const [editingBooking, setEditingBooking] = useState<BookingModel | null>(null);
  const [viewingBooking, setViewingBooking] = useState<BookingModel | null>(null);

  // Form State
  const [formState, setFormState] = useState<Partial<BookingModel>>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerType: 'INDIVIDUAL',
    deviceBrand: 'Apple',
    deviceModel: '',
    imei: '',
    serialNumber: '',
    color: '',
    problemCategory: 'SCREEN_DISPLAY',
    problemDescription: '',
    priority: 'MEDIUM',
    warrantyStatus: 'OUT_OF_WARRANTY',
    waterDamage: false,
    physicalDamage: false,
    estimatedCost: 0,
    advanceAmount: 0,
    paymentMethod: 'CASH',
    discount: 0,
    couponCode: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
    slotDuration: 30,
    technicianId: 'tech-1',
    technicianName: 'Tariq Zaman (Lead L4)',
    branchId: 'd1111111-1111-1111-1111-111111111111',
    branchName: 'Dhanmondi HQ',
    serviceType: 'WALK_IN',
    pickupAddress: '',
    deliveryAddress: '',
    notes: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, branchFilter, dateFilter]);

  // Handle URL Query Params
  useEffect(() => {
    if (bookings.length === 0) return;
    const viewId = searchParams.get('id');
    const editId = searchParams.get('edit');

    if (viewId) {
      const match = bookings.find(b => b.id === viewId);
      if (match) setViewingBooking(match);
    } else if (editId) {
      const match = bookings.find(b => b.id === editId);
      if (match) handleEditClick(match);
    }
  }, [searchParams, bookings]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.bookings.list({
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        branchId: branchFilter,
        date: dateFilter,
      });
      if (res.success && res.data) setBookings(res.data);

      const statsRes = await api.bookings.getDashboardStats();
      if (statsRes.success && statsRes.data) setStats(statsRes.data);

      const intelRes = await api.bookings.getBookingIntelligence();
      if (intelRes.success && intelRes.data) setIntelligenceReport(intelRes.data);

      const execRes = await api.bookings.getExecutiveIntelligence();
      if (execRes.success && execRes.data) setExecutiveData(execRes.data);
    } catch (err) {
      console.error('Failed to load bookings data', err);
    } finally {
      setLoading(false);
    }
  };

  // Module 10: Trigger AI Auto-Optimization
  const handleTriggerAIOptimization = async () => {
    setLoading(true);
    try {
      const res = await api.bookings.triggerAIAutoOptimization();
      if (res.success && res.data) {
        alert(`✨ AI Optimization Complete!\n${res.data.message}`);
        loadData();
      }
    } catch (err) {
      console.error('AI optimization failed', err);
    } finally {
      setLoading(false);
    }
  };

  // View Details Modal
  const handleViewClick = (booking: BookingModel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingBooking(booking);
    window.history.pushState({}, '', `/admin/bookings?id=${booking.id}`);
  };

  // Edit Modal
  const handleEditClick = (booking: BookingModel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingBooking(booking);
    setFormState(booking);
    setShowCreateModal(true);
    window.history.pushState({}, '', `/admin/bookings?edit=${booking.id}`);
  };

  // Close Modals
  const closeModals = () => {
    setViewingBooking(null);
    setShowCreateModal(false);
    setEditingBooking(null);
    setShowIntakeWizardModal(null);
    setShowPaymentCenterModal(null);
    setShowInvoiceModal(null);
    setShowPickupModal(null);
    setShowReassignModal(null);
    setShowReminderModal(null);
    setShowEscalationModal(null);
    window.history.pushState({}, '', `/admin/bookings`);
  };

  // Save Booking
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBooking) {
        await api.bookings.update(editingBooking.id, formState);
      } else {
        await api.bookings.create(formState);
      }
      closeModals();
      loadData();
    } catch (err) {
      console.error('Failed to save booking', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Move booking to Trash Bin?')) return;
    await api.bookings.delete(id);
    loadData();
  };

  // Filtered Lists
  const activeBookings = useMemo(() => {
    return bookings.filter(b => activeTab === 'trash' ? b.isDeleted : !b.isDeleted);
  }, [bookings, activeTab]);

  const searchedBookings = useMemo(() => {
    if (!searchTerm.trim()) return activeBookings;
    const q = searchTerm.toLowerCase();
    return activeBookings.filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.deviceModel.toLowerCase().includes(q)
    );
  }, [activeBookings, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(searchedBookings.length / itemsPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return searchedBookings.slice(start, start + itemsPerPage);
  }, [searchedBookings, currentPage]);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-foreground tracking-tight">Enterprise Booking Desk</h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Phase 8 AI Executive Intelligence Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Predictive revenue analytics, AI risk detection engine, and automated workload optimization.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Module 10: 1-Click AI Auto Optimization */}
              <button
                onClick={handleTriggerAIOptimization}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/20 hover:bg-purple-700 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Run AI Auto-Optimization
              </button>

              <button
                onClick={() => { setEditingBooking(null); setShowCreateModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                New Appointment
              </button>

              <button
                onClick={loadData}
                className="p-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl border border-border transition-all cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3 gap-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'list' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/40 text-muted-foreground'
                }`}
              >
                <Layers className="h-4 w-4" />
                Bookings Registry ({searchedBookings.length})
              </button>

              <button
                onClick={() => setActiveTab('executive_ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'executive_ai' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/40 text-muted-foreground'
                }`}
              >
                <Sparkles className="h-4 w-4 text-purple-300" />
                Executive AI Intelligence
              </button>

              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'kanban' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/40 text-muted-foreground'
                }`}
              >
                <Kanban className="h-4 w-4" />
                Live Work Queue
              </button>
            </div>
          </div>

          {/* TAB: EXECUTIVE AI INTELLIGENCE (Phase 8 Modules 1 - 11) */}
          {activeTab === 'executive_ai' && executiveData && (
            <div className="space-y-6 animate-fadeIn">
              {/* Executive Dashboard KPI Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-card border border-border/60 rounded-2xl shadow-sm space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="font-bold uppercase tracking-wider text-[10px]">Today's Revenue</span>
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-emerald-400">৳{executiveData.todayRevenue.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +12.4% vs Yesterday
                  </div>
                </div>

                <div className="p-4 bg-card border border-border/60 rounded-2xl shadow-sm space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="font-bold uppercase tracking-wider text-[10px]">Active Bookings</span>
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-primary">{executiveData.activeBookings} Jobs</div>
                  <div className="text-[10px] text-muted-foreground">{executiveData.waitingCustomers} Waiting in Lobby</div>
                </div>

                <div className="p-4 bg-card border border-border/60 rounded-2xl shadow-sm space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="font-bold uppercase tracking-wider text-[10px]">Tech Utilization</span>
                    <Gauge className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-purple-400">{executiveData.techUtilizationRate}%</div>
                  <div className="text-[10px] text-purple-400 font-bold">Optimal Efficiency</div>
                </div>

                <div className="p-4 bg-card border border-border/60 rounded-2xl shadow-sm space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="font-bold uppercase tracking-wider text-[10px]">CSAT & Repeat Rate</span>
                    <Award className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-amber-400">{executiveData.csatScore} / 5.0</div>
                  <div className="text-[10px] text-muted-foreground">{executiveData.repeatCustomerRate}% Repeat Customers</div>
                </div>
              </div>

              {/* Dynamic AI Insights Feed (Module 11) */}
              <div className="p-6 bg-card border border-border/60 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-purple-400" /> Dynamic AI Executive Insights Panel
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {executiveData.aiInsights.map((insight) => (
                    <div key={insight.id} className="p-4 bg-secondary/20 border border-border rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-purple-500/20 text-purple-300">
                          {insight.type}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">Impact: {insight.impactScore}/100</span>
                      </div>
                      <div className="font-bold text-foreground">{insight.title}</div>
                      <p className="text-muted-foreground text-[11px]">{insight.description}</p>
                      <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg font-bold text-primary text-[10px]">
                        Action: {insight.suggestedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch Comparison & Predictive Forecast (Modules 3 & 8) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Branch Performance Matrix */}
                <div className="p-6 bg-card border border-border/60 rounded-2xl shadow-sm space-y-4">
                  <h4 className="font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Multi-Branch Operational Matrix
                  </h4>
                  <div className="space-y-3">
                    {executiveData.branchComparison.map((b, i) => (
                      <div key={i} className="p-3 bg-secondary/20 border border-border rounded-xl flex justify-between items-center">
                        <div>
                          <div className="font-bold text-foreground">{b.branchName}</div>
                          <div className="text-[10px] text-muted-foreground">{b.repairCount} Repairs • Avg {b.avgTimeMin}m</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400 font-mono">৳{b.revenue.toLocaleString()}</div>
                          <div className="text-[10px] text-amber-400 font-bold">CSAT: {b.csat} / 5.0</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Failure Trends */}
                <div className="p-6 bg-card border border-border/60 rounded-2xl shadow-sm space-y-4">
                  <h4 className="font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-cyan-400" /> Device Failure & Defect Trends
                  </h4>
                  <div className="space-y-3">
                    {executiveData.deviceFailureTrends.map((d, i) => (
                      <div key={i} className="p-3 bg-secondary/20 border border-border rounded-xl flex justify-between items-center">
                        <div>
                          <div className="font-bold text-foreground">{d.brand} {d.model}</div>
                          <div className="text-[10px] text-muted-foreground">{d.failureCount} Diagnostic Cases</div>
                        </div>
                        <div className="text-right font-mono font-bold text-rose-400">
                          +{d.monthlyChangePct}% Monthly Spike
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIST REGISTRY */}
          {activeTab === 'list' && (
            <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="w-full overflow-x-auto min-w-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Device</th>
                      <th className="p-4">Assigned Tech</th>
                      <th className="p-4">Est. Cost</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {paginatedBookings.map((b) => (
                      <tr key={b.id} onClick={(e) => handleViewClick(b, e)} className="hover:bg-secondary/20 transition-all cursor-pointer">
                        <td className="p-4 font-mono font-bold text-primary">{b.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-foreground">{b.customerName}</div>
                          <div className="text-[10px] text-muted-foreground">{b.customerPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold">{b.deviceBrand} {b.deviceModel}</div>
                        </td>
                        <td className="p-4 font-semibold text-foreground">{b.technicianName}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">৳{b.estimatedCost.toLocaleString()}</td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={(e) => handleViewClick(b, e)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg cursor-pointer">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={(e) => handleDeleteClick(b.id, e)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* VIEW SPECIFICATION MODAL */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground">Booking Specification #{viewingBooking.id}</h3>
              <button onClick={closeModals} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
                <span className="font-bold text-primary block uppercase tracking-wider text-[10px]">Customer Specs</span>
                <div className="font-bold text-foreground">{viewingBooking.customerName}</div>
                <div className="text-muted-foreground">{viewingBooking.customerPhone}</div>
              </div>

              <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
                <span className="font-bold text-primary block uppercase tracking-wider text-[10px]">Device & Tech</span>
                <div className="font-bold text-foreground">{viewingBooking.deviceBrand} {viewingBooking.deviceModel}</div>
                <div className="text-muted-foreground">Assigned: {viewingBooking.technicianName}</div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4 flex justify-end">
              <button onClick={closeModals} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl cursor-pointer">
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
