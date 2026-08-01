'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  Search, 
  Plus, 
  Filter, 
  User, 
  Clock, 
  AlertTriangle,
  Lock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api, TicketModel } from '@/lib/api';
import { useAdminAuth } from '@/context/admin-auth-context';

export default function RepairsQueuePage() {
  const { adminUser } = useAdminAuth();
  
  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Data States
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [branches] = useState<{ id: string; name: string }[]>([
    { id: 'd1111111-1111-1111-1111-111111111111', name: 'Dhanmondi Head Office' },
    { id: 'b2222222-2222-2222-2222-222222222222', name: 'Banani Laboratory' },
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Mirpur Express Desk' }
  ]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // New Ticket Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // New Ticket Form State
  const [customerId, setCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [deviceId, setDeviceId] = useState('');
  const [newDevice, setNewDevice] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    imei: '',
  });
  const [faults, setFaults] = useState<string[]>([]);
  const [newFault, setNewFault] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('0');
  const [slaDeadline, setSlaDeadline] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    return tomorrow.toISOString().substring(0, 16);
  });
  const [ticketBranchId, setTicketBranchId] = useState('d1111111-1111-1111-1111-111111111111');

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.tickets.list(
        { 
          branchId: branchFilter || undefined,
        },
        token
      );
      if (res && res.success) {
        setTickets(res.data);
      } else {
        setError(res.message || 'Failed to fetch tickets');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Connection error. Could not reach backend.');
    } finally {
      setLoading(false);
    }
  }, [branchFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  // Set default branch in modal based on user branch
  useEffect(() => {
    if (adminUser?.branchId) {
      setTimeout(() => setTicketBranchId(adminUser.branchId || ''), 0);
    } else if (branches.length > 0) {
      setTimeout(() => setTicketBranchId(branches[0].id), 0);
    }
  }, [adminUser, branches]);

  // Handle Add Fault
  const handleAddFault = () => {
    if (newFault.trim()) {
      setFaults([...faults, newFault.trim()]);
      setNewFault('');
    }
  };

  // Handle Remove Fault
  const handleRemoveFault = (idx: number) => {
    setFaults(faults.filter((_, i) => i !== idx));
  };

  // Handle Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      
      const payload: {
        branchId: string;
        slaDeadline: string;
        estimatedCost: number;
        faults: string[];
        customerId?: string;
        customerFirstName?: string;
        customerLastName?: string;
        customerEmail?: string;
        customerPhone?: string;
        deviceId?: string;
        deviceBrand?: string;
        deviceModel?: string;
        deviceSerialNumber?: string;
        deviceImei?: string;
      } = {
        branchId: ticketBranchId,
        slaDeadline,
        estimatedCost: parseFloat(estimatedCost) || 0,
        faults,
      };

      if (customerId) {
        payload.customerId = customerId;
      } else {
        payload.customerFirstName = newCustomer.firstName;
        payload.customerLastName = newCustomer.lastName;
        payload.customerEmail = newCustomer.email;
        payload.customerPhone = newCustomer.phone;
      }

      if (deviceId) {
        payload.deviceId = deviceId;
      } else {
        payload.deviceBrand = newDevice.brand;
        payload.deviceModel = newDevice.model;
        payload.deviceSerialNumber = newDevice.serialNumber;
        payload.deviceImei = newDevice.imei;
      }

      const res = await api.tickets.create(payload, token);

      if (res && res.success) {
        setIsModalOpen(false);
        // Reset form
        setCustomerId('');
        setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' });
        setDeviceId('');
        setNewDevice({ brand: '', model: '', serialNumber: '', imei: '' });
        setFaults([]);
        setEstimatedCost('0');
        fetchTickets();
      } else {
        setModalError(res.message || 'Failed to create ticket.');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setModalError(errorObj.message || 'Failed to submit ticket registration.');
    } finally {
      setModalLoading(false);
    }
  };

  // RBAC Permission check helper
  const canWrite = adminUser?.role === 'SUPER_ADMIN' || 
                   adminUser?.role === 'OWNER' || 
                   adminUser?.role === 'ADMIN' || 
                   adminUser?.permissions.includes('write:repairs') ||
                   adminUser?.permissions.includes('*');

  // Filtered tickets based on search query
  const filteredTickets = tickets.filter((t) => {
    const query = search.toLowerCase();
    const customerName = `${t.customer?.firstName || ''} ${t.customer?.lastName || ''}`.toLowerCase();
    const deviceModel = `${t.device?.brand || ''} ${t.device?.model || ''}`.toLowerCase();
    const serial = (t.device?.serialNumber || '').toLowerCase();
    const imei = (t.device?.imei || '').toLowerCase();
    const ticketId = t.id.toLowerCase();
    
    return customerName.includes(query) || 
           deviceModel.includes(query) || 
           serial.includes(query) || 
           imei.includes(query) || 
           ticketId.includes(query);
  });

  // Group tickets for Kanban
  const kanbanColumns = {
    booked: filteredTickets.filter(t => t.status === 'booked'),
    diagnosing: filteredTickets.filter(t => t.status === 'diagnosing'),
    repairing: filteredTickets.filter(t => t.status === 'repairing'),
    ready: filteredTickets.filter(t => t.status === 'ready'),
    delivered: filteredTickets.filter(t => t.status === 'delivered'),
  };

  // Helper to count tickets in status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'diagnosing': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'repairing': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'ready': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'delivered': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary animate-pulse" />
                Repairs & Diagnostics Workspace
              </h1>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Track hardware diagnostics, component test checklists, and device repairs.
              </p>
            </div>
            
            {/* New Ticket Trigger */}
            <div className="flex items-center gap-2">
              <div className="bg-card border border-border/80 rounded-lg p-0.5 flex">
                <button 
                  onClick={() => setViewMode('kanban')} 
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Kanban
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Table
                </button>
              </div>

              {canWrite ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/95 flex items-center gap-2 shadow-lg shadow-primary/10 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Check In Device
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-secondary text-muted-foreground/60 border border-border/80 rounded-xl text-xs font-bold flex items-center gap-2 cursor-not-allowed"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Check In Locked
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Booked Desk', count: kanbanColumns.booked.length, color: 'text-blue-500', bg: 'bg-blue-500/5' },
              { label: 'Under Diagnosis', count: kanbanColumns.diagnosing.length, color: 'text-amber-500', bg: 'bg-amber-500/5' },
              { label: 'Being Repaired', count: kanbanColumns.repairing.length, color: 'text-purple-500', bg: 'bg-purple-500/5' },
              { label: 'Ready for Collection', count: kanbanColumns.ready.length, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
              { label: 'Delivered Care', count: kanbanColumns.delivered.length, color: 'text-zinc-400', bg: 'bg-zinc-500/5' }
            ].map((col, idx) => (
              <div key={idx} className={`p-4 bg-card border border-border/60 rounded-2xl flex items-center justify-between`}>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">{col.label}</span>
                  <span className={`text-2xl font-black block ${col.color}`}>{col.count}</span>
                </div>
                <div className={`h-8 w-8 rounded-full ${col.bg} flex items-center justify-center`}>
                  <Wrench className={`h-4 w-4 ${col.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search ticket, customer name, device serial, IMEI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/35 border border-border/80 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground/80" />
                <span className="text-xs font-bold text-muted-foreground">Branch:</span>
              </div>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 bg-card border border-border/80 rounded-xl text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Core Content Area */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-xs font-semibold text-red-500">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-xs font-bold text-muted-foreground">Synchronizing repairs ledger...</span>
            </div>
          ) : (
            <>
              {viewMode === 'kanban' ? (
                /* Kanban View */
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start min-h-[500px]">
                  {(Object.keys(kanbanColumns) as Array<keyof typeof kanbanColumns>).map((status) => {
                    const columnTickets = kanbanColumns[status];
                    const columnName = status.charAt(0).toUpperCase() + status.slice(1);
                    return (
                      <div key={status} className="bg-card/40 border border-border/50 rounded-2xl p-4 flex flex-col gap-4">
                        {/* Column Header */}
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${getStatusColor(status)}`}>
                            {columnName}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground/80">{columnTickets.length}</span>
                        </div>

                        {/* Ticket Cards */}
                        <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                          {columnTickets.length === 0 ? (
                            <div className="py-8 text-center border border-dashed border-border/65 rounded-xl">
                              <span className="text-[10px] font-bold text-muted-foreground/60">No tickets in stage</span>
                            </div>
                          ) : (
                            columnTickets.map((ticket) => {
                              const isOverdue = new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'delivered';
                              return (
                                <Link
                                  href={`/admin/repairs/${ticket.id}`}
                                  key={ticket.id}
                                  className="group bg-card border border-border/80 hover:border-primary/45 rounded-xl p-3.5 space-y-3.5 hover:shadow-sm transition-all"
                                >
                                  {/* Top Row: Device */}
                                  <div>
                                    <h4 className="text-xs font-black text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                                      <span className="truncate">{ticket.device?.brand} {ticket.device?.model}</span>
                                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                                    </h4>
                                    <span className="text-[9px] font-semibold text-muted-foreground mt-0.5 block truncate">
                                      SN: {ticket.device?.serialNumber || 'N/A'}
                                    </span>
                                  </div>

                                  {/* Middle Row: Customer Info */}
                                  <div className="flex items-center gap-2 p-2 bg-secondary/25 border border-border/40 rounded-lg">
                                    <User className="h-3 w-3 text-muted-foreground/60" />
                                    <span className="text-[10px] font-bold text-foreground truncate">
                                      {ticket.customer?.firstName} {ticket.customer?.lastName}
                                    </span>
                                  </div>

                                  {/* SLA and Cost Row */}
                                  <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground pt-1 border-t border-border/40">
                                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {isOverdue ? 'SLA Overdue' : new Date(ticket.slaDeadline).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <span className="font-extrabold text-foreground">
                                      ৳{(ticket.estimatedCost || 0).toLocaleString()}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table View */
                <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-secondary/15 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          <th className="p-4">Ticket</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Device</th>
                          <th className="p-4">SLA Deadline</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Estimated Cost</th>
                          <th className="p-4">Assignee</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-xs font-semibold text-foreground">
                        {filteredTickets.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-muted-foreground">
                              No repair tickets found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredTickets.map((ticket) => {
                            const isOverdue = new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'delivered';
                            return (
                              <tr key={ticket.id} className="hover:bg-secondary/10 transition-colors">
                                <td className="p-4 font-bold text-primary truncate max-w-[100px]">
                                  #{ticket.id.substring(0, 8)}
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold">{ticket.customer?.firstName} {ticket.customer?.lastName}</span>
                                    <span className="text-[10px] text-muted-foreground">{ticket.customer?.phone}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold">{ticket.device?.brand} {ticket.device?.model}</span>
                                    <span className="text-[10px] text-muted-foreground">SN: {ticket.device?.serialNumber || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={isOverdue ? 'text-red-500 font-extrabold' : ''}>
                                    {new Date(ticket.slaDeadline).toLocaleString()}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                  </span>
                                </td>
                                <td className="p-4 font-black">
                                  ৳{(ticket.estimatedCost || 0).toLocaleString()}
                                </td>
                                <td className="p-4">
                                  {ticket.assignedTech ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary border border-border rounded-lg text-foreground">
                                      {ticket.assignedTech.firstName} {ticket.assignedTech.lastName[0]}.
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">Unassigned</span>
                                  )}
                                </td>
                                <td className="p-4 text-right">
                                  <Link
                                    href={`/admin/repairs/${ticket.id}`}
                                    className="px-3 py-1 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground border border-border/80 rounded-lg text-[10px] font-black transition-colors"
                                  >
                                    View Workspace
                                  </Link>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* New Ticket Check-In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <Wrench className="h-4.5 w-4.5 text-primary" />
                Register Repair Ticket (Device Check-In)
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                  <span className="text-[11px] font-bold text-red-500">{modalError}</span>
                </div>
              )}

              {/* Branch Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Intake Branch</label>
                <select
                  value={ticketBranchId}
                  onChange={(e) => setTicketBranchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none"
                  required
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Customer Info Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold border-b border-border pb-1 text-foreground">Customer Registration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">First Name</label>
                    <input
                      type="text"
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                      className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                      required={!customerId}
                      placeholder="e.g. Rafiq"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Last Name</label>
                    <input
                      type="text"
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                      className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                      required={!customerId}
                      placeholder="e.g. Karim"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                      required={!customerId}
                      placeholder="e.g. rafiq@gmail.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Mobile Number</label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                      required={!customerId}
                      placeholder="e.g. 01711122233"
                    />
                  </div>
                </div>
              </div>

              {/* Device Info Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold border-b border-border pb-1 text-foreground">Device Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Brand</label>
                    <input
                      type="text"
                      value={newDevice.brand}
                      onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})}
                      className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                      required={!deviceId}
                      placeholder="e.g. Apple or Samsung"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Model Name</label>
                    <input
                      type="text"
                      value={newDevice.model}
                      onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                      className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                      required={!deviceId}
                      placeholder="e.g. iPhone 14 Pro"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Serial Number</label>
                    <input
                      type="text"
                      value={newDevice.serialNumber}
                      onChange={(e) => setNewDevice({...newDevice, serialNumber: e.target.value})}
                      className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                      placeholder="e.g. SN-IPH14-XXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">IMEI / Unique ID</label>
                    <input
                      type="text"
                      value={newDevice.imei}
                      onChange={(e) => setNewDevice({...newDevice, imei: e.target.value})}
                      className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                      placeholder="e.g. 35899XXXXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Troubleshooting Faults Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Reported Faults & Symptoms</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFault}
                    onChange={(e) => setNewFault(e.target.value)}
                    placeholder="e.g. Screen bleeding, Touch broken..."
                    className="flex-grow px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFault}
                    className="px-4 py-2 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground border border-border/80 rounded-xl text-xs font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>
                {faults.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-secondary/20 border border-border/60 rounded-xl">
                    {faults.map((f, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border rounded-lg text-[10px] font-bold text-foreground">
                        {f}
                        <button type="button" onClick={() => handleRemoveFault(i)} className="text-red-500 hover:text-red-700 font-extrabold focus:outline-none">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SLA & Initial Cost estimation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">SLA Deadline Date</label>
                  <input
                    type="datetime-local"
                    value={slaDeadline}
                    onChange={(e) => setSlaDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Initial Price Estimate (৳)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="w-full px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                    min="0"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-secondary border border-border rounded-xl text-xs font-bold text-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/95 flex items-center gap-2 shadow-lg shadow-primary/10 transition-colors cursor-pointer"
                >
                  {modalLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Register Check-In
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
