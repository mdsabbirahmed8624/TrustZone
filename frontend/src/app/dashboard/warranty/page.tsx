'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  QrCode, 
  Calendar,
  CheckCircle
} from 'lucide-react';

interface MockWarranty {
  id: string;
  device: string;
  partCovered: string;
  remainingDays: number;
  expiryDate: string;
  status: 'active' | 'expired';
}

export default function WarrantyDashboard() {
  const warranties: MockWarranty[] = [
    {
      id: 'TZ-WR-8192',
      device: 'iPhone 13 Pro',
      partCovered: 'OLED Display & touchscreen controller',
      remainingDays: 240,
      expiryDate: 'March 5, 2027',
      status: 'active'
    }
  ];

  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const handleDownloadCard = (id: string) => {
    alert(`Generating dynamic secure PDF Warranty Card for: ${id}. File download initiated.`);
  };

  const handleClaim = (id: string) => {
    setClaimSuccess(`Claim request successfully filed for warranty ${id}. Diagnostic desk will contact you shortly.`);
    setTimeout(() => setClaimSuccess(null), 5000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-foreground">Warranties & Protection</h1>
        <p className="text-sm text-muted-foreground">Verify parts coverage duration, download verification cards, and file claims.</p>
      </div>

      {claimSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{claimSuccess}</span>
        </div>
      )}

      {/* Warranty List */}
      <div className="space-y-6">
        {warranties.map((war) => (
          <div key={war.id} className="glass border border-border rounded-2xl p-6 sm:p-8 bg-card/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden glow-primary">
            
            {/* Left information */}
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="flex bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Warranty Code</span>
                  <span className="font-extrabold text-foreground text-sm">{war.id}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p><strong className="text-foreground">Device Model:</strong> {war.device}</p>
                <p><strong className="text-foreground">Covered Parts:</strong> {war.partCovered}</p>
                <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> Expires: {war.expiryDate}</p>
              </div>

              <div className="flex gap-3 text-xs pt-2">
                <button
                  onClick={() => handleDownloadCard(war.id)}
                  className="inline-flex items-center gap-1.5 border border-border hover:bg-secondary/80 px-4 py-2 rounded-lg font-bold text-foreground transition-all"
                >
                  <Download className="h-4 w-4" />
                  Warranty Card PDF
                </button>
                <button
                  onClick={() => handleClaim(war.id)}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 rounded-lg transition-all focus:outline-none"
                >
                  File Claim
                </button>
              </div>
            </div>

            {/* Right validation: QR Code */}
            <div className="shrink-0 flex flex-col items-center gap-2 bg-secondary/30 p-4 rounded-xl border border-border/80 text-center w-full md:w-auto">
              <div className="bg-white p-2 rounded-lg inline-block border border-border">
                {/* Visual mock QR code layout */}
                <QrCode className="h-24 w-24 text-slate-900" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Status: Verified</span>
                <span className="font-black text-foreground text-sm block mt-0.5">{war.remainingDays} Days Left</span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
