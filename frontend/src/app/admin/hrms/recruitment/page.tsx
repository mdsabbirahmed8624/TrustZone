'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileText,
  Mail,
  PhoneCall,
  Sliders
} from 'lucide-react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { api } from '@/lib/api';

export default function RecruitmentManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  // Modals & Forms
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Operations',
    description: ''
  });

  const [appForm, setAppForm] = useState({
    jobOpeningId: '',
    name: '',
    email: '',
    phone: '',
    resumeUrl: ''
  });

  const [statusForm, setStatusForm] = useState({
    applicantId: '',
    status: 'APPLIED',
    interviewSchedule: '',
    interviewNotes: ''
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const res = await api.hrms.fetchJobOpenings(token);
    if (res.success) {
      setJobs(res.data);
      if (res.data.length > 0 && !selectedJobId) {
        setSelectedJobId(res.data[0].id);
      }
    }
    setLoading(false);
  };

  const handleCreateJob = async () => {
    try {
      await api.hrms.createJobOpening(jobForm, token);
      setShowJobModal(false);
      setJobForm({ title: '', department: 'Operations', description: '' });
      loadJobs();
      alert('Job opening created successfully.');
    } catch (err) {
      alert('Error creating job.');
    }
  };

  const handleAddApplicant = async () => {
    try {
      await api.hrms.createJobApplicant({ ...appForm, jobOpeningId: selectedJobId }, token);
      setShowApplicantModal(false);
      setAppForm({ jobOpeningId: '', name: '', email: '', phone: '', resumeUrl: '' });
      loadJobs();
      alert('Job applicant profile added successfully.');
    } catch (err) {
      alert('Error adding applicant.');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await api.hrms.updateApplicantStatus(statusForm.applicantId, statusForm, token);
      setShowStatusModal(false);
      loadJobs();
      alert('Applicant pipeline status updated successfully.');
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HIRED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'INTERVIEWED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
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
                <Briefcase className="text-primary h-6 w-6" />
                Applicant Pipeline Tracker
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage recruitment campaigns, schedule technical interviews, and track candidate pipeline statuses.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowJobModal(true)}
                className="border border-border bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" /> Post Job Opening
              </button>
              <button
                onClick={() => setShowApplicantModal(true)}
                disabled={!selectedJobId}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Add Applicant Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left side: Job list */}
            <div className="bg-card border border-border/60 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campaign Openings</h2>
              <div className="space-y-1.5">
                {jobs.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => setSelectedJobId(j.id)}
                    className={`w-full text-left p-2.5 rounded-lg flex flex-col gap-1 transition-all ${
                      selectedJobId === j.id
                        ? 'bg-primary/10 border border-primary/20 text-primary font-bold'
                        : 'hover:bg-secondary border border-transparent text-muted-foreground font-semibold'
                    }`}
                  >
                    <span className="text-xs text-foreground">{j.title}</span>
                    <span className="text-[9px] uppercase text-muted-foreground">{j.department}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right side: Applicants table */}
            <div className="lg:col-span-3 space-y-4">
              {selectedJob && (
                <div className="bg-card border border-border/60 p-4 rounded-xl space-y-1">
                  <h3 className="text-sm font-black">{selectedJob.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedJob.description}</p>
                </div>
              )}

              <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-secondary/40 border-b border-border/60 font-bold">
                    <tr>
                      <th className="p-3">Applicant</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Pipeline Status</th>
                      <th className="p-3">Interview Schedule</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-card">
                    {!selectedJob || !selectedJob.applicants || selectedJob.applicants.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">No applicant profiles submitted for this position.</td>
                      </tr>
                    ) : (
                      selectedJob.applicants.map((app: any) => (
                        <tr key={app.id} className="hover:bg-secondary/15 transition-all">
                          <td className="p-3 font-bold">{app.name}</td>
                          <td className="p-3 text-muted-foreground font-semibold">
                            <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {app.email}</div>
                            <div className="flex items-center gap-1 mt-0.5"><PhoneCall className="h-3.5 w-3.5" /> {app.phone}</div>
                          </td>
                          <td className="p-3">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground font-semibold flex items-center gap-1 pt-4">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {app.interviewSchedule ? new Date(app.interviewSchedule).toLocaleString() : 'Not Scheduled'}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                setStatusForm({
                                  applicantId: app.id,
                                  status: app.status,
                                  interviewSchedule: app.interviewSchedule?.split('.')[0] || '',
                                  interviewNotes: app.interviewNotes || ''
                                });
                                setShowStatusModal(true);
                              }}
                              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-2.5 py-1 rounded text-[10px] shadow"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 1. Job Opening Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-sm w-full p-6 space-y-4 text-xs font-semibold">
            <h2 className="text-lg font-black tracking-tight">Create Job Opening</h2>

            <div className="space-y-1">
              <label className="font-bold">Job Title</label>
              <input
                type="text"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                placeholder="e.g. Lead Technician"
                className="w-full bg-secondary border border-border p-2 rounded-lg font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Department</label>
              <select
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="Operations">Operations</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Finance">Finance</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Job Description</label>
              <textarea
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className="w-full bg-secondary border border-border p-2.5 rounded-lg font-medium h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowJobModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Publish Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Applicant Modal */}
      {showApplicantModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-sm w-full p-6 space-y-4 text-xs font-semibold">
            <h2 className="text-lg font-black tracking-tight">Add Applicant Profile</h2>

            <div className="space-y-1">
              <label className="font-bold">Full Name</label>
              <input
                type="text"
                value={appForm.name}
                onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full bg-secondary border border-border p-2 rounded-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Email Address</label>
                <input
                  type="email"
                  value={appForm.email}
                  onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full bg-secondary border border-border p-2 rounded-lg font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Phone Number</label>
                <input
                  type="text"
                  value={appForm.phone}
                  onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                  placeholder="01712345678"
                  className="w-full bg-secondary border border-border p-2 rounded-lg font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Resume URL Link</label>
              <input
                type="text"
                value={appForm.resumeUrl}
                onChange={(e) => setAppForm({ ...appForm, resumeUrl: e.target.value })}
                placeholder="https://drive.google.com/resume.pdf"
                className="w-full bg-secondary border border-border p-2 rounded-lg font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowApplicantModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddApplicant}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Save Applicant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Update Applicant Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-sm w-full p-6 space-y-4 text-xs font-semibold">
            <h2 className="text-lg font-black tracking-tight">Update Pipeline Status</h2>

            <div className="space-y-1">
              <label className="font-bold">Status Stage</label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEWED">Interview Scheduled / Done</option>
                <option value="OFFER_EXTENDED">Offer Letter Extended</option>
                <option value="HIRED">Hired (Register Employee)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Interview Date-Time</label>
              <input
                type="datetime-local"
                value={statusForm.interviewSchedule}
                onChange={(e) => setStatusForm({ ...statusForm, interviewSchedule: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Interview Evaluator Notes</label>
              <textarea
                value={statusForm.interviewNotes}
                onChange={(e) => setStatusForm({ ...statusForm, interviewNotes: e.target.value })}
                className="w-full bg-secondary border border-border p-2.5 rounded-lg font-medium h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowStatusModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
