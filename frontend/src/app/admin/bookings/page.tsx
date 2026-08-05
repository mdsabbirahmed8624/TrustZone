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
  Image as ImageIcon,
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
  CheckSquare2
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api, BookingModel, BookingInternalNote, BookingAttachment, BookingCommunicationLog } from '@/lib/api';

// Available Time Slots (09:00 AM - 08:00 PM)
const TIME_SLOTS_30 = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM'
];

const TIME_SLOTS_15 = [
  '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
  '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
  '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
  '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
  '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
  '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
  '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM'
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

  // Active View Tab: 'list' | 'calendar' | 'analytics' | 'reports' | 'trash'
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'analytics' | 'reports' | 'trash'>('list');

  // Calendar Sub-View Modes
  const [calendarViewMode, setCalendarViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [slotDuration, setSlotDuration] = useState<15 | 30 | 45 | 60>(30);

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
  const [showIntakeModal, setShowIntakeModal] = useState<BookingModel | null>(null);
  const [showQRModal, setShowQRModal] = useState<BookingModel | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingModel | null>(null);
  const [viewingBooking, setViewingBooking] = useState<BookingModel | null>(null);
  const [statusModalBooking, setStatusModalBooking] = useState<BookingModel | null>(null);
  const [conflictDialogBooking, setConflictDialogBooking] = useState<{ conflictReason: string; bookingData?: Partial<BookingModel> } | null>(null);

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

  // Device Intake Wizard State
  const [intakeData, setIntakeData] = useState({
    accessories: ['SIM Tray', 'Protective Case'],
    batteryPct: 85,
    screenCondition: 'Cracked glass, OLED functional',
    physicalNotes: 'Minor scuffs on bottom aluminum frame',
    waterDamage: false,
    customerSignature: 'Signed Digitally by Customer',
    techSignature: 'Verified by Tariq Zaman (L4)',
  });

  // Recommendation engine state
  const [techRecommendation, setTechRecommendation] = useState<{ id: string; name: string; score: number; reason: string } | null>(null);

  // Modal Sub-Tabs
  const [modalTab, setModalTab] = useState<'details' | 'internal_notes' | 'attachments' | 'communication'>('details');

  // Internal Notes State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePriority, setNewNotePriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [newNotePinned, setNewNotePinned] = useState(false);

  // Attachment Upload State
  const [attName, setAttName] = useState('');
  const [attUrl, setAttUrl] = useState('');
  const [attType, setAttType] = useState<'PHOTO_BEFORE' | 'PHOTO_AFTER' | 'PDF' | 'INVOICE' | 'WARRANTY_CARD' | 'VIDEO'>('PHOTO_BEFORE');

  // Communication Dispatch State
  const [commChannel, setCommChannel] = useState<'SMS' | 'EMAIL' | 'WHATSAPP' | 'PUSH'>('SMS');
  const [commMessage, setCommMessage] = useState('');
  const [commRecipient, setCommRecipient] = useState('');

  // Status Change State
  const [newStatusNote, setNewStatusNote] = useState('');
  const [targetStatus, setTargetStatus] = useState('');

  // Reports Generation State
  const [reportType, setReportType] = useState('DAILY_BOOKINGS');
  const [reportFormat, setReportFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, branchFilter, dateFilter]);

  // Handle URL Query Params for direct navigation to ?id=... or ?edit=...
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
      console.error('Failed to load enterprise bookings data', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Details Modal & update URL query param
  const handleViewClick = (booking: BookingModel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingBooking(booking);
    setModalTab('details');
    window.history.pushState({}, '', `/admin/bookings?id=${booking.id}`);
  };

  // Open Edit Modal & update URL query param
  const handleEditClick = (booking: BookingModel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingBooking(booking);
    setFormState(booking);
    setShowCreateModal(true);
    window.history.pushState({}, '', `/admin/bookings?edit=${booking.id}`);
  };

  // Close modals & clear URL params
  const closeModals = () => {
    setViewingBooking(null);
    setShowCreateModal(false);
    setEditingBooking(null);
    setShowIntakeModal(null);
    setShowQRModal(null);
    setStatusModalBooking(null);
    window.history.pushState({}, '', `/admin/bookings`);
  };

  // Auto Tech Recommendation
  const handleAutoRecommendTech = async (cat: string, bId: string) => {
    const res = await api.bookings.recommendTechnician(cat, bId);
    if (res.success && res.data) {
      setTechRecommendation({
        id: res.data.recommendedTechId,
        name: res.data.recommendedTechName,
        score: res.data.score,
        reason: res.data.matchReason
      });
      setFormState(prev => ({
        ...prev,
        technicianId: res.data.recommendedTechId,
        technicianName: res.data.recommendedTechName
      }));
    }
  };

  // Conflict Checker
  const checkConflicts = (data: Partial<BookingModel>) => {
    if (data.imei && data.imei.length > 5) {
      const existingImei = bookings.find(b => !b.isDeleted && b.imei === data.imei && b.id !== data.id && b.status !== 'COMPLETED' && b.status !== 'DELIVERED');
      if (existingImei) {
        return `Conflict: IMEI #${data.imei} is actively registered in booking #${existingImei.id} (${existingImei.status}).`;
      }
    }
    if (data.appointmentDate && data.appointmentTime && data.technicianId) {
      const existingSlot = bookings.find(b => 
        !b.isDeleted &&
        b.id !== data.id &&
        b.appointmentDate === data.appointmentDate &&
        b.appointmentTime === data.appointmentTime &&
        b.technicianId === data.technicianId &&
        b.status !== 'CANCELLED' && b.status !== 'REJECTED'
      );
      if (existingSlot) {
        return `Overlap Conflict: Technician ${data.technicianName} is already booked at ${data.appointmentTime} on ${data.appointmentDate} for #${existingSlot.id}.`;
      }
    }
    return null;
  };

  // Save Booking Submission
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.customerName || !formState.customerPhone || !formState.deviceModel) {
      alert('Please fill out all required fields.');
      return;
    }

    const conflictMsg = checkConflicts(formState);
    if (conflictMsg) {
      setConflictDialogBooking({ conflictReason: conflictMsg, bookingData: formState });
      return;
    }

    await executeSaveBooking(formState);
  };

  const executeSaveBooking = async (data: Partial<BookingModel>) => {
    setLoading(true);
    try {
      if (editingBooking) {
        await api.bookings.update(editingBooking.id, data);
      } else {
        await api.bookings.create(data);
      }
      closeModals();
      setConflictDialogBooking(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Failed to save booking', err);
    } finally {
      setLoading(false);
    }
  };

  // Internal Notes Handler
  const handleAddInternalNote = async () => {
    if (!viewingBooking || !newNoteContent.trim()) return;
    const res = await api.bookings.addInternalNote(viewingBooking.id, newNoteContent, newNotePriority, newNotePinned, 'Staff Admin');
    if (res.success && res.data) {
      const updatedNotes = viewingBooking.internalNotesList || [];
      updatedNotes.unshift(res.data);
      setViewingBooking({ ...viewingBooking, internalNotesList: updatedNotes });
      setNewNoteContent('');
    }
  };

  // Attachment Upload Handler
  const handleAddAttachment = async () => {
    if (!viewingBooking || !attName.trim()) return;
    const res = await api.bookings.addAttachment(viewingBooking.id, { name: attName, url: attUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', type: attType });
    if (res.success && res.data) {
      const updatedAtts = viewingBooking.attachmentsList || [];
      updatedAtts.unshift(res.data);
      setViewingBooking({ ...viewingBooking, attachmentsList: updatedAtts });
      setAttName('');
      setAttUrl('');
    }
  };

  // Communication Dispatch Handler
  const handleSendCommunication = async () => {
    if (!viewingBooking || !commMessage.trim()) return;
    const recipient = commRecipient || viewingBooking.customerPhone || viewingBooking.customerEmail;
    const res = await api.bookings.sendCustomerMessage(viewingBooking.id, commChannel, commMessage, recipient);
    if (res.success && res.data) {
      const updatedLogs = viewingBooking.communicationLogs || [];
      updatedLogs.unshift(res.data);
      setViewingBooking({ ...viewingBooking, communicationLogs: updatedLogs });
      setCommMessage('');
      alert(`Message dispatched via ${commChannel} to ${recipient}.`);
    }
  };

  // Intake Wizard Save
  const handleSaveIntake = async () => {
    if (!showIntakeModal) return;
    await api.bookings.saveIntakeSummary(showIntakeModal.id, intakeData);
    alert(`Device Intake Summary generated & attached to Booking #${showIntakeModal.id}.`);
    setShowIntakeModal(null);
    loadData();
  };

  // Automated WhatsApp & SMS Notification Trigger on Status Transition
  const handleStatusChangeSubmit = async () => {
    if (!statusModalBooking || !targetStatus) return;
    setLoading(true);
    try {
      await api.bookings.updateStatus(statusModalBooking.id, targetStatus, newStatusNote);
      
      const msg = `TrustZone Update: Your booking #${statusModalBooking.id} (${statusModalBooking.deviceBrand} ${statusModalBooking.deviceModel}) status is now ${targetStatus}. Note: ${newStatusNote || 'Updated by Desk'}`;
      await api.bookings.sendCustomerMessage(statusModalBooking.id, 'WHATSAPP', msg, statusModalBooking.customerPhone);
      
      setStatusModalBooking(null);
      setTargetStatus('');
      setNewStatusNote('');
      loadData();
    } catch (err) {
      console.error('Failed to update booking status', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate Advanced Report
  const handleGenerateReport = async () => {
    const res = await api.bookings.generateReport(reportType, reportFormat);
    if (res.success && res.data) {
      alert(`Report generated: ${res.data.fileName}. Ready for download.`);
    }
  };

  const resetForm = () => {
    setFormState({
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
    setTechRecommendation(null);
  };

  const handleDeleteClick = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to move this booking to Trash?')) return;
    await api.bookings.delete(id);
    loadData();
  };

  const handleRestoreClick = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await api.bookings.restore(id);
    loadData();
  };

  const handleDuplicateClick = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await api.bookings.duplicate(id);
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
      b.deviceModel.toLowerCase().includes(q) ||
      b.imei?.includes(q) ||
      (b.qrCode && b.qrCode.toLowerCase().includes(q))
    );
  }, [activeBookings, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(searchedBookings.length / itemsPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return searchedBookings.slice(start, start + itemsPerPage);
  }, [searchedBookings, currentPage]);

  // Bulk Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedBookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedBookings.map(b => b.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkAction) return;
    if (bulkAction === 'delete') {
      if (!confirm(`Move ${selectedIds.length} bookings to Trash?`)) return;
      await api.bookings.bulkDelete(selectedIds);
    } else if (bulkAction.startsWith('status_')) {
      const st = bulkAction.replace('status_', '');
      await api.bookings.bulkUpdateStatus(selectedIds, st);
    }
    setSelectedIds([]);
    setBulkAction('');
    loadData();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Customer', 'Phone', 'Device', 'Appointment', 'Time', 'Branch', 'Status', 'Cost'];
    const rows = searchedBookings.map(b => [
      b.id,
      `"${b.customerName}"`,
      b.customerPhone,
      `"${b.deviceBrand} ${b.deviceModel}"`,
      b.appointmentDate,
      b.appointmentTime,
      `"${b.branchName}"`,
      b.status,
      b.estimatedCost
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TrustZone_Bookings_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <CalendarRange className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-foreground tracking-tight">Enterprise Booking Desk</h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Verified Action Handlers
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Device intake wizard, QR verification, digital queue tokens, and automated WhatsApp dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { resetForm(); setEditingBooking(null); setShowCreateModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                New Appointment
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl text-xs font-semibold border border-border transition-all cursor-pointer"
                title="Export Data"
              >
                <Download className="h-4 w-4" />
                Export
              </button>

              <button
                onClick={loadData}
                className="p-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl border border-border transition-all cursor-pointer"
                title="Refresh Records"
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
                  activeTab === 'list'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-4 w-4" />
                Bookings Registry ({searchedBookings.length})
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                Advanced Scheduler
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="h-4 w-4" />
                Reports Suite
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                Analytics & AI Insights
              </button>

              <button
                onClick={() => setActiveTab('trash')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'trash'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                Trash Bin
              </button>
            </div>
          </div>

          {/* TAB 1: LIST / REGISTRY */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {/* Search & Filter Strip */}
              <div className="p-4 bg-card border border-border/60 rounded-xl space-y-3 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search ID, Customer, Phone, IMEI, QR..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-secondary/30 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">All Workflow Statuses</option>
                    {LIFECYCLE_STEPS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    {ALTERNATIVE_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>

                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">All Outlets</option>
                    <option value="d1111111-1111-1111-1111-111111111111">Dhanmondi HQ</option>
                    <option value="b2222222-2222-2222-2222-222222222222">Banani Lab</option>
                    <option value="c3333333-3333-3333-3333-333333333333">Mirpur Lab</option>
                  </select>

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto min-w-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-4 w-10 text-center">
                          <button onClick={toggleSelectAll} className="cursor-pointer">
                            {selectedIds.length === paginatedBookings.length && paginatedBookings.length > 0 ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </th>
                        <th className="p-4">Booking & Queue Token</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Device</th>
                        <th className="p-4">Schedule</th>
                        <th className="p-4">Technician</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Cost</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-xs">
                      {paginatedBookings.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-12 text-center text-muted-foreground font-semibold">
                            No appointment records match the current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedBookings.map((b) => {
                          const statusConfig = STATUS_MAP[b.status] || { label: b.status, color: 'bg-secondary text-foreground' };
                          const token = b.queueToken || `Q-DHQ-0${Math.floor(10 + Math.random() * 89)}`;
                          return (
                            <tr
                              key={b.id}
                              onClick={(e) => handleViewClick(b, e)}
                              className="hover:bg-secondary/20 transition-all cursor-pointer"
                            >
                              <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => toggleSelectId(b.id)} className="cursor-pointer">
                                  {selectedIds.includes(b.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                                </button>
                              </td>
                              <td className="p-4 font-mono">
                                <div className="font-bold text-primary">{b.id}</div>
                                <span className="inline-block px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 font-bold rounded mt-0.5">
                                  {token}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-foreground">{b.customerName}</div>
                                <div className="text-[10px] text-muted-foreground">{b.customerPhone}</div>
                              </td>
                              <td className="p-4">
                                <div className="font-semibold text-foreground">{b.deviceBrand} {b.deviceModel}</div>
                                <div className="text-[10px] text-muted-foreground truncate max-w-xs">{b.problemCategory}</div>
                              </td>
                              <td className="p-4">
                                <div className="font-semibold">{b.appointmentDate}</div>
                                <div className="text-[10px] text-muted-foreground">{b.appointmentTime}</div>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary border border-border/60">
                                  {b.technicianName}
                                </span>
                              </td>
                              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => { setStatusModalBooking(b); setTargetStatus(b.status); }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer hover:opacity-80 ${statusConfig.color}`}
                                >
                                  {statusConfig.label} ▾
                                </button>
                              </td>
                              <td className="p-4 font-mono font-bold text-emerald-400">
                                ৳{b.estimatedCost.toLocaleString()}
                              </td>
                              <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setShowQRModal(b); }}
                                    className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
                                    title="View QR Code"
                                  >
                                    <QrCode className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={(e) => { e.stopPropagation(); setShowIntakeModal(b); }}
                                    className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
                                    title="Device Intake Wizard"
                                  >
                                    <FileCheck className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={(e) => handleViewClick(b, e)}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all cursor-pointer"
                                    title="View Booking Specification"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={(e) => handleEditClick(b, e)}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all cursor-pointer"
                                    title="Edit Booking Record"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={(e) => handleDeleteClick(b.id, e)}
                                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                    title="Trash"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-secondary/20 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Showing {paginatedBookings.length} of {searchedBookings.length} records</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="p-1.5 bg-card border border-border rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-foreground">Page {currentPage} of {totalPages}</span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="p-1.5 bg-card border border-border rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADVANCED CALENDAR SCHEDULER */}
          {activeTab === 'calendar' && (
            <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Advanced Calendar Scheduler Engine</h3>
                  <p className="text-xs text-muted-foreground">Day/Week/Month views, technician workload indicators, and lunch break locks.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center p-1 bg-secondary/40 border border-border/60 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setCalendarViewMode('day')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${calendarViewMode === 'day' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      Day View
                    </button>
                    <button
                      onClick={() => setCalendarViewMode('week')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${calendarViewMode === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      Week View
                    </button>
                    <button
                      onClick={() => setCalendarViewMode('month')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${calendarViewMode === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      Month View
                    </button>
                  </div>

                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value) as any)}
                    className="px-3 py-1.5 text-xs bg-secondary/30 border border-border rounded-xl text-foreground font-semibold"
                  >
                    <option value={15}>15-Min Slots</option>
                    <option value={30}>30-Min Slots</option>
                    <option value={45}>45-Min Slots</option>
                    <option value={60}>60-Min Slots</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(slotDuration === 15 ? TIME_SLOTS_15 : TIME_SLOTS_30).map((slot) => {
                  const slotBookings = activeBookings.filter(b => b.appointmentTime === slot);
                  const isBooked = slotBookings.length > 0;
                  const isLunch = slot === '01:00 PM' || slot === '01:30 PM';

                  return (
                    <div
                      key={slot}
                      className={`p-4 rounded-xl border transition-all ${
                        isLunch
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : isBooked
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-secondary/20 border-border/60 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" /> {slot}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          isLunch ? 'bg-amber-500/20 text-amber-400' :
                          isBooked ? 'bg-primary text-primary-foreground' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {isLunch ? 'Staff Lunch Break' : isBooked ? `${slotBookings.length} Reserved` : 'Available'}
                        </span>
                      </div>

                      {isBooked && (
                        <div className="space-y-2 pt-1">
                          {slotBookings.map((b) => (
                            <div key={b.id} onClick={(e) => handleViewClick(b, e)} className="p-2.5 bg-card border border-border/60 rounded-lg text-xs space-y-1 cursor-pointer hover:border-primary">
                              <div className="flex items-center justify-between font-bold">
                                <span>{b.customerName}</span>
                                <span className="font-mono text-[10px] text-primary">{b.id}</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground">{b.deviceBrand} {b.deviceModel}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REPORTS SUITE */}
          {activeTab === 'reports' && (
            <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-foreground">Enterprise Booking Reports Suite</h3>
                <p className="text-xs text-muted-foreground">Generate comprehensive audit reports in PDF, Excel, or CSV format.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Select Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground font-semibold"
                  >
                    <option value="DAILY_BOOKINGS">Daily Booking Audit Report</option>
                    <option value="BRANCH_PERFORMANCE">Branch Load & Revenue Report</option>
                    <option value="TECHNICIAN_UTILIZATION">Technician Utilization Report</option>
                    <option value="CANCELLATION_ANALYSIS">Cancellation & No-Show Report</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Export Format</label>
                  <select
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground font-semibold"
                  >
                    <option value="PDF">PDF Document (.pdf)</option>
                    <option value="EXCEL">Excel Spreadsheet (.xlsx)</option>
                    <option value="CSV">CSV Data Blob (.csv)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleGenerateReport}
                    className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-md cursor-pointer hover:opacity-90"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS & AI INSIGHTS */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" /> Problem Category Distribution
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Screen & OLED Display (42%)</span>
                      <span className="font-bold text-foreground">৳34,500</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[42%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Battery & Power Logic (28%)</span>
                      <span className="font-bold text-foreground">৳21,000</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[28%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Flame className="h-5 w-5 text-rose-500" /> Hourly Peak Heatmap
                </h3>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold">10:00 AM<br/><span className="text-[10px] font-normal">Normal</span></div>
                  <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl font-bold">02:00 PM<br/><span className="text-[10px] font-normal">Peak</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TRASH */}
          {activeTab === 'trash' && (
            <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-foreground">Archived & Deleted Bookings</h3>
              <div className="w-full overflow-x-auto min-w-0">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border/60 text-muted-foreground uppercase font-bold">
                      <th className="p-3">ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Device</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {activeBookings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">Trash bin is empty.</td>
                      </tr>
                    ) : (
                      activeBookings.map(b => (
                        <tr key={b.id} className="hover:bg-secondary/20">
                          <td className="p-3 font-mono font-bold text-rose-400">{b.id}</td>
                          <td className="p-3 font-semibold">{b.customerName}</td>
                          <td className="p-3">{b.deviceBrand} {b.deviceModel}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => handleRestoreClick(b.id, e)}
                              className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-lg hover:bg-emerald-500/30 transition-all cursor-pointer"
                            >
                              Restore Record
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CREATE / EDIT BOOKING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl bg-card border border-border/80 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">
                  {editingBooking ? `Edit Appointment Record #${editingBooking.id}` : 'Create Enterprise Booking'}
                </h2>
                <p className="text-xs text-muted-foreground">Smart scheduler with technician recommendation and conflict detection.</p>
              </div>
              <button onClick={closeModals} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {techRecommendation && (
              <div className="p-3.5 bg-primary/10 border border-primary/30 text-foreground text-xs rounded-xl flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-primary">Smart Recommendation ({techRecommendation.score}% Match):</span>
                    <span className="ml-1 text-muted-foreground">{techRecommendation.reason}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-primary text-primary-foreground font-bold text-[10px] rounded-lg">
                  {techRecommendation.name}
                </span>
              </div>
            )}

            <form onSubmit={handleSaveBooking} className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">1. Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rafiq Karim"
                      value={formState.customerName}
                      onChange={(e) => setFormState({ ...formState, customerName: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Mobile Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 01711122233"
                      value={formState.customerPhone}
                      onChange={(e) => setFormState({ ...formState, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. rafiq@example.com"
                      value={formState.customerEmail}
                      onChange={(e) => setFormState({ ...formState, customerEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">2. Device & Diagnostics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Brand</label>
                    <select
                      value={formState.deviceBrand}
                      onChange={(e) => setFormState({ ...formState, deviceBrand: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Google">Google</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="OnePlus">OnePlus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Device Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 14 Pro"
                      value={formState.deviceModel}
                      onChange={(e) => setFormState({ ...formState, deviceModel: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">IMEI Number</label>
                    <input
                      type="text"
                      placeholder="15-digit IMEI"
                      value={formState.imei}
                      onChange={(e) => setFormState({ ...formState, imei: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Problem Category</label>
                    <select
                      value={formState.problemCategory}
                      onChange={(e) => {
                        const cat = e.target.value;
                        setFormState({ ...formState, problemCategory: cat });
                        handleAutoRecommendTech(cat, formState.branchId || '');
                      }}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                    >
                      <option value="SCREEN_DISPLAY">Screen & Display</option>
                      <option value="BATTERY_POWER">Battery & Power</option>
                      <option value="MOTHERBOARD_CHIP">Motherboard IC Repair</option>
                      <option value="CAMERA_LENS">Camera Lens Module</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">3. Schedule & Technician Assignment</h3>
                  <button
                    type="button"
                    onClick={() => handleAutoRecommendTech(formState.problemCategory || 'SCREEN_DISPLAY', formState.branchId || '')}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Auto-Assign Best Technician
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={formState.appointmentDate}
                      onChange={(e) => setFormState({ ...formState, appointmentDate: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Time Slot</label>
                    <select
                      value={formState.appointmentTime}
                      onChange={(e) => setFormState({ ...formState, appointmentTime: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                    >
                      {TIME_SLOTS_30.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Assigned Technician</label>
                    <select
                      value={formState.technicianId}
                      onChange={(e) => {
                        const tId = e.target.value;
                        const tName = tId === 'tech-1' ? 'Tariq Zaman (Lead L4)' : tId === 'tech-2' ? 'Rafiq Ahmed' : 'Nazma Khatun';
                        setFormState({ ...formState, technicianId: tId, technicianName: tName });
                      }}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-semibold"
                    >
                      <option value="tech-1">Tariq Zaman (Lead L4)</option>
                      <option value="tech-2">Rafiq Ahmed</option>
                      <option value="tech-3">Nazma Khatun</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Priority</label>
                    <select
                      value={formState.priority}
                      onChange={(e) => setFormState({ ...formState, priority: e.target.value as any })}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent (VIP Fast-Track)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 bg-secondary text-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 cursor-pointer shadow-lg shadow-primary/20"
                >
                  {loading ? 'Saving Record...' : editingBooking ? 'Update Appointment' : 'Confirm & Schedule Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  Booking Specification #{viewingBooking.id}
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${STATUS_MAP[viewingBooking.status]?.color}`}>
                    {STATUS_MAP[viewingBooking.status]?.label}
                  </span>
                </h3>
              </div>
              <button onClick={closeModals} className="p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setModalTab('details')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${modalTab === 'details' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Details & Timeline
              </button>

              <button
                onClick={() => setModalTab('internal_notes')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${modalTab === 'internal_notes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Staff Notes ({viewingBooking.internalNotesList?.length || 0})
              </button>

              <button
                onClick={() => setModalTab('attachments')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${modalTab === 'attachments' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Attachments ({viewingBooking.attachmentsList?.length || 0})
              </button>

              <button
                onClick={() => setModalTab('communication')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${modalTab === 'communication' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Customer Dispatch Hub
              </button>
            </div>

            {modalTab === 'details' && (
              <div className="space-y-5 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/20 rounded-xl space-y-1 border border-border/60">
                    <span className="font-bold text-primary block uppercase tracking-wider text-[10px]">Customer Specs</span>
                    <div className="font-bold text-foreground">{viewingBooking.customerName}</div>
                    <div className="text-muted-foreground">{viewingBooking.customerPhone}</div>
                    <div className="text-muted-foreground">{viewingBooking.customerEmail}</div>
                  </div>

                  <div className="p-3 bg-secondary/20 rounded-xl space-y-1 border border-border/60">
                    <span className="font-bold text-primary block uppercase tracking-wider text-[10px]">Device & Appointment</span>
                    <div className="font-bold text-foreground">{viewingBooking.deviceBrand} {viewingBooking.deviceModel}</div>
                    <div className="text-muted-foreground">IMEI: {viewingBooking.imei || 'N/A'}</div>
                    <div className="text-muted-foreground">Slot: {viewingBooking.appointmentDate} ({viewingBooking.appointmentTime})</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Audit Log & Status History Timeline</span>
                  <div className="space-y-2">
                    {(viewingBooking.history || []).map((h, i) => (
                      <div key={i} className="p-3 bg-secondary/20 rounded-xl border border-border/60 flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <div className="font-bold text-foreground flex items-center gap-2">
                            <span>{h.status}</span>
                            <span className="text-[10px] text-muted-foreground">({new Date(h.timestamp).toLocaleString()})</span>
                          </div>
                          <div className="text-muted-foreground">{h.note}</div>
                          <div className="text-[10px] text-primary font-semibold">By: {h.updatedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {modalTab === 'internal_notes' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-secondary/20 rounded-xl border border-border/60 space-y-2">
                  <span className="font-bold text-foreground block">Add Staff Private Note</span>
                  <textarea
                    rows={2}
                    placeholder="Type confidential repair note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <select
                        value={newNotePriority}
                        onChange={(e) => setNewNotePriority(e.target.value as any)}
                        className="px-2 py-1 bg-card border border-border rounded-md"
                      >
                        <option value="NORMAL">Normal Priority</option>
                        <option value="HIGH">High Priority</option>
                        <option value="URGENT">Urgent Note</option>
                      </select>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newNotePinned}
                          onChange={(e) => setNewNotePinned(e.target.checked)}
                        />
                        <span>Pin Note</span>
                      </label>
                    </div>

                    <button
                      onClick={handleAddInternalNote}
                      className="px-3 py-1 bg-primary text-primary-foreground font-bold rounded-lg cursor-pointer"
                    >
                      Post Note
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(viewingBooking.internalNotesList || []).map((n) => (
                    <div key={n.id} className={`p-3 rounded-xl border space-y-1 ${n.isPinned ? 'bg-amber-500/10 border-amber-500/30' : 'bg-secondary/20 border-border/60'}`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1">
                          {n.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500" />} {n.author}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalTab === 'attachments' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-secondary/20 rounded-xl border border-border/60 space-y-2">
                  <span className="font-bold text-foreground block">Upload Device Media / Inspection Document</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Attachment Title..."
                      value={attName}
                      onChange={(e) => setAttName(e.target.value)}
                      className="px-3 py-1.5 bg-card border border-border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Image URL..."
                      value={attUrl}
                      onChange={(e) => setAttUrl(e.target.value)}
                      className="px-3 py-1.5 bg-card border border-border rounded-lg"
                    />
                    <select
                      value={attType}
                      onChange={(e) => setAttType(e.target.value as any)}
                      className="px-3 py-1.5 bg-card border border-border rounded-lg"
                    >
                      <option value="PHOTO_BEFORE">Before Repair Photo</option>
                      <option value="PHOTO_AFTER">After Repair Photo</option>
                      <option value="PDF">PDF Report</option>
                      <option value="INVOICE">Invoice Receipt</option>
                      <option value="WARRANTY_CARD">Warranty Card</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddAttachment}
                    className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg cursor-pointer"
                  >
                    Attach File
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(viewingBooking.attachmentsList || []).map((att) => (
                    <div key={att.id} className="p-2.5 bg-secondary/20 border border-border/60 rounded-xl space-y-1">
                      <img src={att.url} alt={att.name} className="h-24 w-full object-cover rounded-lg" />
                      <div className="font-bold truncate">{att.name}</div>
                      <div className="text-[10px] text-muted-foreground">{att.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalTab === 'communication' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-secondary/20 rounded-xl border border-border/60 space-y-2">
                  <span className="font-bold text-foreground block">Multi-Channel Customer Dispatch</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={commChannel}
                      onChange={(e) => setCommChannel(e.target.value as any)}
                      className="px-3 py-1.5 bg-card border border-border rounded-lg font-bold"
                    >
                      <option value="SMS">SMS Message</option>
                      <option value="WHATSAPP">WhatsApp API</option>
                      <option value="EMAIL">Email Dispatch</option>
                      <option value="PUSH">App Push Notification</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Recipient (Phone/Email)..."
                      value={commRecipient || viewingBooking.customerPhone}
                      onChange={(e) => setCommRecipient(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-card border border-border rounded-lg"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Type customer message or click template..."
                    value={commMessage}
                    onChange={(e) => setCommMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCommMessage(`Dear ${viewingBooking.customerName}, your repair booking #${viewingBooking.id} is CONFIRMED for ${viewingBooking.appointmentDate} at ${viewingBooking.appointmentTime}. - TrustZone`)}
                        className="px-2 py-0.5 bg-secondary text-[10px] rounded hover:bg-secondary/80"
                      >
                        + Confirm Template
                      </button>

                      <button
                        type="button"
                        onClick={() => setCommMessage(`Dear ${viewingBooking.customerName}, your device ${viewingBooking.deviceBrand} ${viewingBooking.deviceModel} is READY FOR PICKUP at Dhanmondi HQ. - TrustZone`)}
                        className="px-2 py-0.5 bg-secondary text-[10px] rounded hover:bg-secondary/80"
                      >
                        + Ready Template
                      </button>
                    </div>

                    <button
                      onClick={handleSendCommunication}
                      className="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" /> Dispatch
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Communication Logs</span>
                  {(viewingBooking.communicationLogs || []).map((l) => (
                    <div key={l.id} className="p-2.5 bg-secondary/20 border border-border/60 rounded-xl flex items-start justify-between">
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span className="px-1.5 py-0.2 bg-primary/20 text-primary text-[9px] rounded">{l.channel}</span>
                          <span>{l.recipient}</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5">{l.message}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(l.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border/60 pt-4 flex justify-end">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-secondary text-foreground text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TRANSITION MODAL */}
      {statusModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-foreground">
              Update Workflow Status ({statusModalBooking.id})
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-semibold"
                >
                  <optgroup label="Lifecycle Steps">
                    {LIFECYCLE_STEPS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </optgroup>
                  <optgroup label="Alternative States">
                    {ALTERNATIVE_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">Audit Transition Note</label>
                <textarea
                  rows={3}
                  placeholder="Provide rationale for status transition..."
                  value={newStatusNote}
                  onChange={(e) => setNewStatusNote(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusModalBooking(null)}
                className="px-3 py-1.5 bg-secondary text-foreground text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleStatusChangeSubmit}
                className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-md cursor-pointer"
              >
                Commit Transition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEVICE INTAKE WIZARD MODAL */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-amber-500" /> Device Intake Summary Wizard (#{showIntakeModal.id})
              </h3>
              <button onClick={() => setShowIntakeModal(null)} className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-muted-foreground mb-1">Battery Health (%)</label>
                <input
                  type="number"
                  value={intakeData.batteryPct}
                  onChange={(e) => setIntakeData({ ...intakeData, batteryPct: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Screen Condition</label>
                <input
                  type="text"
                  value={intakeData.screenCondition}
                  onChange={(e) => setIntakeData({ ...intakeData, screenCondition: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-muted-foreground">Physical Damage Notes</label>
              <textarea
                rows={2}
                value={intakeData.physicalNotes}
                onChange={(e) => setIntakeData({ ...intakeData, physicalNotes: e.target.value })}
                className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <button onClick={() => setShowIntakeModal(null)} className="px-4 py-2 bg-secondary text-xs rounded-xl font-semibold cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveIntake} className="px-4 py-2 bg-primary text-primary-foreground text-xs rounded-xl font-bold cursor-pointer">
                Save & Sign Intake
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-card border border-border/80 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <h3 className="text-base font-extrabold text-foreground">Booking QR Check-In</h3>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`TZ-QR-${showQRModal.id}`)}`}
              alt="QR Code"
              className="h-44 w-44 mx-auto bg-white p-2 rounded-2xl border border-border"
            />
            <div className="font-mono text-xs font-bold text-primary">TZ-QR-{showQRModal.id}</div>
            <button onClick={() => setShowQRModal(null)} className="w-full py-2 bg-secondary text-foreground text-xs font-bold rounded-xl cursor-pointer">
              Close QR Viewer
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
