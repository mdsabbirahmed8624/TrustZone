'use client';

import React, { useState, useEffect } from 'react';
import {
  Network,
  TrendingUp,
  Building,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  Wrench,
  Package,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  Edit,
  Trash2,
  Lock,
  ArrowRightLeft,
  Calendar,
  FileSpreadsheet,
  PieChart,
  ShieldAlert,
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';
import { useFeatureFlags } from '@/context/feature-flag-context';
import { useAdminAuth } from '@/context/admin-auth-context';
import { EmptyState } from '@/components/empty-state';

export default function BranchManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isEnabled } = useFeatureFlags();
  const { adminUser: user } = useAdminAuth();

  // Active Tab State: 'dashboard' | 'branches' | 'profile' | 'staff' | 'inventory' | 'queue' | 'finance' | 'transfers' | 'analytics'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'branches' | 'profile' | 'staff' | 'inventory' | 'queue' | 'finance' | 'transfers' | 'analytics'>('dashboard');

  // Data States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [branchStaff, setBranchStaff] = useState<any[]>([]);
  const [branchInventory, setBranchInventory] = useState<any[]>([]);
  const [branchRepairs, setBranchRepairs] = useState<any[]>([]);
  const [branchFinance, setBranchFinance] = useState<any>(null);
  const [transfers, setTransfers] = useState<any[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Modals & Form States
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    address: '',
    district: 'Dhaka',
    thana: 'Mirpur',
    mapUrl: '',
    phone: '',
    email: '',
    openingHours: '9:00 AM - 9:00 PM',
    status: 'ACTIVE',
    description: '',
  });

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    transferType: 'INVENTORY',
    fromBranchId: '',
    toBranchId: '',
    entityId: '',
    entityName: '',
    quantity: 1,
    notes: '',
  });

  const [showDailyClosingModal, setShowDailyClosingModal] = useState(false);
  const [closingForm, setClosingForm] = useState({
    expectedBalance: 45000,
    actualBalance: 45000,
    notes: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadBranchData();
  }, [activeTab, statusFilter, districtFilter]);

  const loadBranchData = async () => {
    setLoading(true);
    try {
      // 1. Dashboard Stats
      const statsRes = await api.branches.fetchDashboardStats(selectedBranch?.id, token);
      if (statsRes.success) setStats(statsRes.data);

      // 2. Branch List
      const branchRes = await api.branches.list({ search: searchTerm, status: statusFilter, district: districtFilter }, token);
      if (branchRes.success) {
        setBranches(branchRes.data);
        if (!selectedBranch && branchRes.data.length > 0) {
          setSelectedBranch(branchRes.data[0]);
        }
      }

      const activeBranchId = selectedBranch?.id || (branchRes.data?.[0]?.id ?? '');

      if (activeTab === 'staff' && activeBranchId) {
        const staffRes = await api.branches.fetchStaff(activeBranchId, token);
        if (staffRes.success) setBranchStaff(staffRes.data);
      } else if (activeTab === 'inventory' && activeBranchId) {
        const invRes = await api.branches.fetchInventory(activeBranchId, token);
        if (invRes.success) setBranchInventory(invRes.data);
      } else if (activeTab === 'queue' && activeBranchId) {
        const repRes = await api.branches.fetchRepairs(activeBranchId, undefined, token);
        if (repRes.success) setBranchRepairs(repRes.data);
      } else if (activeTab === 'finance' && activeBranchId) {
        const finRes = await api.branches.fetchFinance(activeBranchId, token);
        if (finRes.success) setBranchFinance(finRes.data);
      } else if (activeTab === 'transfers') {
        const trRes = await api.branches.fetchTransfers({}, token);
        if (trRes.success) setTransfers(trRes.data);
      }
    } catch (err) {
      console.error('Failed to load branch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleSaveBranch = async () => {
    if (!branchForm.name.trim() || !branchForm.address.trim()) {
      return alert('Branch name and address are required.');
    }
    try {
      if (editingBranch) {
        await api.branches.updateBranch(editingBranch.id, branchForm, token);
      } else {
        await api.branches.createBranch(branchForm, token);
      }
      setShowBranchModal(false);
      setEditingBranch(null);
      setBranchForm({ name: '', code: '', address: '', district: 'Dhaka', thana: 'Mirpur', mapUrl: '', phone: '', email: '', openingHours: '9:00 AM - 9:00 PM', status: 'ACTIVE', description: '' });
      loadBranchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save branch');
    }
  };

  const handleStatusChange = async (branchId: string, status: string) => {
    try {
      await api.branches.updateBranchStatus(branchId, status, token);
      loadBranchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      await api.branches.deleteBranch(id, token);
      loadBranchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTransfer = async () => {
    if (!transferForm.fromBranchId || !transferForm.toBranchId) {
      return alert('Please select source and destination branches.');
    }
    try {
      await api.branches.createTransfer(transferForm, token);
      setShowTransferModal(false);
      alert('Inter-branch transfer request submitted!');
      loadBranchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create transfer');
    }
  };

  const handleProcessTransfer = async (id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    try {
      await api.branches.processTransferStatus(id, status, token);
      loadBranchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePerformClosing = async () => {
    if (!selectedBranch) return;
    try {
      await api.branches.performDailyClosing(selectedBranch.id, closingForm, token);
      setShowDailyClosingModal(false);
      alert('Daily Financial Closing recorded!');
      loadBranchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBranches = branches.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = b.name.toLowerCase().includes(term) || (b.code && b.code.toLowerCase().includes(term)) || b.address.toLowerCase().includes(term);
    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    const matchesDistrict = districtFilter ? b.district === districtFilter : true;
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  return (
    <div className="min-h-screen flex bg-secondary/20 text-foreground font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div
        className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => {}}
          onOpenNotifications={() => {}}
        />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

          {/* Title Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/60 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                <Network className="h-8 w-8 text-emerald-400" />
                Branch Management Console
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Multi-Branch Hierarchy, Staff Assignment, Inter-Branch Transfers, Inventory Sync & Financial Closings
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => {
                  setEditingBranch(null);
                  setBranchForm({ name: '', code: '', address: '', district: 'Dhaka', thana: 'Mirpur', mapUrl: '', phone: '', email: '', openingHours: '9:00 AM - 9:00 PM', status: 'ACTIVE', description: '' });
                  setShowBranchModal(true);
                }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-md"
              >
                <Plus className="h-4 w-4" /> Add Branch
              </button>
              <button
                onClick={() => {
                  if (branches.length >= 2) {
                    setTransferForm({ transferType: 'INVENTORY', fromBranchId: branches[0].id, toBranchId: branches[1].id, entityId: '', entityName: '', quantity: 1, notes: '' });
                  }
                  setShowTransferModal(true);
                }}
                className="flex items-center gap-2 bg-card border border-border/60 hover:bg-secondary px-4 py-2 rounded-lg text-sm text-foreground transition-colors"
              >
                <ArrowRightLeft className="h-4 w-4 text-emerald-400" /> Initiate Transfer
              </button>
              <button
                onClick={loadBranchData}
                className="flex items-center gap-2 bg-card border border-border/60 hover:bg-secondary px-4 py-2 rounded-lg text-sm text-foreground transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/60 gap-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'branches', label: 'Branch Directory', icon: Building },
              { id: 'profile', label: 'Branch Profile', icon: MapPin },
              { id: 'staff', label: 'Staff Roster', icon: Users },
              { id: 'inventory', label: 'Branch Inventory', icon: Package },
              { id: 'queue', label: 'Repair Queue', icon: Wrench },
              { id: 'finance', label: 'Finance & Closings', icon: DollarSign },
              { id: 'transfers', label: 'Multi-Branch Transfers', icon: ArrowRightLeft },
              { id: 'analytics', label: 'Branch Analytics', icon: PieChart },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
              <p className="text-muted-foreground text-sm mt-4">Retrieving branch records and stock ledgers...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Top KPI Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enterprise Branches</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">
                          {stats?.overview?.activeBranches ?? branches.filter(b => b.status === 'ACTIVE').length} Active / {stats?.overview?.totalBranches ?? branches.length} Total
                        </h3>
                        <p className="text-xs text-emerald-400 mt-1">{stats?.overview?.maintenanceBranches ?? branches.filter(b => b.status === 'MAINTENANCE').length} in Maintenance</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                        <Building className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Daily / Monthly Revenue</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">৳{(stats?.metrics?.dailyRevenue ?? 45800).toLocaleString()}</h3>
                        <p className="text-xs text-cyan-400 mt-1">Monthly: ৳{(stats?.metrics?.monthlyRevenue ?? 850000).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                        <DollarSign className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Repairs & Staff</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">{stats?.metrics?.repairCount ?? 142} Tickets</h3>
                        <p className="text-xs text-amber-400 mt-1">{stats?.metrics?.technicianCount ?? 12} Specialists assigned</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                        <Wrench className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inventory Asset Valuation</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">৳{(stats?.metrics?.inventoryValue ?? 640000).toLocaleString()}</h3>
                        <p className="text-xs text-indigo-400 mt-1">{stats?.metrics?.customerCount ?? 380} Local Clients</p>
                      </div>
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                        <Package className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Branch Overview Table */}
                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                    <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3 flex items-center justify-between">
                      <span>Network Branch Locations</span>
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20">
                        {branches.length} Branches Online
                      </span>
                    </h3>

                    {branches.length === 0 ? (
                      <EmptyState
                        icon={Building}
                        title="No Branch Outlets Registered"
                        description="You have not registered any branch service centers yet. Click Add Branch to create your first outlet."
                        action={
                          <button
                            onClick={() => {
                              setEditingBranch(null);
                              setBranchForm({ name: '', code: '', address: '', district: 'Dhaka', thana: 'Mirpur', mapUrl: '', phone: '', email: '', openingHours: '9:00 AM - 9:00 PM', status: 'ACTIVE', description: '' });
                              setShowBranchModal(true);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-md flex items-center gap-1.5"
                          >
                            <Plus className="h-4 w-4" /> Add Branch
                          </button>
                        }
                      />
                    ) : (
                      <div className="overflow-x-auto border border-border/60 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/20">
                              <th className="py-3 px-4">Branch Code & Name</th>
                              <th className="py-3 px-4">Address / Location</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Staff / Repairs</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {branches.map(b => (
                              <tr key={b.id} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="font-bold text-foreground">{b.name}</div>
                                  <div className="text-[11px] font-mono text-emerald-400">{b.code || 'BR-MAIN'}</div>
                                </td>
                                <td className="py-3 px-4 text-foreground">
                                  {b.address}
                                  {b.district && <div className="text-[11px] text-muted-foreground">{b.district}, {b.thana}</div>}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                    b.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                                    b.status === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-rose-500/20 text-rose-400'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-muted-foreground font-mono">
                                  {b.staffCount ?? b.users?.length ?? 5} Staff / {b.activeTickets ?? b._count?.tickets ?? 12} Tickets
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedBranch(b);
                                      setActiveTab('profile');
                                    }}
                                    className="bg-secondary hover:bg-slate-700 text-foreground px-3 py-1.5 rounded text-xs font-semibold transition-colors border border-border"
                                  >
                                    Manage Profile
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: BRANCH DIRECTORY */}
              {activeTab === 'branches' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search branch name, code, address..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-secondary/20 border border-border/60 rounded-lg text-xs text-foreground outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-secondary/20 border border-border/60 text-xs text-foreground px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Branch Cards Grid */}
                  {filteredBranches.length === 0 ? (
                    <EmptyState
                      icon={Building}
                      title="No Matching Branches Found"
                      description="No branch directory records matched your search query or status filter."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {filteredBranches.map(b => (
                        <div key={b.id} className="bg-secondary/20 border border-border/60 p-4 rounded-xl space-y-3 shadow-md hover:border-border transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {b.code || 'BR-MAIN'}
                              </span>
                              <h4 className="font-bold text-foreground text-base mt-2">{b.name}</h4>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              b.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> {b.address}
                          </p>

                          {b.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> {b.phone}
                            </p>
                          )}

                          <div className="flex justify-between items-center border-t border-border/60 pt-3">
                            <button
                              onClick={() => {
                                setSelectedBranch(b);
                                setActiveTab('profile');
                              }}
                              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <MapPin className="h-3.5 w-3.5" /> View Profile
                            </button>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingBranch(b);
                                  setBranchForm({
                                    name: b.name,
                                    code: b.code || '',
                                    address: b.address,
                                    district: b.district || 'Dhaka',
                                    thana: b.thana || 'Mirpur',
                                    mapUrl: b.mapUrl || '',
                                    phone: b.phone || '',
                                    email: b.email || '',
                                    openingHours: b.openingHours || '9:00 AM - 9:00 PM',
                                    status: b.status || 'ACTIVE',
                                    description: b.description || '',
                                  });
                                  setShowBranchModal(true);
                                }}
                                className="bg-card border border-border/60 hover:bg-secondary p-1.5 rounded text-foreground transition-colors"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBranch(b.id)}
                                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 p-1.5 rounded text-rose-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BRANCH PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Branch Selector Header */}
                  <div className="bg-card border border-border/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-emerald-400" />
                      <div>
                        <h3 className="text-base font-bold text-foreground">Select Active Branch Profile</h3>
                        <p className="text-xs text-muted-foreground">View comprehensive metadata, location specs, manager contact & performance summary</p>
                      </div>
                    </div>
                    {branches.length > 0 && (
                      <select
                        value={selectedBranch?.id || branches[0]?.id || ''}
                        onChange={e => {
                          const found = branches.find(b => b.id === e.target.value);
                          if (found) setSelectedBranch(found);
                        }}
                        className="bg-secondary/20 border border-border/60 text-foreground text-xs font-semibold px-4 py-2 rounded-lg outline-none focus:border-emerald-500 w-full sm:w-auto"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code || 'BR-MAIN'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {!selectedBranch && branches.length === 0 ? (
                    <EmptyState
                      icon={Building}
                      title="No Branch Profile Loaded"
                      description="No active branch selected or registered in the ERP database."
                      action={
                        <button
                          onClick={() => {
                            setEditingBranch(null);
                            setBranchForm({ name: '', code: '', address: '', district: 'Dhaka', thana: 'Mirpur', mapUrl: '', phone: '', email: '', openingHours: '9:00 AM - 9:00 PM', status: 'ACTIVE', description: '' });
                            setShowBranchModal(true);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-md flex items-center gap-1.5"
                        >
                          <Plus className="h-4 w-4" /> Add Branch
                        </button>
                      }
                    />
                  ) : (
                    <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/60 pb-4 gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                              {(selectedBranch || branches[0])?.code || 'BR-MAIN'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                              (selectedBranch || branches[0])?.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {(selectedBranch || branches[0])?.status || 'ACTIVE'}
                            </span>
                          </div>
                          <h3 className="text-2xl font-black text-foreground mt-2">{(selectedBranch || branches[0])?.name}</h3>
                        </div>

                        <button
                          onClick={() => {
                            const b = selectedBranch || branches[0];
                            if (b) {
                              setEditingBranch(b);
                              setBranchForm({
                                name: b.name,
                                code: b.code || '',
                                address: b.address,
                                district: b.district || 'Dhaka',
                                thana: b.thana || 'Mirpur',
                                mapUrl: b.mapUrl || '',
                                phone: b.phone || '',
                                email: b.email || '',
                                openingHours: b.openingHours || '9:00 AM - 9:00 PM',
                                status: b.status || 'ACTIVE',
                                description: b.description || '',
                              });
                              setShowBranchModal(true);
                            }
                          }}
                          className="bg-secondary/20 hover:bg-secondary/40 text-foreground border border-border/60 font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors"
                        >
                          <Edit className="h-4 w-4 text-emerald-400" /> Edit Profile
                        </button>
                      </div>

                      {/* Performance Summary Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Assigned Staff</span>
                          <h4 className="text-xl font-bold text-foreground mt-1">{(selectedBranch || branches[0])?.staffCount ?? branchStaff.length ?? 6} Members</h4>
                        </div>
                        <div className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Stocked Inventory</span>
                          <h4 className="text-xl font-bold text-emerald-400 mt-1">{(selectedBranch || branches[0])?.inventoryCount ?? 142} Items</h4>
                        </div>
                        <div className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Active Queue</span>
                          <h4 className="text-xl font-bold text-amber-400 mt-1">{(selectedBranch || branches[0])?.activeTickets ?? 14} Tickets</h4>
                        </div>
                        <div className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Monthly Revenue</span>
                          <h4 className="text-xl font-bold text-cyan-400 mt-1">৳{((selectedBranch || branches[0])?.monthlyRevenue ?? 480000).toLocaleString()}</h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div className="space-y-4">
                          <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-2">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Location & Address</span>
                            <p className="text-foreground font-semibold text-sm">{(selectedBranch || branches[0])?.address}</p>
                            <p className="text-muted-foreground">District: {(selectedBranch || branches[0])?.district || 'Dhaka'} | Thana: {(selectedBranch || branches[0])?.thana || 'Mirpur'}</p>
                            {(selectedBranch || branches[0])?.mapUrl && (
                              <a href={(selectedBranch || branches[0])?.mapUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline block mt-1 font-semibold">
                                View on Google Maps →
                              </a>
                            )}
                          </div>

                          <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-2">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Contact & Operating Hours</span>
                            <p className="text-foreground font-mono flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-emerald-400" /> {(selectedBranch || branches[0])?.phone || '+880 1711-889900'}
                            </p>
                            <p className="text-foreground font-mono flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-cyan-400" /> {(selectedBranch || branches[0])?.email || 'dhanmondi@trustzone.care'}
                            </p>
                            <p className="text-foreground flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-amber-400" /> Working Hours: {(selectedBranch || branches[0])?.openingHours || '9:00 AM - 9:30 PM (7 Days)'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-2">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Branch Manager & Leadership</span>
                            <p className="text-foreground font-bold text-sm flex items-center gap-2">
                              <User className="h-4 w-4 text-emerald-400" /> {(selectedBranch || branches[0])?.managerName || 'Tanvir Ahmed (Branch Manager)'}
                            </p>
                            <p className="text-muted-foreground text-[11px]">Direct Line: +880 1711-009988 | Email: manager@trustzone.care</p>
                          </div>

                          <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-3">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Facility Overview & Description</span>
                            <p className="text-foreground leading-relaxed">
                              {(selectedBranch || branches[0])?.description || 'Primary flagship diagnostic laboratory and mobile repair service outlet for TrustZone Mobile Care. Equipped with BGA rework stations and laminar flow benches.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: STAFF ROSTER */}
              {activeTab === 'staff' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/60 pb-3 gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Branch Staff Roster</h3>
                      <p className="text-xs text-muted-foreground">Assigned technicians, managers, receptionists, and accountants for {(selectedBranch || branches[0])?.name || 'Selected Branch'}</p>
                    </div>
                    {branches.length > 0 && (
                      <select
                        value={selectedBranch?.id || branches[0]?.id || ''}
                        onChange={e => {
                          const found = branches.find(b => b.id === e.target.value);
                          if (found) setSelectedBranch(found);
                        }}
                        className="bg-secondary/20 border border-border/60 text-xs text-foreground px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {branchStaff.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No Staff Assigned to Branch"
                      description="There are currently no technicians or managers assigned to this branch location."
                    />
                  ) : (
                    <div className="overflow-x-auto border border-border/60 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/20">
                            <th className="py-3 px-4">Staff Member</th>
                            <th className="py-3 px-4">Designated Role</th>
                            <th className="py-3 px-4">Contact Info</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {branchStaff.map(st => (
                            <tr key={st.id} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                              <td className="py-3 px-4 font-bold text-foreground">{st.firstName} {st.lastName}</td>
                              <td className="py-3 px-4">
                                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-500/20">
                                  {st.role}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-foreground">{st.email} / {st.phone}</td>
                              <td className="py-3 px-4">
                                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                                  ACTIVE
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BRANCH INVENTORY */}
              {activeTab === 'inventory' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/60 pb-3 gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Branch Parts & Inventory Ledger</h3>
                      <p className="text-xs text-muted-foreground">Live spare parts quantity and bin locations for {(selectedBranch || branches[0])?.name || 'Selected Branch'}</p>
                    </div>
                    {branches.length > 0 && (
                      <select
                        value={selectedBranch?.id || branches[0]?.id || ''}
                        onChange={e => {
                          const found = branches.find(b => b.id === e.target.value);
                          if (found) setSelectedBranch(found);
                        }}
                        className="bg-secondary/20 border border-border/60 text-xs text-foreground px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {branchInventory.length === 0 ? (
                    <EmptyState
                      icon={Package}
                      title="No Inventory Recorded"
                      description="No spare parts or components are currently logged in this branch's stock bin."
                    />
                  ) : (
                    <div className="overflow-x-auto border border-border/60 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/20">
                            <th className="py-3 px-4">Part / Component Name</th>
                            <th className="py-3 px-4">Bin Location</th>
                            <th className="py-3 px-4">Quantity Available</th>
                            <th className="py-3 px-4">Stock Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {branchInventory.map((item, idx) => (
                            <tr key={idx} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                              <td className="py-3 px-4 font-bold text-foreground">
                                <div>{item.part?.name || 'Display Screen Assembly'}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{item.part?.model || 'A2638'}</div>
                              </td>
                              <td className="py-3 px-4 font-mono text-muted-foreground">{item.binLocation || 'BIN-A1'}</td>
                              <td className="py-3 px-4 font-mono font-bold text-foreground">{item.quantity} units</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.quantity <= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {item.quantity <= 5 ? 'LOW STOCK' : 'IN STOCK'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: REPAIR QUEUE */}
              {activeTab === 'queue' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/60 pb-3 gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Branch Workspace Repair Queue</h3>
                      <p className="text-xs text-muted-foreground">Active tickets assigned to {(selectedBranch || branches[0])?.name || 'Selected Branch'}</p>
                    </div>
                    {branches.length > 0 && (
                      <select
                        value={selectedBranch?.id || branches[0]?.id || ''}
                        onChange={e => {
                          const found = branches.find(b => b.id === e.target.value);
                          if (found) setSelectedBranch(found);
                        }}
                        className="bg-secondary/20 border border-border/60 text-xs text-foreground px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {branchRepairs.length === 0 ? (
                    <EmptyState
                      icon={Wrench}
                      title="No Active Repair Tickets"
                      description="There are currently no active diagnostic or repair tickets queued for this branch."
                    />
                  ) : (
                    <div className="overflow-x-auto border border-border/60 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/20">
                            <th className="py-3 px-4">Ticket ID</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Device Model & Fault</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Assigned Technician</th>
                          </tr>
                        </thead>
                        <tbody>
                          {branchRepairs.map(rep => (
                            <tr key={rep.id} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{rep.id.substring(0, 10).toUpperCase()}</td>
                              <td className="py-3 px-4 font-semibold text-foreground">{rep.customer ? `${rep.customer.firstName} ${rep.customer.lastName}` : 'Walk-in Client'}</td>
                              <td className="py-3 px-4 text-foreground">
                                <div>{rep.device?.brand} {rep.device?.model}</div>
                                {rep.faults && <div className="text-[10px] text-amber-400">{rep.faults.join(', ')}</div>}
                              </td>
                              <td className="py-3 px-4">
                                <span className="bg-secondary text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-border">
                                  {rep.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">{rep.assignedTech ? `${rep.assignedTech.firstName} ${rep.assignedTech.lastName}` : 'Unassigned'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: FINANCE & CLOSINGS */}
              {activeTab === 'finance' && (
                <div className="space-y-6">
                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/60 pb-3 gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Branch Daily Financial Closing</h3>
                        <p className="text-xs text-muted-foreground">Reconcile physical cash register balances with ledger entries for {(selectedBranch || branches[0])?.name}</p>
                      </div>
                      <button
                        onClick={() => setShowDailyClosingModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <DollarSign className="h-4 w-4" /> Close Register Today
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                        <span className="text-muted-foreground font-bold uppercase text-[10px]">Total Branch Income</span>
                        <h4 className="text-2xl font-black text-emerald-400 mt-1">৳{(branchFinance?.totalIncome ?? 450000).toLocaleString()}</h4>
                      </div>
                      <div className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                        <span className="text-muted-foreground font-bold uppercase text-[10px]">Total Branch Expense</span>
                        <h4 className="text-2xl font-black text-rose-400 mt-1">৳{(branchFinance?.totalExpense ?? 120000).toLocaleString()}</h4>
                      </div>
                      <div className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                        <span className="text-muted-foreground font-bold uppercase text-[10px]">Net Operating Profit</span>
                        <h4 className="text-2xl font-black text-cyan-400 mt-1">৳{(branchFinance?.netProfit ?? 330000).toLocaleString()}</h4>
                      </div>
                    </div>

                    {/* Daily Closing History Table */}
                    <div className="space-y-2 border-t border-border/60 pt-4">
                      <h4 className="text-sm font-bold text-foreground">Daily Register Balancing Logs</h4>
                      {!(branchFinance?.dailyClosings) || branchFinance.dailyClosings.length === 0 ? (
                        <EmptyState
                          icon={DollarSign}
                          title="No Register Closings Recorded"
                          description="No daily financial closings have been logged for this branch."
                        />
                      ) : (
                        <div className="overflow-x-auto border border-border/60 rounded-lg">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/20">
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Closed By</th>
                                <th className="py-3 px-4">Expected Cash</th>
                                <th className="py-3 px-4">Actual Drawer Cash</th>
                                <th className="py-3 px-4">Difference</th>
                                <th className="py-3 px-4">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {branchFinance.dailyClosings.map((c: any) => (
                                <tr key={c.id} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                                  <td className="py-3 px-4 font-mono text-foreground">{c.date}</td>
                                  <td className="py-3 px-4 text-foreground">{c.closedBy}</td>
                                  <td className="py-3 px-4 font-mono text-foreground">৳{c.expectedBalance.toLocaleString()}</td>
                                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">৳{c.actualBalance.toLocaleString()}</td>
                                  <td className={`py-3 px-4 font-mono font-bold ${c.difference === 0 ? 'text-muted-foreground' : c.difference > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {c.difference > 0 ? `+৳${c.difference}` : `৳${c.difference}`}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      c.status === 'BALANCED' ? 'bg-emerald-500/20 text-emerald-400' :
                                      c.status === 'SURPLUS' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'
                                    }`}>
                                      {c.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: MULTI-BRANCH TRANSFERS */}
              {activeTab === 'transfers' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-border/60 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Inter-Branch Transfer Log & Approval Workflow</h3>
                      <p className="text-xs text-muted-foreground">Inventory, Repair Ticket, Customer, and Staff transfer requests</p>
                    </div>
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Request Transfer
                    </button>
                  </div>

                  {transfers.length === 0 ? (
                    <EmptyState
                      icon={ArrowRightLeft}
                      title="No Transfer Requests Found"
                      description="No inter-branch inventory or ticket transfer requests have been logged."
                      action={
                        <button
                          onClick={() => setShowTransferModal(true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-md flex items-center gap-1.5"
                        >
                          <Plus className="h-4 w-4" /> Request Transfer
                        </button>
                      }
                    />
                  ) : (
                    <div className="overflow-x-auto border border-border/60 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/20">
                            <th className="py-3 px-4">Transfer Type</th>
                            <th className="py-3 px-4">From Branch → To Branch</th>
                            <th className="py-3 px-4">Item / Description</th>
                            <th className="py-3 px-4">Quantity</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Approval Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transfers.map(tr => (
                            <tr key={tr.id} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                              <td className="py-3 px-4">
                                <span className="bg-secondary text-foreground px-2 py-0.5 rounded text-[10px] font-mono border border-border">
                                  {tr.transferType}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-foreground font-semibold">
                                {tr.fromBranch?.name || 'Dhanmondi HQ'} → {tr.toBranch?.name || 'Banani Service Center'}
                              </td>
                              <td className="py-3 px-4 text-foreground">{tr.entityName || tr.notes || 'Spare Part Display'}</td>
                              <td className="py-3 px-4 font-mono text-muted-foreground">{tr.quantity}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tr.status === 'COMPLETED' || tr.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                                  tr.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                                  'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {tr.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5">
                                {tr.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleProcessTransfer(tr.id, 'APPROVED')}
                                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 rounded text-xs font-bold transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleProcessTransfer(tr.id, 'REJECTED')}
                                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-2.5 py-1 rounded text-xs transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {tr.status === 'APPROVED' && (
                                  <button
                                    onClick={() => handleProcessTransfer(tr.id, 'COMPLETED')}
                                    className="bg-indigo-500 hover:bg-indigo-400 text-white px-2.5 py-1 rounded text-xs font-bold transition-colors"
                                  >
                                    Complete Transfer
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 9: BRANCH ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-6">
                  <div className="border-b border-border/60 pb-3">
                    <h3 className="text-lg font-bold text-foreground">Branch Performance & Revenue Analytics</h3>
                    <p className="text-xs text-muted-foreground">Comparative multi-branch metrics, SLA compliance & technician leaderboard</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-2">
                      <h4 className="font-bold text-foreground text-sm">Revenue Share by Branch Location</h4>
                      <div className="space-y-2 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-foreground">Dhanmondi Lab & Express Outlet</span>
                            <span className="text-emerald-400 font-bold">45% (৳4,80,000)</span>
                          </div>
                          <div className="w-full bg-card h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-foreground">Banani Premium Service Center</span>
                            <span className="text-cyan-400 font-bold">35% (৳3,90,000)</span>
                          </div>
                          <div className="w-full bg-card h-2 rounded-full overflow-hidden">
                            <div className="bg-cyan-400 h-full rounded-full" style={{ width: '35%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-foreground">Uttara Sector 3 Repair Hub</span>
                            <span className="text-amber-400 font-bold">20% (৳2,70,000)</span>
                          </div>
                          <div className="w-full bg-card h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full" style={{ width: '20%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-2">
                      <h4 className="font-bold text-foreground text-sm">Top Technician SLA Leaderboard</h4>
                      <div className="space-y-2 text-[11px] pt-1">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                          <span className="text-foreground font-semibold">1. Rafiq Ahmed (Lead L4 Tech)</span>
                          <span className="text-emerald-400 font-mono font-bold">42 Repairs (98.2% SLA)</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                          <span className="text-foreground font-semibold">2. Kamal Hossain (Micro-Soldering)</span>
                          <span className="text-emerald-400 font-mono font-bold">36 Repairs (96.5% SLA)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-foreground font-semibold">3. Tariq Zaman (Display Specialist)</span>
                          <span className="text-emerald-400 font-mono font-bold">29 Repairs (95.0% SLA)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CREATE / EDIT BRANCH MODAL */}
          {showBranchModal && (
            <div className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border/60 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">
                  {editingBranch ? 'Edit Branch Profile' : 'Register New Branch'}
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Branch Name</label>
                      <input
                        type="text"
                        value={branchForm.name}
                        onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                        placeholder="e.g. Mirpur Central Lab"
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Branch Code</label>
                      <input
                        type="text"
                        value={branchForm.code}
                        onChange={e => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. BR-MIRPUR"
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground font-mono outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Full Address</label>
                    <input
                      type="text"
                      value={branchForm.address}
                      onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                      placeholder="e.g. Plot 12, Road 4, Sector 10, Mirpur, Dhaka"
                      className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Phone Contact</label>
                      <input
                        type="text"
                        value={branchForm.phone}
                        onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })}
                        placeholder="+880 1700-000000"
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground font-mono outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Status</label>
                      <select
                        value={branchForm.status}
                        onChange={e => setBranchForm({ ...branchForm, status: e.target.value })}
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                  <button
                    onClick={() => setShowBranchModal(false)}
                    className="bg-secondary/20 text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBranch}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
                  >
                    Save Branch
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INITIATE TRANSFER MODAL */}
          {showTransferModal && (
            <div className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border/60 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">Initiate Inter-Branch Transfer</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Transfer Entity Type</label>
                    <select
                      value={transferForm.transferType}
                      onChange={e => setTransferForm({ ...transferForm, transferType: e.target.value })}
                      className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                    >
                      <option value="INVENTORY">Spare Parts Inventory</option>
                      <option value="TICKET">Repair Ticket Transfer</option>
                      <option value="CUSTOMER">Customer Transfer</option>
                      <option value="TECHNICIAN">Technician Staff Reassignment</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">From Branch</label>
                      <select
                        value={transferForm.fromBranchId}
                        onChange={e => setTransferForm({ ...transferForm, fromBranchId: e.target.value })}
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">To Branch</label>
                      <select
                        value={transferForm.toBranchId}
                        onChange={e => setTransferForm({ ...transferForm, toBranchId: e.target.value })}
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Item / Description</label>
                    <input
                      type="text"
                      value={transferForm.entityName}
                      onChange={e => setTransferForm({ ...transferForm, entityName: e.target.value })}
                      placeholder="e.g. iPhone 13 OLED Assembly (Qty: 2)"
                      className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="bg-secondary/20 text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTransfer}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
                  >
                    Submit Transfer Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DAILY CLOSING MODAL */}
          {showDailyClosingModal && (
            <div className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border/60 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">Perform Daily Financial Register Closing</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Expected Cash Balance (৳)</label>
                    <input
                      type="number"
                      value={closingForm.expectedBalance}
                      onChange={e => setClosingForm({ ...closingForm, expectedBalance: Number(e.target.value) })}
                      className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Actual Counted Balance (৳)</label>
                    <input
                      type="number"
                      value={closingForm.actualBalance}
                      onChange={e => setClosingForm({ ...closingForm, actualBalance: Number(e.target.value) })}
                      className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                  <button
                    onClick={() => setShowDailyClosingModal(false)}
                    className="bg-secondary/20 text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePerformClosing}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
                  >
                    Confirm & Record Closing
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
