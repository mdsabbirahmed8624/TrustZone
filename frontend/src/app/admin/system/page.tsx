'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Cpu, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { useFeatureFlags } from '@/context/feature-flag-context';

export default function AdminSystemPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { flags, toggleFlag } = useFeatureFlags();
  const searchParams = useSearchParams();

  // Highlight specific flag if redirected
  const redirectedFlag = searchParams.get('flag');

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
          <div className="border-b border-border/60 pb-5">
            <h1 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              ERP System Architecture & Feature Flags
            </h1>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              Toggle feature flags to mock and preview unreleased Enterprise modules.
            </p>
          </div>

          {/* Locked Redirection Warning Banner */}
          {redirectedFlag && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3 animate-shake">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Feature Flag Restriction</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  The <span className="font-extrabold text-foreground uppercase">&quot;{redirectedFlag}&quot;</span> module belongs to future phases (Book 2). Access is protected by the Feature Flag system. Toggle it below to bypass.
                </p>
              </div>
            </div>
          )}

          {/* Feature Flags control panel */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Modular Feature Flags</h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Disable or enable modules without altering codebase files</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'repairs' as const, name: 'Repair Management Module', desc: 'SLA timers, diagnostic flows, and micro-soldering log sheets.' },
                { key: 'inventory' as const, name: 'Inventory & Procurement', desc: 'SKU allocations, safety buffers thresholds, and supplier channels.' },
                { key: 'finance' as const, name: 'Finance & Invoices Ledger', desc: 'General ledger auditing, invoice issues, and tax declarations.' },
                { key: 'crm' as const, name: 'CRM & Customer Feedbacks', desc: 'Loyalty programs, SMS notification chains, and marketing coupons.' }
              ].map((flag) => {
                const isEnabled = flags[flag.key];
                const isHighlighted = redirectedFlag === flag.key;
                
                return (
                  <div 
                    key={flag.key}
                    className={`p-4 border rounded-2xl flex items-center justify-between transition-colors ${
                      isHighlighted ? 'border-primary bg-primary/5' : 'border-border/60 hover:bg-secondary/15'
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{flag.name}</span>
                        {isHighlighted && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-primary text-primary-foreground rounded uppercase">Requested</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-normal">{flag.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleFlag(flag.key)}
                      className="text-muted-foreground hover:text-foreground focus:outline-none transition cursor-pointer"
                      title={isEnabled ? 'Disable Feature' : 'Enable Feature'}
                    >
                      {isEnabled ? (
                        <ToggleRight className="h-9 w-9 text-primary" />
                      ) : (
                        <ToggleLeft className="h-9 w-9 text-muted-foreground/60" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Database Backup & Restore</h3>
              <div className="flex gap-3 text-xs font-bold">
                <button
                  onClick={() => {
                    const data = {
                      timestamp: new Date().toISOString(),
                      system: 'TrustZone ERP',
                      checksum: 'MD5-882019A'
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `trustzone_backup_${Date.now()}.json`;
                    link.click();
                    alert('Manual Backup JSON dump compiled and downloaded successfully!');
                  }}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2.5 rounded-lg shadow-sm"
                >
                  Trigger Manual Backup
                </button>
                <button
                  onClick={() => alert('Please select a valid ERP backup JSON file to restore.')}
                  className="bg-secondary hover:bg-secondary/80 border border-border text-foreground px-4 py-2.5 rounded-lg"
                >
                  Upload Backup file
                </button>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">ERP Deployment Metrics</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 bg-secondary/35 border border-border rounded-xl">
                  <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">Environment</span>
                  <span className="text-foreground font-extrabold mt-1 block">Development Staging</span>
                </div>
                <div className="p-3 bg-secondary/35 border border-border rounded-xl">
                  <span className="text-muted-foreground block text-[9px] uppercase tracking-wide">Database Sync</span>
                  <span className="text-green-500 font-extrabold mt-1 block flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    Active Handshake
                  </span>
                </div>
              </div>
            </div>
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
