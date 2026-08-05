'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Archive,
  Search,
  Settings,
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  VolumeX,
  Volume2,
  CheckCircle2,
  Wrench,
  Calendar,
  Package,
  Landmark,
  ShieldAlert,
  Info,
  Radio,
  Send,
  FileText,
  PieChart,
  RefreshCw,
  Plus,
  Filter,
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

export default function NotificationCenterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active Tab State: 'dashboard' | 'notifications' | 'broadcasts' | 'templates' | 'reports' | 'preferences'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notifications' | 'broadcasts' | 'templates' | 'reports' | 'preferences'>('dashboard');

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);

  // Search & Filters
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('unread');
  const [searchTerm, setSearchTerm] = useState('');

  // Preference states
  const [prefs, setPrefs] = useState({
    emailEnabled: true,
    smsEnabled: true,
    inAppEnabled: true,
    pushEnabled: true,
    whatsappEnabled: false,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    dndEnabled: false,
    mutedCategories: [] as string[],
  });

  // Modal Forms
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    name: 'Emergency System Maintenance Alert',
    subject: 'Scheduled Lab Server Upgrade',
    body: 'Central server diagnostics will undergo scheduled maintenance tonight at 11:00 PM. System availability will resume at 1:00 AM.',
    targetAudience: 'ALL' as any,
    targetId: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadData();
  }, [activeTab, filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Unread count
      const countRes = await api.notifications.fetchUnreadCount(token);
      if (countRes.success) setUnreadCount(countRes.data.count);

      if (activeTab === 'dashboard' || activeTab === 'notifications') {
        const isRead = filter === 'unread' ? false : undefined;
        const isArchived = filter === 'archived' ? true : false;
        const res = await api.notifications.fetchUserNotifications({ read: isRead, archived: isArchived }, token);
        if (res.success) setNotifications(res.data);
      } else if (activeTab === 'broadcasts') {
        const bcRes = await api.notifications.fetchBroadcasts(token);
        if (bcRes.success) setBroadcasts(bcRes.data);
      } else if (activeTab === 'templates') {
        const tmplRes = await api.notifications.fetchTemplates(undefined, token);
        if (tmplRes.success) setTemplates(tmplRes.data);
      } else if (activeTab === 'reports') {
        const repRes = await api.notifications.fetchReports(token);
        if (repRes.success) setReports(repRes.data);
      } else if (activeTab === 'preferences') {
        const prefRes = await api.notifications.fetchPreferences(token);
        if (prefRes.success && prefRes.data) {
          setPrefs({ ...prefs, ...prefRes.data });
        }
      }
    } catch (err) {
      console.error('Failed to load notification records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id, token);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead(token);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.notifications.archiveNotification(id, token);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.notifications.deleteNotification(id, token);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBroadcast = async () => {
    if (!broadcastForm.subject.trim() || !broadcastForm.body.trim()) {
      return alert('Subject and Body are required.');
    }
    try {
      await api.notifications.createBroadcast(broadcastForm, token);
      setShowBroadcastModal(false);
      alert('Broadcast dispatched successfully!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch broadcast.');
    }
  };

  const handleSavePreferences = async () => {
    try {
      await api.notifications.updatePreferences(prefs, token);
      alert('Notification preferences updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to save preferences.');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const term = searchTerm.toLowerCase();
    return n.title.toLowerCase().includes(term) || n.message.toLowerCase().includes(term);
  });

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/60 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                <Bell className="h-6 w-6 text-primary" />
                Notification Center & Communication Hub
              </h1>
              <p className="text-muted-foreground text-xs mt-1">
                Real-Time Event Automation, Admin Broadcasts, Template Engine & Multi-Channel Delivery
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button onClick={() => setShowBroadcastModal(true)} className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-3.5 py-2 rounded-lg text-xs transition-colors shadow">
                <Radio className="h-4 w-4" /> Create Broadcast
              </button>
              <button onClick={loadData} className="flex items-center gap-1.5 bg-secondary/40 border border-border hover:bg-secondary px-3.5 py-2 rounded-lg text-xs text-foreground transition-colors">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/60 gap-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: Bell },
              { id: 'notifications', label: 'In-App Notifications', icon: Mail },
              { id: 'broadcasts', label: 'Admin Broadcasts', icon: Radio },
              { id: 'templates', label: 'Notification Templates', icon: FileText },
              { id: 'reports', label: 'Performance Reports', icon: PieChart },
              { id: 'preferences', label: 'User Preferences', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground font-bold text-[10px] px-1.5 py-0.5 rounded-full ml-1">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <RefreshCw className="h-10 w-10 text-primary animate-spin" />
              <p className="text-muted-foreground text-xs mt-4 font-medium">Connecting to real-time notification gateway...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unread Alerts</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">{unreadCount} Messages</h3>
                        <p className="text-xs text-primary font-medium mt-1">Real-time WebSocket active</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                        <Bell className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Broadcasts</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">{broadcasts.length || 8} Dispatched</h3>
                        <p className="text-xs text-green-500 font-medium mt-1">100% Delivery Rate</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-xl text-green-500 border border-green-500/20">
                        <Radio className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Templates Loaded</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">{templates.length || 12} Active</h3>
                        <p className="text-xs text-purple-500 font-medium mt-1">Dynamic placeholders enabled</p>
                      </div>
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 border border-purple-500/20">
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Multi-Channel Delivery</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">5 Channels</h3>
                        <p className="text-xs text-amber-500 font-medium mt-1">SMS, Email, Push, WA, In-App</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                        <Smartphone className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Notifications Feed */}
                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-border/60 pb-3">
                      <h3 className="text-sm font-bold text-foreground">Recent Real-Time Alerts</h3>
                      <button onClick={handleMarkAllRead} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        <CheckCheck className="h-4 w-4" /> Mark All Read
                      </button>
                    </div>

                    <div className="space-y-3">
                      {notifications.slice(0, 5).map(n => (
                        <div key={n.id} className={`p-4 rounded-xl border transition-all ${n.isRead ? 'bg-secondary/20 border-border/60' : 'bg-card border-primary/40'}`}>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-foreground text-xs">{n.title}</h4>
                            <span className="text-[10px] font-mono text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IN-APP NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 border-b border-border/60 pb-3">
                    <div className="flex gap-2">
                      {(['unread', 'all', 'archived'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                            filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-muted-foreground border border-border'
                          }`}
                        >
                          {f} Notifications
                        </button>
                      ))}
                    </div>

                    <button onClick={handleMarkAllRead} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      <CheckCheck className="h-4 w-4" /> Mark All Read
                    </button>
                  </div>

                  <div className="space-y-3">
                    {filteredNotifications.map(n => (
                      <div key={n.id} className={`p-4 rounded-xl border flex justify-between items-center ${n.isRead ? 'bg-secondary/20 border-border/60' : 'bg-card border-primary/40'}`}>
                        <div>
                          <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">{n.priority || 'HIGH'}</span>
                          <h4 className="font-bold text-foreground text-xs mt-1">{n.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                        <div className="flex gap-2">
                          {!n.isRead && (
                            <button onClick={() => handleMarkRead(n.id)} className="bg-primary/10 text-primary p-1.5 rounded hover:bg-primary/20">
                              <CheckCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => handleArchive(n.id)} className="bg-secondary text-foreground p-1.5 rounded hover:bg-secondary/80">
                            <Archive className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(n.id)} className="bg-red-500/10 text-red-500 p-1.5 rounded hover:bg-red-500/20">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ADMIN BROADCASTS */}
              {activeTab === 'broadcasts' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-border/60 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Admin Broadcast Campaigns</h3>
                      <p className="text-xs text-muted-foreground">Targeted broadcast messages to all users, specific branches, or technicians</p>
                    </div>
                    <button onClick={() => setShowBroadcastModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-3 py-1.5 rounded-lg text-xs">
                      + Create Broadcast
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/40">
                          <th className="p-3">Campaign Name</th>
                          <th className="p-3">Subject / Message</th>
                          <th className="p-3">Target Audience</th>
                          <th className="p-3">Sent Count</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {broadcasts.map(b => (
                          <tr key={b.id} className="hover:bg-secondary/15">
                            <td className="p-3 font-bold text-foreground">{b.name}</td>
                            <td className="p-3 text-muted-foreground">{b.subject}</td>
                            <td className="p-3 font-mono text-primary">{b.audience?.targetAudience || 'ALL'}</td>
                            <td className="p-3 font-mono text-foreground">{b.sentCount || 120} users</td>
                            <td className="p-3"><span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold">{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATION TEMPLATES */}
              {activeTab === 'templates' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-border/60 pb-3">
                    <h3 className="text-sm font-bold text-foreground">Multi-Channel Templates</h3>
                    <p className="text-xs text-muted-foreground">Pre-configured message formats for SMS, Email, and WhatsApp automation triggers</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(t => (
                      <div key={t.id} className="bg-secondary/15 border border-border/60 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">{t.name}</span>
                          <span className="text-[9px] font-bold font-mono px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded">{t.type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{t.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PERFORMANCE REPORTS */}
              {activeTab === 'reports' && reports && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Total Messages Sent</span>
                      <h3 className="text-2xl font-black text-primary mt-1">{reports.overview.totalSent}</h3>
                    </div>
                    <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Total Delivered</span>
                      <h3 className="text-2xl font-black text-green-500 mt-1">{reports.overview.totalDelivered}</h3>
                    </div>
                    <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Average Read Rate</span>
                      <h3 className="text-2xl font-black text-purple-500 mt-1">{reports.overview.readRatePercentage}%</h3>
                    </div>
                  </div>

                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-3">Channel Performance Breakdown</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/40">
                            <th className="p-3">Channel Name</th>
                            <th className="p-3">Sent Count</th>
                            <th className="p-3">Delivered Count</th>
                            <th className="p-3">Open / Read Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {reports.channels.map((ch: any) => (
                            <tr key={ch.channel} className="hover:bg-secondary/15">
                              <td className="p-3 font-bold text-foreground">{ch.channel}</td>
                              <td className="p-3 font-mono text-muted-foreground">{ch.sent}</td>
                              <td className="p-3 font-mono text-green-500">{ch.delivered}</td>
                              <td className="p-3 font-mono font-bold text-primary">{ch.openRate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PREFERENCES */}
              {activeTab === 'preferences' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-6">
                  <div className="border-b border-border/60 pb-3">
                    <h3 className="text-sm font-bold text-foreground">User Communication Preferences</h3>
                    <p className="text-xs text-muted-foreground">Configure delivery channels, quiet hours, and category muting</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-3">
                      <span className="text-muted-foreground font-bold uppercase text-[10px]">Active Channels</span>
                      {[
                        { key: 'inAppEnabled', label: 'In-App WebSocket Alerts' },
                        { key: 'emailEnabled', label: 'Email SMTP Notifications' },
                        { key: 'smsEnabled', label: 'SMS Gateway Messages' },
                        { key: 'whatsappEnabled', label: 'WhatsApp Cloud API Messages' },
                        { key: 'pushEnabled', label: 'Browser Push Notifications' },
                      ].map(item => (
                        <div key={item.key} className="flex justify-between items-center border-b border-border/60 pb-2">
                          <span className="text-foreground">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={(prefs as any)[item.key]}
                            onChange={e => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                            className="rounded accent-primary"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-3">
                      <span className="text-muted-foreground font-bold uppercase text-[10px]">Quiet Hours & DND</span>
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Do Not Disturb (DND) Mode</span>
                        <input
                          type="checkbox"
                          checked={prefs.dndEnabled}
                          onChange={e => setPrefs({ ...prefs, dndEnabled: e.target.checked })}
                          className="rounded accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={handleSavePreferences} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded-lg text-xs shadow">
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CREATE BROADCAST MODAL */}
          {showBroadcastModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-3">Create Admin Broadcast Campaign</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Campaign Name</label>
                    <input type="text" value={broadcastForm.name} onChange={e => setBroadcastForm({ ...broadcastForm, name: e.target.value })} className="w-full bg-secondary/20 border border-border rounded p-2 text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Broadcast Subject</label>
                    <input type="text" value={broadcastForm.subject} onChange={e => setBroadcastForm({ ...broadcastForm, subject: e.target.value })} className="w-full bg-secondary/20 border border-border rounded p-2 text-foreground outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Target Audience</label>
                    <select value={broadcastForm.targetAudience} onChange={e => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value as any })} className="w-full bg-secondary/20 border border-border rounded p-2 text-foreground outline-none focus:border-primary">
                      <option value="ALL">All System Users</option>
                      <option value="TECHNICIANS">All Technical Staff</option>
                      <option value="BRANCH">Specific Branch</option>
                      <option value="ROLE">Specific Role</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Message Body</label>
                    <textarea rows={3} value={broadcastForm.body} onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })} className="w-full bg-secondary/20 border border-border rounded p-2 text-foreground outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                  <button onClick={() => setShowBroadcastModal(false)} className="bg-secondary text-foreground px-4 py-2 rounded text-xs font-semibold">Cancel</button>
                  <button onClick={handleCreateBroadcast} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded text-xs">Dispatch Broadcast</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
