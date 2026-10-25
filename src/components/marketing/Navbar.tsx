'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, ArrowUpRight, Shield } from 'lucide-react';

const NAV_LINKS = [
  { href: '/drawing', label: 'Drawing' },
  { href: '/enterprise', label: 'Enterprise' },
  { href: '/api', label: 'API' },
  { href: '/docs', label: 'Docs' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070709]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="CadxStudio"
            className="h-7 w-7 rounded-md object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-sm font-bold tracking-[0.18em] text-white uppercase">
            CADX<span className="text-sky-400">STUDIO</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                  active
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {session?.user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                pathname?.startsWith('/admin')
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400/90 hover:bg-amber-500/10'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <Link
              href="/engine"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold tracking-wider text-slate-950 uppercase shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            >
              Launch App
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/engine"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold tracking-wider text-slate-950 uppercase shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
              >
                Launch App
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
          className="inline-flex items-center justify-center rounded-lg border border-white/10 p-2 text-zinc-300 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0b0d12] px-4 py-4 md:hidden space-y-2">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          {session?.user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/10"
            >
              Admin Governance
            </Link>
          )}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg border border-white/15 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-200"
            >
              Sign In / Invite Registration
            </Link>
            <Link
              href="/engine"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-sky-500 px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-950"
            >
              Launch App
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
