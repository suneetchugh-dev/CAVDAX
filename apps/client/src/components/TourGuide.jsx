import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ArrowLeft, X, Check, Compass } from 'lucide-react';
import { playClick } from '../utils/soundFx';

const TOUR_STORAGE_KEY = 'cavdax.tour.completed';

export const getTourStorageKey = (mode = 'console') => `cavdax.tour.completed.${mode}`;

export const resetAllTours = () => {
  try {
    localStorage.removeItem('cavdax.tour.completed');
    localStorage.removeItem('cavdax.tour.completed.console');
    localStorage.removeItem('cavdax.tour.completed.repo');
    localStorage.removeItem('cavdax.tour.completed.dev');
    localStorage.removeItem('cavdax.tour.completed.mcp');
    localStorage.removeItem('cavdax.tour.completed.audit');
    localStorage.removeItem('cavdax.tour.completed.profile');
  } catch {}
};

const CONSOLE_TOUR_STEPS = [
  {
    id: 'story-stepper',
    target: '[data-tour="story-stepper"]',
    title: '4-Act Causal Invalidation Storyline',
    badge: 'STEP 1 OF 4',
    description:
      'Step through the live narrative demonstration: from initial ADR ingestion (Act 1), through cascading invalidation (Act 2), MCP execution hard rejection (Act 3), to verified revalidation (Act 4).',
    tip: 'Click any act or press numbers 1-4 to jump directly into that scenario.',
    placement: 'bottom-right',
    scrollBlock: 'start',
  },
  {
    id: 'graph-canvas',
    target: '[data-tour="graph-canvas"]',
    title: 'FalkorDB Causal Dependency Graph',
    badge: 'STEP 2 OF 4',
    description:
      'Real-time visualization of the Knowledge Graph backed by FalkorDB GraphBLAS matrix engine. Active nodes display in crisp white, invalidated nodes in garnet rose.',
    tip: 'Click any node to open the Node Inspector and inspect its raw Cypher properties.',
    placement: 'left',
    scrollBlock: 'center',
  },
  {
    id: 'terminal-view',
    target: '[data-tour="terminal-view"]',
    title: 'Terminal Metrics & Cognitive Mitosis HUD',
    badge: 'STEP 3 OF 4',
    description:
      'Watch real-time MCP tool invocations, Cypher query logs, and the CavdaxAgentStateIndicator tracking agent cognition (IDLE, REASONING, EXECUTING, VERIFIED, REJECTED).',
    tip: 'Observe how execution requests with stale dependencies are intercepted before touching the disk.',
    placement: 'left',
    scrollBlock: 'center',
  },
  {
    id: 'mcp-gate',
    target: '[data-tour="mcp-gate"]',
    title: 'Enclosed Model Context Protocol (MCP) Gate',
    badge: 'STEP 4 OF 4',
    description:
      'Autonomous agent actions are enclosed within this verification gate. If an action depends on stale or revoked knowledge, it is hard-rejected in < 15ms.',
    tip: 'Compare this to traditional Vector RAG which silently allows stale executions.',
    placement: 'right',
    scrollBlock: 'center',
  },
];


