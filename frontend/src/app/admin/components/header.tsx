'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Plus, 
  Globe, 
  Sun, 
  Moon, 
  Menu, 
  ChevronDown,
  Building,
  User,
  Settings,
  LogOut,
  X,
  FileText,
  CheckCircle2,
  CheckCheck
} from 'lucide-react';
import { useAdminAuth } from '@/context/admin-auth-context';
import { businessConfig } from '@/config/business';
import { api } from '@/lib/api';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  onOpenCommandPalette,
  onOpenNotifications,
}) => {
  const { adminUser, logout } = useAdminAuth();
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('tz_theme') === 'dark';
    }
    return false;
  });
  
  const [selectedBranch, setSelectedBranch] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tz_admin_branch') || businessConfig.branches[0].id;
    }
    return businessConfig.branches[0].id;
  });
  
  const [selectedLang, setSelectedLang] = useState('en');
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // In-app Notifications Tray States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  // Search Command Palette States
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('tz_theme') === 'dark';
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('tz_token') || undefined;
        const res = await api.notifications.fetchNotifications({ read: false }, token);
        if (res.success) {
          setNotifications(res.data.slice(0, 5));
          setUnreadCount(res.data.length);
        }
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 12000);
    return () => clearInterval(interval);
  }, []);

  // Ctrl+K key listener for search console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    localStorage.setItem('tz_admin_branch', branchId);
    window.dispatchEvent(new Event('admin_branch_changed'));
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tz_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tz_theme', 'light');
    }
  };

  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const token = localStorage.getItem('tz_token') || undefined;
      const res = await api.search.globalQuery(val, 4, token);
      if (res.success) {
        setSearchResults(res.data);
      }
    } catch {}
  };

  const markNotificationRead = async (id: string) => {
    const token = localStorage.getItem('tz_token') || undefined;
    await api.notifications.markRead(id, token);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const branches = businessConfig.branches;

  return (
    <header className="sticky top-0 z-35 h-16 bg-card/85 backdrop-blur border-b border-border/80 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar Mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg border border-border hover:bg-secondary/50 text-foreground md:hidden"
          title="Toggle Menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Branch Context Selector */}
        <div className="relative flex items-center gap-2 bg-secondary/35 border border-border/60 rounded-xl px-3 py-1.5 text-xs font-semibold">
          <Building className="h-3.5 w-3.5 text-primary" />
          <select
            value={selectedBranch}
            onChange={(e) => handleBranchChange(e.target.value)}
            className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer pr-1"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary/35 hover:bg-secondary/60 border border-border/60 rounded-xl text-xs font-medium text-muted-foreground transition w-32 sm:w-48 text-left justify-between"
          title="Search Console"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground/80" />
            <span>Search...</span>
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-card border border-border rounded text-[9px] font-bold">
            Ctrl+K
          </kbd>
        </button>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            className="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition flex items-center gap-1 shadow-md shadow-primary/10"
            title="Quick Create"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline text-xs font-bold px-0.5">Quick</span>
          </button>
          
          {quickCreateOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1 z-50">
              <Link 
                href="/admin/repairs"
                className="block w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-secondary/80 font-semibold"
                onClick={() => setQuickCreateOpen(false)}
              >
                Log Diagnostics
              </Link>
              <Link 
                href="/admin/customers"
                className="block w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-secondary/80 font-semibold"
                onClick={() => setQuickCreateOpen(false)}
              >
                Register Customer
              </Link>
              <Link 
                href="/admin/inventory"
                className="block w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-secondary/80 font-semibold"
                onClick={() => setQuickCreateOpen(false)}
              >
                Add Inventory SKU
              </Link>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl border border-border/60 hover:bg-secondary/40 text-foreground transition"
            title="Notification Center"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-card animate-pulse" />
            )}
          </button>

          {/* Quick Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 text-xs flex flex-col">
              <div className="p-3 border-b border-border font-bold flex items-center justify-between">
                <span>Recent Alerts ({unreadCount})</span>
                <Link href="/admin/notifications" className="text-[10px] text-primary hover:underline" onClick={() => setNotifOpen(false)}>
                  Configure Preferences
                </Link>
              </div>
              <div className="divide-y divide-border/60 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-[11px]">No unread alerts.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 bg-primary/5 hover:bg-secondary/20 transition-all space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-foreground">{n.title}</span>
                        <button onClick={() => markNotificationRead(n.id)} className="text-primary hover:text-primary-foreground text-[9px] font-bold">
                          Dismiss
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <Link
                href="/admin/notifications"
                className="p-2.5 bg-secondary/50 border-t border-border hover:bg-secondary/80 text-center font-bold text-[10px] block"
                onClick={() => setNotifOpen(false)}
              >
                Go to Notification Center
              </Link>
            </div>
          )}
        </div>

        {/* Message Toggler (Support chat shortcut) */}
        <Link
          href="/admin/tasks"
          className="p-2 rounded-xl border border-border/60 hover:bg-secondary/40 text-foreground transition hidden sm:flex"
          title="Team Operations Tasks"
        >
          <MessageSquare className="h-4.5 w-4.5" />
        </Link>

        {/* Language Toggler */}
        <div className="relative">
          <button
            onClick={() => setSelectedLang(selectedLang === 'en' ? 'bn' : 'en')}
            className="p-2 rounded-xl border border-border/60 hover:bg-secondary/40 text-foreground transition flex items-center gap-1.5"
            title="Toggle Language"
          >
            <Globe className="h-4.5 w-4.5" />
            <span className="text-[10px] font-black uppercase">{selectedLang}</span>
          </button>
        </div>

        {/* Light/Dark Theme Switch */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border/60 hover:bg-secondary/40 text-foreground transition"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* User Profile Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-secondary/40 border border-transparent hover:border-border transition"
          >
            <div className="h-7 w-7 bg-primary text-primary-foreground font-extrabold text-[10px] rounded-full flex items-center justify-center">
              {mounted && adminUser ? `${adminUser.firstName[0]}${adminUser.lastName[0]}` : 'U'}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1.5 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-bold text-foreground">
                  {mounted && adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Guest User'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {mounted && adminUser ? adminUser.email : 'guest@trustzone.care'}
                </p>
              </div>
              <Link 
                href="/admin/settings?tab=profile"
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-foreground hover:bg-secondary/80 font-semibold"
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                My Profile
              </Link>
              <Link 
                href="/admin/settings?tab=security"
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-foreground hover:bg-secondary/80 font-semibold"
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                ERP Settings
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 font-bold border-t border-border mt-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh]">
          <div className="bg-card border border-border shadow-2xl rounded-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[75vh]">
            <div className="flex items-center p-4 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type query to scan concurrently across 12 modules..."
                className="flex-1 bg-transparent border-0 outline-none pl-3 text-sm text-foreground placeholder-muted-foreground"
                autoFocus
              />
              <button onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-xs space-y-4">
              {!searchResults ? (
                <div className="text-center py-8 text-muted-foreground">Type something to search (e.g. ticket number, client, invoice amount)...</div>
              ) : (
                <>
                  {/* Category result lists */}
                  {searchResults.tickets?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-extrabold uppercase text-[9px] tracking-wide text-primary">Repairs & Tickets</div>
                      <div className="space-y-1">
                        {searchResults.tickets.map((t: any) => (
                          <Link
                            key={t.id}
                            href={`/admin/repairs`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between p-2 rounded hover:bg-secondary/40 border border-transparent hover:border-border"
                          >
                            <span className="font-bold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> #{t.id.substring(0, 8)}</span>
                            <span className="text-muted-foreground capitalize">{t.device?.brand} {t.device?.model} • {t.status}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.customers?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-extrabold uppercase text-[9px] tracking-wide text-primary">CRM Customers</div>
                      <div className="space-y-1">
                        {searchResults.customers.map((c: any) => (
                          <Link
                            key={c.id}
                            href="/admin/customers"
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between p-2 rounded hover:bg-secondary/40 border border-transparent hover:border-border"
                          >
                            <span className="font-bold">{c.firstName} {c.lastName}</span>
                            <span className="text-muted-foreground">{c.email} • {c.phone}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for search */}
                  {Object.values(searchResults).every((arr: any) => arr.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">No matching records found.</div>
                  )}
                </>
              )}
            </div>
            
            <div className="p-3 bg-secondary/50 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-bold">
              <span>Press <kbd className="bg-card border px-1 py-0.5 rounded text-[9px]">Esc</kbd> to close</span>
              <span>Concurrent Global Search Console</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
