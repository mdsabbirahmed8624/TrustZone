'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Mail, ArrowLeft, CheckCircle2, Info } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiRequest('/auth/reset-password-request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message === 'BACKEND_OFFLINE') {
        // Mock success for offline demo
        setSuccess(true);
      } else {
        setError(err.message || 'Failed to dispatch reset request.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-12 lg:py-20 bg-background">
        <div className="w-full max-w-md text-center space-y-6 animate-in fade-in duration-300">
          <div className="inline-flex bg-emerald-500/10 text-emerald-500 p-4 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-foreground">Reset Code Sent!</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If an account is associated with <span className="font-bold text-foreground">{email}</span>, a password reset link has been dispatched.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 lg:py-20 bg-background">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-300">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="inline-flex bg-primary/10 text-primary p-3 rounded-full border border-primary/20">
            <Mail className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Recover Password</h1>
          <p className="text-sm text-muted-foreground">Request a password reset link to recover access.</p>
        </div>

        {/* Card */}
        <div className="glass border border-border p-8 rounded-2xl glow-primary bg-card/40">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Password recovery request form">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-lg text-xs font-semibold flex items-start gap-2 leading-relaxed">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="customer@trustzone.care"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border border-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
            </button>

            <div className="text-center text-xs text-muted-foreground pt-2">
              Remembered your credentials?{' '}
              <Link href="/login" className="font-bold text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
