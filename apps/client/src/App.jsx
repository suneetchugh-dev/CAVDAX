import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Compass, RotateCcw, Cable } from 'lucide-react';
import Header from './components/Header.jsx';
import SplashLoader from './components/SplashLoader.jsx';
import LandingPage from './components/LandingPage.jsx';
import ConnectMcpPage from './components/ConnectMcpPage.jsx';
import ProjectVideoPage from './components/ProjectVideoPage.jsx';
import TeamPage from './components/TeamPage.jsx';
import PreferencesModal from './components/PreferencesModal.jsx';
import McpConnectModal from './components/McpConnectModal.jsx';
import McpCableConnectionSvg from './components/McpCableConnectionSvg.jsx';
import NotFoundPage from './components/NotFoundPage.jsx';
import StoryStepper from './components/StoryStepper.jsx';
import TerminalView from './components/TerminalView.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import TourGuide from './components/TourGuide.jsx';
import Tooltip from './components/Tooltip.jsx';
import { playClick, playRejectBuzz, playApprovalChime, initGlobalClickSound } from './utils/soundFx.js';

// Helper function to resolve tab from clean URL path with fallback to hash
function resolveTabFromUrl() {
  if (typeof window === 'undefined') return 'landing';

  // 1. Clean Path Routing: /overview, /console, /mcp, /project, /team, /404
  const rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (rawPath === '/' || rawPath === '/overview') return 'landing';
  if (rawPath === '/console') return 'console';
  if (rawPath === '/mcp') return 'mcp';
  if (rawPath === '/project' || rawPath === '/demo') return 'project';
  if (rawPath === '/team') return 'team';
  if (rawPath === '/404') return '404';

  // 2. Hash routing fallback ONLY if on root '/'
  if (rawPath === '/') {
    const h = window.location.hash.toLowerCase();
    if (h === '#console') return 'console';
    if (h === '#mcp') return 'mcp';
    if (h === '#project' || h === '#demo') return 'project';
    if (h === '#team') return 'team';
    if (h === '#overview' || h === '' || h === '#') return 'landing';
    if (h === '#404') return '404';
  }

  // 3. Any unmapped pathname -> 404
  return '404';
}

const TAB_TO_PATH = {
  landing: '/overview',
  console: '/console',
  mcp: '/mcp',
  project: '/project',
  team: '/team',
  '404': '/404',
};

