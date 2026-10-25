import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-6">
          <h1 className="text-3xl font-extrabold text-white">Terms of Service &amp; Privacy Policy</h1>
          <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-4 text-xs leading-relaxed text-zinc-300">
            <h2 className="text-base font-bold text-white">1. Intellectual Property &amp; CAD Ownership</h2>
            <p>
              You retain 100% ownership and commercial manufacturing rights to all Replicad/build123d
              source scripts, 3D STEP/STL/GLB models, and 2D ISO/ASME engineering drawings created
              in your CadxStudio workspace.
            </p>
            <h2 className="text-base font-bold text-white">2. Invite-Only Access &amp; Account Security</h2>
            <p>
              Access to authenticated workspaces is governed by single-use or expiring cryptographic
              invitation codes. All authentication events, invitation redemptions, and administrative
              role changes are recorded in the security audit log.
            </p>
            <h2 className="text-base font-bold text-white">3. Data Privacy &amp; Isolation</h2>
            <p>
              Private projects and team submissions are strictly isolated to authorized workspace
              members unless explicitly shared via a revocable public view token.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
