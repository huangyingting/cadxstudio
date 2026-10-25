'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { KeyRound, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [codeStatus, setCodeStatus] = useState<{
    checked: boolean;
    valid: boolean;
    message: string;
    role?: string;
  }>({ checked: false, valid: false, message: '' });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkInviteCode = async () => {
    if (!invitationCode.trim()) return;
    const res = await fetch('/api/invitations/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: invitationCode.trim(),
        email: email.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (data.valid) {
      setCodeStatus({
        checked: true,
        valid: true,
        role: data.invitation?.role,
        message: `Valid invitation (${data.invitation?.role} role · ${data.invitation?.remainingUses} uses left)`,
      });
    } else {
      setCodeStatus({
        checked: true,
        valid: false,
        message: data.reason || 'Invalid invitation code.',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationCode: invitationCode.trim(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }

      const loginRes = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push('/engine');
        router.refresh();
      } else {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16 blueprint-grid">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-[#0c0f17] p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Invite-Only Registration</h1>
            <p className="text-xs text-zinc-400">
              CadxStudio requires a valid single-use or organization invitation code to register.
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Invitation Code *
              </label>
              <div className="flex gap-2">
                <input
                  required
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  onBlur={checkInviteCode}
                  placeholder="CADX-XXXX-XXXX"
                  className="flex-1 rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs font-mono uppercase text-amber-300 focus:border-sky-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={checkInviteCode}
                  className="rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                >
                  Verify
                </button>
              </div>
              {codeStatus.checked && (
                <p
                  className={`mt-1.5 flex items-center gap-1.5 text-[11px] ${
                    codeStatus.valid ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {codeStatus.valid ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  <span>{codeStatus.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nikola Tesla"
                className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nikola@cadxstudio.in"
                className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Password (min. 8 characters) *
              </label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{loading ? 'Redeeming Invite...' : 'Redeem Code & Create Account'}</span>
            </button>
          </form>

          <div className="border-t border-white/10 pt-4 text-center text-xs text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-sky-400 hover:text-sky-300">
              Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
