import React, { useState } from 'react';

/**
 * CavdaxWordmark
 * 
 * Official Bespoke Typographic Wordmark for CAVDAX
 * Rendered in Swiss Neo-Grotesk Architectural Typography (Space Grotesk & Inter)
 * with the "C-to-X" Directed Causal Edge Animation:
 * - Root Graph Node (●) drops under 'C' (Cause / Context) at x=159
 * - Directed Causal Vector draws across the baseline
 * - Decision Graph Node (●) marks the midpoint under 'D' (Decision) at x=565
 * - Forward Chevron (>) terminates sharply under 'X' (eXecution) at x=885
 * - Continuous subtle Causal Pulse loop across the edge
 *
 * @param {number} width - Component display width in pixels (aspect ratio 1000:240)
 * @param {string} className - Optional Tailwind / CSS classes for colors and positioning
 * @param {boolean} animated - Whether to play the initial C-to-X reveal animation (default: true)
 * @param {boolean} pulse - Whether to enable the continuous subtle photon pulse loop (default: true)
 */
export const CAVDAX_WORDMARK_LETTERS_PATH =
  // Retained as clean vector definition for fallback / canvas pointillist particle sampling
  "M 90 25 C 130 25, 160 55, 160 95 L 125 95 C 125 75, 110 60, 90 60 C 70 60, 55 75, 55 95 C 55 115, 70 130, 90 130 C 110 130, 125 115, 125 95 L 160 95 C 160 135, 130 165, 90 165 C 50 165, 20 135, 20 95 C 20 55, 50 25, 90 25 Z";

