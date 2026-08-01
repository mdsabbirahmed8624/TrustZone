'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useFeatureFlags } from '@/context/feature-flag-context';
import { useAdminAuth } from '@/context/admin-auth-context';
import {
  Award,
  MessageSquare,
  Mail,
  Phone,
  Search,
  Filter,
  User,
  Plus,
  Send,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  UserCheck,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Tag,
  Settings,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export default function CrmPage() {
  const { isEnabled } = useFeatureFlags();
  const { adminUser: user } = useAdminAuth();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'dashboard' | 'loyalty' | 'comms' | 'feedback'>('dashboard');

  // Stats and data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loyaltyTx, setLoyaltyTx] = useState<any[]>([]);
  const [comms, setComms] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerTimeline, setCustomerTimeline] = useState<any[]>([]);
  const [timelineType, setTimelineType] = useState<string>('');

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [npsScoreFilter, setNpsScoreFilter] = useState('');
  const [commTypeFilter, setCommTypeFilter] = useState('');
  const [commStatusFilter, setCommStatusFilter] = useState('');

  // Dialogs/Drawer control
  const [isAdjustDrawerOpen, setIsAdjustDrawerOpen] = useState(false);
  const [isRedeemDrawerOpen, setIsRedeemDrawerOpen] = useState(false);
  const [isCommDrawerOpen, setIsCommDrawerOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Form states
  const [adjustData, setAdjustData] = useState({ pointsDelta: 10, description: '' });
  const [redeemData, setRedeemData] = useState({ points: 20, description: '', referenceId: '' });
  const [commData, setCommData] = useState({ type: 'SMS', subject: '', message: '' });
  const [feedbackData, setFeedbackData] = useState({ npsScore: 10, comments: '', wouldRecommend: 'Yes', followUpRequired: false });
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);

  // Expiration State
  const [expiryDays, setExpiryDays] = useState(365);
  const [manualTicketId, setManualTicketId] = useState('');

  useEffect(() => {
    loadAllCrmData();
  }, [activeTab]);

  const loadAllCrmData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('tz_token') || undefined;

      // 1. Fetch dashboard stats
      const statsRes = await api.crm.fetchDashboardStats(token);
      if (statsRes.success) setStats(statsRes.data);

      // 2. Fetch customers list
      const customersRes = await api.customers.list({}, token);
      if (customersRes.success) setCustomers(customersRes.data);

      if (activeTab === 'loyalty') {
        const txRes = await api.crm.fetchLoyaltyTransactions({}, token);
        if (txRes.success) setLoyaltyTx(txRes.data);
      } else if (activeTab === 'comms') {
        const commsRes = await api.crm.fetchCommunications({}, token);
        if (commsRes.success) setComms(commsRes.data);
      } else if (activeTab === 'feedback') {
        const fbRes = await api.crm.fetchFeedback({}, token);
        if (fbRes.success) setFeedbacks(fbRes.data);
      }
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = async (cust: any) => {
    setSelectedCustomer(cust);
    const token = localStorage.getItem('tz_token') || undefined;
    try {
      const timelineRes = await api.crm.fetchCustomerTimeline(cust.id, timelineType ? { type: timelineType } : undefined, token);
      if (timelineRes.success) {
        setCustomerTimeline(timelineRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch customer timeline:', err);
    }
  };

  const handleTimelineFilterChange = async (type: string) => {
    setTimelineType(type);
    if (!selectedCustomer) return;
    const token = localStorage.getItem('tz_token') || undefined;
    try {
      const timelineRes = await api.crm.fetchCustomerTimeline(selectedCustomer.id, type ? { type } : undefined, token);
      if (timelineRes.success) {
        setCustomerTimeline(timelineRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch customer timeline:', err);
    }
  };

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const token = localStorage.getItem('tz_token') || undefined;
    try {
      const res = await api.crm.adjustLoyaltyPoints({
        customerId: selectedCustomer.id,
        pointsDelta: Number(adjustData.pointsDelta),
        description: adjustData.description,
      }, token);

      if (res.success) {
        setIsAdjustDrawerOpen(false);
        setAdjustData({ pointsDelta: 10, description: '' });
        loadAllCrmData();
        if (selectedCustomer) handleSelectCustomer({
          ...selectedCustomer,
          loyaltyPoints: selectedCustomer.loyaltyPoints + Number(adjustData.pointsDelta)
        });
      }
    } catch (err) {
      alert('Error adjusting points: ' + err);
    }
  };

  const handleRedeemPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const token = localStorage.getItem('tz_token') || undefined;
    try {
      const res = await api.crm.redeemLoyaltyPoints({
        customerId: selectedCustomer.id,
        points: Number(redeemData.points),
        description: redeemData.description,
        referenceId: redeemData.referenceId || undefined,
      }, token);

      if (res.success) {
        setIsRedeemDrawerOpen(false);
        setRedeemData({ points: 20, description: '', referenceId: '' });
        loadAllCrmData();
        if (selectedCustomer) handleSelectCustomer({
          ...selectedCustomer,
          loyaltyPoints: selectedCustomer.loyaltyPoints - Number(redeemData.points)
        });
      }
    } catch (err) {
      alert('Error redeeming points: ' + err);
    }
  };

  const handleCommSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const token = localStorage.getItem('tz_token') || undefined;
    try {
      const res = await api.crm.logCommunication({
        customerId: selectedCustomer.id,
        type: commData.type,
        subject: commData.type === 'Email' ? commData.subject : undefined,
        message: commData.message,
      }, token);

      if (res.success) {
        setIsCommDrawerOpen(false);
        setCommData({ type: 'SMS', subject: '', message: '' });
        loadAllCrmData();
        handleSelectCustomer(selectedCustomer);
      }
    } catch (err) {
      alert('Error sending message: ' + err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFeedbackId) return;
    const token = localStorage.getItem('tz_token') || undefined;
    try {
      const res = await api.crm.submitFeedback(activeFeedbackId, feedbackData, token);
      if (res.success) {
        setIsFeedbackModalOpen(false);
        setActiveFeedbackId(null);
        setFeedbackData({ npsScore: 10, comments: '', wouldRecommend: 'Yes', followUpRequired: false });
        loadAllCrmData();
      }
    } catch (err) {
      alert('Error submitting feedback: ' + err);
    }
  };

  const handleTriggerManualSurvey = async () => {
    if (!manualTicketId) return;
    const token = localStorage.getItem('tz_token') || undefined;
    try {
      const res = await api.crm.triggerManualSurvey(manualTicketId, token);
      if (res.success) {
        alert('NPS Survey invitation sent successfully.');
        setManualTicketId('');
        loadAllCrmData();
      }
    } catch (err) {
      alert('Error triggering survey: ' + err);
    }
  };

  const handleTriggerExpiration = async () => {
    const token = localStorage.getItem('tz_token') || undefined;
    try {
      const res = await api.crm.expireLoyaltyPoints(expiryDays, token);
      if (res.success) {
        alert(`Expired points calculated. Customers updated. Total Expired Points Processed: ${res.data.expiredPointsCount}`);
        loadAllCrmData();
      }
    } catch (err) {
      alert('Error expiring points: ' + err);
    }
  };

  if (!isEnabled('crm')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-100">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold tracking-wide">CRM Module Locked</h2>
        <p className="text-slate-400 mt-2 text-sm max-w-md text-center">
          The Customer Relationship Management & Loyalty points feature flag is currently disabled in your workspace options. Enable it in settings to proceed.
        </p>
      </div>
    );
  }

  // Filter lists
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term);

    const matchesTag = selectedTag ? c.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const filteredComms = comms.filter(c => {
    const matchesType = commTypeFilter ? c.type === commTypeFilter : true;
    const matchesStatus = commStatusFilter ? c.status === commStatusFilter : true;
    return matchesType && matchesStatus;
  });

  const filteredFeedbacks = feedbacks.filter(f => {
    if (!npsScoreFilter) return true;
    const score = f.npsScore;
    if (npsScoreFilter === 'promoters') return score >= 9;
    if (npsScoreFilter === 'passives') return score >= 7 && score <= 8;
    if (npsScoreFilter === 'detractors') return score <= 6;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            CRM & Loyalty Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enterprise Client Profiles, Multi-Channel Communications, Loyalty Points Ledgers, and NPS Satisfaction Feedback
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={loadAllCrmData}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm transition-colors text-slate-300"
          >
            <RefreshCw className="h-4 w-4" />
            Sync Dashboard
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          NPS & Growth Dashboard
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'loyalty'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="h-4 w-4" />
          Loyalty Points Center
        </button>
        <button
          onClick={() => setActiveTab('comms')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'comms'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="h-4 w-4" />
          Communication Logs
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          NPS Feedbacks feed
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm mt-4">Retrieving active CRM profiles from database...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Top KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Loyalty Members</span>
                    <h3 className="text-2xl font-black text-slate-100 mt-1">{stats.activeLoyaltyMembers} / {stats.totalCustomers}</h3>
                    <p className="text-xs text-emerald-400 mt-1">{(stats.activeLoyaltyMembers/stats.totalCustomers * 100).toFixed(0)}% Participation Rate</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <UserCheck className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Points Issued vs Redeemed</span>
                    <h3 className="text-2xl font-black text-slate-100 mt-1">৳{stats.totalPointsIssued} / ৳{stats.totalPointsRedeemed}</h3>
                    <p className="text-xs text-amber-400 mt-1">৳{stats.totalExpiredPoints} points expired</p>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Award className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Net Promoter Score (NPS)</span>
                    <h3 className="text-3xl font-black text-slate-100 mt-1">
                      {stats.npsScore > 0 ? `+${stats.npsScore}` : stats.npsScore}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Average rating: {stats.npsAverage} / 10</p>
                  </div>
                  <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Survey Response Rate</span>
                    <h3 className="text-2xl font-black text-slate-100 mt-1">{stats.surveyResponseRate}%</h3>
                    <p className="text-xs text-emerald-400 mt-1">Industry benchmark is ~30%</p>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* NPS Score Breakdown Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-lg font-bold mb-4 text-slate-200 border-b border-slate-800 pb-2">NPS Distribution</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-emerald-400">
                        <span>Promoters (9-10 Score)</span>
                        <span>{stats.promotersPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.promotersPercent}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
                        <span>Passives (7-8 Score)</span>
                        <span>{stats.passivesPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                        <div className="bg-slate-500 h-full rounded-full" style={{ width: `${stats.passivesPercent}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-rose-400">
                        <span>Detractors (0-6 Score)</span>
                        <span>{stats.detractorsPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${stats.detractorsPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-slate-950 rounded-lg text-xs text-slate-400 flex items-start gap-2 border border-slate-800">
                    <AlertCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>NPS Calculation Rule:</strong> Net Promoter Score is calculated by subtracting the percentage of Detractors from the percentage of Promoters. Score ranges from -100 to +100.
                    </span>
                  </div>
                </div>

                {/* Growth and Communications channels chart summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-lg font-bold mb-4 text-slate-200 border-b border-slate-800 pb-2">Customer Outreach Channels</h3>
                  <div className="space-y-3">
                    {stats.communicationActivity?.map((c: any) => (
                      <div key={c.channel} className="flex justify-between items-center bg-slate-950/60 p-3 rounded-lg border border-slate-850">
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400">
                            {c.channel === 'Email' ? <Mail className="h-4 w-4" /> : c.channel === 'SMS' ? <Phone className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-300">{c.channel}</p>
                            <p className="text-[10px] text-slate-500">Scheduled template campaigns</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-200">{c.count} Sent</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expiration and Manual dispatcher settings panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">CRM Action Center</h3>
                  
                  {/* Point expiration trigger */}
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
                    <label className="text-xs font-bold text-slate-400 block mb-2 uppercase">Loyalty Points Expiration</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-24 outline-none focus:border-emerald-500"
                        placeholder="Days (e.g. 365)"
                      />
                      <button
                        onClick={handleTriggerExpiration}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors grow"
                      >
                        Force Point Expiration
                      </button>
                    </div>
                  </div>

                  {/* Manual survey dispatcher */}
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
                    <label className="text-xs font-bold text-slate-400 block mb-2 uppercase">Manually Send NPS Invitation</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualTicketId}
                        onChange={(e) => setManualTicketId(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 grow outline-none focus:border-emerald-500"
                        placeholder="Paste Ticket ID..."
                      />
                      <button
                        onClick={handleTriggerManualSurvey}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Dispatch Survey
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* VIP and Detractor follow-up grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* VIP Members list */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-lg font-bold mb-4 text-slate-200 border-b border-slate-800 pb-2">Top Loyalty Members (VIPs)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-2">Customer</th>
                          <th className="py-2">Phone</th>
                          <th className="py-2 text-right">Points Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topVipCustomers?.map((vip: any) => (
                          <tr key={vip.id} className="border-b border-slate-850 hover:bg-slate-950/50">
                            <td className="py-3 font-semibold text-slate-200">{vip.name}</td>
                            <td className="py-3 text-slate-400">{vip.phone}</td>
                            <td className="py-3 text-right text-emerald-400 font-bold">{vip.loyaltyPoints} PTS</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Followups list */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-lg font-bold mb-4 text-slate-200 border-b border-slate-800 pb-2">Surveys Requiring Detractor Follow-up</h3>
                  {stats.customersRequiringFollowUp?.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No unresolved negative feedback alerts. Great job!</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.customersRequiringFollowUp?.map((f: any) => (
                        <div key={f.feedbackId} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Score: {f.npsScore}</span>
                              <span className="text-xs font-semibold text-slate-200">{f.customerName}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 italic">"{f.comments || 'No comment provided'}"</p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveFeedbackId(f.feedbackId);
                              setIsFeedbackModalOpen(true);
                            }}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap self-end md:self-auto"
                          >
                            Resolve Alert
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOYALTY PROGRAM CENTER */}
          {activeTab === 'loyalty' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer List */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2">
                <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-200">Customer Points Ledger</h3>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative grow">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 w-full"
                      />
                    </div>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                    >
                      <option value="">All Tags</option>
                      <option value="VIP">VIP</option>
                      <option value="Regular">Regular</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Dealer">Dealer</option>
                      <option value="Blacklisted">Blacklisted</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="py-3">Customer</th>
                        <th className="py-3">Tags</th>
                        <th className="py-3">Contact</th>
                        <th className="py-3 text-right">Points</th>
                        <th className="py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((cust) => (
                        <tr
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className={`border-b border-slate-850 hover:bg-slate-950/40 cursor-pointer transition-colors ${
                            selectedCustomer?.id === cust.id ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <td className="py-3">
                            <div className="font-semibold text-slate-200">{cust.firstName} {cust.lastName}</div>
                            <span className="text-[10px] text-slate-500">ID: {cust.id.substring(0, 8)}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1 flex-wrap">
                              {cust.tags?.map((t: string) => (
                                <span
                                  key={t}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    t === 'VIP' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    t === 'Blacklisted' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                    'bg-slate-800 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="text-slate-300">{cust.phone}</div>
                            <span className="text-[10px] text-slate-500">{cust.email}</span>
                          </td>
                          <td className="py-3 text-right font-black text-emerald-400 text-sm">
                            {cust.loyaltyPoints} PTS
                          </td>
                          <td className="py-3 text-right">
                            <button className="text-emerald-400 hover:text-emerald-300 p-1">
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer 360 Timeline Profile Details */}
              <div className="space-y-6">
                {selectedCustomer ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
                    {/* Header profile details */}
                    <div className="border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200">{selectedCustomer.firstName} {selectedCustomer.lastName}</h4>
                          <span className="text-xs text-slate-400">Preferred Language: {selectedCustomer.preferredLanguage || 'English'}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                        <span className="bg-slate-950 px-2 py-1 rounded border border-slate-850 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Time: {selectedCustomer.preferredContactTime || 'Anytime'}
                        </span>
                        <span className="bg-slate-950 px-2 py-1 rounded border border-slate-850 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Channel: {selectedCustomer.preferredCommunicationChannel || 'Email'}
                        </span>
                      </div>
                    </div>

                    {/* Quick loyalty actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIsAdjustDrawerOpen(true)}
                        className="bg-slate-950 border border-slate-800 hover:bg-slate-850 px-3 py-2 rounded-lg text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Settings className="h-3.5 w-3.5 text-slate-400" />
                        Manual Adjust
                      </button>
                      <button
                        onClick={() => setIsRedeemDrawerOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Award className="h-3.5 w-3.5" />
                        Redeem Points
                      </button>
                    </div>

                    <button
                      onClick={() => setIsCommDrawerOpen(true)}
                      className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="h-3.5 w-3.5 text-slate-400" />
                      Dispatch Message (Email/SMS)
                    </button>

                    {/* Timeline logs */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase">Customer Activity Timeline</h4>
                        <select
                          value={timelineType}
                          onChange={(e) => handleTimelineFilterChange(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-[10px] text-slate-400 rounded px-1.5 py-0.5"
                        >
                          <option value="">All Events</option>
                          <option value="CUSTOMER_CREATED">Created</option>
                          <option value="TICKET_CREATED">Ticket Created</option>
                          <option value="TICKET_STATUS_CHANGED">Status Update</option>
                          <option value="PAYMENT_RECEIVED">Payment</option>
                          <option value="LOYALTY_EARNED">Points Earned</option>
                          <option value="LOYALTY_REDEEMED">Points Redeemed</option>
                          <option value="SURVEY_SENT">Survey Sent</option>
                        </select>
                      </div>

                      {customerTimeline.length === 0 ? (
                        <p className="text-[11px] text-slate-500 text-center py-6">No matching activity history logs found.</p>
                      ) : (
                        <div className="relative border-l border-slate-800 pl-4 space-y-4 max-h-[300px] overflow-y-auto pr-1">
                          {customerTimeline.map((item) => (
                            <div key={item.id} className="relative">
                              <span className="absolute -left-[21px] mt-0.5 bg-slate-900 border border-slate-800 h-3 w-3 rounded-full flex items-center justify-center">
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  item.type.includes('EARNED') ? 'bg-emerald-400' :
                                  item.type.includes('REDEEMED') ? 'bg-rose-400' :
                                  item.type.includes('CREATED') ? 'bg-indigo-400' :
                                  'bg-slate-400'
                                }`}></span>
                              </span>
                              <div className="text-[11px] font-semibold text-slate-200">{item.title}</div>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                              <span className="text-[9px] text-slate-500 mt-1 block">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center min-h-[300px] text-slate-500">
                    <User className="h-10 w-10 text-slate-600 mb-2" />
                    <p className="text-xs text-center">Select a customer from the points ledger table to inspect 360-degree timeline logs and trigger points actions.</p>
                  </div>
                )}

                {/* Expiration Rules Log / Quick summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md text-xs text-slate-400 space-y-2">
                  <h4 className="font-bold text-slate-300">Loyalty Expiration Rules</h4>
                  <p>Points expire exactly **365 days** post-earning by default unless spent. Manual point reductions follow FIFO order.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMUNICATIONS LOG */}
          {activeTab === 'comms' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-200">Customer Communication Logs</h3>
                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    value={commTypeFilter}
                    onChange={(e) => setCommTypeFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                  >
                    <option value="">All Channels</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                  <select
                    value={commStatusFilter}
                    onChange={(e) => setCommStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Sent">Sent</option>
                    <option value="Failed">Failed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-3">Timestamp</th>
                      <th className="py-3">Customer</th>
                      <th className="py-3">Channel</th>
                      <th className="py-3">Subject / Message</th>
                      <th className="py-3">Sender</th>
                      <th className="py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComms.map((c) => (
                      <tr key={c.id} className="border-b border-slate-850 hover:bg-slate-950/20">
                        <td className="py-3 text-slate-500 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 font-semibold text-slate-200">
                          {c.customer ? `${c.customer.firstName} ${c.customer.lastName}` : 'Guest Customer'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.type === 'Email' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            c.type === 'SMS' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="py-3 max-w-xs md:max-w-md">
                          {c.subject && <div className="font-semibold text-slate-300">Subject: {c.subject}</div>}
                          <p className="text-slate-400 truncate mt-0.5" title={c.message}>{c.message}</p>
                        </td>
                        <td className="py-3 text-slate-400">{c.staffName || 'System'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'Delivered' || c.status === 'Read' ? 'bg-emerald-500/10 text-emerald-400' :
                            c.status === 'Failed' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SATISFACTION FEEDBACK FEED */}
          {activeTab === 'feedback' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-200">Customer NPS Surveys & Reviews</h3>
                <div className="flex gap-2">
                  <select
                    value={npsScoreFilter}
                    onChange={(e) => setNpsScoreFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                  >
                    <option value="">All NPS Scores</option>
                    <option value="promoters">Promoters (9-10)</option>
                    <option value="passives">Passives (7-8)</option>
                    <option value="detractors">Detractors (0-6)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-4 ${
                      fb.npsScore >= 9 ? 'bg-emerald-500/5 border-emerald-500/10' :
                      fb.npsScore <= 6 ? 'bg-rose-500/5 border-rose-500/10' :
                      'bg-slate-950 border-slate-850'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-200">{fb.customer ? `${fb.customer.firstName} ${fb.customer.lastName}` : 'Guest Customer'}</h4>
                          <span className="text-[10px] text-slate-500">Ticket ID: {fb.ticketId.substring(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-black ${
                            fb.npsScore >= 9 ? 'bg-emerald-500/20 text-emerald-400' :
                            fb.npsScore <= 6 ? 'bg-rose-500/20 text-rose-400' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            Score: {fb.npsScore || 'N/A'}/10
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 italic mt-3">
                        "{fb.comments || 'No comment provided'}"
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          Recommend: {fb.wouldRecommend || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          {fb.followUpRequired ? (
                            <span className="text-rose-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Follow-up Required
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> No Follow-up
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-850 pt-3 mt-1 text-[10px] text-slate-500">
                      <span>Submitted: {new Date(fb.createdAt).toLocaleDateString()}</span>
                      {fb.followUpRequired && fb.resolutionStatus === 'PENDING' && (
                        <button
                          onClick={() => {
                            setActiveFeedbackId(fb.id);
                            setIsFeedbackModalOpen(true);
                          }}
                          className="bg-emerald-500 text-slate-950 px-2.5 py-1 rounded font-bold hover:bg-emerald-600 transition-colors"
                        >
                          Resolve Alert
                        </button>
                      )}
                      {fb.resolutionStatus === 'RESOLVED' && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* DIALOGS / DRAWERS */}
      
      {/* 1. MANUAL POINTS ADJUSTMENT DRAWER */}
      {isAdjustDrawerOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md p-6 h-full shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <Settings className="h-5 w-5 text-emerald-400" />
                Manual Point Adjustment
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Perform manual points addition/deduction for **{selectedCustomer.firstName} {selectedCustomer.lastName}**. Current points: **{selectedCustomer.loyaltyPoints} PTS**.
              </p>
              <form onSubmit={handleAdjustPointsSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Points Delta (Positive or Negative)</label>
                  <input
                    type="number"
                    value={adjustData.pointsDelta}
                    onChange={(e) => setAdjustData({ ...adjustData, pointsDelta: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Reason / Description</label>
                  <textarea
                    value={adjustData.description}
                    onChange={(e) => setAdjustData({ ...adjustData, description: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                    placeholder="E.g., Customer satisfaction gesture or manual correction"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors grow"
                  >
                    Post Adjustment
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdjustDrawerOpen(false)}
                    className="bg-slate-950 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-lg text-xs text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. REDEEM POINTS DRAWER */}
      {isRedeemDrawerOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md p-6 h-full shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <Award className="h-5 w-5 text-emerald-400" />
                Redeem Customer Points
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Redeem points for cash/invoice discounts for **{selectedCustomer.firstName} {selectedCustomer.lastName}**. Current balance: **{selectedCustomer.loyaltyPoints} PTS**.
              </p>
              <form onSubmit={handleRedeemPointsSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Points to Redeem</label>
                  <input
                    type="number"
                    value={redeemData.points}
                    onChange={(e) => setRedeemData({ ...redeemData, points: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                    min={1}
                    max={selectedCustomer.loyaltyPoints}
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Value breakdown: 1 Point = ৳1.00 Discount</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Related Document Reference ID (Optional)</label>
                  <input
                    type="text"
                    value={redeemData.referenceId}
                    onChange={(e) => setRedeemData({ ...redeemData, referenceId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                    placeholder="Invoice or Payment UUID reference"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Description / Notes</label>
                  <textarea
                    value={redeemData.description}
                    onChange={(e) => setRedeemData({ ...redeemData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                    placeholder="E.g., Redeemed on screen repair checkout INV-2026-003"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors grow"
                  >
                    Post Redemption
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRedeemDrawerOpen(false)}
                    className="bg-slate-950 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-lg text-xs text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. DISPATCH NEW CUSTOMER MESSAGE DRAWER */}
      {isCommDrawerOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md p-6 h-full shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <Send className="h-5 w-5 text-emerald-400" />
                Dispatch Outreach Message
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Send manual alert notification to customer **{selectedCustomer.firstName} {selectedCustomer.lastName}**.
              </p>
              <form onSubmit={handleCommSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Communication Channel</label>
                  <select
                    value={commData.type}
                    onChange={(e) => setCommData({ ...commData, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-350 outline-none focus:border-emerald-500"
                  >
                    <option value="SMS">SMS Message</option>
                    <option value="Email">Email Template</option>
                    <option value="WhatsApp">WhatsApp Sandbox</option>
                  </select>
                </div>
                {commData.type === 'Email' && (
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Subject Heading</label>
                    <input
                      type="text"
                      value={commData.subject}
                      onChange={(e) => setCommData({ ...commData, subject: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                      placeholder="Enter subject heading..."
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Content Body</label>
                  <textarea
                    value={commData.message}
                    onChange={(e) => setCommData({ ...commData, message: e.target.value })}
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                    placeholder="Write message copy..."
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors grow"
                  >
                    Send Outreach Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCommDrawerOpen(false)}
                    className="bg-slate-950 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-lg text-xs text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. RESOLVE NPS ALERT DIALOG */}
      {isFeedbackModalOpen && activeFeedbackId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              Resolve NPS Customer Alert
            </h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">NPS Feedback Score (Re-evaluate/Confirm)</label>
                <input
                  type="number"
                  value={feedbackData.npsScore}
                  onChange={(e) => setFeedbackData({ ...feedbackData, npsScore: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                  min={0}
                  max={10}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Would customer recommend TrustZone?</label>
                <select
                  value={feedbackData.wouldRecommend}
                  onChange={(e) => setFeedbackData({ ...feedbackData, wouldRecommend: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-305 outline-none focus:border-emerald-500"
                >
                  <option value="Yes">Yes, absolutely</option>
                  <option value="No">No, dissatisfied</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Follow-up Notes / Resolution Details</label>
                <textarea
                  value={feedbackData.comments}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                  placeholder="Record what was done to address customer's complaint (e.g. called client and offered BDT 500 partial refund)"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors"
                >
                  Resolve Alert
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFeedbackModalOpen(false);
                    setActiveFeedbackId(null);
                  }}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
