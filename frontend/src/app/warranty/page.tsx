'use client';

import { useState } from 'react';
import { Search, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface WarrantyDetails {
  invoiceNumber: string;
  device: string;
  repairCompleted: string;
  partsSwapped: string;
  status: string;
  expiresAt: string;
  coveredItems: string[];
}

export default function Warranty() {
  const [queryId, setQueryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [warrantyData, setWarrantyData] = useState<WarrantyDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryId) return;

    setLoading(true);
    setError(null);
    setWarrantyData(null);

    try {
      const res = await api.warranty.verify(queryId);
      setLoading(false);
      if (res.success && res.data) {
        const warr = res.data;
        setWarrantyData({
          invoiceNumber: warr.warrantyNumber,
          device: `${warr.deviceBrand} ${warr.deviceModel}`,
          repairCompleted: new Date(warr.startDate).toLocaleDateString(),
          partsSwapped: `${warr.warrantyType} Warranty Registration`,
          status: warr.status,
          expiresAt: new Date(warr.endDate).toLocaleDateString(),
          coveredItems: warr.coverageDetails.length > 0 ? warr.coverageDetails : [
            'Touch digitizer latency & dead pixel failures',
            'Display panel backlight lines',
            'Water seal frame integrity checks'
          ]
        });
      } else {
        setError('No warranty coverage records match that certificate/IMEI code.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'No warranty coverage records match that certificate/IMEI code.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Warranty Trace System
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Verify Warranty Coverage
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Verify active warranty locks, duration metrics, and operations covered. Enter your invoice reference ID (e.g. TZ-INV-1093).
        </p>
      </div>

      {/* Query bar */}
      <form onSubmit={handleVerify} className="glass p-3 rounded-2xl border border-border flex gap-3 glow-primary">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <label htmlFor="warrantyInvoiceInput" className="sr-only">Enter Invoice Code</label>
          <input 
            id="warrantyInvoiceInput"
            type="text" 
            required
            placeholder="e.g. TZ-INV-1093"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            className="w-full bg-transparent border-0 pl-12 pr-4 py-3 rounded-xl text-sm focus:ring-0 focus:outline-none text-foreground font-semibold focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-8 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
        </button>
      </form>

      {/* Errors */}
      {error && (
        <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="block font-bold text-sm text-red-500">No Coverage Record Found</span>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Warranty output card */}
      {warrantyData && (
        <div className="glass border border-border rounded-2xl p-8 space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Warranty Ledger</span>
              <h3 className="text-2xl font-extrabold text-foreground">{warrantyData.invoiceNumber}</h3>
            </div>
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-sm font-bold">
              {warrantyData.status}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">Device Model</span>
              <span className="font-bold text-foreground">{warrantyData.device}</span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">Repair Completed</span>
              <span className="font-bold text-foreground">{warrantyData.repairCompleted}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs text-muted-foreground font-semibold">Components Swapped</span>
              <span className="font-bold text-foreground">{warrantyData.partsSwapped}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs text-muted-foreground font-semibold">Coverage Expiration</span>
              <span className="font-bold text-primary">{warrantyData.expiresAt}</span>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            <h4 className="font-bold text-base text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Covered Hardware Failure Actions
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {warrantyData.coveredItems.map((item: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
