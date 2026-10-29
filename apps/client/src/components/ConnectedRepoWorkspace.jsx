import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GitBranch, FolderGit2, FileText, RefreshCw, Terminal, GitPullRequest,
  CheckCircle2, AlertTriangle, ExternalLink, Trash2
} from 'lucide-react';
import GraphCanvas from './GraphCanvas';
import SubsystemErrorBoundary from './SubsystemErrorBoundary';
import { playClick, playApprovalChime, playRejectBuzz } from '../utils/soundFx';

/**
 * ConnectedRepoWorkspace.jsx — Live view of a connected GitHub repository.
 *
 * Flow:
 *   1. Scan   GET  /api/github/repos/:owner/:repo/adrs   reads the default branch, parses ADRs, returns the graph.
 *   2. Empty  POST /api/github/repos/:owner/:repo/init-adr   opens a pull request with a starter ADR.
 *             Nothing is committed to the default branch; the owner reviews and merges on GitHub.
 *   3. Rescan after merge, the real ADR graph renders.
 */

const btnBase =
  'h-9 px-3 rounded-xl border text-xs font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
const btnSecondary =
  `${btnBase} border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white`;
const btnPrimary =
  `${btnBase} border-slate-900 dark:border-white bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90`;

const ERROR_COPY = {
  AUTH_REQUIRED: 'Your GitHub session has expired. Sign in again to continue.',
  AUTH_EXPIRED: 'Your GitHub session has expired. Sign in again to continue.',
  NOT_FOUND: 'This repository was not found, or your GitHub account cannot access it.',
  FORBIDDEN: 'GitHub denied the request. Opening a pull request needs write access to this repository.',
  REPO_EMPTY: 'This repository has no commits yet. Push a first commit, then scan again.',
  RATE_LIMITED: 'Too many requests. Wait a few minutes and try again.',
  ADRS_EXIST: 'This repository already has ADRs. Scan again to load them.'
};

function splitFullName(fullName = '') {
  const [owner, ...rest] = fullName.split('/');
  return { owner, name: rest.join('/') };
}

