'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Briefcase,
  Building,
  ArrowRight,
  Laptop,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Network,
  Plus,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function HrmsDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'courses' | 'forecasts' | 'org'>('overview');

  // Stats & Entities
  const [metrics, setMetrics] = useState({ activeStaff: 0, leaveRequestsPending: 0, presentToday: 0, openPositions: 0 });
  const [assets, setAssets] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  // Create forms triggers
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  const [assetForm, setAssetForm] = useState({ name: '', assetType: 'LAPTOP', serialNumber: '', assignedToId: '' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const mRes = await api.hrms.fetchDashboardMetrics(token);
    if (mRes.success) setMetrics(mRes.data);

    const aRes = await api.hrms.fetchAssets(token);
    if (aRes.success) setAssets(aRes.data);

    const cRes = await api.hrms.fetchCourses(token);
    if (cRes.success) setCourses(cRes.data);

    const sRes = await api.hrms.fetchSessions(token);
    if (sRes.success) setSessions(sRes.data);

    const fRes = await api.hrms.fetchForecasts(token);
    if (fRes.success) setForecasts(fRes.data);

    const empRes = await api.hrms.fetchEmployees(token);
    if (empRes.success) setEmployees(empRes.data);

    setLoading(false);
  };

  const handleCreateAsset = async () => {
    await api.hrms.createAsset(assetForm, token);
    setShowAssetModal(false);
    setAssetForm({ name: '', assetType: 'LAPTOP', serialNumber: '', assignedToId: '' });
    loadDashboard();
  };

  const handleCreateCourse = async () => {
    await api.hrms.createCourse(courseForm, token);
    setShowCourseModal(false);
    setCourseForm({ title: '', description: '' });
    loadDashboard();
  };

  const handleReturnAsset = async (id: string) => {
    await api.hrms.returnAsset(id, 'RETURNED', undefined, token);
    loadDashboard();
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
                Enterprise HRMS Console
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overview of staff operations, assets assignments, training completions, and headcount forecasting models.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/hrms/portal"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                Employee Portal <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/60 gap-4 text-xs font-bold">
            <button onClick={() => setActiveTab('overview')} className={`pb-2 ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Overview</button>
            <button onClick={() => setActiveTab('assets')} className={`pb-2 ${activeTab === 'assets' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Assets Inventory</button>
            <button onClick={() => setActiveTab('courses')} className={`pb-2 ${activeTab === 'courses' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Courses & Training</button>
            <button onClick={() => setActiveTab('forecasts')} className={`pb-2 ${activeTab === 'forecasts' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Projections & Forecasts</button>
            <button onClick={() => setActiveTab('org')} className={`pb-2 ${activeTab === 'org' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Organizational Chart</button>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Active Staff</span>
                    <Users className="text-primary h-5 w-5" />
                  </div>
                  <div className="text-3xl font-black">{metrics.activeStaff}</div>
                  <p className="text-[10px] text-muted-foreground font-semibold">Across all service branches</p>
                </div>

                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Present Today</span>
                    <Clock className="text-green-500 h-5 w-5" />
                  </div>
                  <div className="text-3xl font-black">{metrics.presentToday}</div>
                  <p className="text-[10px] text-green-500 font-semibold">96.8% Average attendance rate</p>
                </div>

                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Pending Leaves</span>
                    <Calendar className="text-purple-500 h-5 w-5" />
                  </div>
                  <div className="text-3xl font-black">{metrics.leaveRequestsPending}</div>
                  <p className="text-[10px] text-yellow-500 font-semibold">Awaiting manager approvals</p>
                </div>

                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Open Positions</span>
                    <Briefcase className="text-orange-500 h-5 w-5" />
                  </div>
                  <div className="text-3xl font-black">{metrics.openPositions}</div>
                  <p className="text-[10px] text-muted-foreground font-semibold">Recruiting tech-staff pipeline</p>
                </div>
              </div>

              {/* Module Navigation Grid */}
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">HR Operations Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/admin/hrms/employees" className="bg-card border border-border/60 hover:border-primary/40 rounded-xl p-5 shadow-sm space-y-2">
                  <Users className="h-6 w-6 text-blue-500" />
                  <h3 className="text-sm font-bold">Employee Profiles</h3>
                  <p className="text-xs text-muted-foreground">Emergency contacts, passports, checklist items & certifications.</p>
                </Link>
                <Link href="/admin/hrms/attendance" className="bg-card border border-border/60 hover:border-primary/40 rounded-xl p-5 shadow-sm space-y-2">
                  <Clock className="h-6 w-6 text-green-500" />
                  <h3 className="text-sm font-bold">Attendance logs</h3>
                  <p className="text-xs text-muted-foreground">Clock-in, geolocation verification, late checks & break limits.</p>
                </Link>
                <Link href="/admin/hrms/leave" className="bg-card border border-border/60 hover:border-primary/40 rounded-xl p-5 shadow-sm space-y-2">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <h3 className="text-sm font-bold">Leave Requests</h3>
                  <p className="text-xs text-muted-foreground">Vacation balance allowances, sick days & workflow approval statuses.</p>
                </Link>
                <Link href="/admin/hrms/shifts" className="bg-card border border-border/60 hover:border-primary/40 rounded-xl p-5 shadow-sm space-y-2">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                  <h3 className="text-sm font-bold">Shift & Roster</h3>
                  <p className="text-xs text-muted-foreground">Manage rotation configurations, grace hours & overtime rates.</p>
                </Link>
                <Link href="/admin/hrms/payroll" className="bg-card border border-border/60 hover:border-primary/40 rounded-xl p-5 shadow-sm space-y-2">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                  <h3 className="text-sm font-bold">Payroll & Structures</h3>
                  <p className="text-xs text-muted-foreground">Configure salary bands, PF contributions, and payslips.</p>
                </Link>
                <Link href="/admin/hrms/performance" className="bg-card border border-border/60 hover:border-primary/40 rounded-xl p-5 shadow-sm space-y-2">
                  <Award className="h-6 w-6 text-red-500" />
                  <h3 className="text-sm font-bold">Performance scorecards</h3>
                  <p className="text-xs text-muted-foreground">Review technician speeds, diagnostic success rates & warn alerts.</p>
                </Link>
              </div>
            </>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-1.5"><Laptop className="h-4.5 w-4.5 text-primary" /> Assigned Employee Assets</h2>
                <button onClick={() => setShowAssetModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Issue Asset
                </button>
              </div>

              <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-secondary/40 border-b border-border/60 font-bold">
                    <tr>
                      <th className="p-3">Asset Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Serial / IMEI</th>
                      <th className="p-3">Assigned User</th>
                      <th className="p-3">Issued Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-card">
                    {assets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground">No assets currently issued.</td>
                      </tr>
                    ) : (
                      assets.map((ast) => (
                        <tr key={ast.id} className="hover:bg-secondary/15">
                          <td className="p-3 font-bold">{ast.name}</td>
                          <td className="p-3 font-mono">{ast.assetType}</td>
                          <td className="p-3 text-muted-foreground">{ast.serialNumber || 'N/A'}</td>
                          <td className="p-3 font-semibold">{ast.assignedTo?.firstName} {ast.assignedTo?.lastName}</td>
                          <td className="p-3 text-muted-foreground">{new Date(ast.assignedDate).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${ast.status === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                              {ast.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {ast.status === 'ASSIGNED' && (
                              <button onClick={() => handleReturnAsset(ast.id)} className="bg-secondary hover:bg-secondary/80 text-foreground border border-border px-2.5 py-1 rounded text-[10px] font-bold shadow-sm">
                                Record Return
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold flex items-center gap-1.5"><Award className="h-4.5 w-4.5 text-primary" /> Training Courses & Sessions</h2>
                  <button onClick={() => setShowCourseModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Course
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {courses.map((crs) => (
                    <div key={crs.id} className="bg-card border border-border/60 p-4 rounded-xl space-y-3">
                      <div>
                        <h3 className="text-xs font-black text-foreground">{crs.title}</h3>
                        <p className="text-[11px] text-muted-foreground">{crs.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sessions list */}
              <div className="bg-card border border-border/60 p-4 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upcoming Sessions</h3>
                {sessions.map((sess) => (
                  <div key={sess.id} className="bg-secondary/15 border border-border/40 p-3 rounded-lg text-[11px] space-y-2">
                    <div className="font-bold text-foreground">{sess.course?.title}</div>
                    <div className="flex items-center justify-between text-muted-foreground font-semibold">
                      <span>Date: {new Date(sess.sessionDate).toLocaleDateString()}</span>
                      <span>Location: {sess.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'forecasts' && forecasts && (
            <div className="space-y-6">
              <div className="bg-card border border-border/60 p-5 rounded-xl space-y-3">
                <h3 className="text-sm font-black flex items-center gap-1.5"><BarChart3 className="h-4.5 w-4.5 text-primary" /> Headcount & Payroll Projections (6 Months Past + 3 Months Forecast)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Calculated using mathematical fit line models (y = mx + c) and rolling 3-month moving averages without external AI dependents.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Headcount */}
                <div className="bg-card border border-border/60 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Staff Headcount Trend & Projections</h4>
                  <div className="bg-secondary/10 border border-border/60 rounded-lg p-3 text-[11px] font-semibold space-y-2">
                    <div className="flex justify-between border-b border-border/40 pb-1.5 text-muted-foreground">
                      <span>Current Count:</span>
                      <strong className="text-foreground">{forecasts.headcount.history.slice(-1)[0]} employees</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5 text-muted-foreground">
                      <span>3-Month Linear Regression Forecast:</span>
                      <strong className="text-primary">{forecasts.headcount.linearForecast.join(' → ')}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>3-Month Rolling Moving Average Forecast:</span>
                      <strong className="text-foreground">{forecasts.headcount.movingAverageForecast}</strong>
                    </div>
                  </div>
                </div>

                {/* Payroll */}
                <div className="bg-card border border-border/60 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Monthly Payroll Expenditures Trend & Projections</h4>
                  <div className="bg-secondary/10 border border-border/60 rounded-lg p-3 text-[11px] font-semibold space-y-2">
                    <div className="flex justify-between border-b border-border/40 pb-1.5 text-muted-foreground">
                      <span>Current Expense:</span>
                      <strong className="text-foreground">৳{forecasts.payroll.history.slice(-1)[0].toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-1.5 text-muted-foreground">
                      <span>3-Month Linear Regression Forecast:</span>
                      <strong className="text-primary">{forecasts.payroll.linearForecast.map((v: number) => `৳${v.toLocaleString()}`).join(' → ')}</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>3-Month Rolling Moving Average Forecast:</span>
                      <strong className="text-foreground">৳{forecasts.payroll.movingAverageForecast.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'org' && (
            <div className="bg-card border border-border/60 p-6 rounded-xl space-y-6">
              <h2 className="text-sm font-bold flex items-center gap-1.5"><Network className="h-4.5 w-4.5 text-primary" /> Organizational Chart (Reporting Hierarchy)</h2>
              <div className="flex flex-col items-center justify-center p-8 bg-secondary/15 rounded-xl border border-border/40 space-y-4">
                <div className="bg-primary text-primary-foreground border px-4 py-2 rounded-lg font-black text-xs text-center shadow">
                  <div>MD Sabbir Ahmed</div>
                  <div className="text-[9px] uppercase tracking-wide opacity-80">Managing Director / Admin</div>
                </div>
                <div className="h-8 w-0.5 bg-border/80"></div>
                <div className="flex gap-12 justify-center items-start">
                  <div className="flex flex-col items-center">
                    <div className="bg-card border border-border text-foreground px-4 py-2 rounded-lg font-bold text-xs text-center shadow-sm">
                      <div>Zahid Hasan</div>
                      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Support Lead / Manager</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-card border border-border text-foreground px-4 py-2 rounded-lg font-bold text-xs text-center shadow-sm">
                      <div>Marcus Aurelius</div>
                      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Senior Technician / Lead</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 1. Issue Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-sm w-full p-6 space-y-4 text-xs font-semibold">
            <h2 className="text-lg font-black tracking-tight">Issue Employee Asset</h2>

            <div className="space-y-1">
              <label className="font-bold">Asset Name</label>
              <input
                type="text"
                value={assetForm.name}
                onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                placeholder="e.g. Dell Latitude 7420"
                className="w-full bg-secondary border border-border p-2 rounded-lg font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Asset Type</label>
              <select
                value={assetForm.assetType}
                onChange={(e) => setAssetForm({ ...assetForm, assetType: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg"
              >
                <option value="LAPTOP">Laptop Workstation</option>
                <option value="DESKTOP">Desktop PC</option>
                <option value="MOBILE">Mobile Phone</option>
                <option value="SIM">SIM Card</option>
                <option value="ACCESSORY">Other Accessories</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Serial / IMEI Number</label>
              <input
                type="text"
                value={assetForm.serialNumber}
                onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                placeholder="e.g. SN-990201"
                className="w-full bg-secondary border border-border p-2 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Assign to Employee</label>
              <select
                value={assetForm.assignedToId}
                onChange={(e) => setAssetForm({ ...assetForm, assignedToId: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg font-bold"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.userId} value={emp.userId}>{emp.user?.firstName} {emp.user?.lastName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button onClick={() => setShowAssetModal(false)} className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg">
                Cancel
              </button>
              <button onClick={handleCreateAsset} className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg">
                Confirm Issuance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-xl max-w-sm w-full p-6 space-y-4 text-xs font-semibold">
            <h2 className="text-lg font-black tracking-tight">Create Training Course</h2>

            <div className="space-y-1">
              <label className="font-bold">Course Title</label>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="e.g. ESD Compliance Training"
                className="w-full bg-secondary border border-border p-2 rounded-lg font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Course Description</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="w-full bg-secondary border border-border p-2 rounded-lg font-medium h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button onClick={() => setShowCourseModal(false)} className="border border-border text-foreground hover:bg-secondary text-xs font-bold px-3.5 py-2 rounded-lg">
                Cancel
              </button>
              <button onClick={handleCreateCourse} className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg">
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
