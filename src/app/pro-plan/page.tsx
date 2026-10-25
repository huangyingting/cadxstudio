'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProPlanPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [tier, setTier] = useState('Pro ($20/mo - 200 Credits)');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inquiryType: 'pro_plan',
        name,
        email,
        message: `Selected Plan: ${tier}`,
      }),
    });
    if (res.ok) setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-8 space-y-5">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-sky-400" />
              <h1 className="text-2xl font-bold text-white">Upgrade to CadxStudio Pro</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Already signed in? You can upgrade directly inside the{' '}
              <Link href="/engine" className="text-sky-400 underline">
                3D CAD Workbench
              </Link>{' '}
              or submit your Pro team billing details below.
            </p>

            {submitted ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h2 className="text-base font-bold text-white">Pro Subscription Request Saved</h2>
                <p className="text-xs text-zinc-300">
                  Launch the workbench to activate your credits immediately.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name *</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Account Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Select Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  >
                    <option>Starter Top-Up ($2 - 30 Credits)</option>
                    <option>Pro ($20/mo - 200 Credits)</option>
                    <option>Pro+ Studio ($49/mo - 400 Credits)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-500 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400"
                >
                  Continue to Pro Activation
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
