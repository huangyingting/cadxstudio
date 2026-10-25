'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Lock, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/engine';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password, or account is deactivated.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-[#0c0f17] p-8 shadow-2xl space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Sign In to CadxStudio</h1>
        <p className="text-xs text-zinc-400">
          Enter your credentials to access the 3D Parametric CAD Workbench.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@organization.com"
            className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition disabled:opacity-50"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="border-t border-white/10 pt-4 text-center space-y-2">
        <p className="text-xs text-zinc-400">Have an invitation code?</p>
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Redeem Invitation &amp; Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16 blueprint-grid">
        <Suspense fallback={<div className="text-xs text-zinc-400">Loading...</div>}>
          <LoginFormInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
