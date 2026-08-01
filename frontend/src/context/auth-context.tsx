'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export interface UserSession {
  id: string;
  device: string;
  ip: string;
  date: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'technician' | 'admin' | 'superadmin';
  isEmailVerified: boolean;
  avatarUrl: string | null;
  profileCompletion: number;
  savedAddresses: Array<{ id: string; label: string; address: string }>;
  myDevices: Array<{ id: string; brand: string; model: string; imei: string; serial: string }>;
}

interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

interface RegisterResponse {
  data: {
    userId: string;
    email: string;
    verificationToken: string;
  };
}

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

interface AuthContextType {
  user: UserProfile | null;
  sessions: UserSession[];
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: (fields: any) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  revokeSession: (id: string) => Promise<void>;
  updateProfile: (fields: Partial<UserProfile>) => void;
  deleteAccount: () => Promise<void>;
  exportUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: UserProfile = {
  id: 'c7b2e8a1-3d92-4f01-8b1e-0cf2e892c901',
  email: 'customer@trustzone.care',
  firstName: 'Kamrul',
  lastName: 'Hasan',
  phone: '+8801711000000',
  role: 'customer',
  isEmailVerified: true,
  avatarUrl: null,
  profileCompletion: 75,
  savedAddresses: [
    { id: '1', label: 'Home', address: 'Level 4, Shop #412, Metro Shopping Mall, Dhanmondi, Dhaka 1209' },
    { id: '2', label: 'Office', address: 'Plot 45, Road 11, Banani, Dhaka 1213' }
  ],
  myDevices: [
    { id: 'dev-1', brand: 'Apple', model: 'iPhone 13 Pro', imei: '861003048992301', serial: 'F17FK892P930' }
  ]
};

const MOCK_SESSIONS: UserSession[] = [
  { id: 'sess-1', device: 'Chrome / Windows (Current)', ip: '103.113.152.63', date: 'July 9, 2026, 03:30 PM' },
  { id: 'sess-2', device: 'Safari / iPhone 13 Pro', ip: '103.113.152.63', date: 'July 8, 2026, 11:20 AM' }
];

const setCookie = (name: string, value: string, days?: number) => {
  if (typeof window === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tz_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [sessions, setSessions] = useState<UserSession[]>(MOCK_SESSIONS);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tz_token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load session from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('tz_token');
    if (storedToken) {
      setCookie('tz_token', storedToken, 7);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const decoded = decodeJwt(res.data.accessToken);
      const parsedId = decoded?.sub || 'unknown-id';
      const parsedRole = decoded?.role || 'customer';

      const userDetails: UserProfile = {
        id: parsedId,
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        phone: '+8801711000000',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: parsedRole as any,
        isEmailVerified: true,
        avatarUrl: null,
        profileCompletion: 80,
        savedAddresses: MOCK_USER.savedAddresses,
        myDevices: MOCK_USER.myDevices
      };

      setUser(userDetails);
      setToken(res.data.accessToken);
      localStorage.setItem('tz_user', JSON.stringify(userDetails));
      localStorage.setItem('tz_token', res.data.accessToken);
      localStorage.setItem('tz_refresh_token', res.data.refreshToken);
      setCookie('tz_token', res.data.accessToken, 7);

      if (!userDetails.isEmailVerified) {
        router.push('/verify-email');
      } else {
        router.push('/dashboard');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Fallback Mode if NestJS backend is offline
      if (err.message === 'BACKEND_OFFLINE') {
        if (email === MOCK_USER.email && password === 'Password123!') {
          setUser(MOCK_USER);
          setToken('mock-access-token');
          localStorage.setItem('tz_user', JSON.stringify(MOCK_USER));
          localStorage.setItem('tz_token', 'mock-access-token');
          setCookie('tz_token', 'mock-access-token', 7);
          router.push('/dashboard');
          setIsLoading(false);
          return;
        } else {
          setIsLoading(false);
          throw new Error('Invalid credentials. (Diagnostics: use customer@trustzone.care / Password123!)');
        }
      }
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const register = async (fields: any) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(fields),
      });

      // Save temp tokens for sandbox auto-verification
      localStorage.setItem('tz_temp_verification_token', res.data.verificationToken);
      localStorage.setItem('tz_temp_signup', JSON.stringify({ email: fields.email, password: fields.password }));

      const userDetails: UserProfile = {
        id: res.data.userId,
        email: fields.email,
        firstName: fields.firstName,
        lastName: fields.lastName,
        phone: fields.phone,
        role: 'customer',
        isEmailVerified: false,
        avatarUrl: null,
        profileCompletion: 50,
        savedAddresses: [],
        myDevices: []
      };

      setUser(userDetails);
      setToken('temp-verify-token');
      localStorage.setItem('tz_user', JSON.stringify(userDetails));
      localStorage.setItem('tz_token', 'temp-verify-token');
      setCookie('tz_token', 'temp-verify-token', 7);
      router.push('/verify-email');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message === 'BACKEND_OFFLINE') {
        // Mock fallback registration
        const userDetails: UserProfile = {
          ...MOCK_USER,
          email: fields.email,
          firstName: fields.firstName,
          lastName: fields.lastName,
          phone: fields.phone,
          isEmailVerified: false,
        };
        setUser(userDetails);
        setToken('mock-verify-token');
        localStorage.setItem('tz_user', JSON.stringify(userDetails));
        localStorage.setItem('tz_token', 'mock-verify-token');
        setCookie('tz_token', 'mock-verify-token', 7);
        router.push('/verify-email');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const verifyOtp = async (code: string) => {
    setIsLoading(true);
    try {
      const storedVerificationToken = localStorage.getItem('tz_temp_verification_token');
      const tempSignupStr = localStorage.getItem('tz_temp_signup');

      if (storedVerificationToken && tempSignupStr) {
        if (code === '123456') {
          // 1. Verify in real PostgreSQL database
          await apiRequest('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token: storedVerificationToken }),
          });
          localStorage.removeItem('tz_temp_verification_token');

          // 2. Perform auto-login using stored credentials
          const tempSignup = JSON.parse(tempSignupStr);
          await login(tempSignup.email, tempSignup.password);
          localStorage.removeItem('tz_temp_signup');
        } else {
          throw new Error('Incorrect 6-digit OTP verification code. Try "123456".');
        }
      } else if (token === 'mock-verify-token' || token === 'temp-verify-token') {
        if (code === '123456') {
          const updated = { ...user!, isEmailVerified: true, profileCompletion: 80 };
          setUser(updated);
          localStorage.setItem('tz_user', JSON.stringify(updated));
          localStorage.setItem('tz_token', 'mock-active-token');
          setCookie('tz_token', 'mock-active-token', 7);
          router.push('/dashboard');
        } else {
          throw new Error('Incorrect 6-digit OTP verification code. Try "123456".');
        }
      } else {
        // Direct backend call fallback
        await apiRequest('/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token: code }),
        });
        const updated = { ...user!, isEmailVerified: true };
        setUser(updated);
        localStorage.setItem('tz_user', JSON.stringify(updated));
        const currentToken = localStorage.getItem('tz_token');
        if (currentToken) {
          setCookie('tz_token', currentToken, 7);
        }
        router.push('/dashboard');
      }
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const resendVerification = async () => {
    // Simulated resend wrapper
    return new Promise<void>((resolve) => setTimeout(resolve, 800));
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refToken = localStorage.getItem('tz_refresh_token');
      if (refToken && token && token !== 'mock-access-token') {
        await apiRequest('/auth/logout', {
          method: 'POST',
          token,
          body: JSON.stringify({ refreshToken: refToken }),
        });
      }
    } catch {
      // Silently catch offline errors on signout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('tz_user');
    localStorage.removeItem('tz_token');
    localStorage.removeItem('tz_refresh_token');
    deleteCookie('tz_token');
    router.push('/login');
    setIsLoading(false);
  };

  const logoutAll = async () => {
    setIsLoading(true);
    // Revoke all mock sessions
    setSessions([sessions[0]]);
    setIsLoading(false);
  };

  const revokeSession = async (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const updateProfile = (fields: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...fields };
      setUser(updated);
      localStorage.setItem('tz_user', JSON.stringify(updated));
    }
  };

  const deleteAccount = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tz_user');
    localStorage.removeItem('tz_token');
    deleteCookie('tz_token');
    router.push('/');
  };

  const exportUserData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'trustzone_my_data.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessions,
        token,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        verifyOtp,
        resendVerification,
        logout,
        logoutAll,
        revokeSession,
        updateProfile,
        deleteAccount,
        exportUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider wrapper.');
  }
  return context;
};
