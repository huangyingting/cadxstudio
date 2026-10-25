'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { CompiledCadModel, PartMesh } from '@/lib/cad-kernel';

export interface CadAnnotationPin {
  id: string;
  label: string;
  author: string;
  position: [number, number, number];
  createdAt: string;
}

export interface StudioMaterialConfig {
  preset: 'steel' | 'aluminum' | 'bronze' | 'carbon' | 'titanium' | 'plastic';
  roughness: number;
  metalness: number;
  envPreset: 'studio' | 'warehouse' | 'sunset' | 'cleanWhite';
  exposure: number;
  ambientIntensity: number;
  directionalIntensity: number;
  groundShadow: boolean;
}

interface CadViewport3DProps {
  model: CompiledCadModel;
  projectionMode?: 'perspective' | 'orthographic';
  showEdges?: boolean;
  wireframe?: boolean;
  sectionEnabled?: boolean;
  sectionAxis?: 'X' | 'Y' | 'Z';
  sectionOffset?: number;
  explodeFactor?: number;
  measureMode?: boolean;
  annotateMode?: boolean;
  annotations?: CadAnnotationPin[];
  onAddAnnotation?: (pos: [number, number, number]) => void;
  selectedPartId?: string | null;
  onSelectPart?: (partId: string | null) => void;
  partColors?: Record<string, string>;
  partVisibility?: Record<string, boolean>;
  studioMode?: boolean;
  studioConfig?: StudioMaterialConfig;
  lightTheme?: boolean;
  canvasRefExternal?: React.RefObject<HTMLCanvasElement | null>;
}

const STUDIO_PALETTES: Record<
  StudioMaterialConfig['preset'],
  { baseColor: string; specular: string }
> = {
  steel: { baseColor: '#94a3b8', specular: '#f8fafc' },
  aluminum: { baseColor: '#cbd5e1', specular: '#ffffff' },
  bronze: { baseColor: '#d97706', specular: '#fef08a' },
  carbon: { baseColor: '#334155', specular: '#94a3b8' },
  titanium: { baseColor: '#64748b', specular: '#e2e8f0' },
  plastic: { baseColor: '#0284c7', specular: '#bae6fd' },
};

