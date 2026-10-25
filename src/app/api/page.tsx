'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Terminal, Play, Code2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DeveloperApiPage() {
  const [prompt, setPrompt] = useState(
    'Precision flanged bearing housing with 4 bolt holes and bronze bushing'
  );
  const [format, setFormat] = useState<'step' | 'stl' | 'obj' | 'gltf'>('step');
  const [responseJson, setResponseJson] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runSandbox = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, format, engine: 'replicad' }),
      });
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1">
        <section className="py-16 lg:py-24 border-b border-white/[0.08] blueprint-grid">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300">
                  <Terminal className="h-3.5 w-3.5" />
                  REST &amp; Webhook CAD Generation API
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Programmatic Text-to-STEP &amp; Parametric B-Rep API
                </h1>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Embed CadxStudio’s parametric CAD synthesis and OpenCASCADE geometry compilation
                  into your CPQ configurators, PLM pipelines, and autonomous robotics toolchains.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/api-access"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition"
                  >
                    Request API Key
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={runSandbox}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition"
                  >
                    <Play className="h-3.5 w-3.5 text-sky-400" />
                    Test Live Endpoint
                  </button>
                </div>
              </div>

              {/* Interactive API Playground */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-white/15 bg-[#0c0f17] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                        POST
                      </span>
                      <span className="font-mono text-xs text-zinc-300">/api/v1/generate</span>
                    </div>
                    <button
                      type="button"
                      onClick={runSandbox}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-sky-400"
                    >
                      <Play className="h-3 w-3" />
                      {loading ? 'Running...' : 'Send Request'}
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-zinc-400 mb-1">Prompt</label>
                        <input
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          Export Format
                        </label>
                        <select
                          value={format}
                          onChange={(e) =>
                            setFormat(e.target.value as 'step' | 'stl' | 'obj' | 'gltf')
                          }
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white"
                        >
                          <option value="step">STEP (AP214)</option>
                          <option value="stl">STL Mesh</option>
                          <option value="obj">Wavefront OBJ</option>
                          <option value="gltf">glTF 2.0</option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-950 p-3 font-mono text-[11px] text-sky-300 max-h-72 overflow-auto">
                      <pre className="whitespace-pre-wrap">
                        {responseJson ||
                          `// Click "Send Request" to execute POST /api/v1/generate\n{\n  "prompt": "${prompt}",\n  "engine": "replicad",\n  "format": "${format}"\n}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
