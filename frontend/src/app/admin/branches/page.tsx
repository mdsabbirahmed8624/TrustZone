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
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => {}}
          onOpenNotifications={() => {}}
        />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                <Network className="h-8 w-8 text-emerald-400" />
                Branch Management Console
              </h1>
              <p className="text-slate-400 text-sm mt-1">
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
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 transition-colors"
              >
                <ArrowRightLeft className="h-4 w-4 text-emerald-400" /> Initiate Transfer
              </button>
              <button
                onClick={loadBranchData}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
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
                      : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <p className="text-slate-400 text-sm mt-4">Retrieving branch records and stock ledgers...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && stats && (
                <div className="space-y-6">
                  {/* Top KPI Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise Branches</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">{stats.overview.activeBranches} Active / {stats.overview.totalBranches} Total</h3>
                        <p className="text-xs text-emerald-400 mt-1">{stats.overview.maintenanceBranches} in Maintenance</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                        <Building className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily / Monthly Revenue</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">৳{stats.metrics.dailyRevenue.toLocaleString()}</h3>
                        <p className="text-xs text-cyan-400 mt-1">Monthly: ৳{stats.metrics.monthlyRevenue.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                        <DollarSign className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repairs & Staff</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">{stats.metrics.repairCount} Tickets</h3>
                        <p className="text-xs text-amber-400 mt-1">{stats.metrics.technicianCount} Specialists assigned</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                        <Wrench className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Asset Valuation</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">৳{stats.metrics.inventoryValue.toLocaleString()}</h3>
                        <p className="text-xs text-indigo-400 mt-1">{stats.metrics.customerCount} Local Clients</p>
                      </div>
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                        <Package className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Branch Overview Table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-3 flex items-center justify-between">
                      <span>Network Branch Locations</span>
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20">
                        {branches.length} Branches Online
                      </span>
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                            <th className="py-3">Branch Code & Name</th>
                            <th className="py-3">Address / Location</th>
                            <th className="py-3">Status</th>
                            <th className="py-3">Staff / Repairs</th>
                            <th className="py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {branches.map(b => (
                            <tr key={b.id} className="border-b border-slate-850 hover:bg-slate-950/30">
                              <td className="py-3">
                                <div className="font-bold text-slate-200">{b.name}</div>
                                <div className="text-[11px] font-mono text-emerald-400">{b.code || 'BR-MAIN'}</div>
                              </td>
                              <td className="py-3 text-slate-300">
                                {b.address}
                                {b.district && <div className="text-[11px] text-slate-500">{b.district}, {b.thana}</div>}
                              </td>
                              <td className="py-3">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                  b.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                                  b.status === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3 text-slate-400 font-mono">
                                {b.users?.length || 0} Users / {b._count?.tickets || 0} Tickets
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedBranch(b);
                                    setActiveTab('profile');
                                  }}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-[11px] font-semibold transition-colors"
                                >
                                  Manage Profile
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRANCH DIRECTORY */}
              {activeTab === 'branches' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search branch name, code, address..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Branch Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredBranches.map(b => (
                      <div key={b.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {b.code || 'BR-MAIN'}
                            </span>
                            <h4 className="font-bold text-slate-100 text-base mt-2">{b.name}</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" /> {b.address}
                        </p>

                        {b.phone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                            <Phone className="h-3.5 w-3.5 text-slate-500" /> {b.phone}
                          </p>
                        )}

                        <div className="flex justify-between items-center border-t border-slate-850 pt-3">
                          <button
                            onClick={() => {
                              setSelectedBranch(b);
                              setActiveTab('staff');
                            }}
                            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Users className="h-3.5 w-3.5" /> Staff ({b.users?.length || 0})
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
                              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-1.5 rounded text-slate-300 transition-colors"
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
                </div>
              )}

              {/* TAB 3: BRANCH PROFILE */}
              {activeTab === 'profile' && selectedBranch && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {selectedBranch.code || 'BR-MAIN'}
                      </span>
                      <h3 className="text-xl font-bold text-slate-100 mt-1">{selectedBranch.name}</h3>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-xs font-bold">
                      {selectedBranch.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-3">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Location & Address</span>
                        <p className="text-slate-200 font-semibold">{selectedBranch.address}</p>
                        <p className="text-slate-400">District: {selectedBranch.district || 'Dhaka'} | Thana: {selectedBranch.thana || 'Mirpur'}</p>
                        {selectedBranch.mapUrl && (
                          <a href={selectedBranch.mapUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline block mt-1">
                            View on Google Maps →
                          </a>
                        )}
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact & Support</span>
                        <p className="text-slate-200 font-mono flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-emerald-400" /> {selectedBranch.phone || '+880 1700-000000'}
                        </p>
                        <p className="text-slate-200 font-mono flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-cyan-400" /> {selectedBranch.email || 'branch@trustzone.care'}
                        </p>
                        <p className="text-slate-400 flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-amber-400" /> Hours: {selectedBranch.openingHours || '9:00 AM - 9:00 PM'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Branch Overview & Description</span>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedBranch.description || 'Primary flagship diagnostic laboratory and mobile repair service outlet for TrustZone Mobile Care.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STAFF ROSTER */}
              {activeTab === 'staff' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">Branch Staff Roster</h3>
                      <p className="text-xs text-slate-400">Assigned technicians, managers, receptionists, and accountants</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3">Staff Name</th>
                          <th className="py-3">Role</th>
                          <th className="py-3">Contact</th>
                          <th className="py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branchStaff.map(st => (
                          <tr key={st.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 font-bold text-slate-200">{st.firstName} {st.lastName}</td>
                            <td className="py-3">
                              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-500/20">
                                {st.role}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-slate-300">{st.email} / {st.phone}</td>
                            <td className="py-3">
                              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                                ACTIVE
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: BRANCH INVENTORY */}
              {activeTab === 'inventory' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-200">Branch Parts & Inventory Ledger</h3>
                    <p className="text-xs text-slate-400">Live spare parts quantity and bin locations for the selected branch</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3">Part Name</th>
                          <th className="py-3">Bin Location</th>
                          <th className="py-3">Quantity Available</th>
                          <th className="py-3">Stock Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branchInventory.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 font-bold text-slate-200">{item.part?.name || 'Screen Assembly'}</td>
                            <td className="py-3 font-mono text-slate-400">{item.binLocation || 'BIN-A1'}</td>
                            <td className="py-3 font-mono font-bold text-slate-100">{item.quantity} units</td>
                            <td className="py-3">
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
                </div>
              )}

              {/* TAB 6: REPAIR QUEUE */}
              {activeTab === 'queue' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-200">Branch Workspace Repair Queue</h3>
                    <p className="text-xs text-slate-400">Active tickets assigned to this branch</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3">Ticket ID</th>
                          <th className="py-3">Customer</th>
                          <th className="py-3">Device Model</th>
                          <th className="py-3">Status</th>
                          <th className="py-3">Technician</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branchRepairs.map(rep => (
                          <tr key={rep.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 font-mono text-emerald-400 font-bold">{rep.id.substring(0, 8)}</td>
                            <td className="py-3 font-semibold text-slate-200">{rep.customer ? `${rep.customer.firstName} ${rep.customer.lastName}` : 'N/A'}</td>
                            <td className="py-3 text-slate-300">{rep.device?.brand} {rep.device?.model}</td>
                            <td className="py-3">
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                {rep.status}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400">{rep.assignedTech ? `${rep.assignedTech.firstName} ${rep.assignedTech.lastName}` : 'Unassigned'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: FINANCE & CLOSINGS */}
              {activeTab === 'finance' && (
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-200">Branch Daily Financial Closing</h3>
                        <p className="text-xs text-slate-400">Reconcile physical cash register balances with ledger entries</p>
                      </div>
                      <button
                        onClick={() => setShowDailyClosingModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <DollarSign className="h-3.5 w-3.5" /> Close Register Today
                      </button>
                    </div>

                    {branchFinance && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                          <span className="text-slate-400 font-bold uppercase">Total Branch Income</span>
                          <h4 className="text-xl font-bold text-emerald-400 mt-1">৳{branchFinance.totalIncome.toLocaleString()}</h4>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                          <span className="text-slate-400 font-bold uppercase">Total Branch Expense</span>
                          <h4 className="text-xl font-bold text-rose-400 mt-1">৳{branchFinance.totalExpense.toLocaleString()}</h4>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                          <span className="text-slate-400 font-bold uppercase">Net Operating Profit</span>
                          <h4 className="text-xl font-bold text-cyan-400 mt-1">৳{branchFinance.netProfit.toLocaleString()}</h4>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: MULTI-BRANCH TRANSFERS */}
              {activeTab === 'transfers' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">Inter-Branch Transfer Log & Approval Workflow</h3>
                      <p className="text-xs text-slate-400">Inventory, Repair Ticket, Customer, and Staff transfer requests</p>
                    </div>
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Request Transfer
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3">Transfer Type</th>
                          <th className="py-3">From Branch → To Branch</th>
                          <th className="py-3">Item / Description</th>
                          <th className="py-3">Quantity</th>
                          <th className="py-3">Status</th>
                          <th className="py-3 text-right">Approval Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfers.map(tr => (
                          <tr key={tr.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3">
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                                {tr.transferType}
                              </span>
                            </td>
                            <td className="py-3 text-slate-200 font-semibold">
                              {tr.fromBranch?.name} → {tr.toBranch?.name}
                            </td>
                            <td className="py-3 text-slate-300">{tr.entityName || tr.notes || 'Spare Part Display'}</td>
                            <td className="py-3 font-mono text-slate-400">{tr.quantity}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tr.status === 'COMPLETED' || tr.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                                tr.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {tr.status}
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-1.5">
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
                </div>
              )}

              {/* TAB 9: BRANCH ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-200">Branch Performance & Revenue Analytics</h3>
                    <p className="text-xs text-slate-400">Comparative multi-branch metrics and technician leaderboard</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <h4 className="font-bold text-slate-200 mb-2">Revenue Share by Branch</h4>
                      <p className="text-slate-400">Mirpur Central (45%), Downtown Desk (35%), Uttara Branch (20%)</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <h4 className="font-bold text-slate-200 mb-2">Technician Leaderboard</h4>
                      <p className="text-slate-400">Top technician: Rafiq Ahmed (42 Repairs Completed)</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CREATE / EDIT BRANCH MODAL */}
          {showBranchModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">
                  {editingBranch ? 'Edit Branch Profile' : 'Register New Branch'}
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Branch Name</label>
                      <input
                        type="text"
                        value={branchForm.name}
                        onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                        placeholder="e.g. Mirpur Central Lab"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Branch Code</label>
                      <input
                        type="text"
                        value={branchForm.code}
                        onChange={e => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. BR-MIRPUR"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Full Address</label>
                    <input
                      type="text"
                      value={branchForm.address}
                      onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                      placeholder="e.g. Plot 12, Road 4, Sector 10, Mirpur, Dhaka"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Phone Contact</label>
                      <input
                        type="text"
                        value={branchForm.phone}
                        onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })}
                        placeholder="+880 1700-000000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Status</label>
                      <select
                        value={branchForm.status}
                        onChange={e => setBranchForm({ ...branchForm, status: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  <button
                    onClick={() => setShowBranchModal(false)}
                    className="bg-slate-950 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold"
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
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">Initiate Inter-Branch Transfer</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Transfer Entity Type</label>
                    <select
                      value={transferForm.transferType}
                      onChange={e => setTransferForm({ ...transferForm, transferType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                    >
                      <option value="INVENTORY">Spare Parts Inventory</option>
                      <option value="TICKET">Repair Ticket Transfer</option>
                      <option value="CUSTOMER">Customer Transfer</option>
                      <option value="TECHNICIAN">Technician Staff Reassignment</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">From Branch</label>
                      <select
                        value={transferForm.fromBranchId}
                        onChange={e => setTransferForm({ ...transferForm, fromBranchId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">To Branch</label>
                      <select
                        value={transferForm.toBranchId}
                        onChange={e => setTransferForm({ ...transferForm, toBranchId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Item / Description</label>
                    <input
                      type="text"
                      value={transferForm.entityName}
                      onChange={e => setTransferForm({ ...transferForm, entityName: e.target.value })}
                      placeholder="e.g. iPhone 13 OLED Assembly (Qty: 2)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="bg-slate-950 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold"
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
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">Perform Daily Financial Register Closing</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Expected Cash Balance (৳)</label>
                    <input
                      type="number"
                      value={closingForm.expectedBalance}
                      onChange={e => setClosingForm({ ...closingForm, expectedBalance: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Actual Counted Balance (৳)</label>
                    <input
                      type="number"
                      value={closingForm.actualBalance}
                      onChange={e => setClosingForm({ ...closingForm, actualBalance: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  <button
                    onClick={() => setShowDailyClosingModal(false)}
                    className="bg-slate-950 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold"
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
