import { motion } from 'framer-motion';
import React from 'react';
import { X, GripHorizontal, Zap, AlertTriangle, CheckCircle2, Database, Clock, ExternalLink, Activity, GitPullRequest } from 'lucide-react';
import { playClick } from '../utils/soundFx';

export default function NodeInspector({
  node,
  onClose,
  isFalkorDB,
  repo,
  branch = 'main',
  onToggleSimulate,
  isSimulating = false,
  onOpenSyncPr,
  hasDrift = false,
  onTestDecision,
  isVerifyingAction = false,
  isFullscreen = false,
  hasBlastBanner = false,
  containerRef
}) {
  if (!node) return null;

  const isStale =
    node.status === 'SUPERSEDED' ||
    node.status === 'INVALIDATED_NEEDS_REVALIDATION' ||
    node.is_stale;

  // Strict Truth-in-Data: differentiate live FalkorDB demo vs GitHub ADR AST without fuzzy guessing
  const isFalkor = isFalkorDB !== undefined
    ? Boolean(isFalkorDB)
    : Boolean(node.is_demo === true || (node.id?.startsWith('act-') && !node.repo));

  const adrFilePath = node.file || node.adr_path || (node.ref && !node.ref.includes('://') ? node.ref : null) || (node.id?.startsWith('ADR-') ? `docs/adrs/${node.id}.md` : null);
  const codeFilePath = node.target_file;

  const adrGitUrl = (repo?.full_name && adrFilePath)
    ? `https://github.com/${repo.full_name}/blob/${branch}/${adrFilePath.replace(/^\.?\//, '')}`
    : null;

  const codeGitUrl = (repo?.full_name && codeFilePath)
    ? `https://github.com/${repo.full_name}/blob/${branch}/${codeFilePath.replace(/^\.?\//, '')}`
    : null;

  const primaryGitUrl = (node.label === 'Source' || !codeGitUrl) ? adrGitUrl : codeGitUrl;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={containerRef || false}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`absolute ${hasBlastBanner ? 'top-16' : 'top-12'} right-3 sm:right-4 ${
        isFullscreen ? 'w-76 sm:w-80' : 'w-68 sm:w-72'
      } max-w-[calc(100%-1.5rem)] max-h-[calc(100%-4rem)] overflow-y-auto bg-white/95 dark:bg-[#0B0D11]/95 border border-slate-300 dark:border-white/15 rounded-2xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-xl z-30 font-mono text-xs select-text`}
      data-lenis-prevent
    >
      {/* Header with Draggable Handle */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/15 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0 cursor-grab active:cursor-grabbing" title="Drag to reposition inspector card">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 hover:text-slate-800 dark:hover:text-white transition-colors" />
          {isStale ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          )}
          <span className="font-bold text-slate-800 dark:text-slate-100 truncate text-[11px]">
            Node: <span className="text-slate-950 dark:text-white font-bold">{node.id}</span>
          </span>
        </div>
        <button
          onClick={() => {
            playClick();
            if (onClose) onClose();
          }}
          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors tactile-btn shrink-0 cursor-pointer"
          aria-label="Close Inspector"
        >
          <X className="w-3.5 h-3.5 text-current transition-colors" />
        </button>
      </div>

      {/* Node Properties Grid */}
      <div className="space-y-2">
        {/* Double-bezel inner metadata card */}
        <div className="bezel-inner p-2.5 space-y-1.5">
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
            <span className="text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-mono truncate block text-[11px]">
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

        {/* Interactive Actions Suite: Blast Radius Simulation & Git Actions */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/15 space-y-2">
          {node.label === 'Decision' && onTestDecision && (
            <button
              onClick={() => {
                playClick();
                onTestDecision(node.id);
              }}
              disabled={isVerifyingAction}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer tactile-btn shadow-xs disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isVerifyingAction ? 'animate-spin' : ''}`} />
              <span>{isVerifyingAction ? 'Verifying Gate...' : `Verify Agent Write on ${node.id}`}</span>
            </button>
          )}
          {onToggleSimulate && (
            <button
              onClick={() => {
                playClick();
                onToggleSimulate(node);
              }}
              className={`w-full py-1.5 px-3 rounded-lg border text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer tactile-btn ${
                isSimulating
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm animate-pulse'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>{isSimulating ? 'Stop Blast Simulation' : 'Simulate Invalidation (What-If)'}</span>
            </button>
          )}

          {adrGitUrl && (
            <a
              href={adrGitUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-[11px] font-bold font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer tactile-btn no-underline"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-600 dark:text-slate-400" />
              <span>{node.label === 'Decision' ? 'View ADR on GitHub' : 'View on GitHub'}</span>
            </a>
          )}

          {node.label === 'Decision' && codeGitUrl && (
            <a
              href={codeGitUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-[11px] font-bold font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer tactile-btn no-underline"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-600 dark:text-slate-400" />
              <span>View Code on GitHub</span>
            </a>
          )}

          {hasDrift && onOpenSyncPr && (
            <button
              onClick={() => {
                playClick();
                onOpenSyncPr(node);
              }}
              className="w-full py-1.5 px-3 rounded-lg border border-amber-400 bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-200 text-[11px] font-bold font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer tactile-btn"
            >
              <GitPullRequest className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
              <span>Open Status Sync PR</span>
            </button>
          )}
        </div>

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
    </motion.div>
  );
}
