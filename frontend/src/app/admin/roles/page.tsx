'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Lock, Key, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { api, RoleModel } from '@/lib/api';
import { InputText } from '@/components/ui/form-controls';

// Predefined available permission keys
const ALL_PERMISSIONS = [
  { key: 'read:dashboard', label: 'View Dashboard Stats', desc: 'Read-only access to dashboard counts and trends' },
  { key: 'read:repairs', label: 'View Repairs List', desc: 'Browse and inspect device repair tickets' },
  { key: 'write:repairs', label: 'Write Repairs', desc: 'Log repairs, diagnose devices, and update ticket states' },
  { key: 'read:bookings', label: 'View Diagnostic Bookings', desc: 'Inspect customer online repair bookings' },
  { key: 'write:bookings', label: 'Manage Bookings', desc: 'Schedule and allocate online bookings' },
  { key: 'read:customers', label: 'View Customer Profiles', desc: 'Search customer accounts and diagnostic history' },
  { key: 'write:customers', label: 'Manage Customers', desc: 'Register profiles and adjust customer loyalty accounts' },
  { key: 'read:technicians', label: 'View Technicians List', desc: 'Browse technical staff availability' },
  { key: 'write:technicians', label: 'Manage Technicians', desc: 'Allocate repair workloads to technicians' },
  { key: 'read:inventory', label: 'View Parts Stock', desc: 'Browse inventory SKUs, quantities, and bin layouts' },
  { key: 'write:inventory', label: 'Manage Stock', desc: 'Add parts, log stock movements, and adjust buffer limits' },
  { key: 'read:suppliers', label: 'View Supplier Profiles', desc: 'Browse procurement details and suppliers logs' },
  { key: 'write:suppliers', label: 'Manage Suppliers', desc: 'Procure stock and manage supplier agreements' },
  { key: 'read:invoices', label: 'View Invoices Ledger', desc: 'Inspect billing details and invoice logs' },
  { key: 'write:invoices', label: 'Manage Billing', desc: 'Issue invoices, log customer payments, and void bills' },
  { key: 'read:warranty', label: 'View Warranty Claims', desc: 'Verify warranty periods and claims logs' },
  { key: 'write:warranty', label: 'Manage Warranties', desc: 'Process warranty claims and adjust claim approvals' },
  { key: 'read:reports', label: 'View Business Analytics', desc: 'Access financial ledgers, technician KPIs, and branch trends' },
  { key: 'read:finance', label: 'View Corporate Finance', desc: 'Audit branch profits, taxes, and accounting files' },
  { key: 'write:finance', label: 'Manage General Ledger', desc: 'Adjust accounts, audit general ledger, and calculate branch taxes' },
  { key: 'read:settings', label: 'View Branch Settings', desc: 'Read branding, invoice layouts, and SMS templates' },
  { key: 'write:settings', label: 'Manage Enterprise Settings', desc: 'Modify branch locations, SMTP settings, and API configurations' },
  { key: 'read:audit_logs', label: 'Inspect Audit Trail', desc: 'Examine detailed security and CRUD audit records' },
];

