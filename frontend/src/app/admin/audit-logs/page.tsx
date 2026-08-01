'use client';

import React, { useState, useEffect } from 'react';
import { ScrollText, Terminal, RefreshCw } from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { api } from '@/lib/api';

interface AuditLogRecord {
  id: string;
  userId?: string | null;
  action: string;
  ipAddress: string | null;
  details: string | null;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || '';
      const res = await api.auth.getLoginHistory(token);
      if (res && res.success) {
        setLogs(res.data);
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to retrieve system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Define table column structure
  const columns: ColumnDef<AuditLogRecord>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'IP Address',
      accessorKey: 'ipAddress',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-foreground">
          {row.ipAddress || 'System Internal'}
        </span>
      ),
    },
    {
      header: 'Operation Action',
      accessorKey: 'action',
      sortable: true,
      cell: (row) => {
        const actionColors: Record<string, string> = {
          admin_login_success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
          admin_login_failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
          permission_change: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          role_create: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          role_delete: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        };
        const colorClass = actionColors[row.action] || 'bg-secondary text-muted-foreground border-border/50';
        return (
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wide ${colorClass}`}>
            {row.action.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      header: 'Parsed Metadata Details',
      accessorKey: 'details',
      cell: (row) => {
        if (!row.details) return <span className="text-muted-foreground">-</span>;
        try {
          const parsed = JSON.parse(row.details) as Record<string, unknown>;
          return (
            <div className="text-xs space-y-0.5 text-muted-foreground max-w-xs truncate" title={row.details}>
              {Object.entries(parsed).map(([key, val]) => (
                <span key={key} className="inline-block mr-3">
                  <span className="font-bold text-foreground">{key}:</span> {String(val)}
                </span>
              ))}
            </div>
          );
        } catch {
          return <span className="text-xs text-muted-foreground truncate max-w-xs">{row.details}</span>;
        }
      },
    },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div 
        className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-primary" />
                Enterprise Security Audit Trail
              </h1>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Centralized audit trail tracking logins, configuration edits, and dynamic privilege shifts.
              </p>
            </div>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card hover:bg-secondary/40 font-bold text-xs rounded-xl shadow-sm text-foreground transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Logs
            </button>
          </div>

          {/* Audit Trail List */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/35 border border-border/60 p-3.5 rounded-xl">
              <Terminal className="h-4.5 w-4.5 text-primary" />
              <span>Audit records are cryptographically chained and persisted in system storage.</span>
            </div>

            <DataTable
              data={logs}
              columns={columns}
              searchPlaceholder="Filter operations by key..."
              searchKey="action"
              exportFilename="trustzone_audit_trail"
            />
          </div>
        </main>
      </div>

      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      <NotificationCenter 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
}
