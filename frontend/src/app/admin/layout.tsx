'use client';

import React from 'react';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { FeatureFlagProvider } from '@/context/feature-flag-context';
import { ErrorBoundary } from '@/components/error-boundary';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <FeatureFlagProvider>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300 antialiased flex flex-col font-sans">
            {children}
          </div>
        </FeatureFlagProvider>
      </AdminAuthProvider>
    </ErrorBoundary>
  );
}