export default function RolesManagementPage() {
  // Navigation layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Core RBAC State
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New role form state
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>(['read:dashboard']);
  const [createMode, setCreateMode] = useState(false);

  // Status notifications
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('tz_admin_token') || '';
      const res = await api.roles.list(token);
      if (res && res.success) {
        setRoles(res.data);
        if (res.data.length > 0) {
          // Default to first role (SUPER_ADMIN)
          setSelectedRole(res.data[0]);
        }
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to list roles from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchRoles();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Toggle single permission key on selected role
  const handlePermissionToggle = (permKey: string) => {
    if (!selectedRole || selectedRole.name === 'SUPER_ADMIN') return; // Cannot edit SUPER_ADMIN wildcard

    const exists = selectedRole.permissions.includes(permKey);
    let updatedPerms: string[] = [];

    if (exists) {
      updatedPerms = selectedRole.permissions.filter((k: string) => k !== permKey);
    } else {
      updatedPerms = [...selectedRole.permissions, permKey];
    }

    setSelectedRole({
      ...selectedRole,
      permissions: updatedPerms,
    });
  };

  // Save updated permissions to database
  const saveRolePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('tz_admin_token') || '';
      const res = await api.roles.update(selectedRole.id, {
        permissions: selectedRole.permissions,
        description: selectedRole.description || undefined
      }, token);

      if (res && res.success) {
        setSuccess(`Privileges for role "${selectedRole.name}" successfully updated.`);
        // Reload all roles to keep list in sync
        const updatedRoles = roles.map((r) => r.id === selectedRole.id ? res.data : r);
        setRoles(updatedRoles);
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to update role permissions.');
    } finally {
      setSaving(false);
    }
  };

  // Create new custom role
  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!roleName.trim()) {
      setError('Role name is required.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('tz_admin_token') || '';
      const res = await api.roles.create({
        name: roleName.trim(),
        description: roleDesc.trim() || undefined,
        permissions: newRolePerms
      }, token);

      if (res && res.success) {
        setSuccess(`Custom role "${roleName.toUpperCase()}" successfully created.`);
        setRoles([...roles, res.data]);
        setSelectedRole(res.data);
        setCreateMode(false);
        setRoleName('');
        setRoleDesc('');
        setNewRolePerms(['read:dashboard']);
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to create custom role.');
    } finally {
      setSaving(false);
    }
  };

  const handleNewRolePermToggle = (permKey: string) => {
    setNewRolePerms((prev) => 
      prev.includes(permKey) 
        ? prev.filter((k) => k !== permKey) 
        : [...prev, permKey]
    );
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
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Dynamic RBAC Security Console
              </h1>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Configure administrative roles and assign permission arrays dynamically.
              </p>
            </div>
            {!createMode && (
              <button
                onClick={() => setCreateMode(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs rounded-xl shadow-md shadow-primary/10 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create Custom Role
              </button>
            )}
          </div>

          {/* Status alerts */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Create Custom Role Form view */}
          {createMode ? (
            <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-border/60">
                <h2 className="text-sm font-black text-foreground">Create New Custom Privilege Tier</h2>
                <button 
                  onClick={() => setCreateMode(false)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateRoleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText
                    label="Role Code Name"
                    name="roleName"
                    placeholder="e.g. LAB_ASSISTANT"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    required
                    helperText="Uppercase only, separated by underscores."
                  />
                  <InputText
                    label="Role Description"
                    name="roleDesc"
                    placeholder="e.g. Apprentice lab assistant with read dashboard privileges"
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-foreground/80 tracking-wide uppercase">
                    Assign Permission Set
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto p-2 border border-border rounded-xl">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = newRolePerms.includes(perm.key);
                      return (
                        <label 
                          key={perm.key} 
                          className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-secondary/40 transition-colors ${
                            isChecked ? 'border-primary/20 bg-primary/5' : 'border-border/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleNewRolePermToggle(perm.key)}
                            className="rounded border-border text-primary focus:ring-primary h-4 w-4 mt-0.5"
                          />
                          <div>
                            <span className="text-xs font-bold text-foreground block">{perm.label}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold block leading-tight mt-0.5">{perm.desc}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg text-sm transition-all shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Establish Custom Role'}
                </button>
              </form>
            </div>
          ) : (
            /* Split Panel: Left List / Right Editor */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Role List card */}
              <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden h-fit">
                <div className="p-4 bg-secondary/15 border-b border-border/80">
                  <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Privilege Tiers</h2>
                </div>
                <div className="divide-y divide-border/60">
                  {loading ? (
                    <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      Loading roles...
                    </div>
                  ) : (
                    roles.map((role) => {
                      const isSelected = selectedRole?.id === role.id;
                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role)}
                          className={`w-full text-left p-4 hover:bg-secondary/25 transition flex items-center justify-between ${
                            isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''
                          }`}
                        >
                          <div className="overflow-hidden pr-2">
                            <span className={`text-xs font-bold block ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {role.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                              {role.description || 'No description provided'}
                            </span>
                          </div>
                          {role.isSystem ? (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" aria-label="System Role" />
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-accent/15 text-accent rounded shrink-0 border border-accent/20">Custom</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Permission Editor card */}
              <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                {selectedRole ? (
                  <>
                    <div>
                      {/* Editor Header */}
                      <div className="p-4 bg-secondary/15 border-b border-border/80 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-foreground">{selectedRole.name} Settings</h2>
                            {selectedRole.isSystem && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-secondary text-muted-foreground rounded border border-border uppercase tracking-wider flex items-center gap-1">
                                <Lock className="h-2.5 w-2.5" />
                                Locked System Role
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{selectedRole.description}</p>
                        </div>
                        <button
                          onClick={saveRolePermissions}
                          disabled={saving || selectedRole.name === 'SUPER_ADMIN'}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white font-bold text-xs rounded-xl shadow shadow-primary/20 hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                        >
                          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                          Save Matrix
                        </button>
                      </div>

                      {/* Permissions matrix checklist */}
                      {selectedRole.name === 'SUPER_ADMIN' ? (
                        <div className="p-8 text-center bg-muted/20 border-b border-border/60">
                          <Key className="h-10 w-10 text-primary mx-auto mb-3" />
                          <h3 className="text-xs font-black text-foreground">Global Wildcard Authorization</h3>
                          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed mt-1">
                            The SUPER_ADMIN role holds global wildcard bypass validation (`*`). All endpoints and menu items are open.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto">
                          {ALL_PERMISSIONS.map((perm) => {
                            const isChecked = selectedRole.permissions.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer hover:bg-secondary/40 transition-colors ${
                                  isChecked ? 'border-primary/20 bg-primary/5' : 'border-border/60'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(perm.key)}
                                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 mt-0.5"
                                />
                                <div>
                                  <span className="text-xs font-bold text-foreground block">{perm.label}</span>
                                  <span className="text-[10px] text-muted-foreground font-semibold block leading-tight mt-0.5">{perm.desc}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Footer warning */}
                    <div className="p-4 bg-secondary/15 border-t border-border/80 flex items-center gap-3">
                      <Info className="h-5 w-5 text-primary shrink-0" />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Modifying permissions triggers a real-time invalidation in the Redis cache buffer. Staff members must refresh active browser windows to establish the updated privilege tokens.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    Select a privilege tier from the sidebar list to modify its configuration details.
                  </div>
                )}
              </div>
            </div>
          )}
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
