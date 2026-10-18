import React from 'react';
import { Play, GitCommit, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export default function StoryStepper({ currentAct, onSelectAct, loadingAct }) {
  const acts = [
    {
      act: 1,
      title: 'Act I: Baseline',
      subtitle: 'ADR-001 Active',
      desc: 'TokenAuth v1 is accepted; DEC-102 is valid.',
      icon: Play,
      accent: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20'
    },
    {
      act: 2,
      title: 'Act II: Ingest Commit',
      subtitle: 'ADR-002 Supersedes',
      desc: 'YAML parser detects superseding; FalkorDB invalidates DAG in 2.1ms.',
      icon: GitCommit,
      accent: 'border-amber-500/40 text-amber-400 bg-amber-950/20'
    },
    {
      act: 3,
      title: 'Act III: Enclosed MCP Gate',
      subtitle: 'Agent Call Blocked',
      desc: 'Agent invokes apply_code_change; Gate intercepts & hard blocks write.',
      icon: ShieldAlert,
      accent: 'border-rose-500/40 text-rose-400 bg-rose-950/20'
    },
    {
      act: 4,
      title: 'Act IV: Revalidation',
      subtitle: 'DEC-103 Verified & Written',
      desc: 'Agent synthesizes DEC-103; Gate approves & writes OAuth2 code to disk.',
      icon: CheckCircle2,
      accent: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
    }
  ];

  return (
    <div className="bg-obsidian-800 border-b border-slate-800 px-6 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {acts.map((item) => {
          const Icon = item.icon;
          const isActive = currentAct === item.act;
          const isLoading = loadingAct === item.act;

          return (
            <button
              key={item.act}
              onClick={() => onSelectAct(item.act)}
              disabled={isLoading}
              className={`text-left p-3 rounded-xl border transition-all duration-200 relative overflow-hidden group ${
                isActive
                  ? 'border-cyan-500 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                  : 'border-slate-800/80 bg-obsidian-700/40 hover:border-slate-700 hover:bg-obsidian-700/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${item.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
                    {item.title}
                  </span>
                </div>
                {isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </div>

              <div className="text-xs font-medium text-slate-200 truncate">
                {item.subtitle}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {item.desc}
              </div>

              {isLoading && (
                <div className="absolute inset-0 bg-obsidian-900/80 backdrop-blur-xs flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
