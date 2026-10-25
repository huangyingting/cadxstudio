'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Box,
  Code2,
  Cpu,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CadViewport3D } from '@/components/engine/CadViewport3D';
import {
  DEFAULT_BEARING_HOUSING_CODE,
  executeReplicadScript,
  synthesizeCadFromPrompt,
} from '@/lib/cad-kernel';

const SHOWCASE_MODELS = [
  {
    id: 'bearing',
    label: 'Flanged Bearing Housing',
    badge: '2-Part Assembly · 7 Params',
    glbUrl: null,
    prompt: 'Precision flanged bearing housing with bronze bushing and 4 bolt holes',
  },
  {
    id: 'gear',
    label: 'Helical Spur Gear',
    badge: 'Parametric Drive Gear',
    glbUrl: '/models/keyboard.glb',
    prompt: 'Precision spur gear with keyway bore and 18 involute teeth',
  },
  {
    id: 'enclosure',
    label: 'CNC Electronics Enclosure',
    badge: '2-Part Housing + Lid',
    glbUrl: '/models/mouse.glb',
    prompt: 'CNC machined aluminum electronics enclosure box with cover lid',
  },
];

export default function HomePage() {
  const [activeShowcase, setActiveShowcase] = useState(SHOWCASE_MODELS[0]);
  const [sliderPos, setSliderPos] = useState(54);
  const [explodePreview, setExplodePreview] = useState(0.25);

  const compiledModel = useMemo(() => {
    if (activeShowcase.id === 'bearing') {
      return executeReplicadScript(DEFAULT_BEARING_HOUSING_CODE);
    }
    const synth = synthesizeCadFromPrompt(activeShowcase.prompt);
    return executeReplicadScript(synth.code);
  }, [activeShowcase]);

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-white/[0.07] blueprint-grid py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-medium text-sky-300">
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  <span>AI-Native Parametric B-Rep CAD &amp; 2D Drafting Engine</span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08]">
                  Engineering-Grade{' '}
                  <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
                    Parametric CAD
                  </span>{' '}
                  at the Speed of Thought.
                </h1>

                <p className="max-w-xl text-base leading-relaxed text-zinc-400">
                  Generate, inspect, and iterate on watertight OpenCASCADE B-Rep solids, multi-part
                  assemblies, photorealistic studio renders, and ISO/ASME 2D engineering drawings
                  directly in your browser using Replicad and build123d.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <Link
                    href="/engine"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xl shadow-sky-500/25 transition hover:bg-sky-400"
                  >
                    Launch 3D Workbench
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-200 transition hover:bg-white/[0.08]"
                  >
                    Explore 12 CAD Courses
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
                  <div>
                    <div className="text-xl font-bold text-white">STEP / IGES</div>
                    <div className="text-xs text-zinc-400">Exact B-Rep Geometry</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-sky-400">ISO &amp; ASME</div>
                    <div className="text-xs text-zinc-400">Automated 2D HLR Sheets</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-400">Dual Kernel</div>
                    <div className="text-xs text-zinc-400">Replicad JS + build123d</div>
                  </div>
                </div>
              </div>

              {/* Interactive 3D Showcase Card */}
              <div className="lg:col-span-6">
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0c0f17] shadow-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/80 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {SHOWCASE_MODELS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveShowcase(item)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            activeShowcase.id === item.id
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                      {activeShowcase.badge}
                    </span>
                  </div>

                  <div className="h-[390px] w-full relative">
                    <CadViewport3D
                      model={compiledModel}
                      explodeFactor={explodePreview}
                      showEdges={true}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-slate-950/90 px-4 py-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 font-medium">Explode Assembly:</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={explodePreview}
                        onChange={(e) => setExplodePreview(parseFloat(e.target.value))}
                        className="w-28 accent-sky-400"
                      />
                      <span className="font-mono text-sky-400">
                        {Math.round(explodePreview * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeShowcase.glbUrl && (
                        <a
                          href={activeShowcase.glbUrl}
                          download
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-sky-400 transition"
                        >
                          <Download className="h-3.5 w-3.5" />
                          GLB Asset
                        </a>
                      )}
                      <Link
                        href="/engine"
                        className="font-semibold text-sky-400 hover:text-sky-300"
                      >
                        Open in Workbench →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW PIPELINE SECTION */}
        <section className="py-20 border-b border-white/[0.07]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                End-to-End Mechanical Pipeline
              </span>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                From Natural Language to Manufacturing Blueprints
              </h2>
              <p className="text-sm text-zinc-400">
                Unlike mesh generators that output non-manifold triangles, CadxStudio writes clean,
                editable parametric code backed by a real B-Rep solid modeling kernel.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                    <Box className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-zinc-500">STEP 01</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  1. Parametric 3D Solid &amp; Assembly Modeling
                </h3>
                <p className="text-xs leading-relaxed text-zinc-400">
                  Prompt in plain English or write Replicad / build123d code directly. Every
                  dimension in <code className="text-sky-300">defaultParams</code> becomes a live
                  slider with instant feature-tree highlighting.
                </p>
                <img
                  src="/workflow-3d-model.png"
                  alt="3D Parametric CAD Model"
                  className="w-full h-44 object-cover rounded-xl border border-white/10"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <Sliders className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-zinc-500">STEP 02</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  2. Section Analysis, Explode &amp; Studio Render
                </h3>
                <p className="text-xs leading-relaxed text-zinc-400">
                  Inspect internal bores with cross-hatched X/Y/Z clipping planes, explode
                  multi-part assemblies, and switch to Studio Render mode for PBR metal/anodized
                  presentation shots.
                </p>
                <img
                  src="/render-after.png"
                  alt="Studio Photorealistic Render"
                  className="w-full h-44 object-cover rounded-xl border border-white/10"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <FileSpreadsheet className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-zinc-500">STEP 03</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  3. Automated ISO / ASME 2D Engineering Sheets
                </h3>
                <p className="text-xs leading-relaxed text-zinc-400">
                  One click projects your 3D solid into Front, Top, Right, and Isometric hidden-line
                  removal (HLR) views with automatic dimensions and DXF/PDF export.
                </p>
                <img
                  src="/workflow-drawing.png"
                  alt="2D Engineering Drawing"
                  className="w-full h-44 object-cover rounded-xl border border-white/10 bg-white p-1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE STUDIO RENDER COMPARISON */}
        <section className="py-20 border-b border-white/[0.07] bg-[#090b10]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5 space-y-5">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  Built-In Visualization Studio
                </span>
                <h2 className="text-3xl font-bold text-white">
                  Switch from B-Rep Wireframe to Photorealistic Studio Render
                </h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Assign physical materials (Brushed Steel, Anodized Aluminum, Polished Bronze,
                  Matte Carbon Fiber), tune HDRI studio lighting, and export 4K product visuals
                  without leaving your CAD browser tab.
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                    Per-part RGB and physical roughness/metalness material overrides
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                    Studio, Warehouse, Sunset, and Clean White HDRI lighting rigs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                    Instant PNG snapshot &amp; GLB/GLTF export for web embeds
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7">
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950">
                  <img
                    src="/render-after.png"
                    alt="Studio Render After"
                    className="h-[360px] w-full object-cover"
                  />
                  <div
                    style={{ width: `${sliderPos}%` }}
                    className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-sky-400 bg-slate-950/90"
                  >
                    <img
                      src="/workflow-3d-model.png"
                      alt="CAD Viewport Before"
                      className="h-[360px] w-full max-w-none object-cover opacity-90"
                    />
                    <span className="absolute top-3 left-3 rounded bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-300 border border-sky-500/30">
                      CAD B-Rep Viewport
                    </span>
                  </div>
                  <span className="absolute top-3 right-3 rounded bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                    Photorealistic Studio Render
                  </span>
                  <div className="border-t border-white/10 bg-slate-950/90 px-4 py-3 flex items-center gap-4">
                    <span className="text-xs text-zinc-400">Compare CAD vs Studio Render:</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="flex-1 accent-sky-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DUAL KERNEL & KSUM INCUBATION */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-[#0d1320] to-slate-900 p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <img src="/ksumlogo.png" alt="KSUM" className="h-8 w-auto" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                    Backed by Kerala Startup Mission
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Ready to Build Production Mechanical Hardware in the Cloud?
                </h3>
                <p className="text-xs leading-relaxed text-zinc-400">
                  Launch the interactive 3D CAD workbench, explore all 12 parametric modeling
                  courses, or integrate our headless CAD generation API into your engineering
                  stack.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/engine"
                  className="rounded-xl bg-sky-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition"
                >
                  Open CAD Engine
                </Link>
                <Link
                  href="/enterprise"
                  className="rounded-xl border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/5 transition"
                >
                  Enterprise Solutions
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
