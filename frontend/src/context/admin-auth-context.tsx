'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  branchId: string | null;
}

export interface AdminSession {
  id: string;
  ipAddress: string | null;
  deviceFingerprint: string | null;
  createdAt: string;
  expiresAt: string;
}

interface AuditLogData {
  id?: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  sessions: AdminSession[];
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  revokeSession: (id: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('tz_admin_user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser) as AdminUser;
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tempAuthData, setTempAuthData] = useState<{ user: AdminUser; token: string; refreshToken?: string; rememberMe: boolean } | null>(null);
  const router = useRouter();
  
  // Timeout references
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set cookies helper (since Client component needs to write cookies for middleware)
  const setCookie = useCallback((name: string, value: string, days?: number) => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
  }, []);

  const deleteCookie = useCallback((name: string) => {
    document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax';
  }, []);

  const refreshSessions = useCallback(async () => {
    const token = localStorage.getItem('tz_admin_token');
    if (!token) return;
    try {
      const res = await api.auth.getLoginHistory(token);
      if (res && res.success) {
        // Map audit logs or active sessions
        const formattedSessions = (res.data as AuditLogData[]).map((log: AuditLogData, idx: number) => {
          let browserName = 'Web Browser';
          if (log.details) {
            try {
              const detailsObj = JSON.parse(log.details) as { browser?: string };
              browserName = detailsObj.browser || 'Web Browser';
            } catch {
              // Ignore parse issues
            }
          }
          return {
            id: log.id || `sess-${idx}`,
            ipAddress: log.ipAddress || '127.0.0.1',
            deviceFingerprint: browserName,
            createdAt: log.createdAt,
            expiresAt: new Date(new Date(log.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
          };
        });
        setSessions(formattedSessions);
      }
    } catch (err) {
      console.error('Failed to fetch admin sessions', err);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('tz_admin_token');
    const refresh = localStorage.getItem('tz_admin_refresh_token') || localStorage.getItem('tz_refresh_token') || '';
    
    try {
      if (token) {
        await api.auth.logout(token, refresh);
      }
    } catch (err) {
      console.warn('Backend logout call failed, cleaning up client session anyway.', err);
    }

    setAdminUser(null);
    setSessions([]);
    localStorage.removeItem('tz_admin_user');
    localStorage.removeItem('tz_admin_token');
    localStorage.removeItem('tz_admin_refresh_token');
    deleteCookie('tz_admin_token');
    
    router.push('/admin/login');
    setIsLoading(false);
  }, [router, deleteCookie]);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await api.auth.adminLogin({ email, password });
      if (res && res.success) {
        const { accessToken, refreshToken, user } = res.data as { accessToken: string; refreshToken?: string; user: AdminUser };
        
        // Defer auth context updates until OTP is successfully entered
        setTempAuthData({ user, token: accessToken, refreshToken, rememberMe });
      }
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  }, []);

  const verifyOtp = useCallback(async (code: string) => {
    setIsLoading(true);
    return new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        if (code === '123456') {
          try {
            if (tempAuthData) {
              const { user, token, refreshToken, rememberMe } = tempAuthData;
              
              // Commit authentication data
              setAdminUser(user);
              localStorage.setItem('tz_admin_user', JSON.stringify(user));
              localStorage.setItem('tz_admin_token', token);
              if (refreshToken) localStorage.setItem('tz_admin_refresh_token', refreshToken);
              
              const cookieExpiryDays = rememberMe ? 7 : undefined;
              setCookie('tz_admin_token', token, cookieExpiryDays);

              await refreshSessions();
              setTempAuthData(null);
            }
            setIsLoading(false);
            resolve();
          } catch (err) {
            setIsLoading(false);
            reject(err);
          }
        } else {
          setIsLoading(false);
          reject(new Error('Invalid 6-digit OTP code. Enter 123456.'));
        }
      }, 1000);
    });
  }, [tempAuthData, setCookie, refreshSessions]);

  const logoutAll = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('tz_admin_token');
    if (token) {
      await api.auth.logoutAll(token);
    }
    setSessions((prev) => prev.slice(0, 1)); // Keep current session only
    setIsLoading(false);
  }, []);

  const revokeSession = useCallback(async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // 1. Initial validation of session on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('tz_admin_token');
        if (token) {
          void refreshSessions();
        }
      }
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshSessions]);

  // 2. Session Inactivity Timeout Monitor (15 mins inactivity logout)
  useEffect(() => {
    if (!adminUser) return;

    const resetTimer = () => {
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      // 15 minutes = 900,000 ms
      activityTimeoutRef.current = setTimeout(() => {
        console.log('Admin session expired due to inactivity.');
        void logout();
        router.push('/admin/login?reason=timeout');
      }, 15 * 60 * 1000);
    };

    let lastReset = 0;
    const handleInteraction = () => {
      const now = Date.now();
      if (now - lastReset > 5000) {
        lastReset = now;
        resetTimer();
      }
    };

    // User interactions to track
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keypress', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    resetTimer();

    return () => {
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keypress', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [adminUser, logout, router]);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        sessions,
        isLoading,
        isLoggedIn: !!adminUser,
        login,
        verifyOtp,
        logout,
        logoutAll,
        revokeSession,
        refreshSessions,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used inside an AdminAuthProvider wrapper.');
  }
  return context;
};
