'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Clock,
  Heart,
  DollarSign,
  Coffee,
  HelpCircle,
  Sliders
} from 'lucide-react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { api } from '@/lib/api';

export default function LeaveRequestsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');

  // Rejection Reason Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadRequests();
  }, [selectedUser]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.hrms.fetchLeaveRequests(selectedUser || undefined, token);
      if (res.success) setRequests(res.data);

      const contactsRes = await api.chat.fetchContacts(token);
      if (contactsRes.success) setContacts(contactsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    await api.hrms.approveLeave(id, 'approved', undefined, token);
    loadRequests();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    await api.hrms.approveLeave(rejectingId, 'rejected', rejectionReason, token);
    setShowRejectModal(false);
    setRejectionReason('');
    setRejectingId('');
    loadRequests();
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SICK': return Heart;
      case 'UNPAID': return DollarSign;
      default: return Coffee;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
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
                <Calendar className="text-primary h-6 w-6" />
                Leave Workflow Tracker
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track employee leave allowances and process vacation/sick leave approval requests.
              </p>
            </div>
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
            </div>
          </div>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-muted-foreground bg-card border border-border/60 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                <Calendar className="h-8 w-8 text-muted-foreground/60" />
                No leave requests found.
              </div>
            ) : (
              requests.map((req) => {
                const Icon = getLeaveTypeIcon(req.leaveType);
                return (
                  <div key={req.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-primary/20 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase border px-2 py-0.5 rounded bg-primary/10 text-primary border-primary/20 font-black tracking-wide flex items-center gap-1">
                          <Icon className="h-3 w-3" /> {req.leaveType}
                        </span>
                        <span className={`text-[9px] uppercase border px-2 py-0.5 rounded font-black tracking-wide ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Leave requested by {req.user?.firstName} {req.user?.lastName}</h3>
                      
                      <div className="bg-secondary/20 border border-border/60 rounded-lg p-2.5 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Period:</span>
                          <strong className="text-foreground">{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</strong>
                        </div>
                        <div className="text-muted-foreground pt-1.5 border-t border-border/60">
                          Reason: <span className="text-foreground">{req.reason}</span>
                        </div>
                        {req.rejectionReason && (
                          <div className="text-red-500 font-bold pt-1.5 border-t border-border/60">
                            Rejection Reason: <span className="text-red-500 font-semibold">{req.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs py-2 rounded-lg"
                        >
                          Approve Request
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(req.id);
                            setShowRejectModal(true);
                          }}
                          className="flex-1 border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/15 font-black text-xs py-2 rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* Reject Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-sm w-full p-6 space-y-4 text-xs">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-1">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Enter Rejection Reason
            </h2>
            <p className="text-xs text-muted-foreground">Please document why this leave request is being denied.</p>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Understaffed on these dates / busy period"
              className="w-full bg-secondary border border-border p-2 rounded-lg"
            />
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId('');
                  setRejectionReason('');
                }}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Deny Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
