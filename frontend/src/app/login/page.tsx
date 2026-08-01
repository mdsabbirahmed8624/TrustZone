'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Key, Eye, EyeOff, ShieldCheck, Info } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 lg:py-20 bg-background">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-300">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="inline-flex bg-primary/10 text-primary p-3 rounded-full border border-primary/20">
            <Key className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Sign In to TrustZone</h1>
          <p className="text-sm text-muted-foreground">Access your customer repair workbench dashboard.</p>
        </div>

        {/* Card */}
        <div className="glass border border-border p-8 rounded-2xl glow-primary bg-card/40">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Customer login form">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-lg text-xs font-semibold flex items-start gap-2 leading-relaxed">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="password">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border pl-4 pr-12 py-3 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? 'Hide password text' : 'Show password text'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="text-center text-xs text-muted-foreground pt-2">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded">
                Create Account
              </Link>
            </div>
          </form>
        </div>

        {/* Diagnostic note */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-1 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Secure SSL connection. Unauthorized entry is logged automatically.</span>
          </div>
          <div className="text-[10px] text-muted-foreground/60 border border-dashed border-border p-2.5 rounded-lg bg-card/10">
            <span className="font-bold block text-muted-foreground text-center uppercase tracking-wide">Developer Sandbox Notice</span>
            If backend database services are offline, input: <code className="text-primary font-bold">customer@trustzone.care</code> and password: <code className="text-primary font-bold">Password123!</code> to verify full dashboard layouts.
          </div>
        </div>
      </div>
    </div>
  );
}
