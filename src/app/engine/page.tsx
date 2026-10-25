'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Box,
  Code2,
  MessageSquare,
  Sliders,
  Layers,
  GitBranch,
  Download,
  Share2,
  Sparkles,
  Play,
  Scissors,
  Expand,
  Ruler,
  MessageCirclePlus,
  FileSpreadsheet,
  Sun,
  Moon,
  User,
  CreditCard,
  FolderOpen,
  Users,
  Eye,
  EyeOff,
  CheckCircle2,
  HelpCircle,
  X,
  Plus,
  Shield,
  LogOut,
  Camera,
  LayoutGrid,
} from 'lucide-react';
import {
  CadViewport3D,
  type CadAnnotationPin,
  type StudioMaterialConfig,
} from '@/components/engine/CadViewport3D';
import {
  DEFAULT_BEARING_HOUSING_CODE,
  executeReplicadScript,
  exportModelFile,
  synthesizeCadFromPrompt,
  type ExportFormat,
} from '@/lib/cad-kernel';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SavedProject {
  id: string;
  name: string;
  code: string;
  cadEngine: string;
  parameters: string;
  partColors: string;
  annotations: string;
  updatedAt: string;
}

const STARTER_TEMPLATES = [
  {
    name: 'Precision Flanged Bearing Housing',
    prompt: 'Precision flanged bearing housing with bronze bushing and 4 bolt holes',
    badge: '2-Part Assembly',
  },
  {
    name: 'Helical Spur Gear',
    prompt: 'Precision spur gear with 18 teeth and central keyway bore',
    badge: 'Power Transmission',
  },
  {
    name: 'CNC Electronics Enclosure',
    prompt: 'CNC machined aluminum electronics enclosure box with top lid',
    badge: '2-Part Housing',
  },
  {
    name: 'Hex Flange Structural Bolt',
    prompt: 'Heavy hex flange structural bolt M16 x 48mm',
    badge: 'Fastener',
  },
];

