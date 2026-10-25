'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Layers,
  Compass,
  Download,
} from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { DRAWING_FAQS } from '@/data/docs-courses';

export default function DrawingProductPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        <section className="py-16 lg:py-24 border-b border-white/[0.08] blueprint-grid">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Automated 2D Engineering Drafting
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Instant ISO &amp; ASME 2D Engineering Drawings from 3D Models
                </h1>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Stop spending hours manually laying out orthographic views. CadxStudio projects
                  your 3D B-Rep geometry or uploaded STEP/IGES files into standardized Front, Top,
                  Right, and Isometric views with exact Hidden Line Removal (HLR), automated
                  dimensioning, and customizable title blocks.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/engine/drawing"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-sky-500/25 hover:bg-sky-400 transition"
                  >
                    Launch 2D Drawing Generator
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/engine"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-200 hover:bg-white/5 transition"
                  >
                    Open 3D Workbench
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/15 bg-white p-3 shadow-xl">
                  <img
                    src="/workflow-drawing.png"
                    alt="Orthographic Engineering Sheet"
                    className="w-full h-56 object-contain"
                  />
                  <div className="pt-2 text-center text-xs font-semibold text-slate-800">
                    Multi-View Orthographic Projection
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white p-3 shadow-xl">
                  <img
                    src="/workflow-drawing-stand.png"
                    alt="Isometric & Dimensioned Sheet"
                    className="w-full h-56 object-contain"
                  />
                  <div className="pt-2 text-center text-xs font-semibold text-slate-800">
                    Automated Dimensioning &amp; Title Block
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Drafting Capabilities */}
        <section className="py-16 border-b border-white/[0.08]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-3">
                <Compass className="h-6 w-6 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  First-Angle (ISO) &amp; Third-Angle (ASME)
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Switch seamlessly between European/Indian ISO First-Angle projection and North
                  American ASME Third-Angle projection conventions with compliant title block
                  symbols.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-3">
                <Layers className="h-6 w-6 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Analytic Hidden-Line Removal (HLR)
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Visible silhouettes render as crisp continuous vectors while internal bores,
                  counterbores, and occluded features automatically render as dashed hidden lines.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-3">
                <Download className="h-6 w-6 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Vector PDF, SVG &amp; AutoCAD DXF Export
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Export A4/A3 vector PDFs for machine shops or download layered AutoCAD DXF files
                  with separated VISIBLE, HIDDEN, CENTERLINE, and DIMENSION layers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8 Reverse-Engineered Drawing FAQs */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              2D Engineering Drawing — Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {DRAWING_FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-white/10 bg-[#0d1017] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-white hover:bg-white/[0.02]"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-zinc-400 transition-transform ${
                          isOpen ? 'rotate-180 text-sky-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/[0.06] px-5 py-4 text-xs leading-relaxed text-zinc-300">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
