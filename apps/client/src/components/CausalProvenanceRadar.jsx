/**
 * CausalProvenanceRadar.jsx — CAVDAX Continuous Invalidation Radar
 *
 * Minimalist, atmospheric radar HUD visualizer:
 *  - Volumetric, soft-blurred light ray (zero harsh lines, zero sharp polygons)
 *  - Centered concentric rings & crosshairs (symmetrical 360° visibility)
 *  - Minimalist detected radar blips: illuminate on sweep pass, then softly fade away
 *  - Zero bulky cards or tag boxes
 *  - Fully theme-adaptive (Porcelain Light & Obsidian Dark)
 *  - 100% UI Design System compliant (zero emojis, unbracketed monospace typography)
 */

import React, { useState } from 'react';
import { Radio, ArrowRight } from 'lucide-react';
import { playClick } from '../utils/soundFx';

// ─── Radar Targets (Grounded CAVDAX Domain Invariants) ────────────────────────
const RADAR_TARGETS = [
  {
    id: 'adr-002',
    name: 'ADR-002: OAuth2',
    status: 'ACTIVE SOURCE',
    type: 'valid',
    // 45deg: top-right
    top: 'calc(50% - 105px)',
    left: 'calc(50% + 95px)',
    delaySec: 1.25,
  },
  {
    id: 'mcp-gate',
    name: 'apply_code_change',
    status: 'MCP GATE INTERCEPT',
    type: 'gate',
    // 125deg: bottom-right
    top: 'calc(50% + 90px)',
    left: 'calc(50% + 115px)',
    delaySec: 3.47,
  },
  {
    id: 'dec-103',
    name: 'DEC-103: RS256 Bearer',
    status: 'VERIFIED EXECUTABLE',
    type: 'valid',
    // 200deg: bottom-left
    top: 'calc(50% + 75px)',
    left: 'calc(50% - 175px)',
    delaySec: 5.55,
  },
  {
    id: 'adr-001',
    name: 'ADR-001: TokenAuth',
    status: 'SUPERSEDED',
    type: 'stale',
    // 265deg: middle-left
    top: 'calc(50% - 25px)',
    left: 'calc(50% - 160px)',
    delaySec: 7.36,
  },
  {
    id: 'fact-stale',
    name: 'TokenAuth.v1 Verify',
    status: 'STALE FACT DETECTED',
    type: 'stale',
    // 325deg: top-left
    top: 'calc(50% - 110px)',
    left: 'calc(50% - 85px)',
    delaySec: 9.02,
  },
];

