import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Database } from 'lucide-react';
import { playClick } from '../utils/soundFx';
import NodeInspector from './NodeInspector';

export default function GraphCanvas({ graphData, onSelectNode, selectedNodeId, selectedNode, onCloseNode, isDarkTheme = true }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    playClick();
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.0012;
    setZoom((prev) => Math.max(0.5, Math.min(2.5, prev + zoomFactor)));
  };

  const handleMouseDown = (e) => {
    // Only drag when clicking canvas background, not when clicking a node
    if (e.target.closest('g.graph-node')) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const layoutPositions = {
    'ADR-001': { x: 100, y: 130 },
    'ADR-002': { x: 100, y: 310 },
    'F-Auth-v1': { x: 320, y: 130 },
    'F-OAuth2': { x: 320, y: 310 },
    'DEC-102': { x: 540, y: 130 },
    'DEC-103': { x: 540, y: 310 }
  };

  let actionCounter = 0;
  const columnCounters = {};

  const nodes = (graphData?.nodes || []).map((node) => {
    let pos = layoutPositions[node.id];
    if (!pos) {
      if (node.label === 'AgentAction' || node.id?.startsWith('act-')) {
        pos = { x: 740, y: 180 + actionCounter * 90 };
        actionCounter++;
      } else {
        const layerX = { Source: 100, Fact: 320, Decision: 540 }[node.label] ?? 540;
        const layerIdx = columnCounters[node.label] ?? 0;
        columnCounters[node.label] = layerIdx + 1;
        pos = { x: layerX, y: 100 + layerIdx * 100 };
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
    if (isDarkTheme) {
      if (node.label === 'Source') {
        if (node.status === 'SUPERSEDED') {
          return {
            fill: '#240B10',
            stroke: '#FB7185',
            glow: 'rgba(251, 113, 133, 0.3)',
            text: '#FECDD3',
            badge: 'SUPERSEDED'
          };
        }
        return {
          fill: '#11141B',
          stroke: '#FFFFFF',
          glow: 'rgba(255, 255, 255, 0.25)',
          text: '#FFFFFF',
          badge: 'ACTIVE'
        };
      }

      if (node.label === 'Fact') {
        if (node.is_stale) {
          return {
            fill: '#240B10',
            stroke: '#FB7185',
            glow: 'rgba(251, 113, 133, 0.3)',
            text: '#FECDD3',
            badge: 'STALE'
          };
        }
        return {
          fill: '#161B22',
          stroke: '#CBD5E1',
          glow: 'rgba(203, 213, 225, 0.2)',
          text: '#E2E8F0',
          badge: 'VERIFIED'
        };
      }

      if (node.label === 'Decision') {
        if (node.status === 'INVALIDATED_NEEDS_REVALIDATION') {
          return {
            fill: '#240B10',
            stroke: '#FB7185',
            glow: 'rgba(251, 113, 133, 0.3)',
            text: '#FECDD3',
            badge: 'INVALIDATED'
          };
        }
        if (node.status === 'REPLACED_ARCHIVED') {
          return {
            fill: '#0B0D11',
            stroke: '#475569',
            glow: 'rgba(71, 85, 105, 0.1)',
            text: '#94A3B8',
            badge: 'ARCHIVED'
          };
        }
        return {
          fill: '#061D15',
          stroke: '#34D399',
          glow: 'rgba(52, 211, 153, 0.3)',
          text: '#A7F3D0',
          badge: 'VALID'
        };
      }

      // AgentAction
      if (node.status === 'BLOCKED') {
        return {
          fill: '#240B10',
          stroke: '#FB7185',
          glow: 'rgba(251, 113, 133, 0.3)',
          text: '#FECDD3',
          badge: 'BLOCKED'
        };
      }
      return {
        fill: '#061D15',
        stroke: '#34D399',
        glow: 'rgba(52, 211, 153, 0.3)',
        text: '#A7F3D0',
        badge: 'EXECUTED'
      };
    } else {
      // === Light Mode (Porcelain Architectural Calibration) ===
      if (node.label === 'Source') {
        if (node.status === 'SUPERSEDED') {
          return {
            fill: '#FFF1F2',
            stroke: '#E11D48',
            glow: 'rgba(225, 29, 72, 0.28)',
            text: '#9F1239',
            badge: 'SUPERSEDED'
          };
        }
        return {
          fill: '#FFFFFF',
          stroke: '#0F172A',
          glow: 'rgba(15, 23, 42, 0.22)',
          text: '#0F172A',
          badge: 'ACTIVE'
        };
      }

      if (node.label === 'Fact') {
        if (node.is_stale) {
          return {
            fill: '#FFF1F2',
            stroke: '#E11D48',
            glow: 'rgba(225, 29, 72, 0.28)',
            text: '#9F1239',
            badge: 'STALE'
          };
        }
        return {
          fill: '#F8FAFC',
          stroke: '#334155',
          glow: 'rgba(51, 65, 85, 0.18)',
          text: '#0F172A',
          badge: 'VERIFIED'
        };
      }

      if (node.label === 'Decision') {
        if (node.status === 'INVALIDATED_NEEDS_REVALIDATION') {
          return {
            fill: '#FFF1F2',
            stroke: '#E11D48',
            glow: 'rgba(225, 29, 72, 0.28)',
            text: '#9F1239',
            badge: 'INVALIDATED'
          };
        }
        if (node.status === 'REPLACED_ARCHIVED') {
          return {
            fill: '#F1F5F9',
            stroke: '#94A3B8',
            glow: 'rgba(148, 163, 184, 0.15)',
            text: '#475569',
            badge: 'ARCHIVED'
          };
        }
        return {
          fill: '#F0FDF4',
          stroke: '#059669',
          glow: 'rgba(5, 150, 105, 0.25)',
          text: '#065F46',
          badge: 'VALID'
        };
      }

      // AgentAction
      if (node.status === 'BLOCKED') {
        return {
          fill: '#FFF1F2',
          stroke: '#E11D48',
          glow: 'rgba(225, 29, 72, 0.28)',
          text: '#9F1239',
          badge: 'BLOCKED'
        };
      }
      return {
        fill: '#F0FDF4',
        stroke: '#059669',
        glow: 'rgba(5, 150, 105, 0.25)',
        text: '#065F46',
        badge: 'EXECUTED'
      };
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`h-full flex flex-col bg-slate-50 dark:bg-[#060709] relative overflow-hidden select-none${isFullscreen && isDarkTheme ? ' dark' : ''}`}
    >
      {/* Canvas Top Bar */}
      <div className="h-10 px-4 bg-slate-100 dark:bg-[#08090A] border-b border-slate-300 dark:border-white/10 flex items-center justify-between text-xs text-slate-800 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
          <span className="font-mono font-semibold text-slate-900 dark:text-white">
            FalkorDB Temporal Causal Graph
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-400 font-mono">
            {nodes.length} Nodes • {edges.length} Edges
          </span>
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              playClick();
              setZoom(z => Math.max(0.6, z - 0.1));
            }}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors tactile-btn"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-current transition-colors" />
          </button>
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 w-10 text-center font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => {
              playClick();
              setZoom(z => Math.min(2.2, z + 0.1));
            }}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors tactile-btn"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-current transition-colors" />
          </button>
          <button
            onClick={() => {
              playClick();
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors tactile-btn"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-current transition-colors" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors tactile-btn"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Graph"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-current transition-colors" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-current transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas with Wheel Zoom & Drag-Pan */}
      <div 
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkTheme ? '#334155' : '#94A3B8'} 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <svg
          className="w-full h-full"
          viewBox="0 0 880 440"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.12s ease-out'
          }}
        >
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="38"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 1.5 L 8 5 L 0 8.5 z"
                fill={isDarkTheme ? '#475569' : '#94A3B8'}
              />
            </marker>

            <marker
              id="arrow-supersedes"
              viewBox="0 0 10 10"
              refX="38"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FB7185" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge, idx) => {
            const isSupersedes = edge.type === 'SUPERSEDES';
            const isReplaces = edge.type === 'REPLACES';
            let strokeColor = isDarkTheme ? '#334155' : '#CBD5E1';
            let marker = 'url(#arrow-default)';
            let dash = undefined;

            if (isSupersedes) {
              strokeColor = '#FB7185';
              marker = 'url(#arrow-supersedes)';
              dash = '4 3';
            } else if (isReplaces) {
              strokeColor = isDarkTheme ? '#FFFFFF' : '#0F172A';
              marker = 'url(#arrow-default)';
              dash = '5 3';
            }

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
                  strokeWidth={isSupersedes ? 2.2 : 1.5}
                  strokeDasharray={dash}
                  markerEnd={marker}
                />
                <text
                  x={midX}
                  y={midY}
                  fill={isSupersedes ? '#FB7185' : isDarkTheme ? '#94A3B8' : '#64748B'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="select-none pointer-events-none"
                >
                  :{edge.type}
                </text>
              </g>
            );
          })}

          {/* Render Nodes (Strictly NO translate-y on hover to eliminate jitter) */}
          {nodes.map((node) => {
            const colors = getNodeColors(node);
            const isSelected = selectedNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => {
                  playClick();
                  onSelectNode(node);
                }}
                className="cursor-pointer group graph-node"
              >
                {/* Transparent Hit Area for 100% Reliable Pointer Events */}
                <rect
                  x="-38"
                  y="-28"
                  width="76"
                  height="56"
                  rx="12"
                  ry="12"
                  fill="transparent"
                  className="cursor-pointer"
                />

                {/* Outer Glow Halo (Stroke and opacity transitions only, no layout shifts) */}
                <rect
                  x="-36"
                  y="-26"
                  width="72"
                  height="52"
                  rx="10"
                  ry="10"
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? 2.2 : 1.2}
                  opacity={isSelected ? 0.95 : 0.25}
                  className="transition-all duration-150 group-hover:opacity-95"
                  style={{ filter: `drop-shadow(0 0 10px ${colors.glow})` }}
                />

                {/* Node Double-Bezel Body */}
                <rect
                  x="-32"
                  y="-22"
                  width="64"
                  height="44"
                  rx="8"
                  ry="8"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? "2.2" : "1.6"}
                  className="transition-all duration-150 group-hover:brightness-95 dark:group-hover:brightness-110"
                />

                {/* Node ID Label */}
                <text
                  textAnchor="middle"
                  dy="-3"
                  fill={colors.text}
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="select-none pointer-events-none"
                >
                  {node.id.length > 9 ? node.id.slice(0, 8) + '…' : node.id}
                </text>

                {/* Status Subtitle Badge */}
                <text
                  textAnchor="middle"
                  dy="11"
                  fill={isDarkTheme ? '#94A3B8' : '#64748B'}
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="600"
                  className="select-none pointer-events-none"
                >
                  {colors.badge}
                </text>

                {/* Node Type Label */}
                <text
                  textAnchor="middle"
                  dy="36"
                  fill={isDarkTheme ? '#94A3B8' : '#64748B'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  className="select-none pointer-events-none"
                >
                  :{node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Clean Monospace Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#0B0D11]/90 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-[10px] font-mono space-y-1.5 backdrop-blur-md shadow-md dark:shadow-xl pointer-events-none">
          <div className="text-slate-900 dark:text-white font-bold mb-1">GRAPH TOPOLOGY:</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-slate-900 dark:bg-white" />
            <span className="text-slate-700 dark:text-slate-300">:Source (ADR / Git Commit)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">:Fact (Derived Claim)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-emerald-500 dark:bg-emerald-400" />
            <span className="text-slate-700 dark:text-slate-300">:Decision (Active / Valid)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-rose-500 dark:bg-rose-400" />
            <span className="text-rose-700 dark:text-rose-300">:Stale / Superseded</span>
          </div>
        </div>
      </div>

      {/* Node Inspector — overlaid on containerRef itself so it persists in both normal + fullscreen mode */}
      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          onClose={onCloseNode}
        />
      )}
    </div>
  );
}
