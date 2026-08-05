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
  Shield
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api, BookingModel, DeviceIntakeDetail, BookingInvoiceModel, BookingPaymentRecord, BookingWarrantyModel } from '@/lib/api';

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

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'analytics' | 'reports' | 'trash'>('list');
  const [calendarViewMode, setCalendarViewMode] = useState<'day' | 'week' | 'month'>('day');

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // Modals & Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIntakeWizardModal, setShowIntakeWizardModal] = useState<BookingModel | null>(null);
  const [showPaymentCenterModal, setShowPaymentCenterModal] = useState<BookingModel | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<BookingModel | null>(null);
  const [showPickupModal, setShowPickupModal] = useState<BookingModel | null>(null);
  const [showRefundModal, setShowRefundModal] = useState<BookingModel | null>(null);
  const [showQRModal, setShowQRModal] = useState<BookingModel | null>(null);

  const [editingBooking, setEditingBooking] = useState<BookingModel | null>(null);
  const [viewingBooking, setViewingBooking] = useState<BookingModel | null>(null);
  const [statusModalBooking, setStatusModalBooking] = useState<BookingModel | null>(null);

  // Phase 5 Payment Center Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'CARD' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'BANK_TRANSFER'>('BKASH');
  const [payType, setPayType] = useState<'ADVANCE' | 'PARTIAL' | 'FULL' | 'DUE_COLLECTION'>('FULL');
  const [payTxnId, setPayTxnId] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Phase 5 Pickup & OTP Verification State
  const [pickupOtp, setPickupOtp] = useState('');
  const [deliveredByStaff, setDeliveredByStaff] = useState('Senior Desk Staff');

  // Phase 5 Refund State
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');

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
      if (match) {
        setViewingBooking(match);
      }
    } else if (editId) {
      const match = bookings.find(b => b.id === editId);
      if (match) {
        handleEditClick(match);
      }
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
      if (res.success && res.data) {
        setBookings(res.data);
      }
      const statsRes = await api.bookings.getDashboardStats();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load bookings data', err);
    } finally {
      setLoading(false);
    }
  };

  // Module 1 & 2: Process Payment Handler
  const handleProcessPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentCenterModal || payAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.bookings.processPayment(showPaymentCenterModal.id, {
        bookingId: showPaymentCenterModal.id,
        invoiceId: showPaymentCenterModal.invoiceData?.invoiceNumber || `INV-${showPaymentCenterModal.id}`,
        amount: payAmount,
        paymentMethod: payMethod,
        type: payType,
        transactionId: payTxnId || `TXN-${Date.now().toString().slice(-6)}`,
        cashierName: 'Front Desk Cashier',
        notes: payNotes
      });
      if (res.success) {
        alert(`Payment of ৳${payAmount} collected successfully via ${payMethod}! Invoice updated.`);
        setShowPaymentCenterModal(null);
        setPayAmount(0);
        setPayTxnId('');
        setPayNotes('');
        loadData();
      }
    } catch (err) {
      console.error('Failed to process payment', err);
    } finally {
      setLoading(false);
    }
  };

  // Module 7 & 8: Process Customer Pickup & Auto Activate Warranty
  const handleCustomerPickupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPickupModal) return;
    setLoading(true);
    try {
      const res = await api.bookings.processCustomerPickup(showPickupModal.id, pickupOtp || 'OTP-9988', deliveredByStaff);
      if (res.success) {
        alert(`Pickup Verified & Delivered! 90-Day Hardware Warranty Auto-Activated for #${showPickupModal.id}.`);
        setShowPickupModal(null);
        setPickupOtp('');
        loadData();
      }
    } catch (err) {
      console.error('Failed customer pickup', err);
    } finally {
      setLoading(false);
    }
  };

  // Module 6: Process Refund Handler
  const handleProcessRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRefundModal || refundAmount <= 0) return;
    setLoading(true);
    try {
      const res = await api.bookings.processRefund(showRefundModal.id, refundAmount, refundReason || 'Customer requested cancellation.');
      if (res.success) {
        alert(`Refund of ৳${refundAmount} processed & audit trail updated for #${showRefundModal.id}.`);
        setShowRefundModal(null);
        setRefundAmount(0);
        setRefundReason('');
        loadData();
      }
    } catch (err) {
      console.error('Failed refund process', err);
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
    setShowRefundModal(null);
    setShowQRModal(null);
    setStatusModalBooking(null);
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
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-foreground tracking-tight">Enterprise Booking Desk</h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Phase 5 Financial Workflow Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Payment Center, Multi-Method Invoicing, OTP Pickup Verification, and Auto Warranty Activation.
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
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'calendar' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/40 text-muted-foreground'
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                Calendar Scheduler
              </button>
            </div>
          </div>

          {/* DATA TABLE */}
          {activeTab === 'list' && (
            <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="w-full overflow-x-auto min-w-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Device</th>
                      <th className="p-4">Appointment</th>
                      <th className="p-4">Financial Status</th>
                      <th className="p-4">Est. Cost</th>
                      <th className="p-4 text-right">Phase 5 Financial Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {paginatedBookings.map((b) => {
                      const dueAmount = Math.max(0, (b.estimatedCost * 1.05) - (b.advanceAmount || 0));
                      const isPaid = dueAmount === 0;

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
                          <td className="p-4">{b.appointmentDate} ({b.appointmentTime})</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {isPaid ? 'PAID IN FULL' : `DUE: ৳${dueAmount.toLocaleString()}`}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-400">৳{b.estimatedCost.toLocaleString()}</td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Module 1 & 2: Payment Center Action Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowPaymentCenterModal(b); setPayAmount(dueAmount > 0 ? dueAmount : 500); }}
                                className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                title="Open Payment Center"
                              >
                                <CreditCard className="h-3 w-3" /> Collect Payment
                              </button>

                              {/* Module 3 & 4: View Invoice Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowInvoiceModal(b); }}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
                                title="View & Print Invoice"
                              >
                                <Receipt className="h-4 w-4" />
                              </button>

                              {/* Module 7: Pickup Delivery Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowPickupModal(b); }}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
                                title="Customer Pickup & OTP Verification"
                              >
                                <PackageCheck className="h-4 w-4" />
                              </button>

                              {/* Module 6: Refund Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowRefundModal(b); setRefundAmount(b.advanceAmount || 500); }}
                                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                title="Process Financial Refund"
                              >
                                <RotateCcw className="h-4 w-4" />
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

        </main>
      </div>

      {/* MODULE 1 & 2: PAYMENT CENTER MODAL */}
      {showPaymentCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" /> Payment Collection Center — #{showPaymentCenterModal.id}
              </h3>
              <button onClick={() => setShowPaymentCenterModal(null)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPaymentSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-muted-foreground">
                  <span>Customer: {showPaymentCenterModal.customerName}</span>
                  <span>Phone: {showPaymentCenterModal.customerPhone}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 font-mono text-sm pt-1">
                  <span>Total Repair Estimate:</span>
                  <span>৳{(showPaymentCenterModal.estimatedCost * 1.05).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Payment Type</label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-semibold"
                  >
                    <option value="ADVANCE">Advance Deposit</option>
                    <option value="PARTIAL">Partial Payment</option>
                    <option value="FULL">Full Settlement</option>
                    <option value="DUE_COLLECTION">Due Collection</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-semibold"
                  >
                    <option value="BKASH">bKash Merchant</option>
                    <option value="NAGAD">Nagad Direct</option>
                    <option value="ROCKET">Dutch-Bangla Rocket</option>
                    <option value="UPAY">Upay Digital</option>
                    <option value="CASH">Counter Cash</option>
                    <option value="CARD">POS Credit/Debit Card</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Payment Amount (৳) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Transaction ID / Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. BKASH-88776655"
                  value={payTxnId}
                  onChange={(e) => setPayTxnId(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button type="button" onClick={() => setShowPaymentCenterModal(null)} className="px-4 py-2 bg-secondary text-foreground rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-lg cursor-pointer">
                  {loading ? 'Processing...' : 'Confirm & Collect Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODULE 3 & 4: INVOICE GENERATOR & PRINT MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> Official Invoice — #{showInvoiceModal.id}
              </h3>
              <button onClick={() => setShowInvoiceModal(null)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 bg-secondary/10 rounded-2xl border border-border space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b border-border/60 pb-3">
                <div>
                  <h4 className="font-bold text-base text-foreground font-sans">TrustZone Mobile Care ERP</h4>
                  <p className="text-[10px] text-muted-foreground">Dhanmondi HQ • Dhaka, Bangladesh</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">INV-TZ-998877</div>
                  <div className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">Bill To:</span>
                  <div className="font-bold text-foreground">{showInvoiceModal.customerName}</div>
                  <div>{showInvoiceModal.customerPhone}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">Device Specs:</span>
                  <div className="font-bold text-foreground">{showInvoiceModal.deviceBrand} {showInvoiceModal.deviceModel}</div>
                  <div>IMEI: {showInvoiceModal.imei || 'TZ-IMEI-8899'}</div>
                </div>
              </div>

              <table className="w-full border-t border-b border-border/60 my-3 text-left">
                <thead>
                  <tr className="text-muted-foreground text-[10px]">
                    <th className="py-2">Item / Description</th>
                    <th className="py-2 text-right">Cost (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">Spare Parts & Hardware Replacements</td>
                    <td className="py-1 text-right">৳{(showInvoiceModal.estimatedCost * 0.6).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Lead L4 Engineering Labor & Diagnostic Fee</td>
                    <td className="py-1 text-right">৳{(showInvoiceModal.estimatedCost * 0.4).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="space-y-1 text-right font-bold">
                <div>Subtotal: ৳{showInvoiceModal.estimatedCost.toLocaleString()}</div>
                <div>VAT / Tax (5%): ৳{(showInvoiceModal.estimatedCost * 0.05).toLocaleString()}</div>
                <div className="text-emerald-400 text-sm font-extrabold pt-1">
                  Grand Total: ৳{(showInvoiceModal.estimatedCost * 1.05).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => { alert('Invoice Sent via WhatsApp & Email!'); setShowInvoiceModal(null); }}
                className="px-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
              >
                <Send className="h-4 w-4" /> Share WhatsApp
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-1"
              >
                <Printer className="h-4 w-4" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 7 & 8: CUSTOMER PICKUP & OTP VERIFICATION MODAL */}
      {showPickupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-emerald-400" /> Customer Pickup & OTP Delivery
              </h3>
              <button onClick={() => setShowPickupModal(null)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCustomerPickupSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-emerald-300">
                <span className="font-bold block">Delivery Security Verification</span>
                <p className="text-[11px]">Enter the 4-digit OTP dispatched to customer phone {showPickupModal.customerPhone} to verify identity and trigger 90-Day Auto Warranty Activation.</p>
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Customer Verification OTP *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter OTP (e.g. 9988)"
                  value={pickupOtp}
                  onChange={(e) => setPickupOtp(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-mono font-bold text-center tracking-widest text-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPickupModal(null)} className="px-4 py-2 bg-secondary text-foreground rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg cursor-pointer">
                  {loading ? 'Verifying...' : 'Verify OTP & Deliver Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODULE 6: REFUND MODAL */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-rose-400" /> Process Financial Refund
              </h3>
              <button onClick={() => setShowRefundModal(null)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRefundSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-muted-foreground mb-1">Refund Amount (৳) *</label>
                <input
                  type="number"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Refund Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRefundModal(null)} className="px-4 py-2 bg-secondary text-foreground rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-lg cursor-pointer">
                  {loading ? 'Processing...' : 'Confirm Refund'}
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
                <span className="font-bold text-primary block uppercase tracking-wider text-[10px]">Financial Summary</span>
                <div className="font-bold text-emerald-400 font-mono">Estimate: ৳{viewingBooking.estimatedCost.toLocaleString()}</div>
                <div className="text-muted-foreground">Advance Paid: ৳{viewingBooking.advanceAmount || 0}</div>
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