// ─── Minimal Radar Target Blip (Illuminates & Fades Away) ───────────────────────
function RadarTargetBlip({ target, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  // Status color palettes (dot & text)
  const colors = {
    valid: {
      dot: 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]',
      ring: 'border-teal-500',
      text: 'text-teal-600 dark:text-teal-400',
      status: 'text-teal-600/80 dark:text-teal-400/80',
    },
    stale: {
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
      ring: 'border-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
      status: 'text-rose-600/80 dark:text-rose-400/80',
    },
    gate: {
      dot: 'bg-[#d9a353] shadow-[0_0_8px_rgba(217,163,83,0.8)]',
      ring: 'border-[#d9a353]',
      text: 'text-amber-600 dark:text-amber-400',
      status: 'text-amber-600/80 dark:text-amber-400/80',
    },
  }[target.type];

  return (
    <div
      style={{
        top: target.top,
        left: target.left,
        animationDelay: `${target.delaySec}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        playClick();
        if (onClick) onClick();
      }}
      className={`absolute z-30 cursor-pointer select-none transition-all duration-300 ${
        isHovered ? '!opacity-100 scale-105' : 'animate-target-fade'
      }`}
    >
      <div className="relative flex items-center gap-2">
        {/* Core detected ping dot */}
        <div className="relative flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
          {/* Expanding radar ripple ping ring */}
          <div
            style={{ animationDelay: `${target.delaySec}s` }}
            className={`absolute w-2 h-2 rounded-full border ${colors.ring} animate-radar-ping pointer-events-none`}
          />
        </div>

        {/* Minimal Typography Label (No bulky card, no tags) */}
        <div className="flex flex-col">
          <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap">
            {target.name}
          </span>
          <span className={`text-[9px] font-mono font-semibold tracking-wider uppercase whitespace-nowrap ${colors.status}`}>
            {target.status}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Causal Provenance Radar Component ───────────────────────────────────
export default function CausalProvenanceRadar({ onLaunchConsole }) {
  return (
    <section id="radar-section" className="w-full py-16 px-6 max-w-6xl mx-auto border-t border-slate-300 dark:border-white/10">
      
      {/* ── Section Title & Philosophy ── */}
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight pb-2 flex flex-wrap items-center justify-center">
          <span className="text-[#d9a353]">Continuous Provenance</span>
          <span className="text-slate-400 dark:text-slate-600 font-light mx-2 sm:mx-4 select-none">→</span>
          <span>Temporal Invalidation Radar</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-2 font-sans text-pretty">
          Sub-2ms FalkorDB GraphBLAS radar sweeping git commits, architectural decisions, and active agent tool calls for silent cache rot.
        </p>
      </div>

      {/* ── Main Radar Canvas ── */}
      <div className="relative neo-glass-card rounded-2xl border border-slate-300/80 dark:border-white/10 overflow-hidden bg-slate-50/60 dark:bg-black/50 p-4 sm:p-6 h-[440px] sm:h-[500px] flex flex-col justify-between">
        
        {/* Scoped CSS Keyframes for Radar Sweep, Pings, and Target Fading */}
        <style>{`
          @keyframes radar-ray-spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          .animate-radar-ray {
            animation: radar-ray-spin 10s linear infinite;
            transform-origin: center center;
          }

          @keyframes target-ping-fade {
            0% {
              opacity: 1;
              filter: brightness(1.25);
            }
            12% {
              opacity: 0.95;
              filter: brightness(1);
            }
            45% {
              opacity: 0.18;
            }
            100% {
              opacity: 0.18;
            }
          }
          .animate-target-fade {
            animation: target-ping-fade 10s ease-out infinite;
          }

          @keyframes radar-ripple-ping {
            0% {
              transform: scale(0.8);
              opacity: 0.9;
            }
            35% {
              transform: scale(2.8);
              opacity: 0;
            }
            100% {
              transform: scale(2.8);
              opacity: 0;
            }
          }
          .animate-radar-ping {
            animation: radar-ripple-ping 10s ease-out infinite;
          }
        `}</style>

        {/* ── Top HUD Telemetry Ribbon ── */}
        <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 pb-2.5">
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

        {/* ── Centered Radar Screen Display ── */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          
          {/* 1. Symmetrical Concentric Range Rings (Centered) */}
          <div className="absolute w-[120px] h-[120px] rounded-full border border-slate-300/60 dark:border-white/10" />
          <div className="absolute w-[240px] h-[240px] rounded-full border border-slate-300/50 dark:border-white/10" />
          <div className="absolute w-[360px] h-[360px] rounded-full border border-slate-300/40 dark:border-white/10" />
          <div className="absolute w-[460px] h-[460px] rounded-full border border-slate-300/30 dark:border-white/5" />

          {/* 2. Symmetrical Crosshair Axes */}
          <div className="absolute w-[460px] h-px border-b border-dashed border-slate-300/40 dark:border-white/10" />
          <div className="absolute h-[460px] w-px border-r border-dashed border-slate-300/40 dark:border-white/10" />

          {/* 3. Range Distance Labels */}
          <span className="absolute left-[calc(50%+65px)] top-1/2 -translate-y-3.5 text-[8px] font-mono text-slate-400 dark:text-slate-600 select-none">
            HOP 1
          </span>
          <span className="absolute left-[calc(50%+125px)] top-1/2 -translate-y-3.5 text-[8px] font-mono text-slate-400 dark:text-slate-600 select-none">
            HOP 2
          </span>
          <span className="absolute left-[calc(50%+185px)] top-1/2 -translate-y-3.5 text-[8px] font-mono text-slate-400 dark:text-slate-600 select-none">
            HOP 3
          </span>

          {/* 4. Center Emitter Vertex Anchor */}
          <div className="absolute w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#d9a353]" />
          </div>

          {/* 5. Volumetric Soft-Blurred Light Ray (Zero harsh lines, zero sharp polygons) */}
          <div className="animate-radar-ray absolute w-[460px] h-[460px] flex items-center justify-center pointer-events-none">
            
            {/* Soft, Feathered Radial Conic Light Beam */}
            <div
              style={{
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(217, 163, 83, 0.32) 0deg, rgba(217, 163, 83, 0.16) 12deg, rgba(217, 163, 83, 0.04) 28deg, transparent 42deg)',
                filter: 'blur(14px)',
              }}
              className="absolute inset-0 rounded-full"
            />

            {/* Soft Smudged Core Light Ray (Blurred gradient beam, not a hard line) */}
            <div 
              style={{
                background: 'linear-gradient(to top, rgba(217, 163, 83, 0.75), rgba(217, 163, 83, 0.35) 60%, transparent)',
                filter: 'blur(3px)',
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1/2 origin-bottom"
            />

            {/* Luminous Atmospheric Ambient Glow at Ray Tip */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-16 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />
          </div>

        </div>

        {/* ── Detected Items Layer (Clickable, Illuminates, and Fades Away) ── */}
        <div className="relative z-20 w-full h-full pointer-events-auto">
          {RADAR_TARGETS.map((target) => (
            <RadarTargetBlip
              key={target.id}
              target={target}
              onClick={onLaunchConsole}
            />
          ))}
        </div>

        {/* ── Bottom Telemetry & Navigation Action ── */}
        <div className="relative z-30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono pt-2">
          <span className="text-slate-500 dark:text-slate-400 text-center sm:text-left text-pretty text-[11px]">
            Phosphor decay visualization: items illuminate on causal beam pass and softly fade into graph history.
          </span>
          <button
            onClick={() => {
              playClick();
              if (onLaunchConsole) onLaunchConsole();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-900 dark:text-white bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 transition-colors uppercase tracking-wider text-[10px] font-bold tactile-btn cursor-pointer whitespace-nowrap"
          >
            <span>Launch Invalidation Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </section>
  );
}
