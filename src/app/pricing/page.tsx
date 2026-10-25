import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CheckCircle2, Sparkles } from 'lucide-react';

const PLANS = [
  {
    name: 'Free Explorer',
    price: '$0',
    period: 'forever',
    credits: '50 Starter Credits',
    description: 'Ideal for students and makers exploring parametric Code-CAD.',
    ctaText: 'Launch Free Workbench',
    ctaHref: '/engine',
    featured: false,
    features: [
      'Replicad JS & build123d Python Editor',
      'Interactive 3D Viewport & Feature Tree',
      'STEP, STL & OBJ Exports',
      'Public 3D Share Links',
    ],
  },
  {
    name: 'Starter Pack',
    price: '$2',
    period: 'one-time top-up',
    credits: '30 AI CAD Credits',
    description: 'Pay-as-you-go credit pack for quick mechanical prototypes.',
    ctaText: 'Top Up in Engine',
    ctaHref: '/engine',
    featured: false,
    features: [
      '30 AI Prompt-to-CAD Generations',
      '2D ISO/ASME Drawing Sheet Exports',
      'Photorealistic Studio Renderer',
      'Credits never expire',
    ],
  },
  {
    name: 'Pro Engineer',
    price: '$20',
    period: '/ month',
    credits: '200 AI CAD Credits / mo',
    description: 'Full production workflow for mechanical engineers & hardware startups.',
    ctaText: 'Upgrade to Pro',
    ctaHref: '/pro-plan',
    featured: true,
    features: [
      '200 Priority AI CAD Generations / mo',
      'Multi-Part Assemblies & Exploded Views',
      'Unlimited ISO/ASME 2D DXF + PDF Sheets',
      'Team Workspaces & PR Geometry Reviews',
      '4K Photorealistic Studio Renders',
    ],
  },
  {
    name: 'Pro+ Studio',
    price: '$49',
    period: '/ month',
    credits: '400 AI CAD Credits / mo',
    description: 'High-volume parametric synthesis and API access for design studios.',
    ctaText: 'Get Pro+ Studio',
    ctaHref: '/pro-plan',
    featured: false,
    features: [
      '400 Priority AI CAD Generations / mo',
      'Developer REST API Sandbox Access',
      'Custom Title Block Templates',
      'Priority Geometry Kernel Queue',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              Transparent Engineering Pricing
            </span>
            <h1 className="text-4xl font-extrabold text-white">
              Scale from Single Brackets to Enterprise Assemblies
            </h1>
            <p className="text-sm text-zinc-400">
              Manual code editing and local parametric slider tuning are always free. Credits are
              consumed only when invoking AI CAD synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-2xl border p-6 ${
                  plan.featured
                    ? 'border-sky-400 bg-gradient-to-b from-sky-500/15 to-[#0d1017] shadow-xl shadow-sky-500/10'
                    : 'border-white/10 bg-[#0d1017]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white">{plan.name}</h2>
                    {plan.featured && (
                      <span className="rounded-full bg-sky-500 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-950">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-zinc-400">{plan.period}</span>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs font-mono text-sky-300">
                    {plan.credits}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{plan.description}</p>
                  <ul className="space-y-2 pt-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`mt-6 block rounded-xl py-2.5 text-center text-xs font-bold uppercase tracking-wider transition ${
                    plan.featured
                      ? 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                      : 'border border-white/15 bg-white/[0.04] text-white hover:bg-white/10'
                  }`}
                >
                  {plan.ctaText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
