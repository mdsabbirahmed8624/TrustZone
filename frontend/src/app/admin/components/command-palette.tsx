'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Terminal, 
  LayoutDashboard, 
  UserPlus, 
  Lock, 
  Settings, 
  Sun, 
  FileCode, 
  LifeBuoy,
  X 
} from 'lucide-react';
import { useAdminAuth } from '@/context/admin-auth-context';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { logout } = useAdminAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tz_theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tz_theme', 'dark');
    }
    onClose();
  };

  // Command Palette options
  const commands = [
    { name: 'Go to Dashboard', description: 'View repair statistics and overview', icon: LayoutDashboard, action: () => router.push('/admin/dashboard') },
    { name: 'Manage Roles & Permissions', description: 'Configure dynamic roles and RBAC guards', icon: Lock, action: () => router.push('/admin/roles') },
    { name: 'Company Settings', description: 'Configure branding, invoice, branch details', icon: Settings, action: () => router.push('/admin/settings') },
    { name: 'Audit Logs', description: 'Inspect system, crud, and security history', icon: Terminal, action: () => router.push('/admin/audit-logs') },
    { name: 'Developer API Console', description: 'View public endpoints and sandbox tokens', icon: FileCode, action: () => router.push('/admin/api') },
    { name: 'Toggle Dark / Light Mode', description: 'Change visual interface theme', icon: Sun, action: () => toggleTheme() },
    { name: 'Support Desk', description: 'Open help and developer diagnostic settings', icon: LifeBuoy, action: () => router.push('/admin/support') },
    { name: 'Create Custom Role', description: 'Create a new dynamic privilege tier', icon: UserPlus, action: () => router.push('/admin/roles?action=new') },
    { name: 'Database Backup & Restore', description: 'Run immediate SQL dump backup', icon: Settings, action: () => router.push('/admin/settings?tab=backup') },
    { name: 'Log Out Session', description: 'Terminate the current active login', icon: X, action: () => { void logout(); } },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
        setQuery('');
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/85 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[350px] animate-fade-in"
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="relative border-b border-border p-4 bg-secondary/15 flex items-center">
          <Search className="h-5 w-5 text-muted-foreground/60 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search action..."
            className="w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-0"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-secondary text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Commands list */}
        <div className="overflow-y-auto flex-grow p-2">
          {filtered.length > 0 ? (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.name}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-left transition-colors ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${
                    isSelected ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{cmd.name}</p>
                    <p className={`text-[10px] ${
                      isSelected ? 'text-primary-foreground/75' : 'text-muted-foreground'
                    }`}>
                      {cmd.description}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">
              No matching commands or navigation paths found.
            </p>
          )}
        </div>

        {/* Command help footer */}
        <div className="border-t border-border p-2 px-4 bg-secondary/20 flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
          <div className="flex gap-3">
            <span><kbd className="border border-border bg-card px-1 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="border border-border bg-card px-1 rounded">Enter</kbd> Select</span>
            <span><kbd className="border border-border bg-card px-1 rounded">Esc</kbd> Close</span>
          </div>
          <span>Enterprise Action Launcher</span>
        </div>
      </div>
    </div>
  );
};