export default function CavdaxWordmark({
  width = 460,
  className = "",
  animated = true,
  pulse = true,
}) {
  const [key] = useState(0);

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        key={key}
        viewBox="0 0 1000 240"
        width={width}
        className="overflow-visible text-slate-900 dark:text-white transition-colors duration-500"
      >
        <style>{`
          /* Letters Clean Reveal */
          .wm-letters-fade {
            animation: wmLettersReveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
            opacity: 0;
          }
          @keyframes wmLettersReveal {
            0% { opacity: 0; transform: translateY(4px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          /* Context Node Drop (under 'C') */
          .wm-node-drop {
            transform-origin: 159px 195px;
            animation: wmNodeDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards;
            opacity: 0;
          }
          @keyframes wmNodeDrop {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.35); opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
            100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 2px currentColor); }
          }

          /* Decision Node Drop (under 'D') */
          .wm-node-d {
            transform-origin: 565px 195px;
            animation: wmNodeDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.25s forwards;
            opacity: 0;
          }

          /* Execution Node Drop (under 'X') */
          .wm-node-x {
            transform-origin: 841px 195px;
            animation: wmNodeDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.65s forwards;
            opacity: 0;
          }

          /* C-to-X Arrow Shaft Left-to-Right Draw */
          .wm-shaft-draw {
            stroke-dasharray: 730;
            stroke-dashoffset: 730;
            animation: wmShaftDraw 1.0s cubic-bezier(0.16, 1, 0.3, 1) 0.85s forwards;
          }
          @keyframes wmShaftDraw {
            0% { stroke-dashoffset: 730; }
            100% { stroke-dashoffset: 0; }
          }

          /* Sleek Arrow Tip Snap */
          .wm-arrow-snap {
            transform-origin: 885px 195px;
            animation: wmArrowSnap 0.4s cubic-bezier(0.16, 1, 0.3, 1) 1.85s forwards;
            opacity: 0;
          }
          @keyframes wmArrowSnap {
            0% { opacity: 0; transform: scale(0.4) translateX(-8px); }
            60% { opacity: 1; transform: scale(1.15) translateX(0); filter: drop-shadow(0 0 4px currentColor); }
            100% { opacity: 1; transform: scale(1) translateX(0); }
          }

          /* Synchronized Line Pulse across all 3 phases (every 4.5s = 3x in 13.5s cycle) */
          .wm-causal-pulse {
            stroke-dasharray: 80 730;
            animation: wmPulseLoop 4.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite;
          }
          @keyframes wmPulseLoop {
            0%, 5% { stroke-dashoffset: 730; opacity: 0; }
            15% { opacity: 0.95; filter: drop-shadow(0 0 6px currentColor); }
            45% { opacity: 0.95; stroke-dashoffset: 0; filter: drop-shadow(0 0 6px currentColor); }
            55%, 100% { stroke-dashoffset: -80; opacity: 0; }
          }

          /* Staggered Word-by-Word Reveal (13.5s Cycle):
             Phase 1 (0% - 31%): CAVDAX Full-Form Acronym words appear sequentially, hold, exit.
             Phase 2 (33% - 64%): Explore the CAVDAX Causal Engine appears sequentially, holds, exits.
             Phase 3 (66% - 96%): Immunize Your Codebase Against Architectural Rot appears sequentially, holds, exits.
             Breath Pause (96% - 100%): Subtle breath pause before clean loop restart.
          */
          @keyframes wmWord_0 {
            0% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            3%, 27% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            31%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmWord_1 {
            0%, 3% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            6%, 27% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            31%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmWord_2 {
            0%, 6% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            9%, 27% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            31%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmWord_3 {
            0%, 9% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            12%, 27% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            31%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmWord_4 {
            0%, 12% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            15%, 27% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            31%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmWord_5 {
            0%, 15% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            18%, 27% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            31%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmWord_6 {
            0%, 18% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            22%, 27% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            31%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }

          /* Phase 2: Explore the CAVDAX Causal Engine */
          @keyframes wmExp_0 {
            0%, 33% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            36%, 60% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            64%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmExp_1 {
            0%, 36% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            39%, 60% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            64%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmExp_2 {
            0%, 39% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            43%, 60% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            64%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmExp_3 {
            0%, 43% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            47%, 60% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            64%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmExp_4 {
            0%, 47% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            51%, 60% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            64%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }

          /* Phase 3: Immunize Your Codebase Against Architectural Rot */
          @keyframes wmImm_0 {
            0%, 66% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            69%, 92% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            96%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmImm_1 {
            0%, 69% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            72%, 92% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            96%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmImm_2 {
            0%, 72% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            76%, 92% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            96%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmImm_3 {
            0%, 76% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            79%, 92% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            96%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmImm_4 {
            0%, 79% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            83%, 92% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            96%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }
          @keyframes wmImm_5 {
            0%, 83% { opacity: 0; transform: translateY(4px); filter: blur(3px); }
            87%, 92% { opacity: 1; transform: translateY(0); filter: blur(0px); }
            96%, 100% { opacity: 0; transform: translateY(-4px); filter: blur(3px); }
          }

          .wm-word-0 { opacity: 0; animation: wmWord_0 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-word-1 { opacity: 0; animation: wmWord_1 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-word-2 { opacity: 0; animation: wmWord_2 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-word-3 { opacity: 0; animation: wmWord_3 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-word-4 { opacity: 0; animation: wmWord_4 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-word-5 { opacity: 0; animation: wmWord_5 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-word-6 { opacity: 0; animation: wmWord_6 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }

          .wm-exp-0 { opacity: 0; animation: wmExp_0 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-exp-1 { opacity: 0; animation: wmExp_1 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-exp-2 { opacity: 0; animation: wmExp_2 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-exp-3 { opacity: 0; animation: wmExp_3 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-exp-4 { opacity: 0; animation: wmExp_4 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }

          .wm-imm-0 { opacity: 0; animation: wmImm_0 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-imm-1 { opacity: 0; animation: wmImm_1 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-imm-2 { opacity: 0; animation: wmImm_2 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-imm-3 { opacity: 0; animation: wmImm_3 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-imm-4 { opacity: 0; animation: wmImm_4 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
          .wm-imm-5 { opacity: 0; animation: wmImm_5 13.5s cubic-bezier(0.16, 1, 0.3, 1) 2.2s infinite both; }
        `}</style>

        {/* 1. CAVDAX Bespoke Architectural Wordmark Typography */}
        <text
          x="500"
          y="155"
          textAnchor="middle"
          fill="currentColor"
          className={animated ? "wm-letters-fade" : ""}
          style={{
            fontFamily: '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: '150px',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textRendering: 'geometricPrecision'
          }}
        >
          CAVDAX
        </text>

        {/* 2. C-to-X Directed Causal Arrow Underline */}
        <g fill="currentColor" stroke="currentColor">
          {/* Baseline Causal Edge Shaft (Draws from C through D to X) */}
          <line
            x1="159"
            y1="195"
            x2="872"
            y2="195"
            strokeWidth="3.6"
            strokeLinecap="round"
            className={animated ? "wm-shaft-draw" : ""}
          />

          {/* Root Graph Node (●) under 'C' (Cause / Context) */}
          <circle
            cx="159"
            cy="195"
            r="7.5"
            stroke="none"
            className={animated ? "wm-node-drop" : ""}
          />

          {/* Intermediate Graph Node (●) under 'D' (Decision) */}
          <circle
            cx="565"
            cy="195"
            r="6.5"
            stroke="none"
            className={animated ? "wm-node-d" : ""}
          />

          {/* Terminal Graph Node (●) under 'X' (Execution) */}
          <circle
            cx="841"
            cy="195"
            r="6.5"
            stroke="none"
            className={animated ? "wm-node-x" : ""}
          />

          {/* Optional Luminous Causal Photon Pulse */}
          {pulse && (
            <line
              x1="159"
              y1="195"
              x2="872"
              y2="195"
              strokeWidth="4.8"
              strokeLinecap="round"
              className="wm-causal-pulse pointer-events-none"
              style={{ opacity: 0 }}
            />
          )}

          {/* Sleek, Razor-Sharp Terminal Arrowhead */}
          <path
            d="M 868 188 L 885 195 L 868 202 L 871 195 Z"
            fill="currentColor"
            stroke="none"
            className={animated ? "wm-arrow-snap" : ""}
          />
        </g>
      </svg>

      {/* 3. Staggered Word-by-Word Subheading Carousel (3 Symmetrical Phases) */}
      <div
        id="wordmark-subtext-container"
        aria-label="Contextual Action & Verified Decision Autonomous eXecution — Explore the CAVDAX Causal Engine — Immunize Your Codebase Against Architectural Rot"
        className="mt-3 sm:mt-4 relative min-h-[26px] sm:min-h-[28px] w-full flex items-center justify-center font-mono text-[11px] sm:text-xs md:text-[13px] tracking-[0.16em] uppercase select-none pointer-events-none"
      >
        {/* Phase 1: Contextual Action & Verified Decision Autonomous eXecution */}
        <div className="absolute inset-0 flex items-center justify-center gap-x-2 gap-y-1 flex-wrap text-center">
          <span className="wm-word-0 inline-block">
            <span className="font-extrabold text-slate-900 dark:text-white">C</span>
            <span className="text-slate-600 dark:text-slate-400">ontextual</span>
          </span>
          <span className="wm-word-1 inline-block">
            <span className="font-extrabold text-slate-900 dark:text-white">A</span>
            <span className="text-slate-600 dark:text-slate-400">ction</span>
          </span>
          <span className="wm-word-2 inline-block text-slate-500 dark:text-slate-500 font-semibold">
            &amp;
          </span>
          <span className="wm-word-3 inline-block">
            <span className="font-extrabold text-slate-900 dark:text-white">V</span>
            <span className="text-slate-600 dark:text-slate-400">erified</span>
          </span>
          <span className="wm-word-4 inline-block">
            <span className="font-extrabold text-slate-900 dark:text-white">D</span>
            <span className="text-slate-600 dark:text-slate-400">ecision</span>
          </span>
          <span className="wm-word-5 inline-block">
            <span className="font-extrabold text-slate-900 dark:text-white">A</span>
            <span className="text-slate-600 dark:text-slate-400">utonomous</span>
          </span>
          <span className="wm-word-6 inline-block">
            <span className="text-slate-600 dark:text-slate-400">e</span>
            <span className="font-extrabold text-slate-900 dark:text-white">X</span>
            <span className="text-slate-600 dark:text-slate-400">ecution</span>
          </span>
        </div>

        {/* Phase 2: Explore the CAVDAX Causal Engine */}
        <div className="absolute inset-0 flex items-center justify-center gap-x-2 gap-y-1 flex-wrap text-center">
          <span className="wm-exp-0 inline-block text-slate-600 dark:text-slate-400 font-medium">
            Explore
          </span>
          <span className="wm-exp-1 inline-block text-slate-600 dark:text-slate-400 font-medium">
            the
          </span>
          <span className="wm-exp-2 inline-block font-extrabold text-slate-900 dark:text-white">
            CAVDAX
          </span>
          <span className="wm-exp-3 inline-block text-slate-600 dark:text-slate-400 font-medium">
            Causal
          </span>
          <span className="wm-exp-4 inline-block text-slate-600 dark:text-slate-400 font-medium">
            Engine
          </span>
        </div>

        {/* Phase 3: Immunize Your Codebase Against Architectural Rot */}
        <div className="absolute inset-0 flex items-center justify-center gap-x-2 gap-y-1 flex-wrap text-center">
          <span className="wm-imm-0 inline-block font-extrabold text-slate-900 dark:text-white">
            Immunize
          </span>
          <span className="wm-imm-1 inline-block text-slate-600 dark:text-slate-400 font-medium">
            Your
          </span>
          <span className="wm-imm-2 inline-block font-extrabold text-slate-900 dark:text-white">
            Codebase
          </span>
          <span className="wm-imm-3 inline-block text-slate-600 dark:text-slate-400 font-medium">
            Against
          </span>
          <span className="wm-imm-4 inline-block text-slate-600 dark:text-slate-400 font-medium">
            Architectural
          </span>
          <span className="wm-imm-5 inline-block font-extrabold text-slate-900 dark:text-white">
            Rot
          </span>
        </div>
      </div>
    </div>
  );
}
