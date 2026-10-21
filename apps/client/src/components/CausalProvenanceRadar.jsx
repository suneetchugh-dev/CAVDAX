/**
 * CausalProvenanceRadar.jsx — CAVDAX Continuous Invalidation Radar
 *
 * Minimalist, atmospheric radar HUD visualizer:
 *  - Option C: Pinned Scrollytelling Viewport Takeover Engine:
 *    • As user scrolls to this section, the card locks into place
 *    • Card borders fade away, background and navbar blur and dim out
 *    • Radar expands to 100vw × 100dvh full viewport theater mode
 *    • Concentric rings and sweep expand across the monitor
 *    • Scrolling further smoothly collapses back to card and resumes page flow
 *  - Mathematically Synchronized Sweep & Smooth Phosphor Decay (60fps RAF loop)
 *  - Zero Clutter: Clean unbracketed monospace labels, zero decorative fluff
 *  - Theme-Calibrated: Premium Slate-950 in light mode, Warm Amber in dark mode
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const containerRef = useRef(null);
  const beamRef = useRef(null);
  const targetsRef = useRef([]);

  // Viewport tracking for 100vw / 100dvh numerical interpolation
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Pinned Scrollytelling Scroll Progression (Option C) ────────────────────
  // Trigger expansion earlier as the section approaches the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end end'],
  });

  const restingWidth = Math.min(viewport.width - 48, 1024);
  const restingHeight = Math.min(460, viewport.height - 120);
  const theaterScale = Math.min(viewport.height / 460, 1.55);

  // Immediate Early Zoom & Heavy Blur/Dimming:
  // 0.00 -> 0.04: Resting card view
  // 0.04 -> 0.20: IMMEDIATE rapid expansion, heavy backdrop blur & border dissolution
  // 0.20 -> 0.78: Fullscreen Theater Mode (Immersive hold)
  // 0.78 -> 0.94: Smooth Collapse back to original bento dimensions
  // 0.94 -> 1.00: Exit into next section
  const cardWidth = useTransform(scrollYProgress, [0.04, 0.20, 0.78, 0.94], [restingWidth, viewport.width, viewport.width, restingWidth]);
  const cardHeight = useTransform(scrollYProgress, [0.04, 0.20, 0.78, 0.94], [restingHeight, viewport.height, viewport.height, restingHeight]);
  const cardRadius = useTransform(scrollYProgress, [0.04, 0.16, 0.80, 0.94], [16, 0, 0, 16]);
  const cardBorderOpacity = useTransform(scrollYProgress, [0.02, 0.12, 0.82, 0.94], [1, 0, 0, 1]);
  const backdropOpacity = useTransform(scrollYProgress, [0.01, 0.14, 0.82, 0.96], [0, 1, 1, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0.01, 0.10, 0.84, 0.96], [1, 0, 0, 1]);
  const titleY = useTransform(scrollYProgress, [0.01, 0.10, 0.84, 0.96], [0, -25, -25, 0]);
  const radarScale = useTransform(scrollYProgress, [0.04, 0.20, 0.78, 0.94], [1, theaterScale, theaterScale, 1]);
  const chromeOpacity = useTransform(scrollYProgress, [0.04, 0.16, 0.82, 0.94], [1, 0.2, 0.2, 1]);
  const cueOpacity = useTransform(scrollYProgress, [0.22, 0.30, 0.72, 0.78], [0, 1, 1, 0]);

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

        // Subtle, tight phosphor sweep curve (visibility arc: ~60° = ~1.6s):
        // 1. Approach: 10° before apex (delta 350° to 360°) -> smooth Hermite ease-in
        // 2. Peak: directly under tight beam (delta 0° to 8°) -> solid 100% readable illumination
        // 3. Phosphor Decay: trailing (delta 8° to 50°) -> gentle exponential dissolve to 0
        if (delta >= 350 && delta < 360) {
          const t = (delta - 350) / 10;
          opacity = t * t * (3 - 2 * t);
          scale = 0.96 + opacity * 0.05;
        } else if (delta >= 0 && delta <= 8) {
          opacity = 1;
          scale = 1.01;
        } else if (delta > 8 && delta <= 50) {
          const decayProgress = (delta - 8) / 42;
          opacity = Math.pow(1 - decayProgress, 2.0);
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
    <section ref={containerRef} id="radar-section" className="relative w-full h-[280vh]">
      
      {/* ── Fixed Heavy Dimming & Blur Backdrop (Blurs & Dims Navbar and All Surrounding UI) ── */}
      <motion.div 
        style={{ opacity: backdropOpacity }}
        className="fixed inset-0 z-40 bg-white/85 dark:bg-[#05070a]/90 backdrop-blur-3xl pointer-events-none will-change-transform"
      />

      {/* ── Sticky Viewport Theater Stage ── */}
      <div className="sticky top-0 h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden z-50">

        {/* ── Section Title (Clean, Zero Eyebrow Pill Clutter) ── */}
        <motion.div 
          style={{ opacity: titleOpacity, y: titleY }}
          className="text-center mb-4 sm:mb-6 shrink-0 px-4 z-50"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight pb-1 flex flex-wrap items-center justify-center">
            <span className="text-slate-950 dark:text-[#d9a353]">Continuous Provenance</span>
            <span className="text-slate-400 dark:text-slate-600 font-light mx-2 sm:mx-4 select-none">→</span>
            <span>Temporal Invalidation Radar</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-1 font-sans text-pretty">
            Sub-2ms FalkorDB GraphBLAS radar sweeping git commits, decisions, and active agent tool calls.
          </p>
        </motion.div>

        {/* ── Expanding Radar Card (Option C: Zooms to 100vw × 100dvh) ── */}
        <motion.div 
          style={{
            width: cardWidth,
            height: cardHeight,
            borderRadius: cardRadius,
          }}
          className="relative z-50 overflow-hidden bg-white/90 dark:bg-black/70 p-4 sm:p-6 flex flex-col justify-between shadow-2xl will-change-transform"
        >
          {/* Card Border Overlay (Smoothly Fades Out During Zoom, Fades In on Exit) */}
          <motion.div 
            style={{ opacity: cardBorderOpacity }}
            className="absolute inset-0 rounded-[inherit] border border-slate-300/80 dark:border-white/10 pointer-events-none z-30"
          />

          {/* ── Top Header Bar ── */}
          <motion.div 
            style={{ opacity: chromeOpacity }}
            className="relative z-30 flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/10"
          >
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-slate-950 dark:text-amber-400" />
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
                Temporal Invalidation Radar
              </span>
            </div>

            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              FalkorDB GraphBLAS &lt; 2ms
            </span>
          </motion.div>

          {/* ── Centered Radar Screen Display (Expands in Theater Mode) ── */}
          <motion.div 
            style={{ scale: radarScale }}
            className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none will-change-transform"
          >
            {/* Symmetrical Concentric Range Rings */}
            <div className="absolute w-[120px] h-[120px] rounded-full border border-slate-300/60 dark:border-white/10" />
            <div className="absolute w-[240px] h-[240px] rounded-full border border-slate-300/50 dark:border-white/10" />
            <div className="absolute w-[360px] h-[360px] rounded-full border border-slate-300/40 dark:border-white/10" />
            <div className="absolute w-[460px] h-[460px] rounded-full border border-slate-300/25 dark:border-white/5" />

            {/* Symmetrical Crosshair Axes */}
            <div className="absolute w-[460px] h-px border-b border-dashed border-slate-300/50 dark:border-white/10" />
            <div className="absolute h-[460px] w-px border-r border-dashed border-slate-300/50 dark:border-white/10" />

            {/* Center Emitter Vertex Anchor */}
            <div className="absolute w-4 h-4 rounded-full bg-slate-950/5 dark:bg-amber-500/10 border border-slate-950/20 dark:border-amber-500/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950 dark:bg-[#d9a353]" />
            </div>

            {/* Theme-Calibrated Precision Light Ray (Subtle, Tight 24° Beam, Zero Tip Dot) */}
            <div 
              ref={beamRef}
              style={{ transformOrigin: 'center center' }}
              className="absolute w-[460px] h-[460px] flex items-center justify-center pointer-events-none will-change-transform"
            >
              {/* Subtle, Controlled Conic Light Fan (Tight 24° arc with 5px blur) */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ filter: 'blur(5px)' }}
              >
                {/* Light Mode: Premium Obsidian / Slate-950 Ray (Matches Porcelain Theme) */}
                <div 
                  className="w-full h-full block dark:hidden"
                  style={{
                    background: 'conic-gradient(from 354deg at 50% 50%, transparent 0deg, rgba(15, 23, 42, 0.02) 2deg, rgba(15, 23, 42, 0.18) 6deg, rgba(15, 23, 42, 0.08) 11deg, rgba(15, 23, 42, 0.02) 18deg, transparent 24deg)'
                  }}
                />
                {/* Dark Mode: Subtle Warm Amber Conic Ray */}
                <div 
                  className="w-full h-full hidden dark:block"
                  style={{
                    background: 'conic-gradient(from 354deg at 50% 50%, transparent 0deg, rgba(217, 163, 83, 0.04) 2deg, rgba(217, 163, 83, 0.30) 6deg, rgba(217, 163, 83, 0.16) 11deg, rgba(217, 163, 83, 0.04) 18deg, transparent 24deg)'
                  }}
                />
              </div>

              {/* Precision Core Needle (Slim 1.5px Ray, Centered at 12 oclock, Aligned with 6deg peak) */}
              <div 
                style={{ filter: 'blur(1px)' }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-1/2 origin-bottom bg-gradient-to-t from-slate-950/80 dark:from-[#d9a353]/70 via-slate-900/35 dark:via-[#d9a353]/30 to-transparent"
              />
            </div>

            {/* ── Detected Items Layer (Positions Scale Harmoniously With Rings) ── */}
            <div className="absolute inset-0 pointer-events-none">
              {RADAR_TARGETS.map((target, idx) => {
                const rad = (target.angle * Math.PI) / 180;
                const x = target.radius * Math.sin(rad);
                const y = -target.radius * Math.cos(rad);

                const dotColors = {
                  valid: 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.85)]',
                  stale: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.85)]',
                  gate: 'bg-slate-950 dark:bg-[#d9a353] shadow-[0_0_8px_rgba(15,23,42,0.5)] dark:shadow-[0_0_8px_rgba(217,163,83,0.85)]',
                }[target.type];

                const textColors = {
                  valid: 'text-teal-700 dark:text-teal-300',
                  stale: 'text-rose-700 dark:text-rose-300',
                  gate: 'text-slate-950 dark:text-amber-300',
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
          </motion.div>

          {/* ── Theater Mode Scroll Cue (Visible only during Fullscreen Hold) ── */}
          <motion.div 
            style={{ opacity: cueOpacity }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 pointer-events-none select-none"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold bg-white/60 dark:bg-black/60 px-3 py-1 rounded-full border border-slate-300/40 dark:border-white/10 backdrop-blur-md">
              Scroll to continue ↓
            </span>
          </motion.div>

          {/* ── Bottom Clean Action Bar (Zero Explanatory Fluff) ── */}
          <motion.div 
            style={{ opacity: chromeOpacity }}
            className="relative z-30 flex items-center justify-end pt-2 border-t border-slate-200/80 dark:border-white/10"
          >
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
          </motion.div>

        </motion.div>

      </div>

    </section>
  );
}
