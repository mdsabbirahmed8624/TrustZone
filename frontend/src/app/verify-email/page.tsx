'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { ShieldAlert, ArrowRight, RefreshCw, Info } from 'lucide-react';

export default function VerifyEmail() {
  const { verifyOtp, resendVerification } = useAuth();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await verifyOtp(code);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'OTP verification code is invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setSuccess(null);
    try {
      await resendVerification();
      setSuccess('Verification OTP sent successfully.');
      setTimer(60);
    } catch {
      setError('Failed to resend code.');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 lg:py-20 bg-background">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-300">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="inline-flex bg-primary/10 text-primary p-3 rounded-full border border-primary/20">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Verify Your Account</h1>
          <p className="text-sm text-muted-foreground">We sent a 6-digit OTP verification code to your email.</p>
        </div>

        {/* Card */}
        <div className="glass border border-border p-8 rounded-2xl glow-primary bg-card/40">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Account OTP verification form">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-lg text-xs font-semibold flex items-start gap-2 leading-relaxed">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3.5 rounded-lg text-xs font-semibold flex items-start gap-2 leading-relaxed">
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="otpCode">6-Digit Verification Code</label>
              <input
                id="otpCode"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-secondary border border-border px-4 py-3 rounded-lg text-center tracking-widest text-lg font-black focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[10px] text-muted-foreground block text-center">
                For sandbox verification bypass, enter: <code className="text-primary font-bold">123456</code>.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              Verify Code
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Resend button */}
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border/40">
              <span>Didn&apos;t get a code?</span>
              {timer > 0 ? (
                <span>Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-bold text-primary hover:text-accent flex items-center gap-1 focus:outline-none"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Resend Code
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
