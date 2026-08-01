'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowRightLeft, 
  FileSpreadsheet, 
  Calculator, 
  CalendarRange, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Printer, 
  Download, 
  User, 
  Truck,
  Building,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Phone,
  FileCode
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api, ApiResponse } from '@/lib/api';
import { useAdminAuth } from '@/context/admin-auth-context';

export default function FinanceAccountingPage() {
  const { adminUser } = useAdminAuth();
  
  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'coa' | 'periods' | 'expenses' | 'incomes' | 'payments' | 'reports'>('dashboard');

  // Common Branches & Accounts lists
  const [branches] = useState<{ id: string; name: string }[]>([
    { id: 'd1111111-1111-1111-1111-111111111111', name: 'Dhanmondi Head Office' },
    { id: 'b2222222-2222-2222-2222-222222222222', name: 'Banani Laboratory' },
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Mirpur Express Desk' }
  ]);
  const [branchFilter, setBranchFilter] = useState('');
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard Data
  const [dashboard, setDashboard] = useState<any>(null);

  // Accounts & COA
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountNumber: '',
    name: '',
    parentAccountId: '',
    accountClass: 'ASSET' as any,
    accountType: 'CASH',
    normalBalance: 'DEBIT' as any,
    branchId: '',
    openingBalance: '0',
    bankName: '',
    accountNumberStr: '',
    bankBranch: '',
    mobileNumber: ''
  });

  // Period / Fiscal Year
  const [periods, setPeriods] = useState<any[]>([]);
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [isFyModalOpen, setIsFyModalOpen] = useState(false);
  const [newFy, setNewFy] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  // Transfers & Adjustments
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    reference: ''
  });

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    accountId: '',
    amountDelta: '',
    type: 'INCREASE' as any,
    reason: ''
  });

  // Expenses & Income
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'Rent',
    amount: '',
    notes: '',
    receiptUrl: '',
    branchId: 'd1111111-1111-1111-1111-111111111111',
    accountId: ''
  });

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({
    category: 'Other Income',
    amount: '',
    description: '',
    branchId: 'd1111111-1111-1111-1111-111111111111',
    accountId: ''
  });

  const [expenseToApprove, setExpenseToApprove] = useState<any>(null);
  const [approveAccountId, setApproveAccountId] = useState('');

  // Journals
  const [journals, setJournals] = useState<any[]>([]);

  // Customer Payments
  const [customers, setCustomers] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    invoiceId: '',
    amount: '',
    paymentMethod: 'Cash',
    transactionReference: '',
    accountId: '',
    customerId: '',
    customerName: ''
  });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Supplier Payments
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierPaymentData, setSupplierPaymentData] = useState({
    supplierId: '',
    amount: '',
    accountId: '',
    reference: '',
    supplierName: ''
  });

  // Daily Closing Drawer
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [closingData, setClosingData] = useState({
    branchId: 'd1111111-1111-1111-1111-111111111111',
    actualBalance: '',
    notes: ''
  });
  const [closings, setClosings] = useState<any[]>([]);

  // Reports States
  const [selectedReport, setSelectedReport] = useState<'pl' | 'cash' | 'bank' | 'customer' | 'supplier' | 'ledger' | 'journal' | 'tax'>('pl');
  const [reportStartDate, setReportStartDate] = useState('2026-07-01');
  const [reportEndDate, setReportEndDate] = useState('2026-07-31');
  const [reportAccountId, setReportAccountId] = useState('');
  const [reportResult, setReportResult] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Alerts/Notification States
  const [alerts, setAlerts] = useState<string[]>([]);

  // Token helper
  const getToken = () => localStorage.getItem('tz_admin_token') || undefined;

  // Initialize and Fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      
      // Fetch Dashboard
      const dashRes = await api.finance.dashboard({ branchId: branchFilter || undefined }, token);
      if (dashRes.success) setDashboard(dashRes.data);

      // Fetch Accounts
      const accsRes = await api.finance.accounts({ branchId: branchFilter || undefined }, token);
      if (accsRes.success) setAccounts(accsRes.data);

      // Fetch Periods
      const periodsRes = await api.finance.periods(token);
      if (periodsRes.success) setPeriods(periodsRes.data);

      // Fetch Fiscal Years
      const fyRes = await api.finance.fiscalYears(token);
      if (fyRes.success) setFiscalYears(fyRes.data);

      // Fetch Expenses
      const expRes = await api.finance.expenses({ branchId: branchFilter || undefined }, token);
      if (expRes.success) setExpenses(expRes.data);

      // Fetch Incomes
      const incRes = await api.finance.incomes({ branchId: branchFilter || undefined }, token);
      if (incRes.success) setIncomes(incRes.data);

      // Fetch Daily Closings
      const closingsRes = await api.finance.dailyClosings({ branchId: branchFilter || undefined }, token);
      if (closingsRes.success) setClosings(closingsRes.data);

      // Fetch Journals
      const jRes = await api.finance.journals({ branchId: branchFilter || undefined }, token);
      if (jRes.success) setJournals(jRes.data);

      // Fetch Customers and Suppliers for Payments
      const custRes = await api.customers.list({}, token);
      if (custRes.success) setCustomers(custRes.data);

      const suppRes = await api.suppliers.list(token);
      if (suppRes.success) setSuppliers(suppRes.data);

      // Fetch Invoices (We mock invoice fetch or read from tickets with estimateCost > 0)
      const tRes = await api.tickets.list({ branchId: branchFilter || undefined }, token);
      if (tRes.success) {
        // Group invoices on tickets
        const mockInvs = tRes.data
          .filter((t: any) => t.status === 'ready' || t.status === 'delivered')
          .map((t: any) => ({
            id: `inv-${t.id}`,
            invoiceNumber: `INV-2026-${t.id.substring(0, 5).toUpperCase()}`,
            ticketId: t.id,
            total: t.estimatedCost,
            status: t.status === 'delivered' ? 'paid' : 'unpaid',
            createdAt: t.createdAt,
            ticket: t
          }));
        setInvoices(mockInvs);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  }, [branchFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute Alerts based on balances and closings
  useEffect(() => {
    if (!dashboard || !accounts) return;
    const activeAlerts: string[] = [];

    // Negative balances check
    accounts.forEach((acc) => {
      if ((acc.accountType === 'CASH' || acc.accountType === 'BANK' || acc.accountType === 'MOBILE_BANKING') && Number(acc.currentBalance) < 0) {
        activeAlerts.push(`Negative balance on cash drawer account [${acc.accountNumber}] ${acc.name}: ৳${Number(acc.currentBalance).toFixed(2)}`);
      }
      if (acc.accountType === 'CASH' && Number(acc.currentBalance) < 5000) {
        activeAlerts.push(`Low balance warning on account [${acc.accountNumber}] ${acc.name}: ৳${Number(acc.currentBalance).toFixed(2)}`);
      }
    });

    // Customer Dues check (Duns alert)
    if (dashboard.accountsReceivable > 50000) {
      activeAlerts.push(`High Customer Dues alert: Outstanding receivables are ৳${Number(dashboard.accountsReceivable).toFixed(2)}`);
    }

    setAlerts(activeAlerts);
  }, [dashboard, accounts]);

  // Fetch Report
  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportResult(null);
    try {
      const token = getToken();
      let res;
      if (selectedReport === 'pl') {
        res = await api.finance.reportProfitLoss({ startDate: reportStartDate, endDate: reportEndDate, branchId: branchFilter || undefined }, token);
      } else if (selectedReport === 'cash') {
        res = await api.finance.reportCashBook({ startDate: reportStartDate, endDate: reportEndDate, branchId: branchFilter || undefined }, token);
      } else if (selectedReport === 'bank') {
        res = await api.finance.reportBankBook({ startDate: reportStartDate, endDate: reportEndDate, branchId: branchFilter || undefined }, token);
      } else if (selectedReport === 'customer') {
        res = await api.finance.reportCustomerDues(token);
      } else if (selectedReport === 'supplier') {
        res = await api.finance.reportSupplierDues(token);
      } else if (selectedReport === 'ledger') {
        res = await api.finance.reportGeneralLedger({ startDate: reportStartDate, endDate: reportEndDate, accountId: reportAccountId || undefined }, token);
      } else if (selectedReport === 'tax') {
        res = await api.finance.reportTaxSummary({ startDate: reportStartDate, endDate: reportEndDate }, token);
      } else {
        // Journal Report
        const jRes = await api.finance.journals({ branchId: branchFilter || undefined }, token);
        res = { success: true, data: jRes.data };
      }

      if (res && res.success) {
        setReportResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Report generation failed');
    } finally {
      setReportLoading(false);
    }
  };

  // Perform Period Lock Toggle
  const handlePeriodLock = async (id: string, isLocked: boolean) => {
    try {
      const res = await api.finance.lockPeriod(id, isLocked, getToken());
      if (res.success) {
        setPeriods(periods.map(p => p.id === id ? { ...p, isLocked } : p));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update period lock status');
    }
  };

  // Create Fiscal Year
  const handleCreateFy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.finance.createFiscalYear(newFy, getToken());
      if (res.success) {
        setIsFyModalOpen(false);
        setNewFy({ name: '', startDate: '', endDate: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create fiscal year');
    }
  };

  // Create Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.finance.createAccount({
        ...newAccount,
        openingBalance: parseFloat(newAccount.openingBalance) || 0,
        branchId: newAccount.branchId || undefined,
        parentAccountId: newAccount.parentAccountId || undefined,
      }, getToken());

      if (res.success) {
        setIsAccountModalOpen(false);
        setNewAccount({
          accountNumber: '',
          name: '',
          parentAccountId: '',
          accountClass: 'ASSET',
          accountType: 'CASH',
          normalBalance: 'DEBIT',
          branchId: '',
          openingBalance: '0',
          bankName: '',
          accountNumberStr: '',
          bankBranch: '',
          mobileNumber: ''
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create account');
    }
  };

  // Handle Transfer
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.finance.transfer({
        ...transferData,
        amount: parseFloat(transferData.amount)
      }, getToken());
      if (res.success) {
        setIsTransferModalOpen(false);
        setTransferData({ fromAccountId: '', toAccountId: '', amount: '', reference: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Transfer failed');
    }
  };

  // Handle Adjustment
  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.finance.adjust({
        ...adjustData,
        amountDelta: parseFloat(adjustData.amountDelta) * (adjustData.type === 'DECREASE' ? -1 : 1)
      }, getToken());
      if (res.success) {
        setIsAdjustModalOpen(false);
        setAdjustData({ accountId: '', amountDelta: '', type: 'INCREASE', reason: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Adjustment failed');
    }
  };

  // Create Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.finance.createExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      }, getToken());
      if (res.success) {
        setIsExpenseModalOpen(false);
        setNewExpense({ category: 'Rent', amount: '', notes: '', receiptUrl: '', branchId: 'd1111111-1111-1111-1111-111111111111', accountId: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Expense creation failed');
    }
  };

  // Approve Expense
  const handleApproveExpense = async (approved: boolean) => {
    if (!expenseToApprove) return;
    if (approved && !approveAccountId) {
      alert('Please select a cash/bank account to pay this expense.');
      return;
    }
    try {
      const res = await api.finance.approveExpense(expenseToApprove.id, approved, approveAccountId, getToken());
      if (res.success) {
        setExpenseToApprove(null);
        setApproveAccountId('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Expense processing failed');
    }
  };

  // Create Income
  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.finance.createIncome({
        ...newIncome,
        amount: parseFloat(newIncome.amount)
      }, getToken());
      if (res.success) {
        setIsIncomeModalOpen(false);
        setNewIncome({ category: 'Other Income', amount: '', description: '', branchId: 'd1111111-1111-1111-1111-111111111111', accountId: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Income record failed');
    }
  };

  // Customer Payment
  const handleCustomerPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.finance.collectPayment({
        invoiceId: paymentData.invoiceId,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        transactionReference: paymentData.transactionReference,
        accountId: paymentData.accountId
      }, getToken());
      if (res.success) {
        setIsPaymentModalOpen(false);
        setPaymentData({ invoiceId: '', amount: '', paymentMethod: 'Cash', transactionReference: '', accountId: '', customerId: '', customerName: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Payment collection failed');
    }
  };

  // Supplier Payment
  const handleSupplierPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.finance.paySupplier({
        supplierId: supplierPaymentData.supplierId,
        amount: parseFloat(supplierPaymentData.amount),
        accountId: supplierPaymentData.accountId,
        reference: supplierPaymentData.reference
      }, getToken());
      if (res.success) {
        setIsSupplierModalOpen(false);
        setSupplierPaymentData({ supplierId: '', amount: '', accountId: '', reference: '', supplierName: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Payment record failed');
    }
  };

  // Execute Daily Drawer Closing
  const handleDailyClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.finance.executeDailyClosing({
        branchId: closingData.branchId,
        actualBalance: parseFloat(closingData.actualBalance),
        notes: closingData.notes || undefined
      }, getToken());
      if (res.success) {
        setIsClosingModalOpen(false);
        setClosingData({ branchId: 'd1111111-1111-1111-1111-111111111111', actualBalance: '', notes: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Daily closing failed');
    }
  };

  // Reverse Journal Entry
  const handleReverseJournal = async (id: string) => {
    if (!confirm('Are you sure you want to post a reverse entry to correct this voucher? This posted entry will remain, and an offsetting reversal voucher will be generated.')) return;
    try {
      const res = await api.finance.reverseJournal(id, getToken());
      if (res.success) {
        alert('Reversal journal voucher posted successfully!');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Reversal failed');
    }
  };

  // Print utility
  const handlePrint = () => {
    window.print();
  };

  // Permissions helpers
  const canWrite = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'OWNER' || adminUser?.permissions.includes('finance.write') || adminUser?.permissions.includes('*');
  const canApprove = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'OWNER' || adminUser?.permissions.includes('finance.approve') || adminUser?.permissions.includes('*');
  const canSettings = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'OWNER' || adminUser?.permissions.includes('finance.settings') || adminUser?.permissions.includes('*');

  // Filtered lists
  const filteredAccounts = accounts;
  const filteredInvoices = invoices.filter(inv => {
    const custName = `${inv.ticket?.customer?.firstName || ''} ${inv.ticket?.customer?.lastName || ''}`.toLowerCase();
    const invNum = inv.invoiceNumber.toLowerCase();
    const query = invoiceSearch.toLowerCase();
    return custName.includes(query) || invNum.includes(query);
  });

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
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5 print:hidden">
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                <Landmark className="h-6 w-6 text-primary" />
                Finance & Accounting Workspace
              </h1>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Enterprise double-entry general ledger, accounting periods control, and executive analytics.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-card border border-border px-3 py-2 rounded-xl text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              {canWrite && (
                <>
                  <button
                    onClick={() => setIsClosingModalOpen(true)}
                    className="px-3.5 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-border"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    Daily closing
                  </button>
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="px-3.5 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-border"
                  >
                    <ArrowRightLeft className="h-4 w-4 text-primary" />
                    Transfer
                  </button>
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-primary/10 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Log Expense
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Alerts Banner */}
          {alerts.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 space-y-2 print:hidden">
              <div className="flex items-center gap-2 text-red-500 font-extrabold text-xs">
                <AlertTriangle className="h-4 w-4" />
                CRITICAL NOTIFICATIONS & EXCEPTIONS ({alerts.length})
              </div>
              <ul className="list-disc list-inside text-xs font-medium text-red-400 space-y-1 pl-1">
                {alerts.map((al, idx) => (
                  <li key={idx}>{al}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/80 overflow-x-auto gap-2 print:hidden scrollbar-none">
            {[
              { id: 'dashboard', label: 'Executive Dashboard', icon: Landmark },
              { id: 'coa', label: 'Chart of Accounts', icon: FileSpreadsheet },
              { id: 'periods', label: 'Accounting Periods', icon: CalendarRange },
              { id: 'expenses', label: 'Expense Manager', icon: TrendingDown },
              { id: 'incomes', label: 'Other Income', icon: TrendingUp },
              { id: 'payments', label: 'Customer/Supplier Payments', icon: CreditCard },
              { id: 'reports', label: 'Financial Reports', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 border-b-2 font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all focus:outline-none cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs font-bold gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              Compiling ledger totals...
            </div>
          ) : (
            <>
              {/* 1. EXECUTIVE DASHBOARD */}
              {activeTab === 'dashboard' && dashboard && (
                <div className="space-y-6 animate-fade-in print:hidden">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block">Today's Revenue</span>
                        <span className="text-xl font-black text-emerald-500 mt-1 block">৳{dashboard.todayRevenue.toLocaleString()}</span>
                      </div>
                      <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block">Today's Expenses</span>
                        <span className="text-xl font-black text-red-500 mt-1 block">৳{dashboard.todayExpenses.toLocaleString()}</span>
                      </div>
                      <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                        <TrendingDown className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block">Accounts Receivable</span>
                        <span className="text-xl font-black text-blue-500 mt-1 block">৳{dashboard.accountsReceivable.toLocaleString()}</span>
                      </div>
                      <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                        <Calculator className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block">Accounts Payable</span>
                        <span className="text-xl font-black text-orange-500 mt-1 block">৳{dashboard.accountsPayable.toLocaleString()}</span>
                      </div>
                      <div className="h-10 w-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                        <Truck className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Cash breakdown & Net profit */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                      <h2 className="text-xs uppercase font-black text-foreground tracking-widest border-b border-border/60 pb-3">
                        Drawer Cash Balances
                      </h2>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-muted-foreground">Cash in Hand</span>
                          <span className="text-foreground">৳{dashboard.cashBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-muted-foreground">Bank Balances</span>
                          <span className="text-foreground">৳{dashboard.bankBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-muted-foreground">Mobile Wallets</span>
                          <span className="text-foreground">৳{dashboard.mobileBankingBalance.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between items-center">
                          <span className="text-xs font-bold text-foreground">Total Cash Liquid</span>
                          <span className="text-sm font-black text-primary">
                            ৳{(dashboard.cashBalance + dashboard.bankBalance + dashboard.mobileBankingBalance).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                      <h2 className="text-xs uppercase font-black text-foreground tracking-widest border-b border-border/60 pb-3">
                        P&L Performance (Monthly)
                      </h2>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-muted-foreground">Monthly Revenue</span>
                          <span className="text-foreground">৳{dashboard.monthlyRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-muted-foreground">Monthly Expenses</span>
                          <span className="text-foreground text-red-500">৳{dashboard.monthlyExpenses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-muted-foreground">Gross Profit</span>
                          <span className="text-emerald-500 font-bold">৳{dashboard.grossProfit.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between items-center">
                          <span className="text-xs font-bold text-foreground">Net Operating Profit</span>
                          <span className={`text-sm font-black ${dashboard.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            ৳{dashboard.netProfit.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Custom HTML bar chart comparison of branches */}
                    <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                      <h2 className="text-xs uppercase font-black text-foreground tracking-widest border-b border-border/60 pb-3">
                        Branch Revenue Performance
                      </h2>
                      <div className="space-y-4 pt-1">
                        {dashboard.branchComparison.map((bc: any, idx: number) => {
                          const maxVal = Math.max(...dashboard.branchComparison.map((x: any) => x.revenue), 1);
                          const widthPct = Math.max((bc.revenue / maxVal) * 100, 5);
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="truncate max-w-[180px]">{bc.branchName}</span>
                                <span className="text-emerald-500">৳{bc.revenue.toLocaleString()}</span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden flex gap-0.5">
                                <div style={{ width: `${widthPct}%` }} className="bg-primary h-full rounded-full transition-all" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions List */}
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-border/60 flex items-center justify-between">
                      <h2 className="text-xs uppercase font-black text-foreground tracking-widest">
                        Recent Journal Transactions (Vouchers)
                      </h2>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border">
                            <th className="p-4">Voucher No</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Module</th>
                            <th className="p-4">Debit / Credit Lines</th>
                            <th className="p-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 font-medium">
                          {dashboard.recentTransactions.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-secondary/15">
                              <td className="p-4 font-bold text-foreground">{tx.voucherNumber}</td>
                              <td className="p-4 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                              <td className="p-4">{tx.description}</td>
                              <td className="p-4">
                                <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                  {tx.referenceModule}
                                </span>
                              </td>
                              <td className="p-4 space-y-1">
                                {tx.lines.map((l: any, lidx: number) => (
                                  <div key={lidx} className="flex gap-2 items-center text-[10px]">
                                    <span className="text-muted-foreground font-mono">{l.account.accountNumber}</span>
                                    <span className="truncate max-w-[120px]">{l.account.name}</span>
                                    {Number(l.debit) > 0 && <span className="text-emerald-500 font-bold">Dr ৳{Number(l.debit).toFixed(2)}</span>}
                                    {Number(l.credit) > 0 && <span className="text-amber-500 font-bold">Cr ৳{Number(l.credit).toFixed(2)}</span>}
                                  </div>
                                ))}
                              </td>
                              <td className="p-4">
                                {!tx.isReversal && (
                                  <button
                                    onClick={() => handleReverseJournal(tx.id)}
                                    className="text-red-500 hover:text-red-400 font-bold transition-all text-[11px]"
                                  >
                                    Reverse Voucher
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CHART OF ACCOUNTS (COA) */}
              {activeTab === 'coa' && (
                <div className="space-y-4 animate-fade-in print:hidden">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs uppercase font-black tracking-widest text-muted-foreground">General Ledger Chart of Accounts</h2>
                    {canSettings && (
                      <button
                        onClick={() => setIsAccountModalOpen(true)}
                        className="px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        Create Account
                      </button>
                    )}
                  </div>

                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border">
                            <th className="p-4">Account Number</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Class</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Normal Balance</th>
                            <th className="p-4">Current Balance</th>
                            <th className="p-4">Parent Account</th>
                            <th className="p-4">Branch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 font-medium">
                          {filteredAccounts.map((acc) => (
                            <tr key={acc.id} className="hover:bg-secondary/15">
                              <td className="p-4 font-mono font-bold text-foreground">{acc.accountNumber}</td>
                              <td className="p-4 font-bold text-foreground">{acc.name}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  acc.accountClass === 'ASSET' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                  acc.accountClass === 'LIABILITY' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                  acc.accountClass === 'INCOME' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                  acc.accountClass === 'EXPENSE' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                  'bg-zinc-500/10 text-zinc-400'
                                }`}>
                                  {acc.accountClass}
                                </span>
                              </td>
                              <td className="p-4 text-muted-foreground">{acc.accountType}</td>
                              <td className="p-4 text-muted-foreground font-mono">{acc.normalBalance}</td>
                              <td className="p-4 font-bold text-foreground">৳{Number(acc.currentBalance).toLocaleString()}</td>
                              <td className="p-4 text-muted-foreground font-semibold">
                                {acc.parentAccount ? `[${acc.parentAccount.accountNumber}] ${acc.parentAccount.name}` : '—'}
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {acc.branchId ? branches.find(b => b.id === acc.branchId)?.name || 'Branch-specific' : 'Global (All Branches)'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ACCOUNTING PERIODS */}
              {activeTab === 'periods' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in print:hidden">
                  <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xs uppercase font-black tracking-widest text-muted-foreground">Accounting Periods Calendar</h2>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border">
                              <th className="p-4">Period Name</th>
                              <th className="p-4">Start Date</th>
                              <th className="p-4">End Date</th>
                              <th className="p-4">Fiscal Year</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 font-medium">
                            {periods.map((per) => (
                              <tr key={per.id} className="hover:bg-secondary/15">
                                <td className="p-4 font-bold text-foreground">{per.name}</td>
                                <td className="p-4 text-muted-foreground">{new Date(per.startDate).toLocaleDateString()}</td>
                                <td className="p-4 text-muted-foreground">{new Date(per.endDate).toLocaleDateString()}</td>
                                <td className="p-4 font-semibold">{per.fiscalYear?.name}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    per.isLocked 
                                      ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  }`}>
                                    {per.isLocked ? 'Locked' : 'Open'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  {canSettings && (
                                    <button
                                      onClick={() => handlePeriodLock(per.id, !per.isLocked)}
                                      className={`font-bold transition-all text-[11px] ${
                                        per.isLocked ? 'text-emerald-500 hover:text-emerald-400' : 'text-red-500 hover:text-red-400'
                                      }`}
                                    >
                                      {per.isLocked ? 'Open Period' : 'Lock Period'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Fiscal year lists */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs uppercase font-black tracking-widest text-muted-foreground">Fiscal Years</h2>
                      {canSettings && (
                        <button
                          onClick={() => setIsFyModalOpen(true)}
                          className="text-primary hover:text-primary/80 font-bold text-xs cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-4.5 w-4.5" />
                          New FY
                        </button>
                      )}
                    </div>

                    <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
                      {fiscalYears.map((fy) => (
                        <div key={fy.id} className="border border-border/80 p-3.5 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-xs text-foreground">{fy.name}</span>
                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                              {fy.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold flex justify-between">
                            <span>Start: {new Date(fy.startDate).toLocaleDateString()}</span>
                            <span>End: {new Date(fy.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. EXPENSE MANAGER */}
              {activeTab === 'expenses' && (
                <div className="space-y-4 animate-fade-in print:hidden">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs uppercase font-black tracking-widest text-muted-foreground">Expense Log and Approvals</h2>
                  </div>

                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border">
                            <th className="p-4">Category</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Branch</th>
                            <th className="p-4">Notes</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Logged By</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 font-medium">
                          {expenses.map((exp) => (
                            <tr key={exp.id} className="hover:bg-secondary/15">
                              <td className="p-4 font-bold text-foreground">{exp.category}</td>
                              <td className="p-4 text-red-500 font-extrabold">৳{Number(exp.amount).toLocaleString()}</td>
                              <td className="p-4 text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</td>
                              <td className="p-4">{exp.branch?.name}</td>
                              <td className="p-4 max-w-[200px] truncate">{exp.notes || '—'}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  exp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                  exp.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                  'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                  {exp.status}
                                </span>
                              </td>
                              <td className="p-4 text-muted-foreground">{exp.createdBy?.firstName} {exp.createdBy?.lastName}</td>
                              <td className="p-4 text-right">
                                {exp.status === 'PENDING' && canApprove && (
                                  <button
                                    onClick={() => {
                                      setExpenseToApprove(exp);
                                      setApproveAccountId(accounts.find(a => a.accountType === 'CASH')?.id || '');
                                    }}
                                    className="px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                  >
                                    Review
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. OTHER INCOME */}
              {activeTab === 'incomes' && (
                <div className="space-y-4 animate-fade-in print:hidden">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs uppercase font-black tracking-widest text-muted-foreground">Other Revenue & Service Charges</h2>
                    {canWrite && (
                      <button
                        onClick={() => setIsIncomeModalOpen(true)}
                        className="px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        Log Other Income
                      </button>
                    )}
                  </div>

                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border">
                            <th className="p-4">Category</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Branch</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Paid Into</th>
                            <th className="p-4">Logged By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 font-medium">
                          {incomes.map((inc) => (
                            <tr key={inc.id} className="hover:bg-secondary/15">
                              <td className="p-4 font-bold text-foreground">{inc.category}</td>
                              <td className="p-4 text-emerald-500 font-extrabold">৳{Number(inc.amount).toLocaleString()}</td>
                              <td className="p-4 text-muted-foreground">{new Date(inc.date).toLocaleDateString()}</td>
                              <td className="p-4">{inc.branch?.name}</td>
                              <td className="p-4 max-w-[200px] truncate">{inc.description || '—'}</td>
                              <td className="p-4 text-muted-foreground font-semibold">{inc.account?.name}</td>
                              <td className="p-4 text-muted-foreground">{inc.createdBy?.firstName} {inc.createdBy?.lastName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. CUSTOMER & SUPPLIER PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in print:hidden">
                  {/* Customer Payments panel */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xs uppercase font-black tracking-widest text-muted-foreground">Collect Customer Invoice Dues</h2>
                    </div>

                    <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search unpaid invoices by customer or number..."
                          value={invoiceSearch}
                          onChange={(e) => setInvoiceSearch(e.target.value)}
                          className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                        {filteredInvoices.map((inv) => (
                          <div key={inv.id} className="border border-border/80 p-3.5 rounded-xl space-y-3 hover:border-primary/50 transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-extrabold text-xs text-foreground block">{inv.invoiceNumber}</span>
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                  Customer: {inv.ticket?.customer?.firstName} {inv.ticket?.customer?.lastName}
                                </span>
                              </div>
                              <span className="font-black text-xs text-foreground">৳{Number(inv.total).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-border/40">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {inv.status}
                              </span>
                              {inv.status !== 'paid' && canWrite && (
                                <button
                                  onClick={() => {
                                    setPaymentData({
                                      invoiceId: inv.id,
                                      amount: String(inv.total),
                                      paymentMethod: 'Cash',
                                      transactionReference: '',
                                      accountId: accounts.find(a => a.accountType === 'CASH')?.id || '',
                                      customerId: inv.ticket?.customerId,
                                      customerName: `${inv.ticket?.customer?.firstName} ${inv.ticket?.customer?.lastName}`
                                    });
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                >
                                  Collect Payment
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Supplier Payments panel */}
                  <div className="space-y-4">
                    <h2 className="text-xs uppercase font-black tracking-widest text-muted-foreground">Supplier Outstanding Ledger</h2>
                    <div className="bg-card border border-border p-4 rounded-2xl space-y-3.5">
                      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                        {suppliers.map((s) => (
                          <div key={s.id} className="border border-border/80 p-3.5 rounded-xl space-y-3 hover:border-primary/50 transition-all">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-extrabold text-xs text-foreground block">{s.name}</span>
                                <span className="text-[10px] text-muted-foreground font-semibold">Contact: {s.contactPerson} | {s.phone}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-muted-foreground font-bold block">Balance Due</span>
                                <span className="font-extrabold text-xs text-red-500">৳{Number(s.outstandingBalance || 0).toLocaleString()}</span>
                              </div>
                            </div>

                            {Number(s.outstandingBalance || 0) > 0 && canWrite && (
                              <div className="flex justify-end pt-1.5 border-t border-border/40">
                                <button
                                  onClick={() => {
                                    setSupplierPaymentData({
                                      supplierId: s.id,
                                      amount: String(s.outstandingBalance),
                                      accountId: accounts.find(a => a.accountType === 'CASH')?.id || '',
                                      reference: '',
                                      supplierName: s.name
                                    });
                                    setIsSupplierModalOpen(true);
                                  }}
                                  className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                >
                                  Pay Supplier
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. FINANCIAL REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-6 animate-fade-in print:bg-white print:text-black">
                  {/* Reports Config Form */}
                  <div className="bg-card border border-border p-5 rounded-2xl space-y-4 print:hidden">
                    <h2 className="text-xs uppercase font-black tracking-widest text-muted-foreground">Financial Reports Console</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Select Report Type</label>
                        <select
                          value={selectedReport}
                          onChange={(e) => setSelectedReport(e.target.value as any)}
                          className="w-full bg-secondary/50 border border-border px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
                        >
                          <option value="pl">Profit & Loss Statement</option>
                          <option value="cash">Cash Book</option>
                          <option value="bank">Bank Book</option>
                          <option value="customer">Customer Dues Aging</option>
                          <option value="supplier">Supplier Dues Aging</option>
                          <option value="ledger">General Ledger Account</option>
                          <option value="journal">Journal Book (Vouchers)</option>
                          <option value="tax">Tax Summary</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Start Date</label>
                        <input
                          type="date"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                          className="w-full bg-secondary/50 border border-border px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">End Date</label>
                        <input
                          type="date"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                          className="w-full bg-secondary/50 border border-border px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Filter Account (For GL)</label>
                        <select
                          value={reportAccountId}
                          onChange={(e) => setReportAccountId(e.target.value)}
                          disabled={selectedReport !== 'ledger'}
                          className="w-full bg-secondary/50 border border-border px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none disabled:opacity-50"
                        >
                          <option value="">All Accounts</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>[{a.accountNumber}] {a.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleGenerateReport}
                        className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-primary/10"
                      >
                        <Calculator className="h-4 w-4" />
                        Compile Report
                      </button>
                    </div>
                  </div>

                  {/* Report Display Container */}
                  {reportResult && (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0 print:text-black">
                      {/* Report Print Header */}
                      <div className="flex justify-between items-start border-b border-border/80 pb-6 print:border-black print:text-black">
                        <div>
                          <div className="text-sm font-black tracking-widest text-primary print:text-black">TRUSTZONE MOBILE CARE</div>
                          <h1 className="text-lg font-black text-foreground uppercase mt-1 print:text-black">
                            {selectedReport === 'pl' && 'Profit & Loss Statement'}
                            {selectedReport === 'cash' && 'Cash Book Register'}
                            {selectedReport === 'bank' && 'Bank Book Register'}
                            {selectedReport === 'customer' && 'Customer Outstanding Dues'}
                            {selectedReport === 'supplier' && 'Supplier Outstanding Dues'}
                            {selectedReport === 'ledger' && 'General Ledger Account Activity'}
                            {selectedReport === 'journal' && 'Journal Book Vouchers Register'}
                            {selectedReport === 'tax' && 'Tax Summary Report'}
                          </h1>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-1 print:text-black">
                            Period: {reportStartDate} to {reportEndDate}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5 print:hidden">
                          <button
                            onClick={handlePrint}
                            className="px-3.5 py-1.5 bg-secondary text-foreground border border-border hover:bg-secondary/80 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print Report
                          </button>
                        </div>
                      </div>

                      {/* 7.1 Profit & Loss View */}
                      {selectedReport === 'pl' && (
                        <div className="space-y-6 font-medium text-xs text-foreground print:text-black">
                          {/* Revenue */}
                          <div className="space-y-2">
                            <h3 className="font-extrabold uppercase text-[10px] tracking-wider text-muted-foreground border-b border-border/40 pb-1.5 print:text-black">Revenues</h3>
                            {reportResult.revenues.map((r: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center py-1">
                                <span>[{r.accountNumber}] {r.name}</span>
                                <span className="font-bold">৳{Number(r.amount).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center py-1.5 border-t border-border/40 font-bold bg-secondary/10 px-2 rounded">
                              <span>Total Revenue</span>
                              <span>৳{Number(reportResult.totalRevenue).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* COGS */}
                          <div className="space-y-2">
                            <h3 className="font-extrabold uppercase text-[10px] tracking-wider text-muted-foreground border-b border-border/40 pb-1.5 print:text-black">Cost of Goods Sold</h3>
                            <div className="flex justify-between items-center py-1">
                              <span>Cost of Goods Sold (COGS)</span>
                              <span className="font-bold text-red-500">৳{Number(reportResult.cogs).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-t border-border/40 font-bold bg-secondary/10 px-2 rounded">
                              <span>Gross Profit</span>
                              <span className="text-emerald-500">৳{Number(reportResult.grossProfit).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Expenses */}
                          <div className="space-y-2">
                            <h3 className="font-extrabold uppercase text-[10px] tracking-wider text-muted-foreground border-b border-border/40 pb-1.5 print:text-black">Operating Expenses</h3>
                            {reportResult.operatingExpenses.map((exp: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center py-1">
                                <span>[{exp.accountNumber}] {exp.name}</span>
                                <span className="font-bold text-red-500">৳{Number(exp.amount).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center py-1.5 border-t border-border/40 font-bold bg-secondary/10 px-2 rounded">
                              <span>Total Operating Expenses</span>
                              <span>৳{Number(reportResult.totalOperatingExpenses).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Net Profit */}
                          <div className="border-t-2 border-primary pt-4 flex justify-between items-center text-sm font-black">
                            <span className="uppercase tracking-wide">Net Operating Profit</span>
                            <span className={Number(reportResult.netProfit) >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                              ৳{Number(reportResult.netProfit).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 7.2 Cash & Bank Books View */}
                      {(selectedReport === 'cash' || selectedReport === 'bank') && (
                        <div className="overflow-x-auto text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border print:bg-transparent print:border-black print:text-black">
                                <th className="p-3">Date</th>
                                <th className="p-3">Voucher</th>
                                <th className="p-3">Account</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Debit (Received)</th>
                                <th className="p-3">Credit (Paid)</th>
                                <th className="p-3">Logged By</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 font-semibold print:divide-black">
                              {reportResult.transactions.map((t: any, idx: number) => (
                                <tr key={idx} className="hover:bg-secondary/10 print:hover:bg-transparent">
                                  <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                                  <td className="p-3 font-mono">{t.voucherNumber}</td>
                                  <td className="p-3 font-bold">{t.accountName}</td>
                                  <td className="p-3">{t.description}</td>
                                  <td className="p-3 text-emerald-500">{t.debit > 0 ? `৳${t.debit.toFixed(2)}` : '—'}</td>
                                  <td className="p-3 text-red-500">{t.credit > 0 ? `৳${t.credit.toFixed(2)}` : '—'}</td>
                                  <td className="p-3 text-muted-foreground print:text-black">{t.createdBy}</td>
                                </tr>
                              ))}
                              <tr className="bg-secondary/15 font-bold border-t border-border print:bg-transparent print:border-black">
                                <td colSpan={4} className="p-3 text-right">Totals</td>
                                <td className="p-3 text-emerald-500">৳{reportResult.totalDebit.toFixed(2)}</td>
                                <td className="p-3 text-red-500">৳{reportResult.totalCredit.toFixed(2)}</td>
                                <td className="p-3"></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 7.3 Customer & Supplier Dues Aging View */}
                      {(selectedReport === 'customer' || selectedReport === 'supplier') && (
                        <div className="overflow-x-auto text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border print:border-black print:text-black">
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3 text-right">Outstanding Dues</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 font-semibold print:divide-black">
                              {reportResult.map((due: any) => (
                                <tr key={due.id} className="hover:bg-secondary/10 print:hover:bg-transparent">
                                  <td className="p-3 font-bold">{due.name}</td>
                                  <td className="p-3 text-muted-foreground print:text-black">{due.email}</td>
                                  <td className="p-3">{due.phone}</td>
                                  <td className="p-3 text-right text-red-500 font-extrabold">৳{due.dueBalance.toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr className="bg-secondary/15 font-bold border-t border-border print:bg-transparent print:border-black">
                                <td colSpan={3} className="p-3 text-right">Total Outstanding Balance</td>
                                <td className="p-3 text-right text-red-500 font-black">
                                  ৳{reportResult.reduce((acc: number, curr: any) => acc + Number(curr.dueBalance), 0).toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 7.4 General Ledger View */}
                      {selectedReport === 'ledger' && (
                        <div className="space-y-6 text-xs">
                          {reportResult.map((acc: any, idx: number) => (
                            <div key={idx} className="border border-border/80 rounded-xl overflow-hidden">
                              <div className="bg-secondary/40 p-3 font-bold flex justify-between border-b border-border print:border-black">
                                <span>[{acc.accountNumber}] {acc.accountName} (Class: {acc.normalBalance} balance)</span>
                                <span>Net Activity: ৳{Math.abs(acc.totalDebit - acc.totalCredit).toFixed(2)}</span>
                              </div>
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-secondary/20 text-muted-foreground font-semibold border-b border-border/60">
                                    <th className="p-2.5">Date</th>
                                    <th className="p-2.5">Voucher</th>
                                    <th className="p-2.5">Description</th>
                                    <th className="p-2.5">Debit</th>
                                    <th className="p-2.5">Credit</th>
                                  </tr>
                                </thead>
                                <tbody className="font-semibold">
                                  {acc.lines.map((l: any, lidx: number) => (
                                    <tr key={lidx} className="border-b border-border/40 hover:bg-secondary/10">
                                      <td className="p-2.5">{new Date(l.date).toLocaleDateString()}</td>
                                      <td className="p-2.5 font-mono">{l.voucherNumber}</td>
                                      <td className="p-2.5">{l.description}</td>
                                      <td className="p-2.5 text-emerald-500">{l.debit > 0 ? `৳${l.debit.toFixed(2)}` : '—'}</td>
                                      <td className="p-2.5 text-red-500">{l.credit > 0 ? `৳${l.credit.toFixed(2)}` : '—'}</td>
                                    </tr>
                                  ))}
                                  <tr className="font-bold bg-secondary/5">
                                    <td colSpan={3} className="p-2.5 text-right">Account Totals</td>
                                    <td className="p-2.5 text-emerald-500">৳{acc.totalDebit.toFixed(2)}</td>
                                    <td className="p-2.5 text-red-500">৳{acc.totalCredit.toFixed(2)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 7.5 Tax Summary View */}
                      {selectedReport === 'tax' && (
                        <div className="space-y-4 font-medium text-xs max-w-md">
                          <div className="flex justify-between items-center py-2 border-b border-border/60">
                            <span className="text-muted-foreground">Total Invoiced Sales</span>
                            <span className="font-bold">৳{Number(reportResult.totalSales).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/60">
                            <span className="text-muted-foreground">VAT Rate / Schema</span>
                            <span className="font-semibold">{reportResult.taxRate}</span>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-border font-bold text-sm">
                            <span className="text-foreground">Total Tax Collected (Output VAT)</span>
                            <span className="text-primary">৳{Number(reportResult.taxCollected).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ==========================================
          MODALS & DRAWER DIALOGS
      ========================================== */}

      {/* 1. Account Creation Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Create Chart Account</h3>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Account Number</label>
                  <input
                    type="text"
                    required
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                    placeholder="e.g. 1010"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Account Name</label>
                  <input
                    type="text"
                    required
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                    placeholder="e.g. Petty Cash"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Class</label>
                  <select
                    value={newAccount.accountClass}
                    onChange={(e) => setNewAccount({ ...newAccount, accountClass: e.target.value as any })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="ASSET">ASSET</option>
                    <option value="LIABILITY">LIABILITY</option>
                    <option value="EQUITY">EQUITY</option>
                    <option value="INCOME">INCOME</option>
                    <option value="EXPENSE">EXPENSE</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Normal Balance</label>
                  <select
                    value={newAccount.normalBalance}
                    onChange={(e) => setNewAccount({ ...newAccount, normalBalance: e.target.value as any })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="DEBIT">DEBIT</option>
                    <option value="CREDIT">CREDIT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Type</label>
                  <select
                    value={newAccount.accountType}
                    onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="CASH">CASH</option>
                    <option value="BANK">BANK</option>
                    <option value="MOBILE_BANKING">MOBILE_BANKING</option>
                    <option value="RECEIVABLE">RECEIVABLE</option>
                    <option value="PAYABLE">PAYABLE</option>
                    <option value="INVENTORY">INVENTORY</option>
                    <option value="COGS">COGS</option>
                    <option value="REVENUE">REVENUE</option>
                    <option value="EXPENSE">EXPENSE</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Parent Account (Hierarchy)</label>
                  <select
                    value={newAccount.parentAccountId}
                    onChange={(e) => setNewAccount({ ...newAccount, parentAccountId: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="">None (Root Account)</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>[{a.accountNumber}] {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Branch Allocation</label>
                  <select
                    value={newAccount.branchId}
                    onChange={(e) => setNewAccount({ ...newAccount, branchId: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="">Global Account</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Opening Balance</label>
                  <input
                    type="number"
                    value={newAccount.openingBalance}
                    onChange={(e) => setNewAccount({ ...newAccount, openingBalance: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAccountModalOpen(false)} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold cursor-pointer">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Fiscal Year Modal */}
      {isFyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Create Fiscal Year</h3>
              <button onClick={() => setIsFyModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleCreateFy} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Name</label>
                <input
                  type="text"
                  required
                  value={newFy.name}
                  onChange={(e) => setNewFy({ ...newFy, name: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  placeholder="e.g. FY2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newFy.startDate}
                    onChange={(e) => setNewFy({ ...newFy, startDate: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    required
                    value={newFy.endDate}
                    onChange={(e) => setNewFy({ ...newFy, endDate: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsFyModalOpen(false)} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold cursor-pointer">Generate Period</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Drawer for Customer Payments */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-card border-l border-border w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in text-xs">
            <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Collect Customer Invoice Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            </div>
            <form onSubmit={handleCustomerPayment} className="p-5 flex-grow space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Customer Name</label>
                <input type="text" disabled value={paymentData.customerName} className="w-full bg-secondary/50 border border-border px-3 py-2 rounded-xl font-bold focus:outline-none disabled:opacity-80" />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Collection Amount</label>
                <input
                  type="number"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Deposit Account</label>
                <select
                  value={paymentData.accountId}
                  onChange={(e) => setPaymentData({ ...paymentData, accountId: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                >
                  <option value="">Select cash/bank account</option>
                  {accounts
                    .filter(a => a.accountType === 'CASH' || a.accountType === 'BANK' || a.accountType === 'MOBILE_BANKING')
                    .map(a => (
                      <option key={a.id} value={a.id}>[{a.accountNumber}] {a.name} (Balance: ৳{Number(a.currentBalance).toFixed(2)})</option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Transaction Reference (TxID / Cheque No)</label>
                <input
                  type="text"
                  value={paymentData.transactionReference}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  placeholder="e.g. TXN9910283"
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl font-bold cursor-pointer text-center">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold cursor-pointer text-center">Collect Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Drawer for Supplier Payments */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-card border-l border-border w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in text-xs">
            <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Record Supplier Payment</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            </div>
            <form onSubmit={handleSupplierPayment} className="p-5 flex-grow space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Supplier Name</label>
                <input type="text" disabled value={supplierPaymentData.supplierName} className="w-full bg-secondary/50 border border-border px-3 py-2 rounded-xl font-bold focus:outline-none disabled:opacity-80" />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Payment Amount</label>
                <input
                  type="number"
                  required
                  value={supplierPaymentData.amount}
                  onChange={(e) => setSupplierPaymentData({ ...supplierPaymentData, amount: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Paid From Account</label>
                <select
                  value={supplierPaymentData.accountId}
                  onChange={(e) => setSupplierPaymentData({ ...supplierPaymentData, accountId: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                >
                  <option value="">Select cash/bank account</option>
                  {accounts
                    .filter(a => a.accountType === 'CASH' || a.accountType === 'BANK' || a.accountType === 'MOBILE_BANKING')
                    .map(a => (
                      <option key={a.id} value={a.id}>[{a.accountNumber}] {a.name} (Balance: ৳{Number(a.currentBalance).toFixed(2)})</option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Memo / Note</label>
                <input
                  type="text"
                  value={supplierPaymentData.reference}
                  onChange={(e) => setSupplierPaymentData({ ...supplierPaymentData, reference: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  placeholder="e.g. Bkash transfer settlement"
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="flex-1 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl font-bold cursor-pointer text-center">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold cursor-pointer text-center">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Expense Creation Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Log Expense Record</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleCreateExpense} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Salary">Salary</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Internet">Internet</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Transport">Transport</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Amount (৳)</label>
                  <input
                    type="number"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-bold focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Branch Allocation</label>
                <select
                  value={newExpense.branchId}
                  onChange={(e) => setNewExpense({ ...newExpense, branchId: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Receipt Scan URL (Optional)</label>
                <input
                  type="text"
                  value={newExpense.receiptUrl}
                  onChange={(e) => setNewExpense({ ...newExpense, receiptUrl: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Notes / Purpose</label>
                <textarea
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none min-h-[60px]"
                  placeholder="Details of expense..."
                />
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold cursor-pointer">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Other Income Modal */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Record Miscellaneous Revenue</h3>
              <button onClick={() => setIsIncomeModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleCreateIncome} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Category</label>
                  <select
                    value={newIncome.category}
                    onChange={(e) => setNewIncome({ ...newIncome, category: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="Repair Income">Repair Income</option>
                    <option value="Product Sales">Product Sales</option>
                    <option value="Service Charges">Service Charges</option>
                    <option value="Delivery Charges">Delivery Charges</option>
                    <option value="Other Income">Other Income</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Amount (৳)</label>
                  <input
                    type="number"
                    required
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-bold focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Branch Allocation</label>
                  <select
                    value={newIncome.branchId}
                    onChange={(e) => setNewIncome({ ...newIncome, branchId: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Paid Into Account</label>
                  <select
                    required
                    value={newIncome.accountId}
                    onChange={(e) => setNewIncome({ ...newIncome, accountId: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="">Select cash/bank account</option>
                    {accounts
                      .filter(a => a.accountType === 'CASH' || a.accountType === 'BANK' || a.accountType === 'MOBILE_BANKING')
                      .map(a => (
                        <option key={a.id} value={a.id}>[{a.accountNumber}] {a.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Notes / Description</label>
                <textarea
                  value={newIncome.description}
                  onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none min-h-[60px]"
                  placeholder="Details of income source..."
                />
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsIncomeModalOpen(false)} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold cursor-pointer">Save Revenue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Fund Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Transfer Funds</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleTransfer} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Source Account</label>
                  <select
                    required
                    value={transferData.fromAccountId}
                    onChange={(e) => setTransferData({ ...transferData, fromAccountId: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="">Select source</option>
                    {accounts
                      .filter(a => a.accountType === 'CASH' || a.accountType === 'BANK' || a.accountType === 'MOBILE_BANKING')
                      .map(a => (
                        <option key={a.id} value={a.id}>[{a.accountNumber}] {a.name} (৳{Number(a.currentBalance).toFixed(2)})</option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Destination Account</label>
                  <select
                    required
                    value={transferData.toAccountId}
                    onChange={(e) => setTransferData({ ...transferData, toAccountId: e.target.value })}
                    className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="">Select destination</option>
                    {accounts
                      .filter(a => a.accountType === 'CASH' || a.accountType === 'BANK' || a.accountType === 'MOBILE_BANKING')
                      .map(a => (
                        <option key={a.id} value={a.id}>[{a.accountNumber}] {a.name} (৳{Number(a.currentBalance).toFixed(2)})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Amount (৳)</label>
                <input
                  type="number"
                  required
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-bold focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Reference / Purpose</label>
                <input
                  type="text"
                  value={transferData.reference}
                  onChange={(e) => setTransferData({ ...transferData, reference: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                  placeholder="e.g. Cash transit to bank"
                />
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsTransferModalOpen(false)} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold cursor-pointer">Execute Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Daily closing Modal */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Daily Closing Drawer</h3>
              <button onClick={() => setIsClosingModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleDailyClosing} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Branch</label>
                <select
                  value={closingData.branchId}
                  onChange={(e) => setClosingData({ ...closingData, branchId: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Actual Cash Counted (৳)</label>
                <input
                  type="number"
                  required
                  value={closingData.actualBalance}
                  onChange={(e) => setClosingData({ ...closingData, actualBalance: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-bold focus:outline-none"
                  placeholder="Count cash in drawer..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Closing Notes / Discrepancy details</label>
                <textarea
                  value={closingData.notes}
                  onChange={(e) => setClosingData({ ...closingData, notes: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none min-h-[60px]"
                  placeholder="Notes..."
                />
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsClosingModalOpen(false)} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold cursor-pointer">Close Drawer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Expense Approval Dialog */}
      {expenseToApprove && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center">
              <h3 className="font-black text-xs uppercase tracking-widest text-foreground">Review Expense Voucher</h3>
              <button onClick={() => setExpenseToApprove(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-secondary/50 border border-border p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Category: {expenseToApprove.category}</span>
                  <span className="text-red-500 font-extrabold">৳{Number(expenseToApprove.amount).toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold">
                  Branch: {expenseToApprove.branch?.name}
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold">
                  Purpose: {expenseToApprove.notes || '—'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Select Payment Source Account</label>
                <select
                  value={approveAccountId}
                  onChange={(e) => setApproveAccountId(e.target.value)}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-xl font-semibold focus:outline-none"
                >
                  <option value="">Select cash/bank account</option>
                  {accounts
                    .filter(a => a.accountType === 'CASH' || a.accountType === 'BANK' || a.accountType === 'MOBILE_BANKING')
                    .map(a => (
                      <option key={a.id} value={a.id}>[{a.accountNumber}] {a.name} (Balance: ৳{Number(a.currentBalance).toFixed(2)})</option>
                    ))}
                </select>
              </div>

              <div className="border-t border-border/40 pt-4 flex gap-2">
                <button
                  onClick={() => handleApproveExpense(false)}
                  className="flex-1 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/15 border border-red-500/20 rounded-xl font-bold cursor-pointer text-center"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApproveExpense(true)}
                  className="flex-1 py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-bold cursor-pointer text-center"
                >
                  Approve & Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
