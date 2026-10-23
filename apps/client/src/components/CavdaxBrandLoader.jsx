import React from 'react';

/**
 * CavdaxBrandLoader Component
 * 
 * Choreography: Original EXP-1 Diligent & Fluid Cycle (Z+\Z+ Assets\Logo\Components\CavdaxBrandLoader.jsx)
 * Purpose: Global splash screen, route transition loader, and interactive hover navbar mark.
 * 
 * Features:
 * - animateOnHover=false (SplashLoader): Continuous fluid cycle with nodes inception,
 *   outer letterforms, staggered DAG edges (spine, wings, bridge), and specular white lock flash.
 *   Strictly scoped to .cavdax-fluid-loader.
 * - animateOnHover=true (Navbar): Crisp, static mark by default. When hovered, plays the full
 *   staggered draw trace and specular lock flash. Strictly scoped to .cavdax-interactive-hover.
 * - isProcessing=true: When an active asynchronous operation is underway, pulses the fluid loop.
 */
export default function CavdaxBrandLoader({
  size = 140,
  strokeWidth = 4.2,
  hairlineWidth = 1.3,
  showBackdrop = false,
  className = "",
  colorClassName = "text-current",
  animateOnHover = false,
  isProcessing = false,
}) {
  const containerModeClass = isProcessing
    ? "cavdax-processing"
    : animateOnHover
    ? "cavdax-interactive-hover group"
    : "cavdax-fluid-loader";

  return (
    <div className={`cavdax-brand-container flex items-center justify-center ${containerModeClass} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className={`overflow-visible ${colorClassName}`}
        style={{ maxWidth: '100%', height: 'auto' }}
        aria-label="CAVDAX Logo"
      >
        <style>{`
          /* === 1. HOVER-ONLY & PROCESSING ANIMATION (Strictly Scoped for Navbar) === */
          .cavdax-interactive-hover .cavdax-stroke-c,
          .cavdax-interactive-hover .cavdax-stroke-v,
          .cavdax-interactive-hover .dag-spine,
          .cavdax-interactive-hover .dag-wing,
          .cavdax-interactive-hover .dag-bridge {
            stroke-dasharray: 72;
            stroke-dashoffset: 0;
            opacity: 1;
            transition: stroke-dashoffset 0.4s ease, opacity 0.25s ease;
          }
          .cavdax-interactive-hover .cavdax-nodes-group {
            opacity: 1;
            transform: scale(1);
            transform-origin: 46px 50px;
            transition: transform 0.25s ease, opacity 0.25s ease;
          }
          .cavdax-interactive-hover .cavdax-lock-ping {
            opacity: 0;
            transform-origin: 74px 50px;
          }

          /* Hover triggers */
          .cavdax-interactive-hover:hover .cavdax-stroke-c,
          .cavdax-interactive-hover.group:hover .cavdax-stroke-c {
            animation: cavdaxHoverTraceC 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .cavdax-interactive-hover:hover .cavdax-stroke-v,
          .cavdax-interactive-hover.group:hover .cavdax-stroke-v {
            animation: cavdaxHoverTraceV 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
          }
          .cavdax-interactive-hover:hover .dag-spine,
          .cavdax-interactive-hover.group:hover .dag-spine {
            animation: cavdaxHoverSpine 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.14s forwards;
          }
          .cavdax-interactive-hover:hover .dag-wing,
          .cavdax-interactive-hover.group:hover .dag-wing {
            animation: cavdaxHoverWing 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.28s forwards;
          }
          .cavdax-interactive-hover:hover .dag-bridge,
          .cavdax-interactive-hover.group:hover .dag-bridge {
            animation: cavdaxHoverBridge 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.44s forwards;
          }
          .cavdax-interactive-hover:hover .cavdax-nodes-group,
          .cavdax-interactive-hover.group:hover .cavdax-nodes-group {
            animation: cavdaxHoverNodePulse 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .cavdax-interactive-hover:hover .cavdax-lock-ping,
          .cavdax-interactive-hover.group:hover .cavdax-lock-ping {
            animation: cavdaxHoverLockPing 0.7s ease-in-out 0.58s forwards;
          }

          /* Processing triggers (When asynchronous task is active) */
          .cavdax-processing .cavdax-nodes-group {
            transform-origin: 46px 50px;
            animation: cavdaxNodesFluid 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }
          .cavdax-processing .cavdax-stroke-c {
            stroke-dasharray: 72;
            stroke-dashoffset: 72;
            animation: cavdaxStrokeCFluid 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }
          .cavdax-processing .cavdax-stroke-v {
            stroke-dasharray: 62;
            stroke-dashoffset: 62;
            animation: cavdaxStrokeVFluid 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }
          .cavdax-processing .dag-spine {
            stroke-dasharray: 32;
            stroke-dashoffset: 32;
            animation: cavdaxSpineDraw 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }
          .cavdax-processing .dag-wing {
            stroke-dasharray: 20;
            stroke-dashoffset: 20;
            animation: cavdaxWingDraw 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }
          .cavdax-processing .dag-bridge {
            stroke-dasharray: 16;
            stroke-dashoffset: 16;
            animation: cavdaxBridgeDraw 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }
          .cavdax-processing .cavdax-lock-ping {
            transform-origin: 74px 50px;
            animation: cavdaxLockPingFluid 3.2s ease-in-out infinite;
          }

          @keyframes cavdaxHoverTraceC {
            0% { stroke-dashoffset: 72; opacity: 0.3; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes cavdaxHoverTraceV {
            0% { stroke-dashoffset: 62; opacity: 0.3; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes cavdaxHoverSpine {
            0% { stroke-dashoffset: 32; opacity: 0; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes cavdaxHoverWing {
            0% { stroke-dashoffset: 20; opacity: 0; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes cavdaxHoverBridge {
            0% { stroke-dashoffset: 16; opacity: 0; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes cavdaxHoverNodePulse {
            0% { transform: scale(0.6); opacity: 0.4; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes cavdaxHoverLockPing {
            0% { opacity: 0; transform: scale(0.4); filter: drop-shadow(0 0 0px #ffffff); }
            50% { opacity: 0.95; transform: scale(1.08); filter: drop-shadow(0 0 4px #ffffff); }
            100% { opacity: 0; transform: scale(0.4); filter: drop-shadow(0 0 0px #ffffff); }
          }

          /* === 2. CONTINUOUS FLUID CYCLE (Strictly Scoped to .cavdax-fluid-loader) === */
          .cavdax-fluid-loader .cavdax-nodes-group {
            transform-origin: 46px 50px;
            animation: cavdaxNodesFluid 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }

          .cavdax-fluid-loader .cavdax-stroke-c {
            stroke-dasharray: 72;
            stroke-dashoffset: 72;
            animation: cavdaxStrokeCFluid 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }

          .cavdax-fluid-loader .cavdax-stroke-v {
            stroke-dasharray: 62;
            stroke-dashoffset: 62;
            animation: cavdaxStrokeVFluid 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }

          .cavdax-fluid-loader .dag-spine {
            stroke-dasharray: 32;
            stroke-dashoffset: 32;
            animation: cavdaxSpineDraw 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }

          .cavdax-fluid-loader .dag-wing {
            stroke-dasharray: 20;
            stroke-dashoffset: 20;
            animation: cavdaxWingDraw 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }

          .cavdax-fluid-loader .dag-bridge {
            stroke-dasharray: 16;
            stroke-dashoffset: 16;
            animation: cavdaxBridgeDraw 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }

          .cavdax-fluid-loader .cavdax-lock-ping {
            transform-origin: 74px 50px;
            animation: cavdaxLockPingFluid 4.8s ease-in-out infinite;
          }

          @keyframes cavdaxNodesFluid {
            0%, 5% { opacity: 0; transform: scale(0.25); }
            16%, 80% { opacity: 1; transform: scale(1); }
            88%, 100% { opacity: 0; transform: scale(0.25); }
          }

          @keyframes cavdaxStrokeCFluid {
            0%, 4% { stroke-dashoffset: 72; opacity: 0; }
            10% { opacity: 1; }
            28%, 78% { stroke-dashoffset: 0; opacity: 1; }
            88%, 100% { stroke-dashoffset: 72; opacity: 0; }
          }

          @keyframes cavdaxStrokeVFluid {
            0%, 10% { stroke-dashoffset: 62; opacity: 0; }
            16% { opacity: 1; }
            34%, 78% { stroke-dashoffset: 0; opacity: 1; }
            88%, 100% { stroke-dashoffset: 62; opacity: 0; }
          }

          @keyframes cavdaxSpineDraw {
            0%, 20% { stroke-dashoffset: 32; opacity: 0; }
            24% { opacity: 1; }
            38%, 78% { stroke-dashoffset: 0; opacity: 1; }
            86%, 100% { stroke-dashoffset: 32; opacity: 0; }
          }

          @keyframes cavdaxWingDraw {
            0%, 34% { stroke-dashoffset: 20; opacity: 0; }
            38% { opacity: 1; }
            52%, 78% { stroke-dashoffset: 0; opacity: 1; }
            86%, 100% { stroke-dashoffset: 20; opacity: 0; }
          }

          @keyframes cavdaxBridgeDraw {
            0%, 48% { stroke-dashoffset: 16; opacity: 0; }
            52% { opacity: 1; }
            64%, 78% { stroke-dashoffset: 0; opacity: 1; }
            86%, 100% { stroke-dashoffset: 16; opacity: 0; }
          }

          @keyframes cavdaxLockPingFluid {
            0%, 62% { opacity: 0; transform: scale(0.4); filter: drop-shadow(0 0 0px #ffffff); }
            67% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 6px #ffffff); }
            74%, 100% { opacity: 0; transform: scale(0.4); filter: drop-shadow(0 0 0px #ffffff); }
          }

          @media (prefers-reduced-motion: reduce) {
            .cavdax-nodes-group,
            .cavdax-stroke-c,
            .cavdax-stroke-v,
            .dag-spine,
            .dag-wing,
            .dag-bridge,
            .cavdax-lock-ping {
              animation: none !important;
              stroke-dashoffset: 0 !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}</style>

        {showBackdrop && (
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="18"
            className="fill-black/5 dark:fill-white/[0.03] stroke-slate-200 dark:stroke-white/10"
            strokeWidth="1"
          />
        )}

        {/* 1. OUTER LETTERFORM C (Swiss 90° Flat Cuts) */}
        <path
          className="cavdax-stroke-c stroke-current"
          d="M 46 27 A 23 23 0 0 0 46 73"
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />

        {/* 2. OUTER FORWARD CHEVRON > (Mitered Razor Apex) */}
        <path
          className="cavdax-stroke-v stroke-current"
          d="M 52 28 L 74 50 L 52 72"
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />

        {/* 3. STAGGERED 3-STAGE CAUSAL DAG CONNECTOR EDGES */}
        <g className="stroke-current" strokeWidth={hairlineWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Stage 1: Vertical Spine */}
          <path className="dag-spine" d="M 46 34 L 46 66" />
          
          {/* Stage 2: Symmetrical Wings & Center Line to Junction (58, 50) */}
          <path className="dag-wing" d="M 46 34 L 58 50" />
          <path className="dag-wing" d="M 46 66 L 58 50" />
          <path className="dag-wing" d="M 46 50 L 58 50" />

          {/* Stage 3: Forward Bridge to Chevron Apex */}
          <path className="dag-bridge" d="M 58 50 L 74 50" />
        </g>

        {/* 4. CAUSAL GRAPH NODES (Source, Fact, Decision) */}
        <g className="cavdax-nodes-group fill-current">
          <circle cx="46" cy="34" r="2.5" />
          <circle cx="46" cy="50" r="2.5" />
          <circle cx="46" cy="66" r="2.5" />
        </g>

        {/* Specular White Lock Flare */}
        <circle className="cavdax-lock-ping fill-current pointer-events-none" cx="74" cy="50" r="2.5" style={{ transformOrigin: '74px 50px' }} />
      </svg>
    </div>
  );
}
