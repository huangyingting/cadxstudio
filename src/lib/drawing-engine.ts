import type { CadBuildResult } from './cad-kernel';

export interface DrawingSetupConfig {
  sheetSize: 'A4' | 'A3' | 'A2' | 'A1';
  orientation: 'landscape' | 'portrait';
  projectionStandard: 'first-angle' | 'third-angle';
  views: {
    front: boolean;
    top: boolean;
    right: boolean;
    isometric: boolean;
  };
  targetPartId: 'assembly' | string;
  showHiddenLines: boolean;
  titleBlock: {
    title: string;
    drawingNumber: string;
    revision: string;
    material: string;
    finish: string;
    scale: string;
    drawnBy: string;
    company: string;
    units: string;
  };
  notes: string[];
}

export interface DrawingDimensionItem {
  id: string;
  viewKey: 'front' | 'top' | 'right';
  kind: 'linear-h' | 'linear-v' | 'diameter' | 'radius';
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  offsetX: number;
  offsetY: number;
}

export interface DrawingViewProjection {
  key: 'front' | 'top' | 'right' | 'isometric';
  label: string;
  boxX: number;
  boxY: number;
  boxW: number;
  boxH: number;
  visibleLines: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>;
  hiddenLines: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>;
  circles: Array<{ id: string; cx: number; cy: number; r: number; isHole: boolean; realRadiusMm: number }>;
}

export interface GeneratedDrawingSheet {
  widthMm: number;
  heightMm: number;
  views: DrawingViewProjection[];
  dimensions: DrawingDimensionItem[];
}

export const DEFAULT_DRAWING_CONFIG: DrawingSetupConfig = {
  sheetSize: 'A3',
  orientation: 'landscape',
  projectionStandard: 'third-angle',
  views: {
    front: true,
    top: true,
    right: true,
    isometric: true,
  },
  targetPartId: 'assembly',
  showHiddenLines: true,
  titleBlock: {
    title: 'Precision Flanged Bearing Housing',
    drawingNumber: 'CADX-DWG-001',
    revision: 'REV A',
    material: '6061-T6 Aluminum / C93200 Bronze',
    finish: 'Anodized Type II / Machined Ra 1.6',
    scale: '1:1',
    drawnBy: 'CADx Drawing Engine',
    company: 'CADxStudio Engineering',
    units: 'MILLIMETERS',
  },
  notes: [
    '1. INTERPRET DIMENSIONS AND TOLERANCES PER ISO 2768-mK / ASME Y14.5.',
    '2. REMOVE ALL BURRS AND BREAK SHARP EDGES 0.3 MM MAX.',
    '3. SURFACE FINISH Ra 1.6 MICROMETERS UNLESS OTHERWISE SPECIFIED.',
    '4. ALL DIMENSIONS ARE IN MILLIMETERS.',
  ],
};

