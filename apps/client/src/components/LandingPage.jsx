import React, { useState } from 'react';
import { 
  ArrowRight, 
  Database, 
  Layers, 
  GitBranch, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  KeyRound, 
  Lock,
  ArrowUpRight,
  Compass,
  FileCode2, 
  Workflow, 
  Zap,
  Cable,
  HelpCircle
} from 'lucide-react';
import CavdaxWordmark from './CavdaxWordmark';
import FooterParticles from './FooterParticles';
import DragScrollController from './DragScrollController';
import KineticRollingHeadline from './KineticRollingHeadline';
import ThanosTypewriterHeadline from './ThanosTypewriterHeadline';
import McpCableConnectionSvg from './McpCableConnectionSvg';
import { playClick } from '../utils/soundFx';

const FAQS = [
  {
    q: "What is 'Silent Cache Rot' in autonomous AI coding agents?",
    a: "When codebases evolve, vector embeddings continue retrieving deprecated decisions due to high semantic similarity. Agents silently write stale, broken code without realizing the architectural rule was superseded."
  },
  {
    q: "How does CAVDAX enforce deterministic invalidation over cosine similarity?",
    a: "CAVDAX models architecture as a temporal Directed Acyclic Graph (DAG) in FalkorDB. Superseding commits trigger instant sub-2ms graph traversals that invalidate all dependent claims with 100% mathematical certainty."
  },
  {
    q: "How does the Enclosed Model Context Protocol (MCP) Interceptor gate tool execution?",
    a: "CAVDAX intercepts agent write tools in-flight over MCP stdio. Verified causal chains commit to disk in < 2ms; stale dependencies trigger an immediate 403 Hard Rejection with the exact invalidation path."
  },
  {
    q: "Does CAVDAX require changing my coding agent or LLM weights?",
    a: "Zero model modifications needed. CAVDAX drops directly into Claude Code, Cursor, Claude Desktop, Windsurf, or Roo Code via standard JSON configuration."
  },
  {
    q: "Why is FalkorDB GraphBLAS specifically required for this problem?",
    a: "FalkorDB performs multi-hop graph traversals via RAM-resident GraphBLAS sparse matrix operations, delivering sub-2ms causal verification with zero perceptible latency."
  }
];

