'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { Search, Users, ShieldAlert, Laptop, FileText } from 'lucide-react';

export default function GlobalSearchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!query) return;
    setLoading(true);
    // Mock unified search lookup
    setTimeout(() => {
      setResults({
        customers: [
          { id: '1', name: 'Marcus Aurelius', phone: '01819283746' }
        ],
        tickets: [
          { id: 't-1', title: 'iPhone 13 Screen Digitizer replacement', status: 'diagnosing' }
        ],
        parts: [
          { id: 'p-1', name: 'iPhone 13 OLED panel replacement', sku: 'IP13-OLED-AAA' }
        ]
      });
      setLoading(false);
    }, 300);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onOpenCommandPalette={() => {}} onOpenNotifications={() => {}} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Search className="text-primary h-6 w-6" />
              Global Search Console
            </h1>
            <p className="text-xs text-muted-foreground">Search across customers, tickets, inventory parts, and system accounts in a single lookup query.</p>
          </div>

          <div className="max-w-xl mx-auto space-y-6">
            {/* Search Input bar */}
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Search SKU, customer name, phone number, ticket ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-card border border-border p-3.5 rounded-xl text-xs font-semibold shadow-sm focus:outline-none focus:border-primary"
              />
              <button onClick={handleSearch} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-5 py-3 rounded-xl shadow text-xs">
                Search
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-muted-foreground text-center">Searching indexes...</p>
            ) : results ? (
              <div className="space-y-6">
                {/* Customers */}
                {results.customers.length > 0 && (
                  <div className="bg-card border border-border/60 p-4 rounded-xl space-y-2.5 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1.5"><Users className="h-4 w-4 text-blue-500" /> Customers Matches</h3>
                    {results.customers.map((c: any) => (
                      <div key={c.id} className="text-xs font-bold border-b border-border/40 pb-2 last:border-0 last:pb-0 flex justify-between items-center">
                        <span className="text-foreground">{c.name}</span>
                        <span className="text-muted-foreground font-mono text-[10px]">{c.phone}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tickets */}
                {results.tickets.length > 0 && (
                  <div className="bg-card border border-border/60 p-4 rounded-xl space-y-2.5 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1.5"><FileText className="h-4 w-4 text-purple-500" /> Active Tickets</h3>
                    {results.tickets.map((t: any) => (
                      <div key={t.id} className="text-xs font-bold border-b border-border/40 pb-2 last:border-0 last:pb-0 flex justify-between items-center">
                        <span className="text-foreground">{t.title}</span>
                        <span className="text-primary font-black uppercase text-[9px]">{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Parts */}
                {results.parts.length > 0 && (
                  <div className="bg-card border border-border/60 p-4 rounded-xl space-y-2.5 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1.5"><Laptop className="h-4 w-4 text-emerald-500" /> Inventory Parts</h3>
                    {results.parts.map((p: any) => (
                      <div key={p.id} className="text-xs font-bold border-b border-border/40 pb-2 last:border-0 last:pb-0 flex justify-between items-center">
                        <span className="text-foreground">{p.name}</span>
                        <span className="text-muted-foreground font-mono text-[10px]">{p.sku}</span>
                      </div>
                    ))}
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
