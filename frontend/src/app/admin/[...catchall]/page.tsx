'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import { CommandPalette } from '../components/command-palette';
import { NotificationCenter } from '../components/notification-center';
import { MaintenanceState } from '@/components/empty-state';

export default function CatchAllAdminPlaceholder() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pathname = usePathname();
  // Extract module name from path (e.g., "/admin/bookings" -> "Bookings")
  const moduleName = pathname
    ? pathname.split('/').pop()?.toUpperCase().replace(/_/g, ' ') || 'Subsystem'
    : 'Subsystem';

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div 
        className={`flex-grow flex flex-col transition-all duration-300 min-w-0 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-sm p-6 sm:p-8">
            <MaintenanceState moduleName={moduleName} />
          </div>
        </main>
      </div>

      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      <NotificationCenter 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
}
