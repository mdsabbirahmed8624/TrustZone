'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FeatureFlags {
  repairs: boolean;
  inventory: boolean;
  finance: boolean;
  crm: boolean;
  marketing: boolean;
  bookings: boolean;
  suppliers: boolean;
  warranty: boolean;
  automation: boolean;
  scheduler: boolean;
  notification: boolean;
  chat: boolean;
  calendar: boolean;
  timeline: boolean;
  tasks: boolean;
  announcement: boolean;
  webhooks: boolean;
  queue: boolean;
  hrms: boolean;
}

interface FeatureFlagContextType {
  flags: FeatureFlags;
  toggleFlag: (flag: keyof FeatureFlags) => void;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

const DEFAULT_FLAGS: FeatureFlags = {
  repairs: true,       // Repairs & Diagnostics (Active)
  inventory: true,     // Next Book (Active)
  finance: true,       // Next Book (Active)
  crm: true,          // Next Book (Active)
  marketing: true,     // Admin Foundation
  bookings: true,      // Admin Foundation
  suppliers: true,     // Admin Foundation
  warranty: true,      // Admin Foundation
  automation: true,
  scheduler: true,
  notification: true,
  chat: true,
  calendar: true,
  timeline: true,
  tasks: true,
  announcement: true,
  webhooks: true,
  queue: true,
  hrms: true,
};

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tz_feature_flags');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return DEFAULT_FLAGS;
        }
      }
    }
    return DEFAULT_FLAGS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tz_feature_flags');
      if (!stored) {
        localStorage.setItem('tz_feature_flags', JSON.stringify(DEFAULT_FLAGS));
      }
    }
  }, []);

  const toggleFlag = (flag: keyof FeatureFlags) => {
    const updated = { ...flags, [flag]: !flags[flag] };
    setFlags(updated);
    localStorage.setItem('tz_feature_flags', JSON.stringify(updated));
  };

  const isEnabled = (flag: keyof FeatureFlags) => {
    return !!flags[flag];
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, toggleFlag, isEnabled }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used inside a FeatureFlagProvider.');
  }
  return context;
};
