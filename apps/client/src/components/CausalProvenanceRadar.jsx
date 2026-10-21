/**
 * CausalProvenanceRadar.jsx — CAVDAX Continuous Invalidation Radar
 *
 * Bespoke architectural radar visualizer based on the 21st.dev radar effect,
 * heavily customized to comply with docs/UI_DESIGN_SYSTEM.md:
 *  - Fully theme-adaptive (Porcelain Light & Obsidian Dark)
 *  - 100% Lucide icons (no react-icons dependency bloat, zero banned shield SVGs)
 *  - Domain-specific CAVDAX nodes (ADRs, Git commits, Stale Facts, MCP Gate, FalkorDB)
 *  - Zero emojis, zero bracketed tags, zero pulsing orbs, monospace badges
 *  - Anti-orphan typography (text-pretty)
 *  - Double-bezel elevation with tactile kinetics (playClick)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  GitCommit, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Database,
  Radio,
  ArrowRight
} from 'lucide-react';
import { playClick } from '../utils/soundFx';

// ─── Concentric Circle Component ──────────────────────────────────────────────
function RadarCircle({ sizeRem, opacity, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.05, duration: 0.25 }}
      style={{
        height: `${sizeRem}rem`,
        width: `${sizeRem}rem`,
      }}
      className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 rounded-full border border-slate-400/20 dark:border-white/10 pointer-events-none"
    />
  );
}

// ─── Sweeping Radar Arm & Concentric Grid ─────────────────────────────────────
function RadarSweep() {
  const circles = [6, 12, 18, 24, 30, 36, 42, 48];

  return (
    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-full flex items-center justify-center pointer-events-none overflow-hidden h-[360px] sm:h-[420px]">
      <style>{`
        @keyframes cavdax-radar-sweep {
          0% {
            transform: rotate(-75deg);
          }
          50% {
            transform: rotate(75deg);
          }
          100% {
            transform: rotate(-75deg);
          }
        }
        .animate-cavdax-radar-sweep {
          animation: cavdax-radar-sweep 8s ease-in-out infinite;
          transform-origin: bottom center;
        }
      `}</style>

      {/* Rotating sweep cone & beam */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[840px] h-[360px] sm:h-[420px] overflow-hidden pointer-events-none">
        <div className="animate-cavdax-radar-sweep absolute bottom-0 left-1/2 w-[2px] h-[340px] sm:h-[400px] -translate-x-1/2">
          {/* Leading luminous beam */}
          <div className="w-full h-full bg-gradient-to-t from-transparent via-[#d9a353] to-[#d9a353] shadow-[0_0_12px_rgba(217,163,83,0.7)]" />
          
          {/* Trailing soft radar glow wedge */}
          <div 
            style={{
              background: 'linear-gradient(to top, transparent, rgba(217, 163, 83, 0.08) 50%, rgba(217, 163, 83, 0.22) 100%)',
              clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)'
            }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[160px] sm:w-[220px] h-[320px] sm:h-[380px] -z-10 pointer-events-none"
          />
        </div>
      </div>

      {/* Concentric rings radiating upwards from bottom */}
      {circles.map((sizeRem, idx) => (
        <RadarCircle
          key={`circle-${idx}`}
          sizeRem={sizeRem}
          opacity={1 - idx * 0.1}
          delay={idx}
        />
      ))}

      {/* Central radar emitter core — geometric vertex anchor */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/10 dark:bg-white/5 border border-slate-300 dark:border-white/20 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#d9a353]" />
      </div>

      {/* Horizon baseline separator */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent" />
    </div>
  );
}

// ─── Scanned Causal Node Card Component ───────────────────────────────────────
function ScannedNodeCard({ 
  icon: Icon, 
  title, 
  subtitle, 
  verdict, 
  verdictType = 'valid', 
  delay = 0,
  onClick
}) {
  const [hovered, setHovered] = useState(false);

  // Verdict style mapping (unbracketed monospace tags)
  const verdictColors = {
    valid: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20',
    stale: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    gate: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    neutral: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20'
  };

  const iconColors = {
    valid: 'text-teal-600 dark:text-teal-400 border-teal-500/25 bg-teal-500/5',
    stale: 'text-rose-600 dark:text-rose-400 border-rose-500/25 bg-rose-500/5',
    gate: 'text-amber-600 dark:text-amber-400 border-amber-500/25 bg-amber-500/5',
    neutral: 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        playClick();
        if (onClick) onClick();
      }}
      className={`group relative z-30 cursor-pointer rounded-xl border p-2.5 sm:p-3.5 transition-all duration-200 select-none ${
        hovered
          ? 'bg-white dark:bg-[#11141B] border-amber-500/50 shadow-md -translate-y-0.5'
          : 'bg-white/70 dark:bg-[#0B0D11]/80 backdrop-blur-md border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${iconColors[verdictType]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 justify-between">
            <span className="text-xs sm:text-[13px] font-mono font-bold text-slate-900 dark:text-white truncate">
              {title}
            </span>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${verdictColors[verdictType]}`}>
              {verdict}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-sans truncate text-pretty mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Causal Provenance Radar Showcase Section ────────────────────────────
