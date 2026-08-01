
'use client';

import { 
  Download
} from 'lucide-react';

interface MockInvoice {
  id: string;
  date: string;
  desc: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

export default function InvoiceDashboard() {
  const invoices: MockInvoice[] = [
    {
      id: 'TZ-INV-1093',
      date: 'July 9, 2026',
      desc: 'iPhone 13 Pro Screen Replacement (Grade-A OLED Panel)',
      amount: 14500,
      status: 'paid'
    },
    {
      id: 'TZ-INV-0982',
      date: 'March 15, 2026',
      desc: 'Diagnostics Audit Counter (Waived)',
      amount: 0,
      status: 'paid'
    }
  ];

  const handleDownloadInvoice = (id: string) => {
    alert(`Compiling invoice database records for: ${id}. PDF download initiated.`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-foreground">Invoices & Billing</h1>
        <p className="text-sm text-muted-foreground">Download financial statements and review past diagnostic counter costs.</p>
      </div>

      {/* Invoices list */}
      <div className="glass border border-border rounded-2xl overflow-hidden bg-card/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-bold uppercase tracking-wider">
                <th className="p-4 sm:p-5">Invoice Reference</th>
                <th className="p-4 sm:p-5">Date</th>
                <th className="p-4 sm:p-5">Description</th>
                <th className="p-4 sm:p-5">Amount (BDT)</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/60 hover:bg-secondary/10 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-foreground">{inv.id}</td>
                  <td className="p-4 sm:p-5 text-muted-foreground whitespace-nowrap">{inv.date}</td>
                  <td className="p-4 sm:p-5 text-muted-foreground max-w-xs sm:max-w-sm truncate">{inv.desc}</td>
                  <td className="p-4 sm:p-5 font-black text-foreground">
                    {inv.amount > 0 ? `৳${inv.amount.toLocaleString()}` : 'Free'}
                  </td>
                  <td className="p-4 sm:p-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDownloadInvoice(inv.id)}
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors text-muted-foreground font-bold focus:outline-none"
                      title="Download Invoice PDF"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
