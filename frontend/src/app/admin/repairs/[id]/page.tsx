'use client';

import React, { useState, useEffect, useCallback, use, useMemo } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  ArrowLeft, 
  User, 
  Laptop, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Lock,
  Loader2,
  Printer,
  ChevronRight,
  DollarSign,
  UserCheck,
  Check,
  ShieldCheck
} from 'lucide-react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { CommandPalette } from '../../components/command-palette';
import { NotificationCenter } from '../../components/notification-center';
import { api, TicketModel } from '@/lib/api';
import { useAdminAuth } from '@/context/admin-auth-context';

export default function RepairWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { adminUser } = useAdminAuth();
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
  const { id } = use(params);

  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Data States
  const [ticket, setTicket] = useState<TicketModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [techs, setTechs] = useState<{ id: string; firstName: string; lastName: string }[]>([]);

  // Diagnostics Form State
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [customerApproved, setCustomerApproved] = useState(false);
  const [partsRequired, setPartsRequired] = useState<string[]>([]);
  const [newPart, setNewPart] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Component Testing checklist
  // Format: "Component: PASS" or "Component: FAIL" or "Component: UNTESTED"
  const defaultComponents = useMemo(() => ['Screen', 'Battery', 'Charging Port', 'Audio', 'Camera', 'WiFi', 'Buttons'], []);
  const [testResults, setTestResults] = useState<Record<string, 'PASS' | 'FAIL' | 'UNTESTED'>>({});

  // Technicians assignment
  const [selectedTechId, setSelectedTechId] = useState('');

  // Fetch Technicians
  const fetchTechnicians = useCallback(async () => {
    try {
      // For standalone/mock, set default technicians
      setTechs([
        { id: 'tech-1111', firstName: 'Kamal', lastName: 'Uddin' },
        { id: 'tech-2222', firstName: 'Jamil', lastName: 'Hasan' },
        { id: 'branch-admin-uid-2222', firstName: 'Rafiq', lastName: 'Ahmed' },
        { id: 'super-admin-uid-1111', firstName: 'System', lastName: 'Administrator' }
      ]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch ticket details
  const fetchTicketDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.tickets.get(id, token);
      if (res && res.success) {
        const ticketData = res.data;
        setTicket(ticketData);

        // Prepopulate form states
        setDiagnosisNotes(ticketData.diagnosisNotes || '');
        setInternalNotes(ticketData.internalNotes || '');
        setEstimatedCost(ticketData.estimatedCost || 0);
        setCustomerApproved(ticketData.customerApproved || false);
        setPartsRequired(ticketData.partsRequired || []);
        setSelectedTechId(ticketData.assignedTechId || '');

        // Map tests array (e.g. ["Screen: FAIL", "Battery: PASS"]) to testResults state object
        const resultsMap: Record<string, 'PASS' | 'FAIL' | 'UNTESTED'> = {};
        defaultComponents.forEach(c => {
          resultsMap[c] = 'UNTESTED';
        });

        if (ticketData.tests && ticketData.tests.length > 0) {
          ticketData.tests.forEach(testStr => {
            const parts = testStr.split(': ');
            if (parts.length === 2) {
              const comp = parts[0];
              const resVal = parts[1] as 'PASS' | 'FAIL' | 'UNTESTED';
              if (defaultComponents.includes(comp)) {
                resultsMap[comp] = resVal;
              }
            }
          });
        }
        setTestResults(resultsMap);
      } else {
        setError(res.message || 'Failed to fetch ticket details.');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Connection error. Could not retrieve details.');
    } finally {
      setLoading(false);
    }
  }, [id, defaultComponents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTechnicians();
      fetchTicketDetails();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTicketDetails, fetchTechnicians]);

  // Handle saving diagnostics
  const handleSaveDiagnostics = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionSuccess(null);

    // Format tests map back into array ["Screen: PASS", ...]
    const testsArray = Object.entries(testResults).map(([comp, val]) => `${comp}: ${val}`);

    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.tickets.updateDiagnostics(
        id,
        {
          diagnosisNotes,
          internalNotes,
          faults: ticket?.faults || [],
          tests: testsArray,
          partsRequired,
          estimatedCost,
          customerApproved,
        },
        token
      );

      if (res && res.success) {
        setActionSuccess('Diagnostics logged successfully!');
        fetchTicketDetails();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setError(res.message || 'Failed to update diagnostics.');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Error occurred while saving diagnostics.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle component test state
  const handleToggleTest = (comp: string, status: 'PASS' | 'FAIL' | 'UNTESTED') => {
    setTestResults({
      ...testResults,
      [comp]: status,
    });
  };

  // Handle Add Part
  const handleAddPart = () => {
    if (newPart.trim() && !partsRequired.includes(newPart.trim())) {
      setPartsRequired([...partsRequired, newPart.trim()]);
      setNewPart('');
    }
  };

  // Handle Remove Part
  const handleRemovePart = (partName: string) => {
    setPartsRequired(partsRequired.filter(p => p !== partName));
  };

  // Handle Status Transition
  const handleStatusTransition = async (newStatus: string, notes?: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.tickets.updateStatus(id, newStatus, notes, token);
      if (res && res.success) {
        setActionSuccess(`Ticket moved to ${newStatus} stage!`);
        fetchTicketDetails();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setError(res.message || 'Failed to transition ticket status.');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Error occurred during status update.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Technician Assignment
  const handleAssignTech = async (techId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.tickets.assign(id, techId || null, token);
      if (res && res.success) {
        setSelectedTechId(techId);
        setActionSuccess(techId ? 'Technician assigned successfully!' : 'Technician unassigned.');
        fetchTicketDetails();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setError(res.message || 'Failed to update technician.');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Error assigning technician.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle customer estimate approval toggle
  const handleToggleApproval = async (approved: boolean) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.tickets.approveEstimate(id, approved, token);
      if (res && res.success) {
        setCustomerApproved(approved);
        setActionSuccess(approved ? 'Cost estimate approved!' : 'Approval state reset.');
        fetchTicketDetails();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setError(res.message || 'Failed to update approval status.');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Error toggling approval.');
    } finally {
      setActionLoading(false);
    }
  };

  // Print Job Sheet Handler
  const handlePrint = () => {
    window.print();
  };

  // RBAC Roles/Permissions checks
  const userRole = adminUser?.role ?? '';
  const userPermissions = adminUser?.permissions ?? [];

  const isTech = userRole === 'SUPER_ADMIN' || 
                 userRole === 'OWNER' || 
                 userRole === 'ADMIN' || 
                 userRole === 'TECHNICIAN_MANAGER' || 
                 userRole === 'TECHNICIAN' || 
                 userPermissions.includes('write:repairs') ||
                 userPermissions.includes('*');

  const isSupport = userRole === 'SUPER_ADMIN' || 
                    userRole === 'OWNER' || 
                    userRole === 'ADMIN' || 
                    userRole === 'SUPPORT' || 
                    userPermissions.includes('write:repairs') ||
                    userPermissions.includes('*');

  const isOverdue = ticket && new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'delivered';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Hide layout wrappers when printing */}
      <div className="print:hidden flex shrink-0">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      <div className={`flex-grow flex flex-col transition-all duration-300 min-w-0 print:pl-0 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'} print:p-0`}>
        <div className="print:hidden">
          <Header 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onOpenNotifications={() => setNotificationsOpen(true)}
          />
        </div>

        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto print:p-0 print:overflow-visible">
          {/* Top Bar / Breadcrumb */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4 print:hidden">
            <div className="flex items-center gap-3">
              <Link 
                href="/admin/repairs"
                className="p-2 bg-secondary/50 hover:bg-secondary border border-border/60 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase">
                  <span>Repairs Workspace</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-primary font-bold">Intake Diagnostics</span>
                </div>
                <h1 className="text-sm font-black text-foreground mt-0.5">
                  Ticket #{id.substring(0, 8)}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 border border-border/80 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Print Job Sheet
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3 print:hidden">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-xs font-semibold text-red-500">{error}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center gap-3 print:hidden">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-bounce" />
              <span className="text-xs font-semibold text-emerald-500">{actionSuccess}</span>
            </div>
          )}

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 print:hidden">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-xs font-bold text-muted-foreground">Pulling hardware diagnostic matrix...</span>
            </div>
          ) : ticket ? (
            <>
              {/* PRINT ONLY VIEW */}
              <div className="hidden print:block font-mono text-black text-xs p-6 space-y-6">
                <div className="border-b border-black pb-4 text-center">
                  <h1 className="text-lg font-black tracking-tight">TRUSTZONE MOBILE CARE</h1>
                  <p className="text-[10px]">DEVICE REPAIR WORKSPACE JOB SHEET</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-b border-black pb-4">
                  <div>
                    <h3 className="font-bold text-[10px] uppercase border-b border-black mb-1">Ticket Info</h3>
                    <p><strong>Ticket ID:</strong> #{ticket.id}</p>
                    <p><strong>Intake Date:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                    <p><strong>SLA Deadline:</strong> {new Date(ticket.slaDeadline).toLocaleString()}</p>
                    <p><strong>Status:</strong> {ticket.status.toUpperCase()}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[10px] uppercase border-b border-black mb-1">Customer & Device</h3>
                    <p><strong>Customer:</strong> {ticket.customer?.firstName} {ticket.customer?.lastName}</p>
                    <p><strong>Phone:</strong> {ticket.customer?.phone}</p>
                    <p><strong>Device:</strong> {ticket.device?.brand} {ticket.device?.model}</p>
                    <p><strong>Serial:</strong> {ticket.device?.serialNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-[10px] uppercase border-b border-black">Reported Faults</h3>
                  <ul className="list-disc pl-5">
                    {ticket.faults.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-black pt-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-[10px] uppercase border-b border-black">Diagnostic Checklist</h3>
                    {ticket.tests && ticket.tests.length > 0 ? (
                      <ul className="list-none">
                        {ticket.tests.map((test, i) => (
                          <li key={i}>[{test.includes('PASS') ? 'X' : ' '}] {test}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No component diagnostics logged yet.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-[10px] uppercase border-b border-black">Cost & Approvals</h3>
                    <p><strong>Estimated Cost:</strong> ৳{ticket.estimatedCost.toLocaleString()}</p>
                    <p><strong>Customer Approved:</strong> {ticket.customerApproved ? 'YES' : 'PENDING'}</p>
                    <p><strong>Parts Required:</strong> {ticket.partsRequired.join(', ') || 'None'}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <h3 className="font-bold text-[10px] uppercase border-b border-black">Technician Notes</h3>
                  <p><strong>Diagnostic Notes:</strong> {ticket.diagnosisNotes || 'No notes logged.'}</p>
                </div>

                <div className="flex justify-between items-center pt-16 text-[10px]">
                  <div className="text-center w-40 border-t border-black pt-1">
                    Customer Signature
                  </div>
                  <div className="text-center w-40 border-t border-black pt-1">
                    Technician Signature
                  </div>
                </div>
              </div>

              {/* DONT PRINT SCREEN VIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
                
                {/* COLUMN 1 & 2: Workspaces */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* SUMMARY CAPSULE */}
                  <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                          <Laptop className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-foreground">{ticket.device?.brand} {ticket.device?.model}</h3>
                          <span className="text-[9px] font-semibold text-muted-foreground block mt-0.5">
                            Serial: {ticket.device?.serialNumber || 'N/A'} • IMEI: {ticket.device?.imei || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        {isOverdue && (
                          <span className="text-[9px] font-black px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded uppercase flex items-center gap-1">
                            SLA Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                      <div className="p-3 bg-secondary/25 border border-border/40 rounded-xl flex items-center gap-2.5">
                        <User className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">Intake Customer</span>
                          <span className="text-foreground font-bold">{ticket.customer?.firstName} {ticket.customer?.lastName}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary/25 border border-border/40 rounded-xl flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">SLA Time Limit</span>
                          <span className={`font-bold ${isOverdue ? 'text-red-500' : 'text-foreground'}`}>
                            {new Date(ticket.slaDeadline).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary/25 border border-border/40 rounded-xl flex items-center gap-2.5">
                        <DollarSign className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">Customer Quote</span>
                          <span className="text-foreground font-bold">৳{ticket.estimatedCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reported Faults */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Intake Symptoms (Reported Faults)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ticket.faults.length > 0 ? (
                          ticket.faults.map((f, i) => (
                            <span key={i} className="px-2 py-1 bg-secondary/40 border border-border rounded-lg text-[10px] font-bold text-foreground">
                              {f}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60 font-semibold italic">No specific faults selected on intake.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DIAGNOSTICS & TEST MATRIX */}
                  <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" />
                        Technical Diagnostics & Component Tests
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                        Assess hardware condition and log components integrity.
                      </p>
                    </div>

                    {/* Test grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {defaultComponents.map((comp) => {
                        const status = testResults[comp] || 'UNTESTED';
                        
                        return (
                          <div key={comp} className="p-3 border border-border/60 rounded-xl flex flex-col justify-between gap-2.5">
                            <span className="text-[10px] font-bold text-foreground truncate">{comp}</span>
                            <div className="flex rounded-lg overflow-hidden border border-border/80">
                              {(['PASS', 'FAIL', 'UNTESTED'] as const).map((opt) => (
                                <button
                                  type="button"
                                  key={opt}
                                  disabled={!isTech}
                                  onClick={() => handleToggleTest(comp, opt)}
                                  className={`flex-grow py-1 text-[8px] font-black text-center border-r last:border-0 cursor-pointer transition-colors ${
                                    status === opt 
                                      ? opt === 'PASS' 
                                        ? 'bg-emerald-500 text-white border-emerald-500' 
                                        : opt === 'FAIL' 
                                          ? 'bg-red-500 text-white border-red-500' 
                                          : 'bg-muted text-foreground'
                                      : 'bg-card text-muted-foreground hover:bg-secondary/40'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Diagnosis Notes form */}
                    <form onSubmit={handleSaveDiagnostics} className="space-y-4 pt-4 border-t border-border/65">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Diagnostic Findings & Notes</label>
                          <textarea
                            disabled={!isTech}
                            value={diagnosisNotes}
                            onChange={(e) => setDiagnosisNotes(e.target.value)}
                            placeholder="Describe component physical damage, test results details..."
                            className="w-full h-24 px-3.5 py-2.5 bg-secondary/30 border border-border/80 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Internal Technician Logs (Private)</label>
                          <textarea
                            disabled={!isTech}
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            placeholder="Add private logs for replacement guidelines, micro-soldering logs..."
                            className="w-full h-24 px-3.5 py-2.5 bg-secondary/30 border border-border/80 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Estimator and Parts required */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Parts Required Allocations</label>
                          <div className="flex gap-2">
                            <input
                              disabled={!isTech}
                              type="text"
                              value={newPart}
                              onChange={(e) => setNewPart(e.target.value)}
                              placeholder="e.g. BATT-IPH14P, OEM-DISPLAY..."
                              className="flex-grow px-3.5 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={!isTech}
                              onClick={handleAddPart}
                              className="px-4 py-2 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground border border-border/80 rounded-xl text-xs font-bold transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          {partsRequired.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-secondary/20 border border-border/60 rounded-xl">
                              {partsRequired.map((p, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border rounded-lg text-[10px] font-bold text-foreground">
                                  {p}
                                  {isTech && (
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemovePart(p)} 
                                      className="text-red-500 hover:text-red-700 font-extrabold focus:outline-none"
                                    >
                                      ×
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Updated Cost Estimate (৳)</label>
                          <input
                            disabled={!isTech}
                            type="number"
                            value={estimatedCost}
                            onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                            className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none font-bold text-primary"
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end pt-4 border-t border-border/40">
                        {isTech ? (
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/95 flex items-center gap-2 shadow-lg shadow-primary/10 transition-colors cursor-pointer"
                          >
                            {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Commit Technical Diagnostics
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-5 py-2 bg-secondary text-muted-foreground/60 border border-border rounded-xl text-xs font-bold flex items-center gap-2 cursor-not-allowed"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Diagnostics Log Locked
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* COLUMN 3: Status transitions and timeline */}
                <div className="space-y-6">
                  
                  {/* TECHNICIAN ASSIGNMENT */}
                  <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      Technician Assignment
                    </h3>
                    <div className="space-y-3">
                      <select
                        disabled={!isSupport}
                        value={selectedTechId}
                        onChange={(e) => handleAssignTech(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none"
                      >
                        <option value="">-- Unassigned --</option>
                        {techs.map(t => (
                          <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                        ))}
                      </select>
                      {!isSupport && (
                        <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1.5">
                          <Lock className="h-3 w-3" /> User cannot alter tech assignment
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CUSTOMER APPROVAL GATE */}
                  <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Customer Cost Approval Gate
                    </h3>
                    <div className="flex items-center justify-between p-3.5 bg-secondary/20 border border-border/60 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-foreground">Estimate Status</span>
                        <span className="text-[10px] text-muted-foreground block">
                          {customerApproved ? 'Approved by Customer' : 'Pending Customer Callback'}
                        </span>
                      </div>
                      
                      {isSupport ? (
                        <button
                          type="button"
                          onClick={() => handleToggleApproval(!customerApproved)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide border cursor-pointer transition-colors ${
                            customerApproved 
                              ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600' 
                              : 'bg-card text-muted-foreground border-border hover:bg-secondary/45'
                          }`}
                        >
                          {customerApproved ? 'Approved' : 'Mark Approved'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Lock className="h-3.5 w-3.5" /> Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* LIFECYCLE STATE ACTIONS */}
                  <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      Lifecycle Action Desk
                    </h3>
                    
                    <div className="flex flex-col gap-2.5">
                      {[
                        { status: 'booked', label: 'Book Intake Desk' },
                        { status: 'diagnosing', label: 'Move to Diagnostics' },
                        { status: 'repairing', label: 'Commence Hardware Repair' },
                        { status: 'ready', label: 'Complete Repair (Ready)' },
                        { status: 'delivered', label: 'Deliver & Invoice Care' }
                      ].map((step) => {
                        const isCurrent = ticket.status === step.status;
                        const canAdvance = isTech || (step.status === 'delivered' && isSupport);
                        
                        return (
                          <button
                            key={step.status}
                            type="button"
                            disabled={!canAdvance || isCurrent || actionLoading}
                            onClick={() => handleStatusTransition(step.status)}
                            className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold border transition-colors flex items-center justify-between cursor-pointer ${
                              isCurrent
                                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                : canAdvance
                                  ? 'bg-card text-foreground hover:bg-secondary/40 border-border/80'
                                  : 'bg-secondary/20 text-muted-foreground/50 border-border/30 cursor-not-allowed'
                            }`}
                          >
                            <span>{step.label}</span>
                            {isCurrent && <Check className="h-4 w-4" />}
                            {!canAdvance && !isCurrent && <Lock className="h-3 w-3 text-muted-foreground/40" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TIMELINE HISTORY TRACKER */}
                  <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Intake History Timeline
                    </h3>

                    <div className="relative border-l-2 border-border/60 pl-4 ml-2 space-y-5">
                      {ticket.ticketHistory && ticket.ticketHistory.map((hist) => (
                        <div key={hist.id} className="relative text-xs">
                          {/* Dot marker */}
                          <div className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full border border-card bg-primary" />
                          
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-foreground capitalize">{hist.newStatus}</span>
                              <span className="text-[8px] text-muted-foreground font-semibold">
                                {new Date(hist.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                              {hist.notes}
                            </p>
                            {hist.updatedBy && (
                              <span className="text-[8px] text-muted-foreground font-semibold block">
                                By: {hist.updatedBy.firstName} ({hist.updatedBy.role})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center gap-3 print:hidden">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <span className="text-xs font-bold text-muted-foreground">Could not load ticket workspace.</span>
            </div>
          )}
        </main>
      </div>

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
