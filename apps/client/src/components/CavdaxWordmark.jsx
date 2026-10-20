import React, { useState } from 'react';

/**
 * CavdaxWordmark
 * 
 * Official Bespoke Typographic Wordmark for CAVDAX
 * Ported from original source: Z+\Z+ Assets\Logo\Components\CavdaxWordmark.jsx
 * Featuring the EXP-4 "C-to-X" Directed Causal Edge Animation:
 * - Root Graph Node (●) drops under 'C' (Cause / Context)
 * - Directed Causal Vector draws across the baseline
 * - Forward Chevron (>) terminates sharply under 'X' (eXecution)
 * - Continuous subtle Causal Pulse loop across the edge
 *
 * @param {number} width - Component display width in pixels (aspect ratio 1000:260)
 * @param {string} className - Optional Tailwind / CSS classes for colors and positioning
 * @param {boolean} animated - Whether to play the initial C-to-X reveal animation (default: true)
 * @param {boolean} pulse - Whether to enable the continuous subtle photon pulse loop (default: true)
 */
// Exact vector paths for CAVDAX architectural letterforms (Topology: 9 closed contour loops)
export const CAVDAX_WORDMARK_LETTERS_PATH =
  
    "M 21.9 21.1 L 163.2 21.1 L 163.2 59.6 L 68.4 59.6 L 68.4 150.0 L 163.2 150.0 L 163.2 188.6 L 21.9 188.6 Z " +
    "M 181.6 188.6 L 244.7 20.2 L 276.3 20.2 L 339.5 188.6 L 293.9 188.6 L 280.7 151.8 L 240.4 151.8 L 227.2 188.6 Z " +
    "M 230.7 123.7 L 289.5 123.7 L 260.5 47.4 Z " +
    "M 328.9 20.2 L 377.2 20.2 L 407.0 148.2 L 436.8 20.2 L 485.1 20.2 L 430.7 188.6 L 383.3 188.6 Z " +
    "M 508.8 20.2 L 599.1 20.2 C 625.0 20.2 647.4 42.6 647.4 68.5 L 647.4 140.3 C 647.4 166.2 625.0 188.6 599.1 188.6 L 508.8 188.6 Z " +
    "M 554.4 60.5 L 554.4 148.3 L 594.7 148.3 C 607.7 148.3 618.3 137.7 618.3 124.7 L 618.3 84.1 C 618.3 71.1 607.7 60.5 594.7 60.5 Z " +
    "M 661.4 188.6 L 724.6 20.2 L 756.1 20.2 L 819.3 188.6 L 773.7 188.6 L 760.5 151.8 L 720.2 151.8 L 707.0 188.6 Z " +
    "M 712.3 124.6 L 769.3 124.6 L 740.8 46.5 Z " +
    "M 830.7 20.2 L 878.1 20.2 L 903.5 86.8 L 929.0 20.2 L 976.3 20.2 L 928.1 104.4 L 976.3 188.6 L 929.0 188.6 L 903.5 122.0 L 878.1 188.6 L 830.7 188.6 L 878.9 104.4 Z";

