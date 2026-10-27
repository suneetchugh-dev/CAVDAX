import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Database, Scan, Activity, Download, Filter } from 'lucide-react';
import { playClick } from '../utils/soundFx';
import NodeInspector from './NodeInspector';

function computeDownstreamBlast(nodes, edges, rootNodeId) {
  if (!rootNodeId) return { blastNodeIds: new Set(), summary: { facts: 0, decisions: 0, actions: 0, files: [] } };
  const blastNodeIds = new Set();
  const queue = [rootNodeId];
  const dependentMap = new Map();

  for (const edge of edges) {
    if (['EXTRACTED_FROM', 'DEPENDS_ON', 'GROUNDED_IN', 'ACTION_ON'].includes(edge.type)) {
      if (!dependentMap.has(edge.target)) dependentMap.set(edge.target, []);
      dependentMap.get(edge.target).push(edge.source);
    }
    if (edge.type === 'SUPERSEDES') {
      if (!dependentMap.has(edge.source)) dependentMap.set(edge.source, []);
      dependentMap.get(edge.source).push(edge.target);
    }
  }

  while (queue.length > 0) {
    const curr = queue.shift();
    const deps = dependentMap.get(curr) || [];
    for (const d of deps) {
      if (!blastNodeIds.has(d)) {
        blastNodeIds.add(d);
        queue.push(d);
      }
    }
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const files = [];
  let facts = 0;
  let decisions = 0;
  let actions = 0;

  for (const id of blastNodeIds) {
    const n = nodeMap.get(id);
    if (!n) continue;
    if (n.label === 'Fact') facts++;
    else if (n.label === 'Decision') decisions++;
    else if (n.label === 'AgentAction') {
      actions++;
      if (n.target_file && !files.includes(n.target_file)) files.push(n.target_file);
    }
  }

  return { blastNodeIds, summary: { facts, decisions, actions, files } };
}

export default function GraphCanvas({
  graphData,
  onSelectNode,
  selectedNodeId,
  selectedNode,
  onCloseNode,
  isDarkTheme = true,
  title = 'FalkorDB Temporal Causal Graph',
  repo,
  branch = 'main',
  unsyncedList = [],
  onOpenSyncPr,
  isDemo = false
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simulatedBlastNode, setSimulatedBlastNode] = useState(null);
  const [driftFilter, setDriftFilter] = useState('ALL'); // 'ALL' | 'GROUNDED' | 'DRIFTED'
  const [isVisionOcr, setIsVisionOcr] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('ocr') === '1' || p.get('vision') === '1';
    }
    return false;
  });

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
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const layoutPositions = {
    'ADR-001': { x: 100, y: 150 },
    'ADR-002': { x: 100, y: 310 },
    'F-Auth-v1': { x: 320, y: 150 },
    'F-OAuth2': { x: 320, y: 310 },
    'DEC-102': { x: 540, y: 150 },
    'DEC-103': { x: 540, y: 310 },
  };

  const rawNodes = graphData?.nodes || [];
  const rawEdges = graphData?.edges || [];

  // Compute blast radius reachability when a node simulation is active
  const { blastNodeIds, summary: blastSummary } = computeDownstreamBlast(rawNodes, rawEdges, simulatedBlastNode?.id);

  // Filter nodes based on architectural drift view
  const filteredRawNodes = rawNodes.filter(node => {
    if (driftFilter === 'GROUNDED') {
      const isStale = node.status === 'SUPERSEDED' || node.status === 'INVALIDATED_NEEDS_REVALIDATION' || node.is_stale;
      return !isStale;
    }
    if (driftFilter === 'DRIFTED') {
      const isStale = node.status === 'SUPERSEDED' || node.status === 'INVALIDATED_NEEDS_REVALIDATION' || node.is_stale;
      const hasDrift = unsyncedList.some(u => u.targetId === node.id);
      return isStale || hasDrift || blastNodeIds.has(node.id);
    }
    return true;
  });

  const ACTION_X = 740;
  const ACTION_Y_MIN = 60;
  const ACTION_Y_MAX = 400;
  const allActionNodes = filteredRawNodes.filter(
    n => n.label === 'AgentAction' || n.id?.startsWith('act-')
  );
  const actionCount = allActionNodes.length;
  const actionSpacing = actionCount <= 1 ? 0 : Math.min(90, (ACTION_Y_MAX - ACTION_Y_MIN) / (actionCount - 1));
  const actionStartY = actionCount <= 1
    ? 220
    : ACTION_Y_MIN + ((ACTION_Y_MAX - ACTION_Y_MIN) - actionSpacing * (actionCount - 1)) / 2;

  let actionCounterMap = 0;
  const actionIndexMap = new Map();
  for (const n of filteredRawNodes) {
    if (n.label === 'AgentAction' || n.id?.startsWith('act-')) {
      actionIndexMap.set(n.id, actionCounterMap++);
    }
  }

  const columnCounters = {};

  const nodes = filteredRawNodes.map((node) => {
    let pos = layoutPositions[node.id];
    if (!pos) {
      if (node.label === 'AgentAction' || node.id?.startsWith('act-')) {
        const idx = actionIndexMap.get(node.id) ?? 0;
        pos = { x: ACTION_X, y: actionStartY + idx * actionSpacing };
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

  const edges = rawEdges.map(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    return { ...edge, sourceNode, targetNode };
  }).filter(e => e.sourceNode && e.targetNode);

  function getNodeColors(node) {
    const inBlast = blastNodeIds.has(node.id);
    if (inBlast) {
      return {
        fill: isDarkTheme ? '#2A0B12' : '#FFF1F2',
        stroke: '#F43F5E',
        glow: 'rgba(244, 63, 94, 0.5)',
        text: isDarkTheme ? '#FECDD3' : '#9F1239',
        badge: 'BLAST_IMPACT'
      };
    }

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
          fill: '#11141B',
          stroke: '#94A3B8',
          glow: 'rgba(148, 163, 184, 0.2)',
          text: '#FFFFFF',
          badge: 'ACTIVE'
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
            fill: '#0F1218',
            stroke: '#475569',
            glow: 'none',
            text: '#94A3B8',
            badge: 'ARCHIVED'
          };
        }
        return {
          fill: '#11141B',
          stroke: '#FFFFFF',
          glow: 'rgba(255, 255, 255, 0.25)',
          text: '#FFFFFF',
          badge: 'VALID'
        };
      }

      if (node.label === 'AgentAction' || node.id?.startsWith('act-')) {
        if (node.status === 'APPROVED' || node.status === 'EXECUTED') {
          return {
            fill: '#061D15',
            stroke: '#10B981',
            glow: 'rgba(16, 185, 129, 0.35)',
            text: '#A7F3D0',
            badge: 'APPROVED'
          };
        }
        return {
          fill: '#240B10',
          stroke: '#FB7185',
          glow: 'rgba(251, 113, 133, 0.35)',
          text: '#FECDD3',
          badge: 'BLOCKED'
        };
      }

      return {
        fill: '#11141B',
        stroke: '#475569',
        glow: 'none',
        text: '#94A3B8',
        badge: 'UNKNOWN'
      };
    } else {
      if (node.label === 'Source') {
        if (node.status === 'SUPERSEDED') {
          return {
            fill: '#FFF1F2',
            stroke: '#F43F5E',
            glow: 'rgba(244, 63, 94, 0.25)',
            text: '#9F1239',
            badge: 'SUPERSEDED'
          };
        }
        return {
          fill: '#FFFFFF',
          stroke: '#0F172A',
          glow: 'rgba(15, 23, 42, 0.15)',
          text: '#0F172A',
          badge: 'ACTIVE'
        };
      }

      if (node.label === 'Fact') {
        if (node.is_stale) {
          return {
            fill: '#FFF1F2',
            stroke: '#F43F5E',
            glow: 'rgba(244, 63, 94, 0.25)',
            text: '#9F1239',
            badge: 'STALE'
          };
        }
        return {
          fill: '#FFFFFF',
          stroke: '#64748B',
          glow: 'rgba(100, 116, 139, 0.15)',
          text: '#0F172A',
          badge: 'ACTIVE'
        };
      }

      if (node.label === 'Decision') {
        if (node.status === 'INVALIDATED_NEEDS_REVALIDATION') {
          return {
            fill: '#FFF1F2',
            stroke: '#F43F5E',
            glow: 'rgba(244, 63, 94, 0.25)',
            text: '#9F1239',
            badge: 'INVALIDATED'
          };
        }
        if (node.status === 'REPLACED_ARCHIVED') {
          return {
            fill: '#F8FAFC',
            stroke: '#94A3B8',
            glow: 'none',
            text: '#64748B',
            badge: 'ARCHIVED'
          };
        }
        return {
          fill: '#FFFFFF',
          stroke: '#0F172A',
          glow: 'rgba(15, 23, 42, 0.15)',
          text: '#0F172A',
          badge: 'VALID'
        };
      }

      if (node.label === 'AgentAction' || node.id?.startsWith('act-')) {
        if (node.status === 'APPROVED' || node.status === 'EXECUTED') {
          return {
            fill: '#ECFDF5',
            stroke: '#059669',
            glow: 'rgba(5, 150, 105, 0.25)',
            text: '#065F46',
            badge: 'APPROVED'
          };
        }
        return {
          fill: '#FFF1F2',
          stroke: '#F43F5E',
          glow: 'rgba(244, 63, 94, 0.25)',
          text: '#9F1239',
          badge: 'BLOCKED'
        };
      }

      return {
        fill: '#FFFFFF',
        stroke: '#CBD5E1',
        glow: 'none',
        text: '#64748B',
        badge: 'UNKNOWN'
      };
    }
  }

  const exportSvgUrl = `/api/graph/export-image?theme=${isDarkTheme ? 'dark' : 'light'}${simulatedBlastNode ? `&node_id=${simulatedBlastNode.id}&blast=1` : ''}`;

  return (
    <div 
      ref={containerRef}
      className={`h-full flex flex-col bg-slate-50 dark:bg-[#060709] relative overflow-hidden select-none${isFullscreen && isDarkTheme ? ' dark' : ''}`}
    >
      {/* Canvas Top Bar */}
      <div className="h-10 px-3 sm:px-4 bg-slate-100 dark:bg-[#08090A] border-b border-slate-300 dark:border-white/15 flex items-center justify-between text-xs text-slate-800 dark:text-slate-300 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Database className="w-3.5 h-3.5 text-slate-900 dark:text-white shrink-0" />
          <span className="font-mono font-semibold text-slate-900 dark:text-white truncate" title={title}>
            {title}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-400 font-mono shrink-0 hidden sm:inline-block">
            {nodes.length} Nodes • {edges.length} Edges
          </span>
        </div>

        {/* Feature Controls: Drift Filter, Vision OCR, SVG Export, Zoom, Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0 font-mono">
          {/* Architectural Drift Filter */}
          <div className="flex items-center bg-white dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-md p-0.5 text-[10px]">
            <Filter className="w-3 h-3 text-slate-500 mx-1 shrink-0" />
            <button
              onClick={() => { playClick(); setDriftFilter('ALL'); }}
              className={`px-1.5 py-0.5 rounded transition-colors ${driftFilter === 'ALL' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => { playClick(); setDriftFilter('GROUNDED'); }}
              className={`px-1.5 py-0.5 rounded transition-colors ${driftFilter === 'GROUNDED' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
            >
              Grounded
            </button>
            <button
              onClick={() => { playClick(); setDriftFilter('DRIFTED'); }}
              className={`px-1.5 py-0.5 rounded transition-colors ${driftFilter === 'DRIFTED' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
            >
              Drifted
            </button>
          </div>

          {/* High-Contrast Vision OCR Mode */}
          <button
            onClick={() => {
              playClick();
              setIsVisionOcr(v => !v);
            }}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer tactile-btn ${
              isVisionOcr
                ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
            title="Toggle High-Contrast Machine-Readable Vision OCR Badges"
          >
            <Scan className="w-3 h-3 shrink-0" />
            <span className="hidden md:inline">Vision OCR</span>
          </button>

          {/* Standalone SVG Export Link */}
          <a
            href={exportSvgUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors tactile-btn"
            title="Export Standalone Graph Image (SVG)"
          >
            <Download className="w-3.5 h-3.5 text-current transition-colors" />
          </a>

          {/* Zoom & Fullscreen Controls */}
          <div className="flex items-center gap-0.5 border-l border-slate-300 dark:border-white/15 pl-1.5">
            <button
              onClick={() => {
                playClick();
                setZoom(z => Math.max(0.6, z - 0.1));
              }}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors tactile-btn"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5 text-current transition-colors" />
            </button>
            <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 w-8 text-center font-semibold">
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
              <ZoomIn className="w-3.5 h-3.5 text-current transition-colors" />
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

        {/* What-If Blast Radius Simulation Notification Banner */}
        {simulatedBlastNode && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 flex items-center justify-between gap-3 p-2.5 rounded-xl bg-rose-500/15 dark:bg-rose-950/80 border border-rose-500/40 text-rose-800 dark:text-rose-200 backdrop-blur-md shadow-lg animate-in fade-in max-w-xl font-mono text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
              <div className="min-w-0 leading-tight">
                <span className="font-bold uppercase tracking-wider block text-[10px] text-rose-600 dark:text-rose-400">What-If Blast Radius</span>
                <span className="truncate block text-[11px]">
                  Deprecating <strong>{simulatedBlastNode.id}</strong> impacts <strong>{blastSummary.decisions}</strong> Decisions, <strong>{blastSummary.facts}</strong> Facts, <strong>{blastSummary.actions}</strong> Actions, and <strong>{blastSummary.files.length}</strong> Target Files.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                playClick();
                setSimulatedBlastNode(null);
              }}
              className="px-2 py-1 text-[10px] font-bold rounded bg-rose-500 text-white hover:bg-rose-600 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              Clear
            </button>
          </div>
        )}

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

            <marker
              id="arrow-blast"
              viewBox="0 0 10 10"
              refX="38"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F43F5E" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge, idx) => {
            const isSupersedes = edge.type === 'SUPERSEDES';
            const isReplaces = edge.type === 'REPLACES';
            const isBlast = blastNodeIds.has(edge.source) || blastNodeIds.has(edge.target) || edge.source === simulatedBlastNode?.id;

            let strokeColor = isDarkTheme ? '#334155' : '#CBD5E1';
            let marker = 'url(#arrow-default)';
            let dash = undefined;

            if (isBlast) {
              strokeColor = '#F43F5E';
              marker = 'url(#arrow-blast)';
              dash = '5 3';
            } else if (isSupersedes) {
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
                  strokeWidth={isBlast ? 2.4 : (isSupersedes || isReplaces ? 1.8 : 1.2)}
                  strokeDasharray={dash}
                  markerEnd={marker}
                  className="transition-all duration-300"
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  fill={isBlast ? '#F43F5E' : (isSupersedes ? '#FB7185' : (isDarkTheme ? '#64748B' : '#94A3B8'))}
                  fontSize="7.5"
                  fontFamily="monospace"
                  className="select-none pointer-events-none font-semibold"
                >
                  {edge.type}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const colors = getNodeColors(node);
            const isSelected = selectedNodeId === node.id;
            const inBlast = blastNodeIds.has(node.id);
            const isSimRoot = simulatedBlastNode?.id === node.id;

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

                {/* Outer Glow Halo */}
                <rect
                  x="-36"
                  y="-26"
                  width="72"
                  height="52"
                  rx="10"
                  ry="10"
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={isSelected || inBlast || isSimRoot ? 2.5 : 1.2}
                  opacity={isSelected || inBlast || isSimRoot ? 0.95 : 0.25}
                  className={`transition-all duration-150 group-hover:opacity-95 ${inBlast ? 'animate-pulse' : ''}`}
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
                  stroke={isSimRoot ? '#38BDF8' : colors.stroke}
                  strokeWidth={isSelected || isSimRoot ? "2.5" : "1.6"}
                  className="transition-all duration-150 group-hover:brightness-95 dark:group-hover:brightness-110"
                />

                {/* High-Contrast Vision OCR Machine-Readable Overlay */}
                {isVisionOcr && (
                  <rect
                    x="-30"
                    y="-20"
                    width="60"
                    height="12"
                    rx="3"
                    fill={inBlast ? '#E11D48' : (isDarkTheme ? '#FFFFFF' : '#0F172A')}
                    className="pointer-events-none"
                  />
                )}

                {/* Node ID Label */}
                <text
                  textAnchor="middle"
                  dy={isVisionOcr ? "-2" : "-3"}
                  fill={isVisionOcr ? (isDarkTheme ? '#000000' : '#FFFFFF') : colors.text}
                  fontSize={isVisionOcr ? "10.5" : "9.5"}
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
                  fill={inBlast ? '#F43F5E' : (isDarkTheme ? '#94A3B8' : '#64748B')}
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
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
        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#0B0D11]/90 border border-slate-300 dark:border-white/15 rounded-lg p-2.5 sm:p-3 text-[10px] font-mono space-y-1.5 backdrop-blur-md shadow-md dark:shadow-xl pointer-events-none">
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
            <span className="w-2 h-2 rounded bg-slate-900 dark:bg-white border border-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">:Decision (Architectural Constraint)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300">:AgentAction (Enclosed Write)</span>
          </div>
        </div>
      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          onClose={onCloseNode}
          repo={repo}
          branch={branch}
          isDarkTheme={isDarkTheme}
          isFalkorDB={Boolean(isDemo || (typeof title === 'string' && title.includes('FalkorDB')))}
          onToggleSimulate={(n) => setSimulatedBlastNode(curr => curr?.id === n.id ? null : n)}
          isSimulating={simulatedBlastNode?.id === selectedNode.id}
          onOpenSyncPr={onOpenSyncPr}
          hasDrift={Boolean(unsyncedList?.some(u => u.targetId === selectedNode.id))}
        />
      )}
    </div>
  );
}
