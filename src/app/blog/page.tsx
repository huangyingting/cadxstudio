'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { BLOG_POSTS_SEED } from '@/data/blog-posts';
import { Clock, ArrowUpRight, Tag } from 'lucide-react';

const CATEGORIES = ['All', 'Engineering', 'Tutorials', 'AI & CAD', 'Product', 'Industry'];

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const posts = useMemo(() => {
    if (selectedCategory === 'All') return BLOG_POSTS_SEED;
    return BLOG_POSTS_SEED.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              CadxStudio Engineering Journal
            </span>
            <h1 className="text-4xl font-extrabold text-white">
              Insights on AI CAD, Code-CAD &amp; Computational Mechanical Design
            </h1>
            <p className="text-sm text-zinc-400">
              Deep technical guides on Replicad, build123d, OpenCASCADE WebAssembly kernels, and
              automated ISO/ASME 2D engineering drafting.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-slate-950'
                    : 'border border-white/10 bg-[#0d1017] text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1017] p-6 transition hover:border-sky-500/40 hover:bg-[#111621]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-0.5 font-semibold text-sky-300">
                      <Tag className="h-3 w-3" />
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-sky-300 transition">
                    {post.title}
                  </h2>

                  <p className="text-xs leading-relaxed text-zinc-400 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs">
                  <span className="text-zinc-500">{post.authorName}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-sky-400">
                    Read Article
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