export default function CavdaxWordmark({
  width = 460,
  className = "",
  animated = true,
  pulse = true,
}) {
  const [key] = useState(0);

  const lettersPath = CAVDAX_WORDMARK_LETTERS_PATH;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        key={key}
        viewBox="0 0 1000 260"
        width={width}
        className="overflow-visible text-slate-900 dark:text-white transition-colors duration-500"
      >
        <style>{`
          /* Letters Clean Reveal */
          .wm-letters-fade {
            animation: wmLettersReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes wmLettersReveal {
            0% { opacity: 0; transform: translateY(3px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          /* Context Node Drop (under 'C') */
          .wm-node-drop {
            transform-origin: 92px 223px;
            animation: wmNodeDrop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards;
            opacity: 0;
          }
          @keyframes wmNodeDrop {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.35); opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
            100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 2px currentColor); }
          }

          /* Decision Node Drop (under 'D') */
          .wm-node-d {
            transform-origin: 578px 223px;
            animation: wmNodeDrop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s forwards;
            opacity: 0;
          }

          /* Execution Node Drop (under 'X') */
          .wm-node-x {
            transform-origin: 903px 223px;
            animation: wmNodeDrop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s forwards;
            opacity: 0;
          }

          /* C-to-X Arrow Shaft Left-to-Right Draw */
          .wm-shaft-draw {
            stroke-dasharray: 860;
            stroke-dashoffset: 860;
            animation: wmShaftDraw 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.85s forwards;
          }
          @keyframes wmShaftDraw {
            0% { stroke-dashoffset: 860; }
            100% { stroke-dashoffset: 0; }
          }

          /* Sleek Arrow Tip Snap */
          .wm-arrow-snap {
            transform-origin: 938px 223px;
            animation: wmArrowSnap 0.4s cubic-bezier(0.16, 1, 0.3, 1) 1.75s forwards;
            opacity: 0;
          }
          @keyframes wmArrowSnap {
            0% { opacity: 0; transform: scale(0.4) translateX(-8px); }
            60% { opacity: 1; transform: scale(1.15) translateX(0); filter: drop-shadow(0 0 4px currentColor); }
            100% { opacity: 1; transform: scale(1) translateX(0); }
          }

          /* Subtle Continuous Causal Pulse Loop */
          .wm-causal-pulse {
            stroke-dasharray: 80 860;
            animation: wmPulseLoop 4.2s cubic-bezier(0.4, 0, 0.2, 1) 2.4s infinite;
          }
          @keyframes wmPulseLoop {
            0% { stroke-dashoffset: 860; opacity: 0; }
            15% { opacity: 0.9; filter: drop-shadow(0 0 5px currentColor); }
            70% { opacity: 0.9; filter: drop-shadow(0 0 5px currentColor); }
            85%, 100% { stroke-dashoffset: -80; opacity: 0; }
          }
        `}</style>

        {/* 1. CAVDAX Architectural Letters (Pure Geometric Vector Contours) */}
        <path
          d={lettersPath}
          fill="currentColor"
          fillRule="evenodd"
          className={animated ? "wm-letters-fade" : ""}
        />

        {/* 2. C-to-X Directed Causal Arrow Underline (Matching Final.jpg & wordmark-sleek-c-to-x-arrow.jpg) */}
        <g fill="currentColor" stroke="currentColor">
          {/* Baseline Causal Edge Shaft (Draws from C across through D to X) */}
          <line
            x1="92"
            y1="223"
            x2="928"
            y2="223"
            strokeWidth="3.8"
            strokeLinecap="round"
            className={animated ? "wm-shaft-draw" : ""}
          />

          {/* Root Graph Node (●) under 'C' (Cause / Context) */}
          <circle
            cx="92"
            cy="223"
            r="8"
            stroke="none"
            className={animated ? "wm-node-drop" : ""}
          />

          {/* Intermediate Graph Node (●) under 'D' (Decision) */}
          <circle
            cx="578"
            cy="223"
            r="7"
            stroke="none"
            className={animated ? "wm-node-d" : ""}
          />

          {/* Terminal Graph Node (●) under 'X' (Execution) */}
          <circle
            cx="903"
            cy="223"
            r="7"
            stroke="none"
            className={animated ? "wm-node-x" : ""}
          />

          {/* Optional Luminous Causal Photon Pulse */}
          {pulse && (
            <line
              x1="92"
              y1="223"
              x2="928"
              y2="223"
              strokeWidth="5"
              strokeLinecap="round"
              className="wm-causal-pulse pointer-events-none"
              style={{ opacity: 0 }}
            />
          )}

          {/* Sleek, Razor-Sharp Terminal Arrowhead (Matching Final.jpg) */}
          <path
            d="M 922 216 L 938 223 L 922 230 L 925 223 Z"
            fill="currentColor"
            stroke="none"
            className={animated ? "wm-arrow-snap" : ""}
          />
        </g>
      </svg>
    </div>
  );
}
