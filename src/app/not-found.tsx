import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center space-y-4 max-w-md">
          <div className="font-mono text-5xl font-extrabold text-sky-400">404</div>
          <h1 className="text-2xl font-bold text-white">Coordinate Out of Bounds</h1>
          <p className="text-xs text-zinc-400">
            The requested route or CAD resource could not be located on this workplane.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950"
            >
              Return Home
            </Link>
            <Link
              href="/engine"
              className="rounded-xl border border-white/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
            >
              Open 3D Engine
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
