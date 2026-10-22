import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

/* ─── 4 Causal Architecture Steps (Clean, Minimal, Zero Cyan in Light Mode) ─── */
const SOLUTION_STEPS = [
  {
    id: 'step-ingestion',
    indexStr: '01',
    title: 'ADR & Git Ingestion',
    punchline: 'Autonomous AST parser extracts markdown frontmatter and commit diffs into directed causal vertices.',
    accentDark: '#06b6d4',
    accentLight: '#0f172a', // Deep Architectural Slate/Steel in light mode
  },
  {
    id: 'step-graphblas',
    indexStr: '02',
    title: 'FalkorDB GraphBLAS Engine',
    punchline: 'In-memory sparse adjacency matrix multiplication traverses 100,000+ causal dependencies in 1.84ms.',
    accentDark: '#d9a353',
    accentLight: '#b45309', // Deep Bronze in light mode
  },
  {
    id: 'step-mcp-gate',
    indexStr: '03',
    title: 'Enclosed MCP Firewall Gate',
    punchline: 'Every agent mutation is intercepted at the protocol layer and hard-rejected if grounded in stale ancestry.',
    accentDark: '#f43f5e',
    accentLight: '#be123c', // Deep Wine in light mode
  },
  {
    id: 'step-revalidation',
    indexStr: '04',
    title: 'Continuous Revalidation Loop',
    punchline: 'Deterministic causal feedback guides the agent to self-heal and write verified patches to disk.',
    accentDark: '#10b981',
    accentLight: '#047857', // Deep Emerald in light mode
  },
];

