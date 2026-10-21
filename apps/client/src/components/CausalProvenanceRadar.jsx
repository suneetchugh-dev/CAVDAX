/**
 * CausalProvenanceRadar.jsx — CAVDAX Continuous Invalidation Radar
 *
 * Minimalist, atmospheric radar HUD visualizer:
 *  - Mathematically Synchronized Sweep & Smooth Phosphor Decay:
 *    • Targets gently breathe into visibility as the light ray arrives (~0.6s ease-in)
 *    • Linger at 100% crisp focus while illuminated (~0.5s)
 *    • Smoothly, luxuriously fade away into the background (~2.0s exponential decay)
 *    • Zero fast popping, zero jump cuts, zero eye-jarring jerkiness
 *  - Theme-Calibrated Light Ray:
 *    • Light Theme: Deep Cobalt / Slate ray (zero muddy yellow)
 *    • Dark Theme: Warm Amber / Obsidian ray (#d9a353)
 *  - Zero Clutter: Completely stripped of redundant labels, hop tags, and descriptive noise.
 *  - Symmetrical 360° centered coordinate geometry
 */

import React, { useEffect, useRef } from 'react';
import { Radio, ArrowRight } from 'lucide-react';
import { playClick } from '../utils/soundFx';

// ─── Clean Domain Targets (Polar Coordinates) ─────────────────────────────────
const RADAR_TARGETS = [
  {
    id: 'adr-002',
    name: 'ADR-002: OAuth2',
    type: 'valid',
    angle: 45,       // Top-right
    radius: 140,
  },
  {
    id: 'mcp-gate',
    name: 'apply_code_change',
    type: 'gate',
    angle: 125,      // Bottom-right
    radius: 155,
  },
  {
    id: 'dec-103',
    name: 'DEC-103: RS256',
    type: 'valid',
    angle: 195,      // Bottom-left
    radius: 175,
  },
  {
    id: 'adr-001',
    name: 'ADR-001 (Superseded)',
    type: 'stale',
    angle: 265,      // Middle-left
    radius: 160,
  },
  {
    id: 'fact-stale',
    name: 'TokenAuth.v1 (Stale)',
    type: 'stale',
    angle: 325,      // Top-left
    radius: 130,
  },
];

