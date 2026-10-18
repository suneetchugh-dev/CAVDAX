import React from 'react';
import { X, ExternalLink, ShieldCheck, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export default function NodeInspector({ node, onClose }) {
  if (!node) return null;

  const isStale = node.status === 'SUPERSEDED' || node.status === 'INVALIDATED_NEEDS_REVALIDATION' || node.is_stale;

  return (
    <div className="absolute top-12 right-4 w-80 bg-obsidian-850/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md z-30 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          {isStale ? (
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          )}
          <span className="font-bold text-slate-200">
            Node Inspector: <span className="text-cyan-400">{node.id}</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Node Properties */}
      <div className="space-y-2.5">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Graph Label</span>
          <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold mt-0.5">
            :{node.label}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Causal Status</span>
          <span className={`inline-block px-2 py-0.5 rounded font-semibold mt-0.5 ${
            isStale 
              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/40' 
              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
          }`}>
            {node.status || (node.is_stale ? 'STALE' : 'VERIFIED_ACTIVE')}
          </span>
        </div>

        {node.title && (
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Title / Directive</span>
            <div className="text-slate-300 font-sans text-xs mt-0.5 bg-obsidian-950 p-2 rounded border border-slate-800/80 leading-relaxed">
              {node.title}
            </div>
          </div>
        )}

        {node.claim && (
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Extracted Claim</span>
            <div className="text-slate-300 font-sans text-xs mt-0.5 bg-obsidian-950 p-2 rounded border border-slate-800/80 leading-relaxed">
              "{node.claim}"
            </div>
          </div>
        )}

        {node.ref && (
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Source Reference File</span>
            <span className="text-cyan-400 truncate block mt-0.5 hover:underline cursor-pointer">
              {node.ref}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Engine: FalkorDB GraphBLAS</span>
          <span>Verified: {node.verified !== false ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
}
