import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              About CadxStudio
            </span>
            <h1 className="text-4xl font-extrabold text-white">
              Reinventing Mechanical CAD for the AI &amp; Cloud Era
            </h1>
            <p className="text-sm leading-relaxed text-zinc-300">
              CadxStudio is an AI-native parametric CAD platform that bridges natural-language
              intent with mathematically exact Boundary Representation (B-Rep) solid geometry.
              By combining OpenCASCADE WebAssembly with Replicad (JavaScript) and build123d
              (Python), we empower mechanical engineers, robotics teams, and hardware founders to
              move from concept to STEP files and ISO/ASME 2D shop drawings in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-2">
              <h2 className="text-lg font-bold text-white">Zero-Install Browser Architecture</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Traditional desktop CAD suites require gigabytes of local installers and proprietary
                binary files. CadxStudio runs entirely in your browser with human-readable,
                Git-friendly parametric code.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-3">
              <div className="flex items-center gap-3">
                <img src="/ksumlogo.png" alt="KSUM" className="h-7 w-auto" />
                <h2 className="text-lg font-bold text-white">KSUM Incubated</h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Proudly incubated and supported by Kerala Startup Mission (KSUM), building deep-tech
                computational geometry infrastructure from India for global engineering teams.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
