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
  Send,
  Pin,
  PinOff,
  Eye,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  Edit,
  Copy,
  Archive,
  X,
  BellRing,
  Mail,
  MessageSquare,
  BarChart2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

// Inline EmptyState component using semantic tokens for Light/Dark theme consistency
const EmptyState = ({
  title,
  description,
  icon: Icon = FolderOpen,
  action
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card/40 border border-dashed border-border rounded-xl min-h-[280px]">
      <div className="p-4 bg-secondary/60 rounded-full text-muted-foreground mb-3.5 border border-border/50">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default function AdminAnnouncementsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [targetFilter, setTargetFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [showReceiptsModal, setShowReceiptsModal] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    targetType: 'ALL' as 'ALL' | 'BRANCH' | 'ROLE' | 'DEPARTMENT',
    targetValue: '',
    scheduledFor: '',
    expiryDate: '',
    attachmentUrl: '',
    isPinned: false,
    sendPush: true,
    sendEmail: false,
    sendSms: false
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.announcements.fetchAnnouncements(token);
      if (res.success) setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSaveAnnouncement = async () => {
    if (!form.title.trim()) return alert('Announcement title is required.');
    if (!form.content.trim()) return alert('Announcement content body is required.');
    try {
      if (editingAnnouncement) {
        await api.announcements.updateAnnouncement(editingAnnouncement.id, {
          ...editingAnnouncement,
          title: form.title,
          content: form.content,
          category: form.category,
          priority: form.priority,
          status: form.status,
          targetType: form.targetType,
          targetValue: form.targetValue,
          scheduledFor: form.scheduledFor || null,
          expiryDate: form.expiryDate || null,
          attachmentUrl: form.attachmentUrl,
          isPinned: form.isPinned
        }, token);
      } else {
        await api.announcements.createAnnouncement(form, token);
      }
      setShowCreateModal(false);
      setEditingAnnouncement(null);
      resetForm();
      loadAnnouncements();
    } catch (err) {
      alert('Error saving announcement broadcast.');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      category: 'GENERAL',
      priority: 'MEDIUM',
      status: 'PUBLISHED',
      targetType: 'ALL',
      targetValue: '',
      scheduledFor: '',
      expiryDate: '',
      attachmentUrl: '',
      isPinned: false,
      sendPush: true,
      sendEmail: false,
      sendSms: false
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broadcast announcement?')) return;
    try {
      await api.announcements.deleteAnnouncement(id, token);
      loadAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement.');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await api.announcements.togglePin(id, token);
      loadAnnouncements();
    } catch (err) {
      console.error('Failed to toggle pin state:', err);
    }
  };

  const handleDuplicate = async (ann: any) => {
    try {
      await api.announcements.createAnnouncement({
        ...ann,
        title: `Copy of ${ann.title}`,
        createdAt: new Date().toISOString()
      }, token);
      loadAnnouncements();
    } catch (err) {
      alert('Failed to duplicate announcement.');
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'BRANCH': return Building;
      case 'ROLE': return Shield;
      case 'DEPARTMENT': return Layers;
      default: return Users;
    }
  };

  const getPriorityColor = (p: string) => {
    switch ((p || '').toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500/15 text-red-500 border-red-500/25';
      case 'HIGH': return 'bg-amber-500/15 text-amber-500 border-amber-500/25';
      case 'MEDIUM': return 'bg-blue-500/15 text-blue-500 border-blue-500/25';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch ((cat || '').toUpperCase()) {
      case 'EMERGENCY_ALERT': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'SYSTEM_MAINTENANCE': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'POLICY_UPDATE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  // Filter Announcements
  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch = !searchTerm || ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) || ann.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || (ann.category || 'GENERAL') === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || (ann.status || 'PUBLISHED') === statusFilter;
    const matchesTarget = targetFilter === 'ALL' || (ann.targetType || 'ALL') === targetFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesTarget;
  });

  // Calculate Metrics
  const totalBroadcasts = announcements.length;
  const pinnedCount = announcements.filter((a) => a.isPinned).length;
  const scheduledCount = announcements.filter((a) => a.status === 'SCHEDULED').length;
  const avgReadRate = announcements.length > 0 
    ? Math.round(announcements.reduce((acc, curr) => acc + ((curr.readCount || 0) / (curr.totalTargetCount || 1)), 0) / announcements.length * 100)
    : 0;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => {}}
          onOpenNotifications={() => {}}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-4 gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                <Megaphone className="text-primary h-6 w-6" />
                Broadcast Announcement Center
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send messages, technical SOP policy updates, and official notifications to technicians, managers, specific branches, or everyone.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                resetForm();
                setShowCreateModal(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow shrink-0 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" /> Create Broadcast
            </button>
          </div>

          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-xs">
            <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Broadcasts</span>
              <div className="text-xl font-black text-foreground">{totalBroadcasts}</div>
            </div>
            <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <Pin className="h-3 w-3" /> Pinned Alerts
              </span>
              <div className="text-xl font-black text-foreground">{pinnedCount}</div>
            </div>
            <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Scheduled
              </span>
              <div className="text-xl font-black text-foreground">{scheduledCount}</div>
            </div>
            <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Avg Read Rate
              </span>
              <div className="text-xl font-black text-foreground">{avgReadRate}%</div>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card border border-border/60 p-3.5 rounded-xl shadow-sm text-xs">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search announcements..."
                className="w-full bg-secondary border border-border pl-8 pr-3 py-2 rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg font-bold text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="ALL">All Categories</option>
                <option value="GENERAL">General</option>
                <option value="SYSTEM_MAINTENANCE">Maintenance</option>
                <option value="POLICY_UPDATE">Policy Updates</option>
                <option value="EMERGENCY_ALERT">Emergency</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg font-bold text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg font-bold text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="ALL">All Audiences</option>
                <option value="ALL">Everyone</option>
                <option value="BRANCH">Specific Branch</option>
                <option value="ROLE">Specific Role</option>
              </select>
            </div>
          </div>

          {/* Announcements Feed List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground mt-3 font-semibold">Loading broadcast announcements...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <EmptyState
              title="No Broadcast Announcements Found"
              description="No announcements match your search criteria. Broadcast a new update or modify search filters."
              icon={Megaphone}
              action={
                <button
                  onClick={() => {
                    setEditingAnnouncement(null);
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg"
                >
                  + Create Broadcast
                </button>
              }
            />
          ) : (
            <div className="space-y-4 max-w-5xl">
              {filteredAnnouncements.map((ann) => {
                const Icon = getTargetIcon(ann.targetType);
                const readPercentage = Math.round(((ann.readCount || 0) / (ann.totalTargetCount || 1)) * 100);

                return (
                  <div 
                    key={ann.id} 
                    className={`bg-card border rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-all hover:border-primary/40 ${
                      ann.isPinned ? 'border-amber-500/40 bg-card' : 'border-border/60'
                    }`}
                  >
                    {/* Top Status Bar & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {ann.isPinned && (
                          <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Pin className="h-3 w-3 fill-amber-500" /> Pinned
                          </span>
                        )}
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getCategoryColor(ann.category)}`}>
                          {(ann.category || 'GENERAL').replace('_', ' ')}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getPriorityColor(ann.priority)}`}>
                          {ann.priority || 'MEDIUM'}
                        </span>
                        <span className="text-[9px] font-bold uppercase border border-border px-2 py-0.5 rounded-full text-muted-foreground bg-secondary/50">
                          {ann.status || 'PUBLISHED'}
                        </span>
                      </div>

                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(ann.createdAt).toLocaleDateString()} {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-2">
                      <h3 className="text-base font-black text-foreground">{ann.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                    </div>

                    {/* Attachments preview if available */}
                    {ann.attachmentUrl && (
                      <div className="inline-flex items-center gap-2 bg-secondary/60 border border-border px-3 py-1.5 rounded-lg text-xs font-semibold text-primary">
                        <Paperclip className="h-3.5 w-3.5" />
                        <a href={ann.attachmentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          View Attached Reference <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {/* Bottom Metadata & Action Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-border/50 gap-3 text-xs">
                      {/* Target Audience & Read receipts rate */}
                      <div className="flex items-center gap-4 text-muted-foreground font-bold">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[11px]">{ann.targetType === 'ALL' ? 'Everyone (All Staff)' : `${ann.targetType}: ${ann.targetValue || 'N/A'}`}</span>
                        </div>
                        <button
                          onClick={() => setShowReceiptsModal(ann)}
                          className="flex items-center gap-1.5 hover:text-foreground text-[11px]"
                        >
                          <Eye className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{ann.readCount || 0}/{ann.totalTargetCount || 35} Read ({readPercentage}%)</span>
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTogglePin(ann.id)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                            ann.isPinned ? 'border-amber-500/40 text-amber-500 bg-amber-500/10' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                          }`}
                          title={ann.isPinned ? 'Unpin' : 'Pin to top'}
                        >
                          {ann.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDuplicate(ann)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                          title="Duplicate Broadcast"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingAnnouncement(ann);
                            setForm({
                              title: ann.title || '',
                              content: ann.content || '',
                              category: ann.category || 'GENERAL',
                              priority: ann.priority || 'MEDIUM',
                              status: ann.status || 'PUBLISHED',
                              targetType: ann.targetType || 'ALL',
                              targetValue: ann.targetValue || '',
                              scheduledFor: ann.scheduledFor || '',
                              expiryDate: ann.expiryDate || '',
                              attachmentUrl: ann.attachmentUrl || '',
                              isPinned: ann.isPinned || false,
                              sendPush: true,
                              sendEmail: false,
                              sendSms: false
                            });
                            setShowCreateModal(true);
                          }}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                          title="Edit Broadcast"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
                          title="Delete Broadcast"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Broadcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-xl w-full p-6 space-y-4 text-xs max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-lg font-black tracking-tight text-foreground">{editingAnnouncement ? 'Edit Broadcast Announcement' : 'Create Broadcast Announcement'}</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Announcement Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Eid Holiday Hours / SOP Safety Protocols"
                className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Broadcast Content (Markdown & Detailed Text)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write the full announcement details, instructions or SOP guidelines..."
                className="w-full bg-secondary border border-border p-2.5 rounded-lg h-28 text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                >
                  <option value="GENERAL">General Notice</option>
                  <option value="SYSTEM_MAINTENANCE">Maintenance</option>
                  <option value="POLICY_UPDATE">Policy Update</option>
                  <option value="EMERGENCY_ALERT">Emergency Alert</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Alert</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                >
                  <option value="PUBLISHED">Publish Immediately</option>
                  <option value="DRAFT">Save Draft</option>
                  <option value="SCHEDULED">Schedule Broadcast</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Target Audience</label>
                <select
                  value={form.targetType}
                  onChange={(e) => setForm({ ...form, targetType: e.target.value as any })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                >
                  <option value="ALL">Everyone (All Staff)</option>
                  <option value="BRANCH">Specific Branch</option>
                  <option value="ROLE">Specific Role</option>
                  <option value="DEPARTMENT">Specific Department</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Target Name / Value</label>
                <input
                  type="text"
                  value={form.targetValue}
                  onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                  placeholder="e.g. Dhanmondi Lab or TECHNICIAN"
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Schedule Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={form.scheduledFor}
                  onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Expiry Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Attachment Link / PDF URL</label>
              <input
                type="text"
                value={form.attachmentUrl}
                onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })}
                placeholder="https://example.com/document.pdf"
                className="w-full bg-secondary border border-border p-2 rounded-lg text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* Notification & Options Checkboxes */}
            <div className="bg-secondary/40 border border-border/60 p-3 rounded-lg space-y-2 text-foreground font-semibold">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Notification Channels</div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sendPush}
                    onChange={(e) => setForm({ ...form, sendPush: e.target.checked })}
                    className="accent-primary"
                  />
                  <BellRing className="h-3.5 w-3.5 text-primary" /> Push Notification
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sendEmail}
                    onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
                    className="accent-primary"
                  />
                  <Mail className="h-3.5 w-3.5 text-blue-500" /> Email Alert
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="accent-primary"
                  />
                  <Pin className="h-3.5 w-3.5 text-amber-500" /> Pin Announcement
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnnouncement}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Send className="h-4 w-4" /> {editingAnnouncement ? 'Save Changes' : 'Broadcast Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read Receipts Modal */}
      {showReceiptsModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-base font-black tracking-tight text-foreground">Read Receipts Log</h2>
              <button onClick={() => setShowReceiptsModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Read log for: <strong className="text-foreground">{showReceiptsModal.title}</strong>
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-lg">
                <span className="font-bold text-foreground">Zahid Hasan (Lead Tech)</span>
                <span className="text-[10px] text-muted-foreground">Today at 10:14 AM</span>
              </div>
              <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-lg">
                <span className="font-bold text-foreground">Marcus Aurelius (Manager)</span>
                <span className="text-[10px] text-muted-foreground">Yesterday at 4:30 PM</span>
              </div>
              <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-lg">
                <span className="font-bold text-foreground">Rafiqul Islam (Micro-soldering Tech)</span>
                <span className="text-[10px] text-muted-foreground">Yesterday at 5:12 PM</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setShowReceiptsModal(null)}
                className="bg-primary text-primary-foreground text-xs font-bold px-3.5 py-1.5 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
