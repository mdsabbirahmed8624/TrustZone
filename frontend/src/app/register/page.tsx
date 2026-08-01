'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ShieldCheck, UserPlus, Info } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
  const isPasswordStrong = fields.password.length >= 8 && passwordRegex.test(fields.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fields.password !== fields.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isPasswordStrong) {
      setError('Password does not meet validation strength requirements.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: fields.email,
        phone: fields.phone,
        password: fields.password,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An unexpected registration error occurred.');
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
            <UserPlus className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Create Customer Account</h1>
          <p className="text-sm text-muted-foreground">Register to schedule benchmarks, verify warranty, and track repairs.</p>
        </div>

        {/* Card */}
        <div className="glass border border-border p-8 rounded-2xl glow-primary bg-card/40">
          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Customer registration form">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs font-semibold flex items-start gap-2 leading-relaxed">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  required
                  placeholder="Kamrul"
                  value={fields.firstName}
                  onChange={(e) => setFields({ ...fields, firstName: e.target.value })}
                  className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  required
                  placeholder="Hasan"
                  value={fields.lastName}
                  onChange={(e) => setFields({ ...fields, lastName: e.target.value })}
                  className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="kamrul@email.com"
                value={fields.email}
                onChange={(e) => setFields({ ...fields, email: e.target.value })}
                className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="phone">Phone (E.164 format)</label>
              <input
                id="phone"
                type="tel"
                required
                placeholder="+8801711000000"
                value={fields.phone}
                onChange={(e) => setFields({ ...fields, phone: e.target.value })}
                className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="password">Password</label>
                {fields.password && (
                  <span className={`text-[10px] font-bold ${isPasswordStrong ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {isPasswordStrong ? 'Strong Password' : 'Weak Password'}
                  </span>
                )}
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={fields.password}
                onChange={(e) => setFields({ ...fields, password: e.target.value })}
                className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[10px] text-muted-foreground block leading-tight">
                Must be &ge; 8 characters and contain 1 uppercase, 1 lowercase, and 1 number/special character.
              </span>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                value={fields.confirmPassword}
                onChange={(e) => setFields({ ...fields, confirmPassword: e.target.value })}
                className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 flex justify-center items-center gap-1.5"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>

            <div className="text-center pt-2 text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded">
                Sign In
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center flex justify-center gap-1 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Your data is protected by secure electrostatic-discharge protocols.</span>
        </div>
      </div>
    </div>
  );
}