/* ─── Infographic 1: Git & ADR Ingestion (Hairline Outlines, Zero Heavy Fills) ──── */
function WidescreenVisualIngestion() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      <svg className="w-full h-full max-h-[360px]" viewBox="0 0 900 260" fill="none">
        {/* ── 1. Git Trunk Stream ── */}
        <g transform="translate(60, 65)">
          <path d="M 0 50 H 210" className="stroke-slate-300 dark:stroke-white/20" strokeWidth="1.8" strokeDasharray="5 5" />
          <text x="220" y="54" className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px]">main</text>

          {/* Diverging Feature Branch: Premium Slate-950/Steel in Light Mode */}
          <path d="M 40 50 C 75 50, 95 105, 140 105 H 210" className="stroke-slate-950 dark:stroke-cyan-400" strokeWidth="2" />
          <text x="220" y="109" className="fill-slate-950 dark:fill-cyan-400 font-mono text-[10px] font-bold">ADR-002</text>

          <circle cx="40" cy="50" r="7.5" className="fill-transparent stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.8" />
          <text x="40" y="72" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono text-[9px]">c3a8f</text>

          <circle cx="140" cy="105" r="9.5" className="fill-transparent stroke-slate-950 dark:stroke-cyan-400" strokeWidth="2" />
          <circle cx="140" cy="105" r="3.5" className="fill-slate-950 dark:fill-cyan-400" />
        </g>

        {/* ── Connecting Bus to Parser ── */}
        <path d="M 330 115 H 390" className="stroke-slate-900/40 dark:stroke-cyan-400/40" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* ── 2. Optical Parser Aperture (Center) ── */}
        <g transform="translate(390, 65)">
          <rect x="0" y="10" width="115" height="120" rx="14" className="fill-transparent stroke-slate-300 dark:stroke-white/15" strokeWidth="1.2" />
          
          <g transform="translate(57, 58)">
            <circle r="20" className="fill-transparent stroke-slate-900/40 dark:stroke-cyan-400/40" strokeWidth="1.5" />
            <text x="0" y="4.5" textAnchor="middle" className="fill-slate-950 dark:fill-cyan-300 font-mono text-xs font-bold">AST</text>
          </g>

          <motion.line
            x1="12" y1="20" x2="103" y2="20"
            className="stroke-slate-950 dark:stroke-cyan-400"
            strokeWidth="1.8"
            animate={{ y1: [20, 118, 20], y2: [20, 118, 20] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>

        {/* ── Connecting Bus to Output ── */}
        <path d="M 505 115 H 565" className="stroke-slate-900/40 dark:stroke-cyan-400/40" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* ── 3. Directed Causal Topology (Right) ── */}
        <g transform="translate(565, 65)">
          {/* Active Node ADR-002: Premium Monochromatic Steel */}
          <g transform="translate(45, 50)">
            <circle r="22" className="fill-transparent stroke-slate-950 dark:stroke-cyan-400" strokeWidth="2" />
            <circle r="6" className="fill-slate-950 dark:fill-cyan-400" />
            <text x="0" y="38" textAnchor="middle" className="fill-slate-950 dark:fill-white font-mono text-[10.5px] font-bold">ADR-002</text>
          </g>

          {/* Directed Invalidation Edge */}
          <path d="M 80 50 H 155" stroke="#be123c" strokeWidth="1.8" />
          <polygon points="155,50 147,46 147,54" fill="#be123c" />

          {/* Superseded Node ADR-001: Clean Solid Monochromatic Outline */}
          <g transform="translate(185, 50)">
            <circle 
              r="20" 
              className="fill-transparent stroke-slate-950 dark:stroke-white/80" 
              strokeWidth="1.8" 
            />
            {/* X cross mark: crisp architectural cross */}
            <line x1="-6.5" y1="-6.5" x2="6.5" y2="6.5" stroke="#be123c" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="6.5" y1="-6.5" x2="-6.5" y2="6.5" stroke="#be123c" strokeWidth="1.8" strokeLinecap="round" />
            <text x="0" y="36" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 font-mono text-[10px] font-medium">ADR-001</text>
            <text x="0" y="48" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 font-mono text-[8.5px] font-bold">SUPERSEDED</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ─── Infographic 2: FalkorDB GraphBLAS Engine (Hairline Outlines, No Heavy Fills) ── */
function WidescreenVisualGraphBLAS() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      <svg className="w-full h-full max-h-[360px]" viewBox="0 0 900 260" fill="none">
        {/* ── 1. Sparse Adjacency Matrix CSR ── */}
        <g transform="translate(70, 35)">
          <rect x="0" y="10" width="180" height="175" rx="14" className="fill-transparent stroke-amber-600/30 dark:stroke-[#d9a353]/30" strokeWidth="1.2" />
          
          {[
            [1, 0, 1, 0],
            [0, 1, 0, 1],
            [1, 0, 0, 1],
            [0, 1, 1, 0],
          ].map((row, rIdx) =>
            row.map((val, cIdx) => (
              <g key={`${rIdx}-${cIdx}`} transform={`translate(${14 + cIdx * 40}, ${24 + rIdx * 37})`}>
                <motion.rect 
                  width="30" height="28" rx="5" 
                  className={val === 1 
                    ? 'fill-amber-500/10 stroke-amber-600 dark:stroke-[#d9a353]/50' 
                    : 'fill-transparent stroke-slate-200 dark:stroke-white/5'
                  } 
                  strokeWidth="0.8"
                  animate={val === 1 ? { opacity: [0.75, 1, 0.75] } : {}}
                  transition={{ duration: 2.2, repeat: Infinity, delay: (rIdx + cIdx) * 0.18 }}
                />
                <text 
                  x="15" y="19" textAnchor="middle" 
                  className={val === 1 ? 'fill-amber-900 dark:fill-[#d9a353] font-bold font-mono text-xs' : 'fill-slate-400 font-mono text-[10px]'}
                >
                  {val}
                </text>
              </g>
            ))
          )}
          <text x="90" y="202" textAnchor="middle" className="fill-amber-800 dark:fill-[#d9a353] font-mono text-[9.5px] font-bold uppercase tracking-wider">
            Sparse Matrix [A]
          </text>
        </g>

        {/* ── Connecting Dotted Bus 1: Matrix to Semiring Kernel ── */}
        <path d="M 260 115 H 380" className="stroke-amber-600/40 dark:stroke-[#d9a353]/40" strokeWidth="1.5" strokeDasharray="5 5" />
        <motion.circle
          r="3"
          className="fill-amber-600 dark:fill-[#d9a353]"
          animate={{ cx: [260, 380], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          cy="115"
        />

        {/* ── 2. Semiring Operator Kernel ── */}
        <g transform="translate(430, 115)">
          <motion.circle
            r="42"
            className="stroke-amber-600/40 dark:stroke-[#d9a353]/40"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          />
          <circle r="30" className="fill-transparent stroke-amber-600 dark:stroke-[#d9a353]" strokeWidth="2" />
          
          <text x="0" y="7" textAnchor="middle" className="fill-amber-900 dark:fill-[#d9a353] font-mono text-xl font-black">
            ⊕.⊗
          </text>
          
          <text x="0" y="60" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 font-mono text-[10px] font-semibold">
            Semiring Kernel
          </text>
        </g>

        {/* ── Connecting Dotted Bus 2: Semiring Kernel to Latency Benchmark ── */}
        <path d="M 480 115 H 610" className="stroke-amber-600/40 dark:stroke-[#d9a353]/40" strokeWidth="1.5" strokeDasharray="5 5" />
        <motion.circle
          r="3"
          className="fill-amber-600 dark:fill-[#d9a353]"
          animate={{ cx: [480, 610], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          cy="115"
        />

        {/* ── 3. Latency Metric ── */}
        <g transform="translate(620, 48)">
          <rect x="0" y="10" width="190" height="135" rx="14" className="fill-transparent stroke-emerald-600/30 dark:stroke-emerald-500/30" strokeWidth="1.2" />
          
          <g transform="translate(95, 65)">
            <text x="0" y="0" textAnchor="middle" className="fill-slate-950 dark:fill-white font-mono text-3xl font-black">1.84ms</text>
            <text x="0" y="20" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wide">
              Traversal Latency
            </text>
          </g>

          <text x="95" y="120" textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">
            100,000+ Vertices
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ─── Infographic 3: Enclosed MCP Protocol Firewall (Static Crisp Hexagon, No Pulsing, Hairline Outlines) ─ */
function WidescreenVisualMcpGate() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      <svg className="w-full h-full max-h-[360px]" viewBox="0 0 900 260" fill="none">
        {/* ── 1. Agent Tool Call ── */}
        <g transform="translate(60, 58)">
          <rect x="0" y="10" width="180" height="125" rx="14" className="fill-transparent stroke-slate-300 dark:stroke-white/15" strokeWidth="1.2" />
          
          <g transform="translate(90, 45)">
            <circle r="16" className="fill-transparent stroke-slate-300 dark:stroke-white/20" strokeWidth="1.5" />
            <text x="0" y="3.5" textAnchor="middle" className="fill-slate-950 dark:fill-white font-mono text-[9px] font-bold">AGENT</text>
          </g>

          <g transform="translate(90, 85)" className="font-mono text-center">
            <text x="0" y="0" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-bold">apply_code_change()</text>
            <text x="0" y="16" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-[9px]">grounding: STALE</text>
          </g>
        </g>

        {/* ── Connecting Dotted Bus 1: Agent to MCP Firewall Gate ── */}
        <path d="M 250 120 H 360" stroke="#be123c" strokeWidth="1.8" strokeDasharray="5 5" />
        <motion.circle
          r="3"
          fill="#be123c"
          animate={{ cx: [250, 360], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          cy="120"
        />

        {/* ── 2. MCP Shield Barrier (Static Crisp Hexagon, No Pulsing, Architectural Padlock) ── */}
        <g transform="translate(430, 120)">
          {/* Static, high-precision outer hexagon (No cheesy pulsing animation) */}
          <polygon
            points="0,-52 46,-26 46,26 0,52 -46,26 -46,-26"
            className="fill-transparent stroke-rose-600 dark:stroke-rose-500"
            strokeWidth="1.8"
          />

          {/* Clean Integrated Wireframe Padlock Icon Inside Hexagon */}
          <g transform="translate(0, -6)">
            {/* Shackle */}
            <path d="M -8 0 V -8 A 8 8 0 0 1 8 -8 V 0" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Padlock Body: Clean Outline, No Heavy Fill */}
            <rect x="-12" y="0" width="24" height="18" rx="4" className="fill-rose-500/10 stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.5" />
            <circle cx="0" cy="7" r="2" className="fill-rose-600 dark:fill-rose-400" />
            <line x1="0" y1="7" x2="0" y2="12" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Clean Typography Within Hexagon */}
          <text x="0" y="24" textAnchor="middle" className="fill-rose-700 dark:fill-rose-400 font-mono text-[9px] font-bold tracking-wider uppercase">
            LOCKED
          </text>

          <text x="0" y="74" textAnchor="middle" className="fill-rose-700 dark:fill-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            MCP Protocol Gate
          </text>
        </g>

        {/* ── Connecting Dotted Bus 2: Gate Rejection to Quarantine ── */}
        <path d="M 500 120 H 610" stroke="#be123c" strokeWidth="1.8" strokeDasharray="5 5" />
        <motion.circle
          r="3"
          fill="#be123c"
          animate={{ cx: [500, 610], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          cy="120"
        />

        {/* ── 3. Hard Rejection (Clean Wireframe Badge) ── */}
        <g transform="translate(620, 58)">
          <rect x="0" y="10" width="190" height="125" rx="14" className="fill-transparent stroke-rose-600/30 dark:stroke-rose-500/30" strokeWidth="1.2" />
          
          <g transform="translate(95, 50)">
            <rect x="-55" y="-14" width="110" height="28" rx="6" className="fill-transparent stroke-rose-600 dark:stroke-rose-500" strokeWidth="1.5" />
            <text x="0" y="4.5" textAnchor="middle" className="fill-rose-700 dark:fill-rose-400 font-mono text-[11px] font-black">
              403 FORBIDDEN
            </text>
          </g>

          <g transform="translate(95, 96)">
            <rect x="-65" y="-10" width="130" height="20" rx="4" className="fill-transparent stroke-slate-300 dark:stroke-white/10" strokeWidth="1" strokeDasharray="3 3" />
            <text x="0" y="3.5" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 font-mono text-[9px] font-bold uppercase tracking-wider">
              0 Bytes Written to Disk
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ─── Infographic 4: Continuous Revalidation Loop (Wireframe Architecture) ─────── */
function WidescreenVisualRevalidation() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      <svg className="w-full h-full max-h-[360px]" viewBox="0 0 900 260" fill="none">
        {/* ── 1. Left Pillar: Invalidation Diagnosis Feedback ── */}
        <g transform="translate(70, 50)">
          <rect x="0" y="10" width="180" height="135" rx="14" className="fill-transparent stroke-emerald-600/30 dark:stroke-emerald-500/30" strokeWidth="1.2" />
          
          <g transform="translate(90, 50)">
            {/* Precision Architectural Diamond Vertex Anchor */}
            <polygon
              points="0,-16 16,0 0,16 -16,0"
              className="fill-transparent stroke-emerald-600 dark:stroke-emerald-400"
              strokeWidth="1.8"
            />
            <line x1="-5" y1="0" x2="5" y2="0" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.5" />
            <line x1="0" y1="-5" x2="0" y2="5" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.5" />
            <text x="0" y="32" textAnchor="middle" className="fill-emerald-800 dark:fill-emerald-400 font-mono text-[10.5px] font-bold">ADR-002</text>
          </g>

          <text x="90" y="116" textAnchor="middle" className="fill-slate-500 font-mono text-[9px] font-semibold">
            Active Ancestor Truth
          </text>
        </g>

        {/* ── Forward Dotted Track ── */}
        <path d="M 260 115 H 370" className="stroke-emerald-600/40 dark:stroke-emerald-500/40" strokeWidth="1.8" strokeDasharray="5 5" />
        <motion.circle
          r="3"
          className="fill-emerald-600 dark:fill-emerald-400"
          animate={{ cx: [260, 370], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          cy="115"
        />

        {/* ── 2. Center Pillar: Autonomous Self-Healing Synthesis Core ── */}
        <g transform="translate(440, 115)">
          <motion.circle
            r="44"
            className="stroke-emerald-600/30 dark:stroke-emerald-500/30"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          />
          <circle r="32" className="fill-transparent stroke-emerald-600 dark:stroke-emerald-500" strokeWidth="2" />

          {/* Healing Checkmark Icon */}
          <path d="M -8 1 L -2 7 L 10 -5" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          <text x="0" y="60" textAnchor="middle" className="fill-emerald-800 dark:fill-emerald-400 font-mono text-[10.5px] font-bold uppercase tracking-wider">
            Self-Healed
          </text>
          <text x="0" y="74" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">
            DEC-103 Synthesized
          </text>
        </g>

        {/* ── Return Dotted Track to Commit ── */}
        <path d="M 510 115 H 620" className="stroke-emerald-600/40 dark:stroke-emerald-500/40" strokeWidth="1.8" strokeDasharray="5 5" />
        <motion.circle
          r="3"
          className="fill-emerald-600 dark:fill-emerald-400"
          animate={{ cx: [510, 620], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          cy="115"
        />

        {/* ── 3. Right Pillar: Permitted Write-Through & Signed Audit (Wireframe) ── */}
        <g transform="translate(630, 50)">
          <rect x="0" y="10" width="190" height="135" rx="14" className="fill-transparent stroke-emerald-600/30 dark:stroke-emerald-500/30" strokeWidth="1.2" />
          
          <g transform="translate(95, 50)">
            <rect x="-42" y="-14" width="84" height="28" rx="6" className="fill-transparent stroke-emerald-600 dark:stroke-emerald-500" strokeWidth="1.5" />
            <text x="0" y="4.5" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 font-mono text-xs font-black">
              200 OK
            </text>
          </g>

          <g transform="translate(95, 95)" className="font-mono text-center">
            <text x="0" y="0" textAnchor="middle" className="fill-slate-900 dark:fill-white text-[10px] font-bold">
              DISK MUTATED
            </text>
            <text x="0" y="16" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[9px] font-semibold">
              Signed Audit Log
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ─── Main CausalSolutionScroller Component (Curved 3D Rolling Cylinder Window) ── */
export default function CausalSolutionScroller() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Smooth scroll-driven backdrop opacity: Fades in early as user approaches section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Precise, smooth blur & opacity envelope (Smooth in & out transition)
  const backdropOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.28, 0.72, 0.88, 1],
    [0, 0, 1, 1, 0, 0],
    { clamp: true }
  );

  const blurPx = useTransform(
    scrollYProgress,
    [0, 0.12, 0.28, 0.72, 0.88, 1],
    [0, 0, 40, 40, 0, 0],
    { clamp: true }
  );

  const backdropFilter = useTransform(blurPx, (v) => `blur(${v.toFixed(1)}px)`);

  const backdropVisibility = useTransform(
    backdropOpacity,
    (val) => (val > 0.002 ? 'visible' : 'hidden')
  );

  // Strict Lock, Direction, and Transition Refs
  const isLockedRef = useRef(false);
  const isExitingRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const activeStepRef = useRef(0);
  const lastScrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);

  // Keep activeStepRef in sync with state
  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  // Safety unlock on unmount
  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.start();
      window.__lenis.isLocked = false;
    }
    return () => {
      isLockedRef.current = false;
      isExitingRef.current = false;
      if (window.__lenis) {
        window.__lenis.start();
        window.__lenis.isLocked = false;
      }
    };
  }, []);

  // 1. Precise Viewport Docking: Lock IN when reached, lock OUT only after seeing all cards
  useEffect(() => {
    const handleScrollCheck = () => {
      if (isExitingRef.current) return;
      const el = containerRef.current;
      if (!el) return;

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY >= lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // If user has scrolled completely out of view of the section, clear flags
      if (rect.bottom < -100 || rect.top > viewportHeight + 100) {
        if (isLockedRef.current) {
          isLockedRef.current = false;
          setIsLocked(false);
          if (window.__lenis) {
            window.__lenis.start();
            window.__lenis.isLocked = false;
          }
        }
        isExitingRef.current = false;
        return;
      }

      // Check if section is centered / docked in viewport
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const isDocked = Math.abs(sectionCenter - viewportCenter) < viewportHeight * 0.35;

      if (!isLockedRef.current && isDocked) {
        isLockedRef.current = true;
        setIsLocked(true);
        if (scrollingDown) {
          // Approaching from TOP (Bento -> Causal): Start at Card 01
          setActiveStep(0);
        } else {
          // Approaching from BOTTOM (FAQ -> Causal): Start at Card 04
          setActiveStep(SOLUTION_STEPS.length - 1);
        }
        if (window.__lenis) {
          window.__lenis.stop();
          window.__lenis.scrollTo(el, { immediate: true, force: true });
        }
      }
    };

    window.addEventListener('scroll', handleScrollCheck, { passive: true });
    if (window.__lenis) {
      window.__lenis.on('scroll', handleScrollCheck);
    }
    handleScrollCheck();

    return () => {
      window.removeEventListener('scroll', handleScrollCheck);
      if (window.__lenis) {
        window.__lenis.off('scroll', handleScrollCheck);
      }
    };
  }, []);

  // 2. Guaranteed Step Lock-In & Natural Directional Exit (Wheel, Touchpad, Touch)
  useEffect(() => {
    const exitDownward = () => {
      if (isExitingRef.current) return;
      isTransitioningRef.current = true;
      isExitingRef.current = true;
      isLockedRef.current = false;
      setIsLocked(false);

      if (window.__lenis) {
        window.__lenis.start();
        window.__lenis.isLocked = false;
        window.__lenis.scrollTo('#faq-section', {
          duration: 0.85,
          force: true,
          onComplete: () => {
            isExitingRef.current = false;
            isTransitioningRef.current = false;
          },
        });
      } else {
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
      }
      setTimeout(() => {
        isExitingRef.current = false;
        isTransitioningRef.current = false;
      }, 950);
    };

    const exitUpward = () => {
      if (isExitingRef.current) return;
      const el = containerRef.current;
      isTransitioningRef.current = true;
      isExitingRef.current = true;
      isLockedRef.current = false;
      setIsLocked(false);

      const targetY = el ? Math.max(0, el.offsetTop - window.innerHeight * 0.75) : 0;

      if (window.__lenis) {
        window.__lenis.start();
        window.__lenis.isLocked = false;
        window.__lenis.scrollTo(targetY, {
          duration: 0.85,
          force: true,
          onComplete: () => {
            isExitingRef.current = false;
            isTransitioningRef.current = false;
          },
        });
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
      setTimeout(() => {
        isExitingRef.current = false;
        isTransitioningRef.current = false;
      }, 950);
    };

    const handleWheel = (e) => {
      if (isExitingRef.current) return;

      const isHorizontalSwipe = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const dominantDelta = isHorizontalSwipe ? e.deltaX : e.deltaY;
      if (Math.abs(dominantDelta) < 10) return;

      if (isLockedRef.current) {
        if (e.cancelable) e.preventDefault();
        if (isTransitioningRef.current) return;

        const current = activeStepRef.current;

        if (dominantDelta > 10) {
          // Scrolling DOWN / Swiping LEFT: 01 -> 02 -> 03 -> 04
          if (current < SOLUTION_STEPS.length - 1) {
            isTransitioningRef.current = true;
            setActiveStep((prev) => prev + 1);
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 360);
          } else {
            // On Card 04 (final card): Exit smoothly downward to FAQ
            exitDownward();
          }
        } else if (dominantDelta < -10) {
          // Scrolling UP / Swiping RIGHT: 04 -> 03 -> 02 -> 01
          if (current > 0) {
            isTransitioningRef.current = true;
            setActiveStep((prev) => prev - 1);
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 360);
          } else {
            // On Card 01 (first card): Exit smoothly upward to Bento
            exitUpward();
          }
        }
      }
    };

    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      if (isExitingRef.current || !isLockedRef.current || isTransitioningRef.current) return;
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = touchStartYRef.current - currentY;
      const diffX = touchStartXRef.current - currentX;

      const isHorizontal = Math.abs(diffX) > Math.abs(diffY);
      const diff = isHorizontal ? diffX : diffY;
      if (Math.abs(diff) < 30) return;

      const current = activeStepRef.current;

      if (diff > 30) {
        // Swipe UP / Scroll DOWN
        if (current < SOLUTION_STEPS.length - 1) {
          if (e.cancelable) e.preventDefault();
          isTransitioningRef.current = true;
          setActiveStep((prev) => prev + 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 360);
        } else {
          if (e.cancelable) e.preventDefault();
          exitDownward();
        }
      } else if (diff < -30) {
        // Swipe DOWN / Scroll UP
        if (current > 0) {
          if (e.cancelable) e.preventDefault();
          isTransitioningRef.current = true;
          setActiveStep((prev) => prev - 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 360);
        } else {
          if (e.cancelable) e.preventDefault();
          exitUpward();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // 3. Complete Keyboard Navigation (Arrow Keys, Page Up/Down, Space to navigate)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isExitingRef.current) return;

      // Ignore if user is currently typing in an input, textarea, or contentEditable element
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (!isLockedRef.current) return;
      const current = activeStepRef.current;

      // Dedicated Horizontal Card Navigation (Left / Right Arrow)
      if (e.key === 'ArrowRight') {
        if (current < SOLUTION_STEPS.length - 1) {
          e.preventDefault();
          setActiveStep((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (current > 0) {
          e.preventDefault();
          setActiveStep((prev) => prev - 1);
        }
      }
      // Vertical Keyboard Browsing (ArrowDown, PageDown, Space)
      else if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        if (current < SOLUTION_STEPS.length - 1) {
          setActiveStep((prev) => prev + 1);
        } else {
          // Lock OUT downward to FAQ
          isExitingRef.current = true;
          isLockedRef.current = false;
          setIsLocked(false);

          if (window.__lenis) {
            window.__lenis.start();
            window.__lenis.isLocked = false;
            window.__lenis.scrollTo('#faq-section', {
              duration: 0.85,
              force: true,
              onComplete: () => {
                isExitingRef.current = false;
              },
            });
          } else {
            document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
          }
          setTimeout(() => {
            isExitingRef.current = false;
          }, 950);
        }
      }
      // Vertical Keyboard Browsing (ArrowUp, PageUp, Shift+Space)
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        if (current > 0) {
          setActiveStep((prev) => prev - 1);
        } else {
          // Lock OUT upward to Bento
          const el = containerRef.current;
          isExitingRef.current = true;
          isLockedRef.current = false;
          setIsLocked(false);

          const targetY = el ? Math.max(0, el.offsetTop - window.innerHeight * 0.75) : 0;

          if (window.__lenis) {
            window.__lenis.start();
            window.__lenis.isLocked = false;
            window.__lenis.scrollTo(targetY, {
              duration: 0.85,
              force: true,
              onComplete: () => {
                isExitingRef.current = false;
              },
            });
          } else {
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
          setTimeout(() => {
            isExitingRef.current = false;
          }, 950);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentStep = SOLUTION_STEPS[activeStep];

  const renderVisual = (index) => {
    switch (index) {
      case 0: return <WidescreenVisualIngestion />;
      case 1: return <WidescreenVisualGraphBLAS />;
      case 2: return <WidescreenVisualMcpGate />;
      case 3: return <WidescreenVisualRevalidation />;
      default: return null;
    }
  };

  return (
    <section
      ref={containerRef}
      id="causal-loop-section"
      tabIndex={0}
      role="region"
      aria-label="Causal Architecture Steps"
      className="relative w-full min-h-screen py-10 sm:py-16 px-4 sm:px-8 flex flex-col items-center justify-center z-[60] border-none overflow-hidden outline-none focus:outline-none"
    >
      {/* ── Fixed Heavy Dimming & Blur Backdrop (Navbar & Page Fully Disappear) ── */}
      <motion.div 
        style={{
          opacity: backdropOpacity,
          visibility: backdropVisibility,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
        }}
        className="fixed inset-0 z-[70] bg-white/94 dark:bg-[#07090b]/96 pointer-events-none will-change-[opacity,backdrop-filter]"
      />

      {/* ── Fullscreen Open Stage Container ── */}
      <div className="relative w-full min-h-[82vh] max-w-[1400px] 2xl:max-w-[1600px] flex flex-col justify-between items-center z-[80] my-auto">

        {/* ── Top HUD Navigation: Active Stage Name & Pill Jumpers (Single Cue) ── */}
        <div className="w-full flex items-center justify-between border-b border-slate-200/80 dark:border-white/5 pb-4">
          <span className="font-mono text-xs font-bold text-slate-950 dark:text-white tracking-widest uppercase">
            {currentStep.title}
          </span>

          {/* Minimal Numbered Tags (01, 02, 03, 04) - Only Cue Used */}
          <div className="flex items-center gap-1.5">
            {SOLUTION_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(idx);
                }}
                className={`px-3.5 py-1 rounded-full font-mono text-xs font-semibold transition-all duration-200 ${
                  idx === activeStep 
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {step.indexStr}
              </button>
            ))}
          </div>
        </div>

        {/* ── Center Stage: 3D Rolling Cylindrical Sliding Window (Tilted Grid Hero Model) ── */}
        <div className="w-full flex-1 flex flex-col items-center justify-center my-4 relative">
          
          {/* Subtle Ambient Specular Glow Behind Center Stage (Theme Calibrated) */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-20 transition-all duration-700 blur-3xl -z-10"
            style={{
              background: `radial-gradient(circle at 50% 50%, var(--tw-prose-accent, ${currentStep.accentDark}) 0%, transparent 65%)`
            }}
          />

          {/* 3D Perspective Rolling Stage Container */}
          <div 
            className="w-full h-[380px] sm:h-[420px] relative flex items-center justify-center overflow-visible"
            style={{
              perspective: '1200px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            {SOLUTION_STEPS.map((step, idx) => {
              const offset = idx - activeStep;
              const isCenter = offset === 0;

              let xPos = '0%';
              let rotateY = 0;
              let scale = 1;
              let opacity = 0;
              let zIndex = 10;
              let pointerEvents = 'none';

              if (offset === 0) {
                xPos = '0%';
                rotateY = 0;
                scale = 1.05;
                opacity = 1;
                zIndex = 30;
                pointerEvents = 'auto';
              } else if (offset === 1) {
                xPos = '68%';
                rotateY = -24;
                scale = 0.82;
                opacity = 0.35;
                zIndex = 15;
                pointerEvents = 'auto';
              } else if (offset === -1) {
                xPos = '-68%';
                rotateY = 24;
                scale = 0.82;
                opacity = 0.35;
                zIndex = 15;
                pointerEvents = 'auto';
              } else if (offset > 1) {
                xPos = '120%';
                rotateY = -35;
                scale = 0.65;
                opacity = 0;
                zIndex = 5;
              } else if (offset < -1) {
                xPos = '-120%';
                rotateY = 35;
                scale = 0.65;
                opacity = 0;
                zIndex = 5;
              }

              return (
                <motion.div
                  key={step.id}
                  animate={{
                    x: xPos,
                    rotateY,
                    scale,
                    opacity,
                    zIndex,
                  }}
                  transition={{
                    duration: 0.65,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    pointerEvents,
                  }}
                  onClick={() => {
                    if (!isCenter) setActiveStep(idx);
                  }}
                  className="absolute w-full max-w-[920px] h-[330px] sm:h-[370px] rounded-2xl bg-white/70 dark:bg-[#0c0e14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.85)] flex items-center justify-center p-3 sm:p-6 cursor-pointer"
                >
                  {renderVisual(idx)}
                </motion.div>
              );
            })}
          </div>

          {/* Heading positioned BELOW the rolling sliding window */}
          <div className="text-center max-w-4xl mx-auto mt-6 mb-1">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-700 to-slate-950 dark:from-white dark:via-slate-200 dark:to-slate-400">
                Graph-Grounded
              </span>
              <span className="text-slate-400 dark:text-slate-600 font-light select-none">→</span>
              <span className="text-slate-950 dark:text-white">
                Decision Execution
              </span>
            </h2>
          </div>
        </div>

        {/* ── Bottom HUD Bar: Pure Single Line Fading Punchline (Zero Clutter) ── */}
        <div className="w-full flex items-center justify-center border-t border-slate-200/80 dark:border-white/5 pt-4 min-h-[44px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 font-sans tracking-normal text-center max-w-3xl"
            >
              {currentStep.punchline}
            </motion.p>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}