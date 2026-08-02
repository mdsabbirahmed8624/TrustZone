'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Key,
  Lock,
  UserCheck,
  UserX,
  AlertOctagon,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Laptop,
  Globe,
  FileSpreadsheet,
  Download,
  Upload,
  Settings,
  Filter,
  CheckSquare,
  Square,
  ShieldAlert,
  Sliders,
  UserPlus,
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';

export default function UsersRolesPermissionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active Tab State: 'dashboard' | 'users' | 'roles' | 'matrix' | 'logs' | 'sessions' | 'profile' | 'security'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'roles' | 'matrix' | 'logs' | 'sessions' | 'profile' | 'security'>('dashboard');

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Bulk Selection State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Modals & Form States
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    mobile: '',
    employeeId: '',
    password: '',
    role: 'TECHNICIAN',
    branchId: '',
    department: 'Service Desk',
    designation: 'Repair Specialist',
    status: 'ACTIVE',
  });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadData();
  }, [activeTab, roleFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersRes = await api.users.list({ search: searchTerm, role: roleFilter, status: statusFilter }, token);
      if (usersRes.success) {
        setUsers(usersRes.data);
        if (!selectedUser && usersRes.data.length > 0) setSelectedUser(usersRes.data[0]);
      }

      // 2. Fetch Roles
      const rolesRes = await api.users.fetchRoles(token);
      if (rolesRes.success) setRoles(rolesRes.data);

      // 3. Permission Matrix
      if (activeTab === 'matrix') {
        const matRes = await api.users.fetchPermissionMatrix(token);
        if (matRes.success) setPermissionMatrix(matRes.data);
      }

      // 4. Activity Logs
      if (activeTab === 'logs') {
        const logsRes = await api.users.fetchActivityLogs({}, token);
        if (logsRes.success) setActivityLogs(logsRes.data);
      }

      // 5. Active Sessions
      if (activeTab === 'sessions' && selectedUser) {
        const sessRes = await api.users.fetchSessions(selectedUser.id, token);
        if (sessRes.success) setSessions(sessRes.data);
      }
    } catch (err) {
      console.error('Failed to load user management records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleSaveUser = async () => {
    if (!userForm.firstName.trim() || !userForm.email.trim()) {
      return alert('First Name and Email are required.');
    }
    try {
      if (editingUser) {
        await api.users.updateUser(editingUser.id, userForm, token);
      } else {
        await api.users.createUser(userForm, token);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ firstName: '', lastName: '', email: '', username: '', mobile: '', employeeId: '', password: '', role: 'TECHNICIAN', branchId: '', department: 'Service Desk', designation: 'Repair Specialist', status: 'ACTIVE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save user record.');
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      await api.users.updateUserStatus(userId, status, token);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.users.deleteUser(userId, token);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) return alert('Role name is required.');
    try {
      await api.users.createRole(roleForm, token);
      setShowRoleModal(false);
      setRoleForm({ name: '', description: '', permissions: [] });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create role.');
    }
  };

  const handleBulkActionExecute = async () => {
    if (!bulkAction || selectedUserIds.length === 0) return alert('Select users and an action first.');
    try {
      await api.users.handleBulkAction({ userIds: selectedUserIds, action: bulkAction }, token);
      setSelectedUserIds([]);
      setBulkAction('');
      alert('Bulk operation executed successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Bulk operation failed.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) setSelectedUserIds([]);
    else setSelectedUserIds(users.map(u => u.id));
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) setSelectedUserIds(selectedUserIds.filter(i => i !== id));
    else setSelectedUserIds([...selectedUserIds, id]);
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = u.firstName.toLowerCase().includes(term) || u.lastName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || (u.employeeId && u.employeeId.toLowerCase().includes(term));
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    const matchesStatus = statusFilter ? u.status === statusFilter : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeUsersCount = users.filter(u => u.status === 'ACTIVE').length;
  const lockedUsersCount = users.filter(u => u.status === 'LOCKED' || u.status === 'SUSPENDED').length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
                <Shield className="h-8 w-8 text-cyan-400" />
                Users, Roles & Security Permissions
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Granular RBAC Permission Matrix, Employee User Lifecycle, Session Control & Security Audit Logs
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({ firstName: '', lastName: '', email: '', username: '', mobile: '', employeeId: '', password: '', role: 'TECHNICIAN', branchId: '', department: 'Service Desk', designation: 'Repair Specialist', status: 'ACTIVE' });
                  setShowUserModal(true);
                }}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-md"
              >
                <UserPlus className="h-4 w-4" /> Add User
              </button>
              <button
                onClick={() => setShowRoleModal(true)}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 transition-colors"
              >
                <Shield className="h-4 w-4 text-emerald-400" /> Create Custom Role
              </button>
              <button onClick={loadData} className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 transition-colors">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Shield },
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'roles', label: 'Roles & Hierarchy', icon: Key },
              { id: 'matrix', label: 'Permission Matrix', icon: Sliders },
              { id: 'logs', label: 'Activity Audit Trail', icon: Clock },
              { id: 'sessions', label: 'Session Management', icon: Laptop },
              { id: 'profile', label: 'User Profile', icon: UserCheck },
              { id: 'security', label: 'Security Policy', icon: Lock },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <RefreshCw className="h-10 w-10 text-cyan-500 animate-spin" />
              <p className="text-slate-400 text-sm mt-4">Loading security permissions and user ledgers...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered Accounts</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">{users.length} Users</h3>
                        <p className="text-xs text-emerald-400 mt-1">{activeUsersCount} Active Accounts</p>
                      </div>
                      <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Roles</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">{roles.length} Roles Defined</h3>
                        <p className="text-xs text-indigo-400 mt-1">Granular RBAC matrix active</p>
                      </div>
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                        <Key className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Locked / Suspended</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">{lockedUsersCount} Accounts</h3>
                        <p className="text-xs text-amber-400 mt-1">Security lockout enabled</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Trail Logged</span>
                        <h3 className="text-2xl font-black text-slate-100 mt-1">Active</h3>
                        <p className="text-xs text-emerald-400 mt-1">100% Real-time Logging</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Quick User Directory Overview */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-3">User Account Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                            <th className="py-3">Employee Name</th>
                            <th className="py-3">Email & Username</th>
                            <th className="py-3">Role</th>
                            <th className="py-3">Branch</th>
                            <th className="py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.slice(0, 5).map(u => (
                            <tr key={u.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                              <td className="py-3 font-bold text-slate-200">{u.firstName} {u.lastName}</td>
                              <td className="py-3 font-mono text-slate-300">{u.email}</td>
                              <td className="py-3"><span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono border border-cyan-500/20">{u.role}</span></td>
                              <td className="py-3 text-slate-400">{u.branch?.name || 'Central Head Office'}</td>
                              <td className="py-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">{u.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USER DIRECTORY & BULK ACTIONS */}
              {activeTab === 'users' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search name, email, employee ID, phone..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg outline-none focus:border-cyan-500">
                        <option value="">All Roles</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="BRANCH_MANAGER">Branch Manager</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="RECEPTION">Reception</option>
                        <option value="CASHIER">Cashier</option>
                        <option value="ACCOUNTANT">Accountant</option>
                      </select>
                      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg outline-none focus:border-cyan-500">
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="LOCKED">Locked</option>
                      </select>
                    </div>
                  </div>

                  {/* Bulk Actions Toolbar */}
                  {selectedUserIds.length > 0 && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-cyan-400 font-semibold">{selectedUserIds.length} users selected</span>
                      <div className="flex items-center gap-2">
                        <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded outline-none">
                          <option value="">Select Bulk Action</option>
                          <option value="ACTIVATE">Activate Accounts</option>
                          <option value="DEACTIVATE">Deactivate Accounts</option>
                          <option value="SUSPEND">Suspend Accounts</option>
                          <option value="RESET_PASSWORD">Reset Default Password</option>
                          <option value="DELETE">Delete Accounts</option>
                        </select>
                        <button onClick={handleBulkActionExecute} className="bg-cyan-500 text-slate-950 font-bold px-3 py-1 rounded transition-colors">
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* User Directory Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3 px-2">
                            <input type="checkbox" checked={selectedUserIds.length === users.length && users.length > 0} onChange={toggleSelectAll} className="rounded" />
                          </th>
                          <th className="py-3">Employee</th>
                          <th className="py-3">Contact</th>
                          <th className="py-3">Role</th>
                          <th className="py-3">Branch</th>
                          <th className="py-3">Status</th>
                          <th className="py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 px-2">
                              <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleSelectUser(u.id)} className="rounded" />
                            </td>
                            <td className="py-3">
                              <div className="font-bold text-slate-100">{u.firstName} {u.lastName}</div>
                              <div className="text-[11px] font-mono text-cyan-400">{u.employeeId || 'EMP-1001'}</div>
                            </td>
                            <td className="py-3 font-mono text-slate-300">{u.email}</td>
                            <td className="py-3">
                              <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono border border-cyan-500/20">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400">{u.branch?.name || 'Central Head Office'}</td>
                            <td className="py-3">
                              <select
                                value={u.status}
                                onChange={e => handleUpdateStatus(u.id, e.target.value)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 outline-none ${
                                  u.status === 'ACTIVE' ? 'text-emerald-400' : u.status === 'LOCKED' ? 'text-rose-400' : 'text-amber-400'
                                }`}
                              >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="SUSPENDED">SUSPENDED</option>
                                <option value="LOCKED">LOCKED</option>
                              </select>
                            </td>
                            <td className="py-3 text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setUserForm({
                                    firstName: u.firstName,
                                    lastName: u.lastName,
                                    email: u.email,
                                    username: u.username || '',
                                    mobile: u.mobile || '',
                                    employeeId: u.employeeId || '',
                                    password: '',
                                    role: u.role,
                                    branchId: u.branchId || '',
                                    department: u.department || 'Service Desk',
                                    designation: u.designation || 'Staff',
                                    status: u.status,
                                  });
                                  setShowUserModal(true);
                                }}
                                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-1.5 rounded text-slate-300"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDeleteUser(u.id)} className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 p-1.5 rounded text-rose-400">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ROLES & HIERARCHY */}
              {activeTab === 'roles' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">System Roles Directory</h3>
                      <p className="text-xs text-slate-400">Default ERP System Roles and Custom Enterprise Role Definitions</p>
                    </div>
                    <button onClick={() => setShowRoleModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-3 py-1.5 rounded text-xs">
                      + Add Custom Role
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {roles.map(r => (
                      <div key={r.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-100 text-sm">{r.name}</h4>
                          <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                            {r.isSystem ? 'SYSTEM' : 'CUSTOM'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{r.description || 'Standard access permissions'}</p>
                        <div className="border-t border-slate-850 pt-2 text-[11px] text-slate-500 flex justify-between">
                          <span>{r._count?.users || 0} Assigned Users</span>
                          <span>{r.permissions?.length || 0} Permissions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PERMISSION MATRIX */}
              {activeTab === 'matrix' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-200">Granular Module Permission Matrix</h3>
                    <p className="text-xs text-slate-400">16 ERP Modules × 8 Operation Types (Create, Read, Update, Delete, Approve, Export, Print, Assign)</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-800">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                          <th className="p-3 border-r border-slate-800">Module</th>
                          {['Create', 'Read', 'Update', 'Delete', 'Approve', 'Export', 'Print', 'Assign'].map(act => (
                            <th key={act} className="p-3 text-center border-r border-slate-800">{act}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {permissionMatrix.map(m => (
                          <tr key={m.module} className="border-b border-slate-850 hover:bg-slate-950/30">
                            <td className="p-3 font-bold text-slate-200 border-r border-slate-800">{m.label}</td>
                            {['create', 'read', 'update', 'delete', 'approve', 'export', 'print', 'assign'].map(act => (
                              <td key={act} className="p-3 text-center border-r border-slate-800">
                                <span className="inline-block w-3 h-3 rounded-full bg-emerald-500/80" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: ACTIVITY LOGS */}
              {activeTab === 'logs' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-200">Security & Activity Audit Logs</h3>
                    <p className="text-xs text-slate-400">Real-time immutable logging of authentication, CRUD, and permission modifications</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3">Timestamp</th>
                          <th className="py-3">User</th>
                          <th className="py-3">Action</th>
                          <th className="py-3">IP / Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.map(log => (
                          <tr key={log.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 font-mono text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="py-3 font-semibold text-slate-200">{log.user?.firstName || 'System'} {log.user?.lastName || ''}</td>
                            <td className="py-3"><span className="bg-slate-800 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono">{log.action}</span></td>
                            <td className="py-3 text-slate-300 font-mono">{log.ipAddress || '127.0.0.1'} — {log.details || 'OK'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: SESSION MANAGEMENT */}
              {activeTab === 'sessions' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">Active User Sessions</h3>
                      <p className="text-xs text-slate-400">Track logged in devices, IP addresses, and revoke tokens</p>
                    </div>
                    {selectedUser && (
                      <button onClick={() => api.users.logoutAllDevices(selectedUser.id, token).then(() => loadData())} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 px-3 py-1.5 rounded text-xs font-bold">
                        Logout All Devices
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3">Session ID</th>
                          <th className="py-3">IP Address</th>
                          <th className="py-3">User Agent</th>
                          <th className="py-3">Issued At</th>
                          <th className="py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map(s => (
                          <tr key={s.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 font-mono text-cyan-400">{s.id.substring(0, 8)}</td>
                            <td className="py-3 font-mono text-slate-300">{s.ipAddress || '192.168.1.10'}</td>
                            <td className="py-3 text-slate-400">{s.userAgent || 'Chrome (macOS)'}</td>
                            <td className="py-3 text-slate-400">{new Date(s.createdAt).toLocaleString()}</td>
                            <td className="py-3 text-right">
                              <button onClick={() => api.users.terminateSession(s.id, token).then(() => loadData())} className="bg-rose-500/10 text-rose-400 px-2 py-1 rounded text-[10px] font-bold">
                                Terminate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* USER MODAL */}
          {showUserModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">
                  {editingUser ? 'Edit User Account' : 'Register New User'}
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">First Name</label>
                      <input type="text" value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Last Name</label>
                      <input type="text" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-cyan-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                      <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Password</label>
                      <input type="password" placeholder={editingUser ? 'Leave blank to keep current' : 'Min 8 chars'} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-cyan-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">System Role</label>
                      <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-cyan-500">
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="BRANCH_MANAGER">Branch Manager</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="RECEPTION">Reception</option>
                        <option value="CASHIER">Cashier</option>
                        <option value="ACCOUNTANT">Accountant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Account Status</label>
                      <select value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-cyan-500">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="LOCKED">LOCKED</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  <button onClick={() => setShowUserModal(false)} className="bg-slate-950 text-slate-400 px-4 py-2 rounded text-xs">Cancel</button>
                  <button onClick={handleSaveUser} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded text-xs">Save Account</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
