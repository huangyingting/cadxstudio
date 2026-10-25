import Link from 'next/link';
import {
  ShieldCheck,
  Server,
  Users,
  GitBranch,
  Lock,
  Cpu,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export default function EnterprisePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 border-b border-white/[0.08] blueprint-grid">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold text-amber-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              CadxStudio Enterprise Cloud &amp; On-Premise
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Dedicated AI CAD Infrastructure for Hardware Engineering Teams
            </h1>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              Deploy private parametric part libraries, invite-only RBAC workspaces, Git-style PR
              review workflows for mechanical assemblies, and VPC-isolated OpenCASCADE workers.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/enterprise-plan"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition"
              >
                Request Enterprise Deployment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/api"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/5 transition"
              >
                Explore Developer API
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-3">
              <Lock className="h-6 w-6 text-sky-400" />
              <h3 className="text-lg font-bold text-white">
                Invite-Only Governance &amp; Audit Trails
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enforce single-use or expiring invitation codes, role-based access control (ADMIN,
                MEMBER, VIEWER), and immutable security audit logs for every design action.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-3">
              <GitBranch className="h-6 w-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                Team Workspaces &amp; PR Geometry Reviews
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Engineers can fork shared team assemblies, modify parametric dimensions, and submit
                change proposals with full code + 3D geometry inspection before merging.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-3">
              <Server className="h-6 w-6 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                Self-Hosted Docker &amp; PostgreSQL Ready
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Run inside your air-gapped VPC or on-premise Kubernetes cluster with zero external
                telemetry and custom fine-tuned LLM endpoints for proprietary CAD macros.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
