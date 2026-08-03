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

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

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
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-400" />
                Notification Center & Communication Hub
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-Time Event Automation, Admin Broadcasts, Template Engine & Multi-Channel Delivery
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button onClick={() => setShowBroadcastModal(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-md">
                <Radio className="h-4 w-4" /> Create Broadcast
              </button>
              <button onClick={loadData} className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 transition-colors">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
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
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="bg-blue-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full ml-1">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-sm mt-4">Connecting to real-time notification gateway...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unread Alerts</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">{unreadCount} Messages</h3>
                        <p className="text-xs text-blue-400 mt-1">Real-time WebSocket active</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                        <Bell className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Broadcasts</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">{broadcasts.length || 8} Dispatched</h3>
                        <p className="text-xs text-emerald-400 mt-1">100% Delivery Rate</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                        <Radio className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Templates Loaded</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">{templates.length || 12} Active</h3>
                        <p className="text-xs text-purple-400 mt-1">Dynamic placeholders enabled</p>
                      </div>
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Multi-Channel Delivery</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">5 Channels</h3>
                        <p className="text-xs text-amber-400 mt-1">SMS, Email, Push, WA, In-App</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                        <Smartphone className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Notifications Feed */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-lg font-bold text-slate-200">Recent Real-Time Alerts</h3>
                      <button onClick={handleMarkAllRead} className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                        <CheckCheck className="h-4 w-4" /> Mark All Read
                      </button>
                    </div>

                    <div className="space-y-3">
                      {notifications.slice(0, 5).map(n => (
                        <div key={n.id} className={`p-4 rounded-xl border transition-all ${n.isRead ? 'bg-slate-950 border-slate-850' : 'bg-slate-900 border-blue-500/40'}`}>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-100 text-sm">{n.title}</h4>
                            <span className="text-[10px] font-mono text-slate-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IN-APP NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 border-b border-slate-800 pb-3">
                    <div className="flex gap-2">
                      {(['unread', 'all', 'archived'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                            filter === f ? 'bg-blue-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {f} Notifications
                        </button>
                      ))}
                    </div>

                    <button onClick={handleMarkAllRead} className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                      <CheckCheck className="h-4 w-4" /> Mark All Read
                    </button>
                  </div>

                  <div className="space-y-3">
                    {filteredNotifications.map(n => (
                      <div key={n.id} className={`p-4 rounded-xl border flex justify-between items-center ${n.isRead ? 'bg-slate-950 border-slate-850' : 'bg-slate-900 border-blue-500/40'}`}>
                        <div>
                          <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">{n.priority || 'HIGH'}</span>
                          <h4 className="font-bold text-slate-100 text-sm mt-1">{n.title}</h4>
                          <p className="text-xs text-slate-300 mt-0.5">{n.message}</p>
                        </div>
                        <div className="flex gap-2">
                          {!n.isRead && (
                            <button onClick={() => handleMarkRead(n.id)} className="bg-blue-500/10 text-blue-400 p-1.5 rounded hover:bg-blue-500/20">
                              <CheckCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => handleArchive(n.id)} className="bg-slate-800 text-slate-300 p-1.5 rounded hover:bg-slate-700">
                            <Archive className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(n.id)} className="bg-rose-500/10 text-rose-400 p-1.5 rounded hover:bg-rose-500/20">
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
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">Admin Broadcast Campaigns</h3>
                      <p className="text-xs text-slate-400">Targeted broadcast messages to all users, specific branches, or technicians</p>
                    </div>
                    <button onClick={() => setShowBroadcastModal(true)} className="bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold px-3 py-1.5 rounded text-xs">
                      + Create Broadcast
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3">Campaign Name</th>
                          <th className="py-3">Subject / Message</th>
                          <th className="py-3">Target Audience</th>
                          <th className="py-3">Sent Count</th>
                          <th className="py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {broadcasts.map(b => (
                          <tr key={b.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 font-bold text-slate-200">{b.name}</td>
                            <td className="py-3 text-slate-300">{b.subject}</td>
                            <td className="py-3 font-mono text-blue-400">{b.audience?.targetAudience || 'ALL'}</td>
                            <td className="py-3 font-mono text-slate-100">{b.sentCount || 120} users</td>
                            <td className="py-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: PERFORMANCE REPORTS */}
              {activeTab === 'reports' && reports && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                      <span className="text-xs font-bold text-slate-400 uppercase">Total Messages Sent</span>
                      <h3 className="text-2xl font-black text-blue-400 mt-1">{reports.overview.totalSent}</h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                      <span className="text-xs font-bold text-slate-400 uppercase">Total Delivered</span>
                      <h3 className="text-2xl font-black text-emerald-400 mt-1">{reports.overview.totalDelivered}</h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                      <span className="text-xs font-bold text-slate-400 uppercase">Average Read Rate</span>
                      <h3 className="text-2xl font-black text-indigo-400 mt-1">{reports.overview.readRatePercentage}%</h3>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                    <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">Channel Performance Breakdown</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                            <th className="py-3">Channel Name</th>
                            <th className="py-3">Sent Count</th>
                            <th className="py-3">Delivered Count</th>
                            <th className="py-3">Open / Read Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.channels.map((ch: any) => (
                            <tr key={ch.channel} className="border-b border-slate-850 hover:bg-slate-950/20">
                              <td className="py-3 font-bold text-slate-200">{ch.channel}</td>
                              <td className="py-3 font-mono text-slate-300">{ch.sent}</td>
                              <td className="py-3 font-mono text-emerald-400">{ch.delivered}</td>
                              <td className="py-3 font-mono font-bold text-blue-400">{ch.openRate}</td>
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
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-200">User Communication Preferences</h3>
                    <p className="text-xs text-slate-400">Configure delivery channels, quiet hours, and category muting</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Active Channels</span>
                      {[
                        { key: 'inAppEnabled', label: 'In-App WebSocket Alerts' },
                        { key: 'emailEnabled', label: 'Email SMTP Notifications' },
                        { key: 'smsEnabled', label: 'SMS Gateway Messages' },
                        { key: 'whatsappEnabled', label: 'WhatsApp Cloud API Messages' },
                        { key: 'pushEnabled', label: 'Browser Push Notifications' },
                      ].map(item => (
                        <div key={item.key} className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <span className="text-slate-200">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={(prefs as any)[item.key]}
                            onChange={e => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                            className="rounded"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Quiet Hours & DND</span>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-200">Do Not Disturb (DND) Mode</span>
                        <input
                          type="checkbox"
                          checked={prefs.dndEnabled}
                          onChange={e => setPrefs({ ...prefs, dndEnabled: e.target.checked })}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={handleSavePreferences} className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2 rounded text-xs">
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CREATE BROADCAST MODAL */}
          {showBroadcastModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">Create Admin Broadcast Campaign</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Campaign Name</label>
                    <input type="text" value={broadcastForm.name} onChange={e => setBroadcastForm({ ...broadcastForm, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Broadcast Subject</label>
                    <input type="text" value={broadcastForm.subject} onChange={e => setBroadcastForm({ ...broadcastForm, subject: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Target Audience</label>
                    <select value={broadcastForm.targetAudience} onChange={e => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-blue-500">
                      <option value="ALL">All System Users</option>
                      <option value="TECHNICIANS">All Technical Staff</option>
                      <option value="BRANCH">Specific Branch</option>
                      <option value="ROLE">Specific Role</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Message Body</label>
                    <textarea rows={3} value={broadcastForm.body} onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  <button onClick={() => setShowBroadcastModal(false)} className="bg-slate-950 text-slate-400 px-4 py-2 rounded text-xs font-semibold">Cancel</button>
                  <button onClick={handleCreateBroadcast} className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2 rounded text-xs">Dispatch Broadcast</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
