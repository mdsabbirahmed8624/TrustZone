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
  Siren
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api, BookingModel, DeviceIntakeDetail, BookingInvoiceModel, BookingPaymentRecord, BookingWarrantyModel, TechnicianAssignmentRecord, SmartReminderRecord, BookingIntelligenceReport } from '@/lib/api';

// Available Time Slots
const TIME_SLOTS_30 = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM'
];

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

  // Active View Tab: 'list' | 'kanban' | 'tech_workspace' | 'intelligence' | 'calendar' | 'trash'
  const [activeTab, setActiveTab] = useState<'list' | 'kanban' | 'tech_workspace' | 'intelligence' | 'calendar' | 'trash'>('list');

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [intelligenceReport, setIntelligenceReport] = useState<BookingIntelligenceReport | null>(null);

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
  const [showQRModal, setShowQRModal] = useState<BookingModel | null>(null);

  const [editingBooking, setEditingBooking] = useState<BookingModel | null>(null);
  const [viewingBooking, setViewingBooking] = useState<BookingModel | null>(null);

  // Phase 7 Escalation Reason
  const [escalationReason, setEscalationReason] = useState('SLA Exceeded threshold (>48 Hours) - Urgent Manager Intervention Required');

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
    } catch (err) {
      console.error('Failed to load bookings data', err);
    } finally {
      setLoading(false);
    }
  };

  // Module 2: Auto-Assign Job
  const handleAutoAssign = async (bookingId: string) => {
    setLoading(true);
    try {
      const res = await api.bookings.autoAssignJob(bookingId);
      if (res.success && res.data) {
        alert(`Job #${bookingId} Auto-Assigned to ${res.data.technicianName} based on skill match & workload!`);
        loadData();
      }
    } catch (err) {
      console.error('Auto-assign failed', err);
    } finally {
      setLoading(false);
    }
  };

  // Module 4 & 8: Escalate SLA Breach
  const handleEscalateSLASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEscalationModal) return;
    setLoading(true);
    try {
      const res = await api.bookings.escalateSLABreach(showEscalationModal.id, escalationReason);
      if (res.success) {
        alert(`SLA Breach Escalated to Operations Manager for #${showEscalationModal.id}! Priority upgraded to URGENT.`);
        setShowEscalationModal(null);
        loadData();
      }
    } catch (err) {
      console.error('Escalation failed', err);
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
    setShowQRModal(null);
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
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-foreground tracking-tight">Enterprise Booking Desk</h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Phase 7 Technician Workspace & SLA Intelligence
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live work queue, SLA breach escalation, skill-based auto-assignment, and booking intelligence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
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
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'kanban' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/40 text-muted-foreground'
                }`}
              >
                <Kanban className="h-4 w-4" />
                Live Work Queue Kanban
              </button>

              <button
                onClick={() => setActiveTab('tech_workspace')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'tech_workspace' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/40 text-muted-foreground'
                }`}
              >
                <Gauge className="h-4 w-4" />
                Technician Workspace
              </button>

              <button
                onClick={() => setActiveTab('intelligence')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'intelligence' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/40 text-muted-foreground'
                }`}
              >
                <Brain className="h-4 w-4" />
                Booking Intelligence
              </button>
            </div>
          </div>

          {/* TAB 1: LIST / REGISTRY */}
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
                      <th className="p-4">SLA Timer</th>
                      <th className="p-4 text-right">Phase 7 Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {paginatedBookings.map((b) => {
                      const isOverdue = b.priority === 'URGENT';

                      return (
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
                          <td className="p-4 font-mono">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOverdue ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {isOverdue ? 'CRITICAL SLA BREACH' : '18h 42m Remaining'}
                            </span>
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Auto-Assign Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAutoAssign(b.id); }}
                                className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                title="Auto-Assign Job by Skill Match"
                              >
                                <Zap className="h-3 w-3" /> Auto-Assign
                              </button>

                              {/* SLA Escalation Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowEscalationModal(b); }}
                                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                title="Escalate SLA Breach to Manager"
                              >
                                <Siren className="h-4 w-4" />
                              </button>

                              <button onClick={(e) => handleViewClick(b, e)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg cursor-pointer">
                                <Eye className="h-4 w-4" />
                              </button>

                              <button onClick={(e) => handleDeleteClick(b.id, e)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE WORK QUEUE KANBAN (Module 3) */}
          {activeTab === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
              {['PENDING', 'CONFIRMED', 'CHECKED_IN', 'DIAGNOSIS_STARTED', 'WAITING_PARTS', 'REPAIR_STARTED', 'READY_FOR_PICKUP'].map((colStatus) => {
                const colBookings = activeBookings.filter(b => b.status === colStatus);
                const colConfig = STATUS_MAP[colStatus] || { label: colStatus, color: 'bg-secondary' };

                return (
                  <div key={colStatus} className="p-3 bg-card border border-border/60 rounded-xl space-y-3 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="font-bold text-xs text-foreground uppercase">{colConfig.label}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-secondary text-foreground">
                        {colBookings.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {colBookings.map(b => (
                        <div
                          key={b.id}
                          onClick={() => handleViewClick(b)}
                          className="p-3 bg-secondary/30 border border-border/60 rounded-lg hover:border-primary transition-all cursor-pointer space-y-1 text-xs"
                        >
                          <div className="font-bold text-primary font-mono">{b.id}</div>
                          <div className="font-semibold text-foreground">{b.deviceBrand} {b.deviceModel}</div>
                          <div className="text-[10px] text-muted-foreground">{b.customerName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: TECHNICIAN WORKSPACE (Module 1) */}
          {activeTab === 'tech_workspace' && (
            <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" /> Lead Engineer Workspace — Tariq Zaman (L4)
                  </h3>
                  <p className="text-xs text-muted-foreground">Active job timers, priority queue, and diagnostic notes.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                  Status: Available for Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-bold">
                <div className="p-4 bg-secondary/20 border border-border rounded-xl space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px]">Assigned Active Jobs</span>
                  <div className="text-xl text-primary font-extrabold">4 Repairs</div>
                </div>
                <div className="p-4 bg-secondary/20 border border-border rounded-xl space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px]">Completed Today</span>
                  <div className="text-xl text-emerald-400 font-extrabold">8 Devices</div>
                </div>
                <div className="p-4 bg-secondary/20 border border-border rounded-xl space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px]">SLA Overdue Warning</span>
                  <div className="text-xl text-amber-400 font-extrabold">1 Critical</div>
                </div>
                <div className="p-4 bg-secondary/20 border border-border rounded-xl space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px]">Productivity Score</span>
                  <div className="text-xl text-purple-400 font-extrabold">98.4 / 100</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BOOKING INTELLIGENCE (Module 6) */}
          {activeTab === 'intelligence' && intelligenceReport && (
            <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-6 shadow-sm text-xs">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-400" /> Booking Intelligence & Operations Analytics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/20 border border-border rounded-xl space-y-2">
                  <span className="font-bold text-primary uppercase text-[10px]">Top Device Repairs</span>
                  {intelligenceReport.topDevices.map((d, i) => (
                    <div key={i} className="flex justify-between font-semibold">
                      <span>{d.model}</span>
                      <span className="font-mono text-emerald-400">{d.count} Units ({d.percentage}%)</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-secondary/20 border border-border rounded-xl space-y-2">
                  <span className="font-bold text-primary uppercase text-[10px]">Top Repair Categories</span>
                  {intelligenceReport.topRepairs.map((r, i) => (
                    <div key={i} className="flex justify-between font-semibold">
                      <span>{r.category}</span>
                      <span className="font-mono text-purple-400">৳{r.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-secondary/20 border border-border rounded-xl space-y-2">
                  <span className="font-bold text-primary uppercase text-[10px]">Customer Metrics</span>
                  <div className="flex justify-between font-semibold">
                    <span>Repeat Customer Rate:</span>
                    <span className="font-mono text-emerald-400">{intelligenceReport.repeatCustomerRate}%</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Avg Customer Wait:</span>
                    <span className="font-mono text-cyan-400">{intelligenceReport.avgWaitTimeMinutes} Minutes</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Avg Repair Duration:</span>
                    <span className="font-mono text-amber-400">{intelligenceReport.avgRepairTimeMinutes} Minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODULE 4 & 8: ESCALATE SLA BREACH MODAL */}
      {showEscalationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Siren className="h-5 w-5 text-rose-400" /> Escalate SLA Breach — #{showEscalationModal.id}
              </h3>
              <button onClick={() => setShowEscalationModal(null)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEscalateSLASubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 space-y-1">
                <span className="font-bold block">Critical Operations Alert</span>
                <p className="text-[11px]">Escalating will upgrade priority to URGENT and notify Operations Manager and Branch Supervisor.</p>
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Escalation Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button type="button" onClick={() => setShowEscalationModal(null)} className="px-4 py-2 bg-secondary text-foreground rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-lg cursor-pointer">
                  {loading ? 'Escalating...' : 'Escalate to Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* CREATE / EDIT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl bg-card border border-border/80 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h2 className="text-lg font-extrabold text-foreground">{editingBooking ? `Edit #${editingBooking.id}` : 'Create Enterprise Booking'}</h2>
              <button onClick={closeModals} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.customerName}
                    onChange={(e) => setFormState({ ...formState, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Customer Phone *</label>
                  <input
                    type="text"
                    required
                    value={formState.customerPhone}
                    onChange={(e) => setFormState({ ...formState, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Device Model *</label>
                  <input
                    type="text"
                    required
                    value={formState.deviceModel}
                    onChange={(e) => setFormState({ ...formState, deviceModel: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                <button type="button" onClick={closeModals} className="px-4 py-2 bg-secondary text-foreground text-xs rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
                  {loading ? 'Saving...' : editingBooking ? 'Update Record' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
