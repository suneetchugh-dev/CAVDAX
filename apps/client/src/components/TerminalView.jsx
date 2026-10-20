import React, { useRef, useEffect } from 'react';
import { Terminal, AlertTriangle, CheckCircle2, Clock, FileCode, Cpu } from 'lucide-react';
import CavdaxAgentStateIndicator from './CavdaxAgentStateIndicator';

export default function TerminalView({ terminalLogs, activeVerdict, latestAction, currentAct, agentState = 'idle' }) {
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0B0D11] border-r border-slate-300 dark:border-white/10 select-none">
      {/* Terminal Title Bar */}
      <div className="h-10 px-4 bg-slate-100 dark:bg-[#060709] border-b border-slate-300 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Monochromatic Window Dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-white/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
          <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
            CAVDAX Agent Enclosed MCP Terminal
          </span>
        </div>

        {/* Live Agent HUD & Gate Verdict Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white dark:bg-[#0B0D11] border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-800 dark:text-slate-300">
            <CavdaxAgentStateIndicator status={agentState} size={18} strokeWidth={4} />
            <span className="uppercase tracking-wider font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
              {agentState === 'reasoning'
                ? 'Reasoning'
                : agentState === 'executing'
                ? 'Evaluating'
                : agentState === 'verified'
                ? 'Verified'
                : agentState === 'rejected'
                ? 'Rejected'
                : 'Standby'}
            </span>
          </div>

          {activeVerdict && (
            <div className="flex items-center gap-1.5">
              {activeVerdict === 'BLOCKED' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-[#2A080E] border border-rose-300 dark:border-rose-500/40 text-[10px] font-mono font-bold text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  403 MCP GATE BLOCKED
                </span>
              ) : activeVerdict === 'APPROVED' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-[#06261B] border border-emerald-300 dark:border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  200 MCP GATE APPROVED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-200 dark:bg-[#161B22] border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  STANDBY
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visual Gate Alert Banner (MCP Interceptor Gate) */}
      <div data-tour="mcp-gate" className="w-full">
        {currentAct < 3 && (
          <div className="p-3 bg-slate-50 dark:bg-[#0E1118] border-b border-slate-300 dark:border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-200 font-mono tracking-wide">
                  MCP ENCLOSED VERIFICATION GATE: ACTIVE MONITORING
                </div>
                <div className="text-slate-600 dark:text-slate-400 mt-0.5 font-mono text-[11px]">
                  FalkorDB GraphBLAS gate active. Enclosing autonomous tool write invocations in &lt; 15ms.
                </div>
              </div>
            </div>
            <div className="shrink-0 p-1 rounded-xl bg-white dark:bg-[#060709] border border-slate-300 dark:border-white/10">
              <CavdaxAgentStateIndicator status="idle" size={38} strokeWidth={4} />
            </div>
          </div>
        )}

        {currentAct === 3 && (
          <div className="p-3 bg-rose-50 dark:bg-[#2A080E] border-b border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-rose-900 dark:text-rose-300 font-mono tracking-wide">
                  EXECUTION INTERCEPTED: BLOCKED_SUPERSEDED_SOURCE
                </div>
                <div className="text-rose-800/90 dark:text-rose-200/90 mt-0.5 font-mono text-[11px]">
                  FalkorDB Cypher traversal verified that <span className="font-bold text-slate-900 dark:text-white">DEC-102</span> depends on <span className="text-rose-700 dark:text-rose-300 font-bold">ADR-001 (SUPERSEDED)</span>. Zero files written to disk.
                </div>
              </div>
            </div>
            <div className="shrink-0 p-1 rounded-xl bg-white dark:bg-[#060709] border border-rose-300 dark:border-rose-500/30">
              <CavdaxAgentStateIndicator status="rejected" size={40} strokeWidth={4} />
            </div>
          </div>
        )}

        {currentAct === 4 && (
          <div className="p-3 bg-emerald-50 dark:bg-[#06261B] border-b border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-emerald-900 dark:text-emerald-300 font-mono tracking-wide">
                  VERIFIED CAUSAL PROVENANCE: APPROVED
                </div>
                <div className="text-emerald-800/90 dark:text-emerald-200/90 mt-0.5 font-mono text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-white">DEC-103</span> verified against fresh source <span className="text-emerald-700 dark:text-emerald-300 font-bold">ADR-002 (ACTIVE)</span>. Code written to <span className="font-bold text-slate-900 dark:text-white">payment.js</span>.
                </div>
              </div>
            </div>
            <div className="shrink-0 p-1 rounded-xl bg-white dark:bg-[#060709] border border-emerald-300 dark:border-emerald-500/30">
              <CavdaxAgentStateIndicator status="verified" size={40} strokeWidth={4} />
            </div>
          </div>
        )}
      </div>

      {/* Code Payload Inspector (Diff View) */}
      {latestAction && (
        <div className="p-3 bg-slate-100 dark:bg-[#08090A] border-b border-slate-300 dark:border-white/10 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-300">
              <FileCode className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
              Target: <span className="text-slate-950 dark:text-white font-bold">{latestAction.filePath}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono">
              Decision: {latestAction.decisionId}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-[#060709] border border-slate-300 dark:border-white/10 overflow-x-auto text-[11px] text-slate-900 dark:text-slate-200 leading-relaxed max-h-36">
            <pre><code>{latestAction.codeSnippet}</code></pre>
          </div>
        </div>
      )}

      {/* Terminal Log Console */}
      <div ref={logContainerRef} className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 select-text">
        {terminalLogs.map((log, index) => {
          let badgeColor = 'text-slate-800 dark:text-slate-300';
          let borderClass = 'border-slate-200 dark:border-white/10';
          let bgClass = 'bg-white dark:bg-[#11141B]';

          if (log.type === 'GATE_BLOCK') {
            badgeColor = 'text-rose-800 dark:text-rose-300 font-bold';
            borderClass = 'border-rose-300 dark:border-rose-900/40';
            bgClass = 'bg-rose-50 dark:bg-[#2A080E]/60';
          } else if (log.type === 'GATE_APPROVE') {
            badgeColor = 'text-emerald-800 dark:text-emerald-300 font-bold';
            borderClass = 'border-emerald-300 dark:border-emerald-900/40';
            bgClass = 'bg-emerald-50 dark:bg-[#06261B]/60';
          } else if (log.type === 'CASCADE') {
            badgeColor = 'text-slate-900 dark:text-slate-200 font-bold';
            borderClass = 'border-slate-300 dark:border-white/20';
            bgClass = 'bg-slate-100 dark:bg-white/[0.04]';
          } else if (log.type === 'REVALIDATION') {
            badgeColor = 'text-slate-950 dark:text-white font-bold';
            borderClass = 'border-slate-300 dark:border-white/20';
            bgClass = 'bg-slate-100 dark:bg-white/[0.06]';
          }

          return (
            <div
              key={index}
              className={`p-2.5 rounded-lg border ${borderClass} ${bgClass} transition-all`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400">
                  <Cpu className="w-2.5 h-2.5 text-slate-800 dark:text-white" />
                  {log.component || 'CAVDAX'}
                </span>
                <span>{log.time}</span>
              </div>
              <div className={`${badgeColor} leading-snug break-words`}>
                {log.text}
              </div>
              {log.violationPaths && log.violationPaths.length > 0 && (
                <div className="mt-1.5 p-1.5 rounded bg-rose-100 dark:bg-black/60 border border-rose-300 dark:border-rose-900/40 text-[10px] text-rose-800 dark:text-rose-300 font-mono">
                  <div className="text-slate-600 dark:text-slate-400 mb-0.5">Detected Stale Dependency Chain:</div>
                  {log.violationPaths.map((p, pIdx) => (
                    <div key={pIdx}>↳ {Array.isArray(p) ? p.join(' ➔ ') : p}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
