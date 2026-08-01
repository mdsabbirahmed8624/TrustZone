'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { businessConfig } from '@/config/business';
import { 
  Wrench, 
  Smartphone, 
  Calendar, 
  CheckCircle2, 
  Truck
} from 'lucide-react';

export default function BookingWizard() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brand: 'Apple',
    model: '',
    serial: '',
    imei: '',
    issue: 'Screen Replacement',
    notes: '',
    branch: businessConfig.branches[0].name,
    date: '',
    timeSlot: '10:00 AM - 12:00 PM',
    requestPickup: false,
    pickupAddress: user?.savedAddresses[0]?.address || ''
  });

  const handleNext = () => {
    if (step === 1 && !formData.model) {
      alert('Please fill out the Device Model.');
      return;
    }
    if (step === 3 && !formData.date) {
      alert('Please select a preferred date.');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `TZ-BK-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(ref);
  };

  if (bookingRef) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6 animate-in fade-in duration-300">
        <div className="inline-flex bg-emerald-500/10 text-emerald-500 p-4 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-foreground">Diagnostic Slot Booked!</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your ticket is registered. Diagnostic slot details are confirmed below.
          </p>
        </div>

        <div className="glass border border-border p-6 rounded-xl space-y-4 text-left bg-card/60 text-xs">
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <span className="font-semibold text-muted-foreground">Booking Reference:</span>
            <span className="font-bold text-primary">{bookingRef}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <span className="font-semibold text-muted-foreground">Device:</span>
            <span className="font-bold">{formData.brand} {formData.model}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <span className="font-semibold text-muted-foreground">Problem Reported:</span>
            <span>{formData.issue}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <span className="font-semibold text-muted-foreground">Lab Counter Desk:</span>
            <span>{formData.branch.split(' (')[0]}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <span className="font-semibold text-muted-foreground">Diagnostic Time:</span>
            <span>{formData.date} &bull; {formData.timeSlot}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted-foreground">Courier Service:</span>
            <span className="font-bold text-emerald-500">{formData.requestPickup ? 'Pickup Requested' : 'Chassis Dropoff'}</span>
          </div>
        </div>

        <button 
          onClick={() => {
            setBookingRef(null);
            setStep(1);
          }} 
          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-md focus:outline-none"
        >
          Book Another Repair
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-foreground">Schedule Bench Repair</h1>
        <p className="text-sm text-muted-foreground">Use our step-by-step diagnostic portal to request repairs and logistics.</p>
      </div>

      {/* Steps indicator */}
      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-4">
        <span className={step >= 1 ? 'text-primary' : ''}>1. Device Info</span>
        <span className={step >= 2 ? 'text-primary' : ''}>2. Problem Details</span>
        <span className={step >= 3 ? 'text-primary' : ''}>3. Logistics & Schedule</span>
        <span className={step >= 4 ? 'text-primary' : ''}>4. Review Slot</span>
      </div>

      <div className="glass border border-border p-6 sm:p-8 rounded-2xl bg-card/40 glow-primary">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs" aria-label="Step-by-step repair scheduling form">
          
          {/* STEP 1: Device Info */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Step 1: Device Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="brand">Device Brand</label>
                  <select
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
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
                  <label className="font-bold text-muted-foreground" htmlFor="model">Model Name</label>
                  <input
                    id="model"
                    type="text"
                    required
                    placeholder="e.g. iPhone 13 Pro Max"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="serial">Serial Number (S/N)</label>
                  <input
                    id="serial"
                    type="text"
                    placeholder="e.g. F17FK892P930"
                    value={formData.serial}
                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="imei">IMEI Number (15-Digit)</label>
                  <input
                    id="imei"
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 861003048992301"
                    value={formData.imei}
                    onChange={(e) => setFormData({ ...formData, imei: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Problem Details */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Wrench className="h-5 w-5 text-primary" />
                Step 2: Reported Issue
              </h3>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground" htmlFor="issue">Reported Hardware Problem</label>
                <select
                  id="issue"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                >
                  <option>Screen Replacement</option>
                  <option>Battery Replacement</option>
                  <option>Charging Port Issue</option>
                  <option>Water Damage Treatment</option>
                  <option>Logic Board Solder</option>
                  <option>Other / Unsure</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground" htmlFor="notes">Problem Description & Special Instructions</label>
                <textarea
                  id="notes"
                  placeholder="Tell us what happened. e.g., dropped down stairs, screen is flickering..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm min-h-[120px] text-foreground focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Logistics & Schedule */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Calendar className="h-5 w-5 text-primary" />
                Step 3: Lab Selection & Time Slot
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="branch">Diagnostic Counter Desk</label>
                  <select
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                  >
                    {businessConfig.branches.map((branch) => (
                      <option key={branch.id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="date">Preferred Date</label>
                  <input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground" htmlFor="timeSlot">Preferred Time Slot</label>
                  <select
                    id="timeSlot"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                  >
                    <option>10:00 AM - 12:00 PM</option>
                    <option>12:00 PM - 02:00 PM</option>
                    <option>02:00 PM - 04:00 PM</option>
                    <option>04:00 PM - 06:00 PM</option>
                    <option>06:00 PM - 08:00 PM</option>
                  </select>
                </div>

                <div className="space-y-1.5 pt-6 flex items-center gap-3">
                  <input
                    id="pickupToggle"
                    type="checkbox"
                    checked={formData.requestPickup}
                    onChange={(e) => setFormData({ ...formData, requestPickup: e.target.checked })}
                    className="h-5 w-5 text-primary bg-secondary border-border rounded focus:ring-primary focus:ring-2 focus:ring-offset-2"
                  />
                  <label className="font-bold text-foreground flex items-center gap-1 cursor-pointer" htmlFor="pickupToggle">
                    <Truck className="h-4 w-4 text-primary" />
                    Request Diagnostic Pickup
                  </label>
                </div>
              </div>

              {formData.requestPickup && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="font-bold text-muted-foreground" htmlFor="pickupAddress">Pickup Address Location</label>
                  <input
                    id="pickupAddress"
                    type="text"
                    required
                    placeholder="Enter full address details..."
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review Slot */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2 border-b border-border pb-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Step 4: Review Your Booking
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-secondary/20 p-6 rounded-xl border border-border/80">
                <div className="space-y-1">
                  <span className="text-muted-foreground block font-semibold">Device Model:</span>
                  <span className="font-bold text-foreground text-sm block">{formData.brand} {formData.model}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block font-semibold">Hardware Issue:</span>
                  <span className="font-bold text-foreground text-sm block">{formData.issue}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block font-semibold">Diagnostic Lab:</span>
                  <span className="font-bold text-foreground text-sm block">{formData.branch}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block font-semibold">Schedule Date & Slot:</span>
                  <span className="font-bold text-foreground text-sm block">{formData.date} &bull; {formData.timeSlot}</span>
                </div>
                {formData.requestPickup && (
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <span className="text-muted-foreground block font-semibold">Pickup Address:</span>
                    <span className="font-bold text-foreground text-sm block">{formData.pickupAddress}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-border/40">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground font-bold hover:bg-secondary transition-all"
              >
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 py-2.5 rounded-lg transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-3 rounded-lg shadow-md transition-all glow-primary"
              >
                Confirm Bench Booking
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
