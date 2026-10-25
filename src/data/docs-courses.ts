export interface DocNavItem {
  id: string;
  label: string;
}

export interface DocNavGroup {
  id: string;
  label: string;
  items: DocNavItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const DOCS_NAV_GROUPS: DocNavGroup[] = [
  { id: 'getting-started', label: 'Getting Started', items: [] },
  {
    id: 'design-engine',
    label: 'Design Engine',
    items: [
      { id: 'de-overview', label: 'Overview' },
      { id: 'de-sketching', label: 'Sketching' },
      { id: 'de-3d', label: '3D Operations' },
      { id: 'de-assemblies', label: 'Assemblies & Materials' },
      { id: 'de-parameters', label: 'Parameters & Live Editing' },
      { id: 'de-export', label: 'Export' },
      { id: 'de-controls', label: 'Keyboard & Viewer Controls' },
    ],
  },
  {
    id: 'design-assistant',
    label: 'AI Design Engine',
    items: [
      { id: 'da-modes', label: 'Two Modes' },
      { id: 'da-text2cad', label: 'Agentic Design Mode' },
      { id: 'da-workbench', label: 'Workbench Mode' },
      { id: 'tg-how', label: 'How It Works' },
      { id: 'tg-prompts', label: 'Prompt Best Practices' },
      { id: 'tg-iterative', label: 'Iterative Workflow' },
      { id: 'tg-cando', label: "What It Can & Can't Do" },
      { id: 'tg-examples', label: 'Examples' },
    ],
  },
  { id: 'faq', label: 'FAQ', items: [] },
];

export const DOCS_FAQS: FaqItem[] = [
  {
    question: 'What is CadX and who is it for?',
    answer:
      'CadX is a browser-based CAD platform built for engineers, product designers, makers, and students who want professional-grade modeling without installing heavy desktop software. It runs entirely in your browser — no setup, no plugins.',
  },
  {
    question: 'Is CadX free to use?',
    answer:
      "CadX offers a one-time Starter Pack ($2) with limited AI design, limited drawing generation, and limited browser rendering. Pro ($20/mo) unlocks extended AI usage plus unlimited drawing, unlimited rendering, and collaboration. Engineer ($49/mo) adds maximum AI usage, SSO, design history, and priority support. Prices, plans, and usage limits are subject to change at CadXStudio's discretion.",
  },
  {
    question: 'Can prices, plans, or usage limits change?',
    answer:
      "Yes. Prices, plans, features, and usage limits — including AI design, drawing generation, and browser rendering — are subject to change at CadXStudio's sole discretion. What is published on the Pricing page or in these docs is not a guarantee of future pricing or entitlements. See our Terms & Conditions for details.",
  },
  {
    question: 'How does Agentic Design work?',
    answer:
      "Describe your part in plain English — dimensions, features, geometry — and CadX's AI generates a fully parametric 3D model instantly. You can refine it with follow-up prompts or switch to manual tools to fine-tune.",
  },
  {
    question: 'Does CadX work offline or require an internet connection?',
    answer:
      'The geometry engine runs fully in your browser via WebAssembly, so modeling works even with a slow connection. An internet connection is required only for AI-assisted features like Agentic Design.',
  },
  {
    question: 'Is my design data private and secure?',
    answer:
      'Yes. All geometry computation happens locally in your browser — your CAD data never leaves your device. Only your text prompts are sent to the AI server, and those are never stored or used for training.',
  },
  {
    question: 'What file formats can I export from CadX?',
    answer:
      'CadX supports export to STL (3D printing), STEP (manufacturing), OBJ (rendering), and more. STEP is the industry-standard format accepted by virtually every manufacturer worldwide.',
  },
  {
    question: 'Can I use CadX for 3D printing?',
    answer:
      'Absolutely. Design your part in CadX, export as STL or 3MF, and import directly into your slicer — Cura, PrusaSlicer, Bambu Studio, OrcaSlicer, or any other tool you prefer.',
  },
  {
    question: 'Can I use CadX for manufacturing?',
    answer:
      'Yes. CadX generates production-ready STEP files that can be sent to any manufacturing shop. STEP is the universal standard for precision manufacturing.',
  },
  {
    question: 'Does CadX support parametric modeling?',
    answer:
      'Yes. Every feature you create — extrudes, fillets, cuts, holes — is recorded in a live Feature Tree. You can go back, edit any parameter, and the model updates instantly. The AI can also edit parameters from text.',
  },
  {
    question: 'Can I collaborate or share my designs?',
    answer:
      'Yes. You can export and share your designs in standard formats. Team collaboration features with GitHub-style branching and merging are available on the Pro and Engineer plans.',
  },
  {
    question: 'What makes CadX different from other CAD tools?',
    answer:
      'CadX combines a professional parametric CAD engine with AI-powered "Hybrid Intelligence" and GitHub-style collaboration — all in a single browser tab, with no installation required.',
  },
  {
    question: 'Is there an API or enterprise integration option?',
    answer:
      'Yes. Enterprise customers get access to CadX APIs for embedding CAD capabilities into their own workflows, custom SSO, dedicated support, and volume licensing. Contact our team for details.',
  },
];

export const DRAWING_FAQS: FaqItem[] = [
  {
    question: 'What is automated engineering drawing generation?',
    answer:
      'Automated engineering drawing generation uses AI to read a 3D CAD model and produce a complete 2D technical drawing, including orthographic views, isometric projection, dimensions, annotations, and a professional title block, without manual drafting in a separate tool.',
  },
  {
    question: 'What file formats can I import?',
    answer:
      'CadXStudio supports importing industry-standard 3D formats including STEP (.step, .stp), IGES, and native CadX project files. Upload your model in the browser and the drawing engine analyzes geometry to place views and dimensions automatically.',
  },
  {
    question: 'How does auto-dimensioning work?',
    answer:
      'Our AI analyzes part geometry, feature relationships, and manufacturing intent to place linear, radial, and angular dimensions on the correct views. Hole patterns, thicknesses, radii, and overall envelope dimensions are detected and annotated following standard drafting conventions.',
  },
  {
    question: 'What drawing standards are supported?',
    answer:
      'Generated drawings follow third-angle projection (ASME/ISO), include standard title blocks with drawing number and revision, and export to PDF ready for manufacturing review. Sheet sizes include A3 and A4 with proper border and grid references.',
  },
  {
    question: 'How long does it take to generate a drawing?',
    answer:
      'Most parts generate a complete multi-view engineering drawing in under 30 seconds. Complex assemblies may take slightly longer. The entire workflow of importing, generating, reviewing, and exporting a PDF happens in your browser with no desktop software installation.',
  },
  {
    question: 'Can I edit the drawing after generation?',
    answer:
      'Yes. After AI generation you can adjust views, toggle dimensions, modify the title block fields, and re-export. The drawing stays linked to your 3D model so updates propagate when geometry changes.',
  },
  {
    question: 'Is this really browser-based? No AutoCAD or SolidWorks needed?',
    answer:
      'Correct. CadXStudio runs entirely in your web browser. Import a 3D model, generate a fully dimensioned engineering drawing, and download a production-ready PDF. No plugins, no license servers, and no friction.',
  },
  {
    question: 'Who is this for?',
    answer:
      'Mechanical engineers, product designers, hardware startups, and manufacturing teams who need fast, accurate 2D documentation from 3D models, without spending hours on manual drafting or paying for separate drawing modules.',
  },
];

export interface DocCourseSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface DocCourseModule {
  slug: string;
  title: string;
  category: 'Getting Started' | 'Learn' | 'Reference';
  duration: string;
  summary: string;
  sections: DocCourseSection[];
  codeExample?: {
    title: string;
    language: 'javascript' | 'python';
    code: string;
  };
}

export const DOCS_COURSE_MODULES: DocCourseModule[] = [
  {
    slug: 'getting-started-overview',
    title: 'Getting Started with CadxStudio',
    category: 'Getting Started',
    duration: '8 min course',
    summary:
      'Learn how CadxStudio combines natural-language AI synthesis, parametric Code-CAD (Replicad & build123d), and browser-based OpenCASCADE B-Rep modeling.',
    sections: [
      {
        heading: 'Browser-Native Parametric B-Rep Architecture',
        body: 'CadxStudio runs a full OpenCASCADE WebAssembly geometry kernel inside your browser. Every model is a watertight Boundary Representation (B-Rep) solid that exports cleanly to STEP AP214.',
        bullets: [
          'Zero desktop installation or GPU drivers required',
          'Switch seamlessly between AI Prompting, Live Sliders, and Code Editing',
          'Direct 1-click projection to ISO/ASME 2D Engineering Drawings',
        ],
      },
      {
        heading: 'The 4-Pillar Workspace',
        body: 'Use the left inspector to switch between CHAT, CODE, TREE (Sketches & Features), PARAMS (Live Sliders), and PARTS (Assembly components).',
      },
    ],
    codeExample: {
      title: 'Hello Parametric Cylinder (Replicad JS)',
      language: 'javascript',
      code: `const defaultName = "Flanged Bushing";
const defaultParams = { outerDiameter: 60, boreDiameter: 24, height: 30 };

function main(replicad, params = defaultParams) {
  const { drawCircle } = replicad;
  // @sketch "Outer Circle" plane=XY
  // @feature extrude "Main Cylinder"
  return drawCircle(params.outerDiameter / 2)
    .sketchOnPlane("XY", 0)
    .extrude(params.height)
    .cut(drawCircle(params.boreDiameter / 2).sketchOnPlane("XY", 0).extrude(params.height));
}`,
    },
  },
  {
    slug: 'de-sketching',
    title: '2D Sketching & Profiles on Workplanes',
    category: 'Learn',
    duration: '12 min course',
    summary:
      'Master 2D planar profiles on XY, XZ, and YZ workplanes using Replicad primitives, polylines, rounded rectangles, and parametric constraints.',
    sections: [
      {
        heading: 'Workplanes & Offsets',
        body: 'Every 3D solid begins on a 2D reference plane (XY, XZ, YZ) with an optional Z-offset. Annotate sketches with // @sketch comments to register them in the interactive Feature Tree.',
        bullets: [
          'drawRoundedRectangle(width, depth, cornerRadius)',
          'drawCircle(radius) and drawPolysides(radius, sides)',
          'sketchOnPlane("XY", offsetMm) to position stacked features',
        ],
      },
    ],
  },
  {
    slug: 'de-3d-operations',
    title: '3D Solid Operations: Extrude, Revolve, Fillet & Shell',
    category: 'Learn',
    duration: '15 min course',
    summary:
      'Transform 2D planar sketches into manufacturable 3D solids using extrusions, boolean unions/cuts, fillets, chamfers, and thin-wall shelling.',
    sections: [
      {
        heading: 'Boolean CSG & Edge Treatments',
        body: 'Combine primitives with .fuse() and .cut(), then apply .fillet(radius) or .chamfer(dist) to eliminate sharp internal stress concentrators.',
        bullets: [
          'Always apply fillets and chamfers after primary boolean cuts',
          'Keep fillet radii smaller than adjacent wall thickness to prevent self-intersection',
        ],
      },
    ],
  },
  {
    slug: 'de-assemblies',
    title: 'Multi-Part Assemblies, Materials & Exploded Views',
    category: 'Learn',
    duration: '14 min course',
    summary:
      'Build multi-component mechanical assemblies by returning an array of named, colored solid parts and inspect clearances with Explode and Section tools.',
    sections: [
      {
        heading: 'Returning Multi-Part Arrays from main()',
        body: 'Return [{ shape, name, color }, ...] from main() to populate the PARTS tab with independent component visibility toggles, color pickers, and exploded view vectors.',
      },
    ],
  },
  {
    slug: 'de-parameters',
    title: 'Parametric Design & Live Dimension Sliders',
    category: 'Learn',
    duration: '10 min course',
    summary:
      'Bind model dimensions to defaultParams so engineers can reconfigure part families in real time without touching code.',
    sections: [
      {
        heading: 'Designing Resilient Parametric Ratios',
        body: 'Express secondary features (such as bolt circle diameter or wall thickness) as formulas or bounded parameters so extreme slider values never break topology.',
      },
    ],
  },
  {
    slug: 'da-modes',
    title: 'Two Modes: Brainstorm vs. Agentic Build',
    category: 'Learn',
    duration: '9 min course',
    summary:
      'Use Brainstorm mode to refine mechanical specifications, tolerances, and materials before invoking Agentic Build to synthesize parametric code.',
    sections: [
      {
        heading: 'Specification-First AI CAD',
        body: 'State your part purpose, overall envelope in millimeters, mounting hole pattern, and manufacturing process (CNC milling, 3D printing, sheet metal) for optimal geometry.',
      },
    ],
  },
  {
    slug: 'tg-prompts',
    title: 'Prompt Engineering Best Practices for Mechanical CAD',
    category: 'Learn',
    duration: '11 min course',
    summary:
      'Apply the 5-part engineering prompt formula (Part Purpose, Envelope Dimensions, Hole/Boss Features, Material/Process, Mating Context).',
    sections: [
      {
        heading: 'The 5-Part Prompt Formula',
        body: 'Explicitly specify units (mm), hole diameters (e.g., 4x M6 clearance holes on a 56mm PCD), and edge treatments (e.g., 2mm fillets).',
      },
    ],
  },
  {
    slug: 'tg-iterative',
    title: 'Iterative Refinement & Feature Tree Debugging',
    category: 'Learn',
    duration: '10 min course',
    summary:
      'Combine conversational follow-up prompts with direct parameter slider edits and code annotations.',
    sections: [
      {
        heading: 'Incremental Feature Layering',
        body: 'Generate the core housing body first, verify critical envelope dimensions with the Measure tool, and then add mounting bosses, counterbores, and fillets.',
      },
    ],
  },
  {
    slug: 'build123d-python',
    title: 'Python CAD with build123d Sandbox',
    category: 'Reference',
    duration: '15 min course',
    summary:
      'Write Pythonic parametric CAD models using build123d Builder and Algebra modes alongside our downloadable b3d-sandbox-setup.py helper.',
    sections: [
      {
        heading: 'Builder Contexts & Algebraic CSG',
        body: 'build123d lets Python engineers use BuildPart(), BuildSketch(), and BuildLine() context managers or concise + and - algebraic operators.',
      },
    ],
    codeExample: {
      title: 'build123d Flanged Bearing Housing (Python)',
      language: 'python',
      code: `from build123d import *

with BuildPart() as housing:
    Cylinder(radius=38, height=12)
    Cylinder(radius=22, height=36, align=(Align.CENTER, Align.CENTER, Align.MIN))
    Cylinder(radius=12, height=36, mode=Mode.SUBTRACT)
    fillet(housing.edges(), radius=1.5)`,
    },
  },
  {
    slug: 'drawing-automation',
    title: '2D ISO & ASME Engineering Drawing Generation',
    category: 'Reference',
    duration: '10 min course',
    summary:
      'Project 3D B-Rep models into standardized 4-view orthographic and isometric sheets with Hidden Line Removal (HLR), auto-dimensions, and DXF/PDF export.',
    sections: [
      {
        heading: 'First-Angle (ISO) vs. Third-Angle (ASME) Projection',
        body: 'Configure sheet size (A4/A3/A2), scale (1:1, 1:2, 2:1), hidden dashed lines, and title block metadata in the /engine/drawing workspace.',
      },
    ],
  },
  {
    slug: 'de-export',
    title: 'Manufacturing Export Formats (STEP, STL, OBJ, GLB, DXF)',
    category: 'Reference',
    duration: '7 min course',
    summary:
      'Choose the right export format for CNC machining (STEP AP214), additive manufacturing (STL/OBJ), web visualization (GLTF/GLB), and laser cutting (DXF).',
    sections: [
      {
        heading: 'B-Rep vs. Tessellated Mesh Formats',
        body: 'Use STEP (.step) for SolidWorks, Fusion 360, Onshape, and CNC quoting. Use STL or 3MF for 3D printing slicers, and GLB for web embeds.',
      },
    ],
  },
  {
    slug: 'de-controls',
    title: 'Viewport Controls, Section Planes & Studio Rendering',
    category: 'Reference',
    duration: '8 min course',
    summary:
      'Reference guide for 3D camera navigation, X/Y/Z cross-section clipping, point-to-point distance measurement, and PBR Studio Rendering.',
    sections: [
      {
        heading: 'Mouse & Keyboard Shortcuts',
        body: 'Left-drag to orbit, Shift + Left-drag or Right-drag to pan, Scroll wheel to zoom, and click ISO / FRONT / TOP / RIGHT camera presets to snap to orthographic views.',
      },
    ],
  },
];

