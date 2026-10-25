'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Printer,
  Settings2,
  Upload,
} from 'lucide-react';
import { DrawingSheetSvg } from '@/components/engine/DrawingSheetSvg';
import {
  DEFAULT_BEARING_HOUSING_CODE,
  executeReplicadScript,
} from '@/lib/cad-kernel';
import {
  exportDrawingToDxf,
  createDrawingSheetData,
  type DrawingConfig,
  type ProjectionStandard,
  type SheetSize,
} from '@/lib/drawing-engine';

export default function EngineDrawingGeneratorPage() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [code, setCode] = useState(DEFAULT_BEARING_HOUSING_CODE);
  const [paramOverrides, setParamOverrides] = useState<Record<string, number>>({});
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  const [config, setConfig] = useState<DrawingConfig>({
    title: 'Precision Flanged Bearing Housing',
    partNumber: 'CADX-BFH-2026-01',
    company: 'CADXSTUDIO ENGINEERING LABS',
    drawnBy: 'Lead Mechanical Engineer',
    material: 'ALUMINUM 6061-T6 / SAE 660 BRONZE',
    finish: 'ANODIZED MIL-A-8625 TYPE II',
    weightKg: '0.48 kg',
    scale: '1:1',
    sheetSize: 'A3',
    projection: 'first-angle',
    revision: 'A',
    includeHiddenLines: true,
    includeDimensions: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('cadxstudio_active_model');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.code) setCode(parsed.code);
          if (parsed.paramOverrides) setParamOverrides(parsed.paramOverrides);
          if (parsed.name) setConfig((c) => ({ ...c, title: parsed.name }));
        } catch {
          // ignore parse error
        }
      }
    }
  }, []);

  const compiledModel = useMemo(
    () => executeReplicadScript(code, paramOverrides),
    [code, paramOverrides]
  );

  const drawingSheet = useMemo(
    () => createDrawingSheetData(compiledModel, config),
    [compiledModel, config]
  );

  const handleExportDxf = () => {
    const dxfContent = exportDrawingToDxf(drawingSheet);
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.partNumber.toLowerCase()}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.partNumber.toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStepFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const baseName = file.name.replace(/\.(step|stp|iges|igs)$/i, '');
    setConfig((c) => ({
      ...c,
      title: baseName,
      partNumber: `STEP-${Date.now().toString().slice(-5)}`,
    }));
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#070709] text-zinc-100 overflow-hidden">
      {/* Top Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0b0e14] px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/engine"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            3D Workbench
          </Link>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-sky-400" />
            <h1 className="text-sm font-bold text-white">
              2D Engineering Drawing Generator ({config.sheetSize} ·{' '}
              {config.projection === 'first-angle' ? 'ISO 1st Angle' : 'ASME 3rd Angle'})
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-sky-400">
            <Upload className="h-3.5 w-3.5 text-sky-400" />
            <span>Upload STEP / IGES</span>
            <input
              type="file"
              accept=".step,.stp,.iges,.igs"
              onChange={handleStepFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setSetupModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-sky-400"
          >
            <Settings2 className="h-3.5 w-3.5 text-amber-400" />
            Sheet Setup
          </button>

          <button
            type="button"
            onClick={handleExportDxf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/25"
          >
            <Download className="h-3.5 w-3.5" />
            Export DXF
          </button>

          <button
            type="button"
            onClick={handleExportSvg}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" />
            Export SVG
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-400"
          >
            <Printer className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Title Block & Projection Controls */}
        <aside className="w-80 shrink-0 border-r border-white/10 bg-[#0b0e14] p-4 overflow-y-auto space-y-4 text-xs">
          <div className="font-bold uppercase tracking-wider text-zinc-400">
            Drawing Sheet Configuration
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Part / Assembly Title</label>
            <input
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Drawing Number (DWG NO.)</label>
            <input
              value={config.partNumber}
              onChange={(e) => setConfig({ ...config, partNumber: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 font-mono text-sky-300"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Company / Organization</label>
            <input
              value={config.company}
              onChange={(e) => setConfig({ ...config, company: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Material Specification</label>
            <input
              value={config.material}
              onChange={(e) => setConfig({ ...config, material: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Sheet Size</label>
              <select
                value={config.sheetSize}
                onChange={(e) =>
                  setConfig({ ...config, sheetSize: e.target.value as SheetSize })
                }
                className="w-full rounded-lg border border-white/15 bg-slate-950 px-2.5 py-1.5 text-white"
              >
                <option value="A4">ISO A4</option>
                <option value="A3">ISO A3</option>
                <option value="A2">ISO A2</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Scale</label>
              <select
                value={config.scale}
                onChange={(e) => setConfig({ ...config, scale: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-950 px-2.5 py-1.5 text-white"
              >
                <option value="1:1">1:1</option>
                <option value="1:2">1:2</option>
                <option value="2:1">2:1</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Projection Standard</label>
            <select
              value={config.projection}
              onChange={(e) =>
                setConfig({
                  ...config,
                  projection: e.target.value as ProjectionStandard,
                })
              }
              className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-white"
            >
              <option value="first-angle">First-Angle Projection (ISO-E)</option>
              <option value="third-angle">Third-Angle Projection (ASME)</option>
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeHiddenLines}
                onChange={(e) =>
                  setConfig({ ...config, includeHiddenLines: e.target.checked })
                }
                className="accent-sky-400"
              />
              <span>Show Hidden Dashed Lines (HLR)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeDimensions}
                onChange={(e) =>
                  setConfig({ ...config, includeDimensions: e.target.checked })
                }
                className="accent-sky-400"
              />
              <span>Auto-Dimensioning (Ø, R, Linear)</span>
            </label>
          </div>
        </aside>

        {/* Center 2D Drawing Sheet Viewport */}
        <main className="flex-1 overflow-auto bg-[#12161f] p-6 sm:p-10 flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[420/297]">
            <DrawingSheetSvg sheet={drawingSheet} svgRef={svgRef} />
          </div>
        </main>
      </div>

      {/* Sheet Setup Modal */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0d1017] p-6 space-y-4">
            <h2 className="text-base font-bold text-white">
              Engineering Drawing Setup
            </h2>
            <p className="text-xs text-zinc-400">
              All 4 views (Front, Top, Right, Isometric) are dynamically computed from your B-Rep
              solid with analytic Hidden Line Removal.
            </p>
            <button
              type="button"
              onClick={() => setSetupModalOpen(false)}
              className="w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold uppercase text-slate-950"
            >
              Apply &amp; Regenerate Views
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
