'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Clock,
  UserCheck,
  CheckCircle2,
  Calendar,
  Settings,
  HelpCircle,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { api } from '@/lib/api';

export default function ShiftManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Modals & Form
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    graceMinutes: 15,
    overtimeMultiplier: 1.5
  });

  const [assignForm, setAssignForm] = useState({
    userId: '',
    shiftId: '',
    startDate: '',
    endDate: ''
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.hrms.fetchShifts(token);
      if (res.success) setShifts(res.data);

      const contactsRes = await api.chat.fetchContacts(token);
      if (contactsRes.success) setContacts(contactsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateShift = async () => {
    try {
      await api.hrms.createShift(shiftForm, token);
      setShowShiftModal(false);
      setShiftForm({ name: '', startTime: '09:00', endTime: '17:00', graceMinutes: 15, overtimeMultiplier: 1.5 });
      loadData();
    } catch (err) {
      alert('Error creating shift.');
    }
  };

  const handleAssignShift = async () => {
    try {
      await api.hrms.assignShift(assignForm, token);
      setShowAssignModal(false);
      setAssignForm({ userId: '', shiftId: '', startDate: '', endDate: '' });
      loadData();
    } catch (err) {
      alert('Error assigning shift.');
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
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
                <TrendingUp className="text-primary h-6 w-6" />
                Shift & Roster Configuration
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure shift structures, rotating calendars, grace periods, and overtime multiplier rules.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowShiftModal(true)}
                className="border border-border bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" /> Create Shift Template
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <UserCheck className="h-4 w-4" /> Assign Rotating Roster
              </button>
            </div>
          </div>

          {/* Shifts Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shifts.map((s) => (
              <div key={s.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4 hover:border-primary/20 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <h3 className="text-sm font-black">{s.name}</h3>
                    <Clock className="text-primary h-4.5 w-4.5" />
                  </div>
                  
                  <div className="divide-y divide-border/60 text-[11px] space-y-2.5 pt-1">
                    <div className="flex items-center justify-between text-muted-foreground pt-1 first:pt-0">
                      <span>Shift Hours:</span>
                      <strong className="text-foreground font-mono">{s.startTime} - {s.endTime}</strong>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground pt-2">
                      <span>Lateness Grace Period:</span>
                      <strong className="text-foreground">{s.graceMinutes} minutes</strong>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground pt-2">
                      <span>Overtime Rate multiplier:</span>
                      <strong className="text-primary flex items-center gap-0.5"><DollarSign className="h-3 w-3" /> {s.overtimeMultiplier}x</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* 1. Create Shift Template Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-sm w-full p-6 space-y-4 text-xs">
            <h2 className="text-lg font-black tracking-tight">Create Shift Template</h2>

            <div className="space-y-1">
              <label className="font-bold">Shift Name</label>
              <input
                type="text"
                value={shiftForm.name}
                onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                placeholder="e.g. Night Roster"
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Start Time</label>
                <input
                  type="text"
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  placeholder="e.g. 09:00"
                  className="w-full bg-secondary border border-border p-2 rounded-lg font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">End Time</label>
                <input
                  type="text"
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  placeholder="e.g. 17:00"
                  className="w-full bg-secondary border border-border p-2 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Grace (Minutes)</label>
                <input
                  type="number"
                  value={shiftForm.graceMinutes}
                  onChange={(e) => setShiftForm({ ...shiftForm, graceMinutes: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Overtime Rate</label>
                <input
                  type="number"
                  step="0.1"
                  value={shiftForm.overtimeMultiplier}
                  onChange={(e) => setShiftForm({ ...shiftForm, overtimeMultiplier: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowShiftModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShift}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Assign Rotating Shift Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-sm w-full p-6 space-y-4 text-xs">
            <h2 className="text-lg font-black tracking-tight">Assign Roster Shift</h2>

            <div className="space-y-1">
              <label className="font-bold">Select Employee</label>
              <select
                value={assignForm.userId}
                onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="">Select Employee</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Select Shift Template</label>
              <select
                value={assignForm.shiftId}
                onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="">Select Shift Template</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Start Date</label>
                <input
                  type="date"
                  value={assignForm.startDate}
                  onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">End Date (Optional)</label>
                <input
                  type="date"
                  value={assignForm.endDate}
                  onChange={(e) => setAssignForm({ ...assignForm, endDate: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignShift}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Assign Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