export default function App() {
  const [activeTab, setActiveTab] = useState(() => resolveTabFromUrl());
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [currentAct, setCurrentAct] = useState(1);
  const [loadingAct, setLoadingAct] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [agentState, setAgentState] = useState('idle'); // 'idle' | 'reasoning' | 'executing' | 'verified' | 'rejected'
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cavdax_theme');
      if (saved) return saved === 'dark';
    }
    return true;
  });
  const workspaceRef = useRef(null);

  // Theme class toggle on <html> element
  useEffect(() => {
    initGlobalClickSound();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkTheme) {
      root.classList.add('dark');
      try { localStorage.setItem('cavdax_theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('cavdax_theme', 'light'); } catch {}
    }
  }, [isDarkTheme]);

  // Tab switch handler — uses HTML5 history.pushState for clean paths (/overview, /console, /mcp, etc.)
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      if (window.__lenis) {
        try { window.__lenis.scrollTo(0, { immediate: true }); } catch {}
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    try {
      localStorage.setItem('cavdax_tab', tab);
      if (typeof window !== 'undefined') {
        const targetPath = TAB_TO_PATH[tab] || '/overview';
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ tab }, '', targetPath);
        }
      }
      if (tab === 'console') {
        const pending = sessionStorage.getItem('cavdax.tour.pending');
        if (pending) {
          sessionStorage.removeItem('cavdax.tour.pending');
          setTimeout(() => setIsTourOpen(true), 600);
        }
      }
    } catch {}
  };

  // Synchronize browser history (popstate / back-forward navigation) and normalize legacy hashes
  useEffect(() => {
    const handlePopState = () => {
      const tab = resolveTabFromUrl();
      setActiveTab(tab);
    };

    // If initial URL had a hash like /#console or /#team, cleanly normalize to /console or /team
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const hashToPath = {
        '#console': '/console',
        '#mcp': '/mcp',
        '#project': '/project',
        '#demo': '/project',
        '#team': '/team',
        '#overview': '/overview',
        '#404': '/404'
      };
      if (hashToPath[hash]) {
        window.history.replaceState({ tab: resolveTabFromUrl() }, '', hashToPath[hash]);
      }
    }

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    let lenis;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      window.__lenis = lenis;

      function raf(time) {
        if (document.documentElement.scrollHeight > window.innerHeight + 10) {
          lenis.raf(time);
        }
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch {}

    return () => {
      if (lenis) {
        lenis.destroy();
        window.__lenis = null;
      }
    };
  }, []);

  // Keyboard shortcuts for console buttons: T = Tour Guide, R = Reset Demo
  useEffect(() => {
    const handleKey = (e) => {
      // Guard: skip if focus is in any input/textarea/contenteditable
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      if (activeTab !== 'console') return;

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTourOpen(true);
      }
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        playClick();
        // handleReset is defined below; using a ref to avoid stale closure
        if (window.__cavdaxResetFn) window.__cavdaxResetFn();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab]);

  // Graph state
  const [graphData, setGraphData] = useState({
    nodes: [
      { id: 'ADR-001', label: 'Source', title: 'Adopt TokenAuth v1 for Payment Gateway', status: 'ACTIVE', type: 'ADR' },
      { id: 'F-Auth-v1', label: 'Fact', claim: 'Payment services require TokenAuth v1', is_stale: false, verified: true },
      { id: 'DEC-102', label: 'Decision', title: 'Generate Checkout Service with TokenAuth v1', status: 'VALID' },
      { id: 'ADR-002', label: 'Source', title: 'Mandatory Migration to OAuth2; TokenAuth v1 Decommissioned', status: 'ACTIVE', type: 'ADR' },
      { id: 'F-OAuth2', label: 'Fact', claim: 'OAuth2 is strictly enforced; TokenAuth v1 prohibited', is_stale: false, verified: true }
    ],
    edges: [
      { source: 'F-Auth-v1', target: 'ADR-001', type: 'EXTRACTED_FROM' },
      { source: 'DEC-102', target: 'F-Auth-v1', type: 'DEPENDS_ON' },
      { source: 'F-OAuth2', target: 'ADR-002', type: 'EXTRACTED_FROM' }
    ]
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [activeVerdict, setActiveVerdict] = useState(null);
  const [latestLatency, setLatestLatency] = useState('1.84');
  const [falkorLive, setFalkorLive] = useState(false);

  // Terminal & Action state
  const [terminalLogs, setTerminalLogs] = useState([
    {
      component: 'KERNEL',
      time: '15:30:00',
      type: 'INFO',
      text: 'CAVDAX Causal Graph Kernel initialized. GraphBLAS Sparse Matrix ready.'
    },
    {
      component: 'INGESTION',
      time: '15:30:01',
      type: 'INFO',
      text: 'Loaded baseline ADR-001: TokenAuth v1 accepted for payment gateway.'
    },
    {
      component: 'MCP_SERVER',
      time: '15:30:02',
      type: 'INFO',
      text: 'Enclosed tool `apply_code_change` registered. Grounded verification active.'
    }
  ]);

  const [latestAction, setLatestAction] = useState({
    filePath: 'demo-repo/src/services/payment.js',
    decisionId: 'DEC-102',
    codeSnippet: `// Agent attempting to scaffold checkout route with deprecated TokenAuth v1:\napp.post('/api/checkout', (req, res) => {\n  const token = req.headers['x-tokenauth-v1'];\n  if (!TokenAuth.v1.verify(token)) return res.status(401).send();\n  // Process checkout...\n});`
  });

  // Fetch initial graph, health & check first-visit tour auto-start
  useEffect(() => {
    async function loadInitial() {
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setFalkorLive(healthData.falkordb_connected);
        }

        const graphRes = await fetch('/api/graph');
        if (graphRes.ok) {
          const g = await graphRes.json();
          if (g && g.nodes && g.nodes.length > 0) {
            setGraphData(g);
          }
        }
      } catch (err) {
        console.warn('Initial load fallback:', err.message);
      }
    }
    loadInitial();

    // Check first-time tour trigger — only ever fires when user navigates to console
    // Tour is strictly reserved for the operational console (§1.6)
    try {
      const tourDone = localStorage.getItem('cavdax.tour.completed');
      if (!tourDone) {
        // We store intent; the actual open is triggered by Tab switch to console (see handleSelectTab)
        sessionStorage.setItem('cavdax.tour.pending', 'true');
      }
    } catch {}

    // Setup SSE listener
    let evtSource;
    try {
      evtSource = new EventSource('/api/events');
      evtSource.addEventListener('GRAPH_UPDATED', (e) => {
        try {
          const updated = JSON.parse(e.data);
          if (updated && updated.data) setGraphData(updated.data);
        } catch {}
      });
    } catch {}

    return () => {
      if (evtSource) evtSource.close();
    };
  }, []);

  // -------------------------------------------------------------------------
  // ACT CONTROLLERS
  // -------------------------------------------------------------------------

  async function handleSelectAct(actNumber) {
    playClick();
    setCurrentAct(actNumber);
    setLoadingAct(actNumber);

    try {
      if (actNumber === 1) {
        // ACT I: Baseline
        setAgentState('idle');
        await handleReset();
      } else if (actNumber === 2) {
        // ACT II: Ingest Commit Mutation
        setAgentState('reasoning');
        addLog('INGESTION', 'Ingesting git commit containing ADR-002 (supersedes ADR-001)...', 'CASCADE');
        const res = await fetch('/api/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();

        if (data.graph) setGraphData(data.graph);
        const lat = data.ingestResult?.invalidation?.latency_ms || 2.14;
        setLatestLatency(lat);

        addLog(
          'FALKORDB',
          `Query 2 Cascade completed in ${lat}ms. SUPERSEDES edge established. ADR-001 -> SUPERSEDED, F-Auth-v1 -> STALE, DEC-102 -> INVALIDATED_NEEDS_REVALIDATION.`,
          'CASCADE'
        );
        setActiveVerdict('BLOCKED');
        setAgentState('idle');
      } else if (actNumber === 3) {
        // ACT III: Agent Enclosed MCP Gate Execution Call
        setAgentState('executing');
        addLog('AGENT', 'Autonomous Coding Agent requests tool execution: `apply_code_change` with DEC-102...', 'INFO');
        setLatestAction({
          filePath: 'demo-repo/src/services/payment.js',
          decisionId: 'DEC-102',
          codeSnippet: `// AGENT PROPOSED MUTATION (STALE PROVENANCE):\napp.post('/api/checkout', (req, res) => {\n  const token = req.headers['x-tokenauth-v1'];\n  if (!TokenAuth.v1.verify(token)) return res.status(401).send();\n  res.json({ status: 'paid' });\n});`
        });

        const res = await fetch('/api/mcp/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: 'apply_code_change',
            args: {
              decision_id: 'DEC-102',
              file_path: 'demo-repo/src/services/payment.js',
              code_payload: '// TokenAuth v1 code'
            }
          })
        });

        const data = await res.json();
        setLatestLatency(data.latency_ms || 1.84);
        setActiveVerdict('BLOCKED');
        setAgentState('rejected');
        playRejectBuzz();

        addLog(
          'MCP_GATE',
          `ENCLOSED MCP GATE BLOCKED in ${data.latency_ms || 1.84}ms! Verdict: ${data.gate_verdict}. Write rejected. Zero files modified.`,
          'GATE_BLOCK',
          data.violation_paths
        );
      } else if (actNumber === 4) {
        // ACT IV: Revalidation & Safe Execution
        setAgentState('reasoning');
        addLog('AGENT', 'Act IV: Agent synthesizes Decision DEC-103 grounded in fresh Source ADR-002...', 'REVALIDATION');

        const revalRes = await fetch('/api/act-iv-revalidate', { method: 'POST' });
        const revalData = await revalRes.json();
        if (revalData.graph) setGraphData(revalData.graph);

        addLog('FALKORDB', 'Query 3 Revalidation complete: DEC-103 created; DEC-102 archived.', 'REVALIDATION');

        // Agent re-submits code with DEC-103
        setAgentState('executing');
        addLog('AGENT', 'Agent re-submits `apply_code_change` using verified DEC-103...', 'INFO');

        const oauthCode = `/**\n * Payment Gateway Service\n * Verified & Grounded in DEC-103 (ADR-002: OAuth2 JWT/RS256)\n */\nimport express from 'express';\nimport { verifyOAuth2Bearer } from './auth.js';\n\nconst app = express();\napp.use(express.json());\n\n// Verified OAuth2 Checkout Endpoint\napp.post('/api/v2/checkout', verifyOAuth2Bearer, (req, res) => {\n  res.json({ status: 'approved', authMethod: 'OAuth2-RS256' });\n});\n\nexport default app;`;

        setLatestAction({
          filePath: 'demo-repo/src/services/payment.js',
          decisionId: 'DEC-103',
          codeSnippet: oauthCode
        });

        const execRes = await fetch('/api/mcp/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: 'apply_code_change',
            args: {
              decision_id: 'DEC-103',
              file_path: 'demo-repo/src/services/payment.js',
              code_payload: oauthCode
            }
          })
        });

        const execData = await execRes.json();
        if (execData.graph) setGraphData(execData.graph);
        setLatestLatency(execData.latency_ms || 1.62);
        setActiveVerdict('APPROVED');
        setAgentState('verified');
        playApprovalChime();

        addLog(
          'MCP_GATE',
          `GATE APPROVED in ${execData.latency_ms || 1.62}ms! Full causal provenance chain verified. File 'payment.js' safely written to disk.`,
          'GATE_APPROVE'
        );
      }
    } catch (err) {
      console.error('Act error:', err);
      addLog('ERROR', `Error executing Act ${actNumber}: ${err.message}`, 'ERROR');
    } finally {
      setLoadingAct(null);
    }
  }

  async function handleReset() {
    playClick();
    setIsResetting(true);
    setAgentState('idle');
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.graph) setGraphData(data.graph);

      setCurrentAct(1);
      setActiveVerdict(null);
      setSelectedNode(null);

      setTerminalLogs([
        {
          component: 'SYSTEM',
          time: new Date().toLocaleTimeString(),
          type: 'INFO',
          text: 'Demo repository and FalkorDB causal graph reset to Act I baseline.'
        }
      ]);

      setLatestAction({
        filePath: 'demo-repo/src/services/payment.js',
        decisionId: 'DEC-102',
        codeSnippet: `// Baseline: Unimplemented checkout route awaiting agent implementation\napp.post('/api/checkout', (req, res) => {\n  res.status(501).json({ error: 'Checkout route not implemented yet.' });\n});`
      });
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  }

  function addLog(component, text, type = 'INFO', violationPaths = null) {
    setTerminalLogs((prev) => [
      ...prev,
      {
        component,
        time: new Date().toLocaleTimeString(),
        type,
        text,
        violationPaths,
      },
    ]);
  }

  const handleCustomMcpAction = (result) => {
    if (result.is_approved) {
      addLog(
        'MCP_GATE',
        `PLAYGROUND TEST: APPROVED in ${result.latency_ms || '< 15'}ms! Verified causal chain for ${result.decision_id || 'Decision'}. File modified safely.`,
        'GATE_APPROVE'
      );
    } else {
      addLog(
        'MCP_GATE',
        `PLAYGROUND TEST: BLOCKED in ${result.latency_ms || '< 15'}ms! Hard reject on stale provenance. Zero writes permitted.`,
        'GATE_BLOCK',
        result.violation_paths
      );
    }
  };

  return (
    <div className={`w-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 select-none ${
      activeTab === 'console' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'
    }`}>
      {/* 0. Silky Smooth Kinetic Splash Loader */}
      <SplashLoader isDarkTheme={isDarkTheme} />

      {/* 1. Monochromatic Portfolio Header (Icon mark only - NO WORDMARK) */}
      <Header
        status={{ falkorLive, latestLatency }}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        isDarkTheme={isDarkTheme}
        onToggleTheme={() => setIsDarkTheme((d) => !d)}
      />

      {/* 2. Main Viewport Switcher */}
      {activeTab === 'landing' ? (
        /* Full Product Landing Page (footer particles live here, not in console §1.6) */
        <LandingPage
          onLaunchConsole={() => handleSelectTab('console')}
          onOpenMcpPage={() => handleSelectTab('mcp')}
          onOpenMcpModal={() => setIsMcpModalOpen(true)}
          onStartTour={() => handleSelectTab('console')}
        />
      ) : activeTab === 'mcp' ? (
        /* Dedicated Full-Page MCP Architecture & Agent Connection Guide */
        <ConnectMcpPage
          onLaunchConsole={() => handleSelectTab('console')}
        />
      ) : activeTab === 'project' ? (
        /* Project & System Demo Video Page */
        <ProjectVideoPage
          onLaunchConsole={() => handleSelectTab('console')}
          onOpenMcpPage={() => handleSelectTab('mcp')}
        />
      ) : activeTab === 'team' ? (
        /* Team Contrarians Presentation Page (SAHNIRMAAN Style) */
        <TeamPage
          onLaunchConsole={() => handleSelectTab('console')}
        />
      ) : activeTab === '404' ? (
        /* Bespoke Error 404 Causal Node Not Found Page */
        <NotFoundPage
          onNavigateHome={() => handleSelectTab('landing')}
          onLaunchConsole={() => handleSelectTab('console')}
        />
      ) : (
        /* Operational Causal Verification Console View — Strict Zero-Overflow F11 & Desktop Containment (§Rule 14) */
        <div className="flex-1 min-h-0 flex flex-col pt-20 sm:pt-22 px-3 sm:px-6 max-w-[1600px] mx-auto w-full pb-3 overflow-hidden">
          {/* Subheader Toolbar & Telemetry */}
          <div className="flex-shrink-0 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-300 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white font-mono">
                  Interactive Causal Verification Console
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                  GraphBLAS Live
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-sans">
                Observe autonomous agent tool calls intercepted deterministically before execution.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Guided Tour Launcher */}
              <Tooltip content="Tour Guide" shortcut="T" position="bottom">
                <button
                  onClick={() => {
                    playClick();
                    setIsTourOpen(true);
                  }}
                  className="group px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-[11px] font-mono text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-all flex items-center gap-1.5 tactile-btn"
                >
                  <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
                  <span>Tour Guide</span>
                </button>
              </Tooltip>

              {/* Reset Demo State */}
              <Tooltip content="Reset Demo" shortcut="R" position="bottom">
                <button
                  onClick={() => {
                    playClick();
                    handleReset();
                  }}
                  disabled={isResetting}
                  className="group px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-[11px] font-mono text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50 tactile-btn"
                >
                  <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-500 ${isResetting ? 'animate-spin' : 'group-hover:-rotate-180'}`} />
                  <span>Reset Demo</span>
                </button>
              </Tooltip>

              {/* Connect MCP Agent CTA */}
              <Tooltip content="Connect MCP" position="bottom">
                <button
                  onClick={() => {
                    playClick();
                    handleSelectTab('mcp');
                  }}
                  className="group px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-[11px] font-mono transition-all flex items-center gap-1.5 tactile-btn"
                >
                  <span>Connect MCP</span>
                  <McpCableConnectionSvg className="text-white dark:text-slate-950" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* 4-Act Storyline Stepper */}
          <div data-tour="story-stepper" className="flex-shrink-0 rounded-xl overflow-hidden mb-2 border border-slate-300 dark:border-white/10 story-stepper-shell">
            <StoryStepper
              currentAct={currentAct}
              onSelectAct={handleSelectAct}
              loadingAct={loadingAct}
            />
          </div>

          {/* Split Screen Console Container (Terminal + GraphCanvas) — Dynamic single-screen flex expansion */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden console-split-container">
            {/* Left: Terminal HUD (5 Cols) */}
            <div data-tour="terminal-view" className="lg:col-span-5 h-full overflow-hidden border-b lg:border-b-0 border-slate-300 dark:border-white/10">
              <TerminalView
                terminalLogs={terminalLogs}
                activeVerdict={activeVerdict}
                latestAction={latestAction}
                currentAct={currentAct}
                agentState={agentState}
              />
            </div>

            {/* Right: Graph Canvas (7 Cols) */}
            <div data-tour="graph-canvas" className="lg:col-span-7 h-full relative overflow-hidden">
              <GraphCanvas
                graphData={graphData}
                onSelectNode={setSelectedNode}
                selectedNodeId={selectedNode?.id}
                selectedNode={selectedNode}
                onCloseNode={() => setSelectedNode(null)}
                isDarkTheme={isDarkTheme}
              />
            </div>
          </div>

          {/* Guided Tour Overlay — console only, never on landing (§1.6) */}
          <TourGuide
            isOpen={isTourOpen}
            onClose={() => setIsTourOpen(false)}
          />
        </div>
      )}

      {/* 3. System Preferences Modal (Ported from SAHNIRMAAN) */}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        isDarkTheme={isDarkTheme}
        onToggleTheme={() => setIsDarkTheme((d) => !d)}
        onStartTour={() => {
          setActiveTab('console');
          setIsTourOpen(true);
        }}
        onResetDemo={handleReset}
      />

      {/* 4. MCP Agent Connection Configuration Modal */}
      <McpConnectModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
      />
    </div>
  );
}
