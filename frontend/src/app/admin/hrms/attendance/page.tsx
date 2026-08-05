'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Plus,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Coffee,
  MapPin,
  FileCheck
} from 'lucide-react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { api } from '@/lib/api';

export default function AttendanceLogsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Search/Filters
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals & Correction Form
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctForm, setCorrectForm] = useState({
    userId: '',
    date: '',
    status: 'present',
    checkIn: '',
    checkOut: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadLogs();
  }, [selectedUser, selectedDate]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.hrms.fetchAttendanceLogs(selectedUser || undefined, selectedDate || undefined, token);
      if (res.success) setLogs(res.data);

      const contactsRes = await api.chat.fetchContacts(token);
      if (contactsRes.success) setContacts(contactsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCorrect = async () => {
    try {
      await api.hrms.correctAttendance(correctForm, token);
      setShowCorrectionModal(false);
      setCorrectForm({ userId: '', date: '', status: 'present', checkIn: '', checkOut: '' });
      loadLogs();
    } catch (err) {
      alert('Error updating attendance record.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'late': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'leave': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'absent': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
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
                <Clock className="text-primary h-6 w-6" />
                Attendance Monitor
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitor employee clock in/out times, break durations, geo-locations, and process corrections.
              </p>
            </div>
            <button
              onClick={() => setShowCorrectionModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <FileCheck className="h-4 w-4" /> Force Corrections Record
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border/60 p-3 rounded-xl shadow-sm text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg font-bold text-[11px]"
              >
                <option value="">All Employees</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          {/* Logs table */}
          <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-secondary/40 border-b border-border/60 font-bold">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Clock In</th>
                  <th className="p-3">Clock Out</th>
                  <th className="p-3">Break Duration</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Late/Early</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">No attendance records found.</td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const checkInTime = log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                    const checkOutTime = log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                    
                    let breakText = 'N/A';
                    if (log.breakStart && log.breakEnd) {
                      const mins = Math.round((new Date(log.breakEnd).getTime() - new Date(log.breakStart).getTime()) / (1000 * 60));
                      breakText = `${mins} mins`;
                    }

                    return (
                      <tr key={log.id} className="hover:bg-secondary/15 transition-all">
                        <td className="p-3 font-bold">{log.user?.firstName} {log.user?.lastName}</td>
                        <td className="p-3 text-muted-foreground">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="p-3 font-mono font-bold text-foreground">{checkInTime}</td>
                        <td className="p-3 font-mono text-muted-foreground">{checkOutTime}</td>
                        <td className="p-3 text-muted-foreground flex items-center gap-1"><Coffee className="h-3.5 w-3.5 text-orange-500" /> {breakText}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {log.lateArrival && <span className="text-red-500 font-bold block">Late Arrival</span>}
                          {log.earlyLeave && <span className="text-orange-500 font-bold block">Early Leave</span>}
                          {!log.lateArrival && !log.earlyLeave && <span className="text-green-500 font-bold">On Schedule</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Corrections Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h2 className="text-lg font-black tracking-tight">Manual Attendance Correction</h2>

            <div className="space-y-1">
              <label className="font-bold">Select Employee</label>
              <select
                value={correctForm.userId}
                onChange={(e) => setCorrectForm({ ...correctForm, userId: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="">Select Employee</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Record Date</label>
                <input
                  type="date"
                  value={correctForm.date}
                  onChange={(e) => setCorrectForm({ ...correctForm, date: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Status</label>
                <select
                  value={correctForm.status}
                  onChange={(e) => setCorrectForm({ ...correctForm, status: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave Approved</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Clock In Date-Time</label>
                <input
                  type="datetime-local"
                  value={correctForm.checkIn}
                  onChange={(e) => setCorrectForm({ ...correctForm, checkIn: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Clock Out Date-Time</label>
                <input
                  type="datetime-local"
                  value={correctForm.checkOut}
                  onChange={(e) => setCorrectForm({ ...correctForm, checkOut: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCorrect}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Apply Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
