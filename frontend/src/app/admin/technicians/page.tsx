/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  MapPin, 
  Award, 
  Calendar, 
  ToggleLeft, 
  ToggleRight, 
  X, 
  Loader2,
  Check,
  Star,
  UserCheck,
  BookOpen
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/context/admin-auth-context';

export default function TechniciansPage() {
  const { adminUser: _adminUser } = useAdminAuth();
  
  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Data States
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [branchFilter, setBranchFilter] = useState('');
  const [branches] = useState<{ id: string; name: string }[]>([
    { id: 'd1111111-1111-1111-1111-111111111111', name: 'Dhanmondi Head Office' },
    { id: 'b2222222-2222-2222-2222-222222222222', name: 'Banani Laboratory' },
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Mirpur Express Desk' }
  ]);

  // Submit Leave Request form
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Fetch all technicians
  const fetchTechs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.technicians.list(
        { branchId: branchFilter || undefined },
        token
      );
      if (res && res.success) {
        setTechnicians(res.data);
      } else {
        setError(res.message || 'Failed to fetch technicians');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  }, [branchFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTechs();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTechs]);

  // Load single technician details (attendance logs, active tickets, leaves)
  const fetchTechDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const res = await api.technicians.get(id, token);
      if (res && res.success) {
        setSelectedTech(res.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Toggle Technician Online/Offline status
  const handleToggleOnline = async (tech: any) => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const newStatus = !tech.isOnline;
      await api.technicians.update(tech.id, { isOnline: newStatus }, token);
      fetchTechs();
      if (selectedTech?.id === tech.id) {
        fetchTechDetails(tech.id);
      }
    } catch (err: any) {
      console.error('Failed to toggle online status', err);
    }
  };

  // Toggle Technician Availability
  const handleToggleAvailability = async (tech: any) => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      const newAvail = !tech.availability;
      await api.technicians.update(tech.id, { availability: newAvail }, token);
      fetchTechs();
      if (selectedTech?.id === tech.id) {
        fetchTechDetails(tech.id);
      }
    } catch (err: any) {
      console.error('Failed to toggle availability status', err);
    }
  };

  // Clock In / Out for selected technician
  const handleClockInOut = async (status: 'present' | 'late') => {
    if (!selectedTech) return;
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.technicians.logAttendance(selectedTech.id, {
        status,
        checkIn: new Date().toISOString(),
      }, token);
      fetchTechDetails(selectedTech.id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleClockOut = async () => {
    if (!selectedTech) return;
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.technicians.logAttendance(selectedTech.id, {
        status: 'present',
        checkOut: new Date().toISOString(),
      }, token);
      fetchTechDetails(selectedTech.id);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Leave Form submit
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech || !startDate || !endDate || !leaveReason) return;
    setLeaveLoading(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.technicians.submitLeave(selectedTech.id, {
        startDate,
        endDate,
        reason: leaveReason,
      }, token);
      setIsLeaveModalOpen(false);
      setStartDate('');
      setEndDate('');
      setLeaveReason('');
      fetchTechDetails(selectedTech.id);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLeaveLoading(false);
    }
  };

  // Admin approves leave request
  const handleApproveLeave = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('tz_admin_token') || undefined;
      await api.technicians.approveLeave(leaveId, status, token);
      if (selectedTech) {
        fetchTechDetails(selectedTech.id);
      }
      fetchTechs();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-slate-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <UserCheck className="h-8 w-8 text-indigo-500" />
                Technician Diagnostics Workspace
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Monitor certifications, track active workloads, clock attendance, and manage staff leave schedules.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm font-semibold text-slate-400">Filter Staff Workloads:</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full md:w-64 px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-300 focus:outline-none"
            >
              <option value="">All Laboratories</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tech grid list */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-xl">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  <span className="text-slate-400 mt-2 text-sm font-medium">Fetching technician rosters...</span>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {technicians.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => fetchTechDetails(t.id)}
                      className={`bg-slate-900 border p-5 rounded-xl flex flex-col justify-between hover:border-indigo-500/60 cursor-pointer transition ${selectedTech?.id === t.id ? 'border-indigo-600 bg-indigo-950/10' : 'border-slate-800'}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-white">{t.firstName} {t.lastName}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{t.email}</p>
                            <p className="text-[11px] text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {t.branch?.name || 'Central Pool'}
                            </p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            t.isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {t.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>

                        {/* Certification & rating */}
                        <div className="flex items-center gap-3 mt-4 text-xs text-slate-300">
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" /> Tier {t.certificationLevel}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {t.rating.toFixed(2)}
                          </span>
                        </div>

                        {/* Skills pills */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {t.skills?.slice(0, 3).map((skill: string) => (
                            <span key={skill} className="text-[10px] bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded text-slate-400">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Workloads and average duration */}
                      <div className="border-t border-slate-850/60 mt-4 pt-3 flex justify-between text-xs text-slate-400">
                        <div>
                          Active Jobs: <span className="text-white font-bold">{t.workload}</span>
                        </div>
                        <div>
                          Avg Repair Time: <span className="text-white font-bold">{t.avgRepairTimeMinutes || '--'} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed right column profile */}
            <div>
              {selectedTech ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {selectedTech.firstName[0]}{selectedTech.lastName[0]}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedTech.firstName} {selectedTech.lastName}</h2>
                        <p className="text-xs text-indigo-400">Tier {selectedTech.certificationLevel} Certified Tech</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedTech(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Online/Offline & Availability toggles */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Live Workspace:</span>
                      <button 
                        onClick={() => handleToggleOnline(selectedTech)}
                        className={`flex items-center gap-2 text-xs font-bold ${selectedTech.isOnline ? 'text-emerald-400' : 'text-slate-400'}`}
                      >
                        {selectedTech.isOnline ? <ToggleRight className="h-6 w-6 text-emerald-500" /> : <ToggleLeft className="h-6 w-6 text-slate-600" />}
                        {selectedTech.isOnline ? 'Active Workspace' : 'Disconnected'}
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Job Availability:</span>
                      <button 
                        onClick={() => handleToggleAvailability(selectedTech)}
                        className={`flex items-center gap-2 text-xs font-bold ${selectedTech.availability ? 'text-indigo-400' : 'text-slate-400'}`}
                      >
                        {selectedTech.availability ? <ToggleRight className="h-6 w-6 text-indigo-500" /> : <ToggleLeft className="h-6 w-6 text-slate-600" />}
                        {selectedTech.availability ? 'Accepting Jobs' : 'Unavailable'}
                      </button>
                    </div>
                  </div>

                  {/* Clock In / Out action buttons */}
                  <div className="space-y-2 border-t border-slate-800 pt-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> Attendance Clock Action
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleClockInOut('present')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1"
                      >
                        Clock In
                      </button>
                      <button
                        onClick={() => handleClockInOut('late')}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1"
                      >
                        Clock In (LATE)
                      </button>
                      <button
                        onClick={handleClockOut}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1"
                      >
                        Clock Out
                      </button>
                    </div>
                  </div>

                  {/* Skills list */}
                  <div className="space-y-2 border-t border-slate-800 pt-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" /> Hardware Skills Certifications
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedTech.skills?.map((skill: string) => (
                        <span key={skill} className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Active Jobs */}
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Assigned Active Jobs ({selectedTech.activeJobs?.length || 0})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedTech.activeJobs?.map((job: any) => (
                        <div key={job.id} className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-white">{job.device.brand} {job.device.model}</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">SLA: {new Date(job.slaDeadline).toLocaleDateString()}</p>
                          </div>
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-bold text-[9px]">
                            {job.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leave Requests & approvals */}
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Leave Ledger logs
                      </h3>
                      <button
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold px-2 py-1 rounded border border-slate-750"
                      >
                        Apply Leave
                      </button>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedTech.leaveRequests?.map((leave: any) => (
                        <div key={leave.id} className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-300">
                              {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                              leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                              leave.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {leave.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-450 italic">&ldquo;{leave.reason}&rdquo;</p>

                          {/* Approval Actions */}
                          {leave.status === 'pending' && (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleApproveLeave(leave.id, 'approved')}
                                className="bg-emerald-600 text-[10px] text-white px-2 py-1 rounded font-bold flex items-center gap-0.5"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleApproveLeave(leave.id, 'rejected')}
                                className="bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 px-2 py-1 rounded font-bold border border-slate-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2 sticky top-6">
                  <UserCheck className="h-10 w-10 text-slate-600" />
                  <p className="text-sm">Select a technician from the grid to view performance dashboards, clock status, and approve leaves.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Submit Leave Application
              </h2>
              <button 
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="State the reason for leave..."
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-650 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  {leaveLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
      <NotificationCenter 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
}
