import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { playClick } from '../utils/soundFx';
import Hub from './ui/hub';

/**
 * CausalEnclaveHub.jsx — The Causal Interception Enclave (Hero Theater Scroller)
 * 
 * Architectural Highlights:
 * - 3D Grid Rotation: Starts in front-face top view at Core (Stage 0) and smoothly
 *   rotates in 3D perspective to side isometric view as you scroll through sectors.
 * - Dynamic 2D-to-3D Node Bloom: Glyphs exist statically on the 2D surface of the tile lid;
 *   as the node elevates, the glyph physically rises with the slab and blossoms into a 
 *   front-facing card badge (zero lag, continuous physical motion).
 * - Watery Arc Reactor Fluid Fill: When Core is active or hovered, an internal wave
 *   rises inside the triangle with a subtle luminous liquid ripple.
 * - Physics Spring Settle: Arc Reactor smoothly settles down with zero jerk.
 * - Solitary Node Elevation: Strictly the active node rises (FALL = [1, 0, 0, 0, 0]).
 * - Clean Typography: Subtitle tag removed alongside heading for pure Swiss typography.
 * - Clean Cursor: Default normal cursor restored.
 */

const ENCLAVE_STAGES = [
  {
    id: 'kernel',
    indexStr: 'CORE',
    title: 'Causal Semiring Kernel',
    tag: 'FalkorDB GraphBLAS Matrix',
    desc: 'Central algebraic semiring computing reachability and causal invalidation in sub-2ms sweeps.',
    coord: [200, 182],
    restCoord: [200, 169.66],
    elevatedCoord: [200, 169.66]
  },
  {
    id: 'claude-mcp',
    indexStr: '01',
    title: 'Claude Code MCP Gate',
    tag: 'Tool Gate Interceptor',
    desc: 'Intercepts filesystem write operations in-flight, blocking obsolete code mutations before disk writes.',
    coord: [205, 112],
    restCoord: [204.98, 112.57],
    elevatedCoord: [204.98, 70.50]
  },
  {
    id: 'cursor-stdio',
    indexStr: '02',
    title: 'Cursor IDE Transceiver',
    tag: 'In-Flight Stdio Stream',
    desc: 'Low-latency stdio bridge delivering instant topological feedback directly into editor buffers.',
    coord: [260, 144],
    restCoord: [260.36, 144.61],
    elevatedCoord: [260.36, 102.54]
  },
  {
    id: 'git-ast',
    indexStr: '03',
    title: 'Git AST Diff Extractor',
    tag: 'Optical Parser Engine',
    desc: 'Extracts architectural deltas from commit graphs, detecting implementation drift from active ADRs.',
    coord: [328, 179],
    restCoord: [328.18, 179.77],
    elevatedCoord: [328.18, 137.70]
  },
  {
    id: 'adr-store',
    indexStr: '04',
    title: 'ADR Invariant Store',
    tag: 'Architectural Ledger',
    desc: 'Single source of truth, preserving superseded and active decision lineages to prevent semantic blindness.',
    coord: [263, 207],
    restCoord: [262.85, 207.46],
    elevatedCoord: [262.85, 165.39]
  },
  {
    id: 'falkordb-mesh',
    indexStr: '05',
    title: 'GraphBLAS Matrix Mesh',
    tag: 'Reachability Semiring',
    desc: 'Sparse matrix algebraic semiring computing multi-hop reachability across the full dependency DAG.',
    coord: [201, 243],
    restCoord: [200.62, 244.17],
    elevatedCoord: [200.62, 202.10]
  },
  {
    id: 'cicd-gate',
    indexStr: '06',
    title: 'CI/CD Gate Harness',
    tag: 'PR Enforcement Gate',
    desc: 'Fails pull requests automatically if code commits rely on deprecated architectural claims.',
    coord: [131, 209],
    restCoord: [130.93, 209.95],
    elevatedCoord: [130.93, 167.88]
  },
  {
    id: 'audit-ledger',
    indexStr: '07',
    title: 'Cryptographic Audit Trail',
    tag: 'Signed Verification Log',
    desc: 'Tamper-evident execution ledger capturing every agent interception and deterministic verdict.',
    coord: [76, 177],
    restCoord: [75.55, 177.90],
    elevatedCoord: [75.55, 135.83]
  },
  {
    id: 'repair-loop',
    indexStr: '08',
    title: 'Closed-Loop Auto-Repair',
    tag: 'Autonomous Self-Healing',
    desc: 'Returns the exact causal desync path upon block, prompting the agent to self-heal without human triage.',
    coord: [136, 141],
    restCoord: [135.91, 142.12],
    elevatedCoord: [135.91, 100.06]
  }
];

