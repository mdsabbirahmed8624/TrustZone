/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, 
  Plus, 
  Clipboard, 
  DollarSign, 
  CheckCircle, 
  X, 
  Loader2,
  ChevronRight,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/context/admin-auth-context';

export default function SuppliersPage() {
  const { adminUser: _adminUser } = useAdminAuth();
  
  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Data States
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [selectedPO, setSelectedPO] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [viewTab, setViewTab] = useState<'suppliers' | 'pos'>('suppliers');
  
  // Branches
  const [branches] = useState<{ id: string; name: string }[]>([
    { id: 'd1111111-1111-1111-1111-111111111111', name: 'Dhanmondi Head Office' },
    { id: 'b2222222-2222-2222-2222-222222222222', name: 'Banani Laboratory' },
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Mirpur Express Desk' }
  ]);

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Purchase Order Builder Modal
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [poSupplierId, setPOSupplierId] = useState('');
  const [poBranchId, setPOBranchId] = useState('d1111111-1111-1111-1111-111111111111');
  const [poItems, setPOItems] = useState<{ partId: string; quantity: number; unitCost: number }[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedQty, setSelectedQty] = useState('10');
  const [selectedUnitCost, setSelectedUnitCost] = useState('3500');
  const [poLoading, setPOLoading] = useState(false);

  // Partial Receive Modal
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});

  // Fetch Supplier profile
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.suppliers.list(token);
      if (res && res.success) {
        setSuppliers(res.data);
        if (res.data.length > 0 && !poSupplierId) {
          setPOSupplierId(res.data[0].id);
        }
      } else {
        setError(res.message || 'Failed to fetch suppliers');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  }, [poSupplierId]);

  // Fetch POs
  const fetchPOs = async () => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.suppliers.listPOs(undefined, token);
      if (res && res.success) {
        setPurchaseOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Parts list for PO builder dropdown
  const fetchPartsDropdown = async () => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.inventory.parts({}, token);
      if (res && res.success) {
        setParts(res.data);
        if (res.data.length > 0) {
          setSelectedPartId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (viewTab === 'suppliers') fetchSuppliers();
      if (viewTab === 'pos') {
        fetchPOs();
        fetchPartsDropdown();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [viewTab, fetchSuppliers]);

  // Fetch single Supplier details
  const fetchSupplierDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.suppliers.get(id, token);
      if (res && res.success) {
        setSelectedSupplier(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch single PO details
  const fetchPODetails = async (id: string) => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.suppliers.getPO(id, token);
      if (res && res.success) {
        setSelectedPO(res.data);
        // Initialize partial receive counts helper state
        const qties: Record<string, number> = {};
        res.data.items.forEach((item: any) => {
          qties[item.id] = item.quantity - item.quantityReceived; // Default to remaining parts
        });
        setReceivedQuantities(qties);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Payment record
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !paymentAmount) return;
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.suppliers.recordPayment(selectedSupplier.id, parseFloat(paymentAmount), paymentRef, token);
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentRef('');
      fetchSuppliers();
      fetchSupplierDetails(selectedSupplier.id);
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Add item to PO builder list
  const addPOItem = () => {
    if (!selectedPartId) return;
    const existingIdx = poItems.findIndex(i => i.partId === selectedPartId);
    if (existingIdx !== -1) {
      const updated = [...poItems];
      updated[existingIdx].quantity += parseInt(selectedQty);
      setPOItems(updated);
    } else {
      setPOItems([...poItems, {
        partId: selectedPartId,
        quantity: parseInt(selectedQty),
        unitCost: parseFloat(selectedUnitCost),
      }]);
    }
  };

  // Remove item from PO builder list
  const removePOItem = (partId: string) => {
    setPOItems(poItems.filter(i => i.partId !== partId));
  };

  // Submit PO
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0 || !poSupplierId) return;
    setPOLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.suppliers.createPO({
        supplierId: poSupplierId,
        branchId: poBranchId,
        items: poItems,
      }, token);
      setIsPOModalOpen(false);
      setPOItems([]);
      fetchPOs();
    } catch (err) {
      console.error(err);
    } finally {
      setPOLoading(false);
    }
  };

  // Advance PO Status Workflow
  const handleUpdatePOStatus = async (poId: string, status: 'APPROVED' | 'ORDERED' | 'CANCELLED') => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.suppliers.updatePOStatus(poId, status, undefined, token);
      fetchPOs();
      fetchPODetails(poId);
    } catch (err) {
      console.error(err);
    }
  };

  // Settle payment state
  const handleSettlePOPayment = async (poId: string, paymentStatus: 'paid') => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.suppliers.updatePOPayment(poId, paymentStatus, token);
      fetchPOs();
      fetchPODetails(poId);
    } catch (err) {
      console.error(err);
    }
  };

  // Execute Partial Receive submission
  const handleReceivePOItems = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    setReceiveLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      // Map helper state to array payload
      const receivedItems = Object.keys(receivedQuantities).map(itemId => {
        const item = selectedPO.items.find((i: any) => i.id === itemId);
        const inputQty = receivedQuantities[itemId];
        const newTotalReceived = item.quantityReceived + inputQty;
        return {
          itemId,
          quantityReceived: newTotalReceived,
        };
      });

      await api.suppliers.updatePOStatus(selectedPO.id, 'RECEIVED', receivedItems, token);
      setIsReceiveModalOpen(false);
      fetchPOs();
      fetchPODetails(selectedPO.id);
    } catch (err) {
      console.error(err);
    } finally {
      setReceiveLoading(false);
    }
  };

  const handlePartialQtyChange = (itemId: string, val: number, maxQty: number) => {
    setReceivedQuantities({
      ...receivedQuantities,
      [itemId]: Math.min(Math.max(0, val), maxQty),
    });
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
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <Truck className="h-8 w-8 text-indigo-500" />
                Suppliers & Supply Chain
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Monitor vendor balances, execute payment ledgers, and manage partial receiving of purchase orders.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPOModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <ShoppingBag className="h-5 w-5" />
                Draft Purchase Order
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="border-b border-border/60 flex gap-4 text-sm">
            <button 
              onClick={() => setViewTab('suppliers')}
              className={`pb-3 font-semibold transition ${viewTab === 'suppliers' ? 'border-b-2 border-indigo-500 text-white' : 'text-muted-foreground hover:text-white'}`}
            >
              Vendor Ledger Balances
            </button>
            <button 
              onClick={() => setViewTab('pos')}
              className={`pb-3 font-semibold transition ${viewTab === 'pos' ? 'border-b-2 border-indigo-500 text-white' : 'text-muted-foreground hover:text-white'}`}
            >
              Purchase Orders Lifecycle
            </button>
          </div>

          {/* Suppliers Tab */}
          {viewTab === 'suppliers' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-card border border-border/60 rounded-xl">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    <span className="text-muted-foreground mt-2 text-sm">Loading vendor ledger data...</span>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                ) : (
                  <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground text-xs font-semibold uppercase bg-secondary/20">
                          <th className="p-4">Vendor Details</th>
                          <th className="p-4">Rating</th>
                          <th className="p-4">Outstanding Balance</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-350 text-xs">
                        {suppliers.map((s) => (
                          <tr 
                            key={s.id}
                            className={`hover:bg-secondary/40 cursor-pointer transition ${selectedSupplier?.id === s.id ? 'bg-indigo-950/20' : ''}`}
                            onClick={() => fetchSupplierDetails(s.id)}
                          >
                            <td className="p-4">
                              <h3 className="font-semibold text-white text-sm">{s.name}</h3>
                              <p className="text-muted-foreground text-[10px] mt-0.5">{s.contactPerson} • {s.phone}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-amber-400 font-bold font-mono">{s.rating.toFixed(2)}</span>
                            </td>
                            <td className="p-4">
                              <span className={`font-bold ${s.outstandingBalance > 0 ? 'text-red-450' : 'text-emerald-400'}`}>
                                BDT {s.outstandingBalance.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button className="text-indigo-400 hover:text-indigo-300 font-medium bg-indigo-500/10 px-2.5 py-1 rounded">
                                View Ledger
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Vendor Ledger Right Column Detail */}
              <div>
                {selectedSupplier ? (
                  <div className="bg-card border border-border/60 rounded-xl p-6 space-y-6 sticky top-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-bold text-white">{selectedSupplier.name}</h2>
                        <p className="text-xs text-indigo-400 mt-0.5">Contact: {selectedSupplier.contactPerson}</p>
                      </div>
                      <button onClick={() => setSelectedSupplier(null)} className="text-muted-foreground hover:text-white">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Ledger Balance Widget */}
                    <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Outstanding Due</span>
                        <h4 className="text-xl font-bold text-red-450 mt-0.5">BDT {selectedSupplier.outstandingBalance.toLocaleString()}</h4>
                      </div>
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <DollarSign className="h-3.5 w-3.5" /> Record Payment
                      </button>
                    </div>

                    {/* Ledger log records list */}
                    <div className="space-y-3 border-t border-slate-805 pt-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Transactions Log</h3>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {selectedSupplier.ledger?.map((log: any) => (
                          <div key={log.id} className="bg-secondary/20 border border-border/60 p-2.5 rounded-lg flex justify-between items-center text-xs">
                            <div>
                              <span className="font-semibold text-white block">{log.reference || 'Stock shipment'}</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">{new Date(log.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className={`font-bold ${log.type === 'CREDIT' ? 'text-red-400' : 'text-emerald-400'}`}>
                              {log.type === 'CREDIT' ? `+ BDT ${log.amount}` : `- BDT ${log.amount}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border/60 rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 sticky top-6">
                    <Truck className="h-10 w-10 text-slate-650" />
                    <p className="text-sm">Select a vendor from the list to view ledgers, transaction records, and post payments.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PO Lifecycle Tab */}
          {viewTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground text-xs font-semibold uppercase bg-secondary/20">
                        <th className="p-4">Order ID / Date</th>
                        <th className="p-4">Vendor</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-350 text-xs">
                      {purchaseOrders.map((po) => (
                        <tr 
                          key={po.id}
                          className={`hover:bg-secondary/40 cursor-pointer transition ${selectedPO?.id === po.id ? 'bg-indigo-950/20' : ''}`}
                          onClick={() => fetchPODetails(po.id)}
                        >
                          <td className="p-4">
                            <span className="font-mono font-bold text-white block">#{po.id.substring(0, 8).toUpperCase()}</span>
                            <span className="text-[10px] text-slate-550 mt-0.5">{new Date(po.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="p-4">
                            {po.supplier.name}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-foreground">BDT {Number(po.totalAmount).toLocaleString()}</span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                              po.status === 'RECEIVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                              po.status === 'ORDERED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25' :
                              po.status === 'APPROVED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' :
                              po.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                              'bg-secondary text-muted-foreground border border-border'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PO Lifecycle Details Panel */}
              <div>
                {selectedPO ? (
                  <div className="bg-card border border-border/60 rounded-xl p-6 space-y-6 sticky top-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-indigo-400 font-mono font-bold">PURCHASE ORDER #{selectedPO.id.substring(0, 8).toUpperCase()}</span>
                        <h2 className="text-lg font-bold text-white mt-1">{selectedPO.supplier.name}</h2>
                        <p className="text-[11px] text-muted-foreground mt-1">Destination Branch ID: {selectedPO.branchId.substring(0, 8)}...</p>
                      </div>
                      <button onClick={() => setSelectedPO(null)} className="text-muted-foreground hover:text-white">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* PO Status Banner */}
                    <div className="grid grid-cols-2 gap-3 bg-secondary/20 p-4 rounded-xl border border-border/60 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Order State</span>
                        <span className="block font-bold mt-1 text-white uppercase">{selectedPO.status}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Payment State</span>
                        <span className="block font-bold mt-1 text-white uppercase">{selectedPO.paymentStatus}</span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ordered Parts List</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedPO.items?.map((item: any) => (
                          <div key={item.id} className="bg-secondary/20 p-3 rounded-lg border border-border/60 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-semibold text-white block">{item.part.name}</span>
                              <span className="text-[10px] text-indigo-400 font-mono mt-0.5">{item.part.sku}</span>
                              <span className="text-[10px] text-muted-foreground block mt-1">Cost: BDT {item.unitCost}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-white">{item.quantityReceived} / {item.quantity} Received</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Workflow Action Triggers */}
                    <div className="border-t border-border/60 pt-4 space-y-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workflow state actions</h3>
                      
                      {selectedPO.status === 'DRAFT' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdatePOStatus(selectedPO.id, 'APPROVED')}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 rounded-lg"
                          >
                            Approve Order
                          </button>
                          <button
                            onClick={() => handleUpdatePOStatus(selectedPO.id, 'CANCELLED')}
                            className="flex-1 bg-secondary hover:bg-slate-700 text-slate-350 font-medium text-xs py-2 rounded-lg border border-border"
                          >
                            Cancel PO
                          </button>
                        </div>
                      )}

                      {selectedPO.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdatePOStatus(selectedPO.id, 'ORDERED')}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 rounded-lg"
                        >
                          Commit Order (Dispatch to Vendor)
                        </button>
                      )}

                      {selectedPO.status === 'ORDERED' && (
                        <div className="space-y-2">
                          <button
                            onClick={() => setIsReceiveModalOpen(true)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1"
                          >
                            Execute Partial / Full Receive check-in
                          </button>
                          <button
                            onClick={() => handleUpdatePOStatus(selectedPO.id, 'CANCELLED')}
                            className="w-full bg-secondary hover:bg-slate-700 text-foreground text-xs py-2 rounded-lg border border-border font-medium"
                          >
                            Cancel PO
                          </button>
                        </div>
                      )}

                      {selectedPO.status === 'RECEIVED' && selectedPO.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => handleSettlePOPayment(selectedPO.id, 'paid')}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 rounded-lg flex items-center justify-center gap-1"
                        >
                          <CreditCard className="h-4 w-4" /> Settle Payment Ledger (Paid)
                        </button>
                      )}

                      {(selectedPO.status === 'CANCELLED' || (selectedPO.status === 'RECEIVED' && selectedPO.paymentStatus === 'paid')) && (
                        <span className="text-muted-foreground text-xs italic flex items-center justify-center gap-1.5 p-2 bg-secondary/20 border border-border/60 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-slate-600" /> This purchase order is finalized.
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border/60 rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 sticky top-6">
                    <Clipboard className="h-10 w-10 text-slate-650" />
                    <p className="text-sm">Select a Purchase Order to manage workflows, authorize ordered items, and receive stocks.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border/60 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-secondary/20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-500" />
                Record Vendor Payment
              </h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-muted-foreground hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Amount (BDT)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-secondary/20 border border-border/60 px-3 py-2 rounded-lg text-foreground text-sm focus:outline-none"
                  placeholder="e.g. 5000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Reference / Note</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-secondary/20 border border-border/60 px-3 py-2 rounded-lg text-foreground text-sm focus:outline-none"
                  placeholder="e.g. Bank wire ref #9928"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  {paymentLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Payment log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO Draft Creator Modal */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border/60 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-secondary/20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-indigo-500" />
                Draft New Purchase Order
              </h2>
              <button onClick={() => setIsPOModalOpen(false)} className="text-muted-foreground hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePO} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Vendor</label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPOSupplierId(e.target.value)}
                    className="w-full bg-secondary/20 border border-border/60 px-3 py-2 rounded-lg text-foreground text-sm focus:outline-none"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination Branch</label>
                  <select
                    value={poBranchId}
                    onChange={(e) => setPOBranchId(e.target.value)}
                    className="w-full bg-secondary/20 border border-border/60 px-3 py-2 rounded-lg text-foreground text-sm focus:outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Part to list */}
              <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-3">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase">Add Item specifications</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3 space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase font-semibold">Select Catalog SKU</label>
                    <select
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value)}
                      className="w-full bg-card border border-border/60 px-3 py-1.5 rounded text-xs text-foreground"
                    >
                      {parts.map(p => (
                        <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase font-semibold">Quantity</label>
                    <input
                      type="number"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(e.target.value)}
                      className="w-full bg-card border border-border/60 px-3 py-1.5 rounded text-xs text-slate-250"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase font-semibold">Unit Cost (BDT)</label>
                    <input
                      type="number"
                      value={selectedUnitCost}
                      onChange={(e) => setSelectedUnitCost(e.target.value)}
                      className="w-full bg-card border border-border/60 px-3 py-1.5 rounded text-xs text-slate-250"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addPOItem}
                      className="w-full bg-secondary hover:bg-slate-700 text-indigo-400 font-bold text-xs py-1.5 rounded border border-border flex items-center justify-center gap-0.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Append
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List in PO builder */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Drafted Items</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {poItems.map(item => {
                    const pDetails = parts.find(p => p.id === item.partId);
                    return (
                      <div key={item.partId} className="bg-secondary/20 p-2.5 rounded border border-border/60 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white">{pDetails?.sku || 'Part SKU'}</span>
                          <span className="text-[10px] text-muted-foreground block">Cost BDT {item.unitCost} x {item.quantity} units</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-indigo-400">BDT {item.unitCost * item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => removePOItem(item.partId)}
                            className="text-red-400 hover:text-red-300"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsPOModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={poLoading || poItems.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                  {poLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Register Draft PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partial Receive Modal */}
      {isReceiveModalOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border/60 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-secondary/20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Receive Purchase Order Items
              </h2>
              <button onClick={() => setIsReceiveModalOpen(false)} className="text-muted-foreground hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleReceivePOItems} className="p-6 space-y-4">
              <p className="text-xs text-slate-450 leading-relaxed">
                Provide the quantity received for each part in this shipment check-in. Remaining stock transit balances will stay open.
              </p>
              
              <div className="space-y-3">
                {selectedPO.items?.map((item: any) => {
                  const maxReceive = item.quantity - item.quantityReceived;
                  return (
                    <div key={item.id} className="bg-secondary/20 p-3 rounded-lg border border-border/60 grid grid-cols-3 gap-2 items-center text-xs">
                      <div className="col-span-2">
                        <span className="font-semibold text-white block">{item.part.name}</span>
                        <span className="text-[10px] text-muted-foreground">Ordered: {item.quantity} | Already Received: {item.quantityReceived}</span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-semibold block">Now Receiving</label>
                        <input
                          type="number"
                          min={0}
                          max={maxReceive}
                          value={receivedQuantities[item.id] || 0}
                          onChange={(e) => handlePartialQtyChange(item.id, parseInt(e.target.value) || 0, maxReceive)}
                          className="w-full bg-card border border-border/60 px-3 py-1.5 rounded text-xs text-foreground text-right focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={receiveLoading}
                  className="bg-emerald-600 hover:bg-emerald-505 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  {receiveLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Check-In Shipments
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
