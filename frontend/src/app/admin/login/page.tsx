'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, AlertCircle, RefreshCw, KeyRound, MonitorCheck } from 'lucide-react';
import { useAdminAuth } from '@/context/admin-auth-context';
import { InputText, InputEmail, InputPassword } from '@/components/ui/form-controls';

export default function AdminLoginPage() {
  const { login, verifyOtp, adminUser } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Route query diagnostics
  const reason = searchParams.get('reason');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Page phases: 'login' | 'otp' | 'forgot' | 'locked'
  const [phase, setPhase] = useState<'login' | 'otp' | 'forgot' | 'locked'>('login');
  
  // Lockout countdown
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (adminUser) {
      router.push('/admin/dashboard');
    }
  }, [adminUser, router]);

  // Lockout countdown ticker
  useEffect(() => {
    if (lockTimeLeft <= 0) {
      if (phase === 'locked') {
        const timer = setTimeout(() => {
          setPhase('login');
        }, 0);
        return () => clearTimeout(timer);
      }
      return;
    }
    const interval = setInterval(() => {
      setLockTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockTimeLeft, phase]);

  // Handle Login submission (Phase 1)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (failedAttempts >= 5) {
      setPhase('locked');
      setLockTimeLeft(180); // 3 minutes lockout
      setError('Too many failed attempts. Console locked for 3 minutes.');
      setLoading(false);
      return;
    }

    try {
      // Perform initial check with API
      await login(email, password, rememberMe);
      
      // If success, advance to OTP verification step
      setSuccess('Credentials verified. A 6-digit OTP has been dispatched.');
      setPhase('otp');
    } catch (err: unknown) {
      const errorObj = err as Error;
      setFailedAttempts((prev) => prev + 1);
      setError(errorObj.message || 'Authentication handshake failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP submission (Phase 2)
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyOtp(otpCode);
      setSuccess('OTP verification successful. Launching ERP console...');
      
      // Success redirect
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Incorrect OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setSuccess('Reset credentials link dispatched to administration logs.');
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex-grow min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      {/* Main card panel */}
      <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 glass">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/25 mb-4 border border-primary/20">
            TZ
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">TrustZone Mobile Care</h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Enterprise Admin Control Panel</p>
        </div>

        {/* Global Warnings/Status logs */}
        {reason === 'timeout' && !error && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg flex items-start gap-2 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Your session expired due to inactivity. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-start gap-2 text-xs font-semibold animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && !error && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-start gap-2 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Phase: Lockout Screen */}
        {phase === 'locked' && (
          <div className="text-center py-6 space-y-4">
            <div className="h-14 w-14 bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <Lock className="h-6 w-6 animate-pulse" />
            </div>
            <h2 className="text-base font-bold text-white">System Console Lockout</h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Multiple invalid authentication requests were flagged. Security protocol has suspended further login attempts.
            </p>
            <div className="text-xl font-black text-primary tracking-widest font-mono py-2 bg-secondary/20 rounded-lg border border-border/60">
              {Math.floor(lockTimeLeft / 60)}:{(lockTimeLeft % 60).toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] text-muted-foreground block">Seconds Remaining</span>
          </div>
        )}

        {/* Phase: Login Form */}
        {phase === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <InputEmail
              label="Administrative Email"
              name="email"
              placeholder="e.g. admin@trustzone.care"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-secondary/20 border-border/60 text-white placeholder:text-slate-600 focus:ring-primary/20 focus:border-primary"
            />

            <div className="space-y-1">
              <InputPassword
                label="Security Key Password"
                name="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-secondary/20 border-border/60 text-white placeholder:text-slate-600 focus:ring-primary/20 focus:border-primary"
              />
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border/60 bg-secondary/20 text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground font-semibold">Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPhase('forgot')}
                  className="text-xs font-bold text-primary hover:underline focus:outline-none"
                >
                  Forgot Key?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white font-bold rounded-lg text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Connecting Lab...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Validate Credentials
                </>
              )}
            </button>

            {/* Diagnostics tip */}
            <div className="mt-6 p-3 bg-secondary/20 border border-border/60 rounded-lg text-[10px] text-muted-foreground font-mono space-y-1">
              <div className="font-bold text-muted-foreground">Diagnostic Auth Keys:</div>
              <div>User: admin@trustzone.care</div>
              <div>Pass: Password123!</div>
            </div>
          </form>
        )}

        {/* Phase: OTP Verification Form */}
        {phase === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="text-center py-2 space-y-2">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/20">
                <KeyRound className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-bold text-white">Verification OTP Code</h2>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Provide the 6-digit temporary key sent to your administrator workstation to complete dynamic MFA authorization.
              </p>
            </div>

            <InputText
              label="6-Digit OTP Key"
              name="otpCode"
              placeholder="123456"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              required
              disabled={loading}
              className="text-center font-mono text-lg tracking-widest bg-secondary/20 border-border/60 text-white placeholder:text-slate-700 focus:ring-primary/20 focus:border-primary"
            />

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white font-bold rounded-lg text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                <>
                  <MonitorCheck className="h-4 w-4" />
                  Establish Session
                </>
              )}
            </button>

            <div className="flex justify-between items-center text-[11px] font-semibold pt-1">
              <button
                type="button"
                onClick={() => setPhase('login')}
                className="text-muted-foreground hover:text-white"
              >
                Back to Sign In
              </button>
              <button
                type="button"
                onClick={() => setOtpCode('123456')}
                className="text-primary hover:underline"
              >
                Mock Autofill (123456)
              </button>
            </div>
          </form>
        )}

        {/* Phase: Forgot Password Form */}
        {phase === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="text-center py-2 space-y-1">
              <h2 className="text-sm font-bold text-white">Reset Credentials Request</h2>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Provide your admin email. An access log report will notify the owner to initiate recovery.
              </p>
            </div>

            <InputEmail
              label="Registered Admin Email"
              name="email"
              placeholder="e.g. admin@trustzone.care"
              required
              disabled={loading}
              className="bg-secondary/20 border-border/60 text-white placeholder:text-slate-600 focus:ring-primary/20 focus:border-primary"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white font-bold rounded-lg text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Dispatch Reset Token'}
            </button>

            <button
              type="button"
              onClick={() => {
                setPhase('login');
                setError(null);
                setSuccess(null);
              }}
              className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-white pt-1"
            >
              Cancel and Return
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