export default function CausalProvenanceRadar({ onLaunchConsole }) {
  return (
    <section id="radar-section" className="w-full py-16 px-6 max-w-6xl mx-auto border-t border-slate-300 dark:border-white/10">
      
      {/* ── Section Title & Philosophy (No eyebrow pills above heading) ── */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight pb-2 flex flex-wrap items-center justify-center">
          <span className="text-[#d9a353]">Continuous Provenance</span>
          <span className="text-slate-400 dark:text-slate-600 font-light mx-2 sm:mx-4 select-none">→</span>
          <span>Temporal Invalidation Radar</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-2 font-sans text-pretty">
          Sub-2ms FalkorDB GraphBLAS radar sweeping git commits, architectural decisions, and active agent tool calls for silent cache rot.
        </p>
      </div>

      {/* ── Main Radar Canvas Container (Double-bezel / neo-glass-card geometry) ── */}
      <div className="relative neo-glass-card rounded-2xl border border-slate-300/80 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-black/40 p-4 sm:p-8 min-h-[460px] sm:min-h-[520px] flex flex-col justify-between">

        {/* Top HUD Telemetry Ribbon (Monospace indicators, zero brackets, zero pulsing orbs) */}
        <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              Provenance Radar: Active Sweep
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span className="tabular-nums">Sweep: 60Hz</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="tabular-nums">Latency: &lt; 2ms BFS</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-teal-600 dark:text-teal-400 font-bold">100% Causal Invariants</span>
          </div>
        </div>

        {/* Layer 2: Tiered Scanned Orbit Cards */}
        <div className="relative z-20 my-auto py-6 space-y-4 max-w-4xl mx-auto w-full">
          
          {/* Tier 1: Grounded Architectural Sources (ADRs) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ScannedNodeCard
              icon={FileText}
              title="ADR-002: OAuth2"
              subtitle="Supersedes ADR-001 Bearer Token"
              verdict="Active Source"
              verdictType="valid"
              delay={0.1}
              onClick={onLaunchConsole}
            />
            <ScannedNodeCard
              icon={GitCommit}
              title="Commit 9a4f21"
              subtitle="feat(auth): token deprecation"
              verdict="Ingested"
              verdictType="neutral"
              delay={0.2}
              onClick={onLaunchConsole}
            />
            <ScannedNodeCard
              icon={AlertTriangle}
              title="ADR-001: TokenAuth"
              subtitle="Archived in Git history"
              verdict="Superseded"
              verdictType="stale"
              delay={0.3}
              onClick={onLaunchConsole}
            />
          </div>

          {/* Tier 2: Extracted Temporal Invariants & In-Flight Gate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <ScannedNodeCard
              icon={AlertTriangle}
              title="TokenAuth.v1 Verify"
              subtitle="Stale Fact — Deprecated in DEC-101"
              verdict="Stale Intercept"
              verdictType="stale"
              delay={0.4}
              onClick={onLaunchConsole}
            />
            <ScannedNodeCard
              icon={Cpu}
              title="apply_code_change"
              subtitle="Agent In-Flight Write Interceptor"
              verdict="MCP Gate"
              verdictType="gate"
              delay={0.5}
              onClick={onLaunchConsole}
            />
          </div>

          {/* Tier 3: Verified Execution & FalkorDB Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            <ScannedNodeCard
              icon={CheckCircle2}
              title="DEC-103: RS256 Bearer"
              subtitle="Causally Grounded in Active ADR-002"
              verdict="Approved Write"
              verdictType="valid"
              delay={0.6}
              onClick={onLaunchConsole}
            />
            <ScannedNodeCard
              icon={Database}
              title="FalkorDB GraphBLAS"
              subtitle="In-RAM Matrix Multiplications"
              verdict="Engine Active"
              verdictType="gate"
              delay={0.7}
              onClick={onLaunchConsole}
            />
          </div>

        </div>

        {/* Background Radar Sweeper Visual */}
        <RadarSweep />

        {/* Bottom Live Action Callout */}
        <div className="relative z-30 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <span className="text-slate-600 dark:text-slate-400 text-center sm:text-left text-pretty">
            Radar sweeping active repository state against FalkorDB temporal DAG
          </span>
          <button
            onClick={() => {
              playClick();
              if (onLaunchConsole) onLaunchConsole();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-900 dark:text-white bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 transition-colors uppercase tracking-wider text-[10px] font-bold tactile-btn cursor-pointer"
          >
            <span>Launch Interactive Invalidation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </section>
  );
}
