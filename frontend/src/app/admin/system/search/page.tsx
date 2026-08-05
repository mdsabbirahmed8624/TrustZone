'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import {
  Search,
  Users,
  ShieldAlert,
  Laptop,
  FileText,
  DollarSign,
  Building2,
  Filter,
  ArrowRight,
  RefreshCw,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';

interface SearchResult {
  customers: any[];
  tickets: any[];
  parts: any[];
  invoices: any[];
  branches: any[];
}

export default function GlobalSearchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(['iPhone 13 Pro', 'TZ-TKT-9081', '01819283746', 'SSLCOMMERZ']);
    handleSearch('iPhone 13');
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);

    setTimeout(() => {
      setResults({
        customers: [
          { id: 'c-1', name: 'Tanvir Ahmed', phone: '01819283746', email: 'tanvir@gmail.com', branch: 'Dhanmondi Central' },
          { id: 'c-2', name: 'Nasrin Sultana', phone: '01711223344', email: 'nasrin@yahoo.com', branch: 'Banani Lab' },
        ],
        tickets: [
          { id: 't-101', title: 'iPhone 13 Pro Screen Digitizer Replacement', ticketId: 'TZ-TKT-9081', status: 'IN_PROGRESS', customer: 'Tanvir Ahmed', cost: 12500 },
          { id: 't-102', title: 'Samsung S22 Ultra Battery & Charging IC', ticketId: 'TZ-TKT-9082', status: 'DIAGNOSING', customer: 'Nasrin Sultana', cost: 8500 },
        ],
        parts: [
          { id: 'p-1', name: 'iPhone 13 Pro OLED Display Panel Assembly', sku: 'SKU-OLED-IP13', stock: 18, price: 8900 },
          { id: 'p-2', name: 'Samsung Galaxy S22 Ultra OEM Battery', sku: 'SKU-BAT-S22', stock: 4, price: 1450 },
        ],
        invoices: [
          { id: 'inv-1', invoiceNo: 'TZ-INV-4410', customer: 'Tanvir Ahmed', total: 12500, status: 'PAID' },
          { id: 'inv-2', invoiceNo: 'TZ-INV-4411', customer: 'Corporate Fleet B2B', total: 45000, status: 'UNPAID' },
        ],
        branches: [
          { id: 'b-1', name: 'Dhanmondi Central Outlet', code: 'DHN-01', manager: 'Rafiqul Islam', phone: '01700000001' },
        ],
      });

      setLoading(false);
    }, 250);
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title Header */}
          <div className="border-b border-border/60 pb-4">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Search className="text-primary h-6 w-6" />
              Unified Global Search Console
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              High-performance index lookup across Customers, Repair Tickets, Parts Inventory, Invoices, and Branch Outlets.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">

            {/* Search Input Bar */}
            <div className="bg-card border border-border/60 p-2.5 rounded-2xl shadow-lg space-y-2">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground ml-3" />
                <input
                  type="text"
                  placeholder="Search by SKU, Ticket ID (e.g. TZ-TKT-9081), Customer Name, Phone, or Invoice..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-transparent p-2 text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/60"
                />
                {query && (
                  <button onClick={handleClear} className="p-1 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => handleSearch()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl shadow text-xs transition-all">
                  Search
                </button>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60 px-2 text-xs">
                {['ALL', 'TICKETS', 'CUSTOMERS', 'PARTS', 'INVOICES', 'BRANCHES'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-colors ${
                      activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Search Suggestions */}
            {recentSearches.length > 0 && !results && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground text-[10px] font-bold uppercase">Recent Lookups:</span>
                {recentSearches.map((s, i) => (
                  <button key={i} onClick={() => handleSearch(s)} className="bg-secondary/30 hover:bg-secondary text-foreground border border-border/60 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" /> {s}
                  </button>
                ))}
              </div>
            )}

            {/* Results Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground">Scanning database indexes...</p>
              </div>
            ) : results ? (
              <div className="space-y-6">

                {/* Repair Tickets Matches */}
                {(activeCategory === 'ALL' || activeCategory === 'TICKETS') && results.tickets.length > 0 && (
                  <div className="bg-card border border-border/60 p-5 rounded-xl space-y-3 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-purple-500" /> Repair Tickets ({results.tickets.length})</span>
                      <span className="text-[10px] text-primary">View All</span>
                    </h3>
                    <div className="divide-y divide-border/60">
                      {results.tickets.map(t => (
                        <div key={t.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-foreground">{t.ticketId}</span>
                              <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                {t.status}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-[11px] mt-0.5">{t.title} — Customer: <span className="font-semibold text-foreground">{t.customer}</span></p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-foreground">৳{t.cost.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customers Matches */}
                {(activeCategory === 'ALL' || activeCategory === 'CUSTOMERS') && results.customers.length > 0 && (
                  <div className="bg-card border border-border/60 p-5 rounded-xl space-y-3 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-blue-500" /> Customers Matches ({results.customers.length})
                    </h3>
                    <div className="divide-y divide-border/60">
                      {results.customers.map(c => (
                        <div key={c.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-foreground">{c.name}</strong>
                            <p className="text-muted-foreground text-[11px] font-mono">{c.phone} | {c.email}</p>
                          </div>
                          <span className="bg-secondary px-2 py-1 rounded border border-border text-[10px] font-bold text-muted-foreground">
                            {c.branch}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inventory Parts Matches */}
                {(activeCategory === 'ALL' || activeCategory === 'PARTS') && results.parts.length > 0 && (
                  <div className="bg-card border border-border/60 p-5 rounded-xl space-y-3 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <Laptop className="h-4 w-4 text-emerald-500" /> Parts Inventory ({results.parts.length})
                    </h3>
                    <div className="divide-y divide-border/60">
                      {results.parts.map(p => (
                        <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-foreground">{p.name}</strong>
                            <p className="text-muted-foreground font-mono text-[10px]">{p.sku}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-foreground">৳{p.price.toLocaleString()}</span>
                            <p className="text-[10px] text-muted-foreground font-bold">Stock: {p.stock} units</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoices Matches */}
                {(activeCategory === 'ALL' || activeCategory === 'INVOICES') && results.invoices.length > 0 && (
                  <div className="bg-card border border-border/60 p-5 rounded-xl space-y-3 shadow-sm">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-amber-500" /> Invoices & Payments ({results.invoices.length})
                    </h3>
                    <div className="divide-y divide-border/60">
                      {results.invoices.map(inv => (
                        <div key={inv.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                          <div>
                            <strong className="font-mono text-foreground">{inv.invoiceNo}</strong>
                            <p className="text-muted-foreground text-[11px]">{inv.customer}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-foreground">৳{inv.total.toLocaleString()}</span>
                            <div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${inv.status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {inv.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : null}

          </div>

        </main>
      </div>
    </div>
  );
}
