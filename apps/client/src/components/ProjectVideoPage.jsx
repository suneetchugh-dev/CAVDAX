import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Github, 
  ExternalLink, 
  Copy, 
  Check, 
  SlidersHorizontal,
  FileCode2,
  Terminal,
  Clock,
  Youtube
} from 'lucide-react';
import McpCableConnectionSvg from './McpCableConnectionSvg';
import { playClick } from '../utils/soundFx';

const YOUTUBE_VIDEO_ID = 'Nhdd7spj1RA';

const ACTS = [
  {
    id: 1,
    act: 'Act I',
    title: 'Vector RAG Failure & FalkorDB Causal Conscience',
    time: '0:00',
    seconds: 0,
    desc: 'Why cosine similarity retrieves obsolete architectural context and causes silent cache rot.'
  },
  {
    id: 2,
    act: 'Act II',
    title: 'Published MCP Gate & Agent Setup',
    time: '1:42',
    seconds: 102,
    desc: 'npm package @cavdax/mcp-server with stdio & SSE configs for Claude Code, Cursor, and Windsurf.'
  },
  {
    id: 3,
    act: 'Act III',
    title: 'Live Terminal Interception & Self-Correction',
    time: '3:15',
    seconds: 195,
    desc: 'Bob AI agent attempts stale Redis write (DEC-302), is blocked by MCP gate, and self-corrects to DynamoDB DAX (DEC-304).'
  },
  {
    id: 4,
    act: 'Act IV',
    title: 'Live GitHub Workspace & Audit Logs',
    time: '6:08',
    seconds: 368,
    desc: 'Real repository scanning, GraphBLAS invalidation traversal, 1-click PR sync, and cryptographic audit log.'
  }
];

const KEY_MOMENTS = [
  { label: 'Cosine Blindness', time: '0:33', seconds: 33 },
  { label: 'Verification Console', time: '1:22', seconds: 82 },
  { label: 'MCP Config Guides', time: '1:42', seconds: 102 },
  { label: 'npm run doctor', time: '2:45', seconds: 165 },
  { label: 'Act I Baseline Ingestion', time: '3:15', seconds: 195 },
  { label: 'Act II ADR-004 Mutation', time: '4:00', seconds: 240 },
  { label: 'Act III Stale Redis Blocked', time: '4:30', seconds: 270 },
  { label: 'Act IV DynamoDB DAX Self-Correction', time: '5:15', seconds: 315 },
  { label: 'Connected GitHub Graph', time: '6:08', seconds: 368 },
  { label: '1-Click GitHub PR Sync', time: '8:35', seconds: 515 },
  { label: 'Agent Action Audit Log', time: '8:58', seconds: 538 },
  { label: 'System Preferences & Alerts', time: '9:30', seconds: 570 },
  { label: 'Team Contrarians Credits', time: '10:02', seconds: 602 }
];

export default function ProjectVideoPage({ onLaunchConsole, onOpenMcpPage }) {
  const [activeAct, setActiveAct] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(null);
  const playerRef = useRef(null);
  const iframeRef = useRef(null);

  // Initialize YouTube IFrame API
  useEffect(() => {
    let isMounted = true;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
        playerRef.current = new window.YT.Player('cavdax-yt-iframe', {
          events: {
            onReady: () => {
              if (isMounted) {
                // Player ready
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              if (event.data === 1) setIsPlaying(true);
              else if (event.data === 2 || event.data === 0) setIsPlaying(false);
            }
          }
        });
      } catch (e) {
        console.warn('CAVDAX: YouTube player initialization handled via postMessage interface:', e);
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const existingTag = document.getElementById('youtube-iframe-api');
      if (!existingTag) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(tag, firstScript);
        } else {
          document.head.appendChild(tag);
        }
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        if (isMounted) setupPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, []);

  const seekToSeconds = useCallback((seconds, actIndex = null) => {
    playClick();
    if (actIndex !== null) {
      setActiveAct(actIndex);
    } else {
      for (let i = ACTS.length - 1; i >= 0; i--) {
        if (seconds >= ACTS[i].seconds) {
          setActiveAct(i);
          break;
        }
      }
    }

    // Try YouTube Player API first
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seconds, true);
        playerRef.current.playVideo();
        setIsPlaying(true);
        return;
      } catch {}
    }

    // Fallback: postMessage command directly to iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
      setIsPlaying(true);
    }
  }, []);

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
        <div id="project-overview" className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>WeMakeDevs × FalkorDB GraphHacks 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white mb-3">
            System Demonstration
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-sans">
            Watch the end-to-end CAVDAX architecture in action: from commit ingestion and FalkorDB GraphBLAS invalidation to real-time MCP tool interception and autonomous agent self-correction.
          </p>
        </div>

        {/* Cinema Video Frame */}
        <div id="project-video" className="w-full neo-glass-card p-3 sm:p-5 rounded-2xl sm:rounded-3xl mb-8 overflow-hidden shadow-2xl">
          <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl bg-[#07090D] border border-slate-300 dark:border-white/10 overflow-hidden flex flex-col justify-between group shadow-inner">
            {/* Ambient Video Glow */}
            <div 
              aria-hidden="true"
              className="absolute inset-0 bg-radial from-slate-800/20 via-transparent to-transparent pointer-events-none z-10"
            />

            {/* Real YouTube Video Embed */}
            <iframe
              ref={iframeRef}
              id="cavdax-yt-iframe"
              title="CAVDAX — Architecture Verification MCP For Autonomous AI Agents (FalkorDB GraphBLAS)"
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?enablejsapi=1&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}&rel=0&modestbranding=1&iv_load_policy=3&color=white`}
              className="w-full h-full border-0 absolute inset-0 z-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Sub-Header Video Metadata Bar */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white">1080p 60FPS</span>
              <span>•</span>
              <span>10m 21s</span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300">FalkorDB GraphBLAS Invalidation</span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://youtu.be/${YOUTUBE_VIDEO_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:underline transition-colors"
                title="Watch directly on YouTube in high resolution"
              >
                <Youtube size={13} className="text-red-500" />
                <span>Open on YouTube</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* 4 Primary Acts Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
            {ACTS.map((actItem, idx) => (
              <button
                key={actItem.id}
                onClick={() => seekToSeconds(actItem.seconds, idx)}
                className={`p-3 rounded-xl text-left transition-all text-xs font-mono border cursor-pointer ${
                  activeAct === idx
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-lg font-bold ring-1 ring-white/20'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">{actItem.act}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold">{actItem.time}</span>
                </div>
                <div className="font-bold line-clamp-1 mb-1">{actItem.title}</div>
                <div className="text-[11px] opacity-70 font-sans line-clamp-2 leading-relaxed">{actItem.desc}</div>
              </button>
            ))}
          </div>

          {/* Key Moments Quick-Jump Rail */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
              <Clock size={11} />
              <span>Key Moments Quick-Jump:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {KEY_MOMENTS.map((km, idx) => (
                <button
                  key={idx}
                  onClick={() => seekToSeconds(km.seconds)}
                  className="px-2 py-1 rounded-md text-[11px] font-mono bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-slate-400 dark:text-slate-500 font-bold">{km.time}</span>
                  <span>{km.label}</span>
                </button>
              ))}
            </div>
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
