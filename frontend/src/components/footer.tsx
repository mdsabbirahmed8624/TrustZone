import Link from 'next/link';
import { MapPin, Phone, MessageSquare, Shield, Clock, Mail } from 'lucide-react';
import { BrandLogo } from './logo/brand-logo';
import { businessConfig } from '@/config/business';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Primary branch is the first configured item
  const primaryBranch = businessConfig.branches[0];

  return (
    <footer 
      className="bg-secondary text-foreground border-t border-border mt-auto"
      role="contentinfo"
      aria-label="Footer Navigation & Corporate Details"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Presentation */}
          <div className="space-y-6">
            <Link 
              href="/" 
              className="hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg block w-fit"
              aria-label="Back to Homepage"
            >
              <BrandLogo variant="horizontal" height={36} />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {businessConfig.description}
            </p>
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 w-fit">
                <Shield className="h-3.5 w-3.5" />
                Lifetime Parts Warranty
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#16a34a]/10 text-[#16a34a] px-3 py-1.5 rounded-full border border-[#16a34a]/20 w-fit">
                <Clock className="h-3.5 w-3.5" />
                Express Same-Day Repair
              </span>
            </div>
          </div>

          {/* Sitemap links */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Sitemap Index</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Home Portal</Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">About Lab</Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Services Matrix</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Estimated Prices</Link>
              </li>
              <li>
                <Link href="/booking" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Book Diagnostic Bench</Link>
              </li>
              <li>
                <Link href="/tracking" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Repair Tracker</Link>
              </li>
              <li>
                <Link href="/warranty" className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Verify Warranty</Link>
              </li>
            </ul>
          </div>

          {/* Social Links & Support Email */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Connect With Us</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Check our active Facebook feeds, service uploads, and technician workflows online.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href={businessConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card hover:bg-secondary p-3 rounded-lg border border-border text-muted-foreground hover:text-[#1877f2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Visit TrustZone Mobile Care official Facebook page"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a
                href={businessConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card hover:bg-secondary p-3 rounded-lg border border-border text-muted-foreground hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Watch repair guides on our YouTube channel"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.022 0 12 0 12s0 3.978.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.86.508 9.388.508 9.388.508s7.528 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.978 24 12 24 12s0-3.978-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href={`mailto:${businessConfig.email}`} className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">{businessConfig.email}</a>
              </div>
            </div>
          </div>

          {/* Primary Headquarters */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Dhaka Headquarters</h3>
            <div className="space-y-3.5 text-sm text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{primaryBranch.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#1877f2] shrink-0" />
                <a href={`tel:${primaryBranch.phone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">{primaryBranch.phone}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-[#16a34a] shrink-0" />
                <a href={primaryBranch.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">WhatsApp Diagnostics</a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Divider */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <span>&copy; {currentYear} {businessConfig.name}. All rights reserved. Registered in Bangladesh.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
