'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';

interface TrackingHistoryItem {
  stage: string;
  desc: string;
  date: string;
  done: boolean;
  active?: boolean;
}

interface TrackingDetails {
  ticketNumber: string;
  device: string;
  issue: string;
  status: string;
  statusState: string;
  ipAddress: string;
  technician: string;
  history: TrackingHistoryItem[];
}

export default function Tracking() {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;

    setLoading(true);
    setError(null);
    setTrackingData(null);

    // Simulate API lookup
    setTimeout(() => {
      setLoading(false);
      const cleanId = ticketId.trim().toUpperCase();
      if (cleanId.startsWith('TZ-')) {
        setTrackingData({
          ticketNumber: cleanId,
          device: 'iPhone 13 Pro Max',
          issue: 'Display Glass Replacement',
          status: 'Replacing Display Panel',
          statusState: 'workbench',
          ipAddress: '192.168.1.1',
          technician: 'Kamrul Hasan (Certified Master)',
          history: [
            { stage: 'Ticket Created', desc: 'Booking confirmed and logged in diagnostic ledger.', date: 'July 8, 10:15 AM', done: true },
            { stage: 'Diagnostics Assessment', desc: 'Motherboard standby currents & connector checks completed. Free of trace short circuit.', date: 'July 8, 11:30 AM', done: true },
            { stage: 'On Workbench', desc: 'Display panel lamination is active inside dust-free electrostatic hood.', date: 'July 9, 12:45 PM', done: true, active: true },
            { stage: 'Quality Control Check', desc: 'TrueTone serialization, touchscreen calibration & water seal pressure testing.', date: 'Pending', done: false },
            { stage: 'Ready for Pick Up', desc: 'Device ready at Dhanmondi desk. Dispatches email alerts.', date: 'Pending', done: false }
          ]
        });
      } else {
        setError('No diagnostic record matches that ticket reference. Please verify it starts with "TZ-".');
      }
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Real-Time Diagnostics Tracker
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Track Repair Progress
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Verify your device status, diagnostic evaluations, and active repair workbench details. Input your ticket ID starting with &quot;TZ-&quot;.
        </p>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleTrack} className="glass p-3 rounded-2xl border border-border flex gap-3 glow-primary">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <label htmlFor="ticketIdInput" className="sr-only">Enter Diagnostics Ticket ID</label>
          <input 
            id="ticketIdInput"
            type="text" 
            required
            placeholder="e.g. TZ-8932"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="w-full bg-transparent border-0 pl-12 pr-4 py-3 rounded-xl text-sm focus:ring-0 focus:outline-none text-foreground font-semibold focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-8 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Errors */}
      {error && (
        <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="block font-bold text-sm text-red-500">Record Lookup Failed</span>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Tracking Data */}
      {trackingData && (
        <div className="glass border border-border rounded-2xl p-8 space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Diagnostics Ticket</span>
              <h3 className="text-2xl font-extrabold text-foreground">{trackingData.ticketNumber}</h3>
            </div>
            <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-sm font-bold">
              {trackingData.status}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">Device Model</span>
              <span className="font-bold text-foreground">{trackingData.device}</span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">Reported Issue</span>
              <span className="font-bold text-foreground">{trackingData.issue}</span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">Assigned Tech Desk</span>
              <span className="font-bold text-foreground">{trackingData.technician}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6 pt-6 border-t border-border">
            <h4 className="font-bold text-base text-foreground">Repair Workflow Log</h4>
            <div className="relative border-l border-border pl-6 ml-3 space-y-8">
              {trackingData.history.map((step: TrackingHistoryItem, idx: number) => (
                <div key={idx} className="relative">
                  {/* Timeline point */}
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                    step.active
                      ? 'bg-primary border-primary animate-pulse'
                      : step.done
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-card border-border'
                  }`} />
                  
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <span className={`font-bold text-sm ${step.active ? 'text-primary' : 'text-foreground'}`}>
                        {step.stage}
                      </span>
                      <span className="text-xs text-muted-foreground">{step.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
