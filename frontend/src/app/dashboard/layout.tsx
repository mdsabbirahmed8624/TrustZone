'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { 
  LayoutDashboard, 
  Wrench, 
  ShieldCheck, 
  FileText, 
  User, 
  Bell,
  Lock,
  LogOut
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-background py-20">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">Initializing customer session desk...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Let the redirect trigger
  }

  const menuItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/booking', label: 'Book Repair', icon: Wrench },
    { href: '/dashboard/warranty', label: 'Warranties', icon: ShieldCheck },
    { href: '/dashboard/invoice', label: 'Invoices', icon: FileText },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
    { href: '/dashboard/security', label: 'Security & Devices', icon: Lock },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="flex-grow flex flex-col lg:flex-row bg-background">
      {/* Desktop Sidebar (visible on screens >= lg) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/25 shrink-0 py-8 px-4 justify-between">
        <div className="space-y-8">
          <div className="px-3 flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-base border border-primary/20">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
            </div>
            <div>
              <span className="font-extrabold text-sm text-foreground block truncate max-w-[150px]">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">
                {user?.role} Portal
              </span>
            </div>
          </div>

          <nav className="space-y-1" aria-label="Customer dashboard sidebar menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all focus:outline-none focus:ring-1 focus:ring-red-500 w-full"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sign Out
        </button>
      </aside>

      {/* Main dashboard content container */}
      <main className="flex-grow p-4 sm:p-8 lg:p-12 overflow-y-auto max-w-5xl mx-auto w-full pb-24 lg:pb-12">
        {children}
      </main>

      {/* Mobile Sticky Tab bar (visible on mobile/tablet) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur py-2 px-3 flex justify-around items-center z-40 shadow-lg">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-bold tracking-tight">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[9px] font-bold tracking-tight">Exit</span>
        </button>
      </nav>
    </div>
  );
}
