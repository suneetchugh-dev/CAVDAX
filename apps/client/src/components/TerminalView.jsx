import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldAlert, CheckCircle, Clock, AlertTriangle, FileCode, Cpu } from 'lucide-react';

export default function TerminalView({ terminalLogs, activeVerdict, latestAction, currentAct }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  return (
    <div className="h-full flex flex-col bg-obsidian-900 border-r border-slate-800">
      {/* Terminal Title Bar */}
      <div className="h-10 px-4 bg-obsidian-800/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-semibold text-slate-300 ml-2 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            CAVDAX Agent Enclosed MCP Terminal
          </span>
        </div>

        {/* Live Gate Verdict Badge */}
        {activeVerdict && (
          <div className="flex items-center gap-1.5">
            {activeVerdict === 'BLOCKED' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-[11px] font-mono font-bold text-rose-400 glow-ruby">
                <ShieldAlert className="w-3 h-3" />
                ⛔ 403 MCP GATE BLOCKED
              </span>
            ) : activeVerdict === 'APPROVED' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[11px] font-mono font-bold text-emerald-400 glow-emerald">
                <CheckCircle className="w-3 h-3" />
                ✅ 200 MCP GATE APPROVED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-slate-400">
                <Clock className="w-3 h-3" />
                IDLE
              </span>
            )}
          </div>
        )}
      </div>

      {/* Visual Gate Alert Banner */}
      {currentAct === 3 && (
        <div className="p-3 bg-rose-950/40 border-b border-rose-900/60 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-rose-300 font-mono">
              [ ⛔ EXECUTION INTERCEPTED: BLOCKED_SUPERSEDED_SOURCE ]
            </div>
            <div className="text-rose-200/80 mt-0.5">
              FalkorDB Cypher traversal verified that <span className="font-mono text-white">DEC-102</span> depends on <span className="font-mono text-rose-300">ADR-001 (SUPERSEDED)</span>.
              Zero files written to disk.
            </div>
          </div>
        </div>
      )}

      {currentAct === 4 && (
        <div className="p-3 bg-emerald-950/40 border-b border-emerald-900/60 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-emerald-300 font-mono">
              [ ✅ VERIFIED CAUSAL PROVENANCE: APPROVED ]
            </div>
            <div className="text-emerald-200/80 mt-0.5">
              <span className="font-mono text-white">DEC-103</span> verified against fresh source <span className="font-mono text-emerald-300">ADR-002 (ACTIVE)</span>. Code written to <span className="font-mono text-white">payment.js</span>.
            </div>
          </div>
        </div>
      )}

      {/* Code Payload Inspector (Diff View) */}
      {latestAction && (
        <div className="p-3 bg-obsidian-800/60 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Target: <span className="text-white">{latestAction.filePath}</span>
            </span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Decision: {latestAction.decisionId}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-obsidian-950 border border-slate-800 overflow-x-auto text-[11px] text-slate-300 leading-relaxed max-h-36">
            <pre><code>{latestAction.codeSnippet}</code></pre>
          </div>
        </div>
      )}

      {/* Terminal Log Console */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 select-text">
        {terminalLogs.map((log, index) => {
          let badgeColor = 'text-slate-400';
          let borderClass = 'border-slate-800';
          let bgClass = 'bg-obsidian-800/40';

          if (log.type === 'GATE_BLOCK') {
            badgeColor = 'text-rose-400 font-bold';
            borderClass = 'border-rose-900/50';
            bgClass = 'bg-rose-950/20';
          } else if (log.type === 'GATE_APPROVE') {
            badgeColor = 'text-emerald-400 font-bold';
            borderClass = 'border-emerald-900/50';
            bgClass = 'bg-emerald-950/20';
          } else if (log.type === 'CASCADE') {
            badgeColor = 'text-amber-400 font-bold';
            borderClass = 'border-amber-900/50';
            bgClass = 'bg-amber-950/20';
          } else if (log.type === 'REVALIDATION') {
            badgeColor = 'text-cyan-400 font-bold';
            borderClass = 'border-cyan-900/50';
            bgClass = 'bg-cyan-950/20';
          }

          return (
            <div
              key={index}
              className={`p-2 rounded-lg border ${borderClass} ${bgClass} transition-all`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span className="flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5" />
                  {log.component || 'CAVDAX'}
                </span>
                <span>{log.time}</span>
              </div>
              <div className={`${badgeColor} leading-snug break-words`}>
                {log.text}
              </div>
              {log.violationPaths && log.violationPaths.length > 0 && (
                <div className="mt-1.5 p-1.5 rounded bg-black/40 border border-rose-900/30 text-[10px] text-rose-300 font-mono">
                  <div className="text-slate-400 mb-0.5">Detected Stale Path:</div>
                  {log.violationPaths.map((p, pIdx) => (
                    <div key={pIdx}>↳ {Array.isArray(p) ? p.join(' ➔ ') : p}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
