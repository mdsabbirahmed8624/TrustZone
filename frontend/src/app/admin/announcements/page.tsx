'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Users,
  Building,
  Shield,
  Clock,
  Sparkles,
  Calendar,
  Send
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

export default function AdminAnnouncementsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Create Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    targetType: 'ALL' as 'ALL' | 'BRANCH' | 'ROLE',
    targetValue: '',
    scheduledFor: ''
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.announcements.fetchAnnouncements(token);
      if (res.success) setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async () => {
    try {
      await api.announcements.createAnnouncement(form, token);
      setShowCreateModal(false);
      setForm({ title: '', content: '', targetType: 'ALL', targetValue: '', scheduledFor: '' });
      loadAnnouncements();
    } catch (err) {
      alert('Error creating announcement');
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'BRANCH': return Building;
      case 'ROLE': return Shield;
      default: return Users;
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
                <Megaphone className="text-primary h-6 w-6" />
                Broadcast Announcement Center
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send messages and official notifications to technicians, managers, specific branches, or everyone.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus className="h-4 w-4" /> Create Broadcast
            </button>
          </div>

          {/* Broadcasts timeline */}
          <div className="space-y-6 max-w-4xl">
            {announcements.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground bg-card border border-border/60 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                <Megaphone className="h-8 w-8 text-muted-foreground/60" />
                No announcements broadcasted yet.
              </div>
            ) : (
              announcements.map((ann) => {
                const Icon = getTargetIcon(ann.targetType);
                return (
                  <div key={ann.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                    {/* Left indicator strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-semibold uppercase tracking-wide">Target Audience</span>
                          <span className="text-foreground">{ann.targetType === 'ALL' ? 'Everyone' : `${ann.targetType}: ${ann.targetValue || 'N/A'}`}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-foreground pt-1">{ann.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* Broadcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h2 className="text-lg font-black tracking-tight">Create Broadcast Announcement</h2>

            <div className="space-y-1">
              <label className="font-bold">Announcement Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Eid closing hours/Server migration"
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Broadcast Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write the details, instructions or announcement messages..."
                className="w-full bg-secondary border border-border p-2 rounded-lg h-24"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Target Audience</label>
                <select
                  value={form.targetType}
                  onChange={(e) => setForm({ ...form, targetType: e.target.value as any })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                >
                  <option value="ALL">Everyone</option>
                  <option value="BRANCH">Specific Branch</option>
                  <option value="ROLE">Specific Employee Role</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold">Target Value (Optional)</label>
                <input
                  type="text"
                  value={form.targetValue}
                  onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                  placeholder="e.g. branch-1 or TECHNICIAN"
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Schedule Broadcast Date & Time (Leave blank for immediate)</label>
              <input
                type="datetime-local"
                value={form.scheduledFor}
                onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow"
              >
                <Send className="h-4 w-4" /> Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
