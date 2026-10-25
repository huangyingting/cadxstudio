import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { BLOG_POSTS_SEED } from '@/data/blog-posts';
import { ArrowLeft, Clock, User } from 'lucide-react';

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS_SEED.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />

      <main className="flex-1 py-14">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 space-y-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Engineering Articles
          </Link>

          <header className="space-y-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3 text-xs text-sky-400 font-semibold uppercase tracking-wider">
              <span>{post.category}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-zinc-400">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <User className="h-3.5 w-3.5 text-sky-400" />
              <span>
                By <strong className="text-zinc-200">{post.authorName}</strong> ({post.authorRole})
              </span>
            </div>
          </header>

          <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
            {post.content.split('\n\n').map((block, i) => {
              if (block.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-xl font-bold text-white pt-4">
                    {block.replace('## ', '')}
                  </h2>
                );
              }
              if (block.startsWith('### ')) {
                return (
                  <h3 key={i} className="text-base font-bold text-sky-300 pt-2">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('```')) {
                const clean = block.replace(/```\w*\n?/, '').replace(/```$/, '');
                return (
                  <pre
                    key={i}
                    className="rounded-xl border border-white/15 bg-slate-950 p-4 font-mono text-xs text-sky-300 overflow-x-auto"
                  >
                    {clean}
                  </pre>
                );
              }
              return <p key={i}>{block}</p>;
            })}
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Try This Workflow in the CadxStudio 3D Engine
              </h3>
              <p className="text-xs text-zinc-300">
                Compile Replicad &amp; build123d scripts directly in your browser and export STEP or
                2D ISO drawings.
              </p>
            </div>
            <Link
              href="/engine"
              className="shrink-0 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400"
            >
              Launch Engine
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
