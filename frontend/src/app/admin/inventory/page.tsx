/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Archive, 
  Search, 
  AlertTriangle, 
  ArrowLeftRight, 
  TrendingUp, 
  X, 
  Loader2,
  CheckCircle,
  QrCode,
  ClipboardList
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/context/admin-auth-context';

export default function InventoryPage() {
  const { adminUser: _adminUser } = useAdminAuth();
  
  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Data States
  const [parts, setParts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState<any | null>(null);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, _setCategoryFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('d1111111-1111-1111-1111-111111111111'); // Dhanmondi default view
  const [viewTab, setViewTab] = useState<'catalog' | 'transfers' | 'movements'>('catalog');
  const [movements, setMovements] = useState<any[]>([]);

  const [branches] = useState<{ id: string; name: string }[]>([
    { id: 'd1111111-1111-1111-1111-111111111111', name: 'Dhanmondi Head Office' },
    { id: 'b2222222-2222-2222-2222-222222222222', name: 'Banani Laboratory' },
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Mirpur Express Desk' }
  ]);

  // Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustQty, setAdjustQty] = useState('5');
  const [adjustType, setAdjustType] = useState('manual_correction');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferQty, setTransferQty] = useState('1');
  const [fromBranchId, setFromBranchId] = useState('d1111111-1111-1111-1111-111111111111');
  const [toBranchId, setToBranchId] = useState('b2222222-2222-2222-2222-222222222222');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Fetch Parts
  const fetchParts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.inventory.parts(
        { 
          search: search || undefined,
          category: categoryFilter || undefined,
          branchId: branchFilter || undefined,
        },
        token
      );
      if (res && res.success) {
        setParts(res.data);
      } else {
        setError(res.message || 'Failed to fetch inventory catalog');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to database.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, branchFilter]);

  // Fetch transfers list
  const fetchTransfersList = async () => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.inventory.transfers(token);
      if (res && res.success) {
        setTransfers(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch movements list
  const fetchMovementsList = async () => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.inventory.movements(token);
      if (res && res.success) {
        setMovements(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats State
  const [stats, setStats] = useState<any>({
    totalProducts: 0,
    totalPartsQuantity: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    reservedCount: 0,
    totalValuation: 0,
    monthlyUsage: 142,
  });

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.inventory.dashboardStats(branchFilter || undefined, token);
      if (res && res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching inventory stats:', err);
    }
  }, [branchFilter]);

  // Delete Part Handler
  const handleDeletePart = async (id: string) => {
    if (!confirm('Are you sure you want to delete this part from the inventory catalog?')) return;
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.inventory.deletePart(id, token);
      setSelectedPart(null);
      fetchParts();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete part.');
    }
  };

  // Duplicate Part Handler
  const handleDuplicatePart = async (id: string) => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.inventory.duplicatePart(id, token);
      if (res && res.success) {
        fetchParts();
        fetchStats();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate part.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
      if (viewTab === 'catalog') fetchParts();
      if (viewTab === 'transfers') fetchTransfersList();
      if (viewTab === 'movements') fetchMovementsList();
    }, 0);
    return () => clearTimeout(timer);
  }, [viewTab, fetchParts, fetchStats]);

  // Fetch single part details
  const fetchPartDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.inventory.getPart(id, token);
      if (res && res.success) {
        setSelectedPart(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stock Adjustment Form submission
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || !adjustQty) return;
    setAdjustLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.inventory.adjustStock(selectedPart.id, {
        branchId: branchFilter,
        quantityDelta: parseInt(adjustQty),
        type: adjustType,
        notes: adjustNotes,
      }, token);
      setIsAdjustModalOpen(false);
      setAdjustNotes('');
      fetchParts();
      fetchPartDetails(selectedPart.id);
    } catch (err) {
      console.error(err);
    } finally {
      setAdjustLoading(false);
    }
  };

  // Stock Transfer Form submission
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || !transferQty) return;
    setTransferLoading(true);
    setTransferError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.inventory.createTransfer(selectedPart.id, {
        fromBranchId,
        toBranchId,
        quantity: parseInt(transferQty),
      }, token);
      setIsTransferModalOpen(false);
      fetchParts();
      fetchPartDetails(selectedPart.id);
    } catch (err: any) {
      setTransferError(err.message || 'Transfer failed. Check source branch quantity.');
    } finally {
      setTransferLoading(false);
    }
  };

  // Complete/Execute stock transfer status (Approve or Cancel)
  const handleProcessTransfer = async (transferId: string, status: 'TRANSFERRED' | 'CANCELLED') => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.inventory.executeTransfer(transferId, status, token);
      fetchTransfersList();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate totals
  const totalValuation = parts.reduce((acc, curr) => acc + Number(curr.valuation), 0);
  const lowStockCount = parts.filter(p => p.isLowStock).length;

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <Archive className="h-8 w-8 text-indigo-500" />
                Inventory & Stock Management
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Monitor buffer stock limits, process transfers, record valuation audit trails, and generate barcodes.
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400">Total Products</span>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalProducts || parts.length}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400">Total Stock Units</span>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">{stats.totalPartsQuantity || 0}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400">In Stock</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.inStockCount || 0}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400">Low Stock</span>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats.lowStockCount || lowStockCount}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400">Out of Stock</span>
              <h3 className="text-2xl font-bold text-red-400 mt-1">{stats.outOfStockCount || 0}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400">Total Valuation</span>
              <h3 className="text-xl font-bold text-indigo-400 mt-1">BDT {(stats.totalValuation || totalValuation).toLocaleString()}</h3>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 flex gap-4 text-sm">
            <button 
              onClick={() => setViewTab('catalog')}
              className={`pb-3 font-semibold transition ${viewTab === 'catalog' ? 'border-b-2 border-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Inventory Catalog
            </button>
            <button 
              onClick={() => setViewTab('transfers')}
              className={`pb-3 font-semibold transition ${viewTab === 'transfers' ? 'border-b-2 border-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Inter-Branch Transfers
            </button>
            <button 
              onClick={() => setViewTab('movements')}
              className={`pb-3 font-semibold transition ${viewTab === 'movements' ? 'border-b-2 border-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Stock Audit Trail
            </button>
          </div>

          {/* Main Content Area */}
          {viewTab === 'catalog' && (
            <div className="space-y-6">
              {/* Filter bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search catalog SKU, name, brand compatibility..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} Stock</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid content split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase bg-slate-950/50">
                          <th className="p-4">SKU / Item Name</th>
                          <th className="p-4">Compatibility</th>
                          <th className="p-4">Branch Stock</th>
                          <th className="p-4">Reserved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {parts.map((p) => (
                          <tr 
                            key={p.id}
                            className={`hover:bg-slate-800/40 cursor-pointer transition ${selectedPart?.id === p.id ? 'bg-indigo-950/20' : ''}`}
                            onClick={() => fetchPartDetails(p.id)}
                          >
                            <td className="p-4">
                              <span className="text-xs text-indigo-400 font-mono font-bold block">{p.sku}</span>
                              <h3 className="font-semibold text-white mt-0.5">{p.name}</h3>
                            </td>
                            <td className="p-4">
                              <span className="text-xs bg-slate-950 border border-slate-850 px-2 py-1 rounded text-slate-400">
                                {p.brandCompatibility}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${p.isLowStock ? 'text-red-400' : 'text-slate-200'}`}>
                                  {p.branchStock} units
                                </span>
                                {p.isLowStock && (
                                  <span className="text-[10px] text-red-500 font-semibold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 animate-pulse">
                                    LOW
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-xs text-slate-400">{p.reservedStock} reserved</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Part details drawer panel */}
                <div>
                  {selectedPart ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-indigo-400 font-mono font-bold">{selectedPart.sku}</span>
                          <h2 className="text-xl font-bold text-white mt-1">{selectedPart.name}</h2>
                          <p className="text-xs text-slate-400 mt-1">Category: {selectedPart.category} ({selectedPart.brand})</p>
                        </div>
                        <button onClick={() => setSelectedPart(null)} className="text-slate-400 hover:text-white">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Mock QR/Barcode */}
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                        <QrCode className="h-28 w-28 text-slate-400" />
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest">{selectedPart.id.toUpperCase().substring(0, 16)}</span>
                      </div>

                      {/* Stock Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsAdjustModalOpen(true)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3 py-2 rounded-lg"
                        >
                          Adjust stock levels
                        </button>
                        <button
                          onClick={() => {
                            setFromBranchId(branchFilter);
                            setIsTransferModalOpen(true);
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                        </button>
                      </div>

                      {/* Branch Stock Allocation */}
                      <div className="space-y-3 border-t border-slate-850 pt-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Branch Stock Allocations</h3>
                        <div className="space-y-2">
                          {selectedPart.branchInventory?.map((bi: any) => (
                            <div key={bi.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-350">{bi.branch.name.split(' ')[0]}</span>
                              <span className="font-bold text-white">{bi.quantity} units</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reservances */}
                      <div className="space-y-3 border-t border-slate-850 pt-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Active Ticket Reserves</span>
                          <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded font-bold">
                            {selectedPart.reservedCount} locked
                          </span>
                        </h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {selectedPart.reservedTickets?.map((t: any) => (
                            <div key={t.ticketId} className="bg-slate-950 p-2 rounded border border-slate-850 text-[11px] leading-relaxed">
                              <div className="flex justify-between items-center font-semibold text-white">
                                <span>{t.deviceModel}</span>
                                <span className="text-amber-400">{t.status}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">Assigned to: {t.customerName}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2 sticky top-6">
                      <QrCode className="h-10 w-10 text-slate-650" />
                      <p className="text-sm">Select a part SKU on the left list to review detailed metrics, QR labels, and allocations.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transfers tab */}
          {viewTab === 'transfers' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase bg-slate-950/50">
                    <th className="p-4">Part Details</th>
                    <th className="p-4">Transit Route</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-350 text-xs">
                  {transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <span className="font-bold text-white block">{t.part.name}</span>
                        <span className="text-[10px] text-indigo-400 font-mono mt-0.5">{t.part.sku}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-300">{t.fromBranch.name.split(' ')[0]}</span>
                          <span className="text-slate-500">&rarr;</span>
                          <span className="text-slate-350">{t.toBranch.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-200">{t.quantity} units</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          t.status === 'TRANSFERRED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          t.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                          'bg-slate-850 text-slate-400 border border-slate-750'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {t.status === 'PENDING' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleProcessTransfer(t.id, 'TRANSFERRED')}
                              className="bg-emerald-600 text-white px-2 py-1 rounded font-bold text-[10px]"
                            >
                              Receive
                            </button>
                            <button
                              onClick={() => handleProcessTransfer(t.id, 'CANCELLED')}
                              className="bg-slate-800 text-slate-300 px-2 py-1 rounded font-bold border border-slate-700 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-slate-600" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Movements tab */}
          {viewTab === 'movements' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase bg-slate-950/50">
                    <th className="p-4">Date</th>
                    <th className="p-4">SKU / Item</th>
                    <th className="p-4">Branch</th>
                    <th className="p-4">Adjustment</th>
                    <th className="p-4">Transaction Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-350 text-xs">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 text-slate-450">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white block">{m.part.name}</span>
                        <span className="text-[10px] text-indigo-400 font-mono">{m.part.sku}</span>
                      </td>
                      <td className="p-4">
                        {m.branch.name.split(' ')[0]}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${m.quantityDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.quantityDelta >= 0 ? `+${m.quantityDelta}` : m.quantityDelta} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-850 px-2 py-0.5 rounded border border-slate-750 uppercase font-mono font-medium text-[9px] text-slate-350">
                          {m.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Adjust stock modal */}
      {isAdjustModalOpen && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <h2 className="text-lg font-bold text-white">Adjust Catalog stock levels</h2>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdjustStock} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adjustment Quantity (Delta)</label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. 5 or -2"
                />
                <p className="text-[10px] text-slate-500">Provide positive values to add stock, or negative values to deduct.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correction Reason Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="manual_correction">Manual Stock Correction</option>
                  <option value="purchase_receipt">Direct Purchase Check-In</option>
                  <option value="repair_consume">Repair Ticket Allocation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit logs explanation</label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Record note details for the stock movement ledger..."
                  className="w-full bg-slate-950 border border-slate-855 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none placeholder-slate-600 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  {adjustLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Adjust stock levels
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer stock modal */}
      {isTransferModalOpen && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-indigo-500" />
                Inter-Branch Stock Transfer
              </h2>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTransfer} className="p-6 space-y-4">
              {transferError && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-400 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> {transferError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">From Source Branch</label>
                <select
                  value={fromBranchId}
                  onChange={(e) => setFromBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">To Destination Branch</label>
                <select
                  value={toBranchId}
                  onChange={(e) => setToBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantity to Transit</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  {transferLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Dispatch Stock
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