export default function LandingPage({ onLaunchConsole, onOpenMcpPage, onOpenMcpModal, onStartTour }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleMcpClick = () => {
    playClick();
    if (onOpenMcpPage) {
      onOpenMcpPage();
    } else if (onOpenMcpModal) {
      onOpenMcpModal();
    }
  };

  return (
    <div className="w-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 select-none overflow-x-hidden">
      
      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO SECTION (SAHNIRMAAN Single-Screen Fullscreen Containment)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="min-h-[100dvh] w-full flex flex-col justify-center items-center text-center relative px-6 py-20 overflow-hidden">
        {/* Soft Monochromatic Ambient Radial Halo */}
        <div 
          aria-hidden="true" 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[700px] h-[220px] sm:h-[360px] bg-white/[0.03] dark:bg-white/[0.03] blur-[100px] sm:blur-[140px] pointer-events-none rounded-full" 
        />

        {/* Bespoke Swiss Wordmark (Theme-adaptive, Soft Ambient Glow without rectangular box/border) */}
        <div className="relative group mb-6 sm:mb-8 px-4 py-2 cursor-default select-none">
          {/* Soft ambient radial glow blur behind wordmark — NO BOX, NO BORDER */}
          <div 
            aria-hidden="true"
            className="absolute inset-0 -m-6 rounded-full bg-slate-400/15 dark:bg-white/[0.06] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          />
          <CavdaxWordmark width={460} className="text-slate-950 dark:text-white relative z-10 drop-shadow-xs" />
        </div>

        {/* Primary Hero Heading: Distinct visual hierarchy, generous vertical clearance */}
        <h1 className="max-w-5xl tracking-tight leading-[1.1] mb-8 sm:mb-10 flex flex-col items-center">
          <span className="text-3xl sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] font-black tracking-tight leading-[1.08] bg-clip-text text-transparent bg-gradient-to-b from-slate-950 via-slate-900 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-400 block pb-2 sm:pb-3">
            <span className="inline-block whitespace-nowrap">Eliminating Silent Cache Rot</span>
          </span>
          <span className="text-xl sm:text-3xl lg:text-[2.25rem] font-bold tracking-tight leading-[1.3] text-slate-600 dark:text-slate-300 block pt-2 pb-3 overflow-visible">
            <KineticRollingHeadline 
              phrases={[
                "In Autonomous AI Coding Agents",
                "Across Multi-Hop Git Commits",
                "Inside Model Context Protocols",
                "For Deterministic Agentic Workflows"
              ]}
              className="text-slate-700 dark:text-slate-200"
            />
          </span>
        </h1>

        {/* Symmetrical Dual Action CTA Buttons (Section 15 Standard, Optical Right Icons) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-14">
          <button
            onClick={() => {
              playClick();
              if (onLaunchConsole) onLaunchConsole();
            }}
            className="btn-primary group tactile-btn inline-flex items-center justify-center gap-2 leading-none"
          >
            <span>Launch Verification Console</span>
            <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={handleMcpClick}
            className="btn-secondary group tactile-btn inline-flex items-center justify-center gap-2 leading-none"
          >
            <span>Connect Real MCP Agent</span>
            <McpCableConnectionSvg className="text-slate-700 dark:text-slate-300" />
          </button>
        </div>

        {/* Clean Unbracketed Monospace Telemetry Row (Zero colored dots per Rule 3) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-mono text-slate-500 dark:text-slate-400 border-y border-slate-300 dark:border-white/10 py-3.5 max-w-3xl w-full">
          <div>
            <span>GATE LATENCY: <strong className="text-slate-900 dark:text-white font-bold">&lt; 15MS</strong></span>
          </div>
          <span className="text-slate-300 dark:text-white/20 hidden sm:inline">•</span>
          <div>
            <span>INVALIDATION: <strong className="text-slate-900 dark:text-white font-bold">100% DETERMINISTIC</strong></span>
          </div>
          <span className="text-slate-300 dark:text-white/20 hidden sm:inline">•</span>
          <div>
            <span>TRANSPORT: <strong className="text-slate-900 dark:text-white font-bold">MCP STDIO / HTTP</strong></span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. CORE PROBLEM SPACE: WHY VECTOR RAG FAILS CODING AGENTS
          (Zero Eyebrow Pills, Zero Tag Noise, Strictly Pure Typography)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-16 px-6 max-w-6xl mx-auto border-t border-slate-300 dark:border-white/10">
        <div className="text-center mb-12">
          {/* Heading with Integrated Thanos Typewriter Dissolve — strictly NO text below */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 pb-2">
            <span className="whitespace-nowrap shrink-0">Why Vector RAG Fails</span>
            <ThanosTypewriterHeadline 
              phrases={[
                "Coding Agents?",
                "Autonomous Writes?",
                "Temporal Decisions?",
                "Production Repos?"
              ]} 
            />
          </h2>
        </div>

        {/* ASYMMETRIC PROBLEM SPACE BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Problem Card 1 (2-Column): Semantic Cosine Blindness */}
          <div className="md:col-span-2 neo-glass-card p-7 sm:p-9 flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <GitBranch className="w-4 h-4 text-slate-950 dark:text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Semantic Cosine Blindness
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Active and superseded decisions share identical semantic vectors. Cosine distance cannot determine temporal succession, causing agents to retrieve obsolete architectural rules.
              </p>

              {/* Visual Vector Collision Simulator */}
              <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800 dark:text-slate-300">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>ADR-001 (Deprecated v1)</span>
                </div>
                <span className="text-slate-400 font-bold">≈ 0.89 Cosine Match ≈</span>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>ADR-002 (Active OAuth2)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Failure: Directional Blindness</span>
              <span>RAG Probability: 50% Stale Pick</span>
            </div>
          </div>

          {/* Problem Card 2 (1-Column): Silent Cache Rot */}
          <div className="neo-glass-card p-7 sm:p-9 flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-slate-950 dark:text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Silent Cache Rot
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Git commits mutate repositories constantly, but vector indices remain static. Coding agents operate on silent, outdated cache without invalidation awareness.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="text-slate-500 dark:text-slate-400"># Git State vs Vector DB:</div>
                <div className="text-rose-700 dark:text-rose-400 font-bold">DESYNC: 42 Commits Behind</div>
                <div className="text-slate-500 text-[10px]">Stale Invariant Ingested</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Cache Integrity: 0% Guarantee</span>
              <span>Invalidation: None</span>
            </div>
          </div>

          {/* Problem Card 3 (1-Column): Unenclosed Disk Mutation */}
          <div className="neo-glass-card p-7 sm:p-9 flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <FileCode2 className="w-4 h-4 text-slate-950 dark:text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Unenclosed Disk IO
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Coding agents execute direct filesystem writes without checking if the justifying decision is still fresh, introducing unverified code into production.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="text-slate-500 dark:text-slate-400"># Direct Execution Vulnerability:</div>
                <div className="text-rose-700 dark:text-rose-400 font-bold">DIRECT DISK WRITE</div>
                <div className="text-slate-500 text-[10px]">Bypasses Architecture Checks</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Gate Protection: 0% (Raw Access)</span>
              <span>Risk: Silent Regression</span>
            </div>
          </div>

          {/* Problem Card 4 (2-Column): Multi-Hop Cascade Failures */}
          <div className="md:col-span-2 neo-glass-card p-7 sm:p-9 flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-slate-950 dark:text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Broken Dependency Cascades
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Contract changes cascade across services. Isolated vector search cannot compute multi-hop graph reachability or downstream dependency breakage.
              </p>

              <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white" />
                  <span>ADR-001 Invalidation</span>
                </div>
                <span className="text-slate-400 font-bold">-- 3 Hops Lost in RAG --</span>
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Silent Service Regression</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Reachability: Not Computed</span>
              <span>Vector Depth: 1 Hop Max</span>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. SOLUTION SPACE: GRAPH-GROUNDED DECISION EXECUTION
          (Zero Eyebrow Pills, Zero Tag Noise, Strictly Pure Typography)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-16 px-6 max-w-6xl mx-auto border-t border-slate-300 dark:border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight pb-2 flex flex-wrap items-center justify-center">
            <span className="text-[#d9a353]">Graph-Grounded</span>
            <span className="text-slate-400 dark:text-slate-600 font-light mx-2 sm:mx-4 select-none">→</span>
            <span>Decision Execution</span>
          </h2>
        </div>

        {/* ASYMMETRIC SOLUTION SPACE BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Bento Card 1 (2-Column): The Invalidation Wave Engine */}
          <div className="md:col-span-2 neo-glass-card p-7 sm:p-9 flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <Workflow className="w-4 h-4 text-slate-950 dark:text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Causal Invalidation Engine
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                New commits establish explicit <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-mono text-xs">[:SUPERSEDES]</code> edges, cascading invalidation flags across the graph in &lt; 2ms via FalkorDB GraphBLAS.
              </p>

              {/* Visual Graph Pipeline Path */}
              <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white" />
                  <span>ADR-002: OAuth2 Mandatory</span>
                </div>
                <span className="text-slate-400 font-bold">→ [:SUPERSEDES] →</span>
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>F-Auth-v1: STALE</span>
                </div>
                <span className="text-slate-400 font-bold">→ [:INVALIDATES] →</span>
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>DEC-102: INVALIDATED</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Latency: 1.84ms</span>
              <span>Traversal: FalkorDB BFS</span>
            </div>
          </div>

          {/* Bento Card 2 (1-Column): The Enclosed MCP Action Gate */}
          <div className="neo-glass-card p-7 sm:p-9 flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-slate-950 dark:text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Enclosed MCP Execution Gate
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Agent file modifications are enclosed behind an MCP Cypher gate. Stale dependencies are blocked in-flight with a deterministic 403 Hard Rejection.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="text-slate-500 dark:text-slate-400"># Interception Verdict:</div>
                <div className="text-rose-700 dark:text-rose-400 font-bold">403 HARD REJECT</div>
                <div className="text-slate-500 text-[10px]">Stale Provenance Intercepted</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Standard: MCP 2024-11-05</span>
              <span>Intercept: In-Flight</span>
            </div>
          </div>

          {/* Bento Card 3 (1-Column): FalkorDB GraphBLAS Matrix Invalidation */}
          <div className="neo-glass-card p-7 sm:p-9 flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4 text-slate-950 dark:text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Linear Algebraic Matrix Operations
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Sparse matrix multiplications (<code className="font-mono text-xs">A ⊕.⊗ B</code>) evaluate deep multi-hop dependency paths in-memory at hardware speeds.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Engine: FalkorDB</span>
              <span>Memory: In-RAM Matrix</span>
            </div>
          </div>

          {/* Bento Card 4 (2-Column): The Act IV Revalidation Loop */}
          <div className="md:col-span-2 neo-glass-card p-7 sm:p-9 flex flex-col justify-between text-left relative overflow-hidden group">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-slate-950 dark:text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Self-Healing Continuous Revalidation
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Rejections pinpoint the exact stale path. Agents automatically pivot, grounding fresh decisions in active sources with verified provenance.
              </p>

              <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>DEC-102: REPLACED_ARCHIVED</span>
                </div>
                <span className="text-slate-400 font-bold">→ [:REPLACES] →</span>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>DEC-103: VALID (OAuth2)</span>
                </div>
                <span className="text-slate-400 font-bold">→ [:COMMITS] →</span>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>200 OK APPROVED</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Integrity: 100% Causal Proof</span>
              <span>Status: Production Verified</span>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. ARCHITECTURAL FAQ ACCORDION SECTION (SAHNIRMAAN Caliber)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-16 px-6 max-w-4xl mx-auto border-t border-slate-300 dark:border-white/10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-2 font-sans">
            Technical clarity on causal graph provenance, silent cache rot elimination, and enclosed MCP gating.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div 
                key={idx}
                className="p-5 rounded-2xl neo-glass-card cursor-pointer select-none"
                onClick={() => {
                  playClick();
                  setExpandedFaq(isOpen ? null : idx);
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white font-mono leading-snug">
                    {faq.q}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-sm shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10">
                    {isOpen ? "−" : "+"}
                  </span>
                </div>
                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans border-t border-slate-200 dark:border-white/5 pt-3">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. ACTION CTA SECTION
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 px-6 max-w-4xl mx-auto border-t border-slate-300 dark:border-white/10 text-center">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white mb-4 tracking-tight">
          <span className="inline-block whitespace-nowrap">Ready to Witness</span>{' '}
          <span className="inline-block whitespace-nowrap">Graph-Grounded Verification?</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 font-mono">
          <span className="inline-block whitespace-nowrap">Launch the interactive verification console</span>{' '}
          <span className="inline-block whitespace-nowrap">or connect your local coding agent over standard MCP stdio.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              playClick();
              if (onLaunchConsole) onLaunchConsole();
            }}
            className="btn-primary group tactile-btn inline-flex items-center justify-center gap-2 leading-none"
          >
            <span>Launch Verification Console</span>
            <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={handleMcpClick}
            className="btn-secondary group tactile-btn inline-flex items-center justify-center gap-2 leading-none"
          >
            <span>Connect Real MCP Agent</span>
            <McpCableConnectionSvg className="text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. STIPPLED CYAN PARTICLE TYPOGRAPHY FOOTER (Sole Cyan Exception)
          ══════════════════════════════════════════════════════════════════════ */}
      <FooterParticles text="CAVDAX" />

      {/* ══════════════════════════════════════════════════════════════════════
          6. SIGNATURE SAHNIRMAAN DRAGGABLE SCROLL CONTROLLER
          ══════════════════════════════════════════════════════════════════════ */}
      <DragScrollController />
    </div>
  );
}
