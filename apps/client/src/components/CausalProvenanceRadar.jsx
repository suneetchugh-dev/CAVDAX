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
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// ─── Compact Domain Targets (Strictly Contained Within Inner Orbits) ───────────
const RADAR_TARGETS = [
  {
    id: 'adr-002',
    name: 'ADR-002: OAuth2',
    description: 'ADR-002: OAuth2 — Validated root invariant across active services',
    type: 'valid',
    angle: 42,
    radiusRatio: 0.36,
  },
  {
    id: 'fact-stale',
    name: 'TokenAuth.v1 (Stale)',
    description: 'TokenAuth.v1 (Stale) — Cache rot detected; disk write quarantined',
    type: 'stale',
    angle: 318,
    radiusRatio: 0.44,
  },
  {
    id: 'mcp-gate',
    name: 'apply_code_change',
    description: 'apply_code_change — Intercepted at protocol gate for Cypher verification',
    type: 'gate',
    angle: 125,
    radiusRatio: 0.54,
  },
  {
    id: 'dec-103',
    name: 'DEC-103: RS256',
    description: 'DEC-103: RS256 — Token signing invariant grounded in active architecture',
    type: 'valid',
    angle: 198,
    radiusRatio: 0.62,
  },
  {
    id: 'adr-001',
    name: 'ADR-001 (Superseded)',
    description: 'ADR-001 (Superseded) — Deprecated requirement isolated in memory',
    type: 'stale',
    angle: 255,
    radiusRatio: 0.66,
  },
];

export default function CausalProvenanceRadar() {
  const containerRef = useRef(null);
  const beamRef = useRef(null);
  const targetsRef = useRef([]);
  const currentActiveRef = useRef(null);
  const [activeTarget, setActiveTarget] = useState(null);

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

  // ─── Calibrated 128vh Scrollytelling Runway (Trimmed Negative Space Below) ───
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end end'],
  });

  // Monumental instrument size calibrated to viewport (enlarged & spacious)
  const maxAvailable = Math.min(viewport.width * 0.82, viewport.height * 0.78, 560);
  const BASE_DIAMETER = Math.max(320, maxAvailable);
  const radarRadius = BASE_DIAMETER / 2;

  // ─── Refined Zoom Curve & Tightened Negative Space ────────────────────────
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
  const radarScale = useTransform(scrollYProgress, [0.05, 0.24, 0.76, 0.92], [0.65, 1.25, 1.25, 0.65]);

  // ─── 60fps Synchronized Sweep & Smooth Phosphor Decay Engine (Pauses when off-screen) ───
  useEffect(() => {
    let animId = null;
    let isRunning = false;
    const DURATION_MS = 14000; // 14s calm, human-readable sweep
    let startTime = performance.now();

    const frame = (now) => {
      const elapsed = (now - startTime) % DURATION_MS;
      const beamAngle = (elapsed / DURATION_MS) * 360;
      let discovered = null;
      let maxOpacity = 0;

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

        // Calibrated phosphor sweep curve with human-readable dwell time (~3s per discovery)
        if (delta >= 348 && delta < 360) {
          const t = (delta - 348) / 12;
          opacity = t * t * (3 - 2 * t);
          scale = 0.96 + opacity * 0.04;
        } else if (delta >= 0 && delta <= 12) {
          opacity = 1;
          scale = 1.0;
        } else if (delta > 12 && delta <= 65) {
          const decayProgress = (delta - 12) / 53;
          opacity = Math.pow(1 - decayProgress, 1.8);
          scale = 1.0 - decayProgress * 0.04;
        } else {
          opacity = 0;
        }

        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.pointerEvents = opacity > 0.12 ? 'auto' : 'none';

        if (opacity > maxOpacity && opacity > 0.16) {
          maxOpacity = opacity;
          discovered = target;
        }
      });

      if (currentActiveRef.current !== (discovered ? discovered.id : null)) {
        currentActiveRef.current = discovered ? discovered.id : null;
        setActiveTarget(discovered);
      }

      if (isRunning) {
        animId = requestAnimationFrame(frame);
      }
    };

    const startSweep = () => {
      if (!isRunning) {
        isRunning = true;
        animId = requestAnimationFrame(frame);
      }
    };

    const stopSweep = () => {
      isRunning = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    // Pause radar animation when not visible in viewport to preserve CPU/GPU
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startSweep();
      } else {
        stopSweep();
      }
    }, { threshold: 0.04 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    } else {
      startSweep();
    }

    return () => {
      stopSweep();
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={containerRef} id="radar-section" className="relative w-full h-[128vh] z-[60] border-none">
      
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
                    <span className={`text-[9.5px] sm:text-[10.5px] font-mono font-medium tracking-tight whitespace-nowrap drop-shadow-xs transition-colors ${textColors}`}>
                      {target.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Subtext Telemetry Display STRICTLY BELOW the Radar (Shifted down with generous top breathing room) ── */}
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 text-center pointer-events-none select-none z-30 h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeTarget && (
              <motion.p
                key={activeTarget.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs sm:text-sm md:text-[15px] font-sans font-medium tracking-tight text-slate-800 dark:text-slate-200 whitespace-nowrap text-center drop-shadow-xs"
              >
                {activeTarget.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

      </div>

    </section>
  );
}
