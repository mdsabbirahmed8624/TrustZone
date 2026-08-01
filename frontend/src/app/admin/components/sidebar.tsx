'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wrench, 
  CalendarRange, 
  Users, 
  User,
  UserCog, 
  Package, 
  Truck, 
  FileSpreadsheet, 
  ShieldAlert, 
  BarChart3, 
  Landmark, 
  Megaphone, 
  MessageSquareText, 
  Network, 
  Settings as SettingsIcon, 
  Cpu, 
  ScrollText, 
  Code2, 
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogOut,
  KeyRound,
  Bell,
  Workflow,
  ListTodo,
  Activity,
  Calendar,
  MessageSquare,
  Search,
} from 'lucide-react';
import { useAdminAuth } from '@/context/admin-auth-context';
import { useFeatureFlags, type FeatureFlags } from '@/context/feature-flag-context';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// Permission requirement per menu item
interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  flagKey?: keyof FeatureFlags;
  requiredPermission?: string;
  adminOnly?: boolean; // SUPER_ADMIN / ADMIN / OWNER only
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const { adminUser, logout } = useAdminAuth();
  const { flags } = useFeatureFlags();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const userRole = adminUser?.role ?? '';
  const userPermissions = adminUser?.permissions ?? [];

  // Helper: check if user can see an item
  const canSee = (item: MenuItem): boolean => {
    // Super admin / owner always sees everything
    if (userRole === 'SUPER_ADMIN' || userRole === 'OWNER') return true;
    // adminOnly items require ADMIN or above
    if (item.adminOnly && !['ADMIN'].includes(userRole)) return false;
    // Permission-based check
    if (item.requiredPermission) {
      return userPermissions.includes('*') || userPermissions.includes(item.requiredPermission);
    }
    return true;
  };

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, requiredPermission: 'read:dashboard' },
    { name: 'Repairs', href: '/admin/repairs', icon: Wrench, flagKey: 'repairs', requiredPermission: 'read:repairs' },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarRange, flagKey: 'bookings', requiredPermission: 'read:bookings' },
    { name: 'Customers', href: '/admin/customers', icon: Users, requiredPermission: 'read:customers' },
    { name: 'Technicians', href: '/admin/technicians', icon: UserCog, requiredPermission: 'read:technicians' },
    { name: 'Inventory', href: '/admin/inventory', icon: Package, flagKey: 'inventory', requiredPermission: 'read:inventory' },
    { name: 'Suppliers', href: '/admin/suppliers', icon: Truck, flagKey: 'suppliers', requiredPermission: 'read:suppliers' },
    { name: 'Invoices', href: '/admin/invoices', icon: FileSpreadsheet, flagKey: 'finance', requiredPermission: 'read:invoices' },
    { name: 'Warranty', href: '/admin/warranty', icon: ShieldAlert, flagKey: 'warranty', requiredPermission: 'read:warranty' },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3, requiredPermission: 'read:reports' },
    { name: 'Finance', href: '/admin/finance', icon: Landmark, flagKey: 'finance', requiredPermission: 'read:finance' },
    { name: 'Marketing', href: '/admin/marketing', icon: Megaphone, flagKey: 'marketing', requiredPermission: 'read:marketing' },
    { name: 'CRM', href: '/admin/crm', icon: MessageSquareText, flagKey: 'crm', requiredPermission: 'read:crm' },
    { name: 'Branches', href: '/admin/branches', icon: Network, requiredPermission: 'read:branches' },
    { name: 'Roles & Permissions', href: '/admin/roles', icon: KeyRound, adminOnly: true },
    { name: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText, requiredPermission: 'read:audit_logs' },
    
    // Phase 8 Enterprise links
    { name: 'Automation', href: '/admin/automation', icon: Workflow, flagKey: 'automation', requiredPermission: 'read:automation' },
    { name: 'Tasks', href: '/admin/tasks', icon: ListTodo, flagKey: 'tasks', requiredPermission: 'read:support' },
    { name: 'Calendar', href: '/admin/calendar', icon: Calendar, flagKey: 'calendar', requiredPermission: 'read:support' },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone, flagKey: 'announcement', requiredPermission: 'read:support' },
    { name: 'Timeline Feed', href: '/admin/timeline', icon: Activity, flagKey: 'timeline', requiredPermission: 'read:timeline' },
    
    // Phase 9 HRMS Console links
    { name: 'HRMS Console', href: '/admin/hrms', icon: Users, flagKey: 'hrms', requiredPermission: 'read:support' },
    { name: 'Employee Portal', href: '/admin/hrms/portal', icon: User, flagKey: 'hrms', requiredPermission: 'read:support' },
    
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, requiredPermission: 'read:support' },
    { name: 'Settings', href: '/admin/settings', icon: SettingsIcon, requiredPermission: 'read:settings' },
    { name: 'System Settings', href: '/admin/system', icon: Cpu, adminOnly: true },
    { name: 'Workflow Engine', href: '/admin/system/workflows', icon: Workflow, adminOnly: true },
    { name: 'Dynamic Form Builder', href: '/admin/system/forms', icon: Code2, adminOnly: true },
    { name: 'Report Builder', href: '/admin/system/reports', icon: FileSpreadsheet, adminOnly: true },
    { name: 'Global Search', href: '/admin/system/search', icon: Search, requiredPermission: 'read:support' },
    { name: 'API Docs', href: '/admin/api', icon: Code2, requiredPermission: 'read:api' },
    { name: 'Support', href: '/admin/support', icon: LifeBuoy, requiredPermission: 'read:support' },
  ];

  const visibleItems = menuItems.filter(canSee);

  // Role badge color
  const roleBadgeColor: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-500/15 text-red-500 border-red-500/25',
    OWNER: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
    ADMIN: 'bg-blue-500/15 text-blue-500 border-blue-500/25',
    MANAGER: 'bg-purple-500/15 text-purple-500 border-purple-500/25',
    ACCOUNTANT: 'bg-green-500/15 text-green-500 border-green-500/25',
    TECHNICIAN_MANAGER: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/25',
    INVENTORY_MANAGER: 'bg-orange-500/15 text-orange-500 border-orange-500/25',
    SUPPORT: 'bg-teal-500/15 text-teal-500 border-teal-500/25',
    MARKETING: 'bg-pink-500/15 text-pink-500 border-pink-500/25',
  };
  const badgeClass = roleBadgeColor[userRole] ?? 'bg-secondary text-muted-foreground border-border';

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-card border-r border-border transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      } shrink-0`}
    >
      {/* Sidebar Brand header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-secondary/15 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/20">
            TZ
          </div>
          {isOpen && (
            <span className="font-extrabold text-sm tracking-tight text-foreground animate-fade-in block">
              Care <span className="text-primary font-medium text-xs border border-primary/25 px-1.5 py-0.5 rounded ml-1 bg-primary/5">ERP</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex h-6 w-6 border border-border bg-card rounded-full items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* User Info Capsule with role badge */}
      {mounted && adminUser && (
        <div className={`${isOpen ? 'p-3 m-3' : 'p-2 m-2'} bg-secondary/40 border border-border/60 rounded-xl flex items-center gap-2.5`}>
          <div className="h-9 w-9 bg-primary/15 text-primary rounded-full border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
            {adminUser.firstName[0]}{adminUser.lastName[0]}
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <span className="font-bold text-xs text-foreground block truncate">{adminUser.firstName} {adminUser.lastName}</span>
              <span className={`text-[9px] font-bold uppercase tracking-wide border px-1.5 py-0.5 rounded mt-0.5 inline-block ${badgeClass}`}>
                {adminUser.role.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Navigation Scrollable links list */}
      <nav className="flex-grow overflow-y-auto py-4 px-3.5 space-y-1" aria-label="Admin sidebar menu">
        {mounted && visibleItems.map((item) => {
          const Icon = item.icon;
          // Check if feature flagged
          const isLocked = item.flagKey ? !flags[item.flagKey] : false;
          // Handle destination: if flagged out, send to system page
          const destHref = isLocked ? `/admin/system?flag=${item.flagKey}` : item.href;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={destHref}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all focus:outline-none ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
              aria-label={item.name}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {isOpen && <span className="truncate">{item.name}</span>}
              </div>
              {isOpen && isLocked && (
                <Lock className="h-3 w-3 text-muted-foreground/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Role indicator strip + Logout */}
      <div className="p-3.5 border-t border-border bg-secondary/15 shrink-0 space-y-2">
        {mounted && isOpen && (
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            {visibleItems.length} of {menuItems.length} items visible
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all w-full"
          aria-label="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
