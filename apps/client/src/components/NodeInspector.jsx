import React from 'react';
import { X, AlertTriangle, CheckCircle2, Database, KeyRound, Clock } from 'lucide-react';
import { playClick } from '../utils/soundFx';

export default function NodeInspector({ node, onClose, isFalkorDB }) {
  if (!node) return null;

  const isStale =
    node.status === 'SUPERSEDED' ||
    node.status === 'INVALIDATED_NEEDS_REVALIDATION' ||
    node.is_stale;

  // Strict Truth-in-Data: differentiate live FalkorDB demo vs GitHub ADR AST
  const isFalkor = isFalkorDB ?? (
    node.is_demo === true ||
    (!node.ref?.includes('docs/adrs') && !node.adr_path && !node.id.startsWith('ADR-') && !node.id.startsWith('F-') && !node.id.startsWith('act-') && node.is_demo !== false)
  );

  return (
    <div className="absolute top-12 right-4 w-80 max-w-[calc(100%-2rem)] bg-white/95 dark:bg-[#0B0D11]/95 border border-slate-300 dark:border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-30 font-mono text-xs animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/15 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          {isStale ? (
            <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          )}
          <span className="font-bold text-slate-800 dark:text-slate-100">
            Node Inspector: <span className="text-slate-950 dark:text-white font-bold">{node.id}</span>
          </span>
        </div>
        <button
          onClick={() => {
            playClick();
            if (onClose) onClose();
          }}
          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors tactile-btn"
          aria-label="Close Inspector"
        >
          <X className="w-4 h-4 text-current transition-colors" />
        </button>
      </div>

      {/* Node Properties Grid */}
      <div className="space-y-3">
        {/* Double-bezel inner metadata card */}
        <div className="bezel-inner p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Graph Label</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161B22] border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-300 font-bold text-[10px]">
              :{node.label}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Causal Status</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                isStale
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/40'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/40'
              }`}
            >
              {node.status || (node.is_stale ? 'STALE' : 'ACTIVE')}
            </span>
          </div>

          {node.verified !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Grounded In DAG</span>
              <span className={`text-[10px] font-bold ${node.verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {node.verified ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        {node.title && (
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              Title / Directive
            </span>
            <div className="text-slate-800 dark:text-slate-200 font-sans text-xs bg-slate-50 dark:bg-[#060709] p-2.5 rounded-lg border border-slate-200 dark:border-white/15 leading-relaxed">
              {node.title}
            </div>
          </div>
        )}

        {node.claim && (
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              Extracted Fact Claim
            </span>
            <div className="text-slate-800 dark:text-slate-200 font-sans text-xs bg-slate-50 dark:bg-[#060709] p-2.5 rounded-lg border border-slate-200 dark:border-white/15 leading-relaxed italic">
              "{node.claim}"
            </div>
          </div>
        )}

        {node.target_file && (
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              Target Code File
            </span>
            <span className="text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-mono truncate block text-[11px]">
              {node.target_file}
            </span>
          </div>
        )}

        {node.ref && (
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              Source File Provenance
            </span>
            <span className="text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-mono truncate block text-[11px] hover:underline cursor-pointer transition-colors">
              {node.ref}
            </span>
          </div>
        )}

        {node.latency_ms !== undefined && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Gate Latency:</span>
            <span className="font-bold text-slate-900 dark:text-white">{node.latency_ms}ms</span>
          </div>
        )}

        {/* Footer Info — Genuine storage provenance per Section 37 Truth in Data */}
        <div className="pt-2.5 border-t border-slate-200 dark:border-white/15 text-[10px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1 font-mono">
            <Database className="w-3 h-3 text-slate-800 dark:text-white" />
            {isFalkor ? 'FalkorDB GraphBLAS' : 'GitHub ADR AST'}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            {isFalkor ? 'Live Synced' : 'Branch Head (Git)'}
          </span>
        </div>
      </div>
    </div>
  );
}
