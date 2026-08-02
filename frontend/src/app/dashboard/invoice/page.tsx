
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download,
  Printer,
  FileText,
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';

export default function InvoiceDashboard() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('tz_token') || localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.invoices.list(undefined, token);
      if (res && res.success) {
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
        setInvoices(items);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handlePrintInvoice = (inv: any) => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          Invoices & Billing Statements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review repair bills, download thermal/A4 statements, and track payment receipts.</p>
      </div>

      {/* Invoices list */}
      <div className="glass border border-border rounded-2xl overflow-hidden bg-card/40">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground mt-2">Loading billing statements...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No invoice records found in billing history.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Invoice Reference</th>
                  <th className="p-4 sm:p-5">Customer</th>
                  <th className="p-4 sm:p-5">Date</th>
                  <th className="p-4 sm:p-5">Amount (BDT)</th>
                  <th className="p-4 sm:p-5">Tax</th>
                  <th className="p-4 sm:p-5">Status</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/60 hover:bg-secondary/10 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-foreground">{inv.invoiceNo}</td>
                    <td className="p-4 sm:p-5 text-foreground">{inv.customerName}</td>
                    <td className="p-4 sm:p-5 text-muted-foreground whitespace-nowrap">
                      {new Date(inv.issuedAt || inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 sm:p-5 font-black text-foreground">
                      ৳{Number(inv.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="p-4 sm:p-5 text-muted-foreground">
                      ৳{Number(inv.taxAmount || 0).toLocaleString()}
                    </td>
                    <td className="p-4 sm:p-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="h-3 w-3" />
                        PAID
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handlePrintInvoice(inv)}
                        className="inline-flex items-center gap-1 hover:text-primary transition-colors text-muted-foreground font-bold focus:outline-none"
                        title="Print/Download Invoice"
                      >
                        <Printer className="h-4 w-4" />
                        Print / PDF
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
  );
}
