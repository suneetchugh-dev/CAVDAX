import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';

export default function GraphCanvas({ graphData, onSelectNode, selectedNodeId }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Map nodes to layout coordinates
  // Layers:
  // Layer 0: Sources (ADR-001, ADR-002) - x: 80
  // Layer 1: Facts (F-Auth-v1, F-OAuth2) - x: 300
  // Layer 2: Decisions (DEC-102, DEC-103) - x: 520
  // Layer 3: Actions (Act-Payment) - x: 740

  const layoutPositions = {
    'ADR-001': { x: 90, y: 130 },
    'ADR-002': { x: 90, y: 310 },
    'F-Auth-v1': { x: 310, y: 130 },
    'F-OAuth2': { x: 310, y: 310 },
    'DEC-102': { x: 530, y: 130 },
    'DEC-103': { x: 530, y: 310 }
  };

  const nodes = (graphData?.nodes || []).map((node, index) => {
    let pos = layoutPositions[node.id];
    if (!pos) {
      if (node.label === 'AgentAction' || node.id?.startsWith('act-')) {
        pos = { x: 730, y: 220 };
      } else {
        pos = { x: 400 + (index * 40) % 300, y: 200 + (index * 60) % 200 };
      }
    }
    return { ...node, ...pos };
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const edges = (graphData?.edges || []).map(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    return { ...edge, sourceNode, targetNode };
  }).filter(e => e.sourceNode && e.targetNode);

  function getNodeColors(node) {
    if (node.label === 'Source') {
      if (node.status === 'SUPERSEDED') {
        return {
          fill: '#3F1219',
          stroke: '#F43F5E',
          glow: 'rgba(244, 63, 94, 0.6)',
          text: '#FDA4AF',
          badge: 'SUPERSEDED'
        };
      }
      return {
        fill: '#082F49',
        stroke: '#06B6D4',
        glow: 'rgba(6, 182, 212, 0.5)',
        text: '#BAE6FD',
        badge: 'ACTIVE'
      };
    }

    if (node.label === 'Fact') {
      if (node.is_stale) {
        return {
          fill: '#4C0519',
          stroke: '#E11D48',
          glow: 'rgba(225, 29, 72, 0.6)',
          text: '#FECDD3',
          badge: 'STALE'
        };
      }
      return {
        fill: '#2E1065',
        stroke: '#8B5CF6',
        glow: 'rgba(139, 92, 246, 0.5)',
        text: '#DDD6FE',
        badge: 'VERIFIED'
      };
    }

    if (node.label === 'Decision') {
      if (node.status === 'INVALIDATED_NEEDS_REVALIDATION') {
        return {
          fill: '#450A0A',
          stroke: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.7)',
          text: '#FCA5A5',
          badge: 'INVALIDATED'
        };
      }
      if (node.status === 'REPLACED_ARCHIVED') {
        return {
          fill: '#0F172A',
          stroke: '#475569',
          glow: 'rgba(71, 85, 105, 0.3)',
          text: '#94A3B8',
          badge: 'ARCHIVED'
        };
      }
      return {
        fill: '#064E3B',
        stroke: '#10B981',
        glow: 'rgba(16, 185, 129, 0.6)',
        text: '#A7F3D0',
        badge: 'VALID'
      };
    }

    // AgentAction
    if (node.status === 'BLOCKED') {
      return {
        fill: '#4C0519',
        stroke: '#F43F5E',
        glow: 'rgba(244, 63, 94, 0.7)',
        text: '#FDA4AF',
        badge: 'BLOCKED'
      };
    }
    return {
      fill: '#064E3B',
      stroke: '#34D399',
      glow: 'rgba(52, 211, 153, 0.6)',
      text: '#A7F3D0',
      badge: 'EXECUTED'
    };
  }

  return (
    <div className="h-full flex flex-col bg-obsidian-950 relative overflow-hidden">
      {/* Canvas Top Bar */}
      <div className="h-10 px-4 bg-obsidian-800/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-slate-200">
            FalkorDB Temporal Causal Graph
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 font-mono">
            {nodes.length} Nodes • {edges.length} Edges
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(1.8, z + 0.1))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden">
        {/* Subtle cyber grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <svg
          className="w-full h-full"
          viewBox="0 0 880 440"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out'
          }}
        >
          <defs>
            {/* Arrow Marker Definitions */}
            <marker id="arrow-default" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" />
            </marker>
            <marker id="arrow-supersedes" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#F43F5E" />
            </marker>
            <marker id="arrow-emerald" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge, idx) => {
            const isSupersedes = edge.type === 'SUPERSEDES';
            const isReplaces = edge.type === 'REPLACES';
            let strokeColor = '#334155';
            let marker = 'url(#arrow-default)';
            let dash = undefined;

            if (isSupersedes) {
              strokeColor = '#F43F5E';
              marker = 'url(#arrow-supersedes)';
              dash = '4 3';
            } else if (isReplaces) {
              strokeColor = '#06B6D4';
              marker = 'url(#arrow-default)';
              dash = '5 3';
            }

            // Calculate midpoint for edge label
            const midX = (edge.sourceNode.x + edge.targetNode.x) / 2;
            const midY = (edge.sourceNode.y + edge.targetNode.y) / 2 - 8;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={edge.sourceNode.x}
                  y1={edge.sourceNode.y}
                  x2={edge.targetNode.x}
                  y2={edge.targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={isSupersedes ? 2.5 : 1.8}
                  strokeDasharray={dash}
                  markerEnd={marker}
                />
                <text
                  x={midX}
                  y={midY}
                  fill={isSupersedes ? '#FDA4AF' : '#94A3B8'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="bg-black select-none pointer-events-none"
                >
                  :{edge.type}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const colors = getNodeColors(node);
            const isSelected = selectedNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectNode(node)}
                className="cursor-pointer group"
              >
                {/* Outer Glow Halo */}
                <circle
                  r={isSelected ? 32 : 26}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? 3 : 1}
                  opacity={isSelected ? 0.9 : 0.4}
                  style={{ filter: `drop-shadow(0 0 12px ${colors.glow})` }}
                  className="transition-all duration-300"
                />

                {/* Node Body */}
                <circle
                  r="22"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  className="transition-transform duration-200 group-hover:scale-110"
                />

                {/* Node Label (Inside) */}
                <text
                  textAnchor="middle"
                  dy="-2"
                  fill={colors.text}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="select-none pointer-events-none"
                >
                  {node.id.length > 9 ? node.id.slice(0, 8) + '…' : node.id}
                </text>

                {/* Status Subtitle (Inside) */}
                <text
                  textAnchor="middle"
                  dy="10"
                  fill="#94A3B8"
                  fontSize="7"
                  fontFamily="monospace"
                  className="select-none pointer-events-none"
                >
                  {colors.badge}
                </text>

                {/* Node Title Label (Below) */}
                <text
                  textAnchor="middle"
                  dy="38"
                  fill="#CBD5E1"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="500"
                  className="select-none pointer-events-none"
                >
                  {node.label}: {node.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-obsidian-900/90 border border-slate-800 rounded-lg p-2.5 text-[10px] font-mono space-y-1.5 backdrop-blur-xs shadow-lg">
          <div className="text-slate-400 font-bold mb-1">Graph Legend:</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">:Source (ADR/Commit)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-slate-300">:Fact (Extracted Claim)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">:Decision (Active/Valid)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-rose-300">Stale / Invalidated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
