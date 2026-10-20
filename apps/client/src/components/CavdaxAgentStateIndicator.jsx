import React, { useState, useEffect } from 'react';

/**
 * CavdaxAgentStateIndicator Component
 * 
 * Choreography: EXP-4 ("Vertex Mitosis" Dynamic Cognitive Architecture) - Sovereign Orbit & Morph
 * Purpose: Live Agent HUD status, MCP Gate execution monitor, and FalkorDB graph traversal indicator.
 * 
 * Key Upgrades:
 * 1. Unified Rotation in Reasoning:
 *    - The vertical spine edge AND the two daughter nodes rotate TOGETHER in locked synchronization 
 *      around the central pivot node (46, 50) after a brief 0.35s mitosis delay.
 * 2. Extended Checkmark & Scaled Micro-Nodes in Verified:
 *    - The 3 nodes morph to the Checkmark start, valley, and tip while scaling down to 65% size.
 *    - Checkmark lines extended: (41, 48) -> (46.5, 54.5) -> (56.5, 40.5).
 *    - Outside apex dot is removed.
 *    - Chevron remains proud and open.
 * 3. 1-Time Red Cross Strike on Rejected:
 *    - Cross strikes once, then rests steady with permanent warning glow; chevron closes inward.
 */
export default function CavdaxAgentStateIndicator({
  status = "idle", // 'idle' | 'reasoning' | 'executing' | 'verified' | 'rejected'
  size = 76,
  strokeWidth = 3.8,
  hairlineWidth = 1.3,
  showLabel = false,
  className = ""
}) {
  const [verifiedPhase, setVerifiedPhase] = useState(1);

  // Manage Verified 2-Phase evolution
  useEffect(() => {
    if (status === "verified") {
      setVerifiedPhase(1);
      const timer = setTimeout(() => {
        setVerifiedPhase(2); // Morph into checkmark after 700ms
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setVerifiedPhase(1);
    }
  }, [status]);

  const isIdle = status === "idle";
  const isReasoning = status === "reasoning";
  const isExecuting = status === "executing";
  const isVerified = status === "verified";
  const isRejected = status === "rejected";

  const isExpanded = isReasoning || isExecuting || (isVerified && verifiedPhase === 1);
  const showWings = isExecuting || (isVerified && verifiedPhase === 1);
  const showBridge = isExecuting || (isVerified && verifiedPhase === 1);
  const isVerifiedCheckmark = isVerified && verifiedPhase === 2;

  const statusColors = {
    idle: "text-slate-400 dark:text-zinc-500",
    reasoning: "text-slate-900 dark:text-white",
    executing: "text-slate-900 dark:text-white",
    verified: "text-emerald-500 dark:text-emerald-400",
    rejected: "text-rose-500 dark:text-rose-400"
  };

  const statusLabels = {
    idle: "Agent Standing By",
    reasoning: "Traversing Causal Graph...",
    executing: "Evaluating MCP Action Gate...",
    verified: isVerifiedCheckmark ? "Action Verified // Provenance Intact" : "Verifying Causal Chain...",
    rejected: "Action Rejected // Gate Closed"
  };

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className={`overflow-visible transition-colors duration-500 ${statusColors[status] || statusColors.reasoning}`}
        aria-label={`CAVDAX Agent Status: ${status}`}
      >
        <style>{`
          /* Smooth Mitosis & Morph Transitions */
          .mitosis-top-node,
          .mitosis-bottom-node,
          .mitosis-center-node {
            transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
          }
          .node-dissolve-fade {
            transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.55s ease-out 0.22s !important;
          }

          /* Fluid Staggered Edge Drawing */
          .edge-spine-draw {
            stroke-dasharray: 32;
            transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
          }
          .edge-wing-draw {
            stroke-dasharray: 20;
            transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, opacity 0.4s ease;
          }
          .edge-bridge-draw {
            stroke-dasharray: 16;
            transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.28s, opacity 0.4s ease;
          }

          /* Infinite Radar Line & Node Alternating Rotation in Reasoning State (CW -> Delay -> CCW -> Delay -> Loop) */
          @keyframes reasoningAlternatingRotation {
            0% {
              transform: rotate(0deg);
            }
            4% {
              transform: rotate(0deg);
            }
            46% {
              transform: rotate(360deg);
            }
            54% {
              transform: rotate(360deg);
            }
            96% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(0deg);
            }
          }
          .anim-reasoning-unified-radar {
            transform-origin: 46px 50px;
            animation: reasoningAlternatingRotation 4.8s ease-in-out infinite;
            animation-delay: 0.35s;
          }

          /* 2-Phase Executing Wave */
          @keyframes executingTwoPhase {
            0% { stroke-dashoffset: 32; opacity: 0.4; }
            45% { stroke-dashoffset: 0; opacity: 1; filter: drop-shadow(0 0 2px currentColor); }
            70% { opacity: 1; filter: drop-shadow(0 0 5px currentColor); }
            100% { stroke-dashoffset: -32; opacity: 0.4; }
          }
          .anim-executing-twophase {
            stroke-dasharray: 16 16;
            animation: executingTwoPhase 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }

          /* Idle Node Breathing */
          @keyframes idleBreath {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; }
          }
          .anim-idle-breath {
            transform-origin: 46px 50px;
            animation: idleBreath 3.0s ease-in-out infinite;
          }

          /* Gate Shift (ONLY in Rejected State) */
          .rejected-gate-shift {
            transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
            transform-origin: 52px 50px;
          }

          /* Single 1-Time Cross Strike */
          @keyframes rejectCrossSingle {
            0% { transform: scale(0.4); opacity: 0; }
            40% { transform: scale(1.25); filter: drop-shadow(0 0 8px currentColor); }
            100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
          }
          .anim-reject-cross-once {
            transform-origin: 46px 50px;
            animation: rejectCrossSingle 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          /* Extended Checkmark Morph */
          @keyframes checkmarkDrawIn {
            0% { stroke-dashoffset: 26; opacity: 0; }
            30% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 1; filter: drop-shadow(0 0 3px currentColor); }
          }
          .anim-checkmark-morph {
            stroke-dasharray: 26;
            animation: checkmarkDrawIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>

        {/* 1. OUTER C ARC */}
        <path
          d="M 46 27 A 23 23 0 0 0 46 73"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeLinejoin="miter"
          className={`transition-opacity duration-500 ${isIdle ? "opacity-35" : isRejected ? "opacity-60" : "opacity-100"}`}
        />

        {/* 2. FORWARD CHEVRON > (ONLY moves closer in Rejected state; stays proud in Verified) */}
        <path
          d="M 52 28 L 74 50 L 52 72"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeLinejoin="miter"
          className="rejected-gate-shift"
          style={{
            transform: isRejected ? "translateX(-5px) scale(0.92)" : "translateX(0px) scale(1)",
            opacity: isIdle ? 0.35 : isRejected ? 0.6 : 1
          }}
        />

        {/* ==============================================================
            3. UNIFIED ROTATING REASONING ASSEMBLY (Line AND Nodes Rotate Together!)
           ============================================================== */}
        <g 
          className={isReasoning ? "anim-reasoning-unified-radar" : ""}
          style={{ transformOrigin: "46px 50px" }}
        >
          {/* Vertical Spine (Draws on Reasoning, spins with daughter nodes) */}
          <path
            d="M 46 34 L 46 66"
            className="edge-spine-draw"
            fill="none"
            stroke="currentColor"
            strokeWidth={hairlineWidth}
            strokeLinecap="round"
            style={{
              strokeDashoffset: isExpanded ? 0 : 32,
              opacity: (isExpanded && !isVerifiedCheckmark) ? 0.85 : 0
            }}
          />

          {/* Top Daughter Node (Attached to rotating assembly in Reasoning) */}
          <circle
            cx="46"
            cy="50"
            r="2.4"
            fill="currentColor"
            className={`mitosis-top-node ${isVerifiedCheckmark ? "node-dissolve-fade" : ""}`}
            style={{
              transform: isVerifiedCheckmark 
                ? "translate(-5px, -2px) scale(0.65)" 
                : isExpanded 
                ? "translate(0px, -16px) scale(1)" 
                : "translate(0px, 0px) scale(1)",
              opacity: isVerifiedCheckmark ? 0 : (isExpanded ? 1 : 0)
            }}
          />

          {/* Bottom Daughter Node (Attached to rotating assembly in Reasoning) */}
          <circle
            cx="46"
            cy="50"
            r="2.4"
            fill="currentColor"
            className={`mitosis-bottom-node ${isVerifiedCheckmark ? "node-dissolve-fade" : ""}`}
            style={{
              transform: isVerifiedCheckmark 
                ? "translate(0.5px, 4.5px) scale(0.65)" 
                : isExpanded 
                ? "translate(0px, 16px) scale(1)" 
                : "translate(0px, 0px) scale(1)",
              opacity: isVerifiedCheckmark ? 0 : (isExpanded ? 1 : 0)
            }}
          />
        </g>

        {/* 4. STATIC CAUSAL EDGES (Wings & Forward Bridge) */}
        <g 
          stroke="currentColor" 
          strokeWidth={hairlineWidth} 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-opacity duration-500"
          style={{ opacity: isVerifiedCheckmark ? 0 : 1 }}
        >
          {/* Symmetrical Wings & Center Line */}
          <path
            d="M 46 34 L 58 50"
            className="edge-wing-draw"
            style={{
              strokeDashoffset: showWings ? 0 : 20,
              opacity: showWings ? 0.8 : 0
            }}
          />
          <path
            d="M 46 66 L 58 50"
            className="edge-wing-draw"
            style={{
              strokeDashoffset: showWings ? 0 : 20,
              opacity: showWings ? 0.8 : 0
            }}
          />
          <path
            d="M 46 50 L 58 50"
            className="edge-wing-draw"
            style={{
              strokeDashoffset: showWings ? 0 : 20,
              opacity: showWings ? 0.85 : 0
            }}
          />

          {/* Forward Directed Bridge to Chevron Apex */}
          {!isReasoning && (
            <path
              d="M 58 50 L 74 50"
              className={`edge-bridge-draw ${isExecuting ? "anim-executing-twophase stroke-[1.8px]" : ""}`}
              style={{
                strokeDashoffset: showBridge ? 0 : 16,
                opacity: showBridge ? 1 : 0
              }}
            />
          )}
        </g>

        {/* 5. CENTER PIVOT NODE & SPECIAL OVERLAYS */}
        <g fill="currentColor">
          {/* Fixed Center Node at (46, 50) */}
          {!isRejected && (
            <circle
              cx="46"
              cy="50"
              r="2.4"
              className={`mitosis-center-node ${isIdle ? "anim-idle-breath" : ""} ${isVerifiedCheckmark ? "node-dissolve-fade" : ""}`}
              style={{
                transform: isVerifiedCheckmark ? "translate(10.5px, -9.5px) scale(0.65)" : "translate(0px, 0px) scale(1)",
                opacity: isVerifiedCheckmark ? 0 : ((isIdle || isExpanded) ? 1 : 0)
              }}
            />
          )}

          {/* VERIFIED PHASE 2: Extended Geometric Checkmark '✓' */}
          {isVerifiedCheckmark && (
            <path
              d="M 41 48 L 46.5 54.5 L 56.5 40.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="anim-checkmark-morph"
            />
          )}

          {/* REJECTED STATE: 1-Time Red Cross Strike '✕' that holds steady */}
          {isRejected && (
            <g className="anim-reject-cross-once stroke-current" strokeWidth="2.2" strokeLinecap="round">
              <line x1="43" y1="47" x2="49" y2="53" />
              <line x1="43" y1="53" x2="49" y2="47" />
            </g>
          )}
        </g>
      </svg>

      {/* Optional Descriptive Label */}
      {showLabel && (
        <span className={`text-xs font-mono tracking-wider transition-colors duration-500 ${statusColors[status] || ""}`}>
          {statusLabels[status] || status}
        </span>
      )}
    </div>
  );
}
