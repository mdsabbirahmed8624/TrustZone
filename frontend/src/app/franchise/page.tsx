'use client';

import { useState } from 'react';

interface FranchiseTier {
  tierName: string;
  minRevenueThreshold: number;
  royaltyDiscountRate: number;
  marketingFundPercentage: number;
}

interface RoyaltyInvoice {
  id: string;
  invoiceNumber: string;
  billingPeriod: string;
  grossSales: number;
  totalDue: number;
  status: string;
}

export default function FranchisePartnerPortalPage() {
  const [activeTab, setActiveTab] = useState<'tiers' | 'territories' | 'invoices' | 'compliance'>('tiers');

  const sampleTiers: FranchiseTier[] = [
    { tierName: 'PLATINUM', minRevenueThreshold: 500000, royaltyDiscountRate: 0.02, marketingFundPercentage: 0.015 },
    { tierName: 'GOLD', minRevenueThreshold: 250000, royaltyDiscountRate: 0.01, marketingFundPercentage: 0.02 },
    { tierName: 'SILVER', minRevenueThreshold: 100000, royaltyDiscountRate: 0.005, marketingFundPercentage: 0.025 },
    { tierName: 'BRONZE', minRevenueThreshold: 0, royaltyDiscountRate: 0.0, marketingFundPercentage: 0.03 },
  ];

  const sampleInvoices: RoyaltyInvoice[] = [
    { id: '1', invoiceNumber: 'ROY-2026-Q3-TX-001', billingPeriod: '2026-Q3', grossSales: 125000, totalDue: 6250, status: 'PAID' },
    { id: '2', invoiceNumber: 'ROY-2026-Q2-TX-001', billingPeriod: '2026-Q2', grossSales: 98000, totalDue: 4900, status: 'PAID' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/80 px-3 py-1 rounded-full">
              Phase 12 — Book 1 Enterprise
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Franchise Partner Portal & Territory Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage franchise classifications, exclusive territory allocations, royalty billing, and compliance scores.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition-colors">
              + Register Partner
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          {(['tiers', 'territories', 'invoices', 'compliance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'tiers' ? 'Franchise Tiers' : tab === 'territories' ? 'Territory Zones' : tab === 'invoices' ? 'Royalty Invoices' : 'Compliance Audits'}
            </button>
          ))}
        </div>

        {/* Tab 1: Tiers */}
        {activeTab === 'tiers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleTiers.map((tier) => (
              <div
                key={tier.tierName}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{tier.tierName}</h3>
                  <span className="text-xs px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-800/80 rounded-full font-medium">
                    {(tier.royaltyDiscountRate * 100).toFixed(1)}% Discount
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-500">Min Revenue:</span> ${tier.minRevenueThreshold.toLocaleString()}</p>
                  <p><span className="text-slate-500">Marketing Fee:</span> {(tier.marketingFundPercentage * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Royalty Invoices */}
        {activeTab === 'invoices' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Gross Sales</th>
                  <th className="px-6 py-4">Total Due</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sampleInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-semibold text-white">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">{inv.billingPeriod}</td>
                    <td className="px-6 py-4">${inv.grossSales.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">${inv.totalDue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Placeholder info for territories & compliance */}
        {(activeTab === 'territories' || activeTab === 'compliance') && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <p className="text-base">
              Active {activeTab === 'territories' ? 'Territory Mapping' : 'Partner Compliance Audits'} module operational. REST APIs mapped at <code className="text-blue-400">/api/v1/franchise/{activeTab}</code>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