const REPO_TOUR_STEPS = [
  {
    id: 'repo-ribbon',
    target: '[data-tour="repo-ribbon"]',
    title: 'Connected Repository Live Ribbon',
    badge: 'STEP 1 OF 4',
    description:
      'Live status ribbon showing branch selection, commit SHA, and real-time synchronization status with GitHub.',
    tip: 'Switch branches via the dropdown combobox to inspect ADRs on active PRs or staging branches.',
    placement: 'bottom-center',
    scrollBlock: 'start',
  },
  {
    id: 'repo-adrs',
    target: '[data-tour="repo-adrs"]',
    title: 'Repository Architecture Decisions (ADRs)',
    badge: 'STEP 2 OF 4',
    description:
      'Scanned MADR records parsed directly from docs/adrs/*.md. Displays accepted, proposed, and superseded architectural decisions with blast radius metrics.',
    tip: 'Click any ADR item to filter its downstream blast radius on the causal canvas.',
    placement: 'right',
    scrollBlock: 'center',
  },
  {
    id: 'repo-gate',
    target: '[data-tour="repo-gate"]',
    title: 'Model Context Protocol (MCP) Live Gate',
    badge: 'STEP 3 OF 4',
    description:
      'Autonomous agent verification barrier for this repository. Evaluates incoming code change intents against the repository causal graph in < 15ms.',
    tip: 'Simulate tool executions directly in this pane to preview gate decisions.',
    placement: 'right',
    scrollBlock: 'center',
  },
  {
    id: 'repo-canvas',
    target: '[data-tour="repo-canvas"]',
    title: 'Tenant Causal Knowledge Graph',
    badge: 'STEP 4 OF 4',
    description:
      'Real-time dependency graph synthesized from this repository. Nodes represent isolated architectural invariants, dependencies, and code targets.',
    tip: 'Drag nodes or click to inspect Cypher properties and affected code files.',
    placement: 'left',
    scrollBlock: 'center',
  },
];

const AUDIT_TOUR_STEPS = [
  {
    id: 'audit-header',
    target: '[data-tour="audit-header"]',
    title: 'FalkorDB Audit & Verification Stream',
    badge: 'STEP 1 OF 3',
    description:
      'Real-time verification telemetry recorded directly into FalkorDB. Every agent write attempt is evaluated against the Causal Dependency Graph, displaying total recorded actions and live GraphBLAS lookup latency.',
    tip: 'Average traversal and gate evaluation completes in sub-15ms via Sparse BLAS matrix multiplication.',
    placement: 'bottom-center',
    scrollBlock: 'start',
  },
  {
    id: 'audit-filter',
    target: '[data-tour="audit-filter"]',
    title: 'Multi-Repo Scope & Forensic Verdict Filters',
    badge: 'STEP 2 OF 3',
    description:
      'Filter recorded agent actions across connected GitHub repositories or the 4-Act demo sandbox. Slice logs instantly by BLOCKED (stale/revoked ADR dependencies) or APPROVED verdicts.',
    tip: 'Use the text search box to filter by specific target file path or ADR decision ID.',
    placement: 'bottom-center',
    scrollBlock: 'start',
  },
  {
    id: 'audit-ledger',
    target: '[data-tour="audit-ledger"]',
    title: 'Tamper-Evident Action Audit Ledger',
    badge: 'STEP 3 OF 3',
    description:
      'Detailed ledger tracking Action ID, Target File, Decision Status, and Execution Timestamp. Blocked writes highlight exact architectural divergence before any filesystem corruption occurs.',
    tip: 'Compare executed actions with terminal logs to trace deterministic invalidation cascades.',
    placement: 'top-center',
    scrollBlock: 'center',
  },
];

const PROFILE_TOUR_STEPS = [
  {
    id: 'profile-tiers',
    target: '[data-tour="profile-tiers"]',
    title: 'Architecture Tiers & Quota Allocation',
    badge: 'STEP 1 OF 3',
    description:
      'Review your active developer tier and entitlement matrix (Free Sandbox, Pro Enclave, or Enterprise Node). Each tier allocates dedicated GraphBLAS traversal capacity and MCP gate concurrency.',
    tip: 'Sandbox tiers operate on local in-memory FalkorDB instances for zero-friction evaluation.',
    placement: 'bottom-center',
    scrollBlock: 'start',
  },
  {
    id: 'profile-quotas',
    target: '[data-tour="profile-quotas"]',
    title: 'Live GraphBLAS Traversal & Usage Gauges',
    badge: 'STEP 2 OF 3',
    description:
      'Real-time consumption meters tracking Cypher matrix traversals, decision validations, and storage nodes. Live usage syncs with your developer identity.',
    tip: 'Traversals scale with ADR graph depth during causal invalidation dependency resolution.',
    placement: 'top-center',
    scrollBlock: 'center',
  },
  {
    id: 'profile-api-key',
    target: '[data-tour="profile-api-key"]',
    title: 'Cryptographic MCP Agent API Key',
    badge: 'STEP 3 OF 3',
    description:
      'Manage SHA-256 hashed bearer tokens for authenticating autonomous coding agents (Claude Code, Cursor IDE, Windsurf) through the CAVDAX stdio proxy and HTTP gates.',
    tip: 'Rotate keys instantly with one click if an agent deployment credential is retired.',
    placement: 'top-center',
    scrollBlock: 'center',
  },
];



