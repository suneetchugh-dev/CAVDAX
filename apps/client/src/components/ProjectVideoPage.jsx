import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Github, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  SlidersHorizontal,
  Cable,
  FileCode2,
  Terminal,
  Cpu,
  Workflow
} from 'lucide-react';
import McpCableConnectionSvg from './McpCableConnectionSvg';
import { playClick } from '../utils/soundFx';

export default function ProjectVideoPage({ onLaunchConsole, onOpenMcpPage }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState(null);

  const chapters = [
    { title: 'The Problem: Vector RAG Blindness & Silent Cache Rot', time: '0:00', duration: '1:15' },
    { title: 'FalkorDB GraphBLAS Invalidation Traversal (< 15ms)', time: '1:15', duration: '1:15' },
    { title: 'The Enclosed Model Context Protocol (MCP) Gate', time: '2:30', duration: '1:15' },
    { title: 'Act IV: Self-Healing Agent Revalidation Loop', time: '3:45', duration: '1:15' }
  ];

  const handleCopy = (text, key) => {
    playClick();
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 select-none relative overflow-hidden pt-24 sm:pt-28 pb-20 px-4 sm:px-6">
      {/* Background Watermark */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none flex items-center justify-center select-none -z-0 overflow-hidden"
      >
        <span className="text-[16vw] font-black tracking-tighter text-slate-950/[0.04] dark:text-white/[0.03] leading-none font-mono">
          PROJECT
        </span>
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col items-center">
        {/* Header Cluster */}
        <div id="project-overview" className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white mb-3">
            System Demonstration
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-sans">
            Watch the end-to-end CAVDAX architecture in action: from commit ingestion and FalkorDB GraphBLAS invalidation to real-time MCP tool interception.
          </p>
        </div>

        {/* Cinema Video Frame */}
        <div id="project-video" className="w-full neo-glass-card p-3 sm:p-5 rounded-2xl sm:rounded-3xl mb-10 overflow-hidden shadow-2xl">
          <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl bg-[#07090D] border border-slate-300 dark:border-white/10 overflow-hidden flex flex-col justify-between p-4 sm:p-6 group">
            {/* Ambient Video Glow */}
            <div 
              aria-hidden="true"
              className="absolute inset-0 bg-radial from-slate-800/20 via-transparent to-transparent pointer-events-none"
            />

            {/* Video Overlay Info */}
            <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
                <span className="text-white font-bold">CAVDAX System Walkthrough</span>
              </div>
              <span>1080p 60FPS • GraphBLAS Live</span>
            </div>

            {/* Center Play Interface */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center py-8">
              <button
                onClick={() => {
                  playClick();
                  setIsPlaying(!isPlaying);
                }}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white text-black hover:bg-slate-200 transition-all duration-300 flex items-center justify-center shadow-xl hover:scale-105 tactile-btn cursor-pointer"
                title={isPlaying ? 'Pause Demo Video' : 'Play Demo Video'}
              >
                {isPlaying ? <Pause size={28} className="fill-black" /> : <Play size={28} className="fill-black translate-x-0.5" />}
              </button>

              <div className="mt-4 text-xs font-mono text-slate-300 max-w-md">
                {isPlaying 
                  ? 'Playing Chapter: ' + chapters[activeChapter].title 
                  : 'Click to start video walkthrough of FalkorDB Causal Invalidation Loop'}
              </div>
            </div>

            {/* Bottom Timeline & Controls */}
            <div className="relative z-10 w-full pt-3 border-t border-white/10 flex flex-col gap-2">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${((activeChapter + 1) / chapters.length) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{chapters[activeChapter].time} / 5:00</span>
                <span>FalkorDB GraphBLAS Causal Conscience</span>
              </div>
            </div>
          </div>

          {/* Chapter Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-white/5">
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playClick();
                  setActiveChapter(idx);
                  setIsPlaying(true);
                }}
                className={`p-2.5 rounded-xl text-left transition-all text-xs font-mono border ${
                  activeChapter === idx
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="text-[10px] opacity-75 mb-0.5 font-sans">Chapter 0{idx + 1} ({ch.time})</div>
                <div className="truncate">{ch.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Open Source GNU GPL 3.0 & Repo Information */}
        <div id="project-license" className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Box 1: Open Source License Guarantee */}
          <div className="neo-glass-card p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileCode2 size={18} className="text-slate-800 dark:text-slate-200" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-950 dark:text-white">
                  GNU General Public License v3.0
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-4">
                CAVDAX is 100% free and open-source software under the <strong>GNU GPL-3.0 License</strong>. Anyone has the complete freedom to run, study, inspect, audit, share, and improve the codebase.
              </p>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 font-mono">•</span>
                  <span>Full source code inspection and Cypher query transparency</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 font-mono">•</span>
                  <span>Permission to commercialize, modify, and distribute derivative works</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 font-mono">•</span>
                  <span>Zero vendor lock-in; self-hostable with Docker Compose</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">License: GPL-3.0</span>
              <a 
                href="https://www.gnu.org/licenses/gpl-3.0.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-800 dark:text-white hover:underline inline-flex items-center gap-1"
              >
                <span>Read License</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Box 2: Quick Start Terminal Commands */}
          <div className="neo-glass-card p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={18} className="text-slate-800 dark:text-slate-200" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-950 dark:text-white">
                  Local Setup & Verification
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-3">
                Clone the repository and launch the full FalkorDB and MCP mesh locally in under 60 seconds:
              </p>

              {/* Code Snippet 1 */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>Clone Repository:</span>
                  <button 
                    onClick={() => handleCopy('git clone https://github.com/suneetchugh-dev/CAVDAX.git', 'clone')}
                    className="hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'clone' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copiedCmd === 'clone' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                  <code>git clone https://github.com/suneetchugh-dev/CAVDAX.git</code>
                </div>
              </div>

              {/* Code Snippet 2 */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>Start Stack via Docker:</span>
                  <button 
                    onClick={() => handleCopy('docker compose up --build -d', 'docker')}
                    className="hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'docker' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copiedCmd === 'docker' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                  <code>docker compose up --build -d</code>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Port: 5173 (HUD) • 6379 (FalkorDB)</span>
              <a 
                href="https://github.com/suneetchugh-dev/CAVDAX" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-800 dark:text-white hover:underline inline-flex items-center gap-1 font-bold"
              >
                <Github size={13} />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              playClick();
              if (onLaunchConsole) onLaunchConsole();
            }}
            className="btn-primary inline-flex items-center gap-2 tactile-btn"
          >
            <SlidersHorizontal size={14} />
            <span>Launch Verification Console</span>
          </button>

          <button
            onClick={() => {
              playClick();
              if (onOpenMcpPage) onOpenMcpPage();
            }}
            className="group px-4 py-2 rounded-full text-xs font-mono text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 transition-colors inline-flex items-center gap-2 tactile-btn"
          >
            <span>Connect Real MCP Agent</span>
            <McpCableConnectionSvg className="text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