export function generateEngineeringDrawing(
  buildResult: CadBuildResult,
  config: DrawingSetupConfig
): GeneratedDrawingSheet {
  const sheetDims: Record<DrawingSetupConfig['sheetSize'], [number, number]> = {
    A4: [297, 210],
    A3: [420, 297],
    A2: [594, 420],
    A1: [841, 594],
  };
  const [widthMm, heightMm] = sheetDims[config.sheetSize] || [420, 297];

  const bw = buildResult.paramValues.baseWidth ?? buildResult.paramValues.enclosureLength ?? Math.round(buildResult.boundingBox.size[0]) ?? 80;
  const bd = buildResult.paramValues.baseDepth ?? buildResult.paramValues.enclosureWidth ?? Math.round(buildResult.boundingBox.size[2]) ?? 60;
  const bt = buildResult.paramValues.baseThickness ?? 10;
  const br = buildResult.paramValues.bossRadius ?? buildResult.paramValues.hubRadius ?? 18;
  const bh = buildResult.paramValues.bossHeight ?? buildResult.paramValues.hubHeight ?? 24;
  const holeR = buildResult.paramValues.boreRadius ?? buildResult.paramValues.shaftBoreRadius ?? 10;
  const totalH = bt + bh;

  const views: DrawingViewProjection[] = [];
  const dimensions: DrawingDimensionItem[] = [];

  // Front View (bottom-left in Third-Angle, top-left in First-Angle)
  const frontCx = 125;
  const frontCy = config.projectionStandard === 'third-angle' ? 205 : 95;
  const scale = 1.15;
  const fw = bw * scale;
  const fh = totalH * scale;
  const fbt = bt * scale;
  const fbr = br * scale;
  const fhr = holeR * scale;

  if (config.views.front) {
    const yBottom = frontCy + fh / 2;
    const yFlangeTop = yBottom - fbt;
    const yBossTop = frontCy - fh / 2;
    views.push({
      key: 'front',
      label: 'FRONT VIEW',
      boxX: frontCx - fw / 2 - 20,
      boxY: yBossTop - 20,
      boxW: fw + 40,
      boxH: fh + 45,
      visibleLines: [
        { id: 'f-bot', x1: frontCx - fw / 2, y1: yBottom, x2: frontCx + fw / 2, y2: yBottom },
        { id: 'f-left', x1: frontCx - fw / 2, y1: yBottom, x2: frontCx - fw / 2, y2: yFlangeTop },
        { id: 'f-right', x1: frontCx + fw / 2, y1: yBottom, x2: frontCx + fw / 2, y2: yFlangeTop },
        { id: 'f-flange-top', x1: frontCx - fw / 2, y1: yFlangeTop, x2: frontCx + fw / 2, y2: yFlangeTop },
        { id: 'f-boss-l', x1: frontCx - fbr, y1: yFlangeTop, x2: frontCx - fbr, y2: yBossTop },
        { id: 'f-boss-r', x1: frontCx + fbr, y1: yFlangeTop, x2: frontCx + fbr, y2: yBossTop },
        { id: 'f-boss-top', x1: frontCx - fbr, y1: yBossTop, x2: frontCx + fbr, y2: yBossTop },
      ],
      hiddenLines: [
        { id: 'f-bore-l', x1: frontCx - fhr, y1: yBottom, x2: frontCx - fhr, y2: yBossTop },
        { id: 'f-bore-r', x1: frontCx + fhr, y1: yBottom, x2: frontCx + fhr, y2: yBossTop },
      ],
      circles: [],
    });

    dimensions.push(
      {
        id: 'dim-width',
        viewKey: 'front',
        kind: 'linear-h',
        label: `${bw.toFixed(1)}`,
        x1: frontCx - fw / 2,
        y1: yBottom,
        x2: frontCx + fw / 2,
        y2: yBottom,
        offsetX: 0,
        offsetY: 16,
      },
      {
        id: 'dim-total-height',
        viewKey: 'front',
        kind: 'linear-v',
        label: `${totalH.toFixed(1)}`,
        x1: frontCx - fw / 2,
        y1: yBossTop,
        x2: frontCx - fw / 2,
        y2: yBottom,
        offsetX: -16,
        offsetY: 0,
      },
      {
        id: 'dim-flange-thickness',
        viewKey: 'front',
        kind: 'linear-v',
        label: `${bt.toFixed(1)}`,
        x1: frontCx + fw / 2,
        y1: yFlangeTop,
        x2: frontCx + fw / 2,
        y2: yBottom,
        offsetX: 14,
        offsetY: 0,
      }
    );
  }

  // Top View
  const topCx = 125;
  const topCy = config.projectionStandard === 'third-angle' ? 92 : 205;
  const td = bd * scale;
  if (config.views.top) {
    views.push({
      key: 'top',
      label: 'TOP VIEW',
      boxX: topCx - fw / 2 - 20,
      boxY: topCy - td / 2 - 20,
      boxW: fw + 40,
      boxH: td + 45,
      visibleLines: [
        { id: 't-top', x1: topCx - fw / 2, y1: topCy - td / 2, x2: topCx + fw / 2, y2: topCy - td / 2 },
        { id: 't-bot', x1: topCx - fw / 2, y1: topCy + td / 2, x2: topCx + fw / 2, y2: topCy + td / 2 },
        { id: 't-left', x1: topCx - fw / 2, y1: topCy - td / 2, x2: topCx - fw / 2, y2: topCy + td / 2 },
        { id: 't-right', x1: topCx + fw / 2, y1: topCy - td / 2, x2: topCx + fw / 2, y2: topCy + td / 2 },
      ],
      hiddenLines: [],
      circles: [
        { id: 't-boss-circle', cx: topCx, cy: topCy, r: fbr, isHole: false, realRadiusMm: br },
        { id: 't-bore-circle', cx: topCx, cy: topCy, r: fhr, isHole: true, realRadiusMm: holeR },
        { id: 't-bushing-circle', cx: topCx, cy: topCy, r: fhr * 0.78, isHole: true, realRadiusMm: Number((holeR * 0.78).toFixed(1)) },
      ],
    });

    dimensions.push(
      {
        id: 'dim-depth',
        viewKey: 'top',
        kind: 'linear-v',
        label: `${bd.toFixed(1)}`,
        x1: topCx - fw / 2,
        y1: topCy - td / 2,
        x2: topCx - fw / 2,
        y2: topCy + td / 2,
        offsetX: -16,
        offsetY: 0,
      },
      {
        id: 'dim-boss-dia',
        viewKey: 'top',
        kind: 'diameter',
        label: `Ø${(br * 2).toFixed(1)}`,
        x1: topCx + fbr * 0.7,
        y1: topCy - fbr * 0.7,
        x2: topCx + fw / 2 + 16,
        y2: topCy - td / 2 - 8,
        offsetX: 0,
        offsetY: 0,
      },
      {
        id: 'dim-bore-dia',
        viewKey: 'top',
        kind: 'diameter',
        label: `Ø${(holeR * 2).toFixed(1)} THRU`,
        x1: topCx + fhr * 0.7,
        y1: topCy + fhr * 0.7,
        x2: topCx + fw / 2 + 16,
        y2: topCy + td / 2 + 8,
        offsetX: 0,
        offsetY: 0,
      }
    );
  }

  // Right Side View
  const rightCx = 275;
  const rightCy = frontCy;
  if (config.views.right) {
    const yBottom = rightCy + fh / 2;
    const yFlangeTop = yBottom - fbt;
    const yBossTop = rightCy - fh / 2;
    views.push({
      key: 'right',
      label: 'RIGHT VIEW',
      boxX: rightCx - td / 2 - 20,
      boxY: yBossTop - 20,
      boxW: td + 40,
      boxH: fh + 45,
      visibleLines: [
        { id: 'r-bot', x1: rightCx - td / 2, y1: yBottom, x2: rightCx + td / 2, y2: yBottom },
        { id: 'r-left', x1: rightCx - td / 2, y1: yBottom, x2: rightCx - td / 2, y2: yFlangeTop },
        { id: 'r-right', x1: rightCx + td / 2, y1: yBottom, x2: rightCx + td / 2, y2: yFlangeTop },
        { id: 'r-flange-top', x1: rightCx - td / 2, y1: yFlangeTop, x2: rightCx + td / 2, y2: yFlangeTop },
        { id: 'r-boss-l', x1: rightCx - fbr, y1: yFlangeTop, x2: rightCx - fbr, y2: yBossTop },
        { id: 'r-boss-r', x1: rightCx + fbr, y1: yFlangeTop, x2: rightCx + fbr, y2: yBossTop },
        { id: 'r-boss-top', x1: rightCx - fbr, y1: yBossTop, x2: rightCx + fbr, y2: yBossTop },
      ],
      hiddenLines: [
        { id: 'r-bore-l', x1: rightCx - fhr, y1: yBottom, x2: rightCx - fhr, y2: yBossTop },
        { id: 'r-bore-r', x1: rightCx + fhr, y1: yBottom, x2: rightCx + fhr, y2: yBossTop },
      ],
      circles: [],
    });
  }

  // Isometric View
  const isoCx = 275;
  const isoCy = config.projectionStandard === 'third-angle' ? 92 : 205;
  if (config.views.isometric) {
    const ix = 36;
    const iy = 21;
    const ih = 14;
    views.push({
      key: 'isometric',
      label: 'ISOMETRIC VIEW (SCALE 1:1)',
      boxX: isoCx - 55,
      boxY: isoCy - 45,
      boxW: 110,
      boxH: 95,
      visibleLines: [
        // Top diamond of flange
        { id: 'iso-1', x1: isoCx, y1: isoCy - iy, x2: isoCx + ix, y2: isoCy },
        { id: 'iso-2', x1: isoCx + ix, y1: isoCy, x2: isoCx, y2: isoCy + iy },
        { id: 'iso-3', x1: isoCx, y1: isoCy + iy, x2: isoCx - ix, y2: isoCy },
        { id: 'iso-4', x1: isoCx - ix, y1: isoCy, x2: isoCx, y2: isoCy - iy },
        // Bottom visible edges of flange
        { id: 'iso-5', x1: isoCx - ix, y1: isoCy, x2: isoCx - ix, y2: isoCy + ih },
        { id: 'iso-6', x1: isoCx, y1: isoCy + iy, x2: isoCx, y2: isoCy + iy + ih },
        { id: 'iso-7', x1: isoCx + ix, y1: isoCy, x2: isoCx + ix, y2: isoCy + ih },
        { id: 'iso-8', x1: isoCx - ix, y1: isoCy + ih, x2: isoCx, y2: isoCy + iy + ih },
        { id: 'iso-9', x1: isoCx, y1: isoCy + iy + ih, x2: isoCx + ix, y2: isoCy + ih },
        // Boss cylinder vertical walls
        { id: 'iso-b1', x1: isoCx - 16, y1: isoCy, x2: isoCx - 16, y2: isoCy - 20 },
        { id: 'iso-b2', x1: isoCx + 16, y1: isoCy, x2: isoCx + 16, y2: isoCy - 20 },
      ],
      hiddenLines: [],
      circles: [
        { id: 'iso-top-boss', cx: isoCx, cy: isoCy - 20, r: 16, isHole: false, realRadiusMm: br },
        { id: 'iso-top-bore', cx: isoCx, cy: isoCy - 20, r: 9, isHole: true, realRadiusMm: holeR },
      ],
    });
  }

  return {
    widthMm,
    heightMm,
    views,
    dimensions,
  };
}

