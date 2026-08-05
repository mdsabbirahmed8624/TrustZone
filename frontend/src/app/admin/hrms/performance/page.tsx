'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  Sliders,
  TrendingUp,
  FileText,
  Star,
  ChevronRight
} from 'lucide-react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { api } from '@/lib/api';

export default function PerformanceReviewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  
  // Selected User to view
  const [selectedUser, setSelectedUser] = useState('');

  // Modals & Review Form
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    rating: 5,
    speed: 5,
    quality: 5,
    achievements: '',
    warnings: '',
    comments: ''
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadReviews();
    }
  }, [selectedUser]);

  const loadContacts = async () => {
    const res = await api.chat.fetchContacts(token);
    if (res.success) {
      setContacts(res.data);
      if (res.data.length > 0) setSelectedUser(res.data[0].id);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    const res = await api.hrms.fetchPerformanceReviews(selectedUser, token);
    if (res.success) setReviews(res.data);
    setLoading(false);
  };

  const handleSaveReview = async () => {
    try {
      const payload = {
        userId: form.userId,
        rating: Number(form.rating),
        kpis: { speed: Number(form.speed), quality: Number(form.quality) },
        achievements: form.achievements,
        warnings: form.warnings,
        comments: form.comments
      };

      await api.hrms.submitPerformanceReview(payload, token);
      setShowReviewModal(false);
      setForm({ userId: '', rating: 5, speed: 5, quality: 5, achievements: '', warnings: '', comments: '' });
      loadReviews();
      alert('Performance review saved successfully.');
    } catch (err) {
      alert('Error saving review.');
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
                <Award className="text-primary h-6 w-6" />
                Performance KPI Reviews
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluate technician efficiency, speed, repair quality index, warnings logs, and achievements milestones.
              </p>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus className="h-4 w-4" /> Create Scorecard Entry
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar: Staff list */}
            <div className="bg-card border border-border/60 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Employee</h2>
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedUser(c.id)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-all ${
                      selectedUser === c.id 
                        ? 'bg-primary/10 border border-primary/20 text-primary font-bold' 
                        : 'hover:bg-secondary border border-transparent text-muted-foreground'
                    }`}
                  >
                    <span className="text-xs">{c.firstName} {c.lastName}</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Panel: Review Logs */}
            <div className="lg:col-span-3 space-y-6">
              {reviews.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground bg-card border border-border/60 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                  <Award className="h-8 w-8 text-muted-foreground/60" />
                  No performance reviews submitted for this employee.
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold">Review Date: {new Date(rev.reviewDate).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-black">Scorecard Rating:</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.round(rev.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-primary">{Number(rev.rating).toFixed(1)}/5.0</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* KPIs */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-foreground">KPI Scorecard Indexes</h4>
                        <div className="space-y-2 text-[11px] font-semibold text-muted-foreground">
                          <div className="flex justify-between items-center bg-secondary/20 p-2 border border-border/40 rounded-lg">
                            <span>Repair Speed Metric:</span>
                            <strong className="text-foreground">{rev.kpis?.speed || 5}/5</strong>
                          </div>
                          <div className="flex justify-between items-center bg-secondary/20 p-2 border border-border/40 rounded-lg">
                            <span>Quality & ESD Compliance:</span>
                            <strong className="text-foreground">{rev.kpis?.quality || 5}/5</strong>
                          </div>
                        </div>
                      </div>

                      {/* Achievements / Warnings */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-foreground">Operational Remarks</h4>
                        {rev.achievements && (
                          <div className="bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg p-2 text-[11px] font-semibold">
                            🏆 Achievements: <span className="font-medium text-foreground">{rev.achievements}</span>
                          </div>
                        )}
                        {rev.warnings && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-2 text-[11px] font-semibold">
                            ⚠️ Warning Logs: <span className="font-medium text-foreground">{rev.warnings}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-secondary/10 border border-border/60 rounded-lg p-3 text-[11px]">
                      <strong>Reviewer Comments:</strong>
                      <p className="text-muted-foreground mt-1 leading-relaxed">{rev.comments}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4 text-xs font-semibold">
            <h2 className="text-lg font-black tracking-tight">New Performance Entry</h2>

            <div className="space-y-1">
              <label className="font-bold">Select Employee</label>
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="">Select Employee</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Overall Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Speed KPI (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={form.speed}
                  onChange={(e) => setForm({ ...form, speed: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Quality KPI (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={form.quality}
                  onChange={(e) => setForm({ ...form, quality: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Achievements / Milestone wins</label>
              <input
                type="text"
                value={form.achievements}
                onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                placeholder="e.g. Cleared backlogged diagnostic tasks / zero errors"
                className="w-full bg-secondary border border-border p-2 rounded-lg font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Warning / Compliance alerts</label>
              <input
                type="text"
                value={form.warnings}
                onChange={(e) => setForm({ ...form, warnings: e.target.value })}
                placeholder="e.g. Left ESD grounding strap disconnected once"
                className="w-full bg-secondary border border-border p-2 rounded-lg font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Reviewer Evaluation Comments</label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                className="w-full bg-secondary border border-border p-2.5 rounded-lg font-medium h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowReviewModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg shadow"
              >
                Save Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
