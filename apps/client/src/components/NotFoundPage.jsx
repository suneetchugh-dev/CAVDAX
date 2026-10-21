import React from 'react';
import { AlertTriangle, ArrowLeft, Terminal, SlidersHorizontal, Home } from 'lucide-react';
import { playClick } from '../utils/soundFx';

/**
 * NotFoundPage (Error 404)
 * 
 * Bespoke Causal Graph & MCP Protocol 404 Page:
 * - Theme-adaptive monochromatic Swiss styling (Obsidian / Porcelain).
 * - Architectural telemetry error box (ERR_CAUSAL_NODE_NOT_FOUND).
 * - Disconnected broken graph node SVG visualization.
 * - Single-screen zero-overflow containment.
 * - Tactile action buttons to return home or launch verification console.
 */
export default function NotFoundPage({ onNavigateHome, onLaunchConsole }) {
  const currentPath = typeof window !== 'undefined' 
    ? (window.location.hash || window.location.pathname) 
    : '/404';

  return (
    <div className="w-full min-h-[calc(100dvh-5rem)] flex items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="max-w-xl w-full text-center flex flex-col items-center">
        
        {/* 1. Broken Causal Node SVG Schematic */}
        <div className="relative mb-6">
          <svg
            width="140"
            height="70"
            viewBox="0 0 140 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible text-slate-400 dark:text-slate-600"
          >
            {/* Left Valid Root Node */}
            <circle cx="25" cy="35" r="14" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="25" cy="35" r="4" fill="currentColor" />

            {/* Connecting Causal Edge (Broken dashed in middle) */}
            <path
              d="M 40 35 L 62 35"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M 68 30 L 72 40"
              stroke="#BE123C"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 78 35 L 100 35"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeLinecap="round"
              className="opacity-40"
            />

            {/* Right Missing / Severed Node (404) */}
            <circle
              cx="115"
              cy="35"
              r="14"
              fill="none"
              stroke="#BE123C"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x="115"
              y="39"
              textAnchor="middle"
              fill="#BE123C"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              ?
            </text>
          </svg>
        </div>

        {/* 2. Primary Headline */}
        <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-slate-950 dark:text-white mb-3">
          404 Not Found
        </h1>

        {/* 4. Editorial Explanation */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          The requested graph vertex or URL path does not exist in the active FalkorDB DAG. No causal dependency edge could be resolved.
        </p>

        {/* 5. Monospace Telemetry Diagnostic Box */}
        <div className="w-full p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 font-mono text-left text-xs space-y-1.5 mb-8 text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-1.5 text-slate-500 dark:text-slate-400 text-[10px]">
            <span className="flex items-center gap-1.5">
              <Terminal size={11} />
              <span>CAVDAX KERNEL TELEMETRY</span>
            </span>
            <span>HTTP 404</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-slate-500">REQUEST_PATH:</span>
            <span className="text-slate-900 dark:text-slate-200 font-bold truncate max-w-[280px]">{currentPath}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500">GRAPH_RESOLVER:</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">UNRESOLVED_MULTI_HOP</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500">MCP_ACTION_GATE:</span>
            <span className="text-slate-900 dark:text-slate-300">EXECUTION_ABORTED_SAFELY</span>
          </div>
        </div>

        {/* 6. Dual Return Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            onClick={() => {
              playClick();
              if (onNavigateHome) onNavigateHome();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-mono font-bold bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition shadow-sm inline-flex items-center justify-center gap-2 tactile-btn"
          >
            <Home size={14} />
            <span>Return to Overview</span>
          </button>

          <button
            onClick={() => {
              playClick();
              if (onLaunchConsole) onLaunchConsole();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-mono font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white bg-slate-200/70 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-300 dark:border-white/10 transition inline-flex items-center justify-center gap-2 tactile-btn"
          >
            <SlidersHorizontal size={14} />
            <span>Launch Verification Console</span>
          </button>
        </div>

      </div>
    </div>
  );
}
