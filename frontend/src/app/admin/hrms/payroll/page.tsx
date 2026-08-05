'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Sliders,
  UserCheck,
  Percent,
  Banknote,
  Send,
  Building,
  HelpCircle
} from 'lucide-react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { api } from '@/lib/api';

export default function PayrollManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Structure Modal & Form
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [structForm, setStructForm] = useState({
    userId: '',
    basicSalary: 30000,
    housingAllowance: 5000,
    transportAllowance: 2000,
    otherAllowances: 1000,
    providentFundContribution: 1500,
    taxDeduction: 1000,
    otherDeductions: 500
  });

  // Payslip Generator Form
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateMonth, setGenerateMonth] = useState('2026-07');

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.hrms.fetchPayslips(undefined, token);
      if (res.success) setPayslips(res.data);

      const contactsRes = await api.chat.fetchContacts(token);
      if (contactsRes.success) setContacts(contactsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSaveStructure = async () => {
    try {
      await api.hrms.savePayrollStructure(structForm.userId, structForm, token);
      setShowStructureModal(false);
      alert('Payroll salary structure saved successfully.');
    } catch (err) {
      alert('Error saving payroll structure.');
    }
  };

  const handleGeneratePayslips = async () => {
    try {
      await api.hrms.generatePayslips(generateMonth, token);
      setShowGenerateModal(false);
      loadData();
      alert(`Generated all employee payslips for ${generateMonth}.`);
    } catch (err) {
      alert('Error generating payslips.');
    }
  };

  const handlePayPayslip = async (id: string, status: 'APPROVED' | 'PAID') => {
    try {
      await api.hrms.payPayslip(id, status, token);
      loadData();
      if (status === 'PAID') {
        alert('Payslip marked as PAID. Posted Double-entry salary journal line.');
      }
    } catch (err) {
      alert('Error updating payslip status.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'APPROVED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => {}}
          onOpenNotifications={() => {}}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <DollarSign className="text-primary h-6 w-6" />
                Payroll & Payslip Center
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define employee salary structures, allowances, PF contributions, withholding taxes, and process monthly bank payments.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowStructureModal(true)}
                className="border border-border bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Sliders className="h-4 w-4 text-primary" /> Salary Structure Builder
              </button>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Banknote className="h-4 w-4" /> Run Monthly Payroll
              </button>
            </div>
          </div>

          {/* Payslip History table */}
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generated Payslips Logs</h2>
          <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-secondary/40 border-b border-border/60 font-bold">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Month</th>
                  <th className="p-3">Basic Salary</th>
                  <th className="p-3">Allowances</th>
                  <th className="p-3">Deductions</th>
                  <th className="p-3">Net Take-Home</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card">
                {payslips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">No payslips generated for this period.</td>
                  </tr>
                ) : (
                  payslips.map((ps) => (
                    <tr key={ps.id} className="hover:bg-secondary/15 transition-all">
                      <td className="p-3 font-bold">{ps.user?.firstName} {ps.user?.lastName}</td>
                      <td className="p-3 font-semibold text-muted-foreground">{ps.month}</td>
                      <td className="p-3 font-mono">৳{Number(ps.basicSalary).toLocaleString()}</td>
                      <td className="p-3 font-mono text-green-500">+৳{Number(ps.allowances).toLocaleString()}</td>
                      <td className="p-3 font-mono text-red-500">-৳{Number(ps.deductions).toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-foreground">৳{Number(ps.netPay).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(ps.status)}`}>
                          {ps.status}
                        </span>
                      </td>
                      <td className="p-3 space-x-2">
                        {ps.status === 'PENDING' && (
                          <button
                            onClick={() => handlePayPayslip(ps.id, 'APPROVED')}
                            className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-2.5 py-1 rounded text-[10px] shadow"
                          >
                            Approve
                          </button>
                        )}
                        {ps.status === 'APPROVED' && (
                          <button
                            onClick={() => handlePayPayslip(ps.id, 'PAID')}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold px-2.5 py-1 rounded text-[10px] shadow"
                          >
                            Process Transfer
                          </button>
                        )}
                        {ps.status === 'PAID' && (
                          <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5"><CheckCircle2 className="h-3.5 w-3.5" /> Disbursed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* 1. Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h2 className="text-lg font-black tracking-tight">Configure Salary Structure</h2>

            <div className="space-y-1">
              <label className="font-bold">Select Employee</label>
              <select
                value={structForm.userId}
                onChange={(e) => setStructForm({ ...structForm, userId: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="">Select Employee</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Basic Monthly Salary (৳)</label>
                <input
                  type="number"
                  value={structForm.basicSalary}
                  onChange={(e) => setStructForm({ ...structForm, basicSalary: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Housing Allowance (৳)</label>
                <input
                  type="number"
                  value={structForm.housingAllowance}
                  onChange={(e) => setStructForm({ ...structForm, housingAllowance: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Transport Allowance (৳)</label>
                <input
                  type="number"
                  value={structForm.transportAllowance}
                  onChange={(e) => setStructForm({ ...structForm, transportAllowance: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Other Allowances (৳)</label>
                <input
                  type="number"
                  value={structForm.otherAllowances}
                  onChange={(e) => setStructForm({ ...structForm, otherAllowances: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-border/60 pt-3">
              <div className="space-y-1">
                <label className="font-bold">Provident Fund (৳)</label>
                <input
                  type="number"
                  value={structForm.providentFundContribution}
                  onChange={(e) => setStructForm({ ...structForm, providentFundContribution: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Tax Deduction (৳)</label>
                <input
                  type="number"
                  value={structForm.taxDeduction}
                  onChange={(e) => setStructForm({ ...structForm, taxDeduction: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Other Deductions (৳)</label>
                <input
                  type="number"
                  value={structForm.otherDeductions}
                  onChange={(e) => setStructForm({ ...structForm, otherDeductions: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowStructureModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStructure}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Save Structure Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Run Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-sm w-full p-6 space-y-4 text-xs">
            <h2 className="text-lg font-black tracking-tight">Run Monthly Payroll</h2>
            <p className="text-xs text-muted-foreground">This generates payslips for all active employees based on salary templates.</p>

            <div className="space-y-1">
              <label className="font-bold">Target Month</label>
              <input
                type="month"
                value={generateMonth}
                onChange={(e) => setGenerateMonth(e.target.value)}
                className="w-full bg-secondary border border-border p-2 rounded-lg font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePayslips}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Generate Payslips
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
