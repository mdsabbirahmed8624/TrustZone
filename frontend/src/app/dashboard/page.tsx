'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { 
  MapPin, 
  Smartphone, 
  Clock, 
  CheckCircle,
  Image as ImageIcon,
  ChevronRight,
  Plus
} from 'lucide-react';

interface MockTicket {
  id: string;
  brand: string;
  model: string;
  status: 'booked' | 'diagnosed' | 'on_workbench' | 'quality_check' | 'ready_for_pickup';
  progress: number;
  assignedTech: string;
  eta: string;
}

export default function DashboardOverview() {
  const { user, updateProfile } = useAuth();
  const activeTickets: MockTicket[] = [
    {
      id: 'TZ-TK-8932',
      brand: 'Apple',
      model: 'iPhone 13 Pro',
      status: 'on_workbench',
      progress: 60,
      assignedTech: 'Nafis Iqbal (Senior Hardware Specialist)',
      eta: 'Today, 06:30 PM'
    }
  ];

  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDevice, setNewDevice] = useState({ brand: 'Apple', model: '', serial: '', imei: '' });

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'booked': return 'Booking Slot Reserved';
      case 'diagnosed': return 'Diagnostic Evaluation Complete';
      case 'on_workbench': return 'Repair Active on Bench';
      case 'quality_check': return 'Post-Repair Calibration QC';
      case 'ready_for_pickup': return 'Ready at Desk';
      default: return 'Pending';
    }
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && newDevice.model) {
      const updatedDevices = [
        ...(user.myDevices || []),
        {
          id: `dev-${Math.floor(Math.random() * 1000)}`,
          brand: newDevice.brand,
          model: newDevice.model,
          serial: newDevice.serial || 'N/A',
          imei: newDevice.imei || 'N/A'
        }
      ];
      updateProfile({ myDevices: updatedDevices });
      setNewDevice({ brand: 'Apple', model: '', serial: '', imei: '' });
      setShowAddDeviceModal(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header welcome banner */}
      <div className="glass border border-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card/30 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Welcome back, {user?.firstName}!</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Keep track of active device repairs and diagnostic scheduling logs.</p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="flex items-center gap-4 shrink-0 relative z-10 bg-secondary/50 p-4 rounded-xl border border-border/60">
          <div className="relative h-14 w-14 flex items-center justify-center">
            {/* Circular progress bar mock */}
            <svg className="absolute inset-0 h-full w-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="stroke-muted/30 fill-none" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" className="stroke-primary fill-none" strokeWidth="4" strokeDasharray="150" strokeDashoffset={150 - (150 * (user?.profileCompletion || 75)) / 100} />
            </svg>
            <span className="text-xs font-black text-foreground">{user?.profileCompletion}%</span>
          </div>
          <div>
            <span className="font-extrabold text-xs text-foreground block">Profile Score</span>
            <span className="text-[10px] text-muted-foreground block">Add backup recovery phone</span>
          </div>
        </div>
      </div>

      {/* Active repairs track */}
      <section className="space-y-6">
        <h3 className="font-black text-lg text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Active Repair Steppers
        </h3>

        {activeTickets.length > 0 ? (
          <div className="space-y-6">
            {activeTickets.map((ticket) => (
              <div key={ticket.id} className="glass border border-border rounded-2xl p-6 sm:p-8 bg-card/40 space-y-6 glow-primary">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Reference ID</span>
                    <span className="font-extrabold text-lg text-foreground">{ticket.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block text-left sm:text-right">Device model</span>
                    <span className="font-bold text-sm text-foreground">{ticket.brand} {ticket.model}</span>
                  </div>
                </div>

                {/* Progress bar slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted-foreground">Current Phase: <span className="text-primary">{getStatusLabel(ticket.status)}</span></span>
                    <span className="font-black text-primary">{ticket.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${ticket.progress}%` }} />
                  </div>
                </div>

                {/* Technical data metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-semibold block">Lead Diagnostics Tech:</span>
                    <span className="font-bold text-foreground block">{ticket.assignedTech}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-semibold block">Estimated Completion:</span>
                    <span className="font-bold text-foreground block">{ticket.eta}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-semibold block">Repair Showcase Camera:</span>
                    <span className="font-bold text-muted-foreground flex items-center gap-1">
                      <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                      Live Board snapshots (In diagnostic review)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-12 text-center rounded-2xl border border-border space-y-4 bg-card/20">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-sm text-muted-foreground">No active repair tickets are registered under your account.</p>
            <Link href="/dashboard/booking" className="inline-flex bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-5 py-2.5 rounded-lg text-sm transition-all focus:outline-none">
              Schedule Diagnostic Bench
            </Link>
          </div>
        )}
      </section>

      {/* Grid of registered hardware and addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Saved devices */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg text-foreground flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              My Registered Devices
            </h3>
            <button 
              onClick={() => setShowAddDeviceModal(true)} 
              className="text-primary hover:text-accent font-bold text-xs flex items-center gap-1.5 focus:outline-none"
            >
              <Plus className="h-4 w-4" />
              Add Device
            </button>
          </div>

          <div className="space-y-3">
            {user?.myDevices.map((dev) => (
              <div key={dev.id} className="glass p-4 rounded-xl border border-border bg-card/40 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-foreground text-sm block">{dev.brand} {dev.model}</span>
                  <div className="flex gap-4 text-muted-foreground">
                    <span>IMEI: {dev.imei}</span>
                    <span>S/N: {dev.serial}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </section>

        {/* Saved addresses */}
        <section className="space-y-4">
          <h3 className="font-black text-lg text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Saved Addresses
          </h3>

          <div className="space-y-3">
            {user?.savedAddresses.map((addr) => (
              <div key={addr.id} className="glass p-4 rounded-xl border border-border bg-card/40 flex justify-between items-start gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">{addr.label} Address</span>
                  <p className="text-muted-foreground leading-relaxed">{addr.address}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Add Device Modal Dialog */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="glass bg-background border border-border max-w-md w-full p-6 rounded-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-black text-lg text-foreground">Register New Device</h3>
              <button onClick={() => setShowAddDeviceModal(false)} className="text-muted-foreground hover:text-foreground font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddDevice} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground" htmlFor="modalBrand">Device Brand</label>
                <select
                  id="modalBrand"
                  value={newDevice.brand}
                  onChange={(e) => setNewDevice({ ...newDevice, brand: e.target.value })}
                  className="w-full bg-secondary border border-border px-3.5 py-2 rounded-lg text-sm text-foreground focus:outline-none"
                >
                  <option>Apple</option>
                  <option>Samsung</option>
                  <option>Xiaomi</option>
                  <option>OnePlus</option>
                  <option>Realme</option>
                  <option>Google Pixel</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground" htmlFor="modalModel">Model Name</label>
                <input
                  id="modalModel"
                  type="text"
                  required
                  placeholder="e.g. iPhone 14 Pro Max"
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                  className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="modalImei">IMEI Code (Optional)</label>
                  <input
                    id="modalImei"
                    type="text"
                    placeholder="86100..."
                    value={newDevice.imei}
                    onChange={(e) => setNewDevice({ ...newDevice, imei: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="modalSerial">Serial Number (Optional)</label>
                  <input
                    id="modalSerial"
                    type="text"
                    placeholder="F17FK..."
                    value={newDevice.serial}
                    onChange={(e) => setNewDevice({ ...newDevice, serial: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 rounded-lg text-sm"
              >
                Confirm Device Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
