'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Building2, CheckCircle2 } from 'lucide-react';

export default function EnterprisePlanPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    roleTitle: '',
    teamSize: '10-50 engineers',
    useCase: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, inquiryType: 'enterprise' }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-6 w-6 text-sky-400" />
              <h1 className="text-2xl font-bold text-white">Enterprise CAD Cloud Inquiry</h1>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Configure dedicated OpenCASCADE compute nodes, SSO/SAML, custom Replicad/build123d
              libraries, and unlimited team seats.
            </p>

            {submitted ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h2 className="text-base font-bold text-white">
                  Enterprise Request Received
                </h2>
                <p className="text-xs text-zinc-300">
                  Our solutions architecture team has logged your inquiry and will reach out within
                  1 business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                      placeholder="Ada Lovelace"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Work Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                      placeholder="ada@aerospace.io"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Company / Organization *
                    </label>
                    <input
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                      placeholder="Apex Robotics Ltd."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Engineering Team Size
                    </label>
                    <select
                      value={form.teamSize}
                      onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                    >
                      <option>10-50 engineers</option>
                      <option>50-200 engineers</option>
                      <option>200+ engineers</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Primary CAD Workflows &amp; Security Requirements
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white"
                    placeholder="Describe your parametric assemblies, ERP/PLM integration, or on-premise requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-sky-500 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition"
                >
                  {loading ? 'Submitting...' : 'Submit Enterprise Inquiry'}
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
