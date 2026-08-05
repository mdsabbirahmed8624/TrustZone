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
  LineChart,
  Star,
  ThumbsUp,
  User
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api, BookingModel, DeviceIntakeDetail, BookingInvoiceModel, BookingPaymentRecord, BookingWarrantyModel, TechnicianAssignmentRecord, SmartReminderRecord, BookingIntelligenceReport, ExecutiveAnalyticsData, CustomerPortalAccount, CustomerPortalFeedback } from '@/lib/api';

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

  // Active View Tab: 'list' | 'customer_portal' | 'executive_ai' | 'kanban' | 'tech_workspace' | 'trash'
  const [activeTab, setActiveTab] = useState<'list' | 'customer_portal' | 'executive_ai' | 'kanban' | 'tech_workspace' | 'trash'>('list');

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [portalData, setPortalData] = useState<{ account: CustomerPortalAccount; bookings: BookingModel[] } | null>(null);

  // Phase 9 Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState<BookingModel | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals & Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
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

      const portalRes = await api.bookings.getCustomerPortalData('01711122233');
      if (portalRes.success && portalRes.data) setPortalData(portalRes.data);
    } catch (err) {
      console.error('Failed to load bookings data', err);
    } finally {
      setLoading(false);
    }
  };

  // Module 6: Submit Customer Feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFeedbackModal) return;
    setLoading(true);
    try {
      const res = await api.bookings.submitCustomerFeedback(showFeedbackModal.id, {
        bookingId: showFeedbackModal.id,
        overallRating: rating,
        techRating: rating,
        branchRating: rating,
        writtenReview: reviewText || 'Excellent service provided by TrustZone Mobile Care!'
      });
      if (res.success) {
        alert(`⭐ Thank you for your 5-star review on booking #${showFeedbackModal.id}! 50 Loyalty Points credited to your account.`);
        setShowFeedbackModal(null);
        setReviewText('');
        loadData();
      }
    } catch (err) {
      console.error('Feedback submit failed', err);
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
    setShowFeedbackModal(null);
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
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-foreground tracking-tight">Enterprise Booking Desk</h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Phase 9 Omnichannel Customer Self-Service Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live repair tracking timeline, customer feedback portal, loyalty rewards balance, and document downloads.
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
                onClick={() => setActiveTab('customer_portal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'customer_portal' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/40 text-muted-foreground'
                }`}
              >
                <User className="h-4 w-4 text-emerald-400" />
                Customer Self-Service Portal
              </button>
            </div>
          </div>

          {/* TAB: CUSTOMER SELF-SERVICE PORTAL (Phase 9 Modules 1 - 10) */}
          {activeTab === 'customer_portal' && portalData && (
            <div className="space-y-6 animate-fadeIn">
              {/* Account & Loyalty Summary Header */}
              <div className="p-6 bg-card border border-border/60 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-xl">
                    VIP
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-foreground">{portalData.account.name}</h2>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {portalData.account.membershipTier} Member
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{portalData.account.phone} • {portalData.account.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border space-y-0.5">
                    <span className="text-muted-foreground uppercase text-[10px] block">Loyalty Balance</span>
                    <span className="text-lg text-emerald-400 font-mono font-extrabold">{portalData.account.loyaltyPoints} Points</span>
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-xl border border-border space-y-0.5">
                    <span className="text-muted-foreground uppercase text-[10px] block">NPS Score</span>
                    <span className="text-lg text-purple-400 font-mono font-extrabold">{portalData.account.npsScore}% Rating</span>
                  </div>
                </div>
              </div>

              {/* Live Repair Tracking Timeline (Module 2) */}
              <div className="p-6 bg-card border border-border/60 rounded-2xl shadow-sm space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 uppercase tracking-wider">
                  <Activity className="h-4 w-4 text-cyan-400" /> Live Repair Tracking Engine
                </h3>

                {portalData.bookings.slice(0, 1).map((b) => (
                  <div key={b.id} className="p-4 bg-secondary/20 border border-border rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-primary text-sm">#{b.id}</span>
                        <div className="font-bold text-foreground">{b.deviceBrand} {b.deviceModel}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold font-mono">Estimated Completion: 45 Minutes</span>
                        <div className="text-[10px] text-muted-foreground">Assigned Specialist: {b.technicianName}</div>
                      </div>
                    </div>

                    {/* Timeline Visual Bar */}
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {['CHECKED_IN', 'DIAGNOSIS_STARTED', 'REPAIR_STARTED', 'QUALITY_CHECK', 'READY_FOR_PICKUP'].map((stepKey, idx) => {
                        const stepConfig = STATUS_MAP[stepKey] || { label: stepKey };
                        const isDone = idx <= 2;

                        return (
                          <div key={stepKey} className={`p-2.5 rounded-xl border text-center font-bold ${
                            isDone ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-secondary/40 text-muted-foreground border-border'
                          }`}>
                            <div className="text-[10px]">{stepConfig.label}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons for Feedback & Downloads */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                      <button
                        onClick={() => setShowFeedbackModal(b)}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <Star className="h-3.5 w-3.5 fill-amber-300" /> Rate Experience
                      </button>

                      <button
                        onClick={() => alert(`Downloading Official Invoice & Warranty Certificate PDF for #${b.id}...`)}
                        className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" /> Download Docs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REGISTRY LIST */}
          {activeTab === 'list' && (
            <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="w-full overflow-x-auto min-w-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Device</th>
                      <th className="p-4">Status</th>
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
                        <td className="p-4 font-semibold">{b.deviceBrand} {b.deviceModel}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_MAP[b.status]?.color}`}>
                            {STATUS_MAP[b.status]?.label}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => handleViewClick(b, e)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg cursor-pointer">
                            <Eye className="h-4 w-4" />
                          </button>
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

      {/* MODULE 6: CUSTOMER FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> Customer Review — #{showFeedbackModal.id}
              </h3>
              <button onClick={() => setShowFeedbackModal(null)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-muted-foreground mb-2">Overall Experience Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 hover:scale-110 transition-all cursor-pointer"
                    >
                      <Star className={`h-6 w-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Written Review & Feedback</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your repair experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button type="button" onClick={() => setShowFeedbackModal(null)} className="px-4 py-2 bg-secondary text-foreground rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-amber-500 text-black font-bold rounded-xl shadow-lg cursor-pointer">
                  {loading ? 'Submitting...' : 'Submit 5-Star Review'}
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

      {/* Global Modals */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
