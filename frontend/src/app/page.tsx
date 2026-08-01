'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Phone, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle,
  Star,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  businessConfig, 
  partnerBrands, 
  pricingMatrix, 
  reviewsList, 
  beforeAfterList, 
  faqsList, 
  blogArticles 
} from '@/config/business';
import MapSection from '@/components/map-section';

export default function Home() {
  const [activeBeforeAfter, setActiveBeforeAfter] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { icon: <TrendingUp className="h-7 w-7 text-primary" />, value: '45,000+', label: 'Completed Repairs' },
    { icon: <Users className="h-7 w-7 text-[#16a34a]" />, value: '99.2%', label: 'Satisfied Clients' },
    { icon: <Layers className="h-7 w-7 text-primary" />, value: `${businessConfig.branches.length} Labs`, label: 'Across Dhaka City' },
    { icon: <Award className="h-7 w-7 text-[#16a34a]" />, value: '25+ Techs', label: 'Certified Engineers' }
  ];

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* 1. Hero Section */}
      <section 
        className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary py-20 lg:py-32"
        aria-labelledby="hero-title"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#16a34a]/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Context Left */}
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
                <span className="flex h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
                {businessConfig.tagline}
              </span>
              <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Smartphone Repairs <br />
                <span className="bg-gradient-to-r from-primary to-[#16a34a] bg-clip-text text-transparent">
                  Backed By Real Trust
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Dhaka’s advanced clean-room diagnostic laboratory. We specialize in dynamic display replacements, battery calibration swaps, and motherboard micro-soldering.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/booking"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg glow-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Calendar className="h-5 w-5" />
                  Book Diagnostic Slot
                </Link>
                <a
                  href={`tel:${businessConfig.helpline.replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-2 border border-border bg-card hover:bg-secondary text-foreground px-8 py-4 rounded-xl text-base font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`Call diagnostics desk at ${businessConfig.helpline}`}
                >
                  <Phone className="h-5 w-5 text-primary" />
                  Helpline: {businessConfig.helpline}
                </a>
              </div>

              {/* Messaging info */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-muted-foreground pt-4">
                <a
                  href={businessConfig.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#16a34a] hover:underline"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp Live Chat
                </a>
                <span>&bull;</span>
                <span>Express repairs from ৳1,000</span>
              </div>
            </div>

            {/* Micro Tracker right */}
            <div className="relative mx-auto max-w-md lg:max-w-none w-full">
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-primary to-[#16a34a] opacity-30 blur-2xl -z-10" />
              <div className="relative bg-card/80 backdrop-blur p-8 rounded-2xl border border-border space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-primary tracking-widest uppercase">Live Ticket Tracking</span>
                  <span className="bg-[#16a34a]/10 text-[#16a34a] text-xs px-2.5 py-1 rounded-full font-bold border border-[#16a34a]/20 animate-pulse flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    On workbench
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Ticket #TZ-9104</span>
                    <span className="text-muted-foreground">Samsung S23 Ultra</span>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-primary to-[#16a34a] rounded-full transition-all duration-1000" />
                  </div>
                  <ul className="space-y-3 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-[#16a34a] shrink-0" />
                      <span>Diagnostics assessment completed &bull; 10:15 AM</span>
                    </li>
                    <li className="flex items-start gap-2.5 font-bold text-foreground">
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1 animate-ping" />
                      <span>Aligning Dynamic AMOLED display assembly &bull; 11:15 AM</span>
                    </li>
                    <li className="flex items-start gap-2.5 opacity-40">
                      <span className="h-1.5 w-1.5 rounded-full bg-border shrink-0 mt-1" />
                      <span>QC Checklist & waterproof pressure lock testing</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-border pt-4 flex gap-3">
                  <Link 
                    href="/tracking" 
                    className="w-full text-center text-xs bg-secondary hover:bg-border py-3 rounded-lg font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-primary block"
                  >
                    Track Diagnostic Ticket
                  </Link>
                  <Link 
                    href="/warranty" 
                    className="w-full text-center text-xs bg-secondary hover:bg-border py-3 rounded-lg font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-primary block"
                  >
                    Verify Warranty Cover
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Repair By Brand */}
      <section className="py-16 bg-card border-y border-border" aria-labelledby="brand-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="brand-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center mb-8">
            Certified Repair Framework for Major Smartphone Brands
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 items-center justify-items-center">
            {partnerBrands.map((brand, i) => (
              <div 
                key={i} 
                className="bg-secondary/40 border border-border/80 px-6 py-4 rounded-xl text-center w-full flex items-center justify-center font-bold text-muted-foreground hover:text-primary hover:border-primary/40 hover:scale-105 transition-all duration-300 cursor-pointer select-none"
              >
                <span>{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us (Diagnostics standards) */}
      <section className="py-24 bg-background" aria-labelledby="standards-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-extrabold bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20">
              Clean Room ESD Operations
            </span>
            <h2 id="standards-title" className="text-3xl sm:text-4xl font-black text-foreground">
              Dhaka’s Safe Mobile Repair Workspace
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Smartphone boards house delicate micron circuits. A single electrostatic discharge (ESD) can destroy data blocks. We service devices inside strict anti-static zones with certified parameters.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-lg h-fit border border-primary/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Lifetime Warranty</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Genuine display, battery, and microchip swaps carry our standard warranty contracts.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-[#16a34a]/10 text-[#16a34a] p-3 rounded-lg h-fit border border-[#16a34a]/20">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">IPC-A-610 Soldering</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Logic board solder routing is executed using high-precision thermal profiles.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-lg h-fit border border-primary/20">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">Express Turnaround</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">90% of glass panels and batteries are replaced on the workbench in under 45 minutes.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-[#16a34a]/10 text-[#16a34a] p-3 rounded-lg h-fit border border-[#16a34a]/20">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1">ANSI/ESD S20.20</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Continuous antistatic inspections are performed on grounding desks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Standards Callout Panel */}
          <div className="glass p-8 rounded-2xl border border-border space-y-6 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#16a34a]/10 rounded-full blur-3xl" />
            <h3 className="font-black text-lg text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Certified Instrument Grid
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#16a34a] shrink-0" />
                <span>Pneumatic frame heaters & display alignment presses</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#16a34a] shrink-0" />
                <span>Micro-solder scopes with high-definition digital outputs</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#16a34a] shrink-0" />
                <span>EEPROM calibration programmers for screen signatures</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#16a34a] shrink-0" />
                <span>Original touch-panel waterproofing adhesive vacuum locks</span>
              </li>
            </ul>
            <Link 
              href="/about" 
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline pt-2 focus:outline-none focus:ring-1 focus:ring-primary rounded"
            >
              Verify our lab protocols
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Services */}
      <section className="py-24 bg-secondary/30 border-y border-border" aria-labelledby="services-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 max-w-xl mx-auto">
            <h2 id="services-title" className="text-3xl sm:text-4xl font-black text-foreground">Featured Workbench Diagnostics</h2>
            <p className="text-muted-foreground">
              Select a hardware repair category to view cost variables, diagnostic paths, and warranties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingMatrix.slice(0, 4).map((svc, i) => (
              <div 
                key={i} 
                className="glass bg-card border border-border p-6 rounded-xl flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">Warranty Secure</span>
                  <h3 className="text-lg font-bold text-foreground">{svc.device} Repair</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Display swap, battery diagnostic replacement, and interface calibration matching manufacturer codes.
                  </p>
                </div>
                <div className="border-t border-border mt-6 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block leading-none">Starting BDT</span>
                    <span className="text-lg font-black text-foreground">{svc.screen}</span>
                  </div>
                  <Link 
                    href="/services" 
                    className="text-primary hover:text-[#16a34a] font-bold text-xs flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Repair Process Timeline */}
      <section className="py-24 bg-background" aria-labelledby="timeline-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 max-w-xl mx-auto">
            <h2 id="timeline-title" className="text-3xl sm:text-4xl font-black text-foreground">Our 5-Stage Diagnostics Path</h2>
            <p className="text-muted-foreground">
              Transparency at every check. Track device benchmarks at every stage on your portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-border -z-10 -translate-y-1/2" />
            {[
              { title: '1. Bench Log', desc: 'Secure booking & counter collection.' },
              { title: '2. Audit Assessment', desc: 'Motherboard current checks & display audits.' },
              { title: '3. Workbench Fix', desc: 'Certified clean panel lamination.' },
              { title: '4. QC Calibration', desc: 'Touch matrix & TrueTone programming.' },
              { title: '5. Secure Release', desc: 'Delivery ledger log & warranty activation.' }
            ].map((step, idx) => (
              <div key={idx} className="glass p-6 rounded-xl border border-border text-center space-y-3 bg-card relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm mx-auto">
                  0{idx + 1}
                </div>
                <h4 className="font-extrabold text-sm text-foreground">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Before & After Gallery */}
      <section className="py-24 bg-secondary/20 border-y border-border" aria-labelledby="gallery-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 max-w-xl mx-auto">
            <h2 id="gallery-title" className="text-3xl sm:text-4xl font-black text-foreground">Before & After Repair Audits</h2>
            <p className="text-muted-foreground">
              Check out shattered front display sheets vs. our press-laminated recoveries.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left selector */}
            <div className="lg:col-span-4 space-y-3">
              {beforeAfterList.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBeforeAfter(idx)}
                  className={`w-full text-left p-5 rounded-xl border transition-all ${
                    activeBeforeAfter === idx
                      ? 'bg-card border-primary shadow-sm ring-2 ring-primary/10'
                      : 'bg-card/40 border-border hover:bg-card/75'
                  }`}
                  aria-label={`View comparison for ${item.title}`}
                >
                  <h4 className="font-extrabold text-sm text-foreground mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Right Comparison Box */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest block text-center">Damaged State</span>
                <div className="border border-border rounded-xl overflow-hidden aspect-video relative bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                  {/* Styled SVG replacement for before/after comparison to keep bundle clean and prevent image load issues */}
                  <svg className="w-16 h-16 opacity-30 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M12 18h.01M5 7h14M7 11l10 5M10 9l5 7" />
                  </svg>
                  <span className="absolute bottom-3 left-3 bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded border border-red-500/20 font-bold">
                    Shattered Panel
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#16a34a] uppercase tracking-widest block text-center">Post Lamination Recovery</span>
                <div className="border border-border rounded-xl overflow-hidden aspect-video relative bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                  <svg className="w-16 h-16 opacity-35 text-emerald-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M12 18h.01M9 11l2 2 4-4" />
                  </svg>
                  <span className="absolute bottom-3 left-3 bg-[#16a34a]/10 text-[#16a34a] text-[10px] px-2 py-0.5 rounded border border-[#16a34a]/20 font-bold">
                    Press-Laminated & Certified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Statistics Row */}
      <section className="py-16 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                <div className="bg-secondary p-3.5 rounded-xl border border-border h-fit shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <span className="block text-3xl font-black text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Customer Testimonials */}
      <section className="py-24 bg-background" aria-labelledby="testimonial-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 max-w-xl mx-auto">
            <h2 id="testimonial-title" className="text-3xl sm:text-4xl font-black text-foreground">Verified Client Feedback</h2>
            <p className="text-muted-foreground">
              Read real diagnostics ledger feedback submitted by smartphone owners across Dhaka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviewsList.map((rev, i) => (
              <div key={i} className="glass border border-border p-8 rounded-xl flex flex-col justify-between bg-card/50">
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {[...Array(rev.stars)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">&quot;{rev.text}&quot;</p>
                </div>
                <div className="border-t border-border mt-6 pt-4 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-foreground block">{rev.name}</span>
                    <span className="text-xs text-muted-foreground font-semibold">{rev.role}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                    {rev.device}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Blog Preview Section */}
      <section className="py-24 bg-background border-t border-border" aria-labelledby="blog-preview-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 max-w-xl mx-auto">
            <h2 id="blog-preview-title" className="text-3xl sm:text-4xl font-black text-foreground">Latest Tech Bulletins</h2>
            <p className="text-muted-foreground">
              Technical repair methodologies, diagnostic updates, and guidelines published by our engineering leads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogArticles.slice(0, 3).map((article, i) => (
              <article key={i} className="glass border border-border p-6 rounded-xl flex flex-col justify-between bg-card/40 hover:scale-[1.01] transition-transform duration-300">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">{article.date} &bull; {article.readTime}</span>
                  <h3 className="font-extrabold text-lg text-foreground leading-snug">{article.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{article.desc}</p>
                </div>
                <div className="border-t border-border mt-6 pt-4">
                  <Link href="/blog" className="text-primary hover:text-accent font-bold text-xs flex items-center gap-0.5 focus:outline-none focus:ring-1 focus:ring-primary rounded">
                    Read Guide
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ Preview Section */}
      <section className="py-24 bg-secondary/30 border-t border-border" aria-labelledby="faq-title">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 id="faq-title" className="text-3xl sm:text-4xl font-black text-foreground">Frequently Asked Inquiries</h2>
            <p className="text-muted-foreground">
              Clear rules regarding diagnostics counter fees, device data safety, and calibration options.
            </p>
          </div>

          <div className="space-y-4">
            {faqsList.slice(0, 4).map((faq, i) => (
              <div key={i} className="glass border border-border rounded-xl overflow-hidden bg-card">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-6 font-bold text-sm sm:text-base text-foreground flex justify-between items-center focus:outline-none focus:bg-secondary/40"
                  aria-expanded={openFaq === i}
                  aria-label={`Toggle answer for ${faq.q}`}
                >
                  <span>{faq.q}</span>
                  <HelpCircle className={`h-5 w-5 text-primary shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4 animate-in slide-in-from-top-2 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center pt-8">
            <Link 
              href="/faq" 
              className="text-primary hover:text-[#16a34a] font-bold text-sm flex items-center justify-center gap-1 focus:outline-none focus:ring-1 focus:ring-primary rounded w-fit mx-auto"
            >
              View all FAQs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Map & Branch locator section */}
      <section className="py-24 bg-background border-t border-border" aria-labelledby="branch-section-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 id="branch-section-title" className="text-3xl sm:text-4xl font-black text-foreground">Dhaka City Location Hub</h2>
            <p className="text-muted-foreground">
              Select your nearest anti-static diagnostic lab branch to view address coordinates and contact desk details.
            </p>
          </div>
          <MapSection />
        </div>
      </section>

      {/* 11. Contact CTA banner */}
      <section className="bg-gradient-to-tr from-primary to-[#16a34a] text-white py-16 text-center space-y-6 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-black/10 -z-10" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black">Need motherboard soldering or screen swap?</h2>
          <p className="text-white/80 max-w-lg mx-auto text-sm">
            Book diagnostic counter slots online. Reserve high-drain replacement cells and lamination panels today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/booking"
              className="bg-white hover:bg-slate-50 text-slate-900 font-extrabold px-8 py-4 rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-white"
            >
              Book Diagnostic Slot
            </Link>
            <Link
              href="/contact"
              className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-extrabold px-8 py-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-white"
            >
              Contact Support desks
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