// Authentic isometric squircle contour matching the physical center slab lid
const SQUIRCLE_CONTOUR = "M 2.49 7.47 L 1.96 7.69 L 1.35 7.85 L 0.69 7.95 L 0 7.98 L -0.69 7.95 L -1.35 7.85 L -1.96 7.69 L -2.49 7.47 L -14.93 1.24 L -15.37 0.98 L -15.7 0.67 L -15.9 0.34 L -15.97 0 L -15.9 -0.34 L -15.7 -0.67 L -15.37 -0.98 L -14.93 -1.24 L -2.49 -7.47 L -1.96 -7.69 L -1.35 -7.85 L -0.69 -7.95 L 0 -7.98 L 0.69 -7.95 L 1.35 -7.85 L 1.96 -7.69 L 2.49 -7.47 L 14.93 -1.24 L 15.37 -0.98 L 15.7 -0.67 L 15.9 -0.34 L 15.97 0 L 15.9 0.34 L 15.7 0.67 L 15.37 0.98 L 14.93 1.24 Z";

// 3D Camera Angles: Cinematic dynamic tracking, orbit tilt, and zoom for each subsystem stage
const STAGE_CAMERAS = [
  // 0: CORE (Architectural Overview - Front-Face Top Perspective)
  { pitch: 30, yaw: 0, roll: 0, tx: 0, ty: 22, tz: -30, scale: 0.94 },
  
  // 1: Claude Code MCP Gate (Top-Center: Camera pitches up, shifts down to center top node)
  { pitch: 10, yaw: 0, roll: 0, tx: 0, ty: 38, tz: 40, scale: 1.08 },
  
  // 2: Cursor IDE Transceiver (Top-Right: Camera pans left, yaws slightly toward right corner)
  { pitch: 7, yaw: -6, roll: 0, tx: -34, ty: 22, tz: 35, scale: 1.07 },
  
  // 3: Git AST Diff Extractor (East Flank: Camera pans left, yaws inward to frame right wing)
  { pitch: 3, yaw: -8, roll: 0, tx: -55, ty: 0, tz: 45, scale: 1.08 },
  
  // 4: ADR Invariant Store (Bottom-Right: Camera pans left-up, tilts downward)
  { pitch: -6, yaw: -6, roll: 0, tx: -35, ty: -24, tz: 35, scale: 1.07 },
  
  // 5: GraphBLAS Matrix Mesh (Bottom-Center: Camera pitches down, shifts up to center bottom node)
  { pitch: -10, yaw: 0, roll: 0, tx: 0, ty: -42, tz: 40, scale: 1.08 },
  
  // 6: CI/CD Gate Harness (Bottom-Left: Camera pans right-up, yaws inward)
  { pitch: -6, yaw: 6, roll: 0, tx: 35, ty: -24, tz: 35, scale: 1.07 },
  
  // 7: Cryptographic Audit Trail (West Flank: Camera pans right, yaws inward to frame left wing)
  { pitch: 3, yaw: 8, roll: 0, tx: 55, ty: 0, tz: 45, scale: 1.08 },
  
  // 8: Closed-Loop Auto-Repair (Top-Left: Camera pans right-down, yaws toward top-left corner)
  { pitch: 7, yaw: 6, roll: 0, tx: 34, ty: 22, tz: 35, scale: 1.07 },
];

