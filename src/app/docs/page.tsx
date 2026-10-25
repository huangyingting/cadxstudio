'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Download,
  ChevronRight,
  ChevronDown,
  Code2,
  Play,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { DOCS_COURSE_MODULES, DOCS_FAQS, type DocCourseModule } from '@/data/docs-courses';

export default function DocsCoursesPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>(DOCS_COURSE_MODULES[0].slug);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive course parameter demo state
  const [demoOuterDiameter, setDemoOuterDiameter] = useState(76);
  const [demoBoltCount, setDemoBoltCount] = useState(4);

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return DOCS_COURSE_MODULES;
    return DOCS_COURSE_MODULES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeModule: DocCourseModule = useMemo(() => {
    return (
      DOCS_COURSE_MODULES.find((m) => m.slug === selectedSlug) || DOCS_COURSE_MODULES[0]
    );
  }, [selectedSlug]);

  const categories = ['Getting Started', 'Learn', 'Reference'] as const;

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row px-4 py-8 sm:px-6 lg:px-8 gap-8">
        {/* LEFT COURSE CURRICULUM SIDEBAR */}
        <aside className="w-full lg:w-72 shrink-0 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  CAD Academy ({DOCS_COURSE_MODULES.length} Modules)
                </span>
              </div>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses & docs..."
                className="w-full rounded-lg border border-white/10 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-4">
              {categories.map((cat) => {
                const items = filteredModules.filter((m) => m.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {cat}
                    </div>
                    {items.map((mod) => {
                      const active = mod.slug === activeModule.slug;
                      return (
                        <button
                          key={mod.slug}
                          type="button"
                          onClick={() => setSelectedSlug(mod.slug)}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                            active
                              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                              : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                          }`}
                        >
                          <span className="truncate">{mod.title}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10">
              <a
                href="/python/b3d-sandbox-setup.py"
                download
                className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
              >
                <Download className="h-3.5 w-3.5" />
                Download b3d-sandbox-setup.py
              </a>
            </div>
          </div>
        </aside>

        {/* MAIN COURSE MODULE CONTENT */}
        <main className="flex-1 space-y-8 min-w-0">
          <article className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider">
                  <span>{activeModule.category}</span>
                  <span>·</span>
                  <span>{activeModule.duration}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {activeModule.title}
                </h1>
              </div>
              <Link
                href="/engine"
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition"
              >
                <Play className="h-3.5 w-3.5" />
                Practice in Engine
              </Link>
            </div>

            <p className="text-sm leading-relaxed text-zinc-300">{activeModule.summary}</p>

            {/* Course Sections */}
            <div className="space-y-6">
              {activeModule.sections.map((sec, idx) => (
                <div
                  key={sec.heading}
                  className="rounded-xl border border-white/[0.07] bg-slate-950/60 p-5 space-y-3"
                >
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-mono text-sky-300">
                      {idx + 1}
                    </span>
                    {sec.heading}
                  </h2>
                  <p className="text-xs leading-relaxed text-zinc-300">{sec.body}</p>
                  {sec.bullets && (
                    <ul className="space-y-1.5 pt-1">
                      {sec.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs text-zinc-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Code Example Block */}
            {activeModule.codeExample && (
              <div className="rounded-xl border border-white/15 bg-slate-950 overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Code2 className="h-4 w-4 text-sky-400" />
                    <span>{activeModule.codeExample.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(activeModule.codeExample?.code || '');
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 1800);
                    }}
                    className="rounded bg-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-white/20"
                  >
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                  {activeModule.codeExample.code}
                </pre>
              </div>
            )}

            {/* Interactive Parameter Lab Widget */}
            <div className="rounded-xl border border-sky-500/25 bg-sky-500/[0.05] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                  <Sliders className="h-4 w-4" />
                  <span>Interactive Parametric Slider Preview</span>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">
                  defaultParams Live Binding
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>outerDiameter (mm)</span>
                    <span className="font-mono text-sky-400">{demoOuterDiameter} mm</span>
                  </label>
                  <input
                    type="range"
                    min={48}
                    max={120}
                    value={demoOuterDiameter}
                    onChange={(e) => setDemoOuterDiameter(Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>boltCount (Polar Pattern)</span>
                    <span className="font-mono text-amber-400">{demoBoltCount} holes</span>
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={8}
                    value={demoBoltCount}
                    onChange={(e) => setDemoBoltCount(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>
            </div>
          </article>

          {/* 13 Reverse-Engineered Documentation FAQs */}
          <section className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">
              Frequently Asked Questions ({DOCS_FAQS.length})
            </h2>
            <div className="space-y-2.5">
              {DOCS_FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-white/10 bg-slate-950/60 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left text-xs sm:text-sm font-semibold text-white hover:bg-white/[0.02]"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-zinc-400 transition-transform ${
                          isOpen ? 'rotate-180 text-sky-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/[0.06] px-4 py-3.5 text-xs leading-relaxed text-zinc-300">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
