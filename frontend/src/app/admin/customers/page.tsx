/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  FileText, 
  PlusCircle, 
  X, 
  Loader2,
  Phone,
  Mail,
  User,
  History,
  Building,
  AlertTriangle
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/context/admin-auth-context';

export default function CustomersPage() {
  const { adminUser: _adminUser } = useAdminAuth();
  
  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Data States
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  const [branches] = useState<{ id: string; name: string }[]>([
    { id: 'd1111111-1111-1111-1111-111111111111', name: 'Dhanmondi Head Office' },
    { id: 'b2222222-2222-2222-2222-222222222222', name: 'Banani Laboratory' },
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Mirpur Express Desk' }
  ]);

  // Create Customer Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerBranchId, setCustomerBranchId] = useState('d1111111-1111-1111-1111-111111111111');
  const [customerTags, setCustomerTags] = useState<string[]>(['Regular']);
  const [newTagInput, setNewTagInput] = useState('');

  // Timeline Action States
  const [commType, setCommType] = useState('SMS');
  const [commMessage, setCommMessage] = useState('');
  const [commLoading, setCommLoading] = useState(false);

  const [fileName, setFileName] = useState('');
  const [docLoading, setDocLoading] = useState(false);

  // Dashboard Stats State
  const [stats, setStats] = useState<any>({
    totalCustomers: 0,
    activeCustomers: 0,
    returningCustomers: 0,
    vipCustomers: 0,
    growthRate: 0,
    totalDevices: 0,
  });

  // Device Modal State
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceBrand, setDeviceBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceSerial, setDeviceSerial] = useState('');
  const [deviceImei, setDeviceImei] = useState('');
  const [deviceLoading, setDeviceLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.customers.dashboardStats(branchFilter || undefined, token);
      if (res && res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching customer stats:', err);
    }
  }, [branchFilter]);

  // Fetch Customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.customers.list(
        { 
          search: search || undefined,
          tag: tagFilter || undefined,
          branchId: branchFilter || undefined,
        },
        token
      );
      if (res && res.success) {
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
        setCustomers(items);
      } else {
        setError(res.message || 'Failed to fetch customers');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter, branchFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
      fetchStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchCustomers, fetchStats]);

  // Fetch Single Customer Details
  const fetchCustomerDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.customers.get(id, token);
      if (res && res.success) {
        setSelectedCustomer(res.data);
      }
    } catch (err: any) {
      console.error('Error loading customer details', err);
    }
  };

  // Create Customer Form Submission
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.customers.create({
        firstName,
        lastName,
        email,
        phone,
        branchId: customerBranchId,
        tags: customerTags,
      }, token);

      if (res && res.success) {
        setIsCreateModalOpen(false);
        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setCustomerTags(['Regular']);
        fetchCustomers();
      } else {
        setModalError(res.message || 'Failed to create customer');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error connecting to server.');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to soft delete this customer profile?')) return;
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.customers.delete(id, token);
      setSelectedCustomer(null);
      fetchCustomers();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer.');
    }
  };

  // Add Device Handler
  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setDeviceLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.customers.addDevice(selectedCustomer.id, {
        brand: deviceBrand,
        model: deviceModel,
        serialNumber: deviceSerial || undefined,
        imei: deviceImei || undefined,
      }, token);

      if (res && res.success) {
        setIsDeviceModalOpen(false);
        setDeviceModel('');
        setDeviceSerial('');
        setDeviceImei('');
        fetchCustomerDetails(selectedCustomer.id);
        fetchStats();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add device.');
    } finally {
      setDeviceLoading(false);
    }
  };

  // Add communication log
  const handleLogComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !commMessage.trim()) return;
    setCommLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.customers.logComm(selectedCustomer.id, {
        type: commType,
        message: commMessage,
      }, token);
      setCommMessage('');
      fetchCustomerDetails(selectedCustomer.id);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCommLoading(false);
    }
  };

  // Add mock document log
  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !fileName.trim()) return;
    setDocLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.customers.uploadDoc(selectedCustomer.id, {
        fileName: fileName.trim(),
        fileUrl: `/uploads/docs/${fileName.trim().toLowerCase().replace(/ /g, '_')}`,
        fileSize: Math.floor(Math.random() * 500000) + 50000,
      }, token);
      setFileName('');
      fetchCustomerDetails(selectedCustomer.id);
    } catch (err: any) {
      console.error(err);
    } finally {
      setDocLoading(false);
    }
  };

  const addTag = () => {
    if (newTagInput.trim() && !customerTags.includes(newTagInput.trim())) {
      setCustomerTags([...customerTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCustomerTags(customerTags.filter(t => t !== tagToRemove));
  };

  // Get tag color scheme
  const getTagColor = (tag: string) => {
    switch (tag.toUpperCase()) {
      case 'VIP': return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'CORPORATE': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'BLACKLISTED': return 'bg-red-500/10 text-red-400 border border-red-500/30';
      default: return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-slate-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <Users className="h-8 w-8 text-indigo-500" />
                Customer Directory
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage profiles, track timelines, analyze tags, and log client communications.
              </p>
            </div>
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="h-5 w-5" />
              Register Customer
            </button>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400">Total Customers</div>
              <div className="text-2xl font-bold text-white mt-1">{stats.totalCustomers || 0}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400">Active Clients</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.activeCustomers || 0}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400">Returning</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">{stats.returningCustomers || 0}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400">VIP Members</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{stats.vipCustomers || 0}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400">Monthly Growth</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">+{stats.growthRate || 0}%</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400">Total Devices</div>
              <div className="text-2xl font-bold text-purple-400 mt-1">{stats.totalDevices || 0}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input 
                type="text"
                placeholder="Search name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
              >
                <option value="">All Labels</option>
                <option value="VIP">VIP</option>
                <option value="Corporate">Corporate</option>
                <option value="Regular">Regular</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>
          </div>

          {/* List/Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-xl">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  <span className="text-slate-400 mt-2 text-sm">Fetching customer logs...</span>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              ) : customers.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
                  No matching customers found.
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase bg-slate-950/50">
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Labels</th>
                        <th className="p-4">Loyalty</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {customers.map((c) => (
                        <tr 
                          key={c.id}
                          className={`hover:bg-slate-800/40 cursor-pointer transition ${selectedCustomer?.id === c.id ? 'bg-indigo-950/20' : ''}`}
                          onClick={() => fetchCustomerDetails(c.id)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 font-bold uppercase border border-slate-700">
                                {c.firstName[0]}{c.lastName[0]}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{c.firstName} {c.lastName}</h3>
                                <div className="text-xs text-slate-400 flex flex-col sm:flex-row sm:gap-2 mt-0.5">
                                  <span>{c.email}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{c.phone}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {c.tags?.map((t: string) => (
                                <span key={t} className={`text-[10px] px-2 py-0.5 rounded font-medium ${getTagColor(t)}`}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-emerald-400 font-bold">{c.loyaltyPoints} pts</span>
                          </td>
                          <td className="p-4 text-right">
                            <button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium bg-indigo-500/10 px-3 py-1 rounded">
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Profile Detail Pane */}
            <div>
              {selectedCustomer ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedCustomer.firstName} {selectedCustomer.lastName}</h2>
                        <span className="text-xs text-indigo-400 font-medium">Customer Profile</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedCustomer(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCustomer.tags?.map((t: string) => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded font-semibold ${getTagColor(t)}`}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Building className="h-4 w-4 text-slate-500" />
                      <span>Registered Branch ID: {selectedCustomer.branchId?.substring(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Communication & Doc Logs Form */}
                  <div className="border-t border-slate-800 pt-4 space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> Log Communication
                    </h3>
                    <form onSubmit={handleLogComm} className="space-y-3">
                      <div className="flex gap-2">
                        <select
                          value={commType}
                          onChange={(e) => setCommType(e.target.value)}
                          className="bg-slate-950 border border-slate-850 px-2 py-1.5 rounded text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="SMS">SMS</option>
                          <option value="Email">Email</option>
                          <option value="WhatsApp">WhatsApp</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Type communication message logs..."
                          value={commMessage}
                          onChange={(e) => setCommMessage(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={commLoading || !commMessage}
                          className="bg-indigo-600 text-xs text-white px-3 py-1.5 rounded font-medium disabled:opacity-40"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Document upload form */}
                  <div className="border-t border-slate-800 pt-4 space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Upload Document Metadata
                    </h3>
                    <form onSubmit={handleAddDoc} className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="fileName (e.g. PurchaseReceipt.pdf)"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={docLoading || !fileName}
                          className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded font-medium border border-slate-700 disabled:opacity-45"
                        >
                          Upload
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Timeline History */}
                  <div className="border-t border-slate-800 pt-4 space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <History className="h-4 w-4" /> Timeline History
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {selectedCustomer.timeline?.map((item: any, idx: number) => (
                        <div key={idx} className="relative pl-4 border-l border-slate-800 pb-1">
                          <div className="absolute left-[-4.5px] top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-semibold text-white">{item.title}</span>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {item.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2 sticky top-6">
                  <User className="h-10 w-10 text-slate-600" />
                  <p className="text-sm">Select a customer from the left list to view profiles, document logs, and timelines.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="h-6 w-6 text-indigo-500" />
                Register New Customer
              </h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Rafiq"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Karim"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="rafiq.k@gmail.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="01711122233"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Branch</label>
                <select
                  value={customerBranchId}
                  onChange={(e) => setCustomerBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Tag Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client labels</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {customerTags.map(tag => (
                    <span 
                      key={tag} 
                      className={`text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1 ${getTagColor(tag)}`}
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-[10px] hover:text-white">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="VIP, Corporate, Regular, Blacklisted..."
                    className="flex-1 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg text-slate-200 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200 border border-slate-700"
                  >
                    Add Label
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                  {modalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