const MCP_TOUR_STEPS = [
  {
    id: 'mcp-overview',
    target: '[data-tour="mcp-overview"]',
    title: 'Model Context Protocol (MCP) Gateway',
    badge: 'STEP 1 OF 3',
    description:
      'Enclose autonomous coding agents behind a deterministic Causal Invalidation Gate. All filesystem writes are intercepted in-flight before touching disk.',
    tip: 'Gate latency is guaranteed < 15ms via FalkorDB GraphBLAS matrix operations.',
    placement: 'bottom-center',
    scrollBlock: 'start',
  },
  {
    id: 'mcp-clients',
    target: '[data-tour="mcp-clients"]',
    title: 'Drop-In Client Configuration Guides',
    badge: 'STEP 2 OF 3',
    description:
      'Zero code refactoring needed. Drop the CAVDAX stdio proxy configuration directly into Claude Code CLI, Cursor IDE, Claude Desktop, or Windsurf.',
    tip: 'Click any client button to instantly view and copy the target config file.',
    placement: 'bottom-right',
    scrollBlock: 'start',
  },
  {
    id: 'mcp-workflow',
    target: '[data-tour="mcp-workflow"]',
    title: '3-Step Enclosed Interception Loop',
    badge: 'STEP 3 OF 3',
    description:
      '1. In-flight tool capture over stdin -> 2. FalkorDB Cypher provenance BFS traversal -> 3. Deterministic 200 OK commit or 403 Hard Rejection.',
    tip: 'Eliminates silent cache rot where agents write code against stale/revoked ADRs.',
    placement: 'right',
    scrollBlock: 'center',
  },
];

const TOUR_STEP_REGISTRY = {
  console: CONSOLE_TOUR_STEPS,
  repo: REPO_TOUR_STEPS,
  dev: CONSOLE_TOUR_STEPS,
  mcp: MCP_TOUR_STEPS,
  audit: AUDIT_TOUR_STEPS,
  profile: PROFILE_TOUR_STEPS,
};