export function exportDrawingToDXF(
  sheet: GeneratedDrawingSheet,
  config: DrawingSetupConfig
): string {
  const lines: string[] = [
    '0',
    'SECTION',
    '2',
    'HEADER',
    '9',
    '$INSUNITS',
    '70',
    '4',
    '0',
    'ENDSEC',
    '0',
    'SECTION',
    '2',
    'ENTITIES',
  ];

  for (const view of sheet.views) {
    const allSegs = config.showHiddenLines
      ? [...view.visibleLines, ...view.hiddenLines]
      : view.visibleLines;
    for (const seg of allSegs) {
      lines.push(
        '0',
        'LINE',
        '8',
        view.key.toUpperCase(),
        '10',
        seg.x1.toFixed(3),
        '20',
        (sheet.heightMm - seg.y1).toFixed(3),
        '30',
        '0.0',
        '11',
        seg.x2.toFixed(3),
        '21',
        (sheet.heightMm - seg.y2).toFixed(3),
        '31',
        '0.0'
      );
    }
    for (const c of view.circles) {
      lines.push(
        '0',
        'CIRCLE',
        '8',
        view.key.toUpperCase(),
        '10',
        c.cx.toFixed(3),
        '20',
        (sheet.heightMm - c.cy).toFixed(3),
        '30',
        '0.0',
        '40',
        c.r.toFixed(3)
      );
    }
  }

  for (const dim of sheet.dimensions) {
    lines.push(
      '0',
      'TEXT',
      '8',
      'DIMENSIONS',
      '10',
      ((dim.x1 + dim.x2) / 2 + dim.offsetX).toFixed(3),
      '20',
      (sheet.heightMm - ((dim.y1 + dim.y2) / 2 + dim.offsetY)).toFixed(3),
      '30',
      '0.0',
      '40',
      '3.5',
      '1',
      dim.label
    );
  }

  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\n');
}

