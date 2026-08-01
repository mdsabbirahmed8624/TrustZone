'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Search,
  Plus,
  Printer,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  Activity,
  DollarSign,
  Truck,
  FileDown,
  Info
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api } from '@/lib/api';

export default function AdminWarrantyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Tabs: 'warranties' | 'claims' | 'supplier-rmas' | 'reports'
  const [activeTab, setActiveTab] = useState<'warranties' | 'claims' | 'supplier-rmas' | 'reports'>('warranties');

  // Load States
  const [stats, setStats] = useState<any>(null);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [rmas, setRmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  // Selection & Modals
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [selectedRma, setSelectedRma] = useState<any>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showClaimStatusModal, setShowClaimStatusModal] = useState(false);
  const [showCreateRmaModal, setShowCreateRmaModal] = useState(false);
  const [showRmaStatusModal, setShowRmaStatusModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Form States
  const [voidReason, setVoidReason] = useState('');
  
  const [newWarranty, setNewWarranty] = useState({
    customerId: 'cust-1',
    branchId: 'branch-1',
    warrantyType: 'SERVICE',
    deviceBrand: '',
    deviceModel: '',
    serialOrImei: '',
    durationMonths: 12,
    coverageDetails: ['Display digitizer', 'Charging logic board'],
    exclusions: ['Liquid exposure', 'Deep surface casing drops'],
    terms: 'Only covers manufacturing or repair service execution failures.'
  });

  const [inspectionData, setInspectionData] = useState({
    inspectionNotes: '',
    inspectionDiagnosis: '',
    isCovered: true,
    estimatedCost: 0,
    oldPartId: 'part-1',
    newPartId: 'part-1',
    replacementSerialNumber: '',
    replacementCost: 0,
    photos: [] as string[],
    attachments: [] as string[]
  });

  const [claimStatusData, setClaimStatusData] = useState({
    status: 'APPROVED',
    resolutionDetails: ''
  });

  const [newRmaData, setNewRmaData] = useState({
    partId: 'part-1',
    supplierId: 'supplier-1',
    branchId: 'branch-1',
    quantity: 1,
    reason: '',
    courier: '',
    trackingNumber: '',
    vendorReference: '',
    replacementEta: '',
    notes: ''
  });

  const [rmaStatusData, setRmaStatusData] = useState({
    status: 'SHIPPED',
    notes: '',
    creditNoteNumber: ''
  });

  // Report States
  const [reportType, setReportType] = useState('warranty');
  const [reportData, setReportData] = useState<any[]>([]);

  // Token fallback
  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.warranty.fetchDashboardStats(token);
      if (statsRes.success) setStats(statsRes.data);

      if (activeTab === 'warranties') {
        const warrsRes = await api.warranty.list({ search: searchTerm, status: statusFilter, branchId: selectedBranch }, token);
        if (warrsRes.success) setWarranties(warrsRes.data);
      } else if (activeTab === 'claims') {
        const claimsRes = await api.warranty.listClaims({ status: statusFilter, branchId: selectedBranch }, token);
        if (claimsRes.success) setClaims(claimsRes.data);
      } else if (activeTab === 'supplier-rmas') {
        const rmasRes = await api.warranty.listRmas({ status: statusFilter }, token);
        if (rmasRes.success) setRmas(rmasRes.data);
      } else if (activeTab === 'reports') {
        const repRes = await api.warranty.fetchReports(reportType, token);
        if (repRes.success) setReportData(repRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAllData();
  };

  const handleCreateWarranty = async () => {
    try {
      const res = await api.warranty.create(newWarranty, token);
      if (res.success) {
        setShowCreateModal(false);
        loadAllData();
      }
    } catch (err) {
      alert('Error creating warranty');
    }
  };

  const handleVoidWarranty = async () => {
    if (!selectedWarranty) return;
    try {
      const res = await api.warranty.void(selectedWarranty.id, voidReason, token);
      if (res.success) {
        setShowVoidModal(false);
        setSelectedWarranty(null);
        setVoidReason('');
        loadAllData();
      }
    } catch (err) {
      alert('Error voiding warranty');
    }
  };

  const handleSubmitInspection = async () => {
    if (!selectedClaim) return;
    try {
      const res = await api.warranty.submitInspection(selectedClaim.id, inspectionData, token);
      if (res.success) {
        setShowInspectionModal(false);
        loadAllData();
      }
    } catch (err) {
      alert('Error saving inspection details');
    }
  };

  const handleUpdateClaimStatus = async () => {
    if (!selectedClaim) return;
    try {
      const res = await api.warranty.updateClaimStatus(
        selectedClaim.id,
        claimStatusData.status,
        claimStatusData.resolutionDetails,
        token
      );
      if (res.success) {
        setShowClaimStatusModal(false);
        setSelectedClaim(null);
        loadAllData();
      }
    } catch (err) {
      alert('Error updating claim status');
    }
  };

  const handleCreateRma = async () => {
    try {
      const res = await api.warranty.createRma(newRmaData, token);
      if (res.success) {
        setShowCreateRmaModal(false);
        loadAllData();
      }
    } catch (err) {
      alert('Error creating Supplier RMA');
    }
  };

  const handleUpdateRmaStatus = async () => {
    if (!selectedRma) return;
    try {
      const res = await api.warranty.updateRmaStatus(
        selectedRma.id,
        rmaStatusData.status,
        rmaStatusData.notes,
        rmaStatusData.creditNoteNumber,
        token
      );
      if (res.success) {
        setShowRmaStatusModal(false);
        setSelectedRma(null);
        loadAllData();
      }
    } catch (err) {
      alert('Error updating RMA status');
    }
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto print:p-0 print:bg-white print:text-black">
          {/* Header Banner */}
          <div className="border-b border-border/60 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Warranty & RMA Workspace
              </h1>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Administer client warranty registrations, verify coverage criteria, resolve claim sheets, and track supplier RMAs.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (activeTab === 'warranties') setShowCreateModal(true);
                  if (activeTab === 'supplier-rmas') setShowCreateRmaModal(true);
                }}
                disabled={activeTab === 'claims' || activeTab === 'reports'}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                {activeTab === 'warranties' ? 'Manual Warranty' : activeTab === 'supplier-rmas' ? 'New Supplier RMA' : 'Create'}
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Active Warranties</span>
                <span className="text-2xl font-black text-foreground mt-2">{stats.activeWarranties}</span>
                <div className="absolute right-3 bottom-3 text-primary/10">
                  <ShieldCheck className="h-12 w-12" />
                </div>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Pending Customer Claims</span>
                <span className="text-2xl font-black text-amber-500 mt-2">{stats.pendingClaims + stats.inspectionClaims}</span>
                <div className="absolute right-3 bottom-3 text-amber-500/10">
                  <Clock className="h-12 w-12" />
                </div>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Active Supplier RMAs</span>
                <span className="text-2xl font-black text-primary mt-2">{stats.activeRmas}</span>
                <div className="absolute right-3 bottom-3 text-primary/10">
                  <Truck className="h-12 w-12" />
                </div>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Claim Rejections</span>
                <span className="text-2xl font-black text-red-500 mt-2">{stats.rejectedClaims}</span>
                <div className="absolute right-3 bottom-3 text-red-500/10">
                  <ShieldAlert className="h-12 w-12" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/60 gap-4 print:hidden">
            {[
              { id: 'warranties', label: 'Warranties Registry' },
              { id: 'claims', label: 'Claims Workspace' },
              { id: 'supplier-rmas', label: 'Supplier RMAs Outward' },
              { id: 'reports', label: 'Analytical Reports' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setStatusFilter('');
                  setSearchTerm('');
                }}
                className={`pb-3 text-xs font-black tracking-wide border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: WARRANTIES REGISTRY */}
          {activeTab === 'warranties' && (
            <div className="space-y-4 print:hidden">
              {/* Filters */}
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by warranty number, IMEI, client phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-card border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-card border border-border/80 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="VOID">VOID</option>
                    <option value="CLAIMED">CLAIMED</option>
                    <option value="REPLACED">REPLACED</option>
                    <option value="PARTIALLY_USED">PARTIALLY_USED</option>
                  </select>
                  <button type="submit" className="bg-secondary hover:bg-secondary-hover px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer">
                    Apply Filter
                  </button>
                </div>
              </form>

              {/* Warranties Grid */}
              {loading ? (
                <div className="text-center py-10 text-xs text-muted-foreground">Loading certificates...</div>
              ) : warranties.length === 0 ? (
                <div className="bg-card border border-border/80 rounded-2xl p-8 text-center text-xs text-muted-foreground">
                  No warranty certificates registered matching filter metrics.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {warranties.map((warr) => (
                    <div key={warr.id} className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 hover:border-border transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{warr.warrantyType} Warranty</span>
                          <h3 className="text-sm font-black text-foreground mt-0.5">{warr.warrantyNumber}</h3>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                          warr.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          warr.status === 'VOID' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {warr.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-bold">Customer</span>
                          <span className="font-semibold">{warr.customer.firstName} {warr.customer.lastName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-bold">IMEI / Serial</span>
                          <span className="font-semibold font-mono">{warr.serialOrImei}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-muted-foreground block font-bold">Device</span>
                          <span className="font-semibold">{warr.deviceBrand} {warr.deviceModel}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-bold">Expires</span>
                          <span className="font-semibold text-primary">{new Date(warr.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-end items-end gap-1.5 col-span-2">
                          <button
                            onClick={() => {
                              setSelectedWarranty(warr);
                              setShowCertificateModal(true);
                            }}
                            className="p-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-xl transition cursor-pointer"
                            title="Print Certificate"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWarranty(warr);
                              setShowVoidModal(true);
                            }}
                            disabled={warr.status === 'VOID'}
                            className="px-3 py-2 bg-red-500/15 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-bold transition cursor-pointer disabled:opacity-50"
                          >
                            Void Coverage
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLAIMS WORKSPACE */}
          {activeTab === 'claims' && (
            <div className="space-y-4 print:hidden">
              {/* Claims Feed */}
              {loading ? (
                <div className="text-center py-10 text-xs text-muted-foreground">Loading claims...</div>
              ) : claims.length === 0 ? (
                <div className="bg-card border border-border/80 rounded-2xl p-8 text-center text-xs text-muted-foreground">
                  No active customer claims registered.
                </div>
              ) : (
                <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/40 text-muted-foreground uppercase font-black tracking-wider text-[10px]">
                        <tr>
                          <th className="p-4">Claim ID</th>
                          <th className="p-4">Customer Device</th>
                          <th className="p-4">Reported Issue</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {claims.map((claim) => (
                          <tr key={claim.id} className="hover:bg-secondary/15 transition-colors">
                            <td className="p-4 font-bold">{claim.claimNumber}</td>
                            <td className="p-4">
                              <span className="font-bold">{claim.warranty.deviceBrand} {claim.warranty.deviceModel}</span>
                              <span className="block text-[10px] text-muted-foreground mt-0.5">IMEI: {claim.warranty.serialOrImei}</span>
                            </td>
                            <td className="p-4 max-w-xs truncate">{claim.issueDescription}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                                claim.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                claim.status === 'INSPECTION' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                                claim.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}>
                                {claim.status}
                              </span>
                            </td>
                            <td className="p-4 flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setShowInspectionModal(true);
                                }}
                                className="px-3 py-1.5 bg-secondary hover:bg-secondary-hover text-foreground font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Tech Inspect
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setShowClaimStatusModal(true);
                                }}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Resolution
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUPPLIER RMAS */}
          {activeTab === 'supplier-rmas' && (
            <div className="space-y-4 print:hidden">
              {/* Supplier RMA Ledger */}
              {loading ? (
                <div className="text-center py-10 text-xs text-muted-foreground">Loading supplier RMAs...</div>
              ) : rmas.length === 0 ? (
                <div className="bg-card border border-border/80 rounded-2xl p-8 text-center text-xs text-muted-foreground">
                  No supplier RMA cases filed.
                </div>
              ) : (
                <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/40 text-muted-foreground uppercase font-black tracking-wider text-[10px]">
                        <tr>
                          <th className="p-4">RMA Number</th>
                          <th className="p-4">Part / Defect</th>
                          <th className="p-4">Vendor</th>
                          <th className="p-4">Courier Tracker</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {rmas.map((rma) => (
                          <tr key={rma.id} className="hover:bg-secondary/15 transition-colors">
                            <td className="p-4 font-bold">{rma.rmaNumber}</td>
                            <td className="p-4">
                              <span className="font-bold">{rma.part.name}</span>
                              <span className="block text-[10px] text-muted-foreground mt-0.5">Reason: {rma.reason}</span>
                            </td>
                            <td className="p-4 font-semibold">{rma.supplier.name}</td>
                            <td className="p-4">
                              {rma.courier ? (
                                <>
                                  <span className="font-semibold block">{rma.courier}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">{rma.trackingNumber}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">No tracking</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                                rma.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                rma.status === 'SHIPPED' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                                rma.status === 'CREDITED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}>
                                {rma.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setSelectedRma(rma);
                                  setShowRmaStatusModal(true);
                                }}
                                className="px-3 py-1.5 bg-secondary hover:bg-secondary-hover text-foreground font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Edit Status
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ANALYTICAL REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 print:hidden">
              {/* Selection Bar */}
              <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                  {[
                    { id: 'warranty', label: 'Warranties Issued' },
                    { id: 'claims', label: 'Claims Audit' },
                    { id: 'supplier-rma', label: 'Supplier Return Ledger' },
                    { id: 'failure-analysis', label: 'Failure Analysis' }
                  ].map(rep => (
                    <button
                      key={rep.id}
                      onClick={() => setReportType(rep.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                        reportType === rep.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary-hover text-foreground'
                      }`}
                    >
                      {rep.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => alert('Exporting report as CSV...')}
                  className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileDown className="h-4 w-4" />
                  Export Sheet
                </button>
              </div>

              {/* Report Tables */}
              {loading ? (
                <div className="text-center py-10 text-xs text-muted-foreground">Generating report data...</div>
              ) : (
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-border/60 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Report Output: {reportType.toUpperCase()}
                    </h3>
                  </div>

                  {reportType === 'failure-analysis' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-foreground">Defects Count by Brand</h4>
                        <div className="space-y-2.5">
                          {reportData.map((row: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-muted-foreground">{row.deviceBrand}</span>
                              <span className="font-bold text-foreground">{row.claimsCount} claims</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/40 text-muted-foreground uppercase font-black tracking-wider text-[10px]">
                          <tr>
                            <th className="p-3">Reference</th>
                            <th className="p-3">Details</th>
                            <th className="p-3">Branch</th>
                            <th className="p-3">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {reportData.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-secondary/15 transition-colors">
                              <td className="p-3 font-bold">
                                {row.warrantyNumber || row.claimNumber || row.rmaNumber}
                              </td>
                              <td className="p-3">
                                {row.deviceBrand ? `${row.deviceBrand} ${row.deviceModel}` : row.reason || row.issueDescription}
                              </td>
                              <td className="p-3 font-semibold">{row.branch?.name || 'Main Desk'}</td>
                              <td className="p-3 text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              PRINTABLE CERTIFICATE DIALOG
             ========================================== */}
          {showCertificateModal && selectedWarranty && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:relative print:bg-white print:p-0 print:block">
              <div className="bg-card border border-border/80 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] print:border-none print:shadow-none print:max-h-full print:bg-white print:text-black">
                <div className="p-4 border-b border-border/60 flex justify-between items-center print:hidden">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Print Warranty Certificate</h3>
                  <button onClick={() => setShowCertificateModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-black">Close</button>
                </div>

                <div id="print-area" className="p-8 space-y-6 overflow-y-auto flex-grow bg-card text-foreground print:bg-white print:text-black print:overflow-visible">
                  {/* Certificate Branding */}
                  <div className="text-center space-y-2 border-b border-border pb-6">
                    <h2 className="text-xl font-black uppercase tracking-wider text-primary">TrustZone Care</h2>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Official Hardware Repair Warranty Certificate</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-[9px] text-muted-foreground font-bold uppercase">Warranty Number</span>
                      <span className="font-extrabold font-mono text-sm">{selectedWarranty.warrantyNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] text-muted-foreground font-bold uppercase">Status</span>
                      <span className="font-extrabold text-emerald-500">{selectedWarranty.status}</span>
                    </div>

                    <div className="border-t border-border/50 pt-3">
                      <span className="block text-[9px] text-muted-foreground font-bold uppercase">Customer Name</span>
                      <span className="font-bold">{selectedWarranty.customer.firstName} {selectedWarranty.customer.lastName}</span>
                    </div>
                    <div className="border-t border-border/50 pt-3 text-right">
                      <span className="block text-[9px] text-muted-foreground font-bold uppercase">Customer Phone</span>
                      <span className="font-bold">{selectedWarranty.customer.phone}</span>
                    </div>

                    <div className="border-t border-border/50 pt-3 col-span-2">
                      <span className="block text-[9px] text-muted-foreground font-bold uppercase">Device Model & Specs</span>
                      <span className="font-bold">{selectedWarranty.deviceBrand} {selectedWarranty.deviceModel}</span>
                      <span className="block text-[9px] text-muted-foreground font-semibold font-mono mt-0.5">IMEI: {selectedWarranty.serialOrImei}</span>
                    </div>

                    <div className="border-t border-border/50 pt-3">
                      <span className="block text-[9px] text-muted-foreground font-bold uppercase">Issue Date</span>
                      <span className="font-bold">{new Date(selectedWarranty.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="border-t border-border/50 pt-3 text-right">
                      <span className="block text-[9px] text-muted-foreground font-bold uppercase">Expiry Date</span>
                      <span className="font-bold text-primary">{new Date(selectedWarranty.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Visual Barcode & QR Code Placeholders */}
                  <div className="flex justify-between items-center border-t border-b border-border/50 py-4 my-4">
                    <div className="space-y-1">
                      <div className="h-8 w-32 bg-foreground/15 dark:bg-foreground/10 rounded flex items-center justify-center font-mono text-[9px] tracking-widest text-muted-foreground print:bg-gray-200">
                        ||||| | ||||| | ||
                      </div>
                      <span className="text-[8px] text-muted-foreground font-mono block">Certificate Barcode</span>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="h-10 w-10 bg-foreground/15 dark:bg-foreground/10 rounded flex items-center justify-center font-bold text-[8px] text-muted-foreground print:bg-gray-200">
                        QR
                      </div>
                      <span className="text-[8px] text-muted-foreground block font-semibold">Digital Verification</span>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground">Exclusions & Rules:</h4>
                    <ul className="text-[9px] text-muted-foreground list-disc list-inside space-y-1">
                      <li>Coverage does not apply to accidental drop physical impact damage.</li>
                      <li>Any liquid entry or water damage voids coverage immediately.</li>
                      <li>Unofficial third-party opening/seal breaking voids certificate.</li>
                    </ul>
                  </div>

                  <div className="text-center pt-4">
                    <span className="text-[8px] text-muted-foreground italic font-semibold">
                      Digital Verification Link: trustzone.care/warranty/verify/{selectedWarranty.warrantyNumber}
                    </span>
                  </div>
                </div>

                <div className="p-4 border-t border-border/60 bg-secondary/20 flex justify-end gap-2 print:hidden">
                  <button
                    onClick={printCertificate}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Print PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              MANUAL WARRANTY ISSUANCE DIALOG
             ========================================== */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border/80 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Register Manual Warranty</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Device Brand</label>
                    <input
                      type="text"
                      value={newWarranty.deviceBrand}
                      onChange={(e) => setNewWarranty({ ...newWarranty, deviceBrand: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Device Model</label>
                    <input
                      type="text"
                      value={newWarranty.deviceModel}
                      onChange={(e) => setNewWarranty({ ...newWarranty, deviceModel: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Serial / IMEI</label>
                    <input
                      type="text"
                      value={newWarranty.serialOrImei}
                      onChange={(e) => setNewWarranty({ ...newWarranty, serialOrImei: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Warranty Type</label>
                    <select
                      value={newWarranty.warrantyType}
                      onChange={(e) => setNewWarranty({ ...newWarranty, warrantyType: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="SERVICE">Service Warranty</option>
                      <option value="PARTS">Parts Warranty</option>
                      <option value="DEVICE">Device Warranty</option>
                      <option value="EXTENDED">Extended Warranty</option>
                      <option value="MANUFACTURER">Manufacturer Warranty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Duration (Months)</label>
                    <input
                      type="number"
                      value={newWarranty.durationMonths}
                      onChange={(e) => setNewWarranty({ ...newWarranty, durationMonths: Number(e.target.value) })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateWarranty}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Register Certificate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              VOID WARRANTY CERTIFICATE DIALOG
             ========================================== */}
          {showVoidModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border/80 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Void Warranty Certificate</h3>
                <div className="text-xs space-y-2">
                  <p className="text-muted-foreground">
                    Are you sure you want to void warranty certificate <span className="font-bold text-foreground">{selectedWarranty?.warrantyNumber}</span>? This action is permanent.
                  </p>
                  <label className="block text-[10px] text-muted-foreground font-bold mb-1 mt-3">Void Reason Description</label>
                  <textarea
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="e.g. Broken screen pane glass impact or third party seal opened"
                    className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setShowVoidModal(false)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVoidWarranty}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Confirm Void
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TECHNICIAN INSPECTION DIALOG
             ========================================== */}
          {showInspectionModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border/80 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Submit Technician Inspection</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Inspection Notes & Test Summary</label>
                    <textarea
                      value={inspectionData.inspectionNotes}
                      onChange={(e) => setInspectionData({ ...inspectionData, inspectionNotes: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Diagnosis Findings</label>
                    <textarea
                      value={inspectionData.inspectionDiagnosis}
                      onChange={(e) => setInspectionData({ ...inspectionData, inspectionDiagnosis: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center gap-4 py-2 border-t border-b border-border/50">
                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inspectionData.isCovered}
                        onChange={(e) => setInspectionData({ ...inspectionData, isCovered: e.target.checked })}
                      />
                      Covered under Warranty Policy
                    </label>
                  </div>

                  {!inspectionData.isCovered && (
                    <div>
                      <label className="block text-[10px] text-muted-foreground font-bold mb-1">Estimated Out-of-Warranty Repair Cost (৳)</label>
                      <input
                        type="number"
                        value={inspectionData.estimatedCost}
                        onChange={(e) => setInspectionData({ ...inspectionData, estimatedCost: Number(e.target.value) })}
                        className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="border-t border-border/50 pt-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Replacement Part Logs</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-bold mb-1">Replacement Serial Number</label>
                        <input
                          type="text"
                          value={inspectionData.replacementSerialNumber}
                          onChange={(e) => setInspectionData({ ...inspectionData, replacementSerialNumber: e.target.value })}
                          className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-bold mb-1">Replacement Part Cost (৳)</label>
                        <input
                          type="number"
                          value={inspectionData.replacementCost}
                          onChange={(e) => setInspectionData({ ...inspectionData, replacementCost: Number(e.target.value) })}
                          className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setShowInspectionModal(false)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitInspection}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Save Inspection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              CLAIM RESOLUTION STATUS DIALOG
             ========================================== */}
          {showClaimStatusModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border/80 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Adjust Claim Status</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">New Resolution Status</label>
                    <select
                      value={claimStatusData.status}
                      onChange={(e) => setClaimStatusData({ ...claimStatusData, status: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                    >
                      <option value="APPROVED">APPROVED (Authorize Part Replacement)</option>
                      <option value="REJECTED">REJECTED (Decline Coverage)</option>
                      <option value="REPAIR_STARTED">REPAIR STARTED</option>
                      <option value="WAITING_PARTS">WAITING PARTS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="DELIVERED">DELIVERED (Handover back to Customer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Resolution Details & Notes</label>
                    <textarea
                      value={claimStatusData.resolutionDetails}
                      onChange={(e) => setClaimStatusData({ ...claimStatusData, resolutionDetails: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none h-20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setShowClaimStatusModal(false)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateClaimStatus}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Save Status
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              CREATE SUPPLIER RMA DIALOG
             ========================================== */}
          {showCreateRmaModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border/80 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Register Outward Supplier RMA</h3>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Defective Reason Details</label>
                    <textarea
                      value={newRmaData.reason}
                      onChange={(e) => setNewRmaData({ ...newRmaData, reason: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none h-16"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Quantity Returned</label>
                    <input
                      type="number"
                      value={newRmaData.quantity}
                      onChange={(e) => setNewRmaData({ ...newRmaData, quantity: Number(e.target.value) })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Courier Service</label>
                    <input
                      type="text"
                      value={newRmaData.courier}
                      onChange={(e) => setNewRmaData({ ...newRmaData, courier: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Courier Tracking ID</label>
                    <input
                      type="text"
                      value={newRmaData.trackingNumber}
                      onChange={(e) => setNewRmaData({ ...newRmaData, trackingNumber: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Replacement ETA Date</label>
                    <input
                      type="date"
                      value={newRmaData.replacementEta}
                      onChange={(e) => setNewRmaData({ ...newRmaData, replacementEta: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setShowCreateRmaModal(false)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRma}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Register RMA Return
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              UPDATE SUPPLIER RMA STATUS DIALOG
             ========================================== */}
          {showRmaStatusModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card border border-border/80 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Update Supplier RMA Status</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">RMA Return Status</label>
                    <select
                      value={rmaStatusData.status}
                      onChange={(e) => setRmaStatusData({ ...rmaStatusData, status: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                    >
                      <option value="SHIPPED">SHIPPED (Enroute to Vendor)</option>
                      <option value="REPLACED">REPLACED (New Replacement parts received)</option>
                      <option value="CREDITED">CREDITED (Supplier Credit note issued)</option>
                      <option value="REJECTED">REJECTED (Return declined by vendor)</option>
                    </select>
                  </div>

                  {rmaStatusData.status === 'CREDITED' && (
                    <div>
                      <label className="block text-[10px] text-muted-foreground font-bold mb-1">Vendor Credit Note Number</label>
                      <input
                        type="text"
                        value={rmaStatusData.creditNoteNumber}
                        onChange={(e) => setRmaStatusData({ ...rmaStatusData, creditNoteNumber: e.target.value })}
                        className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold mb-1">Processing Notes</label>
                    <textarea
                      value={rmaStatusData.notes}
                      onChange={(e) => setRmaStatusData({ ...rmaStatusData, notes: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none h-20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setShowRmaStatusModal(false)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateRmaStatus}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Save Status
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