export default function CausalProvenanceRadar({ onLaunchConsole }) {
  const beamRef = useRef(null);
  const targetsRef = useRef([]);

  // ─── 60fps Synchronized Sweep & Smooth Phosphor Decay Engine ────────────────
  useEffect(() => {
    let animId;
    const DURATION_MS = 10000; // 10 seconds per 360° rotation
    let startTime = performance.now();

    const frame = (now) => {
      const elapsed = (now - startTime) % DURATION_MS;
      const beamAngle = (elapsed / DURATION_MS) * 360;

      // 1. Rotate the beam strictly in sync with time
      if (beamRef.current) {
        beamRef.current.style.transform = `rotate(${beamAngle}deg)`;
      }

      // 2. Mathematically compute smooth illumination for each target based on angular distance
      targetsRef.current.forEach((el, idx) => {
        if (!el) return;
        const target = RADAR_TARGETS[idx];
        const delta = (beamAngle - target.angle + 360) % 360;

        let opacity = 0;
        let scale = 0.96;

        // Smooth, professional phosphor decay curve (total visibility arc: ~95° = ~2.6s):
        // 1. Approach: 20° before apex (delta 340° to 360°) -> smooth Hermite S-curve ease-in
        // 2. Peak: directly at beam apex (delta 0° to 15°) -> solid 100% readable illumination
        // 3. Phosphor Decay: trailing (delta 15° to 80°) -> long, elegant exponential dissolve to 0
        if (delta >= 340 && delta < 360) {
          const t = (delta - 340) / 20;
          opacity = t * t * (3 - 2 * t);
          scale = 0.96 + opacity * 0.05;
        } else if (delta >= 0 && delta <= 15) {
          opacity = 1;
          scale = 1.01;
        } else if (delta > 15 && delta <= 80) {
          const decayProgress = (delta - 15) / 65;
          opacity = Math.pow(1 - decayProgress, 2.2);
          scale = 1.01 - decayProgress * 0.05;
        } else {
          opacity = 0;
        }

        // Items are revealed strictly and exclusively by the light ray sweep (never artificially unmasked by hover)
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.pointerEvents = opacity > 0.15 ? 'auto' : 'none';
      });

      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section id="radar-section" className="w-full py-14 px-6 max-w-5xl mx-auto border-t border-slate-300 dark:border-white/10">
      
      {/* ── Section Title (Clean, Zero Eyebrow Pill Clutter) ── */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight pb-2 flex flex-wrap items-center justify-center">
          <span className="text-amber-700 dark:text-[#d9a353]">Continuous Provenance</span>
          <span className="text-slate-400 dark:text-slate-600 font-light mx-2 sm:mx-4 select-none">→</span>
          <span>Temporal Invalidation Radar</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-2 font-sans text-pretty">
          Sub-2ms FalkorDB GraphBLAS radar sweeping git commits, decisions, and active agent tool calls.
        </p>
      </div>

      {/* ── Main Radar Canvas (Clutter-Free, Pure Focus on Sweep & Targets) ── */}
      <div className="relative neo-glass-card rounded-2xl border border-slate-300/80 dark:border-white/10 overflow-hidden bg-white/80 dark:bg-black/50 p-4 sm:p-6 h-[400px] sm:h-[460px] flex flex-col justify-between">

        {/* ── Top Header Bar ── */}
        <div className="relative z-30 flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              Temporal Invalidation Radar
            </span>
          </div>

          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            FalkorDB GraphBLAS &lt; 2ms
          </span>
        </div>

        {/* ── Centered Radar Screen Display (360° Symmetrical Visibility) ── */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          
          {/* Symmetrical Concentric Range Rings */}
          <div className="absolute w-[120px] h-[120px] rounded-full border border-slate-300/60 dark:border-white/10" />
          <div className="absolute w-[240px] h-[240px] rounded-full border border-slate-300/50 dark:border-white/10" />
          <div className="absolute w-[360px] h-[360px] rounded-full border border-slate-300/40 dark:border-white/10" />
          <div className="absolute w-[460px] h-[460px] rounded-full border border-slate-300/25 dark:border-white/5" />

          {/* Symmetrical Crosshair Axes */}
          <div className="absolute w-[460px] h-px border-b border-dashed border-slate-300/50 dark:border-white/10" />
          <div className="absolute h-[460px] w-px border-r border-dashed border-slate-300/50 dark:border-white/10" />

          {/* Center Emitter Vertex Anchor */}
          <div className="absolute w-5 h-5 rounded-full bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-[#d9a353]" />
          </div>

          {/* Theme-Calibrated Volumetric Soft Light Ray (Symmetrically Balanced Wings) */}
          <div 
            ref={beamRef}
            style={{ transformOrigin: 'center center' }}
            className="absolute w-[460px] h-[460px] flex items-center justify-center pointer-events-none will-change-transform"
          >
            {/* Soft, Feathered Radial Conic Light Beam (Symmetrically Balanced Feathering on Both Sides) */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ filter: 'blur(16px)' }}
            >
              {/* Light Mode: Prominent Executive Burnished Gold / Honey Amber Ray */}
              <div 
                className="w-full h-full block dark:hidden"
                style={{
                  background: 'conic-gradient(from 346deg at 50% 50%, transparent 0deg, rgba(202, 138, 4, 0.08) 6deg, rgba(202, 138, 4, 0.42) 14deg, rgba(202, 138, 4, 0.28) 22deg, rgba(202, 138, 4, 0.12) 36deg, rgba(202, 138, 4, 0.02) 48deg, transparent 60deg)'
                }}
              />
              {/* Dark Mode: Warm Amber / Obsidian Conic Ray */}
              <div 
                className="w-full h-full hidden dark:block"
                style={{
                  background: 'conic-gradient(from 346deg at 50% 50%, transparent 0deg, rgba(217, 163, 83, 0.08) 6deg, rgba(217, 163, 83, 0.38) 14deg, rgba(217, 163, 83, 0.22) 22deg, rgba(217, 163, 83, 0.09) 36deg, rgba(217, 163, 83, 0.02) 48deg, transparent 60deg)'
                }}
              />
            </div>

            {/* Soft Smudged Core Light Ray Needle (Aligned exactly with 14deg peak at 12 oclock) */}
            <div 
              style={{ filter: 'blur(2.5px)' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1/2 origin-bottom bg-gradient-to-t from-amber-600/80 dark:from-[#d9a353]/70 via-amber-500/40 dark:via-[#d9a353]/30 to-transparent"
            />

            {/* Luminous Atmospheric Ambient Glow Squircle at Ray Tip */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-16 rounded-full bg-amber-500/25 dark:bg-amber-400/20 blur-xl pointer-events-none" />
          </div>

        </div>

        {/* ── Detected Items Layer (Illuminates Smoothly as Light Sweeps Over) ── */}
        <div className="relative z-20 w-full h-full pointer-events-none">
          {RADAR_TARGETS.map((target, idx) => {
            const rad = (target.angle * Math.PI) / 180;
            const x = target.radius * Math.sin(rad);
            const y = -target.radius * Math.cos(rad);

            const dotColors = {
              valid: 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.85)]',
              stale: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.85)]',
              gate: 'bg-amber-600 dark:bg-[#d9a353] shadow-[0_0_8px_rgba(217,163,83,0.85)]',
            }[target.type];

            const textColors = {
              valid: 'text-teal-700 dark:text-teal-300',
              stale: 'text-rose-700 dark:text-rose-300',
              gate: 'text-amber-800 dark:text-amber-300',
            }[target.type];

            return (
              <div
                key={target.id}
                ref={(el) => (targetsRef.current[idx] = el)}
                style={{
                  top: `calc(50% + ${y}px)`,
                  left: `calc(50% + ${x}px)`,
                  opacity: 0,
                  transform: 'scale(0.96)',
                  pointerEvents: 'none',
                }}
                onClick={() => {
                  playClick();
                  if (onLaunchConsole) onLaunchConsole();
                }}
                className="group absolute z-30 cursor-pointer select-none will-change-transform"
              >
                <div className="relative flex items-center gap-2 -translate-x-2 -translate-y-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${dotColors}`} />
                  <span className={`text-[11px] sm:text-xs font-mono font-bold tracking-tight whitespace-nowrap drop-shadow-xs transition-colors ${textColors}`}>
                    {target.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom Clean Action Bar (Zero Explanatory Fluff) ── */}
        <div className="relative z-30 flex items-center justify-end pt-2 border-t border-slate-200/80 dark:border-white/10">
          <button
            onClick={() => {
              playClick();
              if (onLaunchConsole) onLaunchConsole();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 transition-colors uppercase tracking-wider text-[10px] font-bold tactile-btn cursor-pointer whitespace-nowrap"
          >
            <span>Launch Invalidation Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </section>
  );
}
