'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon, Phone, LogOut, LayoutDashboard } from 'lucide-react';
import { BrandLogo } from './logo/brand-logo';
import { businessConfig } from '@/config/business';
import { useAuth } from '@/context/auth-context';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/before-after', label: 'Portfolio' },
    { href: '/testimonials', label: 'Reviews' },
    { href: '/faq', label: 'FAQ' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur support-backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo brand wrapper */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg" aria-label="TrustZone Mobile Care Logo link home">
              <BrandLogo variant="horizontal" className="h-9 w-auto text-primary" />
            </Link>
          </div>

          {/* Navigation Links list */}
          <div className="hidden lg:flex items-center space-x-1" role="menubar">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions & Contacts */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={darkMode ? 'Switch to Light Theme Mode' : 'Switch to Dark Theme Mode'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Helpline connection */}
            <a
              href={`tel:${businessConfig.helpline.replace(/\s+/g, '')}`}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Call Diagnostics Helpline"
              aria-label={`Call Helpline at ${businessConfig.helpline}`}
            >
              <Phone className="h-4 w-4 text-[#1877f2]" />
              <span>{businessConfig.helpline}</span>
            </a>

            {isLoggedIn && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  title="Logout Session"
                  aria-label="Logout user session"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 glow-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Action Triggers */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={darkMode ? 'Switch to Light Theme Mode' : 'Switch to Dark Theme Mode'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Toggle main navigational menu options"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden glass border-t border-border animate-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-3 pb-6 space-y-1" role="menu">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn && user ? (
              <div className="pt-4 border-t border-border/60 mt-4 px-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-sm block leading-none">{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-lg text-sm font-bold transition-all block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full text-center border border-red-500/20 text-red-500 py-3 rounded-lg text-sm font-bold hover:bg-red-500/10 transition-all block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 px-4 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center bg-primary hover:bg-primary/95 text-primary-foreground py-3 rounded-lg text-sm font-bold transition-colors block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Sign In
                </Link>
                <a
                  href={`tel:${businessConfig.helpline.replace(/\s+/g, '')}`}
                  className="w-full flex items-center justify-center gap-2 border border-border py-3 rounded-lg text-sm font-bold text-foreground hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Phone className="h-4 w-4 text-[#1877f2]" />
                  Call Helpline
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
