'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export default function ApiAccessPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    expectedVolume: '1,000 - 10,000 CAD generations / mo',
    useCase: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, inquiryType: 'api_access' }),
    });
    if (res.ok) setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <KeyRound className="h-6 w-6 text-sky-400" />
              <h1 className="text-2xl font-bold text-white">Request Developer API Access</h1>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Get production API keys for headless Replicad/build123d STEP generation and automated
              2D ISO/ASME drawing webhooks.
            </p>

            {submitted ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h2 className="text-base font-bold text-white">API Access Request Logged</h2>
                <p className="text-xs text-zinc-300">
                  We have recorded your developer application and will provision your sandbox token
                  shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Developer Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Expected Monthly Generation Volume
                  </label>
                  <select
                    value={form.expectedVolume}
                    onChange={(e) => setForm({ ...form, expectedVolume: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  >
                    <option>Up to 1,000 CAD generations / mo</option>
                    <option>1,000 - 10,000 CAD generations / mo</option>
                    <option>10,000+ CAD generations / mo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Integration Use Case
                  </label>
                  <textarea
                    rows={3}
                    value={form.useCase}
                    onChange={(e) => setForm({ ...form, useCase: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                    placeholder="e.g., Custom bracket configurator, automated quoting pipeline..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-500 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition"
                >
                  Request API Credentials
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