export default function ConnectedRepoWorkspace({
  repo,
  isDarkTheme,
  onUpdateRepo,
  onDisconnectRepo
}) {
  const { owner, name } = splitFullName(repo.full_name);
  const apiBase = `/api/github/repos/${encodeURIComponent(owner || '')}/${encodeURIComponent(name || '')}`;

  const [phase, setPhase] = useState('scanning'); // scanning | ready | error
  const [scan, setScan] = useState(null);
  const [error, setError] = useState(null);
  const [isOpeningPr, setIsOpeningPr] = useState(false);
  const [showInitConfirmModal, setShowInitConfirmModal] = useState(false);
  const [syncingTarget, setSyncingTarget] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Keep the latest props in refs so scan() does not change identity when the parent updates the repo.
  const repoRef = useRef(repo);
  repoRef.current = repo;
  const onUpdateRepoRef = useRef(onUpdateRepo);
  onUpdateRepoRef.current = onUpdateRepo;

  const addLog = useCallback((component, text, type = 'INFO') => {
    setLogs(prev => [...prev, { component, text, type, time: new Date().toLocaleTimeString() }]);
  }, []);

  const failWith = useCallback((data, fallback) => {
    const message = ERROR_COPY[data?.code] || data?.error || fallback;
    setError({ code: data?.code || 'ERROR', message });
    setPhase('error');
    playRejectBuzz();
    addLog('GITHUB', message, 'GATE_BLOCK');
  }, [addLog]);

  const runScan = useCallback(async () => {
    setPhase('scanning');
    setError(null);
    addLog('SCAN', `Reading ADRs from ${repoRef.current.full_name} on its default branch.`);
    try {
      const res = await fetch(`${apiBase}/adrs?_t=${Date.now()}`, { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        failWith(data, 'Could not read this repository.');
        return;
      }
      setScan(data);
      setPhase('ready');
      addLog('PARSER', `Found ${data.count} ADR file${data.count === 1 ? '' : 's'} on branch ${data.branch}.`, data.count ? 'CASCADE' : 'INFO');
      if (data.count > 0) {
        addLog('GRAPH', `Built ${data.graph.nodes.length} nodes and ${data.graph.edges.length} edges from the ADRs.`);
        playApprovalChime();
      } else {
        addLog('GITHUB', '0 ADR files detected on default branch. If you recently merged a pull request, GitHub edge caches take ~10-15s to update. Please wait a moment and click Rescan.', 'INFO');
      }
      const current = repoRef.current;
      const hasAdrs = data.count > 0;
      if (onUpdateRepoRef.current && current.hasAdrs !== hasAdrs) {
        onUpdateRepoRef.current({ ...current, hasAdrs });
      }
    } catch {
      failWith(null, 'Could not reach the CAVDAX server. Check your connection and try again.');
    }
  }, [apiBase, addLog, failWith]);

  // Scan once per repository. Keyed on full_name so parent state updates never retrigger it.
  useEffect(() => {
    setScan(null);
    setSelectedNode(null);
    setLogs([]);
    runScan();
  }, [repo.full_name, runScan]);

  const openPullRequest = async () => {
    playClick();
    setIsOpeningPr(true);
    setError(null);
    addLog('PULL_REQUEST', 'Creating a branch and opening a pull request with a starter ADR.');
    try {
      const res = await fetch(`${apiBase}/init-adr`, { method: 'POST', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        failWith(data, 'Could not open the pull request.');
        return;
      }
      const pr = data.pullRequest;
      playApprovalChime();
      addLog('PULL_REQUEST', `${pr.reused ? 'Pull request already open' : 'Opened pull request'} #${pr.number} from ${pr.branch}.`, 'CASCADE');
      if (pr.detected?.length) addLog('DETECT', `Detected ${pr.detected.join(', ')} from the repository manifest.`);
      if (onUpdateRepo) {
        onUpdateRepo({ ...repo, adrPr: { number: pr.number, url: pr.url, branch: pr.branch } });
      }
      setPhase('ready');
    } catch {
      failWith(null, 'Could not reach the CAVDAX server. Check your connection and try again.');
    } finally {
      setIsOpeningPr(false);
    }
  };

  const forgetPullRequest = () => {
    playClick();
    if (onUpdateRepo) {
      const { adrPr, ...rest } = repo;
      onUpdateRepo(rest);
    }
  };

  const openSyncPullRequest = async (targetId, supersedingId) => {
    playClick();
    setSyncingTarget(targetId);
    setError(null);
    addLog('SYNC_PR', `Creating branch and opening pull request to mark ${targetId} superseded by ${supersedingId}.`);
    try {
      const res = await fetch(`${apiBase}/sync-adr-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetId, supersedingId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        failWith(data, 'Could not open the sync pull request.');
        return;
      }
      const pr = data.pullRequest;
      playApprovalChime();
      addLog('SYNC_PR', `${pr.reused ? 'Sync pull request already open' : 'Opened sync pull request'} #${pr.number} on branch ${pr.branch}.`, 'CASCADE');
      setScan(prev => prev ? {
        ...prev,
        unsynced: (prev.unsynced || []).filter(u => u.targetId !== targetId)
      } : prev);
    } catch {
      failWith(null, 'Could not reach the CAVDAX server. Check your connection.');
    } finally {
      setSyncingTarget(null);
    }
  };

  const [isVerifyingAction, setIsVerifyingAction] = useState(false);

  const testDecision = async (targetDecisionIdOrWantValid) => {
    const decisions = (scan?.graph?.nodes || []).filter(n => n.label === 'Decision');
    if (decisions.length === 0) {
      addLog('MCP_GATE', 'No architectural decisions found in this repository yet.');
      return;
    }

    let target = null;
    if (typeof targetDecisionIdOrWantValid === 'string') {
      target = decisions.find(d => d.id === targetDecisionIdOrWantValid) || decisions[0];
    } else if (typeof targetDecisionIdOrWantValid === 'boolean') {
      target = decisions.find(d => (targetDecisionIdOrWantValid ? d.status === 'VALID' : (d.status === 'INVALIDATED_NEEDS_REVALIDATION' || d.status === 'SUPERSEDED')));
      if (!target) {
        addLog('MCP_GATE', targetDecisionIdOrWantValid
          ? 'No valid decision found in repository graph.'
          : 'No superseded decision found. Merge an ADR that supersedes an existing one to test gate rejection.');
        return;
      }
    } else {
      target = decisions[0];
    }

    const adrNode = (scan?.graph?.nodes || []).find(n => n.label === 'Source' && (n.id === target.id || n.id === target.source_adr || n.id === target.from));
    const targetFile = target.target_file || target.file || target.adr_path || adrNode?.file || null;

    setIsVerifyingAction(true);
    const clientStart = performance.now();

    try {
      const res = await fetch(`/api/github/repos/${repo.full_name}/verify-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          decisionId: target.id,
          targetFile
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const latencyMs = data.latency_ms ?? parseFloat((performance.now() - clientStart).toFixed(2));
      const actionNode = data.action;
      const actionEdge = data.edge;

      setScan(prev => {
        if (!prev || !prev.graph) return prev;
        const existingAction = prev.graph.nodes.find(n => n.label === 'AgentAction' && (n.decision_id === target.id || n.id === actionNode.id));
        const previousCount = existingAction?.probe_count || 0;
        const probeCount = previousCount + 1;

        const updatedActionNode = {
          ...actionNode,
          probe_count: probeCount,
          last_probed_at: Date.now(),
          title: `ACT: ${actionNode.status === 'APPROVED' ? 'Verified Write' : 'Blocked Write'} (${target.id})${probeCount > 1 ? ` (${probeCount}x)` : ''}`
        };

        const otherNodes = prev.graph.nodes.filter(n => !(n.label === 'AgentAction' && (n.decision_id === target.id || n.id === actionNode.id)));
        const otherEdges = prev.graph.edges.filter(e => !(e.type === 'GROUNDED_IN' && e.target === target.id));
        return {
          ...prev,
          graph: {
            nodes: [...otherNodes, updatedActionNode],
            edges: [...otherEdges, actionEdge]
          }
        };
      });

      if (data.is_approved) {
        playApprovalChime();
        addLog('MCP_GATE', `Agent write to ${data.target_file} APPROVED (grounded in ${target.id}: VALID). Verified in ${latencyMs}ms.`, 'GATE_APPROVE');
      } else {
        playRejectBuzz();
        addLog('MCP_GATE', `Agent write to ${data.target_file} BLOCKED: grounded in ${target.id} whose source was superseded. Verified in ${latencyMs}ms.`, 'GATE_BLOCK');
      }
    } catch (err) {
      playRejectBuzz();
      addLog('MCP_GATE', `Gate verification error: ${err.message}. (Authentic verification requires active server connection)`, 'GATE_BLOCK');
    } finally {
      setIsVerifyingAction(false);
    }
  };

  const hasAdrs = phase === 'ready' && scan && scan.count > 0;
  const noAdrs = phase === 'ready' && scan && scan.count === 0;
  const pr = repo.adrPr;

  const decisions = (scan?.graph?.nodes || []).filter(n => n.label === 'Decision');
  const validDecisions = decisions.filter(d => d.status === 'VALID');
  const staleDecisions = decisions.filter(d => d.status === 'INVALIDATED_NEEDS_REVALIDATION' || d.status === 'SUPERSEDED');

  const selectedDecision = selectedNode?.label === 'Decision'
    ? selectedNode
    : (selectedNode?.label === 'Source' ? decisions.find(d => d.source_adr === selectedNode.id || d.id === selectedNode.id) : null);

  const activeValidDecision = (selectedDecision && selectedDecision.status === 'VALID')
    ? selectedDecision
    : (validDecisions[0] || null);

  const activeStaleDecision = (selectedDecision && (selectedDecision.status === 'INVALIDATED_NEEDS_REVALIDATION' || selectedDecision.status === 'SUPERSEDED'))
    ? selectedDecision
    : (staleDecisions[0] || null);

  return (
    <div className="flex-1 min-h-0 flex flex-col font-mono select-none">
      {/* Repository ribbon */}
      <div className="flex-shrink-0 py-2 px-3 sm:px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-200/80 dark:bg-white/10 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
            <GitBranch className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-950 dark:text-white truncate block">{repo.full_name}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans truncate block mt-0.5">
              Branch: {scan?.branch || repo.default_branch || 'main'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => { playClick(); runScan(); }} disabled={phase === 'scanning'} className={btnSecondary}>
            <RefreshCw className={`w-4 h-4 ${phase === 'scanning' ? 'animate-spin' : ''}`} strokeWidth={2} />
            <span>Rescan</span>
          </button>
          {onDisconnectRepo && (
            <button
              onClick={() => { playClick(); onDisconnectRepo(repo.id); }}
              className={`${btnSecondary} hover:bg-rose-500/10 hover:border-rose-500/30`}
              title="Disconnect this repository"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage */}
      {phase === 'scanning' && (
        <StateCard icon={<RefreshCw className="w-6 h-6 text-slate-700 dark:text-slate-300 animate-spin" />}
          title="Scanning repository"
          body={<>Reading ADR files from <strong className="font-mono text-slate-950 dark:text-white">{repo.full_name}</strong> on branch <strong className="font-mono">{scan?.branch || repo.default_branch || 'main'}</strong>.</>} />
      )}

      {phase === 'error' && (
        <StateCard icon={<AlertTriangle className="w-6 h-6 text-rose-500" />}
          title="Could not complete the request"
          body={error?.message}
          actions={
            <div className="grid grid-cols-2 gap-2">
              {error?.code === 'AUTH_REQUIRED' || error?.code === 'AUTH_EXPIRED' ? (
                <a href={`/api/auth/github?returnTo=${encodeURIComponent('/console')}`} className={`${btnPrimary} no-underline`}>Sign in</a>
              ) : (
                <button onClick={() => { playClick(); runScan(); }} className={btnPrimary}>Try again</button>
              )}
              <button onClick={() => { playClick(); onDisconnectRepo?.(repo.id); }} className={btnSecondary}>Disconnect</button>
            </div>
          } />
      )}

      {noAdrs && !pr && (
        <StateCard icon={<FolderGit2 className="w-6 h-6 text-slate-700 dark:text-slate-300" />}
          title="No Architecture Decision Records found"
          body={<>No ADRs found in <strong className="font-mono text-slate-950 dark:text-white">{repo.full_name}</strong>. Initialize will inspect your stack and open a starter ADR-001 pull request without committing directly to <strong className="font-mono">{scan.branch}</strong>.</>}
          actions={
            <button onClick={() => { playClick(); setShowInitConfirmModal(true); }} disabled={isOpeningPr} className={`${btnPrimary} w-full cursor-pointer`}>
              <GitPullRequest className={`w-4 h-4 ${isOpeningPr ? 'animate-spin' : ''}`} strokeWidth={2} />
              <span>{isOpeningPr ? 'Opening pull request' : 'Open pull request with ADR-001'}</span>
            </button>
          }
          footnote={<>Already have ADRs? Put them in <code className="font-mono bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">docs/adrs</code>, <code className="font-mono bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">docs/adr</code>, root <code className="font-mono bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">ADR-*.md</code> or <code className="font-mono bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">docs/decisions</code> and rescan.</>} />
      )}

      {noAdrs && pr && (
        <StateCard icon={<GitPullRequest className="w-6 h-6 text-slate-700 dark:text-slate-300" />}
          title={`Pull request #${pr.number} is waiting for review`}
          body={<>Review the starter ADR on GitHub and merge it into <strong className="font-mono text-slate-950 dark:text-white">{scan.branch}</strong>. Then rescan and CAVDAX will build the decision graph from it.</>}
          actions={
            <div className="grid grid-cols-2 gap-2">
              <a href={pr.url} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} no-underline`}>
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
                <span>View on GitHub</span>
              </a>
              <button
                onClick={() => { playClick(); runScan(); }}
                disabled={phase === 'scanning'}
                className={`${btnSecondary} cursor-pointer disabled:opacity-50`}
              >
                <RefreshCw className={`w-4 h-4 ${phase === 'scanning' ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span>{phase === 'scanning' ? 'Rescanning repository...' : 'I merged it, rescan'}</span>
              </button>
            </div>
          }
          footnote={<>Closed the pull request? <button onClick={forgetPullRequest} className="underline cursor-pointer text-slate-700 dark:text-slate-200">Open a new one</button>.</>} />
      )}

      {hasAdrs && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-slate-300 dark:border-white/15 shadow-sm">
          {/* Left: ADR files and activity — Adaptive theme styling for complete visual harmony */}
          <div className="lg:col-span-5 h-full overflow-hidden flex flex-col bg-white dark:bg-[#0c0c0e] text-slate-800 dark:text-slate-200 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-mono bg-slate-50/80 dark:bg-white/[0.02]">
              <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="font-bold text-slate-950 dark:text-white">ADRs in this repository</span>
              <span className="ml-auto text-[10px] text-slate-500 dark:text-slate-400 font-mono">{scan.count} files</span>
            </div>

            <div data-lenis-prevent className="max-h-24 overflow-y-auto overscroll-contain border-b border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-white/5 bg-slate-50/40 dark:bg-transparent select-text">
              {scan.adrs.map(a => (
                <div key={a.path} className="px-3 py-2 text-[11px] leading-snug hover:bg-slate-100/60 dark:hover:bg-white/[0.03] transition-colors">
                  <div className="text-slate-900 dark:text-slate-100 font-semibold truncate">{a.id}: {a.title}</div>
                  <div className="text-slate-500 dark:text-slate-400 truncate">{a.path}</div>
                </div>
              ))}
            </div>

            {scan.unsynced && scan.unsynced.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/30 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{scan.unsynced.length} ADR Status Drift Detected</span>
                </div>
                <div className="text-[11px] text-amber-900/90 dark:text-amber-200/80 leading-relaxed font-sans">
                  {scan.unsynced.map(u => (
                    <div key={u.targetId} className="flex flex-col gap-1.5 mt-1 pt-1 border-t border-amber-200 dark:border-amber-500/20 first:border-0 first:pt-0">
                      <div>
                        <strong className="font-mono text-amber-950 dark:text-amber-200">{u.targetId}</strong> is superseded by <strong className="font-mono text-amber-950 dark:text-amber-200">{u.supersedingId}</strong> in the graph, but its file status is still <code className="px-1 rounded bg-amber-200/60 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300">{u.currentStatus}</code>.
                      </div>
                      <button
                        onClick={() => openSyncPullRequest(u.targetId, u.supersedingId)}
                        disabled={syncingTarget === u.targetId}
                        className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-bold font-mono text-[11px] hover:bg-amber-300 transition-colors disabled:opacity-50 cursor-pointer self-start shadow-xs"
                      >
                        <GitPullRequest className={`w-3.5 h-3.5 ${syncingTarget === u.targetId ? 'animate-spin' : ''}`} />
                        <span>{syncingTarget === u.targetId ? 'Opening PR...' : `Open PR: Mark ${u.targetId} Superseded`}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision-Aware Intent Verification Panel */}
            <div className="p-3 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono font-bold">
                  Intent Verification Gate
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {decisions.length} {decisions.length === 1 ? 'Decision' : 'Decisions'} Detected
                </span>
              </div>

              {decisions.length === 0 ? (
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 py-1">
                  Initialize an ADR baseline to verify agent writes against repository constraints.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Primary Valid Decision Probe */}
                    {activeValidDecision ? (
                      <button
                        disabled={isVerifyingAction}
                        onClick={() => testDecision(activeValidDecision.id)}
                        className={`${btnBase} border-slate-900 dark:border-white/20 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-40 shadow-xs cursor-pointer`}
                        title={`Click to test agent code write grounded in ${activeValidDecision.id}`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isVerifyingAction ? 'animate-spin' : ''}`} strokeWidth={2} />
                        <span className="truncate">Verify: {activeValidDecision.id} (Valid)</span>
                      </button>
                    ) : (
                      <div className="p-1.5 rounded-lg border border-dashed border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-400 text-center">
                        No valid decision
                      </div>
                    )}

                    {/* Stale/Invalidated Decision Probe */}
                    {activeStaleDecision ? (
                      <button
                        disabled={isVerifyingAction}
                        onClick={() => testDecision(activeStaleDecision.id)}
                        className={`${btnBase} border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 disabled:opacity-40 cursor-pointer`}
                        title={`Click to test gate rejection on invalidated decision ${activeStaleDecision.id}`}
                      >
                        <AlertTriangle className={`w-3.5 h-3.5 ${isVerifyingAction ? 'animate-spin' : ''}`} strokeWidth={2} />
                        <span className="truncate">Verify: {activeStaleDecision.id} (Stale)</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className={`${btnBase} border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-white/[0.02] text-slate-400 dark:text-slate-500 cursor-not-allowed`}
                        title="Repository has no invalidated decisions. Merge a superseding ADR to test gate blocking."
                      >
                        <AlertTriangle className="w-3.5 h-3.5 opacity-40 shrink-0" strokeWidth={2} />
                        <span className="truncate">0 Stale Decisions</span>
                      </button>
                    )}
                  </div>

                  {staleDecisions.length === 0 && validDecisions.length > 0 && (
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-normal pt-0.5">
                      All decisions currently valid. Select a decision node on the canvas to inspect or probe its gate clearance.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div data-lenis-prevent className="flex-1 min-h-0 p-3 overflow-y-auto space-y-2 text-xs select-text bg-white dark:bg-[#09090b]">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] shrink-0 mt-0.5 font-mono">{log.time}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 font-mono ${
                    log.type === 'CASCADE' ? 'bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-300/40 dark:border-transparent' :
                    log.type === 'GATE_APPROVE' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 dark:border-transparent' :
                    log.type === 'GATE_BLOCK' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300/40 dark:border-transparent' :
                    'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent'
                  }`}>{log.component}</span>
                  <span className="text-slate-800 dark:text-slate-200 text-[11px] break-words min-w-0 font-mono">{log.text}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Right: graph built from this repository's ADRs */}
          <div className="lg:col-span-7 h-full relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            <SubsystemErrorBoundary name="Repository Knowledge Graph Canvas">
              <GraphCanvas
                title={`Repository Decision Graph · ${repo.full_name || 'Connected Repository'}`}
                graphData={scan.graph}
                onSelectNode={setSelectedNode}
                selectedNodeId={selectedNode?.id}
                selectedNode={selectedNode}
                onCloseNode={() => setSelectedNode(null)}
                isDarkTheme={isDarkTheme}
                isDemo={false}
                repo={repo}
                branch={scan?.branch || repo.default_branch || 'main'}
                unsyncedList={scan?.unsynced || []}
                onOpenSyncPr={(node) => {
                  const driftItem = (scan?.unsynced || []).find(u => u.targetId === node.id);
                  if (driftItem) {
                    openSyncPullRequest(driftItem.targetId, driftItem.supersedingId);
                  }
                }}
                onTestDecision={testDecision}
                isVerifyingAction={isVerifyingAction}
              />
            </SubsystemErrorBoundary>
          </div>
        </div>
      )}

      {/* Confirmation modal before opening starter PR on external repo */}
      {showInitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono animate-in fade-in">
          <div className="max-w-md w-full bg-white dark:bg-[#0c0d11] border border-slate-300 dark:border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <GitPullRequest className="w-5 h-5 text-sky-500 shrink-0" />
              <h3 className="font-bold text-sm">Confirm Starter Pull Request</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              CAVDAX will create branch <code className="font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200">cavdax/init-adr</code> and open a starter Pull Request on repository <strong className="font-mono text-slate-900 dark:text-white">{repo.full_name}</strong>.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
              Detected ecosystem manifests will be parsed to draft your initial Architecture Decision Record (ADR-001). Nothing is committed to <strong className="font-mono text-slate-800 dark:text-slate-200">{scan?.branch || repo.default_branch || 'main'}</strong> until you review and merge on GitHub.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  playClick();
                  setShowInitConfirmModal(false);
                }}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowInitConfirmModal(false);
                  openPullRequest();
                }}
                disabled={isOpeningPr}
                className={btnPrimary}
              >
                <GitPullRequest className="w-4 h-4 shrink-0" />
                <span>Confirm & Open PR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity log for the empty and error states */}
      {!hasAdrs && phase !== 'scanning' && logs.length > 0 && (
        <div className="flex-shrink-0 mt-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-2.5 max-h-24 overflow-y-auto space-y-1">
          {logs.slice(-4).map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <Terminal className="w-3 h-3 mt-0.5 shrink-0 text-slate-400" />
              <span className="font-bold uppercase text-[10px] shrink-0">{log.component}</span>
              <span className="break-words min-w-0">{log.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StateCard({ icon, title, body, actions, footnote }) {
  return (
    <div className="flex-1 min-h-0 flex items-center justify-center p-4">
      <div className="max-w-xl w-full p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] shadow-xl text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10 border border-slate-300 dark:border-white/15 flex items-center justify-center mx-auto">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-950 dark:text-white mb-1.5">{title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed max-w-md mx-auto">{body}</p>
        </div>
        {actions && <div className="pt-1 max-w-sm mx-auto">{actions}</div>}
        {footnote && <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{footnote}</div>}
      </div>
    </div>
  );
}
