'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { FileSpreadsheet, BarChart3, Settings, Play, Printer } from 'lucide-react';

export default function ReportsBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [module, setModule] = useState('TICKETS');
  const [reportResult, setReportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  const handleRunReport = async () => {
    setLoading(true);
    // Simulated mock aggregation calculations
    setTimeout(() => {
      if (module === 'TICKETS') {
        setReportResult({
          totalRecords: 148,
          summary: { totalEstimated: 452000 },
          data: [
            { id: 'T-1', customerName: 'Marcus Aurelius', deviceModel: 'iPhone 13 Pro', estimatedCost: 3500 },
            { id: 'T-2', customerName: 'Nasrin Akter', deviceModel: 'Galaxy S22', estimatedCost: 4800 }
          ]
        });
      } else {
        setReportResult({
          totalRecords: 92,
          summary: { totalSales: 890000 },
          data: [
            { id: 'INV-1', invoiceNumber: 'TZ-2026-0091', total: 6200, status: 'PAID' },
            { id: 'INV-2', invoiceNumber: 'TZ-2026-0092', total: 4200, status: 'UNPAID' }
          ]
        });
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h1 className="text-2xl font-black flex items-center gap-2">
              <FileSpreadsheet className="text-primary h-6 w-6" />
              Enterprise Report Builder
            </h1>
            <p className="text-xs text-muted-foreground">Compile dynamic reports, groupings, and exports without manual DB scanning.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filter controls */}
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-4 text-xs font-semibold shadow-sm">
              <h2 className="text-sm font-black flex items-center gap-1"><Settings className="h-4 w-4 text-primary" /> Configuration</h2>

              <div className="space-y-1">
                <label className="font-bold">Module Scope</label>
                <select value={module} onChange={(e) => setModule(e.target.value)} className="w-full bg-secondary border border-border p-2 rounded-lg font-bold">
                  <option value="TICKETS">Tickets & Repairs</option>
                  <option value="FINANCE">Invoices & Finance</option>
                </select>
              </div>

              <button onClick={handleRunReport} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow">
                <Play className="h-4 w-4" /> Run Report
              </button>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-3 space-y-4">
              {loading ? (
                <p className="text-xs text-muted-foreground">Aggregating records details...</p>
              ) : reportResult ? (
                <div className="space-y-6">
                  {/* Aggregations Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Total Records</span>
                      <div className="text-xl font-black mt-1">{reportResult.totalRecords}</div>
                    </div>
                    <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                        {module === 'TICKETS' ? 'Total Estimated Value' : 'Total Revenue'}
                      </span>
                      <div className="text-xl font-black mt-1">৳{module === 'TICKETS' ? reportResult.summary.totalEstimated.toLocaleString() : reportResult.summary.totalSales.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Data list */}
                  <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-secondary/40 border-b border-border/60 font-bold">
                        <tr>
                          {module === 'TICKETS' ? (
                            <>
                              <th className="p-3">Ticket ID</th>
                              <th className="p-3">Customer</th>
                              <th className="p-3">Device Model</th>
                              <th className="p-3">Estimated Cost</th>
                            </>
                          ) : (
                            <>
                              <th className="p-3">Invoice Number</th>
                              <th className="p-3">Total Value</th>
                              <th className="p-3">Status</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 bg-card">
                        {reportResult.data.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-secondary/10">
                            {module === 'TICKETS' ? (
                              <>
                                <td className="p-3 font-bold">{row.id}</td>
                                <td className="p-3 font-semibold">{row.customerName}</td>
                                <td className="p-3 text-muted-foreground">{row.deviceModel}</td>
                                <td className="p-3 font-black">৳{row.estimatedCost}</td>
                              </>
                            ) : (
                              <>
                                <td className="p-3 font-bold">{row.invoiceNumber}</td>
                                <td className="p-3 font-black">৳{row.total}</td>
                                <td className="p-3">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${row.status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                    {row.status}
                                  </span>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1 shadow-sm">
                      <Printer className="h-4 w-4" /> Print PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl p-12 text-center text-xs text-muted-foreground bg-card shadow-sm">
                  Choose your scope and filters on the left to generate report views.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
