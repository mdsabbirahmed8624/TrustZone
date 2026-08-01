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
  Info
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

export default function AdminNotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tabs: 'inbox' | 'preferences'
  const [activeTab, setActiveTab] = useState<'inbox' | 'preferences'>('inbox');

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
    mutedCategories: [] as string[]
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadData();
  }, [filter, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inbox') {
        const isRead = filter === 'unread' ? false : undefined;
        const isArchived = filter === 'archived' ? true : false;
        const res = await api.notifications.fetchNotifications({ read: isRead, archived: isArchived }, token);
        if (res.success) {
          // Perform client side search
          let list = res.data;
          if (searchTerm) {
            list = list.filter((n: any) =>
              n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              n.message.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          setNotifications(list);
        }
        const countRes = await api.notifications.getUnreadCount(token);
        if (countRes.success) setUnreadCount(countRes.data.count);
      } else if (activeTab === 'preferences') {
        const res = await api.notifications.getPreferences(token);
        if (res.success) setPrefs(res.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleMarkRead = async (id: string) => {
    await api.notifications.markRead(id, token);
    loadData();
  };

  const handleMarkAllRead = async () => {
    await api.notifications.markAllRead(token);
    loadData();
  };

  const handleArchive = async (id: string) => {
    await api.notifications.archiveNotification(id, token);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await api.notifications.deleteNotification(id, token);
    loadData();
  };

  const handleSavePrefs = async () => {
    setLoading(true);
    const res = await api.notifications.updatePreferences(prefs, token);
    if (res.success) {
      alert('Preferences saved successfully.');
    }
    setLoading(false);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'repair': return Wrench;
      case 'booking': return Calendar;
      case 'inventory': return Package;
      case 'finance': return Landmark;
      case 'system': return ShieldAlert;
      default: return Info;
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
                <Bell className="text-primary h-6 w-6" />
                Notification Center
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your system communications, in-app notifications inbox, and toggle channels preferences.
              </p>
            </div>
            {activeTab === 'inbox' && unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <CheckCheck className="h-4 w-4" /> Mark All as Read
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex border-b border-border/80">
            <button onClick={() => setActiveTab('inbox')} className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'inbox' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Notifications Inbox ({unreadCount})
            </button>
            <button onClick={() => setActiveTab('preferences')} className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all ${activeTab === 'preferences' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Delivery Preferences
            </button>
          </div>

          {activeTab === 'inbox' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border/60 p-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold w-full sm:w-auto">
                  <button onClick={() => setFilter('unread')} className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'unread' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}>
                    Unread
                  </button>
                  <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}>
                    All Logs
                  </button>
                  <button onClick={() => setFilter('archived')} className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'archived' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}>
                    Archived
                  </button>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search notifications..."
                    className="w-full bg-secondary border border-border pl-8 pr-3 py-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Notifications list */}
              <div className="divide-y divide-border/60 border border-border/60 bg-card rounded-xl shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground/60" />
                    All caught up! No notifications in this tab.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = getCategoryIcon(n.category);
                    return (
                      <div key={n.id} className={`p-4 flex gap-4 hover:bg-secondary/15 transition-all relative ${!n.isRead ? 'bg-primary/5' : ''}`}>
                        <div className={`h-8 w-8 rounded-full border border-border flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary'}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-foreground">{n.title}</h3>
                            <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed pr-8">{n.message}</p>
                          <div className="flex items-center gap-2.5 pt-1.5">
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                className="text-[10px] text-primary hover:underline font-extrabold flex items-center gap-1"
                              >
                                Mark Read
                              </button>
                            )}
                            {!n.isArchived && (
                              <button
                                onClick={() => handleArchive(n.id)}
                                className="text-[10px] text-muted-foreground hover:underline font-extrabold flex items-center gap-1"
                              >
                                Archive
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(n.id)}
                              className="text-[10px] text-red-500 hover:underline font-extrabold flex items-center gap-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="max-w-2xl bg-card border border-border/60 rounded-xl p-6 shadow-sm space-y-6 text-xs">
              {/* DND Toggle */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h3 className="font-bold flex items-center gap-1">
                    {prefs.dndEnabled ? <VolumeX className="text-red-500" /> : <Volume2 className="text-primary" />}
                    Do Not Disturb (DND) Mode
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Mute all incoming communications globally across all devices.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.dndEnabled}
                  onChange={(e) => setPrefs({ ...prefs, dndEnabled: e.target.checked })}
                  className="h-5 w-5 rounded border-border"
                />
              </div>

              {/* Working Hours */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> Delivery Working Hours</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">System will queue non-critical notifications outside these hours.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={prefs.workingHoursStart}
                    onChange={(e) => setPrefs({ ...prefs, workingHoursStart: e.target.value })}
                    className="bg-secondary border border-border p-2 rounded-lg text-xs"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={prefs.workingHoursEnd}
                    onChange={(e) => setPrefs({ ...prefs, workingHoursEnd: e.target.value })}
                    className="bg-secondary border border-border p-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Channels toggles */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold flex items-center gap-1"><Settings className="h-4 w-4 text-primary" /> Delivery Channels</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Control where you want to receive alerts and notifications.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-secondary/15">
                    <span className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-muted-foreground" /> In-App Interface</span>
                    <input type="checkbox" checked={prefs.inAppEnabled} onChange={(e) => setPrefs({ ...prefs, inAppEnabled: e.target.checked })} className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-secondary/15">
                    <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email Inbox</span>
                    <input type="checkbox" checked={prefs.emailEnabled} onChange={(e) => setPrefs({ ...prefs, emailEnabled: e.target.checked })} className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-secondary/15">
                    <span className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-muted-foreground" /> SMS Carrier</span>
                    <input type="checkbox" checked={prefs.smsEnabled} onChange={(e) => setPrefs({ ...prefs, smsEnabled: e.target.checked })} className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-secondary/15">
                    <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /> WhatsApp Messenger</span>
                    <input type="checkbox" checked={prefs.whatsappEnabled} onChange={(e) => setPrefs({ ...prefs, whatsappEnabled: e.target.checked })} className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSavePrefs}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 rounded-lg shadow"
                >
                  Save Preferences Layout
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