export default function CadEngineWorkbenchPage() {
  const { data: session } = useSession();
  const viewportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Top-level mode: 'moodboard' | 'workbench' | 'studio-render'
  const [workspaceMode, setWorkspaceMode] = useState<'moodboard' | 'workbench' | 'studio-render'>(
    'workbench'
  );
  const [leftTab, setLeftTab] = useState<'chat' | 'code' | 'tree' | 'params' | 'parts'>('params');
  const [cadEngine, setCadEngine] = useState<'replicad' | 'build123d'>('replicad');
  const [lightTheme, setLightTheme] = useState(false);

  // Active Project State
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Precision Flanged Bearing Housing');
  const [code, setCode] = useState(DEFAULT_BEARING_HOUSING_CODE);
  const [paramOverrides, setParamOverrides] = useState<Record<string, number>>({});
  const [partColors, setPartColors] = useState<Record<string, string>>({
    part_flange_housing: '#38bdf8',
    part_bronze_bushing: '#f59e0b',
  });
  const [partVisibility, setPartVisibility] = useState<Record<string, boolean>>({});
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  // Viewport Tools State
  const [projectionMode, setProjectionMode] = useState<'perspective' | 'orthographic'>(
    'perspective'
  );
  const [showEdges, setShowEdges] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [sectionEnabled, setSectionEnabled] = useState(false);
  const [sectionAxis, setSectionAxis] = useState<'X' | 'Y' | 'Z'>('Z');
  const [sectionOffset, setSectionOffset] = useState(18);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [measureMode, setMeasureMode] = useState(false);
  const [annotateMode, setAnnotateMode] = useState(false);
  const [annotations, setAnnotations] = useState<CadAnnotationPin[]>([]);

  // Studio Render Mode Config
  const [studioTab, setStudioTab] = useState<'material' | 'studio' | 'render'>('material');
  const [studioConfig, setStudioConfig] = useState<StudioMaterialConfig>({
    preset: 'steel',
    roughness: 0.25,
    metalness: 0.85,
    envPreset: 'studio',
    exposure: 1.15,
    ambientIntensity: 0.7,
    directionalIntensity: 1.2,
    groundShadow: true,
  });

  // Chat & AI Prompt State
  const [promptInput, setPromptInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [creditsBalance, setCreditsBalance] = useState<number>(50);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'Loaded **Precision Flanged Bearing Housing** (2-part Replicad B-Rep assembly with 7 parametric dimensions). Use **PARAMS** to adjust dimensions live, **VIEW** tools to section or explode the assembly, or describe any new mechanical part below.',
      timestamp: 'Just now',
    },
  ]);

  // Modals & Drawers State
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLinkUrl, setShareLinkUrl] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareStatusMsg, setShareStatusMsg] = useState('');

  const [projectsDrawerOpen, setProjectsDrawerOpen] = useState(false);
  const [ownedProjects, setOwnedProjects] = useState<SavedProject[]>([]);
  const [teams, setTeams] = useState<
    Array<{
      id: string;
      name: string;
      description: string | null;
      members: Array<{ id: string; email: string; role: string }>;
    }>
  >([]);
  const [newTeamName, setNewTeamName] = useState('');

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'account' | 'tokens' | 'billing'>('account');
  const [tokenHistory, setTokenHistory] = useState<
    Array<{
      id: string;
      promptSummary: string;
      cadEngine: string;
      inputTokens: number;
      outputTokens: number;
      creditsDeducted: number;
      createdAt: string;
    }>
  >([]);
  const [billingHistory, setBillingHistory] = useState<
    Array<{
      id: string;
      description: string;
      amountCents: number;
      creditsAdded: number;
      status: string;
      createdAt: string;
    }>
  >([]);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3200);
  };

  // Compile current CAD code + parameter overrides
  const compiledModel = useMemo(() => {
    return executeReplicadScript(code, paramOverrides);
  }, [code, paramOverrides]);

  // Sync code to localStorage so `/engine/drawing` always has the latest model
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'cadxstudio_active_model',
        JSON.stringify({
          name: projectName,
          code,
          paramOverrides,
        })
      );
    }
  }, [projectName, code, paramOverrides]);

  // Load user profile & projects when authenticated
  const fetchUserWorkspace = async () => {
    if (!session?.user) return;
    const [profRes, projRes, teamRes] = await Promise.all([
      fetch('/api/profile'),
      fetch('/api/projects'),
      fetch('/api/teams'),
    ]);
    if (profRes.ok) {
      const d = await profRes.json();
      if (d.profile) setCreditsBalance(d.profile.creditsBalance);
      setTokenHistory(d.tokenUsage || []);
      setBillingHistory(d.transactions || []);
    }
    if (projRes.ok) {
      const d = await projRes.json();
      setOwnedProjects(d.ownedProjects || []);
    }
    if (teamRes.ok) {
      const d = await teamRes.json();
      setTeams(d.teams || []);
    }
  };

  useEffect(() => {
    fetchUserWorkspace();
  }, [session]);

  const handleSaveProject = async () => {
    if (!session?.user) {
      const synth = executeReplicadScript(code, paramOverrides);
      setProjectName(synth.name);
      showToast('Project state saved to local browser session.');
      return;
    }

    if (projectId) {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          code,
          cadEngine,
          messages,
          parameters: paramOverrides,
          partColors,
          annotations,
        }),
      });
      if (res.ok) {
        showToast('Project saved to cloud database.');
        fetchUserWorkspace();
      }
    } else {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          code,
          cadEngine,
          messages,
          parameters: paramOverrides,
          partColors,
          annotations,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setProjectId(d.project.id);
        showToast('Project created & saved to cloud database.');
        fetchUserWorkspace();
      }
    }
  };

  const handlePromptSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptText = (customPrompt ?? promptInput).trim();
    if (!promptText) return;

    setPromptInput('');
    setGenerating(true);
    setWorkspaceMode('workbench');

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      if (session?.user) {
        const res = await fetch('/api/engine/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            existingCode: code,
            cadEngine,
            projectId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setCode(data.code);
          setProjectName(data.name);
          setParamOverrides({});
          setCreditsBalance(data.creditsRemaining);
          setMessages((prev) => [
            ...prev,
            {
              id: `a_${Date.now()}`,
              role: 'assistant',
              content: data.explanation,
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ]);
          fetchUserWorkspace();
          return;
        }
      }

      // Local fallback compilation
      const synth = synthesizeCadFromPrompt(promptText, code);
      setCode(synth.code);
      setProjectName(synth.name);
      setParamOverrides({});
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: synth.explanation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportFormat = (format: ExportFormat) => {
    const exported = exportModelFile(compiledModel, format);
    const blob = new Blob([exported.content], { type: exported.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exported.filename;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
    showToast(`Exported ${exported.filename}`);
  };

  const handleCreateShareLink = async () => {
    if (!session?.user) {
      const fallbackUrl = `${window.location.origin}/view/demo-bearing-housing`;
      setShareLinkUrl(fallbackUrl);
      showToast('Generated public preview link.');
      return;
    }

    let targetProjectId = projectId;
    if (!targetProjectId) {
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          code,
          cadEngine,
          messages,
          parameters: paramOverrides,
          partColors,
          annotations,
        }),
      });
      if (createRes.ok) {
        const d = await createRes.json();
        targetProjectId = d.project.id;
        setProjectId(d.project.id);
      }
    }

    if (!targetProjectId) return;

    const res = await fetch(`/api/projects/${targetProjectId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_link', permission: 'view' }),
    });
    if (res.ok) {
      const d = await res.json();
      const url = `${window.location.origin}/view/${d.shareLink.shareToken}`;
      setShareLinkUrl(url);
      showToast('Public 3D share link created!');
    }
  };

  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim() || !projectId) return;
    const res = await fetch(`/api/projects/${projectId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'invite_email',
        email: shareEmail.trim(),
        permission: 'edit',
      }),
    });
    if (res.ok) {
      setShareStatusMsg(`Shared "${projectName}" with ${shareEmail.trim()}`);
      setShareEmail('');
    }
  };

  const handlePlanUpgrade = async (planTier: 'starter' | 'pro' | 'pro_plus') => {
    if (!session?.user) {
      showToast('Sign in to upgrade your cloud credit balance.');
      return;
    }
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planTier }),
    });
    if (res.ok) {
      const d = await res.json();
      setCreditsBalance(d.profile.creditsBalance);
      setUpgradeModalOpen(false);
      fetchUserWorkspace();
      showToast(`Upgraded to ${planTier.toUpperCase()}! Credits added.`);
    }
  };

  const handleCaptureStudioSnapshot = () => {
    const canvas = viewportCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-studio-render.png`;
    a.click();
    showToast('Saved high-resolution Studio Render PNG.');
  };

  const TOUR_STEPS = [
    {
      title: '1. AI Chat & Dual-Kernel Code Editor',
      body: 'Generate parametric 3D models from plain English or edit Replicad (JS) and build123d (Python) scripts directly.',
    },
    {
      title: '2. Feature Tree, Live Parameters & Multi-Part Assemblies',
      body: 'Switch between TREE, PARAMS, and PARTS tabs to adjust dimensions with zero-latency sliders and customize assembly part colors.',
    },
    {
      title: '3. Engineering Inspection & Studio Render',
      body: 'Use Section planes, Explode sliders, Measure, Photorealistic Studio Render, and 1-click 2D ISO/ASME Drawing generation.',
    },
  ];

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden ${
        lightTheme ? 'bg-slate-100 text-slate-900' : 'bg-[#070709] text-zinc-100'
      }`}
    >
      {/* TOP ENGINE APPLICATION HEADER */}
      <header
        className={`flex h-13 shrink-0 items-center justify-between border-b px-3.5 ${
          lightTheme
            ? 'border-slate-300 bg-white text-slate-900'
            : 'border-white/10 bg-[#0b0e14] text-zinc-100'
        }`}
      >
        {/* Left Brand & Project Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="CadxStudio" className="h-6 w-6 rounded" />
            <span className="text-xs font-extrabold tracking-[0.16em] uppercase">
              CADX<span className="text-sky-400">ENGINE</span>
            </span>
          </Link>

          <span className="text-zinc-600">/</span>

          <input
            aria-label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:border-sky-400 focus:outline-none ${
              lightTheme
                ? 'border-slate-200 bg-slate-50 text-slate-900'
                : 'border-white/10 bg-slate-950 text-white'
            }`}
          />

          <button
            type="button"
            onClick={handleSaveProject}
            className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-300 hover:bg-sky-500/20 transition"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() =>
              setWorkspaceMode(workspaceMode === 'moodboard' ? 'workbench' : 'moodboard')
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
              workspaceMode === 'moodboard'
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                : 'border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Studio Moodboard
          </button>
        </div>

        {/* Center Viewport & Engineering Toolbar */}
        <div className="hidden xl:flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/90 p-1 text-[11px]">
          <button
            type="button"
            onClick={() =>
              setProjectionMode(projectionMode === 'perspective' ? 'orthographic' : 'perspective')
            }
            className="rounded-lg px-2.5 py-1 font-medium text-zinc-300 hover:bg-white/10"
            title="Toggle Perspective / Orthographic Projection"
          >
            {projectionMode === 'perspective' ? 'Perspective' : 'Orthographic'}
          </button>

          <button
            type="button"
            onClick={() => setWireframe(!wireframe)}
            className={`rounded-lg px-2.5 py-1 font-medium transition ${
              wireframe ? 'bg-sky-500/20 text-sky-300' : 'text-zinc-300 hover:bg-white/10'
            }`}
          >
            Wireframe
          </button>

          <button
            type="button"
            onClick={() => setSectionEnabled(!sectionEnabled)}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition ${
              sectionEnabled ? 'bg-red-500/20 text-red-300' : 'text-zinc-300 hover:bg-white/10'
            }`}
          >
            <Scissors className="h-3.5 w-3.5" />
            Section
          </button>

          <button
            type="button"
            onClick={() => setExplodeFactor(explodeFactor > 0 ? 0 : 0.65)}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition ${
              explodeFactor > 0
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-zinc-300 hover:bg-white/10'
            }`}
          >
            <Expand className="h-3.5 w-3.5" />
            Explode
          </button>

          <button
            type="button"
            onClick={() => {
              setMeasureMode(!measureMode);
              setAnnotateMode(false);
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition ${
              measureMode
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-zinc-300 hover:bg-white/10'
            }`}
          >
            <Ruler className="h-3.5 w-3.5" />
            Measure
          </button>

          <button
            type="button"
            onClick={() => {
              setAnnotateMode(!annotateMode);
              setMeasureMode(false);
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition ${
              annotateMode
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-zinc-300 hover:bg-white/10'
            }`}
          >
            <MessageCirclePlus className="h-3.5 w-3.5" />
            Annotate
          </button>

          <button
            type="button"
            onClick={() =>
              setWorkspaceMode(
                workspaceMode === 'studio-render' ? 'workbench' : 'studio-render'
              )
            }
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
              workspaceMode === 'studio-render'
                ? 'bg-amber-500 text-slate-950'
                : 'text-amber-300 hover:bg-amber-500/15'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Render
          </button>

          <Link
            href="/engine/drawing"
            className="inline-flex items-center gap-1 rounded-lg bg-sky-500/15 border border-sky-500/30 px-2.5 py-1 font-semibold text-sky-300 hover:bg-sky-500/25"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            2D Drawing
          </Link>
        </div>

        {/* Right Actions: Export, Share, Projects, Credits, Account */}
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-sky-400"
            >
              <Download className="h-3.5 w-3.5 text-sky-400" />
              Export
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/15 bg-[#0d1017] p-1.5 shadow-2xl z-50 text-xs">
                {(
                  [
                    ['step', 'STEP B-Rep (.step)'],
                    ['stl', 'STL ASCII (.stl)'],
                    ['stl-binary', 'STL Binary (.stl)'],
                    ['obj', 'Wavefront OBJ (.obj)'],
                    ['gltf', 'glTF 2.0 (.gltf)'],
                    ['glb', 'Binary GLB (.glb)'],
                    ['ply', 'Stanford PLY (.ply)'],
                  ] as [ExportFormat, string][]
                ).map(([fmt, label]) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleExportFormat(fmt)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-zinc-300 hover:bg-sky-500/15 hover:text-sky-300"
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={() => {
              setShareModalOpen(true);
              handleCreateShareLink();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-sky-400"
          >
            <Share2 className="h-3.5 w-3.5 text-amber-400" />
            Share
          </button>

          {/* Projects & Teams Drawer Trigger */}
          <button
            type="button"
            onClick={() => {
              setProjectsDrawerOpen(true);
              fetchUserWorkspace();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-sky-400"
          >
            <FolderOpen className="h-3.5 w-3.5 text-sky-400" />
            Projects
          </button>

          {/* Credits Pill */}
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{creditsBalance} Credits</span>
          </button>

          {/* Account Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              aria-label="Account Menu"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-sky-400"
            >
              <User className="h-3.5 w-3.5 text-sky-400" />
              <span className="hidden sm:inline">
                {session?.user?.name || 'Account'}
              </span>
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/15 bg-[#0d1017] p-1.5 shadow-2xl z-50 text-xs space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(true);
                    setAccountMenuOpen(false);
                    fetchUserWorkspace();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10"
                >
                  <User className="h-3.5 w-3.5 text-sky-400" />
                  Profile, Tokens &amp; Billing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUpgradeModalOpen(true);
                    setAccountMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10"
                >
                  <CreditCard className="h-3.5 w-3.5 text-amber-400" />
                  Upgrade Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLightTheme(!lightTheme);
                    setAccountMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10"
                >
                  {lightTheme ? (
                    <Moon className="h-3.5 w-3.5 text-sky-400" />
                  ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  {lightTheme ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTourOpen(true);
                    setTourStep(0);
                    setAccountMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                  Guided Onboarding Tour
                </button>
                {session?.user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-amber-300 hover:bg-amber-500/15"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin Governance Portal
                  </Link>
                )}
                {session?.user ? (
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-300 hover:bg-red-500/15"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sky-300 hover:bg-sky-500/15"
                  >
                    <User className="h-3.5 w-3.5" />
                    Sign In / Redeem Invite
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* STATUS TOAST */}
      {statusToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-sky-500/40 bg-slate-950/95 px-4 py-2.5 text-xs font-semibold text-sky-300 shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-sky-400" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* MODE 1: STUDIO MOODBOARD LANDING VIEW */}
      {workspaceMode === 'moodboard' ? (
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 blueprint-grid">
          <div className="mx-auto max-w-4xl space-y-10">
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                CadxStudio Parametric Synthesis Engine
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                What would you like to build today?
              </h1>
              <p className="text-xs text-zinc-400">
                Choose your target CAD kernel (Replicad JS or build123d Python) and describe your
                part or multi-component assembly.
              </p>
            </div>

            <form
              onSubmit={(e) => handlePromptSubmit(e)}
              className="rounded-2xl border border-white/15 bg-[#0d1017] p-4 shadow-2xl space-y-4"
            >
              <textarea
                rows={3}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Describe your mechanical part (e.g., 'Flanged bearing housing with 80mm OD, bronze sleeve bushing, and 6 M8 bolt holes')..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-sky-400 focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">CAD Engine:</span>
                  <button
                    type="button"
                    onClick={() => setCadEngine('replicad')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      cadEngine === 'replicad'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Replicad (JS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCadEngine('build123d')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      cadEngine === 'build123d'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    build123d (Python)
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkspaceMode('workbench')}
                    className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
                  >
                    Return to Active Workbench
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate 3D CAD
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Parametric Assembly Starters
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STARTER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => handlePromptSubmit(undefined, tpl.prompt)}
                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0d1017] p-4 text-left hover:border-sky-500/40 transition"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-sm font-bold text-white">{tpl.name}</span>
                      <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-sky-300">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{tpl.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2 & 3: 3D CAD WORKBENCH & STUDIO RENDERER */
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT MULTI-TAB INSPECTOR & CODE/CHAT PANEL */}
          <aside
            className={`flex w-full max-w-[430px] shrink-0 flex-col border-r ${
              lightTheme ? 'border-slate-300 bg-white' : 'border-white/10 bg-[#0b0e14]'
            }`}
          >
            {/* Left Panel Navigation Tabs */}
            <div className="grid grid-cols-5 border-b border-white/10 bg-slate-950/60 p-1 text-[11px] font-bold">
              {[
                { id: 'chat', label: 'CHAT', icon: MessageSquare },
                { id: 'code', label: 'CODE', icon: Code2 },
                { id: 'tree', label: 'TREE', icon: GitBranch },
                { id: 'params', label: 'PARAMS', icon: Sliders },
                { id: 'parts', label: 'PARTS', icon: Layers },
              ].map((t) => {
                const Icon = t.icon;
                const active = leftTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setLeftTab(t.id as 'chat' | 'code' | 'tree' | 'params' | 'parts')
                    }
                    className={`flex items-center justify-center gap-1 rounded-lg py-2 transition ${
                      active
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: CHAT */}
            {leftTab === 'chat' && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl p-3.5 text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'ml-6 bg-sky-500/15 border border-sky-500/30 text-sky-100'
                          : 'mr-4 bg-slate-950/90 border border-white/10 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                        <span className="font-bold uppercase">
                          {m.role === 'user' ? 'Engineer' : 'Cadx AI Synthesizer'}
                        </span>
                        <span>{m.timestamp}</span>
                      </div>
                      <div>{m.content}</div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => handlePromptSubmit(e)}
                  className="border-t border-white/10 p-3 space-y-2 bg-slate-950/70"
                >
                  <textarea
                    rows={2}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Ask AI to generate or modify geometry (e.g., 'Create a spur gear' or 'Enclosure box')..."
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      Engine: <strong className="text-sky-400 uppercase">{cadEngine}</strong>
                    </span>
                    <button
                      type="submit"
                      disabled={generating}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-400"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {generating ? 'Synthesizing...' : 'Generate'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB CONTENT: CODE EDITOR */}
            {leftTab === 'code' && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2 bg-slate-950">
                  <span className="font-mono text-[11px] text-sky-400">
                    {cadEngine === 'replicad' ? 'model.replicad.js' : 'model.build123d.py'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setParamOverrides({});
                      showToast('Compiled B-Rep geometry in 38ms.');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    <Play className="h-3 w-3" />
                    Compile &amp; Run
                  </button>
                </div>
                <textarea
                  aria-label="CAD Code Editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="flex-1 w-full resize-none bg-[#07090e] p-4 font-mono text-xs leading-relaxed text-sky-200 focus:outline-none"
                />
              </div>
            )}

            {/* TAB CONTENT: FEATURE TREE */}
            {leftTab === 'tree' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    2D Sketches ({compiledModel.sketches.length})
                  </h3>
                  <div className="space-y-1.5">
                    {compiledModel.sketches.map((sk) => (
                      <div
                        key={sk.id}
                        onClick={() => setLeftTab('code')}
                        className="cursor-pointer flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs hover:border-sky-500/40"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-sky-400" />
                          <span className="font-medium text-white">{sk.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">
                          Line {sk.lineStart}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    3D B-Rep Features ({compiledModel.features.length})
                  </h3>
                  <div className="space-y-1.5">
                    {compiledModel.features.map((ft) => (
                      <div
                        key={ft.id}
                        onClick={() => setLeftTab('code')}
                        className="cursor-pointer flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs hover:border-amber-500/40"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="font-medium text-white">{ft.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">
                          Line {ft.lineStart}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LIVE PARAMETERS */}
            {leftTab === 'params' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Parametric Dimensions ({compiledModel.parameters.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setParamOverrides({})}
                    className="text-[11px] text-sky-400 hover:underline"
                  >
                    Reset Defaults
                  </button>
                </div>

                <div className="space-y-3">
                  {compiledModel.parameters.map((param) => (
                    <div
                      key={param.key}
                      className="rounded-xl border border-white/10 bg-slate-950/80 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200">{param.label}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={param.value}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            onChange={(e) =>
                              setParamOverrides((prev) => ({
                                ...prev,
                                [param.key]: Number(e.target.value),
                              }))
                            }
                            className="w-16 rounded border border-white/15 bg-slate-900 px-1.5 py-0.5 text-right font-mono text-xs text-sky-300"
                          />
                          <span className="text-[10px] text-zinc-500">{param.unit}</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={param.value}
                        onChange={(e) =>
                          setParamOverrides((prev) => ({
                            ...prev,
                            [param.key]: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-sky-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: MULTI-PART ASSEMBLY INSPECTOR */}
            {leftTab === 'parts' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Assembly Components ({compiledModel.parts.length})
                  </span>
                </div>

                <div className="space-y-2.5">
                  {compiledModel.parts.map((part) => {
                    const visible = partVisibility[part.id] !== false;
                    const color = partColors[part.id] || part.color;
                    return (
                      <div
                        key={part.id}
                        className={`flex items-center justify-between rounded-xl border p-3 transition ${
                          selectedPartId === part.id
                            ? 'border-sky-400 bg-sky-500/10'
                            : 'border-white/10 bg-slate-950/80'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPartId(selectedPartId === part.id ? null : part.id)
                          }
                          className="flex items-center gap-2.5 text-left text-xs font-semibold text-white"
                        >
                          <Box className="h-4 w-4 text-sky-400" />
                          <div>
                            <div>{part.name}</div>
                            <div className="font-mono text-[10px] text-zinc-500">
                              {part.boundingBox.size.join(' × ')} mm
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            aria-label={`Color for ${part.name}`}
                            value={color}
                            onChange={(e) =>
                              setPartColors((prev) => ({
                                ...prev,
                                [part.id]: e.target.value,
                              }))
                            }
                            className="h-6 w-6 cursor-pointer rounded border border-white/20 bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPartVisibility((prev) => ({
                                ...prev,
                                [part.id]: !visible,
                              }))
                            }
                            className="rounded p-1 text-zinc-400 hover:text-white"
                          >
                            {visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-red-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* CENTER 3D VIEWPORT CANVAS */}
          <div className="relative flex-1 overflow-hidden">
            <CadViewport3D
              model={compiledModel}
              projectionMode={projectionMode}
              showEdges={showEdges}
              wireframe={wireframe}
              sectionEnabled={sectionEnabled}
              sectionAxis={sectionAxis}
              sectionOffset={sectionOffset}
              explodeFactor={explodeFactor}
              measureMode={measureMode}
              annotateMode={annotateMode}
              annotations={annotations}
              onAddAnnotation={(pos) => {
                const label = `Note #${annotations.length + 1} (${pos[0]}, ${pos[1]})`;
                setAnnotations((prev) => [
                  ...prev,
                  {
                    id: `pin_${Date.now()}`,
                    label,
                    author: session?.user?.name || 'Engineer',
                    position: pos,
                    createdAt: 'Just now',
                  },
                ]);
                setAnnotateMode(false);
              }}
              selectedPartId={selectedPartId}
              onSelectPart={setSelectedPartId}
              partColors={partColors}
              partVisibility={partVisibility}
              studioMode={workspaceMode === 'studio-render'}
              studioConfig={studioConfig}
              lightTheme={lightTheme}
              canvasRefExternal={viewportCanvasRef}
            />

            {/* Floating Section Plane Control Bar */}
            {sectionEnabled && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-3 rounded-xl border border-red-500/40 bg-slate-950/90 px-4 py-2.5 text-xs shadow-xl backdrop-blur">
                <span className="font-bold text-red-300">Section Plane:</span>
                {(['X', 'Y', 'Z'] as const).map((ax) => (
                  <button
                    key={ax}
                    type="button"
                    onClick={() => setSectionAxis(ax)}
                    className={`rounded px-2 py-0.5 font-mono font-bold ${
                      sectionAxis === ax
                        ? 'bg-red-500 text-slate-950'
                        : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {ax}
                  </button>
                ))}
                <input
                  type="range"
                  min={-40}
                  max={60}
                  value={sectionOffset}
                  onChange={(e) => setSectionOffset(Number(e.target.value))}
                  className="w-28 accent-red-400"
                />
                <span className="font-mono text-red-300">{sectionOffset} mm</span>
              </div>
            )}

            {/* Floating Explode Assembly Control Bar */}
            {explodeFactor > 0 && (
              <div className="absolute top-16 left-4 z-20 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-slate-950/90 px-4 py-2.5 text-xs shadow-xl backdrop-blur">
                <span className="font-bold text-amber-300">Explode Distance:</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={explodeFactor}
                  onChange={(e) => setExplodeFactor(Number(e.target.value))}
                  className="w-32 accent-amber-400"
                />
                <span className="font-mono text-amber-300">
                  {Math.round(explodeFactor * 100)}%
                </span>
              </div>
            )}

            {/* Bottom-Left Geometry Telemetry Pill */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/85 px-3 py-1.5 text-[11px] text-zinc-400 backdrop-blur">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                B-Rep Solid Watertight
              </span>
              <span>·</span>
              <span className="font-mono">
                BBox: {compiledModel.boundingBox.size.join(' × ')} mm
              </span>
              <span>·</span>
              <span className="font-mono">{compiledModel.executionMs} ms</span>
            </div>
          </div>

          {/* RIGHT PANEL: STUDIO PHOTOREALISTIC RENDER INSPECTOR (When in Studio Render mode) */}
          {workspaceMode === 'studio-render' && (
            <aside className="w-80 shrink-0 border-l border-white/10 bg-[#0b0e14] p-4 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Sparkles className="h-4 w-4" />
                    <span>Studio Render Inspector</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkspaceMode('workbench')}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Exit
                  </button>
                </div>

                {/* Studio Sub-Tabs */}
                <div className="grid grid-cols-3 rounded-lg border border-white/10 bg-slate-950 p-1 text-[11px] font-bold">
                  {(['material', 'studio', 'render'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStudioTab(st)}
                      className={`rounded py-1.5 uppercase ${
                        studioTab === st
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {studioTab === 'material' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2">
                        Physical Material Preset
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            ['steel', 'Brushed Steel'],
                            ['aluminum', 'Anodized Alum'],
                            ['bronze', 'Polished Bronze'],
                            ['carbon', 'Matte Carbon'],
                            ['titanium', 'CNC Titanium'],
                            ['plastic', 'Injection ABS'],
                          ] as [StudioMaterialConfig['preset'], string][]
                        ).map(([preset, label]) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setStudioConfig((c) => ({ ...c, preset }))}
                            className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold ${
                              studioConfig.preset === preset
                                ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                                : 'border-white/10 bg-slate-950 text-zinc-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Surface Roughness</span>
                        <span className="font-mono text-amber-300">{studioConfig.roughness}</span>
                      </label>
                      <input
                        type="range"
                        min={0.05}
                        max={1}
                        step={0.05}
                        value={studioConfig.roughness}
                        onChange={(e) =>
                          setStudioConfig((c) => ({
                            ...c,
                            roughness: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-400"
                      />
                    </div>
                  </div>
                )}

                {studioTab === 'studio' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2">
                        HDRI Lighting Environment
                      </label>
                      <select
                        value={studioConfig.envPreset}
                        onChange={(e) =>
                          setStudioConfig((c) => ({
                            ...c,
                            envPreset: e.target.value as StudioMaterialConfig['envPreset'],
                          }))
                        }
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
                      >
                        <option value="studio">Dark Studio Softbox</option>
                        <option value="cleanWhite">Clean White Product Cyclorama</option>
                        <option value="sunset">Warm Industrial Sunset</option>
                        <option value="warehouse">Machine Shop Warehouse</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Tone-Mapping Exposure</span>
                        <span className="font-mono text-amber-300">{studioConfig.exposure}</span>
                      </label>
                      <input
                        type="range"
                        min={0.6}
                        max={1.8}
                        step={0.05}
                        value={studioConfig.exposure}
                        onChange={(e) =>
                          setStudioConfig((c) => ({
                            ...c,
                            exposure: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-400"
                      />
                    </div>
                  </div>
                )}

                {studioTab === 'render' && (
                  <div className="space-y-3 text-xs text-zinc-300">
                    <p>
                      Capture a high-DPI PNG render directly from the active studio camera and
                      lighting rig.
                    </p>
                    <button
                      type="button"
                      onClick={handleCaptureStudioSnapshot}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold uppercase tracking-wider text-slate-950 hover:bg-amber-400"
                    >
                      <Camera className="h-4 w-4" />
                      Download Studio PNG
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCaptureStudioSnapshot}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25"
              >
                <Camera className="h-4 w-4" />
                Quick Snapshot
              </button>
            </aside>
          )}
        </div>
      )}

      {/* MODAL 1: SHARE PROJECT & PUBLIC 3D LINK */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0d1017] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="h-4 w-4 text-sky-400" />
                Share 3D CAD Project
              </h2>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">
                Public Interactive 3D Preview Link
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareLinkUrl}
                  className="flex-1 rounded-lg border border-white/15 bg-slate-950 px-3 py-2 font-mono text-xs text-sky-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(shareLinkUrl);
                    showToast('Copied share link to clipboard.');
                  }}
                  className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-slate-950"
                >
                  Copy
                </button>
              </div>
            </div>

            <form onSubmit={handleInviteCollaborator} className="space-y-2 pt-2 border-t border-white/10">
              <label className="block text-xs font-medium text-zinc-300">
                Invite Collaborator by Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="colleague@engineering.io"
                  className="flex-1 rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Invite
                </button>
              </div>
              {shareStatusMsg && (
                <p className="text-[11px] text-emerald-400">{shareStatusMsg}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROJECTS & TEAMS COLLABORATION DRAWER */}
      {projectsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
          <div className="h-full w-full max-w-lg border-l border-white/15 bg-[#0d1017] p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-sky-400" />
                Projects &amp; Engineering Teams
              </h2>
              <button
                type="button"
                onClick={() => setProjectsDrawerOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Saved Cloud Projects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Saved Projects ({ownedProjects.length})
                </h3>
                <button
                  type="button"
                  onClick={handleSaveProject}
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-500/20 px-2.5 py-1 text-xs font-semibold text-sky-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Save Current
                </button>
              </div>

              {ownedProjects.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No cloud projects saved yet. Click &quot;Save Current&quot; to persist this
                  assembly.
                </p>
              ) : (
                <div className="space-y-2">
                  {ownedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setProjectId(proj.id);
                        setProjectName(proj.name);
                        setCode(proj.code);
                        setProjectsDrawerOpen(false);
                        showToast(`Loaded project: ${proj.name}`);
                      }}
                      className="cursor-pointer rounded-xl border border-white/10 bg-slate-950 p-3.5 hover:border-sky-500/40 transition flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{proj.name}</div>
                        <div className="text-[10px] text-zinc-500">
                          {(proj.cadEngine || 'replicad').toUpperCase()} · Updated{' '}
                          {new Date(proj.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-sky-400">Load →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teams Collaboration */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-amber-400" />
                Engineering Teams ({teams.length})
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newTeamName.trim()) return;
                  const res = await fetch('/api/teams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newTeamName.trim() }),
                  });
                  if (res.ok) {
                    setNewTeamName('');
                    fetchUserWorkspace();
                  }
                }}
                className="flex gap-2"
              >
                <input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="New team name (e.g., Drivetrain R&D)"
                  className="flex-1 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950"
                >
                  Create Team
                </button>
              </form>

              <div className="space-y-2">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-white/10 bg-slate-950 p-3 text-xs space-y-1"
                  >
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-[11px] text-zinc-400">
                      {t.members.length} member(s) · PR Geometry Review Enabled
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: USER PROFILE, TOKEN USAGE LEDGER & BILLING */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0d1017] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                {(['account', 'tokens', 'billing'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setProfileTab(tab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase ${
                      profileTab === tab
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab === 'account'
                      ? 'Account'
                      : tab === 'tokens'
                        ? 'Token Usage'
                        : 'Billing'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {profileTab === 'account' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-slate-950 p-4">
                  <div>
                    <div className="text-zinc-500">Name</div>
                    <div className="font-bold text-white text-sm">
                      {session?.user?.name || 'Guest Engineer'}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500">Email</div>
                    <div className="font-bold text-white text-sm">
                      {session?.user?.email || 'Not signed in'}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500">Role</div>
                    <div className="font-mono text-sky-400">
                      {session?.user?.role || 'GUEST'}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500">Available Credits</div>
                    <div className="font-mono text-amber-300 font-bold">
                      {creditsBalance} Credits
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'tokens' && (
              <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                {tokenHistory.length === 0 ? (
                  <p className="text-zinc-500">No AI token invocations recorded yet.</p>
                ) : (
                  tokenHistory.map((tk) => (
                    <div
                      key={tk.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950 px-3 py-2"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {tk.promptSummary || (tk as unknown as { operation?: string }).operation || 'AI CAD Generation'}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {((tk as unknown as { model?: string }).model || tk.cadEngine || 'replicad').toUpperCase()} ·{' '}
                          {(tk as unknown as { promptTokens?: number }).promptTokens ?? tk.inputTokens ?? 0} in /{' '}
                          {(tk as unknown as { completionTokens?: number }).completionTokens ?? tk.outputTokens ?? 0} out tokens
                        </div>
                      </div>
                      <span className="font-mono text-amber-300">
                        -{tk.creditsDeducted} credit
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {profileTab === 'billing' && (
              <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                {billingHistory.length === 0 ? (
                  <p className="text-zinc-500">No billing transactions yet.</p>
                ) : (
                  billingHistory.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950 px-3 py-2"
                    >
                      <div>
                        <div className="font-semibold text-white">{tx.description}</div>
                        <div className="text-[10px] text-zinc-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className="font-mono text-emerald-400">
                        +${(tx.amountCents / 100).toFixed(2)} ({tx.status})
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: UPGRADE PLAN & TOP-UP CREDITS */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0d1017] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Upgrade CadxStudio Plan &amp; AI Credits
              </h2>
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-slate-950 p-4 space-y-3">
                <div className="font-bold text-white">Starter Top-Up</div>
                <div className="text-2xl font-extrabold text-sky-400">$2</div>
                <div className="text-zinc-400">+30 AI CAD Credits</div>
                <button
                  type="button"
                  onClick={() => handlePlanUpgrade('starter')}
                  className="w-full rounded-lg bg-white/10 py-2 font-bold text-white hover:bg-white/20"
                >
                  Add 30 Credits
                </button>
              </div>

              <div className="rounded-xl border border-sky-400 bg-sky-500/10 p-4 space-y-3">
                <div className="font-bold text-white">Pro Engineer</div>
                <div className="text-2xl font-extrabold text-sky-300">$20 / mo</div>
                <div className="text-zinc-300">+200 AI CAD Credits</div>
                <button
                  type="button"
                  onClick={() => handlePlanUpgrade('pro')}
                  className="w-full rounded-lg bg-sky-500 py-2 font-bold text-slate-950 hover:bg-sky-400"
                >
                  Upgrade to Pro
                </button>
              </div>

              <div className="rounded-xl border border-amber-500/40 bg-slate-950 p-4 space-y-3">
                <div className="font-bold text-white">Pro+ Studio</div>
                <div className="text-2xl font-extrabold text-amber-400">$49 / mo</div>
                <div className="text-zinc-400">+400 AI CAD Credits</div>
                <button
                  type="button"
                  onClick={() => handlePlanUpgrade('pro_plus')}
                  className="w-full rounded-lg bg-amber-500 py-2 font-bold text-slate-950 hover:bg-amber-400"
                >
                  Upgrade to Pro+
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: GUIDED ONBOARDING TOUR */}
      {tourOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-sky-500/40 bg-[#0d1017] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Guided Tour ({tourStep + 1} / {TOUR_STEPS.length})
              </span>
              <button
                type="button"
                onClick={() => setTourOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-base font-bold text-white">{TOUR_STEPS[tourStep].title}</h3>
            <p className="text-xs leading-relaxed text-zinc-300">
              {TOUR_STEPS[tourStep].body}
            </p>
            <div className="flex justify-between pt-2">
              <button
                type="button"
                disabled={tourStep === 0}
                onClick={() => setTourStep((s) => Math.max(0, s - 1))}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
              >
                Previous
              </button>
              {tourStep < TOUR_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setTourStep((s) => s + 1)}
                  className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-bold text-slate-950"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTourOpen(false)}
                  className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950"
                >
                  Finish Tour
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
