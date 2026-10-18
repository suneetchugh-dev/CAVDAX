import React from 'react';
import { Shield, Zap, RotateCcw, Database, GitBranch, Activity } from 'lucide-react';

export default function Header({ status, onReset, isResetting }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-obsidian-800/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wider text-slate-100 font-mono">
              CAV<span className="text-cyan-400">DAX</span>
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
              Track 01 & 02
            </span>
          </div>
          <p className="text-xs text-slate-400 tracking-tight hidden sm:block">
            Contextual Action &amp; Verified Decision Autonomous eXecution
          </p>
        </div>
      </div>

      {/* Live Metrics & Engine Badges */}
      <div className="flex items-center gap-3">
        {/* FalkorDB Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-700/60 border border-slate-800 text-xs">
          <Database className={`w-3.5 h-3.5 ${status.falkorLive ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-slate-400 font-mono">Engine:</span>
          <span className={`font-mono font-medium ${status.falkorLive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {status.falkorLive ? 'FalkorDB GraphBLAS' : 'Simulation Fallback'}
          </span>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.falkorLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${status.falkorLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </span>
        </div>

        {/* Latency Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 font-mono">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gate Latency:</span>
          <span className="font-semibold text-white">{status.latestLatency || '1.84'}ms</span>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={onReset}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50"
          title="Reset to Initial Demo State"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset State</span>
        </button>
      </div>
    </header>
  );
}
