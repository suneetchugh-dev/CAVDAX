import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cable, 
  Terminal, 
  Check, 
  Copy, 
  ArrowRight, 
  ExternalLink, 
  KeyRound, 
  Cpu, 
  Workflow, 
  FileCode2, 
  Compass
} from 'lucide-react';
import TourGuide from './TourGuide';
import { playClick } from '../utils/soundFx';

export default function ConnectMcpPage({ onLaunchConsole }) {
  const [activeClient, setActiveClient] = useState('claudecode');
  const [copiedKey, setCopiedKey] = useState(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const configs = {
    claudecode: {
      name: 'Claude Code CLI',
      desc: 'Anthropic official agentic coding tool for terminal environments',
      file: 'Terminal Command',
      snippet: `claude mcp add cavdax -- node /opt/cavdax/mcp/stdio.js`,
      notes: 'Run directly inside your git repository root before launching claude.'
    },
    cursor: {
      name: 'Cursor IDE',
      desc: 'AI-first code editor with native Model Context Protocol support',
      file: '.cursor/mcp.json',
      snippet: JSON.stringify({
        mcpServers: {
          cavdax: {
            command: "node",
            args: ["/opt/cavdax/mcp/stdio.js"],
            env: {
              FALKORDB_HOST: "localhost",
              FALKORDB_PORT: "6379"
            }
          }
        }
      }, null, 2),
      notes: 'Save in project root under .cursor/mcp.json or in global Cursor Settings > MCP.'
    },
    claude: {
      name: 'Claude Desktop',
      desc: 'Official Anthropic Claude desktop client for macOS and Windows',
      file: 'claude_desktop_config.json',
      snippet: JSON.stringify({
        mcpServers: {
          cavdax: {
            command: "node",
            args: ["/opt/cavdax/mcp/stdio.js"],
            env: {
              FALKORDB_HOST: "localhost",
              FALKORDB_PORT: "6379"
            }
          }
        }
      }, null, 2),
      notes: 'Located at ~/Library/Application Support/Claude/claude_desktop_config.json'
    },
    windsurf: {
      name: 'Windsurf IDE',
      desc: 'Next-generation AI agents running with enclosed tool interception',
      file: '~/.codeium/windsurf/mcp_config.json',
      snippet: JSON.stringify({
        mcpServers: {
          cavdax: {
            command: "node",
            args: ["/opt/cavdax/mcp/stdio.js"]
          }
        }
      }, null, 2),
      notes: 'Compatible with any client implementing Model Context Protocol v1.0.'
    }
  };

  const handleCopy = (key, text) => {
    playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Syntax highlighting renderer tailored to obsidian amber dark theme & porcelain light theme
  const renderSyntaxCode = (code, type) => {
    if (type === 'claudecode') {
      return (
        <span>
          <span className="text-cyan-400 dark:text-amber-400 font-bold">claude</span>{' '}
          <span className="text-slate-300 dark:text-slate-200">mcp add</span>{' '}
          <span className="text-amber-300 dark:text-amber-300 font-semibold">cavdax</span>{' '}
          <span className="text-slate-500 dark:text-slate-400">--</span>{' '}
          <span className="text-purple-300 dark:text-purple-300">node</span>{' '}
          <span className="text-emerald-400 dark:text-emerald-400">/opt/cavdax/mcp/stdio.js</span>
        </span>
      );
    }

    // JSON syntax highlighting
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      // Key-value regex
      const keyValMatch = line.match(/^(\s*)(".*?"):\s*(.*)$/);
      if (keyValMatch) {
        const [, indent, key, val] = keyValMatch;
        return (
          <div key={idx}>
            <span>{indent}</span>
            <span className="text-amber-400/90 dark:text-amber-400 font-medium">{key}</span>
            <span className="text-slate-400">: </span>
            {val.startsWith('"') ? (
              <span className="text-emerald-400 dark:text-emerald-300">{val}</span>
            ) : val.startsWith('[') || val.startsWith('{') ? (
              <span className="text-slate-300 dark:text-slate-200">{val}</span>
            ) : (
              <span className="text-cyan-300 dark:text-cyan-400">{val}</span>
            )}
          </div>
        );
      }

      // Standalone string in array
      const arrStrMatch = line.match(/^(\s*)(".*?")(,?)$/);
      if (arrStrMatch) {
        const [, indent, str, comma] = arrStrMatch;
        return (
          <div key={idx}>
            <span>{indent}</span>
            <span className="text-emerald-400 dark:text-emerald-300">{str}</span>
            <span className="text-slate-400">{comma}</span>
          </div>
        );
      }

      return (
        <div key={idx} className="text-slate-400 dark:text-slate-300">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="w-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 select-none pb-24">
      {/* 1. Header Section */}
      <section className="pt-28 pb-10 px-6 max-w-5xl mx-auto w-full text-center">
        {/* Isolated Tour Target to prevent spotlight from cutting into the floating navbar */}
        <div data-tour="mcp-overview" className="max-w-3xl mx-auto p-2">
          {/* Heading 100% Mathematically and Optically Centered */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.15] text-center mb-3">
            Enclosed MCP Agent Interceptor
          </h1>

          {/* Subtext */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-sans mb-4">
            Plug CAVDAX into your coding agent to intercept all filesystem writes behind a FalkorDB GraphBLAS causal barrier.
          </p>

          {/* Interactive Tour Guide Pill Badge (Centered BELOW Subtext) */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                playClick();
                setIsTourOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/10 hover:border-slate-900/30 dark:hover:border-white/20 text-xs font-mono font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer shadow-xs group"
              title="Launch Interactive Tour Guide for MCP Gateway"
            >
              <Compass className="w-3.5 h-3.5 text-slate-800 dark:text-white group-hover:rotate-45 transition-transform duration-300" />
              <span>Interactive Guide</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Configuration & Snippets (Primary User Action) */}
      <section data-tour="mcp-clients" className="px-6 max-w-5xl mx-auto w-full mb-12">
        <div className="neo-glass-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-slate-900 dark:text-white" />
                <span>Client Configuration Guides</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your coding agent platform to obtain the drop-in MCP config.
              </p>
            </div>

            {/* Client Tabs - Sliding Moving Background Pill Bar (Framer Motion Spring Standard) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 w-full sm:w-auto relative">
              {Object.keys(configs).map((key) => {
                const isSelected = activeClient === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      playClick();
                      setActiveClient(key);
                    }}
                    className={`relative px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors duration-200 tactile-btn text-center whitespace-normal sm:whitespace-nowrap flex items-center justify-center select-none ${
                      isSelected
                        ? 'text-white dark:text-slate-950 font-bold z-10'
                        : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {/* Active Sliding Pill with industry-standard critical damping spring */}
                    {isSelected && (
                      <motion.div
                        layoutId="activeMcpClientPill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 rounded-lg bg-slate-950 dark:bg-white shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{configs[key].name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Config Details with Bespoke Obsidian Code Window */}
          <div className="mb-2">
            <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 bg-slate-950 dark:bg-[#07090D] shadow-md dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 dark:bg-white/[0.03] border-b border-slate-800 dark:border-white/5 text-[11px] font-mono">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 opacity-70">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="ml-1 text-slate-400 dark:text-slate-400 font-medium">
                    {configs[activeClient].file}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(activeClient, configs[activeClient].snippet)}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white dark:text-slate-300 dark:hover:text-white cursor-pointer transition-colors"
                >
                  {copiedKey === activeClient ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Config</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre Container */}
              <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed custom-scrollbar selection:bg-amber-500/30">
                <code>{renderSyntaxCode(configs[activeClient].snippet, activeClient)}</code>
              </pre>
            </div>

            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-2.5">
              {configs[activeClient].notes}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Architecture & How It Operates */}
      <section data-tour="mcp-workflow" className="px-6 max-w-5xl mx-auto w-full mb-8">
        <div className="neo-glass-card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-2 flex items-center gap-2">
            <Workflow className="w-5 h-5 text-slate-900 dark:text-white" />
            <span>How The Enclosed Interception Loop Operates</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Standard agents operate unconstrained: they read vector embeddings and directly write code to disk. Under CAVDAX, the agent is configured to call tools through our enclosed stdio proxy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-slate-900/40 dark:hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Step 01: Intercept</span>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Tool Call Capture</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  When Claude or Cursor initiates <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-slate-200 font-mono text-[10px]">apply_code_change</code>, the payload is captured over stdin before any disk modification occurs.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-500">
                Action: Intercept In-Flight
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-slate-900/40 dark:hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Step 02: GraphBLAS BFS</span>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Causal Provenance Check</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  FalkorDB traces the code change back to its underlying design decisions and facts. If any fact links to a superseded ADR via <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-slate-200 font-mono text-[10px]">[:SUPERSEDES]</code>, the dependency is marked STALE.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-500">
                Latency: &lt; 15 milliseconds
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-slate-900/40 dark:hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Step 03: Deterministic Gate</span>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Commit or Hard Reject</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  Intact dependencies return 200 OK and commit the file. Stale dependencies trigger 403 Forbidden with exact graph invalidation path, forcing the agent to re-read the latest ADR.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-500">
                Guarantee: Zero Silent Rot
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Telemetry Row (Relocated Below How The Interception Loop Operates) */}
      <section className="px-6 max-w-5xl mx-auto w-full mb-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-5xl mx-auto text-left font-mono">
          <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-slate-900/40 dark:hover:border-amber-400/40 transition-all duration-300">
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Transport</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">stdio / HTTP SSE</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-slate-900/40 dark:hover:border-amber-400/40 transition-all duration-300">
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Inspection Latency</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">&lt; 15ms GraphBLAS</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-slate-900/40 dark:hover:border-amber-400/40 transition-all duration-300">
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Protocol Spec</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">MCP 2024-11-05</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-slate-900/40 dark:hover:border-amber-400/40 transition-all duration-300">
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Interception Mode</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Deterministic Gate</span>
          </div>
        </div>
      </section>

      {/* 5. Navigation Footer CTA */}
      <section className="px-6 max-w-5xl mx-auto w-full text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              playClick();
              if (onLaunchConsole) onLaunchConsole();
            }}
            className="btn-primary group tactile-btn"
          >
            <span>Open Verification Console</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      {/* Dedicated Interactive MCP Tour Guide */}
      <TourGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        mode="mcp"
      />
    </div>
  );
}
