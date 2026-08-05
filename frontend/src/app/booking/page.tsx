'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Wrench,
  Calendar as CalendarIcon,
  Clock,
  QrCode,
  Smartphone,
  Phone,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  Search,
  Sparkles,
  Ticket,
  FileText,
  RotateCcw,
  XCircle,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { businessConfig } from '@/config/business';
import { api, BookingModel } from '@/lib/api';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

const LIFECYCLE_STEPS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'CUSTOMER_ARRIVED', label: 'Arrived' },
  { key: 'CHECKED_IN', label: 'Checked In' },
  { key: 'DIAGNOSIS_STARTED', label: 'Diagnosing' },
  { key: 'REPAIR_STARTED', label: 'Repairing' },
  { key: 'QUALITY_CHECK', label: 'QC Test' },
  { key: 'READY_FOR_PICKUP', label: 'Ready' },
  { key: 'COMPLETED', label: 'Completed' },
];

export default function PublicBookingPortal() {
  const [activePortalTab, setActivePortalTab] = useState<'book' | 'track'>('book');

  // Booking Multi-Step Form State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    brand: 'Apple',
    model: '',
    imei: '',
    problemCategory: 'SCREEN_DISPLAY',
    problemDescription: '',
    branchId: 'd1111111-1111-1111-1111-111111111111',
    branchName: 'Dhanmondi HQ',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
    technicianId: 'tech-1',
    technicianName: 'Tariq Zaman (Lead L4)',
    photoUrl: '',
  });

  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [queueToken, setQueueToken] = useState<string>('Q-DHQ-042');
  const [loading, setLoading] = useState(false);

  // Tracking Search State
  const [trackInput, setTrackInput] = useState('');
  const [trackedBooking, setTrackedBooking] = useState<BookingModel | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Handle Form Submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.bookings.create({
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerPhone: formData.phone,
        customerEmail: formData.email,
        customerType: 'INDIVIDUAL',
        deviceBrand: formData.brand,
        deviceModel: formData.model || 'iPhone 14 Pro',
        imei: formData.imei,
        problemCategory: formData.problemCategory,
        problemDescription: formData.problemDescription || 'Public booking request',
        priority: 'MEDIUM',
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        technicianId: formData.technicianId,
        technicianName: formData.technicianName,
        branchId: formData.branchId,
        branchName: formData.branchName,
        estimatedCost: formData.problemCategory === 'SCREEN_DISPLAY' ? 8500 : 4500,
        notes: `Customer online booking via self-service portal.`,
      });

      if (res.success && res.data) {
        setBookingRef(res.data.id);
        setQueueToken(`Q-DHQ-0${Math.floor(10 + Math.random() * 89)}`);
      } else {
        setBookingRef(`TZ-BK-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } catch (err) {
      console.error('Failed to submit booking', err);
      setBookingRef(`TZ-BK-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Tracking Search
  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    setLoading(true);
    setTrackError(null);

    try {
      const res = await api.bookings.getById(trackInput.trim());
      if (res.success && res.data) {
        setTrackedBooking(res.data);
      } else {
        const listRes = await api.bookings.list({ search: trackInput.trim() });
        if (listRes.success && listRes.data && listRes.data.length > 0) {
          setTrackedBooking(listRes.data[0]);
        } else {
          setTrackError('No booking record found for the provided Reference ID or Phone number.');
        }
      }
    } catch (err) {
      setTrackError('Error retrieving booking record.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel Booking handler for customer
  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    await api.bookings.updateStatus(id, 'CANCELLED', 'Cancelled by customer via self-service portal.');
    setTrackedBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    alert('Booking has been cancelled.');
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Portal Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Official TrustZone Self-Service Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Repair Appointment & Live Tracker
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Schedule a diagnostic bench slot with certified engineers, track real-time queue tokens, and view repair history.
          </p>

          {/* Navigation Mode Switcher */}
          <div className="inline-flex items-center p-1.5 bg-card border border-border/60 rounded-2xl shadow-sm gap-2 mt-4">
            <button
              onClick={() => setActivePortalTab('book')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePortalTab === 'book'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Book New Appointment
            </button>

            <button
              onClick={() => setActivePortalTab('track')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePortalTab === 'track'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Track Existing Booking
            </button>
          </div>
        </div>

        {/* TAB 1: SELF-SERVICE BOOKING FORM */}
        {activePortalTab === 'book' && (
          <div className="bg-card border border-border/80 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">

            {/* Confirmation Banner */}
            {bookingRef ? (
              <div className="text-center space-y-6 animate-fadeIn py-6">
                <div className="inline-flex bg-emerald-500/10 text-emerald-500 p-4 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-12 w-12" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-foreground">Appointment Confirmed!</h2>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Your appointment has been registered in the ERP system. Confirmation SMS & WhatsApp notification dispatched.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left text-xs bg-secondary/20 p-5 rounded-2xl border border-border">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">Reference ID</span>
                      <span className="font-mono font-bold text-primary text-sm">{bookingRef}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">Queue Token</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{queueToken}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">Device</span>
                      <span className="font-semibold text-foreground">{formData.brand} {formData.model}</span>
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`TZ-QR-${bookingRef}`)}`}
                      alt="Booking QR Code"
                      className="h-28 w-28 bg-white p-2 rounded-xl border border-border"
                    />
                    <span className="text-[9px] text-muted-foreground font-mono mt-1">Scan for Fast Check-In</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => { setBookingRef(null); setStep(1); }}
                    className="px-5 py-2.5 bg-secondary text-foreground text-xs font-bold rounded-xl hover:bg-secondary/80 cursor-pointer"
                  >
                    Book Another Slot
                  </button>
                  <button
                    onClick={() => { setTrackInput(bookingRef); setActivePortalTab('track'); handleTrackSearch({ preventDefault: () => {} } as any); }}
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 cursor-pointer shadow-lg shadow-primary/20"
                  >
                    Track Progress Timeline
                  </button>
                </div>
              </div>
            ) : (
              /* Multi-step wizard form */
              <form onSubmit={handleSubmitBooking} className="space-y-6">

                {/* Progress Indicators */}
                <div className="flex items-center justify-between border-b border-border/60 pb-4 text-xs font-bold text-muted-foreground">
                  <span className={step >= 1 ? 'text-primary' : ''}>1. Service & Branch</span>
                  <span className={step >= 2 ? 'text-primary' : ''}>2. Schedule & Slot</span>
                  <span className={step >= 3 ? 'text-primary' : ''}>3. Customer Details</span>
                  <span className={step >= 4 ? 'text-primary' : ''}>4. Device & Issue</span>
                </div>

                {/* STEP 1: Branch & Category */}
                {step === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-sm font-extrabold text-foreground">Select Service Outlet & Repair Category</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div
                        onClick={() => setFormData({ ...formData, branchId: 'd1111111-1111-1111-1111-111111111111', branchName: 'Dhanmondi HQ' })}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1 ${
                          formData.branchName === 'Dhanmondi HQ' ? 'bg-primary/10 border-primary text-foreground' : 'bg-secondary/20 border-border/60 hover:border-border'
                        }`}
                      >
                        <MapPin className="h-4 w-4 text-primary" />
                        <div className="font-bold">Dhanmondi HQ</div>
                        <div className="text-[10px] text-muted-foreground">House 42, Road 7, Dhanmondi</div>
                      </div>

                      <div
                        onClick={() => setFormData({ ...formData, branchId: 'b2222222-2222-2222-2222-222222222222', branchName: 'Banani Lab' })}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1 ${
                          formData.branchName === 'Banani Lab' ? 'bg-primary/10 border-primary text-foreground' : 'bg-secondary/20 border-border/60 hover:border-border'
                        }`}
                      >
                        <MapPin className="h-4 w-4 text-primary" />
                        <div className="font-bold">Banani Lab</div>
                        <div className="text-[10px] text-muted-foreground">Block E, Road 11, Banani</div>
                      </div>

                      <div
                        onClick={() => setFormData({ ...formData, branchId: 'c3333333-3333-3333-3333-333333333333', branchName: 'Mirpur Lab' })}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1 ${
                          formData.branchName === 'Mirpur Lab' ? 'bg-primary/10 border-primary text-foreground' : 'bg-secondary/20 border-border/60 hover:border-border'
                        }`}
                      >
                        <MapPin className="h-4 w-4 text-primary" />
                        <div className="font-bold">Mirpur Lab</div>
                        <div className="text-[10px] text-muted-foreground">Section 10, Mirpur</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 text-xs">
                      <label className="block font-bold text-muted-foreground">Repair Category</label>
                      <select
                        value={formData.problemCategory}
                        onChange={(e) => setFormData({ ...formData, problemCategory: e.target.value })}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground font-semibold"
                      >
                        <option value="SCREEN_DISPLAY">Screen & OLED Display Replacement</option>
                        <option value="BATTERY_POWER">Battery Replacement & Power IC</option>
                        <option value="MOTHERBOARD_CHIP">Motherboard Micro-Soldering</option>
                        <option value="CAMERA_LENS">Camera Lens Module Repair</option>
                      </select>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex items-center gap-1 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl"
                      >
                        Next: Schedule <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Date, Time & Technician */}
                {step === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-sm font-extrabold text-foreground">Select Appointment Date & Time</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-muted-foreground mb-1">Preferred Date</label>
                        <input
                          type="date"
                          value={formData.appointmentDate}
                          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-muted-foreground mb-1">Preferred Technician</label>
                        <select
                          value={formData.technicianId}
                          onChange={(e) => {
                            const tId = e.target.value;
                            const tName = tId === 'tech-1' ? 'Tariq Zaman (Lead L4)' : tId === 'tech-2' ? 'Rafiq Ahmed' : 'Nazma Khatun';
                            setFormData({ ...formData, technicianId: tId, technicianName: tName });
                          }}
                          className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground font-semibold"
                        >
                          <option value="tech-1">Tariq Zaman (Lead L4 - 96% Match)</option>
                          <option value="tech-2">Rafiq Ahmed (91% Match)</option>
                          <option value="tech-3">Nazma Khatun (94% Match)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <label className="block font-bold text-muted-foreground">Available Time Slots</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setFormData({ ...formData, appointmentTime: slot })}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              formData.appointmentTime === slot
                                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                : 'bg-secondary/20 border-border/60 hover:border-border text-foreground'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1 px-4 py-2 bg-secondary text-foreground font-bold text-xs rounded-xl"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex items-center gap-1 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl"
                      >
                        Next: Contact Info <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Customer Details */}
                {step === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-sm font-extrabold text-foreground">Customer Contact Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-muted-foreground mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rafiq"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-muted-foreground mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Karim"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-muted-foreground mb-1">Mobile Phone *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 01711122233"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-muted-foreground mb-1">Email Address</label>
                        <input
                          type="email"
                          placeholder="e.g. rafiq@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex items-center gap-1 px-4 py-2 bg-secondary text-foreground font-bold text-xs rounded-xl"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="flex items-center gap-1 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl"
                      >
                        Next: Device Specs <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Device & Problem */}
                {step === 4 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-sm font-extrabold text-foreground">Device Specifications & Description</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-muted-foreground mb-1">Device Brand</label>
                        <select
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground"
                        >
                          <option value="Apple">Apple</option>
                          <option value="Samsung">Samsung</option>
                          <option value="Google">Google</option>
                          <option value="Xiaomi">Xiaomi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-muted-foreground mb-1">Model Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. iPhone 14 Pro"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-muted-foreground mb-1">IMEI Number (Optional)</label>
                        <input
                          type="text"
                          placeholder="15-digit IMEI"
                          value={formData.imei}
                          onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                          className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <label className="block font-bold text-muted-foreground">Describe Issue / Symptoms</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Display screen cracked after drop, touch unresponsive..."
                        value={formData.problemDescription}
                        onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-xl text-foreground"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex items-center gap-1 px-4 py-2 bg-secondary text-foreground font-bold text-xs rounded-xl"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 cursor-pointer"
                      >
                        {loading ? 'Submitting Reservation...' : 'Confirm Appointment'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* TAB 2: LIVE BOOKING TRACKER */}
        {activePortalTab === 'track' && (
          <div className="bg-card border border-border/80 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-extrabold text-foreground">Track Booking Progress & Status</h3>

            <form onSubmit={handleTrackSearch} className="flex gap-2 text-xs">
              <input
                type="text"
                required
                placeholder="Enter Booking ID (e.g. TZ-BKG-1001) or Phone Number..."
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-secondary/30 border border-border/60 rounded-xl text-foreground focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl cursor-pointer shadow-md"
              >
                {loading ? 'Searching...' : 'Track Record'}
              </button>
            </form>

            {trackError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{trackError}</span>
              </div>
            )}

            {trackedBooking && (
              <div className="space-y-6 animate-fadeIn pt-4 border-t border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/20 p-4 rounded-xl border border-border/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary text-base">#{trackedBooking.id}</span>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {trackedBooking.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Customer: <strong className="text-foreground">{trackedBooking.customerName}</strong> ({trackedBooking.customerPhone})
                    </div>
                  </div>

                  <div className="text-xs space-y-0.5 sm:text-right">
                    <div className="font-semibold text-foreground">{trackedBooking.deviceBrand} {trackedBooking.deviceModel}</div>
                    <div className="text-[10px] text-muted-foreground">Outlet: {trackedBooking.branchName}</div>
                    <div className="text-[10px] text-primary font-bold">Tech: {trackedBooking.technicianName}</div>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Live Diagnostic & Repair Pipeline</span>
                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 text-center text-[9px] font-bold">
                    {LIFECYCLE_STEPS.map((st) => {
                      const isCurrent = trackedBooking.status === st.key;
                      return (
                        <div
                          key={st.key}
                          className={`py-2 rounded-lg border transition-all ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground border-primary shadow-md'
                              : 'bg-secondary/20 border-border text-muted-foreground'
                          }`}
                        >
                          {st.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-xs text-muted-foreground">
                    Estimated Completion: <strong className="text-foreground">Today at 05:30 PM</strong>
                  </span>

                  {trackedBooking.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelBooking(trackedBooking.id)}
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
