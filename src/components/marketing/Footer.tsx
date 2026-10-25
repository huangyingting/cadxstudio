import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050608] text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="CadxStudio" className="h-7 w-7 rounded-md" />
              <span className="text-sm font-bold tracking-[0.18em] text-white uppercase">
                CADX<span className="text-sky-400">STUDIO</span>
              </span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-zinc-400">
              AI-powered parametric 3D CAD workbench, multi-part assembly studio, photorealistic
              renderer, and automated ISO/ASME 2D engineering drawing engine in your browser.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <img
                src="/ksumlogo.png"
                alt="Kerala Startup Mission"
                className="h-7 w-auto opacity-80"
              />
              <span className="text-[11px] text-zinc-500">
                Incubated &amp; Backed by Kerala Startup Mission (KSUM)
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/engine" className="hover:text-sky-400 transition">
                  3D CAD Engine
                </Link>
              </li>
              <li>
                <Link href="/drawing" className="hover:text-sky-400 transition">
                  2D Engineering Drawings
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="hover:text-sky-400 transition">
                  Enterprise CAD Cloud
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-sky-400 transition">
                  Developer CAD API
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-sky-400 transition">
                  Pricing &amp; Credits
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Learn &amp; Academy
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/docs" className="hover:text-sky-400 transition">
                  Documentation &amp; Courses
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-sky-400 transition">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sky-400 transition">
                  About CadxStudio
                </Link>
              </li>
              <li>
                <a
                  href="/python/b3d-sandbox-setup.py"
                  download
                  className="hover:text-sky-400 transition"
                >
                  build123d Sandbox Script
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Legal &amp; Access
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-sky-400 transition">
                  Terms &amp; Privacy
                </Link>
              </li>
              <li>
                <Link href="/open-source-license" className="hover:text-sky-400 transition">
                  Open Source Licenses
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-sky-400 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-sky-400 transition">
                  Redeem Invitation Code
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-[11px] text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} CadxStudio Technologies. All rights reserved.</p>
          <p>Powered by OpenCASCADE B-Rep Kernel, Replicad &amp; build123d.</p>
        </div>
      </div>
    </footer>
  );
}
