import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

const OSS_PACKAGES = [
  {
    name: 'OpenCASCADE Technology (OCCT) / replicad-opencascadejs',
    license: 'LGPL-2.1',
    description: 'Boundary Representation (B-Rep) 3D solid modeling and HLR projection kernel.',
  },
  {
    name: 'Replicad',
    license: 'MIT License',
    description: 'Ergonomic JavaScript/TypeScript parametric CAD API over OpenCASCADE.',
  },
  {
    name: 'build123d',
    license: 'Apache-2.0 License',
    description: 'Pythonic algebra and builder-mode parametric CAD framework.',
  },
  {
    name: 'Three.js',
    license: 'MIT License',
    description: 'WebGL 3D viewport rendering, PBR materials, and GLTF/STL/OBJ exporters.',
  },
  {
    name: 'Next.js & React',
    license: 'MIT License',
    description: 'Full-stack React application framework and server route handlers.',
  },
];

export default function OpenSourceLicensePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          <h1 className="text-3xl font-extrabold text-white">Open Source Licenses &amp; Attributions</h1>
          <p className="text-xs text-zinc-400">
            CadxStudio is built upon world-class open-source computational geometry and web
            rendering libraries.
          </p>
          <div className="space-y-3">
            {OSS_PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className="rounded-xl border border-white/10 bg-[#0d1017] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h2 className="text-sm font-bold text-white">{pkg.name}</h2>
                  <p className="text-xs text-zinc-400 mt-1">{pkg.description}</p>
                </div>
                <span className="shrink-0 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 font-mono text-[11px] text-sky-300">
                  {pkg.license}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