export function CadViewport3D({
  model,
  projectionMode = 'perspective',
  showEdges = true,
  wireframe = false,
  sectionEnabled = false,
  sectionAxis = 'Z',
  sectionOffset = 0,
  explodeFactor = 0,
  measureMode = false,
  annotateMode = false,
  annotations = [],
  onAddAnnotation,
  selectedPartId = null,
  onSelectPart,
  partColors = {},
  partVisibility = {},
  studioMode = false,
  studioConfig,
  lightTheme = false,
  canvasRefExternal,
}: CadViewport3DProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = canvasRefExternal || internalCanvasRef;

  const [rotation, setRotation] = useState<{ yaw: number; pitch: number }>({
    yaw: -0.68,
    pitch: 0.52,
  });
  const [zoom, setZoom] = useState<number>(1.05);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<'orbit' | 'pan' | null>(null);
  const [lastMouse, setLastMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [measurePoints, setMeasurePoints] = useState<[number, number, number][]>([]);

  const projectPoint = (
    pt: [number, number, number],
    width: number,
    height: number
  ): { x: number; y: number; z: number } => {
    const [x, y, z] = pt;
    const cosY = Math.cos(rotation.yaw);
    const sinY = Math.sin(rotation.yaw);
    const cosP = Math.cos(rotation.pitch);
    const sinP = Math.sin(rotation.pitch);

    // Rotate around Z (turntable yaw) then X (pitch)
    const rx = x * cosY - y * sinY;
    const ry = x * sinY + y * cosY;
    const rz = z;

    const cy = ry * cosP - rz * sinP;
    const cz = ry * sinP + rz * cosP;

    const maxSpan = Math.max(
      model.boundingBox.size[0],
      model.boundingBox.size[1],
      model.boundingBox.size[2],
      40
    );
    const baseScale = (Math.min(width, height) * 0.48 * zoom) / maxSpan;

    const perspFactor =
      projectionMode === 'perspective' ? 1 / Math.max(0.45, 1 - cy / (maxSpan * 3.5)) : 1;

    return {
      x: width / 2 + pan.x + rx * baseScale * perspFactor,
      y: height / 2 + pan.y - cz * baseScale * perspFactor,
      z: cy,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, rect.width || 800);
    const height = Math.max(240, rect.height || 520);

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Background fill
    if (studioMode) {
      const grad = ctx.createRadialGradient(
        width / 2,
        height * 0.42,
        40,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      if (studioConfig?.envPreset === 'cleanWhite') {
        grad.addColorStop(0, '#f8fafc');
        grad.addColorStop(1, '#cbd5e1');
      } else if (studioConfig?.envPreset === 'sunset') {
        grad.addColorStop(0, '#2e1065');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#090a0f');
      } else {
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#06080d');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (lightTheme) {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, width, height);
    } else {
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      grad.addColorStop(0, '#131822');
      grad.addColorStop(1, '#080a0f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Reference Ground Grid (when not in cleanWhite studio)
    if (!studioMode || studioConfig?.groundShadow) {
      const gridStep = 20;
      const gridRange = 100;
      ctx.lineWidth = 1;
      for (let g = -gridRange; g <= gridRange; g += gridStep) {
        const p1 = projectPoint([g, -gridRange, 0], width, height);
        const p2 = projectPoint([g, gridRange, 0], width, height);
        ctx.strokeStyle =
          g === 0
            ? 'rgba(34, 197, 94, 0.35)'
            : lightTheme
              ? 'rgba(15, 23, 42, 0.08)'
              : 'rgba(148, 163, 184, 0.09)';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const q1 = projectPoint([-gridRange, g, 0], width, height);
        const q2 = projectPoint([gridRange, g, 0], width, height);
        ctx.strokeStyle =
          g === 0
            ? 'rgba(239, 68, 68, 0.35)'
            : lightTheme
              ? 'rgba(15, 23, 42, 0.08)'
              : 'rgba(148, 163, 184, 0.09)';
        ctx.beginPath();
        ctx.moveTo(q1.x, q1.y);
        ctx.lineTo(q2.x, q2.y);
        ctx.stroke();
      }
    }

    // 3. Collect & depth-sort triangles across visible parts
    interface DrawTriangle {
      partId: string;
      p0: { x: number; y: number; z: number };
      p1: { x: number; y: number; z: number };
      p2: { x: number; y: number; z: number };
      depth: number;
      normal: [number, number, number];
      color: string;
      isSectionCut: boolean;
    }

    const triangles: DrawTriangle[] = [];
    const axisIdx = sectionAxis === 'X' ? 0 : sectionAxis === 'Y' ? 1 : 2;

    model.parts.forEach((part: PartMesh, partIdx: number) => {
      if (partVisibility[part.id] === false) return;
      const explodeOffset: [number, number, number] = [
        part.explodeVector[0] * explodeFactor * 1.4,
        part.explodeVector[1] * explodeFactor * 1.4,
        part.explodeVector[2] * explodeFactor * 1.4,
      ];

      const effectiveColor =
        studioMode && studioConfig
          ? STUDIO_PALETTES[studioConfig.preset].baseColor
          : partColors[part.id] || part.color || (partIdx === 0 ? '#38bdf8' : '#f59e0b');

      for (let i = 0; i < part.indices.length; i += 3) {
        const ia = part.indices[i] * 3;
        const ib = part.indices[i + 1] * 3;
        const ic = part.indices[i + 2] * 3;

        const va: [number, number, number] = [
          part.positions[ia] + explodeOffset[0],
          part.positions[ia + 1] + explodeOffset[1],
          part.positions[ia + 2] + explodeOffset[2],
        ];
        const vb: [number, number, number] = [
          part.positions[ib] + explodeOffset[0],
          part.positions[ib + 1] + explodeOffset[1],
          part.positions[ib + 2] + explodeOffset[2],
        ];
        const vc: [number, number, number] = [
          part.positions[ic] + explodeOffset[0],
          part.positions[ic + 1] + explodeOffset[1],
          part.positions[ic + 2] + explodeOffset[2],
        ];

        const centroidAxis = (va[axisIdx] + vb[axisIdx] + vc[axisIdx]) / 3;
        if (sectionEnabled && centroidAxis > sectionOffset) {
          continue;
        }

        const isNearSection =
          sectionEnabled && Math.abs(centroidAxis - sectionOffset) < 4.5;

        const n: [number, number, number] = [
          (part.normals[ia] + part.normals[ib] + part.normals[ic]) / 3,
          (part.normals[ia + 1] + part.normals[ib + 1] + part.normals[ic + 1]) / 3,
          (part.normals[ia + 2] + part.normals[ib + 2] + part.normals[ic + 2]) / 3,
        ];

        const p0 = projectPoint(va, width, height);
        const p1 = projectPoint(vb, width, height);
        const p2 = projectPoint(vc, width, height);

        triangles.push({
          partId: part.id,
          p0,
          p1,
          p2,
          depth: (p0.z + p1.z + p2.z) / 3,
          normal: n,
          color: effectiveColor,
          isSectionCut: isNearSection,
        });
      }
    });

    triangles.sort((a, b) => b.depth - a.depth);

    // 4. Render shaded triangles
    const lightDir: [number, number, number] = [-0.45, -0.6, 0.66];
    for (const tri of triangles) {
      ctx.beginPath();
      ctx.moveTo(tri.p0.x, tri.p0.y);
      ctx.lineTo(tri.p1.x, tri.p1.y);
      ctx.lineTo(tri.p2.x, tri.p2.y);
      ctx.closePath();

      if (!wireframe) {
        const dot = Math.max(
          0.18,
          Math.min(
            1,
            Math.abs(
              tri.normal[0] * lightDir[0] +
                tri.normal[1] * lightDir[1] +
                tri.normal[2] * lightDir[2]
            ) *
              0.78 +
              0.25
          )
        );

        const baseHex = tri.isSectionCut
          ? '#ef4444'
          : selectedPartId && selectedPartId === tri.partId
            ? '#22d3ee'
            : tri.color;

        const r = parseInt(baseHex.slice(1, 3), 16) || 56;
        const g = parseInt(baseHex.slice(3, 5), 16) || 189;
        const b = parseInt(baseHex.slice(5, 7), 16) || 248;

        const exposureBoost = studioMode ? (studioConfig?.exposure ?? 1.1) : 1.0;
        const sr = Math.min(255, Math.round(r * dot * exposureBoost));
        const sg = Math.min(255, Math.round(g * dot * exposureBoost));
        const sb = Math.min(255, Math.round(b * dot * exposureBoost));

        ctx.fillStyle = `rgb(${sr}, ${sg}, ${sb})`;
        ctx.fill();
      }

      if (wireframe || showEdges) {
        ctx.strokeStyle = wireframe
          ? '#38bdf8'
          : studioMode
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(15, 23, 42, 0.32)';
        ctx.lineWidth = wireframe ? 0.9 : 0.45;
        ctx.stroke();
      }
    }

    // 5. Render topological B-Rep feature edges
    if (showEdges && !studioMode) {
      model.parts.forEach((part: PartMesh) => {
        if (partVisibility[part.id] === false) return;
        const explodeOffset: [number, number, number] = [
          part.explodeVector[0] * explodeFactor * 1.4,
          part.explodeVector[1] * explodeFactor * 1.4,
          part.explodeVector[2] * explodeFactor * 1.4,
        ];
        ctx.strokeStyle =
          selectedPartId === part.id ? '#fde047' : 'rgba(226, 232, 240, 0.65)';
        ctx.lineWidth = selectedPartId === part.id ? 1.5 : 0.9;

        for (let i = 0; i < part.edgePositions.length; i += 6) {
          const a: [number, number, number] = [
            part.edgePositions[i] + explodeOffset[0],
            part.edgePositions[i + 1] + explodeOffset[1],
            part.edgePositions[i + 2] + explodeOffset[2],
          ];
          const b: [number, number, number] = [
            part.edgePositions[i + 3] + explodeOffset[0],
            part.edgePositions[i + 4] + explodeOffset[1],
            part.edgePositions[i + 5] + explodeOffset[2],
          ];
          if (
            sectionEnabled &&
            (a[axisIdx] > sectionOffset || b[axisIdx] > sectionOffset)
          ) {
            continue;
          }
          const pa = projectPoint(a, width, height);
          const pb = projectPoint(b, width, height);
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      });
    }

    // 6. Section Plane indicator
    if (sectionEnabled) {
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.4;
      const s = 65;
      const planePts: [number, number, number][] =
        sectionAxis === 'Z'
          ? [
              [-s, -s, sectionOffset],
              [s, -s, sectionOffset],
              [s, s, sectionOffset],
              [-s, s, sectionOffset],
            ]
          : sectionAxis === 'X'
            ? [
                [sectionOffset, -s, -20],
                [sectionOffset, s, -20],
                [sectionOffset, s, s],
                [sectionOffset, -s, s],
              ]
            : [
                [-s, sectionOffset, -20],
                [s, sectionOffset, -20],
                [s, sectionOffset, s],
                [-s, sectionOffset, s],
              ];
      const pp = planePts.map((pt) => projectPoint(pt, width, height));
      ctx.beginPath();
      ctx.moveTo(pp[0].x, pp[0].y);
      pp.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 7. Measure tool overlay
    if (measureMode && measurePoints.length > 0) {
      ctx.save();
      const projected = measurePoints.map((pt) => projectPoint(pt, width, height));
      projected.forEach((p) => {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      if (measurePoints.length === 2) {
        const [a, b] = measurePoints;
        const dist = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]).toFixed(2);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        ctx.lineTo(projected[1].x, projected[1].y);
        ctx.stroke();

        const mx = (projected[0].x + projected[1].x) / 2;
        const my = (projected[0].y + projected[1].y) / 2;
        ctx.fillStyle = 'rgba(6, 78, 59, 0.92)';
        ctx.fillRect(mx - 42, my - 14, 84, 24);
        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${dist} mm`, mx, my + 2);
      }
      ctx.restore();
    }

    // 8. Orientation Gizmo in top-right corner
    const gizmoX = width - 54;
    const gizmoY = 54;
    const axes: { label: string; vec: [number, number, number]; color: string }[] = [
      { label: 'X', vec: [24, 0, 0], color: '#ef4444' },
      { label: 'Y', vec: [0, 24, 0], color: '#22c55e' },
      { label: 'Z', vec: [0, 0, 24], color: '#38bdf8' },
    ];
    const centerProj = projectPoint([0, 0, 0], width, height);
    axes.forEach((ax) => {
      const tip = projectPoint(ax.vec, width, height);
      const dx = tip.x - centerProj.x;
      const dy = tip.y - centerProj.y;
      const len = Math.hypot(dx, dy) || 1;
      const gx = gizmoX + (dx / len) * 26;
      const gy = gizmoY + (dy / len) * 26;

      ctx.strokeStyle = ax.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gizmoX, gizmoY);
      ctx.lineTo(gx, gy);
      ctx.stroke();

      ctx.fillStyle = ax.color;
      ctx.beginPath();
      ctx.arc(gx, gy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#090a0f';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ax.label, gx, gy + 3);
    });

    ctx.restore();
  }, [
    model,
    rotation,
    zoom,
    pan,
    projectionMode,
    showEdges,
    wireframe,
    sectionEnabled,
    sectionAxis,
    sectionOffset,
    explodeFactor,
    measureMode,
    measurePoints,
    selectedPartId,
    partColors,
    partVisibility,
    studioMode,
    studioConfig,
    lightTheme,
    canvasRef,
  ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = rect.height / 2 - (e.clientY - rect.top);
    const worldPt: [number, number, number] = [
      Number((relX * 0.25).toFixed(1)),
      Number((relY * 0.2).toFixed(1)),
      Number((model.boundingBox.size[2] * 0.5).toFixed(1)),
    ];

    if (measureMode) {
      setMeasurePoints((prev) => (prev.length >= 2 ? [worldPt] : [...prev, worldPt]));
      return;
    }

    if (annotateMode && onAddAnnotation) {
      onAddAnnotation(worldPt);
      return;
    }

    if (onSelectPart && model.parts.length > 0) {
      const nextPart =
        selectedPartId === model.parts[0].id && model.parts[1]
          ? model.parts[1].id
          : model.parts[0].id;
      onSelectPart(nextPart);
    }
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        data-testid="cad-viewport-canvas"
        onClick={handleCanvasClick}
        onMouseDown={(e) => {
          setDragging(e.button === 2 || e.shiftKey ? 'pan' : 'orbit');
          setLastMouse({ x: e.clientX, y: e.clientY });
        }}
        onMouseMove={(e) => {
          if (!dragging) return;
          const dx = e.clientX - lastMouse.x;
          const dy = e.clientY - lastMouse.y;
          setLastMouse({ x: e.clientX, y: e.clientY });
          if (dragging === 'orbit') {
            setRotation((prev) => ({
              yaw: prev.yaw + dx * 0.0085,
              pitch: Math.max(-1.45, Math.min(1.45, prev.pitch + dy * 0.0085)),
            }));
          } else {
            setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
          }
        }}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
        onWheel={(e) => {
          e.preventDefault();
          const factor = e.deltaY < 0 ? 1.08 : 0.92;
          setZoom((z) => Math.max(0.35, Math.min(3.5, z * factor)));
        }}
        onContextMenu={(e) => e.preventDefault()}
        className="h-full w-full cursor-grab active:cursor-grabbing block"
      />

      {/* Annotation Pins Overlay */}
      {annotations.map((pin, idx) => (
        <div
          key={pin.id}
          style={{
            left: `${42 + ((idx * 13) % 24)}%`,
            top: `${32 + ((idx * 17) % 28)}%`,
          }}
          className="pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/60 bg-slate-950/90 px-2.5 py-1 text-[11px] font-medium text-amber-300 shadow-lg"
        >
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-400" />
          {pin.label}
        </div>
      ))}

      {/* Quick Camera Preset Pill in bottom-right */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950/80 px-2 py-1 text-[10px] text-zinc-400 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            setRotation({ yaw: -0.68, pitch: 0.52 });
            setZoom(1.05);
            setPan({ x: 0, y: 0 });
          }}
          className="px-1.5 py-0.5 hover:text-sky-400 transition"
        >
          ISO
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={() => setRotation({ yaw: 0, pitch: 0 })}
          className="px-1.5 py-0.5 hover:text-sky-400 transition"
        >
          FRONT
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={() => setRotation({ yaw: 0, pitch: 1.55 })}
          className="px-1.5 py-0.5 hover:text-sky-400 transition"
        >
          TOP
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={() => setRotation({ yaw: -1.57, pitch: 0 })}
          className="px-1.5 py-0.5 hover:text-sky-400 transition"
        >
          RIGHT
        </button>
      </div>
    </div>
  );
}
