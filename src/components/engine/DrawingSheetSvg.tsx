'use client';

import React from 'react';
import type { DrawingSheetData, ProjectedView } from '@/lib/drawing-engine';

interface DrawingSheetSvgProps {
  sheet: DrawingSheetData;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

export function DrawingSheetSvg({ sheet, svgRef }: DrawingSheetSvgProps) {
  const { widthMm, heightMm, views, config } = sheet;

  const layouts: { view: ProjectedView; cx: number; cy: number }[] = [
    { view: views[0], cx: widthMm * 0.27, cy: heightMm * 0.34 },
    { view: views[1], cx: widthMm * 0.27, cy: heightMm * 0.72 },
    { view: views[2], cx: widthMm * 0.68, cy: heightMm * 0.34 },
    { view: views[3], cx: widthMm * 0.68, cy: heightMm * 0.68 },
  ];

  const geomScale = Math.min(widthMm, heightMm) * 0.0038;

  return (
    <svg
      ref={svgRef}
      data-testid="engineering-drawing-svg"
      viewBox={`0 0 ${widthMm} ${heightMm}`}
      className="h-full w-full rounded bg-white shadow-2xl border border-slate-300"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="dim-arrow-end"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0.8 L5.5,3 L0,5.2 Z" fill="#0284c7" />
        </marker>
        <marker
          id="dim-arrow-start"
          markerWidth="6"
          markerHeight="6"
          refX="1"
          refY="3"
          orient="auto"
        >
          <path d="M5.5,0.8 L0,3 L5.5,5.2 Z" fill="#0284c7" />
        </marker>
      </defs>

      {/* Sheet Background */}
      <rect x={0} y={0} width={widthMm} height={heightMm} fill="#ffffff" />

      {/* Outer & Inner ISO/ASME Drawing Borders */}
      <rect
        x={8}
        y={8}
        width={widthMm - 16}
        height={heightMm - 16}
        fill="none"
        stroke="#0f172a"
        strokeWidth={0.9}
      />
      <rect
        x={12}
        y={12}
        width={widthMm - 24}
        height={heightMm - 24}
        fill="none"
        stroke="#334155"
        strokeWidth={0.4}
      />

      {/* Zone Reference Ticks */}
      {['A', 'B', 'C', 'D'].map((zone, idx) => {
        const y = 25 + idx * ((heightMm - 50) / 3);
        return (
          <g key={zone}>
            <text x={10} y={y} fontSize={3.2} fill="#475569" textAnchor="middle">
              {zone}
            </text>
            <text x={widthMm - 10} y={y} fontSize={3.2} fill="#475569" textAnchor="middle">
              {zone}
            </text>
          </g>
        );
      })}
      {[1, 2, 3, 4, 5, 6].map((col, idx) => {
        const x = 30 + idx * ((widthMm - 60) / 5);
        return (
          <g key={col}>
            <text x={x} y={10.8} fontSize={3.2} fill="#475569" textAnchor="middle">
              {col}
            </text>
            <text x={x} y={heightMm - 9} fontSize={3.2} fill="#475569" textAnchor="middle">
              {col}
            </text>
          </g>
        );
      })}

      {/* 4 Orthographic + Isometric Projected Views */}
      {layouts.map(({ view, cx, cy }) => (
        <g key={view.id} transform={`translate(${cx}, ${cy})`}>
          {/* Centerlines */}
          {view.centerLines.map((cl, i) => (
            <line
              key={`cl-${i}`}
              x1={cl.x1 * geomScale}
              y1={-cl.y1 * geomScale}
              x2={cl.x2 * geomScale}
              y2={-cl.y2 * geomScale}
              stroke="#64748b"
              strokeWidth={0.28}
              strokeDasharray="4,1.5,0.8,1.5"
            />
          ))}

          {/* Hidden Dashed Lines */}
          {config.includeHiddenLines &&
            view.hiddenLines.map((hl, i) => (
              <line
                key={`hl-${i}`}
                x1={hl.x1 * geomScale}
                y1={-hl.y1 * geomScale}
                x2={hl.x2 * geomScale}
                y2={-hl.y2 * geomScale}
                stroke="#64748b"
                strokeWidth={0.35}
                strokeDasharray="2.2,1.4"
              />
            ))}

          {/* Visible Solid Outlines */}
          {view.visibleLines.map((vl, i) => (
            <line
              key={`vl-${i}`}
              x1={vl.x1 * geomScale}
              y1={-vl.y1 * geomScale}
              x2={vl.x2 * geomScale}
              y2={-vl.y2 * geomScale}
              stroke="#0f172a"
              strokeWidth={0.65}
              strokeLinecap="round"
            />
          ))}

          {/* Auto Dimensions */}
          {config.includeDimensions &&
            view.dimensions.map((dim, i) => {
              const x1 = dim.x1 * geomScale;
              const y1 = -dim.y1 * geomScale;
              const x2 = dim.x2 * geomScale;
              const y2 = -dim.y2 * geomScale;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;

              return (
                <g key={`dim-${i}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#0284c7"
                    strokeWidth={0.35}
                    markerStart="url(#dim-arrow-start)"
                    markerEnd="url(#dim-arrow-end)"
                  />
                  <rect
                    x={mx - 14}
                    y={my - 3.2}
                    width={28}
                    height={5}
                    rx={0.8}
                    fill="#ffffff"
                    stroke="#bae6fd"
                    strokeWidth={0.2}
                  />
                  <text
                    x={mx}
                    y={my + 0.4}
                    fontSize={3.1}
                    fontWeight="bold"
                    fill="#0369a1"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {dim.label}
                  </text>
                </g>
              );
            })}

          {/* View Label */}
          <text
            x={0}
            y={46}
            fontSize={3.6}
            fontWeight="bold"
            fill="#1e293b"
            textAnchor="middle"
            letterSpacing="0.4"
          >
            {view.title} ({config.scale})
          </text>
        </g>
      ))}

      {/* Standard ISO / ASME Engineering Title Block (Bottom Right) */}
      <g transform={`translate(${widthMm - 152}, ${heightMm - 50})`}>
        <rect
          x={0}
          y={0}
          width={140}
          height={38}
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth={0.65}
        />
        <line x1={0} y1={11} x2={140} y2={11} stroke="#0f172a" strokeWidth={0.4} />
        <line x1={0} y1={24} x2={140} y2={24} stroke="#0f172a" strokeWidth={0.4} />
        <line x1={74} y1={11} x2={74} y2={38} stroke="#0f172a" strokeWidth={0.4} />
        <line x1={108} y1={24} x2={108} y2={38} stroke="#0f172a" strokeWidth={0.4} />

        {/* Company & Standard Header */}
        <text x={4} y={4.2} fontSize={2.3} fill="#64748b" fontWeight="bold">
          COMPANY / ORGANIZATION
        </text>
        <text x={4} y={8.8} fontSize={3.6} fill="#0f172a" fontWeight="bold">
          {config.company}
        </text>
        <text x={136} y={8.5} fontSize={2.8} fill="#0284c7" fontWeight="bold" textAnchor="end">
          {config.projection === 'first-angle' ? 'ISO-E (1ST ANGLE)' : 'ASME (3RD ANGLE)'}
        </text>

        {/* Title & Part Number */}
        <text x={4} y={15} fontSize={2.2} fill="#64748b" fontWeight="bold">
          PART / ASSEMBLY TITLE
        </text>
        <text x={4} y={21.2} fontSize={3.8} fill="#0f172a" fontWeight="bold">
          {config.title.slice(0, 28)}
        </text>

        <text x={78} y={15} fontSize={2.2} fill="#64748b" fontWeight="bold">
          DWG NO.
        </text>
        <text x={78} y={21.2} fontSize={3.4} fill="#0f172a" fontFamily="monospace" fontWeight="bold">
          {config.partNumber}
        </text>

        {/* Bottom Metadata Row */}
        <text x={4} y={28.2} fontSize={2.1} fill="#64748b">
          MATERIAL: {config.material}
        </text>
        <text x={4} y={34.5} fontSize={2.1} fill="#64748b">
          DRAWN BY: {config.drawnBy} ({sheet.generatedAt})
        </text>

        <text x={78} y={28.2} fontSize={2.1} fill="#64748b">
          SCALE
        </text>
        <text x={78} y={34.5} fontSize={3.2} fill="#0f172a" fontWeight="bold">
          {config.scale}
        </text>

        <text x={112} y={28.2} fontSize={2.1} fill="#64748b">
          SHEET / REV
        </text>
        <text x={112} y={34.5} fontSize={3.1} fill="#0f172a" fontWeight="bold">
          {config.sheetSize} · REV {config.revision}
        </text>
      </g>
    </svg>
  );
}
