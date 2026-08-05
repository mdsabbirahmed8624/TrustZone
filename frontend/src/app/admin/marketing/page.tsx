'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  TrendingUp,
  Mail,
  MessageSquare,
  Smartphone,
  Tag,
  Users,
  Calendar,
  Play,
  Pause,
  Copy,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Trash2,
  Edit,
  Gift,
  Award,
  Zap,
  DollarSign,
  PieChart,
  Target,
  Sparkles,
} from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { api } from '@/lib/api';
import { useFeatureFlags } from '@/context/feature-flag-context';
import { useAdminAuth } from '@/context/admin-auth-context';
import { EmptyState } from '@/components/empty-state';

export default function MarketingConsolePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isEnabled } = useFeatureFlags();
  const { adminUser: user } = useAdminAuth();

  // Tab State: 'dashboard' | 'campaigns' | 'builder' | 'audience' | 'automation' | 'coupons' | 'referrals' | 'analytics'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'builder' | 'audience' | 'automation' | 'coupons' | 'referrals' | 'analytics'>('dashboard');

  // Data States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [audience, setAudience] = useState<any[]>([]);
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('VIP');

  // Modals / Drawers
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    channel: 'EMAIL',
    subject: '',
    bodyContent: '',
    targetSegment: 'VIP',
    budget: 5000,
    scheduledAt: '',
  });

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 500,
    expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('tz_token') || undefined : undefined;

  useEffect(() => {
    loadMarketingData();
  }, [activeTab, channelFilter, statusFilter, selectedSegment]);

  const loadMarketingData = async () => {
    setLoading(true);
    try {
      // 1. Dashboard Stats
      const statsRes = await api.marketing.fetchDashboardStats(token);
      if (statsRes.success) setStats(statsRes.data);

      if (activeTab === 'dashboard' || activeTab === 'campaigns') {
        const campRes = await api.marketing.fetchCampaigns({ channel: channelFilter, status: statusFilter, search: searchTerm }, token);
        if (campRes.success) setCampaigns(campRes.data);
      } else if (activeTab === 'builder') {
        const tempRes = await api.marketing.fetchTemplates(token);
        if (tempRes.success) setTemplates(tempRes.data);
      } else if (activeTab === 'audience') {
        const audRes = await api.marketing.fetchAudienceSegments(selectedSegment, token);
        if (audRes.success) setAudience(audRes.data);
      } else if (activeTab === 'automation') {
        const autoRes = await api.marketing.fetchAutomationRules(token);
        if (autoRes.success) setAutomationRules(autoRes.data);
      } else if (activeTab === 'coupons') {
        const cpnRes = await api.marketing.fetchCoupons(token);
        if (cpnRes.success) setCoupons(cpnRes.data);
      } else if (activeTab === 'referrals') {
        const refRes = await api.marketing.fetchReferrals(token);
        if (refRes.success) setReferrals(refRes.data);
      } else if (activeTab === 'analytics') {
        const anaRes = await api.marketing.fetchAnalytics(undefined, token);
        if (anaRes.success) setAnalytics(anaRes.data);
      }
    } catch (err) {
      console.error('Failed to load marketing data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Campaign Handlers
  const handleSaveCampaign = async () => {
    if (!campaignForm.name.trim()) return alert('Campaign name is required');
    if (!campaignForm.subject.trim() && (campaignForm.channel === 'EMAIL' || campaignForm.channel === 'WHATSAPP')) {
      return alert('Headline / Subject is required for Email & WhatsApp channels');
    }
    try {
      if (editingCampaign) {
        await api.marketing.updateCampaign(editingCampaign.id, campaignForm, token);
      } else {
        await api.marketing.createCampaign(campaignForm, token);
      }
      setShowCampaignModal(false);
      setEditingCampaign(null);
      setCampaignForm({ name: '', channel: 'EMAIL', subject: '', bodyContent: '', targetSegment: 'VIP', budget: 5000, scheduledAt: '' });
      await loadMarketingData();
    } catch (err: any) {
      alert(err.message || 'Failed to save campaign');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.marketing.duplicateCampaign(id, token);
      loadMarketingData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.marketing.updateCampaignStatus(id, status, token);
      loadMarketingData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendNow = async (id: string) => {
    try {
      await api.marketing.executeCampaignSend(id, token);
      alert('Campaign dispatched to audience members!');
      loadMarketingData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.marketing.deleteCampaign(id, token);
      loadMarketingData();
    } catch (err) {
      console.error(err);
    }
  };

  // Coupon Handler
  const handleSaveCoupon = async () => {
    if (!couponForm.code.trim()) return alert('Coupon code is required');
    try {
      await api.marketing.createCoupon(couponForm, token);
      setShowCouponModal(false);
      setCouponForm({ code: '', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 500, expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10) });
      loadMarketingData();
    } catch (err: any) {
      alert(err.message || 'Failed to save coupon');
    }
  };

  // Filter Campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(term) || (c.subject && c.subject.toLowerCase().includes(term));
    const matchesChannel = channelFilter ? c.channel === channelFilter : true;
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  return (
    <div className="min-h-screen flex bg-secondary/20 text-foreground font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div
        className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => {}}
          onOpenNotifications={() => {}}
        />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

          {/* Title Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/60 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                <Megaphone className="h-8 w-8 text-emerald-400" />
                Marketing Automation Console
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Multi-Channel Campaigns, Automated Rules Engine, Customer Segmentation, Coupons & Referral Analytics
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => {
                  setEditingCampaign(null);
                  setCampaignForm({ name: '', channel: 'EMAIL', subject: '', bodyContent: '', targetSegment: 'VIP', budget: 5000, scheduledAt: '' });
                  setShowCampaignModal(true);
                }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-md"
              >
                <Plus className="h-4 w-4" /> Create Campaign
              </button>
              <button
                onClick={loadMarketingData}
                className="flex items-center gap-2 bg-card border border-border/60 hover:bg-secondary px-4 py-2 rounded-lg text-sm text-foreground transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Sync Console
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/60 gap-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'campaigns', label: 'Campaigns Manager', icon: Megaphone },
              { id: 'builder', label: 'Templates & Builder', icon: Sparkles },
              { id: 'audience', label: 'Audience Segments', icon: Target },
              { id: 'automation', label: 'Automation Rules', icon: Zap },
              { id: 'coupons', label: 'Coupons & Vouchers', icon: Tag },
              { id: 'referrals', label: 'Referral System', icon: Award },
              { id: 'analytics', label: 'Reports & Analytics', icon: PieChart },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
              <p className="text-muted-foreground text-sm mt-4">Syncing marketing metrics with live database...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && stats && (
                <div className="space-y-6">
                  {/* Top KPI Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Campaign Overview</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">{stats.campaignOverview.activeCampaigns} Active</h3>
                        <p className="text-xs text-emerald-400 mt-1">{stats.campaignOverview.totalCampaigns} Total Launched</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                        <Megaphone className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Open & Click Rate</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">{stats.metrics.openRate}% / {stats.metrics.clickRate}%</h3>
                        <p className="text-xs text-cyan-400 mt-1">High conversion velocity</p>
                      </div>
                      <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">{stats.metrics.conversionRate}%</h3>
                        <p className="text-xs text-amber-400 mt-1">Engagement score: {stats.metrics.customerEngagementScore}/100</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                        <Target className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-card border border-border/60 p-5 rounded-xl flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Campaign Revenue</span>
                        <h3 className="text-2xl font-black text-foreground mt-1">৳{stats.metrics.campaignRevenue.toLocaleString()}</h3>
                        <p className="text-xs text-indigo-400 mt-1">Spent: ৳{stats.metrics.actualCostSpent.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                        <DollarSign className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Active Campaigns Table */}
                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg">
                    <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border/60 pb-3 flex items-center justify-between">
                      <span>Active Marketing Campaigns</span>
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20">
                        {campaigns.length} Campaigns Loaded
                      </span>
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold">
                            <th className="py-3">Campaign Name</th>
                            <th className="py-3">Channel</th>
                            <th className="py-3">Segment</th>
                            <th className="py-3">Status</th>
                            <th className="py-3">Budget / Revenue</th>
                            <th className="py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.slice(0, 5).map(c => (
                            <tr key={c.id} className="border-b border-border/60 hover:bg-secondary/20">
                              <td className="py-3 font-bold text-foreground">{c.name}</td>
                              <td className="py-3">
                                <span className="bg-secondary text-foreground px-2 py-0.5 rounded text-[10px] font-mono">
                                  {c.channel}
                                </span>
                              </td>
                              <td className="py-3 text-muted-foreground">{c.targetSegment || 'All'}</td>
                              <td className="py-3">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                                  c.status === 'SCHEDULED' ? 'bg-cyan-500/20 text-cyan-400' :
                                  c.status === 'COMPLETED' ? 'bg-indigo-500/20 text-indigo-400' :
                                  'bg-secondary text-muted-foreground'
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="py-3 text-foreground font-mono">৳{c.budget} / ৳{c.revenueGenerated}</td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleSendNow(c.id)}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] transition-colors"
                                >
                                  Dispatch
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CAMPAIGNS MANAGER */}
              {activeTab === 'campaigns' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search campaign name or subject..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-secondary/20 border border-border/60 rounded-lg text-xs text-foreground outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={channelFilter}
                        onChange={e => setChannelFilter(e.target.value)}
                        className="bg-secondary/20 border border-border/60 text-xs text-foreground px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                      >
                        <option value="">All Channels</option>
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="PUSH">Push Notification</option>
                        <option value="IN_APP">In-App</option>
                      </select>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-secondary/20 border border-border/60 text-xs text-foreground px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PAUSED">Paused</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Campaigns Table */}
                  {filteredCampaigns.length === 0 ? (
                    <EmptyState
                      icon={Megaphone}
                      title="No Marketing Campaigns Found"
                      description="No multi-channel promotional campaigns match your filter criteria. Launch your first email, SMS, or WhatsApp campaign now."
                      action={
                        <button
                          onClick={() => {
                            setEditingCampaign(null);
                            setCampaignForm({ name: '', channel: 'EMAIL', subject: '', bodyContent: '', targetSegment: 'VIP', budget: 5000, scheduledAt: '' });
                            setShowCampaignModal(true);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-md flex items-center gap-1.5"
                        >
                          <Plus className="h-4 w-4" /> Create Campaign
                        </button>
                      }
                    />
                  ) : (
                    <div className="overflow-x-auto border border-border/60 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/20">
                            <th className="py-3 px-4">Campaign Name & Subject</th>
                            <th className="py-3 px-4">Channel</th>
                            <th className="py-3 px-4">Target Segment</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Scheduled At</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCampaigns.map(c => (
                            <tr key={c.id} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-foreground">{c.name}</div>
                                {c.subject && <div className="text-[11px] text-muted-foreground">{c.subject}</div>}
                              </td>
                              <td className="py-3 px-4 font-mono text-foreground">
                                <span className="bg-secondary/20 px-2 py-0.5 rounded text-[10px] border border-border/60">
                                  {c.channel}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground font-medium">{c.targetSegment || 'VIP'}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                                  c.status === 'SCHEDULED' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' :
                                  c.status === 'COMPLETED' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' :
                                  'bg-secondary text-muted-foreground'
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground font-mono">
                                {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : 'Immediate'}
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5">
                                <button
                                  onClick={() => handleSendNow(c.id)}
                                  title="Send / Dispatch Now"
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 rounded text-xs font-bold transition-colors shadow-sm"
                                >
                                  Send
                                </button>
                                <button
                                  onClick={() => handleDuplicate(c.id)}
                                  title="Duplicate Campaign"
                                  className="bg-secondary hover:bg-slate-700 text-foreground px-2.5 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  Duplicate
                                </button>
                                <button
                                  onClick={() => handleDeleteCampaign(c.id)}
                                  title="Delete"
                                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded text-xs transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BUILDER & TEMPLATES */}
              {activeTab === 'builder' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">Available Variables</h3>
                    <p className="text-xs text-muted-foreground">Inject dynamic placeholders into email, SMS, and WhatsApp messages:</p>

                    <div className="space-y-2">
                      {[
                        { var: '{{customerName}}', desc: 'Customer full name' },
                        { var: '{{invoiceNumber}}', desc: 'Active billing invoice' },
                        { var: '{{repairStatus}}', desc: 'Current workspace status' },
                        { var: '{{warrantyDate}}', desc: 'Coverage expiry date' },
                        { var: '{{technicianName}}', desc: 'Assigned specialist' },
                        { var: '{{branchName}}', desc: 'Service center location' },
                        { var: '{{couponCode}}', desc: 'Discount voucher code' },
                      ].map(v => (
                        <div key={v.var} className="bg-secondary/20 border border-border/60 p-2.5 rounded-lg flex items-center justify-between text-xs">
                          <code className="text-emerald-400 font-mono">{v.var}</code>
                          <span className="text-muted-foreground">{v.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">Marketing Templates Library</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map(t => (
                        <div key={t.id} className="bg-secondary/20 border border-border/60 p-4 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground text-sm">{t.name}</span>
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-500/20">
                              {t.channel}
                            </span>
                          </div>
                          {t.subject && <p className="text-xs font-semibold text-muted-foreground">Subject: {t.subject}</p>}
                          <p className="text-xs text-foreground bg-card p-3 rounded border border-border/60 line-clamp-3">
                            {t.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIENCE SEGMENTS */}
              {activeTab === 'audience' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/60 pb-3 gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Customer Audience Segmentation</h3>
                      <p className="text-xs text-muted-foreground">Filter target audience by VIP status, inactivity, pending payments, or high spending</p>
                    </div>
                    <div className="flex gap-2">
                      {['VIP', 'INACTIVE', 'HIGH_SPENDING', 'PENDING_PAYMENT', 'WARRANTY_EXPIRING'].map(seg => (
                        <button
                          key={seg}
                          onClick={() => setSelectedSegment(seg)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedSegment === seg ? 'bg-emerald-500 text-slate-950' : 'bg-secondary/20 text-muted-foreground border border-border/60 hover:text-foreground'
                          }`}
                        >
                          {seg.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold">
                          <th className="py-3">Customer Name</th>
                          <th className="py-3">Contact (Email / Phone)</th>
                          <th className="py-3">Loyalty Points</th>
                          <th className="py-3">Due Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {audience.map(cust => (
                          <tr key={cust.id} className="border-b border-border/60 hover:bg-secondary/20">
                            <td className="py-3 font-bold text-foreground">{cust.firstName} {cust.lastName}</td>
                            <td className="py-3 text-foreground font-mono">{cust.email} / {cust.phone}</td>
                            <td className="py-3 font-mono text-emerald-400 font-bold">{cust.loyaltyPoints || 0} PTS</td>
                            <td className="py-3 font-mono text-rose-400 font-bold">৳{cust.dueBalance || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: AUTOMATION RULES */}
              {activeTab === 'automation' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-border/60 pb-3">
                    <h3 className="text-lg font-bold text-foreground">Automated Event Trigger Workflows</h3>
                    <p className="text-xs text-muted-foreground">System triggers automatic email/SMS actions on lifecycle events</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Customer Created → Welcome Message', trigger: 'CUSTOMER_CREATED', status: 'ENABLED' },
                      { title: 'Repair Completed → Review Request', trigger: 'REPAIR_COMPLETED', status: 'ENABLED' },
                      { title: 'Invoice Paid → Thank You Receipt', trigger: 'INVOICE_PAID', status: 'ENABLED' },
                      { title: 'Warranty Expiring → Renewal Alert', trigger: 'WARRANTY_EXPIRING', status: 'ENABLED' },
                      { title: 'Customer Birthday → Gift Coupon', trigger: 'BIRTHDAY', status: 'ENABLED' },
                    ].map(r => (
                      <div key={r.trigger} className="bg-secondary/20 border border-border/60 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{r.title}</h4>
                          <span className="text-[11px] font-mono text-emerald-400 mt-1 block">Trigger: {r.trigger}</span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-500/20">
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: COUPONS & VOUCHERS */}
              {activeTab === 'coupons' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-border/60 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Promotional Vouchers & Coupons</h3>
                      <p className="text-xs text-muted-foreground">Discount promo codes for checkout and repair invoice billing</p>
                    </div>
                    <button
                      onClick={() => setShowCouponModal(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Create Coupon
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {coupons.map(cp => (
                      <div key={cp.id} className="bg-secondary/20 border border-border/60 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-base font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                            {cp.code}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cp.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {cp.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                          {cp.discountType === 'PERCENTAGE' ? `${cp.discountValue}% OFF` : `৳${cp.discountValue} OFF`}
                        </div>
                        <p className="text-xs text-muted-foreground">Min Order: ৳{cp.minOrderValue}</p>
                        <p className="text-[11px] text-muted-foreground">Expiry Date: {new Date(cp.expiryDate).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: REFERRAL SYSTEM */}
              {activeTab === 'referrals' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-border/60 pb-3">
                    <h3 className="text-lg font-bold text-foreground">Customer Referral Program</h3>
                    <p className="text-xs text-muted-foreground">Track client referral codes and bonus reward point allocations</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold">
                          <th className="py-3">Customer Name</th>
                          <th className="py-3">Referral Code</th>
                          <th className="py-3">Total Referrals</th>
                          <th className="py-3">Points Earned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map((r, idx) => (
                          <tr key={idx} className="border-b border-border/60 hover:bg-secondary/20">
                            <td className="py-3 font-bold text-foreground">{r.customerName}</td>
                            <td className="py-3 font-mono text-emerald-400 font-bold">{r.referralCode}</td>
                            <td className="py-3 font-mono text-foreground">{r.totalReferrals} Users</td>
                            <td className="py-3 font-mono text-amber-400 font-bold">৳{r.pointsEarned} PTS</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: REPORTS & ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="bg-card border border-border/60 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/60 pb-3 gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Campaign Performance Reports</h3>
                      <p className="text-xs text-muted-foreground">Delivery, open rate, click-through conversion and ROI breakdown</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert('Exporting Campaign Report to PDF...')}
                        className="bg-secondary/20 border border-border/60 text-foreground hover:bg-secondary/40 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-semibold"
                      >
                        <FileText className="h-3.5 w-3.5 text-rose-400" /> Export PDF
                      </button>
                      <button
                        onClick={() => alert('Exporting Campaign Report to Excel...')}
                        className="bg-secondary/20 border border-border/60 text-foreground hover:bg-secondary/40 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-semibold"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Export Excel
                      </button>
                    </div>
                  </div>

                  {analytics.length === 0 ? (
                    <EmptyState
                      icon={PieChart}
                      title="No Campaign Analytics Records Found"
                      description="No performance telemetry has been recorded for your marketing campaigns yet. Launch a campaign to view delivery, open rate, and ROI metrics."
                      action={
                        <button
                          onClick={loadMarketingData}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-md flex items-center gap-1.5"
                        >
                          <RefreshCw className="h-4 w-4" /> Refresh Analytics
                        </button>
                      }
                    />
                  ) : (
                    <div className="overflow-x-auto border border-border/60 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider font-bold bg-secondary/20">
                            <th className="py-3 px-4">Campaign Name</th>
                            <th className="py-3 px-4">Channel</th>
                            <th className="py-3 px-4">Recipients</th>
                            <th className="py-3 px-4">Delivered / Opened</th>
                            <th className="py-3 px-4">Revenue / Budget</th>
                            <th className="py-3 px-4">ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.map((a: any, idx: number) => {
                            const name = a.campaignName || a.name || a.month || `Campaign #${idx + 1}`;
                            const channel = a.channel || (a.emailSent ? 'EMAIL & SMS' : 'MULTI_CHANNEL');
                            const recipients = a.metrics?.totalRecipients ?? a.recipients ?? (a.emailSent ? a.emailSent + a.smsSent : 0);
                            const sent = a.metrics?.sentCount ?? a.sent ?? a.emailSent ?? 0;
                            const opened = a.metrics?.openedCount ?? a.opened ?? a.conversions ?? 0;
                            const revenue = a.metrics?.revenueGenerated ?? a.revenue ?? 0;
                            const budget = a.metrics?.budget ?? a.budget ?? 5000;
                            const roi = a.metrics?.roi ?? (budget > 0 ? Math.round(((revenue - budget) / budget) * 100) : 0);

                            return (
                              <tr key={a.id || idx} className="border-b border-border/60 hover:bg-secondary/20 transition-colors">
                                <td className="py-3 px-4 font-bold text-foreground">{name}</td>
                                <td className="py-3 px-4 font-mono text-muted-foreground">
                                  <span className="bg-secondary/20 px-2 py-0.5 rounded text-[10px] border border-border/60">
                                    {channel}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-foreground">{recipients.toLocaleString()}</td>
                                <td className="py-3 px-4 font-mono text-emerald-400">{sent.toLocaleString()} / {opened.toLocaleString()}</td>
                                <td className="py-3 px-4 font-mono text-foreground">৳{revenue.toLocaleString()} / ৳{budget.toLocaleString()}</td>
                                <td className="py-3 px-4 font-mono font-black text-emerald-400">{roi > 0 ? `+${roi}%` : `${roi}%`}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* CREATE / EDIT CAMPAIGN MODAL */}
          {showCampaignModal && (
            <div className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border/60 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">
                  {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Campaign Name</label>
                    <input
                      type="text"
                      value={campaignForm.name}
                      onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      placeholder="e.g. Summer Screen Replacement Discount"
                      className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Channel</label>
                      <select
                        value={campaignForm.channel}
                        onChange={e => setCampaignForm({ ...campaignForm, channel: e.target.value })}
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                      >
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="PUSH">Push Notification</option>
                        <option value="IN_APP">In-App</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Target Segment</label>
                      <select
                        value={campaignForm.targetSegment}
                        onChange={e => setCampaignForm({ ...campaignForm, targetSegment: e.target.value })}
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                      >
                        <option value="VIP">VIP Members</option>
                        <option value="INACTIVE">Inactive Customers</option>
                        <option value="HIGH_SPENDING">High Spending</option>
                        <option value="PENDING_PAYMENT">Pending Payment</option>
                        <option value="WARRANTY_EXPIRING">Warranty Expiring</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Subject / Headline</label>
                    <input
                      type="text"
                      value={campaignForm.subject}
                      onChange={e => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                      placeholder="e.g. Special 15% Off Your Next Smartphone Repair!"
                      className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Message Body</label>
                    <textarea
                      rows={3}
                      value={campaignForm.bodyContent}
                      onChange={e => setCampaignForm({ ...campaignForm, bodyContent: e.target.value })}
                      placeholder="Hello {{customerName}}, enjoy 15% off repair service with coupon code {{couponCode}}."
                      className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="bg-secondary/20 text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCampaign}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
                  >
                    Save Campaign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE COUPON MODAL */}
          {showCouponModal && (
            <div className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border/60 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">Create Promotional Coupon</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-semibold">Coupon Code</label>
                    <input
                      type="text"
                      value={couponForm.code}
                      onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUMMER100"
                      className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Discount Type</label>
                      <select
                        value={couponForm.discountType}
                        onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED_AMOUNT">Fixed Amount (৳)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Value</label>
                      <input
                        type="number"
                        value={couponForm.discountValue}
                        onChange={e => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                        className="w-full bg-secondary/20 border border-border/60 rounded-lg p-2 text-foreground outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                  <button
                    onClick={() => setShowCouponModal(false)}
                    className="bg-secondary/20 text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCoupon}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
                  >
                    Create Coupon
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