// Clean vector icons for each subsystem
function SubsystemGlyphVector({ stepIndex }) {
  const gProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    vectorEffect: "non-scaling-stroke"
  };

  switch (stepIndex) {
    case 1: // Claude MCP Gate: Interception Barrier Port
      return (
        <g {...gProps}>
          {/* Stanchion gateway boundaries */}
          <path d="M -5.5 -4.5 V 4.5" />
          <path d="M 5.5 -4.5 V 4.5" />
          {/* In-flight tool call interception beam with central trigger node */}
          <line x1="-5.5" y1="0" x2="-1.8" y2="0" />
          <line x1="1.8" y1="0" x2="5.5" y2="0" />
          <circle cx="0" cy="0" r="1.3" fill="currentColor" />
        </g>
      );
    case 2: // Cursor Stdio Transceiver: Stream prompt (Universal IDE standard)
      return (
        <g {...gProps}>
          <path d="M-5 -4L0 0L-5 4" />
          <line x1="2" y1="4" x2="6" y2="4" />
        </g>
      );
    case 3: // Git AST Diff Extractor: Canonical Git Branch & Syntax Delta
      return (
        <g {...gProps}>
          <circle cx="-3" cy="-3.5" r="1.5" />
          <circle cx="-3" cy="3.5" r="1.5" />
          <circle cx="3.5" cy="0" r="1.5" />
          <path d="M -3 -2 V 2" />
          <path d="M -3 0 Q 0 0 2 0" />
        </g>
      );
    case 4: // ADR Invariant Store: Architectural Decision Record Sheet
      return (
        <g {...gProps}>
          <path d="M -4.5 -5.5 H 1.5 L 4.5 -2.5 V 5.5 H -4.5 Z" />
          <path d="M 1.5 -5.5 V -2.5 H 4.5" />
          <line x1="-2.2" y1="0.5" x2="2.2" y2="0.5" />
          <line x1="-2.2" y1="3" x2="1" y2="3" />
        </g>
      );
    case 5: // GraphBLAS Matrix Mesh: Authentic Sparse Adjacency Matrix
      return (
        <g {...gProps}>
          {/* Matrix boundary brackets [ ] */}
          <path d="M -3.5 -5 H -5.5 V 5 H -3.5" />
          <path d="M 3.5 -5 H 5.5 V 5 H 3.5" />
          {/* Nonzero sparse coordinate entries with adjacency link */}
          <circle cx="-2.2" cy="-2.2" r="1" fill="currentColor" />
          <circle cx="1.8" cy="-1.8" r="1" fill="currentColor" />
          <circle cx="0" cy="1" r="1" fill="currentColor" />
          <circle cx="-1.8" cy="3" r="1" fill="currentColor" />
          <line x1="-2.2" y1="-2.2" x2="0" y2="1" strokeWidth="0.8" />
          <line x1="0" y1="1" x2="1.8" y2="-1.8" strokeWidth="0.8" />
        </g>
      );
    case 6: // CI/CD Gate Harness: PR Merge Verification Pipeline
      return (
        <g {...gProps}>
          <circle cx="-3.5" cy="-3.5" r="1.5" />
          <circle cx="-3.5" cy="3.5" r="1.5" />
          <circle cx="3.5" cy="3.5" r="1.5" />
          <path d="M -3.5 -2 V 2" />
          <path d="M 3.5 2 V -0.5 Q 3.5 -3.5 0 -3.5" />
        </g>
      );
    case 7: // Cryptographic Audit Trail: Interlinked Merkle Ledger Chain
      return (
        <g {...gProps}>
          <rect x="-5.5" y="-3" width="5.5" height="6" rx="2" />
          <rect x="0" y="-3" width="5.5" height="6" rx="2" />
          <line x1="-1" y1="0" x2="1" y2="0" strokeWidth="1.5" />
        </g>
      );
    case 8: // Closed-Loop Auto-Repair: Precision Dual-Arrow Self-Healing Cycle
      return (
        <g {...gProps}>
          {/* Top Arc (Clockwise from left to upper-right) */}
          <path d="M -4.8 0 A 4.8 4.8 0 0 1 4.5 -2" />
          <path d="M 4.5 -5.2 V -2 H 1.5" />
          {/* Bottom Arc (Clockwise from right to lower-left) */}
          <path d="M 4.8 0 A 4.8 4.8 0 0 1 -4.5 2" />
          <path d="M -4.5 5.2 V 2 H -1.5" />
        </g>
      );
    default:
      return null;
  }
}

