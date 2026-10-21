/**
 * CausalProvenanceRadar.jsx — CAVDAX Pure Unbounded Invalidation Radar
 *
 * Ultra-Minimalist Full-Bleed HUD:
 *  - ZERO borders, ZERO cards, ZERO buttons, ZERO text chrome.
 *  - Compact, Screen-Calibrated Targets:
 *    • Targets stay strictly INSIDE the radar boundary (max radius ratio: 0.66)
 *    • Crisp, refined monospace font (text-[9px] sm:text-[10px]) scaled proportionally
 *  - Refined Scrollytelling Immersion (Zero Empty Void):
 *    • Tight 150vh runway eliminates excessive negative space below the section
 *    • Seamless F11 Full Screen single-section containment
 *    • Smooth, dramatic zoom (0.60x -> 1.28x) with instant backdrop blur/dimming
 *  - Theme-Calibrated: Premium Slate-950 in light mode, Warm Amber in dark mode
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ─── Compact Domain Targets (Strictly Contained Within Inner Orbits) ───────────
const RADAR_TARGETS = [
  {
    id: 'adr-002',
    name: 'ADR-002: OAuth2',
    type: 'valid',
    angle: 42,
    radiusRatio: 0.36,  // Inner track
  },
  {
    id: 'fact-stale',
    name: 'TokenAuth.v1 (Stale)',
    type: 'stale',
    angle: 318,
    radiusRatio: 0.44,  // Inner-mid track
  },
  {
    id: 'mcp-gate',
    name: 'apply_code_change',
    type: 'gate',
    angle: 125,
    radiusRatio: 0.54,  // Mid track
  },
  {
    id: 'dec-103',
    name: 'DEC-103: RS256',
    type: 'valid',
    angle: 198,
    radiusRatio: 0.62,  // Mid-outer track
  },
  {
    id: 'adr-001',
    name: 'ADR-001 (Superseded)',
    type: 'stale',
    angle: 255,
    radiusRatio: 0.66,  // Safely inside outer boundary (0.66 vs 1.0)
  },
];

export default function CausalProvenanceRadar() {
  const containerRef = useRef(null);
  const beamRef = useRef(null);
  const targetsRef = useRef([]);

  // Responsive Viewport Tracking (Dynamic for F11 Full Screen & Standard Laptops)
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

  // ─── Tight 150vh Scrollytelling Runway (Eliminates Excessive Gap Below) ─────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end end'],
  });

  // Base instrument size calibrated to viewport (fits perfectly in F11 mode)
  const maxAvailable = Math.min(viewport.width * 0.72, viewport.height * 0.72, 460);
  const BASE_DIAMETER = Math.max(280, maxAvailable);
  const radarRadius = BASE_DIAMETER / 2;

  // ─── Refined Zoom Curve (0.60x -> 1.28x) ──────────────────────────────────
  // 0.00 -> 0.04: Approaching in natural flow
  // 0.04 -> 0.22: Instant backdrop blur/dimming & smooth forward zoom
  // 0.22 -> 0.78: Fullscreen Theater Hold (Balanced, zero-overflow view)
  // 0.78 -> 0.94: Smooth reverse zoom back to flow
  // 0.94 -> 1.00: Seamless transition into FAQ section below
  const backdropOpacity = useTransform(scrollYProgress, [0.01, 0.14, 0.84, 0.96], [0, 1, 1, 0]);
  const radarScale = useTransform(scrollYProgress, [0.04, 0.22, 0.78, 0.94], [0.60, 1.28, 1.28, 0.60]);

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

        // Subtle, tight phosphor sweep curve (visibility arc: ~60° = ~1.6s)
        if (delta >= 350 && delta < 360) {
          const t = (delta - 350) / 10;
          opacity = t * t * (3 - 2 * t);
          scale = 0.96 + opacity * 0.04;
        } else if (delta >= 0 && delta <= 8) {
          opacity = 1;
          scale = 1.0;
        } else if (delta > 8 && delta <= 50) {
          const decayProgress = (delta - 8) / 42;
          opacity = Math.pow(1 - decayProgress, 2.0);
          scale = 1.0 - decayProgress * 0.04;
        } else {
          opacity = 0;
        }

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
    <section ref={containerRef} id="radar-section" className="relative w-full h-[150vh] z-[60] border-none">
      
      {/* ── Fixed Heavy Dimming & Blur Backdrop (Navbar & Page Fully Disappear) ── */}
      <motion.div 
        style={{ opacity: backdropOpacity }}
        className="fixed inset-0 z-[70] bg-white/94 dark:bg-[#07090b]/96 backdrop-blur-3xl pointer-events-none will-change-transform"
      />

      {/* ── Sticky Fullscreen Stage (Fits 100% in Single Viewport, Zero Overflow) ── */}
      <div className="sticky top-0 h-[100dvh] w-full flex items-center justify-center overflow-hidden z-[80] pointer-events-none">

        {/* ── Pure Unbounded Radar Canvas (0.60x -> 1.28x Controlled Zoom) ── */}
        <motion.div 
          style={{ 
            scale: radarScale,
            width: `${BASE_DIAMETER}px`,
            height: `${BASE_DIAMETER}px`,
          }}
          className="relative flex items-center justify-center pointer-events-none will-change-transform"
        >
          {/* Concentric Range Rings */}
          <div 
            style={{ width: `${BASE_DIAMETER * 0.28}px`, height: `${BASE_DIAMETER * 0.28}px` }} 
            className="absolute rounded-full border border-slate-300/60 dark:border-white/10" 
          />
          <div 
            style={{ width: `${BASE_DIAMETER * 0.52}px`, height: `${BASE_DIAMETER * 0.52}px` }} 
            className="absolute rounded-full border border-slate-300/50 dark:border-white/10" 
          />
          <div 
            style={{ width: `${BASE_DIAMETER * 0.76}px`, height: `${BASE_DIAMETER * 0.76}px` }} 
            className="absolute rounded-full border border-slate-300/40 dark:border-white/10" 
          />
          <div 
            style={{ width: `${BASE_DIAMETER}px`, height: `${BASE_DIAMETER}px` }} 
            className="absolute rounded-full border border-slate-300/30 dark:border-white/15" 
          />

          {/* Symmetrical Crosshair Axes */}
          <div style={{ width: `${BASE_DIAMETER}px` }} className="absolute h-px border-b border-dashed border-slate-300/50 dark:border-white/10" />
          <div style={{ height: `${BASE_DIAMETER}px` }} className="absolute w-px border-r border-dashed border-slate-300/50 dark:border-white/10" />

          {/* Center Emitter Vertex Anchor */}
          <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-950/5 dark:bg-amber-500/10 border border-slate-950/20 dark:border-amber-500/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950 dark:bg-[#d9a353]" />
          </div>

          {/* Theme-Calibrated Precision Light Ray (Subtle, Tight 24° Beam, Zero Tip Dot) */}
          <div 
            ref={beamRef}
            style={{ 
              width: `${BASE_DIAMETER}px`, 
              height: `${BASE_DIAMETER}px`,
              transformOrigin: 'center center' 
            }}
            className="absolute flex items-center justify-center pointer-events-none will-change-transform"
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

          {/* ── Detected Items Layer (Strictly Contained Inside Outer Boundary) ── */}
          <div className="absolute inset-0 pointer-events-none">
            {RADAR_TARGETS.map((target, idx) => {
              const rad = (target.angle * Math.PI) / 180;
              const distance = radarRadius * target.radiusRatio;
              const x = distance * Math.sin(rad);
              const y = -distance * Math.cos(rad);

              const dotColors = {
                valid: 'bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.85)]',
                stale: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.85)]',
                gate: 'bg-slate-950 dark:bg-[#d9a353] shadow-[0_0_6px_rgba(15,23,42,0.5)] dark:shadow-[0_0_6px_rgba(217,163,83,0.85)]',
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
                  className="group absolute z-30 select-none will-change-transform"
                >
                  <div className="relative flex items-center gap-1.5 -translate-x-1.5 -translate-y-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors}`} />
                    <span className={`text-[9px] sm:text-[10px] font-mono font-medium tracking-tight whitespace-nowrap drop-shadow-xs transition-colors ${textColors}`}>
                      {target.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>

    </section>
  );
}
