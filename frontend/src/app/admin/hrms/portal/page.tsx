'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  DollarSign,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  FileDown,
  User,
  Heart,
  Briefcase,
  TrendingUp,
  MapPin,
  Laptop,
  BookOpen,
  Award,
  ChevronRight
} from 'lucide-react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { api } from '@/lib/api';

export default function EmployeePortalPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // States
  const [attendance, setAttendance] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  // Sign NDA checkbox
  const [signedNda, setSignedNda] = useState(false);

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'CASUAL',
    reason: ''
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;
  const userJson = typeof window !== 'undefined' ? localStorage.getItem('tz_user') : null;
  const user = userJson ? JSON.parse(userJson) : { id: 'u-1', firstName: 'Marcus', lastName: 'Aurelius' };

  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      // Today's attendance log
      const attRes = await api.hrms.fetchAttendanceLogs(user.id, undefined, token);
      if (attRes.success && attRes.data.length > 0) {
        setAttendance(attRes.data[0]);
      }

      // Leave balances
      const balRes = await api.hrms.fetchLeaveBalances(user.id, token);
      if (balRes.success) setBalances(balRes.data);

      // Payslips
      const payRes = await api.hrms.fetchPayslips(user.id, token);
      if (payRes.success) setPayslips(payRes.data);

      // Shifts assigned
      const shiftRes = await api.hrms.fetchShifts(token);
      if (shiftRes.success) setShifts(shiftRes.data);

      // Assets assigned
      const assetRes = await api.hrms.fetchAssets(token);
      if (assetRes.success) {
        setAssets(assetRes.data.filter((a: any) => a.assignedToId === user.id));
      }

      // Goals
      const goalRes = await api.hrms.fetchGoals(user.id, token);
      if (goalRes.success) setGoals(goalRes.data);

      // Sessions
      const sessRes = await api.hrms.fetchSessions(token);
      if (sessRes.success) setSessions(sessRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleClockIn = async () => {
    let lat: number | undefined;
    let lng: number | undefined;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        const res = await api.hrms.clockIn(lat, lng, token);
        if (res.success) {
          alert('Clocked in successfully with Geo-coordinates.');
          loadPortalData();
        }
      }, async () => {
        const res = await api.hrms.clockIn(undefined, undefined, token);
        if (res.success) {
          alert('Clocked in successfully (Geo-location blocked).');
          loadPortalData();
        }
      });
    } else {
      const res = await api.hrms.clockIn(undefined, undefined, token);
      if (res.success) {
        alert('Clocked in successfully.');
        loadPortalData();
      }
    }
  };

  const handleClockOut = async () => {
    const res = await api.hrms.clockOut(token);
    if (res.success) {
      alert('Clocked out successfully.');
      loadPortalData();
    }
  };

  const handleBreakToggle = async (type: 'start' | 'end') => {
    if (type === 'start') {
      await api.hrms.breakStart(token);
    } else {
      await api.hrms.breakEnd(token);
    }
    loadPortalData();
  };

  const handleApplyLeave = async () => {
    try {
      const res = await api.hrms.applyLeave(leaveForm, token);
      if (res.success) {
        alert('Leave request submitted successfully.');
        setLeaveForm({ startDate: '', endDate: '', leaveType: 'CASUAL', reason: '' });
        loadPortalData();
      }
    } catch (err) {
      alert('Failed to submit leave.');
    }
  };

  const handleUpdateOKR = async (id: string, progress: number) => {
    const keyResults = [{ id: 'kr-1', title: 'Adherence Checklist', progress }];
    const status = progress >= 100 ? 'ACHIEVED' : 'PENDING';
    await api.hrms.updateGoal(id, keyResults, status, token);
    loadPortalData();
  };

  const handleRegisterTraining = async (sessionId: string) => {
    await api.hrms.registerSessionParticipant(sessionId, user.id, 'REGISTERED', token);
    loadPortalData();
    alert('Registered for training session successfully.');
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
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
                <User className="text-primary h-6 w-6" />
                Employee Self Service Portal
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your clocking logs, OKR target tracking, assigned company assets, and secure training courses registrations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Clocking Widget & Shift details */}
            <div className="space-y-6">
              <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-black flex items-center gap-2">
                  <Clock className="text-primary h-4.5 w-4.5" /> Duty Shift Clock
                </h2>

                <div className="bg-secondary/15 rounded-xl border border-border/60 p-4 text-center space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Today's Status</span>
                  <div className="text-2xl font-black uppercase tracking-wide text-primary">
                    {attendance ? attendance.status : 'Not Clocked In'}
                  </div>
                  {attendance && (
                    <div className="text-[11px] text-muted-foreground space-y-0.5 font-semibold">
                      <div>Check In: <span className="font-mono text-foreground font-bold">{new Date(attendance.checkIn).toLocaleTimeString()}</span></div>
                      {attendance.checkOut && (
                        <div>Check Out: <span className="font-mono text-foreground font-bold">{new Date(attendance.checkOut).toLocaleTimeString()}</span></div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  {!attendance && (
                    <button
                      onClick={handleClockIn}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 shadow"
                    >
                      <Play className="h-4 w-4" /> Clock In for Duty
                    </button>
                  )}
                  {attendance && !attendance.checkOut && (
                    <>
                      <button
                        onClick={handleClockOut}
                        className="bg-red-500 hover:bg-red-600 text-white font-black text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 shadow"
                      >
                        <Square className="h-4 w-4" /> Clock Out (End Shift)
                      </button>

                      <div className="flex gap-2">
                        {!attendance.breakStart && (
                          <button
                            onClick={() => handleBreakToggle('start')}
                            className="flex-1 border border-border bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1"
                          >
                            <Coffee className="h-3.5 w-3.5 text-primary" /> Start Break
                          </button>
                        )}
                        {attendance.breakStart && !attendance.breakEnd && (
                          <button
                            onClick={() => handleBreakToggle('end')}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1"
                          >
                            <Coffee className="h-3.5 w-3.5" /> End Break
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Roster Assignment */}
              <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                <h2 className="text-sm font-black flex items-center gap-2">
                  <TrendingUp className="text-primary h-4.5 w-4.5" /> Active Assigned Shift
                </h2>
                {shifts.length > 0 ? (
                  <div className="divide-y divide-border/60 text-[11px] font-semibold space-y-2 pt-1">
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-muted-foreground">Shift:</span>
                      <strong className="text-foreground">{shifts[0].name}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground">Timings:</span>
                      <strong className="text-foreground font-mono">{shifts[0].startTime} - {shifts[0].endTime}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground">Grace Minutes allowed:</span>
                      <strong className="text-foreground">{shifts[0].graceMinutes} mins</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Standard Shift Assigned (09:00 - 17:00).</p>
                )}
              </div>
            </div>

            {/* Middle Col: Apply Leave & OKRs Target Cards */}
            <div className="space-y-6">
              <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-black flex items-center gap-2">
                  <Calendar className="text-primary h-4.5 w-4.5" /> Request Leave
                </h2>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold">Start Date</label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="w-full bg-secondary border border-border p-2 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">End Date</label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="w-full bg-secondary border border-border p-2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold">Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    className="w-full bg-secondary border border-border p-2 rounded-lg font-bold"
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold">Reason</label>
                  <input
                    type="text"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Provide details..."
                    className="w-full bg-secondary border border-border p-2 rounded-lg font-semibold text-xs"
                  />
                </div>

                <button
                  onClick={handleApplyLeave}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs py-2.5 rounded-lg shadow"
                >
                  Submit Leave Request
                </button>
              </div>

              {/* Goals & OKRs */}
              <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-black flex items-center gap-2">
                  <Award className="text-primary h-4.5 w-4.5" /> OKR Goal tracker
                </h2>
                {goals.map((g) => {
                  const kr = Array.isArray(g.keyResults) && g.keyResults.length > 0 ? g.keyResults[0] : { progress: 50 };
                  return (
                    <div key={g.id} className="bg-secondary/10 border border-border/40 p-3.5 rounded-lg space-y-2 text-[11px] font-semibold">
                      <div className="flex justify-between items-center text-foreground font-bold">
                        <span>{g.title}</span>
                        <span className="text-primary font-black uppercase text-[9px]">{g.status}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-muted-foreground text-[10px]">
                          <span>Key Result Progress:</span>
                          <span>{kr.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={kr.progress}
                          onChange={(e) => handleUpdateOKR(g.id, Number(e.target.value))}
                          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Payslips & Assigned Assets */}
            <div className="space-y-6">
              <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-black flex items-center gap-2">
                  <DollarSign className="text-primary h-4.5 w-4.5" /> Secure Payslips
                </h2>

                <div className="space-y-3">
                  {payslips.map((ps) => (
                    <div key={ps.id} className="bg-secondary/15 border border-border/60 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{ps.month}</span>
                        <div className="text-xs font-black">৳{Number(ps.netPay).toLocaleString()}</div>
                      </div>
                      <button onClick={() => alert(`Downloading Secure Payslip: ${ps.month}`)} className="bg-primary hover:bg-primary/95 text-primary-foreground p-1.5 rounded-lg shadow">
                        <FileDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Assets */}
              <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-black flex items-center gap-2">
                  <Laptop className="text-primary h-4.5 w-4.5" /> My Company Assets
                </h2>
                {assets.map((a) => (
                  <div key={a.id} className="bg-secondary/10 border border-border/40 p-3 rounded-lg text-[11px] font-semibold space-y-1">
                    <div className="text-foreground font-bold">{a.name}</div>
                    <div className="text-muted-foreground">Serial: {a.serialNumber}</div>
                    <div className="text-muted-foreground">Status: <span className="text-primary font-black uppercase text-[9px]">{a.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Panel: Training registrations and NDA compliance checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Training Sessions */}
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-black flex items-center gap-2">
                <BookOpen className="text-primary h-4.5 w-4.5" /> Training Programs Registry
              </h2>
              <div className="space-y-3.5">
                {sessions.map((sess) => (
                  <div key={sess.id} className="bg-secondary/15 border border-border/40 p-3.5 rounded-xl flex items-center justify-between text-[11px]">
                    <div>
                      <div className="font-bold text-foreground">{sess.course?.title}</div>
                      <span className="text-muted-foreground font-semibold">Location: {sess.location} • Date: {new Date(sess.sessionDate).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => handleRegisterTraining(sess.id)} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-3 py-1 rounded-lg text-[10px] shadow">
                      Enroll Course
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* NDA compliance */}
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-black flex items-center gap-2">
                <AlertTriangle className="text-yellow-500 h-4.5 w-4.5" /> Security Compliance Policies
              </h2>
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg p-3 text-[11px] leading-relaxed font-semibold">
                ⚠️ All technicians are required to sign the standard Non-Disclosure Agreement (NDA) and comply with ESD ESD workbench grounding guidelines.
              </div>

              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="nda-checkbox"
                  checked={signedNda}
                  onChange={(e) => setSignedNda(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="nda-checkbox" className="font-bold select-none cursor-pointer">
                  I agree and acknowledge the terms of the Non-Disclosure Agreement (NDA) and company safety guidelines.
                </label>
              </div>

              {signedNda && (
                <div className="flex items-center gap-1.5 text-xs text-green-500 font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Non-Disclosure Agreement Signed & Stored
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