export default function CausalEnclaveHub() {
  const containerRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isHoveredCore, setIsHoveredCore] = useState(false);

  // References for strict lock and gesture handling
  const isLockedRef = useRef(false);
  const isExitingRef = useRef(false);
  const exitAttemptRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const activeStepRef = useRef(0);
  const lastScrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const isHoveringCanvasRef = useRef(false);

  // Centralized Atomic State Setter (Synchronizes activeStep and activeStepRef synchronously)
  const setStep = useCallback((valOrFn) => {
    setActiveStep((prev) => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      activeStepRef.current = next;
      return next;
    });
  }, []);

  // Sync activeStepRef with state
  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  // Scroll progress for theater dimming envelope
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

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
  const backdropVisibility = useTransform(backdropOpacity, (val) => (val > 0.002 ? 'visible' : 'hidden'));

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

  // Smooth exit functions
  const exitDownward = useCallback(() => {
    isExitingRef.current = true;
    isLockedRef.current = false;
    setIsLocked(false);

    if (window.__lenis) {
      window.__lenis.isLocked = false;
      window.__lenis.start();
      window.__lenis.scrollTo('#causal-loop-section', {
        offset: -20,
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      document.getElementById('causal-loop-section')?.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
      isExitingRef.current = false;
      isTransitioningRef.current = false;
    }, 950);
  }, []);

  const exitUpward = useCallback(() => {
    isExitingRef.current = true;
    isLockedRef.current = false;
    setIsLocked(false);

    if (window.__lenis) {
      window.__lenis.isLocked = false;
      window.__lenis.start();
      window.__lenis.scrollTo('#problem-section', {
        offset: -20,
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      document.getElementById('problem-section')?.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
      isExitingRef.current = false;
      isTransitioningRef.current = false;
    }, 950);
  }, []);

  // 1. Viewport Docking: Lock IN when reached
  useEffect(() => {
    const handleScrollCheck = () => {
      if (typeof window !== 'undefined' && window.__isProgrammaticScroll) {
        if (isLockedRef.current) {
          isLockedRef.current = false;
          setIsLocked(false);
          if (window.__lenis) {
            window.__lenis.isLocked = false;
            window.__lenis.start();
          }
        }
        return;
      }

      if (isExitingRef.current) return;
      const el = containerRef.current;
      if (!el) return;

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY >= lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Scrolled completely out: release lock
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

      // Docking check: center reaches center of viewport
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const isDocked = (Math.abs(sectionCenter - viewportCenter) < viewportHeight * 0.42) ||
                       (rect.top <= viewportHeight * 0.42 && rect.bottom >= viewportHeight * 0.58);

      if (!isLockedRef.current && isDocked) {
        isLockedRef.current = true;
        setIsLocked(true);
        exitAttemptRef.current = false;

        if (scrollingDown) {
          setStep(0);
        } else {
          setStep(ENCLAVE_STAGES.length - 1);
        }

        if (window.__lenis) {
          window.__lenis.isLocked = true;
          window.__lenis.stop();
        }

        // Center element smoothly in window
        const targetScroll = currentScrollY + rect.top - (viewportHeight - rect.height) / 2;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    };

    window.addEventListener('scroll', handleScrollCheck, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollCheck);
  }, []);

  // 2. Wheel & Touch Event Hijacking while locked
  useEffect(() => {
    const handleWheel = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
      if (!isLockedRef.current && !inView) return;
      if (isExitingRef.current) return;

      if (e.cancelable) e.preventDefault();
      if (isTransitioningRef.current) return;

      const current = activeStepRef.current;
      const delta = e.deltaY;

      if (Math.abs(delta) > 18) {
        if (delta > 0) {
          // Scrolling Down -> Advance Stage
          if (current < ENCLAVE_STAGES.length - 1) {
            isTransitioningRef.current = true;
            exitAttemptRef.current = false;
            playClick();
            setStep((prev) => Math.min(ENCLAVE_STAGES.length - 1, prev + 1));
            setTimeout(() => { isTransitioningRef.current = false; }, 480);
          } else {
            // On Last Step: Require secondary impulse to exit downward
            if (!exitAttemptRef.current) {
              exitAttemptRef.current = true;
              setTimeout(() => { exitAttemptRef.current = false; }, 650);
            } else {
              exitDownward();
            }
          }
        } else {
          // Scrolling Up -> Reverse Stage
          if (current > 0) {
            isTransitioningRef.current = true;
            exitAttemptRef.current = false;
            playClick();
            setStep((prev) => Math.max(0, prev - 1));
            setTimeout(() => { isTransitioningRef.current = false; }, 480);
          } else {
            // On First Step: Require secondary impulse to exit upward
            if (!exitAttemptRef.current) {
              exitAttemptRef.current = true;
              setTimeout(() => { exitAttemptRef.current = false; }, 650);
            } else {
              exitUpward();
            }
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
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const diffY = touchStartYRef.current - touchY;
      const diffX = touchStartXRef.current - touchX;
      const dominant = Math.abs(diffX) > Math.abs(diffY) ? diffX : diffY;

      if (Math.abs(dominant) > 35) {
        if (e.cancelable) e.preventDefault();
        const current = activeStepRef.current;

        if (dominant > 35) {
          if (current < ENCLAVE_STAGES.length - 1) {
            isTransitioningRef.current = true;
            playClick();
            setStep((prev) => Math.min(ENCLAVE_STAGES.length - 1, prev + 1));
            setTimeout(() => { isTransitioningRef.current = false; }, 480);
          } else {
            exitDownward();
          }
        } else if (dominant < -35) {
          if (current > 0) {
            isTransitioningRef.current = true;
            playClick();
            setStep((prev) => Math.max(0, prev - 1));
            setTimeout(() => { isTransitioningRef.current = false; }, 480);
          } else {
            exitUpward();
          }
        }
        touchStartYRef.current = touchY;
        touchStartXRef.current = touchX;
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
  }, [exitDownward, exitUpward]);

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

      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
      if (!isLockedRef.current && !inView) return;
      const current = activeStepRef.current;

      // Dedicated Horizontal Node Navigation (Left / Right Arrow)
      if (e.key === 'ArrowRight') {
        if (activeStepRef.current < ENCLAVE_STAGES.length - 1) {
          e.preventDefault();
          playClick();
          setStep(activeStepRef.current + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeStepRef.current > 0) {
          e.preventDefault();
          playClick();
          setStep(activeStepRef.current - 1);
        }
      }
      // Vertical Keyboard Browsing (ArrowDown, PageDown, Space)
      else if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        if (activeStepRef.current < ENCLAVE_STAGES.length - 1) {
          playClick();
          setStep(activeStepRef.current + 1);
        } else {
          // Lock OUT downward to Solution Scroller
          exitDownward();
        }
      }
      // Vertical Keyboard Browsing (ArrowUp, PageUp, Shift+Space)
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        if (activeStepRef.current > 0) {
          playClick();
          setStep(activeStepRef.current - 1);
        } else {
          // Lock OUT upward to Problem section
          exitUpward();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitDownward, exitUpward]);

  // Current camera target for the active stage (Stage 0 = Top View, Stages 1..8 = Side View)
  const baseCam = STAGE_CAMERAS[activeStep] || STAGE_CAMERAS[0];
  const currentStage = ENCLAVE_STAGES[activeStep] || ENCLAVE_STAGES[0];
  const isCoreActive = activeStep === 0;

  return (
    <section
      ref={containerRef}
      id="enclave-hub-section" 
      tabIndex={0}
      role="region"
      aria-label="Causal Interception Enclave"
      className="relative w-full min-h-[100dvh] py-8 sm:py-12 px-4 sm:px-8 flex flex-col items-center justify-between z-[60] border-none overflow-hidden outline-none focus:outline-none"
    >
      {/* ── Fixed Heavy Dimming & Blur Backdrop (Focusing Exclusively on Diagram) ── */}
      <motion.div 
        style={{
          opacity: backdropOpacity,
          visibility: backdropVisibility,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
        }}
        className="fixed inset-0 z-[70] bg-white/94 dark:bg-[#060709]/96 pointer-events-none will-change-[opacity,backdrop-filter]"
      />

      {/* ── Fullscreen Open Theater Container ── */}
      <div className="relative w-full min-h-[85vh] max-w-[1300px] 2xl:max-w-[1500px] flex flex-col justify-between items-center z-[80] my-auto">
        
        {/* ── Top HUD Navigation: Section Title & Step Jumper Pills ── */}
        <div className="w-full flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-950 dark:text-white tracking-widest uppercase">
              The Causal Interception Enclave
            </span>
          </div>

          {/* Minimal Numbered Stage Jumpers (CORE, 01..08) */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
            {ENCLAVE_STAGES.map((stg, idx) => {
              const isActive = idx === activeStep;
              return (
                <button
                  key={stg.id}
                  type="button"
                  onClick={() => {
                    playClick();
                    setStep(idx);
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-full font-mono text-[10px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                    isActive 
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs scale-105' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {stg.indexStr}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Center Stage: Massive Radar-Scale 3D Viewport with Top-to-Side Camera Rotation ── */}
        <div 
          className="w-full flex-1 flex flex-col items-center justify-center my-2 sm:my-4 relative"
          style={{ perspective: '1400px', perspectiveOrigin: 'center center' }}
        >
          
          <div 
            onPointerEnter={() => { isHoveringCanvasRef.current = true; }}
            onPointerLeave={() => { isHoveringCanvasRef.current = false; }}
            className="w-full max-w-[1040px] 2xl:max-w-[1180px] aspect-[16/11] max-h-[620px] sm:max-h-[700px] flex items-center justify-center relative select-none will-change-transform cursor-default"
            style={{
              transform: `rotateX(${baseCam.pitch}deg) rotateY(${baseCam.yaw}deg) rotateZ(${baseCam.roll}deg) translate3d(${baseCam.tx}px, ${baseCam.ty}px, ${baseCam.tz}px) scale(${baseCam.scale})`,
              transformStyle: 'preserve-3d',
              transition: 'transform 1.05s cubic-bezier(0.25, 1, 0.35, 1)',
              '--hl-plate': 'var(--hub-plate, #060709)',
              '--hl-hi': 'var(--hub-hi, #F8FAFC)',
              '--hl-edge': 'var(--hub-edge, #CBD5E1)',
              '--hl-lo': 'var(--hub-lo, rgba(255, 255, 255, 0.30))',
              '--hl-mid': 'var(--hub-mid, rgba(255, 255, 255, 0.38))',
              '--hl-sw': '1px'
            }}
          >
            <style>{`
              .dark #enclave-hub-section {
                --hub-plate: #060709;
                --hub-hi: #F8FAFC;
                --hub-edge: #CBD5E1;
                --hub-lo: rgba(255, 255, 255, 0.30);
                --hub-mid: rgba(255, 255, 255, 0.38);
              }
              html:not(.dark) #enclave-hub-section {
                --hub-plate: #FFFFFF;
                --hub-hi: #0F172A;
                --hub-edge: #475569;
                --hub-lo: rgba(0, 0, 0, 0.18);
                --hub-mid: rgba(0, 0, 0, 0.26);
              }
              #enclave-hub-section svg {
                width: 100%;
                height: 100%;
                overflow: visible;
              }
              #enclave-hub-section .sil {
                fill: var(--hl-plate);
                stroke: var(--hub-edge);
                stroke-width: var(--hl-sw);
                vector-effect: non-scaling-stroke;
                stroke-linejoin: round;
                stroke-linecap: round;
                transition: stroke 260ms cubic-bezier(0.32, 0.72, 0, 1);
              }
              #enclave-hub-section .sil.hi {
                stroke: var(--hub-hi);
              }
              #enclave-hub-section .nf {
                fill: none;
                stroke-width: var(--hl-sw);
                vector-effect: non-scaling-stroke;
                stroke-linejoin: round;
                stroke-linecap: round;
              }
              #enclave-hub-section .nf.lo {
                stroke: var(--hub-lo);
              }
              #enclave-hub-section .nf.hi {
                stroke: var(--hub-hi);
              }
              @keyframes enclave-text-shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              .enclave-shimmer-title {
                background: linear-gradient(110deg, #94a3b8 25%, #ffffff 50%, #94a3b8 75%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: enclave-text-shimmer 2.8s linear infinite;
              }
              html:not(.dark) .enclave-shimmer-title {
                background: linear-gradient(110deg, #334155 25%, #0f172a 50%, #334155 75%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: enclave-text-shimmer 2.8s linear infinite;
              }
              @keyframes arc-fluid-ripple {
                0% { transform: translateX(-4px); }
                100% { transform: translateX(4px); }
              }
              .arc-fluid-wave {
                animation: arc-fluid-ripple 3s ease-in-out infinite alternate;
              }
            `}</style>
            
            <Hub
              activeTile={activeStep === 0 ? -1 : activeStep - 1}
              intensity={1}
              onRead={(text) => {
                // If user physically moves pointer over tiles on 3D canvas
                if (!isHoveringCanvasRef.current) return;
                if (text && text.startsWith('tile ')) {
                  const idx = parseInt(text.replace('tile ', ''), 10);
                  if (idx >= 1 && idx <= 8 && idx !== activeStepRef.current) {
                    playClick();
                    setStep(idx);
                  }
                } else if (text === 'rest') {
                  // Pointer physically over the central Core hub
                  if (activeStepRef.current !== 0) {
                    playClick();
                    setStep(0);
                  }
                }
              }}
            />

            {/* ── Overlay Layer: Iron Man Arc Reactor & 2D-to-3D Blooming Subsystem Glyphs ── */}
            <svg 
              viewBox="0 0 400 320" 
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible select-none"
              aria-hidden="true"
            >
              <defs>
                {/* Precise Cutout ClipPath for Iron Man Arc Reactor Inner Cavity */}
                <clipPath id="arc-reactor-inner-clip">
                  <path d="M-4.2 -2.1L4.2 -2.1L0 2.5Z" />
                </clipPath>
              </defs>

              {/* 1. Center Kernel: Iron Man Monochromatic Arc Reactor & Concentric Causal Wavefronts */}
              <g 
                transform="translate(200, 169.66)"
                onPointerEnter={() => setIsHoveredCore(true)}
                onPointerLeave={() => setIsHoveredCore(false)}
                className="cursor-pointer pointer-events-auto"
              >
                {/* Concentric Squircle Causal Wavefront Propagation on Authentic Outline */}
                {(isCoreActive || isHoveredCore) && (
                  <g className="pointer-events-none select-none">
                    <style>{`
                      @keyframes squircle-wave-1 {
                        0% { transform: scale(1); opacity: 0.75; }
                        100% { transform: scale(1.48); opacity: 0; }
                      }
                      @keyframes squircle-wave-2 {
                        0% { transform: scale(1); opacity: 0.75; }
                        100% { transform: scale(1.48); opacity: 0; }
                      }
                      .squircle-pulse-1 {
                        animation: squircle-wave-1 2.4s cubic-bezier(0.2, 0.8, 0.25, 1) infinite;
                        transform-origin: 0px 0px;
                      }
                      .squircle-pulse-2 {
                        animation: squircle-wave-2 2.4s cubic-bezier(0.2, 0.8, 0.25, 1) infinite 1.2s;
                        transform-origin: 0px 0px;
                      }
                    `}</style>

                    {/* Specular Glow Accent directly highlighting the existing slab squircle rim */}
                    <path
                      d={SQUIRCLE_CONTOUR}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      vectorEffect="non-scaling-stroke"
                      shapeRendering="geometricPrecision"
                      className="text-slate-900/70 dark:text-white/80"
                    />

                    {/* Concentric Wavefront 1 (Exact Isometric Squircle Contour) */}
                    <path
                      d={SQUIRCLE_CONTOUR}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.9"
                      vectorEffect="non-scaling-stroke"
                      shapeRendering="geometricPrecision"
                      className="text-slate-900/40 dark:text-white/50 squircle-pulse-1"
                    />

                    {/* Concentric Wavefront 2 (Exact Isometric Squircle Contour) */}
                    <path
                      d={SQUIRCLE_CONTOUR}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.9"
                      vectorEffect="non-scaling-stroke"
                      shapeRendering="geometricPrecision"
                      className="text-slate-900/40 dark:text-white/50 squircle-pulse-2"
                    />
                  </g>
                )}

                {/* Mark VI Arc Reactor Centerpiece: 100% Vector Direct-Display List (Zero Offscreen Texture Blur) */}
                <motion.g 
                  animate={{
                    y: (isCoreActive || isHoveredCore) ? -12 : 0
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 16,
                    mass: 0.6
                  }}
                >
                  {/* Subtle Fluid Wave Fill Layer (Mounted ONLY when Core active or hovered to eliminate background repaints) */}
                  {(isCoreActive || isHoveredCore) && (
                    <g clipPath="url(#arc-reactor-inner-clip)">
                      {/* Inner core specular base layer */}
                      <path
                        d="M-4.2 -2.1L4.2 -2.1L0 2.5Z"
                        className="fill-slate-900/10 dark:fill-white/20"
                      />
                      <motion.g
                        initial={{ y: 4.5, opacity: 0 }}
                        animate={{ y: -1.0, opacity: 0.95 }}
                        transition={{
                          duration: 0.55,
                          ease: [0.2, 0.9, 0.3, 1]
                        }}
                      >
                        <path
                          d="M -10 0 Q -5 -1.5, 0 0 T 10 0 L 10 8 L -10 8 Z"
                          className="fill-slate-950 dark:fill-white arc-fluid-wave"
                        />
                      </motion.g>
                    </g>
                  )}

                  {/* Outer Monochromatic Specular Halo (Layered Vectors - 100% Vector Direct Pipeline) */}
                  {(isCoreActive || isHoveredCore) && (
                    <>
                      <path 
                        d="M-7.5 -3.8L7.5 -3.8L0 4.5Z" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-white/20 hidden dark:block" 
                        strokeWidth="3.2" 
                        strokeLinejoin="round" 
                        vectorEffect="non-scaling-stroke"
                        shapeRendering="geometricPrecision"
                      />
                      <path 
                        d="M-7.5 -3.8L7.5 -3.8L0 4.5Z" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-white/40 hidden dark:block" 
                        strokeWidth="2.0" 
                        strokeLinejoin="round" 
                        vectorEffect="non-scaling-stroke"
                        shapeRendering="geometricPrecision"
                      />
                    </>
                  )}

                  {/* Outer Inverted Equilateral Triangle (Mark VI Arc Reactor - Razor-Sharp Direct Geometry) */}
                  <path 
                    d="M-7.5 -3.8L7.5 -3.8L0 4.5Z" 
                    fill="none" 
                    stroke="currentColor" 
                    className={isCoreActive || isHoveredCore ? "text-slate-950 dark:text-white" : "text-slate-500/80 dark:text-slate-400/80"} 
                    strokeWidth="1.2" 
                    strokeLinejoin="round" 
                    vectorEffect="non-scaling-stroke"
                    shapeRendering="geometricPrecision"
                  />

                  {/* Inner Concentric Bevel Cutout Rim */}
                  <path 
                    d="M-4.2 -2.1L4.2 -2.1L0 2.5Z" 
                    fill="none" 
                    stroke="currentColor" 
                    className={isCoreActive || isHoveredCore ? "text-slate-600 dark:text-slate-300" : "text-slate-400/60 dark:text-slate-500/60"} 
                    strokeWidth="0.8" 
                    strokeLinejoin="round" 
                    vectorEffect="non-scaling-stroke"
                    shapeRendering="geometricPrecision"
                  />
                </motion.g>
              </g>

              {/* 2. All 8 Subsystem Nodes: Seamless 2D Surface -> Elevating 3D Blooming Card Transition */}
              {ENCLAVE_STAGES.slice(1).map((stg, i) => {
                const stepIdx = i + 1;
                const isThisNodeActive = activeStep === stepIdx;

                return (
                  <g
                    key={stg.id}
                    transform={`translate(${stg.restCoord[0]}, ${stg.restCoord[1]})`}
                    className="pointer-events-none select-none"
                  >
                    <motion.g
                      animate={{
                        // 0 = resting at floor lid; -42 = elevated tile lid; -56 = floating 3D badge position
                        y: isThisNodeActive ? -56 : 0,
                        opacity: isThisNodeActive ? 1.0 : 0.45
                      }}
                      transition={{
                        y: isThisNodeActive
                          ? { type: 'spring', stiffness: 90, damping: 15, mass: 0.7 }
                          : { type: 'spring', stiffness: 60, damping: 14, mass: 0.8, delay: 0.04 },
                        opacity: isThisNodeActive
                          ? { duration: 0.25, ease: 'easeOut' }
                          : { duration: 0.35, delay: 0.05, ease: 'easeInOut' }
                      }}
                      className="origin-center"
                    >
                      {/* Front-Facing Floating Badge (Vector card blooms smoothly on elevation, collapses on descent) */}
                      <motion.g
                        animate={{
                          opacity: isThisNodeActive ? 1 : 0,
                          scale: isThisNodeActive ? 1 : 0.75
                        }}
                        transition={{
                          duration: isThisNodeActive ? 0.28 : 0.22,
                          delay: isThisNodeActive ? 0.05 : 0,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className="origin-center"
                      >
                        {/* Pure vector ambient drop shadow - zero raster blur */}
                        <rect
                          x="-12"
                          y="-10.5"
                          width="24"
                          height="24"
                          rx="6"
                          className="fill-black/10 dark:fill-black/40"
                        />
                        {/* Crisp card plate */}
                        <rect
                          x="-12"
                          y="-12"
                          width="24"
                          height="24"
                          rx="6"
                          className="fill-white dark:fill-[#0c0f14] stroke-slate-300/90 dark:stroke-white/20"
                          strokeWidth="1"
                        />
                      </motion.g>

                      {/* Monochromatic Vector Emblem (Smooth bidirectional transition: 2D isometric squash <-> front-facing) */}
                      <motion.g
                        animate={{
                          scaleY: isThisNodeActive ? 1.0 : 0.52
                        }}
                        transition={{
                          scaleY: isThisNodeActive
                            ? { type: 'spring', stiffness: 90, damping: 15, mass: 0.7 }
                            : { type: 'spring', stiffness: 60, damping: 14, mass: 0.8, delay: 0.04 }
                        }}
                        className={isThisNodeActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}
                      >
                        <SubsystemGlyphVector stepIndex={stepIdx} />
                      </motion.g>
                    </motion.g>
                  </g>
                );
              })}
            </svg>

          </div>

        </div>

        {/* ── Bottom HUD Readout: Smooth Shimmering Typography (Zero Layout Shifts) ── */}
        <div className="w-full pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex-1 max-w-3xl min-h-[50px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-baseline gap-3"
              >
                {/* Pure Node Title (Subtext tag removed per industry minimalism directives) */}
                <span className="font-mono text-base sm:text-lg font-bold tracking-tight enclave-shimmer-title">
                  {currentStage.title}
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentStage.desc}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.28, delay: 0.04 }}
                className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sans leading-relaxed mt-0.5"
              >
                {currentStage.desc}
              </motion.p>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
