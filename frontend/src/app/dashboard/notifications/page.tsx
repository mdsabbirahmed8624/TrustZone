'use client';

import { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Wrench, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';

interface MockNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'repair' | 'security' | 'warranty';
}

export default function NotificationsFeed() {
  const [notifications, setNotifications] = useState<MockNotification[]>([
    {
      id: '1',
      title: 'Device repair bench status updated',
      desc: 'Your iPhone 13 Pro is now active on the workbench with Nafis Iqbal.',
      time: '1 hour ago',
      read: false,
      type: 'repair'
    },
    {
      id: '2',
      title: 'New device login session registered',
      desc: 'Session initialized via Chrome / Windows from Dhaka location.',
      time: '3 hours ago',
      read: true,
      type: 'security'
    },
    {
      id: '3',
      title: 'Warranty verification status pass',
      desc: 'Screen replacement lamination code successfully validated.',
      time: '1 day ago',
      read: true,
      type: 'warranty'
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'repair': return <Wrench className="h-5 w-5 text-primary" />;
      case 'security': return <Lock className="h-5 w-5 text-amber-500" />;
      case 'warranty': return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground">Notification Feed</h1>
          <p className="text-sm text-muted-foreground">Stay informed on active bench tickets and security logins.</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-primary hover:text-accent font-bold text-xs flex items-center gap-1 focus:outline-none"
          >
            <Check className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`glass border p-5 rounded-xl bg-card/40 flex justify-between items-start gap-4 transition-all ${
                notif.read ? 'border-border opacity-70' : 'border-primary/45 glow-primary'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="bg-secondary p-2 rounded-lg border border-border/60 shrink-0">
                  {getIcon(notif.type)}
                </span>
                <div className="space-y-1 text-xs">
                  <span className="font-extrabold text-foreground text-sm block leading-snug">{notif.title}</span>
                  <p className="text-muted-foreground leading-relaxed">{notif.desc}</p>
                  <span className="text-[10px] text-muted-foreground/60 block">{notif.time}</span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleToggleRead(notif.id)}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  title={notif.read ? 'Mark as Unread' : 'Mark as Read'}
                >
                  <Check className={`h-4 w-4 ${notif.read ? 'text-muted-foreground' : 'text-primary font-bold'}`} />
                </button>
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 rounded text-muted-foreground hover:text-red-500 transition-colors focus:outline-none"
                  title="Delete Notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass p-12 text-center rounded-xl border border-border space-y-2 bg-card/25 text-xs">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-bold">Your feed is completely clear.</p>
          </div>
        )}
      </div>
    </div>
  );
}
