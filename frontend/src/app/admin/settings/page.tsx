'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Receipt, 
  FileText, 
  Palette, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  Database, 
  ShieldAlert,
  Save,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { 
  InputText, 
  InputEmail, 
  InputPhone, 
  InputSelect, 
  InputImageUpload 
} from '@/components/ui/form-controls';

export default function AdminSettingsPage() {
  // Navigation layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Settings active tab
  const [activeTab, setActiveTab] = useState<'company' | 'branches' | 'currency' | 'tax' | 'invoice' | 'branding' | 'email' | 'sms' | 'whatsapp' | 'backup' | 'security'>('company');

  // Form states
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings navigation links list
  const settingsTabs = [
    { id: 'company' as const, label: 'Company Info', icon: Building2, desc: 'Corporate registry details' },
    { id: 'branches' as const, label: 'Branch Settings', icon: MapPin, desc: 'Configure active lab branches' },
    { id: 'currency' as const, label: 'Currency Settings', icon: DollarSign, desc: 'Base currency configurations' },
    { id: 'tax' as const, label: 'Tax Settings', icon: Receipt, desc: 'VAT & Local tax percentages' },
    { id: 'invoice' as const, label: 'Invoice Settings', icon: FileText, desc: 'Layout & serial serialization' },
    { id: 'branding' as const, label: 'Corporate Branding', icon: Palette, desc: 'Colors and logotypes assets' },
    { id: 'email' as const, label: 'Email SMTP Gateway', icon: Mail, desc: 'Mail servers configuration' },
    { id: 'sms' as const, label: 'SMS Gateway', icon: MessageSquare, desc: 'Twilio provider integrations' },
    { id: 'whatsapp' as const, label: 'WhatsApp API', icon: PhoneCall, desc: 'Automated notification chats' },
    { id: 'backup' as const, label: 'SQL Backup & Restore', icon: Database, desc: 'Recovery and snapshot logs' },
    { id: 'security' as const, label: 'Security & Sessions', icon: ShieldAlert, desc: 'MFA and console timeouts' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setTimeout(() => {
      setSaving(false);
      setSuccess('Enterprise settings successfully updated.');
    }, 1000);
  };

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
            <h1 className="text-lg font-black text-foreground tracking-tight">Enterprise Settings Console</h1>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              Configure baseline settings, notification systems, and security constraints.
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Settings Shell Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left aligned tab navigator */}
            <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden h-fit">
              <nav className="divide-y divide-border/60" aria-label="Settings categories">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSuccess(null);
                      }}
                      className={`w-full text-left p-3.5 hover:bg-secondary/25 transition flex items-center gap-3 ${
                        isActive ? 'bg-primary/5 border-l-4 border-primary' : ''
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="overflow-hidden">
                        <span className={`text-xs font-bold block ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {tab.label}
                        </span>
                        <span className="text-[9px] text-muted-foreground block truncate mt-0.5">{tab.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right aligned Settings Form Panel */}
            <div className="lg:col-span-3 bg-card border border-border/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[480px]">
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* TAB: Company Info */}
                {activeTab === 'company' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">Company Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputText label="Official Corporate Name" name="c_name" defaultValue="TrustZone Mobile Care BD Ltd." required />
                      <InputText label="Trade License Number" name="c_license" defaultValue="TR-90823-2026" required />
                      <InputEmail label="Corporate Help Email" name="c_email" defaultValue="support@trustzone.care" required />
                      <InputPhone label="Primary Hotline Number" name="c_phone" defaultValue="+880 1977-123456" required />
                    </div>
                  </div>
                )}

                {/* TAB: Branches */}
                {activeTab === 'branches' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">Active Branches Management</h2>
                    <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3.5 text-xs">
                      <p className="font-bold text-foreground">Dhanmondi Head Office (Metro Shopping Mall)</p>
                      <p className="text-muted-foreground">Level 4, Shop #412, Mirpur Road, Dhanmondi, Dhaka 1209</p>
                      <span className="inline-block text-[9px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full uppercase">Primary Headquarters</span>
                    </div>
                    <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3.5 text-xs">
                      <p className="font-bold text-foreground">Banani Laboratory Branch (Road 11)</p>
                      <p className="text-muted-foreground">Level 2, Plot #45, Road 11, Banani, Dhaka 1213</p>
                      <span className="inline-block text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">Active Laboratory</span>
                    </div>
                  </div>
                )}

                {/* TAB: Currency */}
                {activeTab === 'currency' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">Base Currency</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputSelect 
                        label="Primary Currency Code" 
                        name="curr_code" 
                        defaultValue="BDT" 
                        options={[
                          { value: 'BDT', label: 'BDT (৳) - Bangladeshi Taka' },
                          { value: 'USD', label: 'USD ($) - US Dollar' },
                        ]} 
                        required 
                      />
                      <InputText label="Currency Formatting Symbol" name="curr_sym" defaultValue="৳" required />
                    </div>
                  </div>
                )}

                {/* TAB: Tax */}
                {activeTab === 'tax' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">VAT and Sales Tax</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputText label="Base Value Added Tax (VAT %)" name="vat_pct" type="number" defaultValue="15" required />
                      <InputSelect 
                        label="VAT Policy Model" 
                        name="vat_model" 
                        defaultValue="exclusive" 
                        options={[
                          { value: 'exclusive', label: 'Tax Exclusive (Added at checkout)' },
                          { value: 'inclusive', label: 'Tax Inclusive (Part of parts price)' },
                        ]} 
                        required 
                      />
                    </div>
                  </div>
                )}

                {/* TAB: Invoice */}
                {activeTab === 'invoice' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">Invoice Serialization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputText label="Invoice Prefix Code" name="inv_prefix" defaultValue="TZ-" required />
                      <InputText label="Next Serial Number" name="inv_serial" type="number" defaultValue="1001" required />
                      <InputText label="Padding Length" name="inv_pad" type="number" defaultValue="4" required />
                    </div>
                  </div>
                )}

                {/* TAB: Branding */}
                {activeTab === 'branding' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">Corporate Branding</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputImageUpload label="ERP Header Brand Logo" name="b_logo" />
                      <InputSelect 
                        label="Base Theme Palette" 
                        name="b_palette" 
                        defaultValue="fb-blue" 
                        options={[
                          { value: 'fb-blue', label: 'TrustZone Blue (Default)' },
                          { value: 'corporate-slate', label: 'Executive Slate Gray' },
                        ]} 
                        required 
                      />
                    </div>
                  </div>
                )}

                {/* TAB: Email */}
                {activeTab === 'email' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">Email SMTP Mailer Gateway</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputText label="SMTP Server Hostname" name="smtp_host" defaultValue="smtp.sendgrid.net" required />
                      <InputText label="SMTP Port Number" name="smtp_port" type="number" defaultValue="465" required />
                      <InputText label="Auth Username" name="smtp_user" defaultValue="apikey" required />
                      <InputText label="Sender From Address" name="smtp_sender" defaultValue="noreply@trustzone.care" required />
                    </div>
                  </div>
                )}

                {/* TAB: SMS */}
                {activeTab === 'sms' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">SMS Twilio Gateway Integration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputText label="Twilio Account SID" name="sms_sid" defaultValue="AC89023812093810238" required />
                      <InputText label="Auth Verification Token" name="sms_token" defaultValue="••••••••••••••••" type="password" required />
                      <InputText label="Outgoing Twilio Phone" name="sms_phone" defaultValue="+12093810293" required />
                    </div>
                  </div>
                )}

                {/* TAB: WhatsApp */}
                {activeTab === 'whatsapp' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">WhatsApp API Integration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputText label="Meta WhatsApp Endpoint" name="wa_endpoint" defaultValue="https://graph.facebook.com/v19.0/" required />
                      <InputText label="Permanent Bearer Token" name="wa_token" defaultValue="••••••••••••••••" type="password" required />
                    </div>
                  </div>
                )}

                {/* TAB: Backup */}
                {activeTab === 'backup' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">Database Snapshot Backup</h2>
                    <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3.5 text-xs">
                      <p className="font-bold text-foreground">Last Automated Snapshot</p>
                      <p className="text-muted-foreground">July 9, 2026, 03:00 PM (Size: 4.8MB)</p>
                      <div className="flex gap-2">
                        <button type="button" className="px-3.5 py-1.5 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90">Run Backup Dump</button>
                        <button type="button" className="px-3.5 py-1.5 border border-border bg-card font-semibold rounded hover:bg-secondary/40">Restore Dump</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: Security */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">Security and Sessions Guard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputSelect 
                        label="Automatic Inactivity Timeout" 
                        name="sec_timeout" 
                        defaultValue="15" 
                        options={[
                          { value: '5', label: '5 Minutes' },
                          { value: '15', label: '15 Minutes (Recommended)' },
                          { value: '30', label: '30 Minutes' },
                        ]} 
                        required 
                      />
                      <InputSelect 
                        label="Failed Login Attempt Lockout Limit" 
                        name="sec_lockout" 
                        defaultValue="5" 
                        options={[
                          { value: '3', label: '3 Attempts' },
                          { value: '5', label: '5 Attempts (Default)' },
                          { value: '10', label: '10 Attempts' },
                        ]} 
                        required 
                      />
                    </div>
                  </div>
                )}

                {/* Save button (only for forms, skip for backups/branches preview) */}
                {activeTab !== 'branches' && activeTab !== 'backup' && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg text-sm transition-all hover:opacity-90 active:scale-95 shadow-md shadow-primary/20 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving configurations...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </form>
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