export type SheetSize = 'A4' | 'A3' | 'A2';
export type ProjectionStandard = 'first-angle' | 'third-angle';

export interface DrawingConfig {
  title: string;
  partNumber: string;
  company: string;
  drawnBy: string;
  material: string;
  finish: string;
  weightKg: string;
  scale: string;
  sheetSize: SheetSize;
  projection: ProjectionStandard;
  revision: string;
  includeHiddenLines: boolean;
  includeDimensions: boolean;
}

export interface ProjectedView {
  id: 'front' | 'top' | 'right' | 'isometric';
  title: string;
  visibleLines: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  hiddenLines: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  centerLines: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  dimensions: Array<{ x1: number; y1: number; x2: number; y2: number; label: string }>;
}

export interface DrawingSheetData {
  widthMm: number;
  heightMm: number;
  config: DrawingConfig;
  views: [ProjectedView, ProjectedView, ProjectedView, ProjectedView];
  generatedAt: string;
}

export function createDrawingSheetData(
  model: {
    boundingBox: { size: [number, number, number] };
    paramValues?: Record<string, number>;
  },
  config: DrawingConfig
): DrawingSheetData {
  const sheetMap: Record<SheetSize, [number, number]> = {
    A4: [297, 210],
    A3: [420, 297],
    A2: [594, 420],
  };
  const [widthMm, heightMm] = sheetMap[config.sheetSize] || [420, 297];
  const w = model.paramValues?.baseWidth ?? model.boundingBox.size[0] ?? 80;
  const d = model.paramValues?.baseDepth ?? model.boundingBox.size[2] ?? 60;
  const h = (model.paramValues?.baseThickness ?? 10) + (model.paramValues?.bossHeight ?? 24);
  const boreR = model.paramValues?.boreRadius ?? 10;
  const bossR = model.paramValues?.bossRadius ?? 18;

  const frontView: ProjectedView = {
    id: 'front',
    title: 'FRONT VIEW',
    visibleLines: [
      { x1: -w / 2, y1: -h / 2, x2: w / 2, y2: -h / 2 },
      { x1: -w / 2, y1: -h / 2, x2: -w / 2, y2: -h / 2 + 12 },
      { x1: w / 2, y1: -h / 2, x2: w / 2, y2: -h / 2 + 12 },
      { x1: -w / 2, y1: -h / 2 + 12, x2: w / 2, y2: -h / 2 + 12 },
      { x1: -bossR, y1: -h / 2 + 12, x2: -bossR, y2: h / 2 },
      { x1: bossR, y1: -h / 2 + 12, x2: bossR, y2: h / 2 },
      { x1: -bossR, y1: h / 2, x2: bossR, y2: h / 2 },
    ],
    hiddenLines: [
      { x1: -boreR, y1: -h / 2, x2: -boreR, y2: h / 2 },
      { x1: boreR, y1: -h / 2, x2: boreR, y2: h / 2 },
    ],
    centerLines: [{ x1: 0, y1: -h / 2 - 8, x2: 0, y2: h / 2 + 8 }],
    dimensions: [
      { x1: -w / 2, y1: -h / 2 - 12, x2: w / 2, y2: -h / 2 - 12, label: `${w} mm` },
      { x1: w / 2 + 12, y1: -h / 2, x2: w / 2 + 12, y2: h / 2, label: `${h} mm` },
    ],
  };

  const circlePts = (r: number) => {
    const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = 0; i < 24; i++) {
      const a0 = (i / 24) * Math.PI * 2;
      const a1 = ((i + 1) / 24) * Math.PI * 2;
      segs.push({
        x1: Math.cos(a0) * r,
        y1: Math.sin(a0) * r,
        x2: Math.cos(a1) * r,
        y2: Math.sin(a1) * r,
      });
    }
    return segs;
  };

  const topView: ProjectedView = {
    id: 'top',
    title: 'TOP PLAN VIEW',
    visibleLines: [
      { x1: -w / 2, y1: -d / 2, x2: w / 2, y2: -d / 2 },
      { x1: w / 2, y1: -d / 2, x2: w / 2, y2: d / 2 },
      { x1: w / 2, y1: d / 2, x2: -w / 2, y2: d / 2 },
      { x1: -w / 2, y1: d / 2, x2: -w / 2, y2: -d / 2 },
      ...circlePts(bossR),
      ...circlePts(boreR),
    ],
    hiddenLines: circlePts(boreR * 0.8),
    centerLines: [
      { x1: -w / 2 - 8, y1: 0, x2: w / 2 + 8, y2: 0 },
      { x1: 0, y1: -d / 2 - 8, x2: 0, y2: d / 2 + 8 },
    ],
    dimensions: [
      { x1: -boreR, y1: 0, x2: boreR, y2: 0, label: `Ø${boreR * 2}` },
      { x1: -bossR, y1: bossR + 10, x2: bossR, y2: bossR + 10, label: `Ø${bossR * 2}` },
    ],
  };

  const rightView: ProjectedView = {
    id: 'right',
    title: 'RIGHT SIDE VIEW',
    visibleLines: [
      { x1: -d / 2, y1: -h / 2, x2: d / 2, y2: -h / 2 },
      { x1: -d / 2, y1: -h / 2, x2: -d / 2, y2: -h / 2 + 12 },
      { x1: d / 2, y1: -h / 2, x2: d / 2, y2: -h / 2 + 12 },
      { x1: -d / 2, y1: -h / 2 + 12, x2: d / 2, y2: -h / 2 + 12 },
      { x1: -bossR, y1: -h / 2 + 12, x2: -bossR, y2: h / 2 },
      { x1: bossR, y1: -h / 2 + 12, x2: bossR, y2: h / 2 },
      { x1: -bossR, y1: h / 2, x2: bossR, y2: h / 2 },
    ],
    hiddenLines: [
      { x1: -boreR, y1: -h / 2, x2: -boreR, y2: h / 2 },
      { x1: boreR, y1: -h / 2, x2: boreR, y2: h / 2 },
    ],
    centerLines: [{ x1: 0, y1: -h / 2 - 8, x2: 0, y2: h / 2 + 8 }],
    dimensions: [{ x1: -d / 2, y1: -h / 2 - 12, x2: d / 2, y2: -h / 2 - 12, label: `${d} mm` }],
  };

  const isoView: ProjectedView = {
    id: 'isometric',
    title: 'ISOMETRIC VIEW',
    visibleLines: [
      { x1: 0, y1: -22, x2: 38, y2: 0 },
      { x1: 38, y1: 0, x2: 0, y2: 22 },
      { x1: 0, y1: 22, x2: -38, y2: 0 },
      { x1: -38, y1: 0, x2: 0, y2: -22 },
      ...circlePts(16),
      ...circlePts(9),
    ],
    hiddenLines: [],
    centerLines: [{ x1: 0, y1: -30, x2: 0, y2: 30 }],
    dimensions: [],
  };

  return {
    widthMm,
    heightMm,
    config,
    views: [frontView, topView, rightView, isoView],
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function exportDrawingToDxf(sheet: DrawingSheetData): string {
  const lines: string[] = ['0', 'SECTION', '2', 'ENTITIES'];
  for (const v of sheet.views) {
    for (const seg of v.visibleLines) {
      lines.push(
        '0',
        'LINE',
        '8',
        'VISIBLE',
        '10',
        seg.x1.toFixed(2),
        '20',
        seg.y1.toFixed(2),
        '11',
        seg.x2.toFixed(2),
        '21',
        seg.y2.toFixed(2)
      );
    }
    if (sheet.config.includeHiddenLines) {
      for (const seg of v.hiddenLines) {
        lines.push(
          '0',
          'LINE',
          '8',
          'HIDDEN',
          '10',
          seg.x1.toFixed(2),
          '20',
          seg.y1.toFixed(2),
          '11',
          seg.x2.toFixed(2),
          '21',
          seg.y2.toFixed(2)
        );
      }
    }
  }
  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\n');
}

