'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CadViewport3D } from '@/components/engine/CadViewport3D';
import {
  DEFAULT_BEARING_HOUSING_CODE,
  executeReplicadScript,
} from '@/lib/cad-kernel';
import { Box, Expand, Scissors, ArrowUpRight } from 'lucide-react';

export default function PublicSharedModelViewerPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || 'demo';

  const [projectName, setProjectName] = useState('Precision Flanged Bearing Housing');
  const [ownerName, setOwnerName] = useState('CadxStudio Engineering');
  const [code, setCode] = useState(DEFAULT_BEARING_HOUSING_CODE);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [sectionEnabled, setSectionEnabled] = useState(false);

  useEffect(() => {
    fetch(`/api/public-view/${token}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.project) {
          setProjectName(data.project.name);
          setCode(data.project.code);
          if (data.project.ownerName) setOwnerName(data.project.ownerName);
        }
      })
      .catch(() => {
        // Fallback to default bearing housing preview
      });
  }, [token]);

  const compiledModel = useMemo(() => executeReplicadScript(code), [code]);

  return (
    <div className="flex h-screen w-screen flex-col bg-[#070709] text-zinc-100 overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0b0e14] px-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="CadxStudio" className="h-6 w-6 rounded" />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{projectName}</span>
              <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[10px] text-sky-300">
                Public 3D Share View
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">Shared by {ownerName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSectionEnabled(!sectionEnabled)}
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              sectionEnabled
                ? 'border-red-500/40 bg-red-500/15 text-red-300'
                : 'border-white/15 bg-slate-950 text-zinc-300'
            }`}
          >
            <Scissors className="h-3.5 w-3.5" />
            Section Cut
          </button>

          <button
            type="button"
            onClick={() => setExplodeFactor(explodeFactor > 0 ? 0 : 0.65)}
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              explodeFactor > 0
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                : 'border-white/15 bg-slate-950 text-zinc-300'
            }`}
          >
            <Expand className="h-3.5 w-3.5" />
            Explode Assembly
          </button>

          <Link
            href="/engine"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-400"
          >
            <span>Open in CadxStudio</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <CadViewport3D
          model={compiledModel}
          sectionEnabled={sectionEnabled}
          explodeFactor={explodeFactor}
          showEdges={true}
        />
        <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-slate-950/90 px-4 py-2.5 text-xs text-zinc-300 flex items-center gap-3">
          <Box className="h-4 w-4 text-sky-400" />
          <span>{compiledModel.parts.length} B-Rep Components</span>
          <span>·</span>
          <span className="font-mono">
            {compiledModel.boundingBox.size.join(' × ')} mm
          </span>
        </div>
      </main>
    </div>
  );
}
