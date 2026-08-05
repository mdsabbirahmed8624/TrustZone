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
  Share2
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api, BookingModel, DeviceIntakeDetail, BookingInvoiceModel, BookingPaymentRecord, BookingWarrantyModel, TechnicianAssignmentRecord, SmartReminderRecord } from '@/lib/api';

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

  // Modals & Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIntakeWizardModal, setShowIntakeWizardModal] = useState<BookingModel | null>(null);
  const [showPaymentCenterModal, setShowPaymentCenterModal] = useState<BookingModel | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<BookingModel | null>(null);
  const [showPickupModal, setShowPickupModal] = useState<BookingModel | null>(null);
  const [showReassignModal, setShowReassignModal] = useState<BookingModel | null>(null);
  const [showReminderModal, setShowReminderModal] = useState<BookingModel | null>(null);
  const [showQRModal, setShowQRModal] = useState<BookingModel | null>(null);

  const [editingBooking, setEditingBooking] = useState<BookingModel | null>(null);
  const [viewingBooking, setViewingBooking] = useState<BookingModel | null>(null);
  const [statusModalBooking, setStatusModalBooking] = useState<BookingModel | null>(null);

  // Phase 6 Reassignment State
  const [newTechId, setNewTechId] = useState('tech-2');
  const [newTechName, setNewTechName] = useState('Farhan Chowdhury (Display Spec)');
  const [reassignReason, setReassignReason] = useState('Workload rebalancing & specialist expertise');

  // Phase 6 Reminder State
  const [reminderType, setReminderType] = useState<SmartReminderRecord['type']>('TOMORROW_APPOINTMENT');
  const [reminderChannel, setReminderChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL' | 'IN_APP'>('WHATSAPP');
  const [reminderScheduledFor, setReminderScheduledFor] = useState(new Date().toISOString().split('T')[0]);
  const [reminderMessage, setReminderMessage] = useState('');

  // Modal Sub-Tab in View Spec
  const [modalTab, setModalTab] = useState<'details' | 'timeline' | 'communication' | 'notes' | 'reassignment'>('details');

  // New Note State
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteIsPublic, setNewNoteIsPublic] = useState(false);

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
        setModalTab('details');
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

  // Module 6: Reassign Technician Handler
  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReassignModal) return;
    setLoading(true);
    try {
      const res = await api.bookings.reassignTechnician(
        showReassignModal.id,
        newTechId,
        newTechName,
        reassignReason,
        'Senior Operations Manager'
      );
      if (res.success) {
        alert(`Technician reassigned to ${newTechName} for booking #${showReassignModal.id}. Audit history updated.`);
        setShowReassignModal(null);
        loadData();
      }
    } catch (err) {
      console.error('Failed reassignment', err);
    } finally {
      setLoading(false);
    }
  };

  // Module 4 & 5: Schedule Smart Reminder
  const handleScheduleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReminderModal) return;
    setLoading(true);
    try {
      const res = await api.bookings.scheduleReminder(showReminderModal.id, {
        bookingId: showReminderModal.id,
        type: reminderType,
        channel: reminderChannel,
        scheduledFor: reminderScheduledFor,
        recipient: showReminderModal.customerPhone || showReminderModal.customerEmail,
        message: reminderMessage || `TrustZone Reminder: Your appointment/pickup for #${showReminderModal.id} is scheduled for ${reminderScheduledFor}.`
      });
      if (res.success) {
        alert(`Smart Reminder (${reminderType}) scheduled via ${reminderChannel} for #${showReminderModal.id}!`);
        setShowReminderModal(null);
        setReminderMessage('');
        loadData();
      }
    } catch (err) {
      console.error('Failed reminder scheduling', err);
    } finally {
      setLoading(false);
    }
  };

  // Module 1: Add Rich Internal Note
  const handleAddNote = async () => {
    if (!viewingBooking || !newNoteText.trim()) return;
    const res = await api.bookings.addInternalNote(viewingBooking.id, newNoteText, 'NORMAL', false, 'Desk Staff');
    if (res.success && res.data) {
      const list = viewingBooking.internalNotesList || [];
      list.unshift(res.data);
      setViewingBooking({ ...viewingBooking, internalNotesList: list });
      setNewNoteText('');
    }
  };

  // View Details Modal
  const handleViewClick = (booking: BookingModel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingBooking(booking);
    setModalTab('details');
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
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-foreground tracking-tight">Enterprise Booking Desk</h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Phase 6 Automation & Communication Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Technician timeline, smart reminder engine, internal notes, and automated customer notifications.
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
                      <th className="p-4">Assigned Tech</th>
                      <th className="p-4">Lifecycle Status</th>
                      <th className="p-4 text-right">Phase 6 Automation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {paginatedBookings.map((b) => {
                      const statusConfig = STATUS_MAP[b.status] || { label: b.status, color: 'bg-secondary text-foreground' };

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
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Module 6: Reassign Technician Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowReassignModal(b); }}
                                className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                title="Reassign Technician"
                              >
                                <UserCheck2 className="h-3 w-3" /> Reassign
                              </button>

                              {/* Module 4 & 5: Smart Reminder Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowReminderModal(b); }}
                                className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
                                title="Schedule Smart Reminder"
                              >
                                <Bell className="h-4 w-4" />
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

      {/* MODULE 6: REASSIGN TECHNICIAN MODAL */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <UserCheck2 className="h-5 w-5 text-cyan-400" /> Reassign Technician — #{showReassignModal.id}
              </h3>
              <button onClick={() => setShowReassignModal(null)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
                <span className="text-muted-foreground block">Current Assigned Engineer:</span>
                <div className="font-bold text-foreground">{showReassignModal.technicianName}</div>
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Select New Specialist *</label>
                <select
                  value={newTechId}
                  onChange={(e) => {
                    setNewTechId(e.target.value);
                    const nameMap: Record<string, string> = {
                      'tech-1': 'Tariq Zaman (Lead L4)',
                      'tech-2': 'Farhan Chowdhury (Display Spec)',
                      'tech-3': 'Rafiq Islam (Micro-Soldering)',
                      'tech-4': 'Nabil Hasan (Software Specialist)',
                    };
                    setNewTechName(nameMap[e.target.value] || 'Specialist Engineer');
                  }}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-semibold"
                >
                  <option value="tech-1">Tariq Zaman (Lead L4 Hardware)</option>
                  <option value="tech-2">Farhan Chowdhury (Display & Glass Specialist)</option>
                  <option value="tech-3">Rafiq Islam (Micro-Soldering & IC Specialist)</option>
                  <option value="tech-4">Nabil Hasan (Software & OS Specialist)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Reassignment Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button type="button" onClick={() => setShowReassignModal(null)} className="px-4 py-2 bg-secondary text-foreground rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-xl shadow-lg cursor-pointer">
                  {loading ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODULE 4 & 5: SCHEDULE SMART REMINDER MODAL */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-400" /> Schedule Smart Reminder — #{showReminderModal.id}
              </h3>
              <button onClick={() => setShowReminderModal(null)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleReminderSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Reminder Type</label>
                  <select
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-semibold"
                  >
                    <option value="TOMORROW_APPOINTMENT">Tomorrow's Appointment</option>
                    <option value="TODAY_APPOINTMENT">Today's Appointment</option>
                    <option value="DUE_PAYMENT">Due Payment Reminder</option>
                    <option value="PENDING_PICKUP">Pending Pickup Alert</option>
                    <option value="WARRANTY_EXPIRY">Warranty Expiry Reminder</option>
                    <option value="FOLLOW_UP">Post-Repair Follow Up</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Dispatch Channel</label>
                  <select
                    value={reminderChannel}
                    onChange={(e) => setReminderChannel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-semibold"
                  >
                    <option value="WHATSAPP">WhatsApp Official</option>
                    <option value="SMS">SMS Gateway</option>
                    <option value="EMAIL">Customer Email</option>
                    <option value="IN_APP">App Push Notification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Schedule Date</label>
                <input
                  type="date"
                  value={reminderScheduledFor}
                  onChange={(e) => setReminderScheduledFor(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Reminder Message Body</label>
                <textarea
                  rows={3}
                  placeholder="Custom reminder text (optional)..."
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button type="button" onClick={() => setShowReminderModal(null)} className="px-4 py-2 bg-secondary text-foreground rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-amber-500 text-black font-bold rounded-xl shadow-lg cursor-pointer">
                  {loading ? 'Scheduling...' : 'Schedule Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SPECIFICATION & TIMELINE MODAL */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                Booking Details & Automation — #{viewingBooking.id}
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${STATUS_MAP[viewingBooking.status]?.color}`}>
                  {STATUS_MAP[viewingBooking.status]?.label}
                </span>
              </h3>
              <button onClick={closeModals} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-border/60 pb-2 text-xs font-bold text-muted-foreground overflow-x-auto">
              <button
                onClick={() => setModalTab('details')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${modalTab === 'details' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                Overview & Specs
              </button>
              <button
                onClick={() => setModalTab('timeline')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${modalTab === 'timeline' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                Technician Timeline ({viewingBooking.history?.length || 0})
              </button>
              <button
                onClick={() => setModalTab('notes')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${modalTab === 'notes' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                Internal Notes ({viewingBooking.internalNotesList?.length || 0})
              </button>
              <button
                onClick={() => setModalTab('reassignment')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${modalTab === 'reassignment' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                Tech Assignment Ledger ({viewingBooking.assignmentHistory?.length || 0})
              </button>
            </div>

            {/* TAB: OVERVIEW */}
            {modalTab === 'details' && (
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
            )}

            {/* TAB: TECHNICIAN TIMELINE */}
            {modalTab === 'timeline' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-foreground uppercase tracking-wider">Automated Lifecycle Timeline</h4>
                <div className="space-y-2 relative border-l-2 border-primary/30 pl-4 ml-2">
                  {(viewingBooking.history || []).map((h, idx) => (
                    <div key={idx} className="relative pb-2">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card" />
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <span>{h.status}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{new Date(h.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">{h.note}</p>
                      <div className="text-[9px] text-muted-foreground font-semibold">By: {h.updatedBy || 'System Automation'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: INTERNAL NOTES */}
            {modalTab === 'notes' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a private internal note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                  />
                  <button onClick={handleAddNote} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg cursor-pointer">
                    Add Note
                  </button>
                </div>

                <div className="space-y-2">
                  {(viewingBooking.internalNotesList || []).map((n) => (
                    <div key={n.id} className="p-3 bg-secondary/20 border border-border rounded-xl space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-primary">{n.author}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date((n as any).timestamp || n.createdAt || Date.now()).toLocaleString()}</span>
                      </div>
                      <p className="text-foreground">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: REASSIGNMENT LEDGER */}
            {modalTab === 'reassignment' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-foreground uppercase tracking-wider">Technician Reassignment History</h4>
                <div className="space-y-2">
                  {(viewingBooking.assignmentHistory || []).map((a) => (
                    <div key={a.id} className="p-3 bg-secondary/20 border border-border rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-foreground">Reassigned from {a.previousTechName} ➔ {a.newTechName}</div>
                        <div className="text-[11px] text-muted-foreground">Reason: {a.reassignmentReason}</div>
                      </div>
                      <div className="text-right text-[10px] text-muted-foreground font-mono">
                        <div>Approved by {a.approvedBy}</div>
                        <div>{new Date(a.transferredAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border/60 pt-3 flex justify-end">
              <button onClick={closeModals} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl cursor-pointer">
                Close
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