export default function TourGuide({ isOpen, onClose, mode = 'console' }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [cardPos, setCardPos] = useState({ top: 100, left: 100, placement: 'bottom' });
  const cardRef = useRef(null);

  const steps = TOUR_STEP_REGISTRY[mode] || CONSOLE_TOUR_STEPS;
  const step = steps[currentStepIndex] || steps[0];

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen, mode]);

  const updatePositions = useCallback(() => {
    if (!step) return;

    const el = document.querySelector(step.target);
    if (!el) {
      setTargetRect({
        top: window.innerHeight * 0.25,
        left: window.innerWidth * 0.25,
        width: window.innerWidth * 0.5,
        height: window.innerHeight * 0.5,
      });
      setCardPos({
        top: window.innerHeight * 0.4,
        left: Math.max(16, (window.innerWidth - 350) / 2),
        placement: 'bottom',
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardWidth = Math.min(350, vw - 32);
    const cardHeight = cardRef.current?.offsetHeight || 260;
    const gap = 16;
    const padding = 16;
    const navbarOffset = 76; // Keep clear of the floating navigation bar
    const margin = 10; // Spotlight cut-out margin

    // Strict Collision Detector: Does candidate [cTop, cLeft] intersect with spotlight [targetRect]?
    const collidesWithSpotlight = (cTop, cLeft) => {
      const cRight = cLeft + cardWidth;
      const cBottom = cTop + cardHeight;
      return !(
        cRight < (rect.left - margin) ||
        cLeft > (rect.right + margin) ||
        cBottom < (rect.top - margin) ||
        cTop > (rect.bottom + margin)
      );
    };

    const clampTop = (t) => Math.max(padding + navbarOffset, Math.min(vh - cardHeight - padding, t));
    const clampLeft = (l) => Math.max(padding, Math.min(vw - cardWidth - padding, l));

    // Calculate the 4 primary unhighlighted gutter slots around the target element
    // Slot 1: RIGHT of element (opposing column on desktop/laptop)
    const rightSlot = {
      name: 'right',
      top: clampTop(Math.max(rect.top, padding + navbarOffset)),
      left: rect.right + gap,
      fits: (vw - rect.right) >= (cardWidth + padding),
    };

    // Slot 2: LEFT of element (opposing column on desktop/laptop)
    const leftSlot = {
      name: 'left',
      top: clampTop(Math.max(rect.top, padding + navbarOffset)),
      left: rect.left - gap - cardWidth,
      fits: rect.left >= (cardWidth + padding),
    };

    // Slot 3: BELOW element
    const belowSlot = {
      name: 'bottom',
      top: rect.bottom + gap,
      left: clampLeft(
        step.placement === 'bottom-right'
          ? rect.right - cardWidth
          : step.placement === 'bottom-left'
          ? rect.left
          : rect.left + rect.width / 2 - cardWidth / 2
      ),
      fits: (vh - rect.bottom) >= (cardHeight + padding),
    };

    // Slot 4: ABOVE element
    const aboveSlot = {
      name: 'top',
      top: rect.top - gap - cardHeight,
      left: clampLeft(
        step.placement === 'top-right'
          ? rect.right - cardWidth
          : step.placement === 'top-left'
          ? rect.left
          : rect.left + rect.width / 2 - cardWidth / 2
      ),
      fits: (rect.top - navbarOffset) >= (cardHeight + padding),
    };

    // Rank candidates by declared preference
    const pref = step.placement || 'bottom-center';
    let candidates = [];

    if (pref.startsWith('right')) {
      candidates = [rightSlot, leftSlot, belowSlot, aboveSlot];
    } else if (pref.startsWith('left')) {
      candidates = [leftSlot, rightSlot, belowSlot, aboveSlot];
    } else if (pref.startsWith('top')) {
      candidates = [aboveSlot, belowSlot, rightSlot, leftSlot];
    } else {
      // Default: below first, but if element is tall (>50% vh), prioritize opposing horizontal columns
      if (rect.height > vh * 0.45) {
        // Element takes up the vertical height on laptop -> test horizontal gutters first
        candidates = rect.left > vw * 0.4
          ? [leftSlot, rightSlot, belowSlot, aboveSlot]
          : [rightSlot, leftSlot, belowSlot, aboveSlot];
      } else {
        candidates = [belowSlot, aboveSlot, rightSlot, leftSlot];
      }
    }

    // Pick the first slot that physically fits in viewport and does NOT collide with the spotlight
    let chosen = candidates.find(c => c.fits && !collidesWithSpotlight(c.top, c.left));

    // Fallback: If no slot fits with full clearance, test clamping without collision
    if (!chosen) {
      chosen = candidates.find(c => !collidesWithSpotlight(clampTop(c.top), clampLeft(c.left)));
    }

    // Final safety fallback: pick candidate that minimizes overlap
    if (!chosen) {
      chosen = candidates[0];
    }

    const finalTop = clampTop(chosen.top);
    const finalLeft = clampLeft(chosen.left);

    setCardPos({ top: finalTop, left: finalLeft, placement: chosen.name });
  }, [step]);

  useEffect(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Universal Tour Guide Scroll Rule:
      // An element is ONLY "already comfortably visible" if BOTH:
      // 1. Its top is clear of the floating navbar: rect.top >= 80px
      // 2. Its bottom does NOT extend below the viewport fold: rect.bottom <= vh - 30px
      // (If the element is taller than viewport, at least its top must be comfortably in view)
      const fitsInViewport = rect.height <= (vh - 110);
      const isAlreadyComfortablyVisible = fitsInViewport
        ? (rect.top >= 80 && rect.bottom <= vh - 30)
        : (rect.top >= 80 && rect.top <= 140);

      if (!isAlreadyComfortablyVisible) {
        if (rect.top < 80) {
          // Element is cut off at the top behind navbar -> scroll to start
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (rect.bottom > vh - 30 || rect.top > vh * 0.5) {
          // Element is a bit below or cut off at the bottom -> scroll to center so the whole highlighted box is visible
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    updatePositions();

    // Smooth RAF tracking loop for 520ms to smoothly interpolate while scrollIntoView animates
    let startTime = performance.now();
    let rafId;
    const track = (now) => {
      updatePositions();
      if (now - startTime < 520) {
        rafId = requestAnimationFrame(track);
      }
    };
    rafId = requestAnimationFrame(track);

    const handleResize = () => updatePositions();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, step, updatePositions]);

  const handleNext = () => {
    playClick();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    playClick();
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    localStorage.setItem(getTourStorageKey(mode), 'true');
    if (onClose) onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape' || e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99990] overflow-hidden select-none">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="cavdax-tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="12"
                ry="12"
                fill="black"
                style={{
                  transition: 'all 520ms cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              />
            )}
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.85)"
          mask="url(#cavdax-tour-spotlight-mask)"
          className="pointer-events-auto cursor-pointer"
          onClick={handleComplete}
        />

        {targetRect && (
          <rect
            x={targetRect.left - 6}
            y={targetRect.top - 6}
            width={targetRect.width + 12}
            height={targetRect.height + 12}
            rx="12"
            ry="12"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="6 4"
            style={{
              transition: 'all 520ms cubic-bezier(0.25, 1, 0.5, 1)',
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))',
            }}
          />
        )}
      </svg>

      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: `${cardPos.top}px`,
          left: `${cardPos.left}px`,
          width: '350px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 90px)',
          zIndex: 99995,
          transition: 'top 400ms cubic-bezier(0.25, 1, 0.5, 1), left 400ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        className="bg-[#0B0D11] border border-white/20 rounded-xl p-4 shadow-2xl backdrop-blur-xl pointer-events-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-5 items-center px-2 rounded bg-white/10 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
              {step.badge}
            </span>
          </div>

          <button
            onClick={handleComplete}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Exit Tour (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div key={currentStepIndex} className="py-3 transition-all duration-300 ease-out animate-in fade-in slide-in-from-right-1">
          <h4 className="text-sm font-bold text-white tracking-tight mb-1.5 flex items-center gap-1.5 font-mono">
            <Compass className="w-3.5 h-3.5 text-white shrink-0" />
            {step.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>

          {step.tip && (
            <div className="mt-3 p-2.5 rounded-lg bg-black/50 border border-white/10 text-[11px] text-slate-300 flex items-start gap-2 font-mono">
              <span className="text-[9px] uppercase font-bold text-black shrink-0 px-1 py-0.5 rounded bg-white">
                PRO-TIP
              </span>
              <span>{step.tip}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            onClick={handleComplete}
            className="text-[11px] font-mono font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playClick();
                  setCurrentStepIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-5 bg-white'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-white hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              {currentStepIndex === steps.length - 1 ? (
                <>
                  Finish
                  <Check className="w-3 h-3" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-500">
          <span>Shortcuts:</span>
          <div className="flex items-center gap-2">
            <span>[←] Prev</span>
            <span>[→/↵] Next</span>
            <span>[Esc] Exit</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
