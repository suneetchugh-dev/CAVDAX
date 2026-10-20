import React from 'react';

/**
 * McpCableConnectionSvg
 * 
 * Animates the EXISTING Lucide Cable SVG geometry:
 * - Left plug: <path d="M4 9a2 2 0 0 1-2-2V5h6v2a2 2 0 0 1-2 2Z" /> + pins M3 5V3, M7 5V3
 * - Wire path: <path d="M19 15V6.5a3.5 3.5 0 0 0-7 0v11a3.5 3.5 0 0 1-7 0V12" />
 * - Right plug: <path d="M17 21v-2a2 2 0 0 1 2-2h4v2a2 2 0 0 1-2 2Z" /> + pins M19 21v2, M23 21v2
 * 
 * On hover:
 * - The existing wire path draws itself from start to end via stroke-dashoffset.
 * - The two connector plugs smoothly glide to meet/connect.
 * - A subtle amber spark pulses at the connection point.
 */
export default function McpCableConnectionSvg({ className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-4 h-4 shrink-0 overflow-visible select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Subtle guide background for wire path */}
      <path
        d="M19 15V6.5a3.5 3.5 0 0 0-7 0v11a3.5 3.5 0 0 1-7 0V12"
        className="opacity-20"
      />

      {/* Active Cable Wire Path: reveals itself on hover */}
      <path
        d="M19 15V6.5a3.5 3.5 0 0 0-7 0v11a3.5 3.5 0 0 1-7 0V12"
        className="mcp-lucide-cable-wire"
      />

      {/* Left Top Connector Plug & Pins */}
      <g className="mcp-lucide-plug-left will-change-transform">
        <path d="M4 9a2 2 0 0 1-2-2V5h6v2a2 2 0 0 1-2 2Z" />
        <path d="M3 5V3" />
        <path d="M7 5V3" />
      </g>

      {/* Right Bottom Connector Plug & Pins */}
      <g className="mcp-lucide-plug-right will-change-transform">
        <path d="M17 21v-2a2 2 0 0 1 2-2h4v2a2 2 0 0 1-2 2Z" />
        <path d="M19 21v2" />
        <path d="M23 21v2" />
      </g>

      {/* Amber Contact Spark Flash at connection */}
      <circle
        cx="19"
        cy="15"
        r="2"
        fill="#d9a353"
        stroke="none"
        className="mcp-lucide-spark"
      />
    </svg>
  );
}
