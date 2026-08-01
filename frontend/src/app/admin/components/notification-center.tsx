'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCheck, 
  Wrench, 
  Calendar, 
  Package, 
  Landmark, 
  ShieldAlert, 
  Info 
} from 'lucide-react';

interface NotificationItem {
  id: string;
  category: 'repair' | 'booking' | 'inventory' | 'finance' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    category: 'inventory',
    title: 'Low Stock Buffer Threshold',
    message: 'iPhone 13 Pro Replacement Screens are below the minimum buffer threshold (2 left).',
    time: '5 mins ago',
    read: false,
  },
  {
    id: 'n-2',
    category: 'booking',
    title: 'New Online Diagnosis Booking',
    message: 'Kamrul Hasan requested diagnostics for iPhone 13 Pro at Dhanmondi Lab.',
    time: '25 mins ago',
    read: false,
  },
  {
    id: 'n-3',
    category: 'finance',
    title: 'Payment Settlement Complete',
    message: 'Invoice #TZ-1002 payment settled. Amount BDT 12,500.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n-4',
    category: 'system',
    title: 'Security Alert: Account Lockout Warning',
    message: 'Failed login attempt from IP 192.168.1.1 on user admin@trustzone.care.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 'n-5',
    category: 'repair',
    title: 'Repair Status Updated',
    message: 'Repair Ticket #TK-9023 state changed to "repaired" (Awaiting pickup).',
    time: '1 day ago',
    read: true,
  },
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [tab, setTab] = useState<'unread' | 'all'>('unread');

  const toggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (tab === 'unread') return !n.read;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'repair': return Wrench;
      case 'booking': return Calendar;
      case 'inventory': return Package;
      case 'finance': return Landmark;
      case 'system': return ShieldAlert;
      default: return Info;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'repair': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'booking': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'inventory': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'finance': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'system': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-secondary/10 text-muted-foreground border-border/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-card border-l border-border flex flex-col shadow-2xl animate-slide-in">
          {/* Header */}
          <div className="p-4 border-b border-border bg-secondary/15 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-foreground">Notification Center</h2>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Real-time enterprise system notifications</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 p-1 px-2 border border-border bg-card rounded hover:bg-secondary text-[10px] font-bold text-foreground"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                <span>Mark All Read</span>
              </button>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg border border-border hover:bg-secondary text-muted-foreground"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Unread / All tabs */}
          <div className="flex border-b border-border bg-secondary/10 text-xs">
            <button
              onClick={() => setTab('unread')}
              className={`flex-1 py-3 text-center font-bold border-b-2 transition ${
                tab === 'unread' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread ({notifications.filter((n) => !n.read).length})
            </button>
            <button
              onClick={() => setTab('all')}
              className={`flex-1 py-3 text-center font-bold border-b-2 transition ${
                tab === 'all' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
          </div>

          {/* List content */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {filtered.length > 0 ? (
              filtered.map((n) => {
                const Icon = getCategoryIcon(n.category);
                const colorClasses = getCategoryColor(n.category);

                return (
                  <div
                    key={n.id}
                    onClick={() => toggleRead(n.id)}
                    className={`p-3.5 border rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                      n.read 
                        ? 'border-border bg-card/45 opacity-75' 
                        : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className={`h-8.5 w-8.5 rounded-lg border flex items-center justify-center shrink-0 ${colorClasses}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{n.category}</span>
                        <span className="text-[9px] text-muted-foreground font-semibold">{n.time}</span>
                      </div>
                      <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <Info className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs font-bold">No notifications to display</p>
                <p className="text-[10px] mt-0.5 max-w-[200px]">You are completely up-to-date with system alerts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
