'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Building,
  Mail,
  Award,
  BookOpen,
  Edit2
} from 'lucide-react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { api } from '@/lib/api';

export default function EmployeeDirectoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals & Form
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  
  const [form, setForm] = useState({
    userId: '',
    department: 'Operations',
    designation: 'Technician',
    employmentStatus: 'ACTIVE',
    joiningDate: '',
    idCardNumber: '',
    skills: '',
    certifications: '',
    notes: '',

    // Extended Attributes
    employeeNumber: '',
    passportNumber: '',
    visaStatus: '',
    bankAccount: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadData();
  }, [deptFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.hrms.fetchEmployees(token);
      if (res.success) {
        let list = res.data;
        if (searchTerm) {
          list = list.filter((e: any) =>
            e.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.designation?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setEmployees(list);
      }

      const contactsRes = await api.chat.fetchContacts(token);
      if (contactsRes.success) setContacts(contactsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split(',').map(c => c.trim()).filter(Boolean),
        passportInfo: { passportNumber: form.passportNumber },
        visaInfo: { visaStatus: form.visaStatus },
        bankAccounts: { bankAccount: form.bankAccount },
      };

      if (editingEmp) {
        await api.hrms.updateEmployee(editingEmp.userId, payload, token);
      } else {
        await api.hrms.createEmployee(payload, token);
      }
      setShowModal(false);
      setEditingEmp(null);
      setForm({ userId: '', department: 'Operations', designation: 'Technician', employmentStatus: 'ACTIVE', joiningDate: '', idCardNumber: '', skills: '', certifications: '', notes: '', employeeNumber: '', passportNumber: '', visaStatus: '', bankAccount: '' });
      loadData();
    } catch (err) {
      alert('Error saving employee profile.');
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
                <Users className="text-primary h-6 w-6" />
                Employee Directory
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage employee profiles, emergency contacts, skills matrices, certifications, and roles designations.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingEmp(null);
                setForm({ userId: '', department: 'Operations', designation: 'Technician', employmentStatus: 'ACTIVE', joiningDate: '', idCardNumber: '', skills: '', certifications: '', notes: '', employeeNumber: '', passportNumber: '', visaStatus: '', bankAccount: '' });
                setShowModal(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus className="h-4 w-4" /> Add Employee Profile
            </button>
          </div>

          {/* Search/Filter panel */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border/60 p-3 rounded-xl shadow-sm text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-secondary border border-border p-2 rounded-lg font-bold text-[11px]"
              >
                <option value="">All Departments</option>
                <option value="Operations">Operations</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Finance">Finance</option>
                <option value="Management">Management</option>
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                placeholder="Search name..."
                className="w-full bg-secondary border border-border pl-8 pr-3 py-2 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-muted-foreground bg-card border border-border/60 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                <Users className="h-8 w-8 text-muted-foreground/60" />
                No employee profiles registered yet.
              </div>
            ) : (
              employees.map((emp) => (
                <div key={emp.userId} className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4 hover:shadow transition-all relative flex flex-col justify-between">
                  <button
                    onClick={() => {
                      setEditingEmp(emp);
                      setForm({
                        userId: emp.userId,
                        department: emp.department,
                        designation: emp.designation,
                        employmentStatus: emp.employmentStatus,
                        joiningDate: emp.joiningDate?.split('T')[0] || '',
                        idCardNumber: emp.idCardNumber || '',
                        skills: (emp.skills || []).join(', '),
                        certifications: (emp.certifications || []).join(', '),
                        notes: emp.notes || '',
                        employeeNumber: emp.employeeNumber || '',
                        passportNumber: emp.passportInfo?.passportNumber || '',
                        visaStatus: emp.visaInfo?.visaStatus || '',
                        bankAccount: emp.bankAccounts?.bankAccount || '',
                      });
                      setShowModal(true);
                    }}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground border border-border/60 hover:bg-secondary/40 p-1.5 rounded-lg"
                    title="Edit Profile"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 bg-primary text-primary-foreground font-black text-xs rounded-full flex items-center justify-center border">
                        {emp.user ? `${emp.user.firstName[0]}${emp.user.lastName[0]}` : 'E'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{emp.user?.firstName} {emp.user?.lastName}</h3>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                          <Building className="h-3 w-3 text-primary" /> {emp.department} • {emp.designation}
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-border/60 border border-border/60 bg-secondary/10 rounded-lg p-3 text-[11px] space-y-2">
                      <div className="flex items-center justify-between text-muted-foreground pt-1 first:pt-0">
                        <span>Employment Number:</span>
                        <span className="font-bold text-foreground">{emp.employeeNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground pt-2">
                        <span>Passport ID:</span>
                        <span className="font-bold text-foreground">{emp.passportInfo?.passportNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground pt-2">
                        <span>Bank details:</span>
                        <span className="font-bold text-foreground">{emp.bankAccounts?.bankAccount || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1 text-[9px] font-bold text-muted-foreground">
                        {(emp.skills || []).map((skill: string) => (
                          <span key={skill} className="bg-secondary border border-border rounded px-1.5 py-0.5 text-foreground flex items-center gap-0.5">
                            <BookOpen className="h-2.5 w-2.5 text-primary" /> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs font-semibold">
            <h2 className="text-lg font-black tracking-tight">{editingEmp ? 'Edit Employee Profile' : 'New Employee Profile'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Select User Account</label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  disabled={!!editingEmp}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                >
                  <option value="">Select User Account</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold">Employee Code Number</label>
                <input
                  type="text"
                  value={form.employeeNumber}
                  onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })}
                  placeholder="e.g. TZ-0921"
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Passport ID Number</label>
                <input
                  type="text"
                  value={form.passportNumber}
                  onChange={(e) => setForm({ ...form, passportNumber: e.target.value })}
                  placeholder="e.g. EA-092810"
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Bank Account Number</label>
                <input
                  type="text"
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                  placeholder="e.g. DBBL-9902-12"
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                >
                  <option value="Operations">Operations</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold">Designation</label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full bg-secondary border border-border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingEmp(null);
                }}
                className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg shadow"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
