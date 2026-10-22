import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  Compass,
  GitBranch,
  Lock,
  Cloud,
  Package,
  FileCheck2
} from 'lucide-react';
import TourGuide from './TourGuide';
import { playClick } from '../utils/soundFx';

// Container-Relative Slider Tracker Hook (Immune to scroll jumps, unmount morphs, and cross-screen Y-flying)
function usePillTracker(activeKey, dependencies = []) {
  const refs = useRef({});
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0, ready: false });

  useLayoutEffect(() => {
    const update = () => {
      const el = refs.current[activeKey];
      if (el) {
        setPosition({
          x: el.offsetLeft,
          y: el.offsetTop,
          width: el.offsetWidth,
          height: el.offsetHeight,
          ready: true,
        });
      }
    };
    update();
    const rafId = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', update);
    };
  }, [activeKey, ...dependencies]);

  return { refs, position };
}

export default function ConnectMcpPage({ onLaunchConsole }) {
  const [activeClient, setActiveClient] = useState('cursor');
  const [transportMode, setTransportMode] = useState('sse'); // 'sse' (Cloud) | 'stdio' (NPX Local)
  const [activeCliTab, setActiveCliTab] = useState('mcp'); // 'mcp' | 'doctor' | 'ingest' | 'check'
  const [copiedKey, setCopiedKey] = useState(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // ── GitHub OAuth state ────────────────────────────────────────────────────
  // githubUser: null (not checked yet) | false (not authed) | { login, name, avatarUrl }
  const [githubUser, setGithubUser] = useState(null);
  const [oauthMsg, setOauthMsg] = useState(null); // success / error banner

  useEffect(() => {
    // Check ?connected=1 or ?oauth_error= from callback redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === '1') {
      setOauthMsg({ type: 'success', text: 'GitHub account connected successfully.' });
      // Clean the query string without a page reload
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('oauth_error')) {
      const errCode = params.get('oauth_error');
      setOauthMsg({ type: 'error', text: `GitHub OAuth failed: ${errCode}` });
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Fetch current session user
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setGithubUser(d.authenticated ? d.user : false))
      .catch(() => setGithubUser(false));
  }, []);

  const handleGithubConnect = () => {
    window.location.href = '/api/auth/github';
  };

  const handleGithubDisconnect = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setGithubUser(false);
      setOauthMsg({ type: 'success', text: 'GitHub account disconnected.' });
    } catch {
      setOauthMsg({ type: 'error', text: 'Logout failed — please try again.' });
    }
  };

  // Dedicated container-relative slider trackers eliminating global Framer Motion layoutId projection flight
  const transportPill = usePillTracker(transportMode);
  const clientPill = usePillTracker(activeClient, [transportMode]);
  const cliTabPill = usePillTracker(activeCliTab);

  useEffect(() => {
    const handleToggle = () => setIsTourOpen(prev => !prev);
    window.addEventListener('cavdax:toggle-mcp-tour', handleToggle);
    return () => {
      window.removeEventListener('cavdax:toggle-mcp-tour', handleToggle);
    };
  }, []);

  // Matrix of configs: [transportMode][client]
  const clientConfigs = {
    sse: {
      cursor: {
        name: 'Cursor IDE',
        desc: 'AI-first code editor connecting over remote HTTP Server-Sent Events',
        file: '.cursor/mcp.json',
        snippet: JSON.stringify({
          mcpServers: {
            cavdax: {
              url: "https://cavdax.sahnirmaan.live/api/mcp/sse"
            }
          }
        }, null, 2),
        notes: 'Save in project root under .cursor/mcp.json or in Cursor Settings > MCP. Zero local install required.'
      },
      claudecode: {
        name: 'Claude Code CLI',
        desc: 'Anthropic official agentic coding tool for terminal environments',
        file: 'Terminal Command',
        snippet: 'claude mcp add cavdax https://cavdax.sahnirmaan.live/api/mcp/sse',
        notes: 'Run directly inside your git repository root before launching claude.'
      },
      claude: {
        name: 'Claude Desktop',
        desc: 'Official Anthropic Claude desktop client for macOS and Windows',
        file: 'claude_desktop_config.json',
        snippet: JSON.stringify({
          mcpServers: {
            cavdax: {
              url: "https://cavdax.sahnirmaan.live/api/mcp/sse"
            }
          }
        }, null, 2),
        notes: 'Located at ~/Library/Application Support/Claude/claude_desktop_config.json'
      },
      windsurf: {
        name: 'Windsurf IDE',
        desc: 'Codeium Windsurf AI IDE with native remote MCP SSE support',
        file: '~/.codeium/windsurf/mcp_config.json',
        snippet: JSON.stringify({
          mcpServers: {
            cavdax: {
              serverUrl: "https://cavdax.sahnirmaan.live/api/mcp/sse"
            }
          }
        }, null, 2),
        notes: 'Compatible with Windsurf Cascade agent using MCP protocol version 2024-11-05.'
      }
    },
    stdio: {
      cursor: {
        name: 'Cursor IDE',
        desc: 'Local stdio execution backed by published @cavdax/mcp-server package',
        file: '.cursor/mcp.json',
        snippet: JSON.stringify({
          mcpServers: {
            cavdax: {
              command: "npx",
              args: ["-y", "@cavdax/mcp-server"],
              env: {
                FALKORDB_HOST: "localhost",
                FALKORDB_PORT: "6379"
              }
            }
          }
        }, null, 2),
        notes: 'Connects to your local FalkorDB container on port 6379 with sub-millisecond GraphBLAS traversal.'
      },
      claudecode: {
        name: 'Claude Code CLI',
        desc: 'Anthropic agentic CLI running local stdio MCP via NPX',
        file: 'Terminal Command',
        snippet: 'claude mcp add cavdax -- npx -y @cavdax/mcp-server',
        notes: 'Executes the official published @cavdax/mcp-server binary via npx directly in your terminal.'
      },
      claude: {
        name: 'Claude Desktop',
        desc: 'Local stdio process spawned by Claude Desktop with FalkorDB environment',
        file: 'claude_desktop_config.json',
        snippet: JSON.stringify({
          mcpServers: {
            cavdax: {
              command: "npx",
              args: ["-y", "@cavdax/mcp-server"],
              env: {
                FALKORDB_HOST: "localhost",
                FALKORDB_PORT: "6379"
              }
            }
          }
        }, null, 2),
        notes: 'Claude Desktop will spawn npx @cavdax/mcp-server as an isolated child process.'
      },
      windsurf: {
        name: 'Windsurf IDE',
        desc: 'Local stdio execution for Windsurf Cascade agent',
        file: '~/.codeium/windsurf/mcp_config.json',
        snippet: JSON.stringify({
          mcpServers: {
            cavdax: {
              command: "npx",
              args: ["-y", "@cavdax/mcp-server"]
            }
          }
        }, null, 2),
        notes: 'Spawns local stdio proxy intercepting all Cascade filesystem modifications.'
      }
    }
  };

  const cliCommands = {
    mcp: {
      cmd: 'npx cavdax mcp',
      desc: 'Starts the Model Context Protocol stdio server for Claude Code and Cursor agents.',
      flags: '--host <host> --port <port>'
    },
    doctor: {
      cmd: 'npx cavdax doctor',
      desc: 'Runs full diagnostic suite testing FalkorDB GraphBLAS connectivity and causal DAG node health.',
      flags: '--host <host> --port <port>'
    },
    ingest: {
      cmd: 'npx cavdax ingest --type adr --repo .',
      desc: 'Parses local ADRs (docs/adr/), git commit history, and GitHub issues into the active causal graph.',
      flags: '-t [adr|commit|issue|all] -r <path>'
    },
    check: {
      cmd: 'npx cavdax check --staged',
      desc: 'CI/CD and pre-commit verification gate: validates staged files against active architecture decisions.',
      flags: '-s, --staged | --pr <number>'
    }
  };

  const agentRulesSnippet = `# CAVDAX Causal Execution Gate Guardrails
Before modifying repository code, verify architectural alignment with CAVDAX:
1. Ground all filesystem writes in active Architectural Decisions.
2. Route file edits through the \`apply_code_change\` MCP tool with the target \`decision_id\` (e.g., DEC-102).
3. If CAVDAX returns 403 BLOCKED_SUPERSEDED_SOURCE, examine the invalidation path and revalidate before writing.`;

  const handleCopy = (key, text) => {
    playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Cohesive syntax highlighter calibrated to Obsidian Amber / Slate Porcelain theme
  const renderSyntaxCode = (code, type) => {
    if (type === 'claudecode') {
      const parts = code.split(' ');
      return (
        <span>
          {parts.map((p, idx) => {
            if (p === 'claude') return <span key={idx} className="text-amber-400 font-bold">{p} </span>;
            if (p === 'mcp' || p === 'add') return <span key={idx} className="text-slate-300 dark:text-slate-200">{p} </span>;
            if (p === 'cavdax') return <span key={idx} className="text-amber-300 font-semibold">{p} </span>;
            if (p === '--') return <span key={idx} className="text-slate-500">{p} </span>;
            if (p === 'npx' || p === '-y') return <span key={idx} className="text-slate-400 font-mono">{p} </span>;
            if (p.includes('http')) return <span key={idx} className="text-slate-200 underline decoration-slate-600 font-mono">{p} </span>;
            if (p.includes('@cavdax')) return <span key={idx} className="text-amber-300 font-mono font-semibold">{p} </span>;
            return <span key={idx} className="text-slate-400">{p} </span>;
          })}
        </span>
      );
    }

    // JSON syntax highlighting using theme-calibrated amber and slate tokens
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      const keyValMatch = line.match(/^(\s*)(".*?"):\s*(.*)$/);
      if (keyValMatch) {
        const [, indent, key, val] = keyValMatch;
        return (
          <div key={idx}>
            <span>{indent}</span>
            <span className="text-amber-400 font-medium">{key}</span>
            <span className="text-slate-400">: </span>
            {val.startsWith('"') ? (
              <span className="text-slate-200">{val}</span>
            ) : val.startsWith('[') || val.startsWith('{') ? (
              <span className="text-slate-400">{val}</span>
            ) : (
              <span className="text-amber-300">{val}</span>
            )}
          </div>
        );
      }

      const arrStrMatch = line.match(/^(\s*)(".*?")(,?)$/);
      if (arrStrMatch) {
        const [, indent, str, comma] = arrStrMatch;
        return (
          <div key={idx}>
            <span>{indent}</span>
            <span className="text-slate-200">{str}</span>
            <span className="text-slate-500">{comma}</span>
          </div>
        );
      }

      return (
        <div key={idx} className="text-slate-400">
          {line}
        </div>
      );
    });
  };

  const activeConfig = clientConfigs[transportMode][activeClient];

  return (
    <div className="w-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 select-none pb-24">
      {/* 1. Header Section */}
      <section id="mcp-header" className="pt-28 pb-8 px-6 max-w-5xl mx-auto w-full text-center">
        <div data-tour="mcp-overview" className="max-w-3xl mx-auto p-2">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.15] text-center mb-3">
            Enclosed MCP Agent Interceptor
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-sans mb-4">
            Connect CAVDAX to your autonomous coding agent to intercept all filesystem writes behind a FalkorDB GraphBLAS causal barrier.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => {
                playClick();
                setIsTourOpen(prev => !prev);
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

      {/* 1b. OAuth message banner — success or error from callback */}
      {oauthMsg && (
        <section className="px-6 max-w-5xl mx-auto w-full -mt-4 mb-2">
          <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-[11px] font-mono ${
            oauthMsg.type === 'success'
              ? 'border-emerald-400/30 bg-emerald-500/5 text-emerald-400'
              : 'border-amber-400/30 bg-amber-500/5 text-amber-400'
          }`}>
            <span>{oauthMsg.text}</span>
            <button onClick={() => setOauthMsg(null)} className="text-slate-500 hover:text-slate-300 transition-colors ml-2 shrink-0">✕</button>
          </div>
        </section>
      )}

      {/* 1c. GitHub Repository Connect Banner */}
      <section className="px-6 max-w-5xl mx-auto w-full mb-6">
        <div className="neo-glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-white/5 border border-slate-800 dark:border-white/10 flex items-center justify-center shrink-0">
              <GitBranch className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-950 dark:text-white font-mono">
                {githubUser
                  ? `Connected as @${githubUser.login}`
                  : 'Connect Your GitHub Repository'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans leading-relaxed">
                {githubUser
                  ? 'Your GitHub account is linked. CAVDAX can now ingest ADRs and decision events from your repositories.'
                  : 'Authenticate with GitHub to enable live ADR ingestion, webhook events, and per-repo causal graphs.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {githubUser === null ? (
              // Still checking session — show nothing
              <span className="text-[10px] font-mono text-slate-600">Checking...</span>
            ) : githubUser ? (
              <>
                {githubUser.avatarUrl && (
                  <img
                    src={githubUser.avatarUrl}
                    alt={githubUser.login}
                    className="w-6 h-6 rounded-full border border-white/10"
                  />
                )}
                <button
                  onClick={handleGithubDisconnect}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleGithubConnect}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-[12px] font-mono font-semibold transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                Connect GitHub
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Official NPM Package Callout Banner */}
      <section className="px-6 max-w-5xl mx-auto w-full mb-8">
        <div className="neo-glass-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-amber-500/[0.08] border border-slate-800 dark:border-amber-400/20 text-white flex items-center justify-center shrink-0 shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                  @cavdax/mcp-server
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans leading-relaxed text-pretty">
                Universal Model Context Protocol daemon and causal verification CLI published to npm registry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 dark:bg-[#07090D] border border-slate-800 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] font-mono text-xs text-amber-300 flex items-center gap-2">
              <span>npx -y @cavdax/mcp-server</span>
              <button
                onClick={() => handleCopy('npm-quick', 'npx -y @cavdax/mcp-server')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy NPX execution command"
              >
                {copiedKey === 'npm-quick' ? <Check className="w-3.5 h-3.5 text-slate-200" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <a
              href="https://www.npmjs.com/package/@cavdax/mcp-server"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-amber-300 transition-all duration-200 cursor-pointer border border-slate-300 dark:border-white/10 dark:hover:border-amber-400/40"
              title="View package on npmjs.com"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Configuration & Snippets (Primary User Action) */}
      <section id="mcp-config" data-tour="mcp-clients" className="px-6 max-w-5xl mx-auto w-full mb-12">
        <div className="neo-glass-card p-6 sm:p-8">
          {/* Header Row: Title & Transport Mode Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-slate-900 dark:text-white" />
                <span>Client Configuration Guides</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your transport protocol and coding agent platform to obtain the drop-in MCP config.
              </p>
            </div>

            {/* Transport Toggle: Container-Relative Horizontal Slider Tracking (Anti-Flying Standard) */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 self-start lg:self-auto relative">
              {transportPill.position.ready && (
                <motion.div
                  className="absolute top-0 left-0 rounded-lg bg-slate-950 dark:bg-white shadow-xs pointer-events-none"
                  initial={false}
                  animate={{
                    x: transportPill.position.x,
                    y: transportPill.position.y,
                    width: transportPill.position.width,
                    height: transportPill.position.height,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <button
                ref={el => { if (el) transportPill.refs.current['sse'] = el; }}
                onClick={() => {
                  playClick();
                  setTransportMode('sse');
                }}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors duration-200 flex items-center gap-1.5 select-none ${
                  transportMode === 'sse'
                    ? 'text-white dark:text-slate-950 font-bold z-10'
                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Cloud SSE</span>
              </button>

              <button
                ref={el => { if (el) transportPill.refs.current['stdio'] = el; }}
                onClick={() => {
                  playClick();
                  setTransportMode('stdio');
                }}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors duration-200 flex items-center gap-1.5 select-none ${
                  transportMode === 'stdio'
                    ? 'text-white dark:text-slate-950 font-bold z-10'
                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">NPX Stdio</span>
              </button>
            </div>
          </div>

          {/* Client Tabs Bar with Container-Relative Slider Tracking (Anti-Flying Standard) */}
          <div className="mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 w-full relative">
              {clientPill.position.ready && (
                <motion.div
                  className="absolute top-0 left-0 rounded-lg bg-slate-950 dark:bg-white shadow-xs pointer-events-none"
                  initial={false}
                  animate={{
                    x: clientPill.position.x,
                    y: clientPill.position.y,
                    width: clientPill.position.width,
                    height: clientPill.position.height,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              {Object.keys(clientConfigs[transportMode]).map((key) => {
                const isSelected = activeClient === key;
                return (
                  <button
                    key={key}
                    ref={el => { if (el) clientPill.refs.current[key] = el; }}
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
                    <span className="relative z-10">{clientConfigs[transportMode][key].name}</span>
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
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                  </div>
                  <span className="ml-1 text-slate-400 font-medium">
                    {activeConfig.file}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(activeClient + transportMode, activeConfig.snippet)}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  {copiedKey === activeClient + transportMode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-200" />
                      <span className="text-slate-200">Copied</span>
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
                <code>{renderSyntaxCode(activeConfig.snippet, activeClient)}</code>
              </pre>
            </div>

            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-2.5">
              {activeConfig.notes}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Universal CLI Command Suite Bento with Container-Relative Slider Tracking */}
      <section className="px-6 max-w-5xl mx-auto w-full mb-12">
        <div className="neo-glass-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-slate-900 dark:text-white" />
                <span>Universal CAVDAX CLI Suite</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Execute directly via <code className="font-mono text-slate-900 dark:text-white font-semibold">npx cavdax &lt;command&gt;</code> without manual installation.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 self-start sm:self-auto relative">
              {cliTabPill.position.ready && (
                <motion.div
                  className="absolute top-0 left-0 rounded-lg bg-slate-950 dark:bg-white shadow-xs pointer-events-none"
                  initial={false}
                  animate={{
                    x: cliTabPill.position.x,
                    y: cliTabPill.position.y,
                    width: cliTabPill.position.width,
                    height: cliTabPill.position.height,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              {Object.keys(cliCommands).map((tab) => {
                const isSelected = activeCliTab === tab;
                return (
                  <button
                    key={tab}
                    ref={el => { if (el) cliTabPill.refs.current[tab] = el; }}
                    onClick={() => {
                      playClick();
                      setActiveCliTab(tab);
                    }}
                    className={`relative px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold transition-colors duration-200 select-none ${
                      isSelected
                        ? 'text-white dark:text-slate-950 z-10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <span className="relative z-10">{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 dark:bg-[#07090D] border border-slate-800 dark:border-white/10 font-mono text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">$</span>
              <span className="text-amber-300 font-bold">{cliCommands[activeCliTab].cmd}</span>
            </div>
            <button
              onClick={() => handleCopy(`cli-${activeCliTab}`, cliCommands[activeCliTab].cmd)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copiedKey === `cli-${activeCliTab}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-200" />
                  <span className="text-slate-200">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans text-slate-600 dark:text-slate-400">
            <span>{cliCommands[activeCliTab].desc}</span>
            <span className="font-mono text-[11px] text-slate-500 shrink-0">Flags: {cliCommands[activeCliTab].flags}</span>
          </div>
        </div>
      </section>

      {/* 5. Agent Guardrails Rules File (.cursorrules / CLAUDE.md) */}
      <section className="px-6 max-w-5xl mx-auto w-full mb-12">
        <div className="neo-glass-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-slate-900 dark:text-white" />
                <span>Agent Guardrails Instruction (.cursorrules / CLAUDE.md)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Add this directive to your repository root so Claude and Cursor agents automatically route writes through CAVDAX.
              </p>
            </div>

            <button
              onClick={() => handleCopy('rules-file', agentRulesSnippet)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-mono text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
            >
              {copiedKey === 'rules-file' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-200" />
                  <span>Copied Instructions</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Directives</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 bg-slate-950 dark:bg-[#07090D] p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed custom-scrollbar selection:bg-amber-500/30">
            {agentRulesSnippet}
          </div>
        </div>
      </section>

      {/* 6. Architecture & How It Operates */}
      <section id="mcp-architecture" data-tour="mcp-workflow" className="px-6 max-w-5xl mx-auto w-full mb-12">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
              <Workflow className="w-4 h-4 text-slate-950 dark:text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
              How The Enclosed Interception Loop Operates
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-sans">
            Standard agents operate unconstrained: they read vector embeddings and directly write code to disk. Under CAVDAX, the agent is configured to call tools through our enclosed stdio proxy or Cloud SSE gate.
          </p>
        </div>

        {/* 3 Symmetrical Bento Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1: Intercept */}
          <div className="neo-glass-card p-6 sm:p-7 flex flex-col justify-between group hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            <div 
              aria-hidden="true" 
              className="absolute top-0 right-0 w-24 h-24 bg-slate-950/5 dark:bg-white/5 rounded-bl-full pointer-events-none"
            />

            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-950 dark:text-white group-hover:border-slate-900/30 dark:group-hover:border-white/30 transition-colors shadow-xs">
                  <Terminal className="w-4.5 h-4.5" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  01 · Intercept
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tracking-tight mb-2">
                Tool Call Capture
              </h3>

              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed mb-4">
                When Claude Code or Cursor initiates <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-200 font-mono text-[11px]">apply_code_change</code>, the payload is captured over stdio or SSE before any disk modification occurs.
              </p>

              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-black/30 border border-slate-200 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Target</span>
                <span className="font-semibold text-slate-900 dark:text-white">stdio proxy / Cloud SSE</span>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Action: In-Flight</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">Zero Delay</span>
            </div>
          </div>

          {/* Step 2: Causal Provenance Check */}
          <div className="neo-glass-card p-6 sm:p-7 flex flex-col justify-between group hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            <div 
              aria-hidden="true" 
              className="absolute top-0 right-0 w-24 h-24 bg-slate-950/5 dark:bg-white/5 rounded-bl-full pointer-events-none"
            />

            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-950 dark:text-white group-hover:border-slate-900/30 dark:group-hover:border-white/30 transition-colors shadow-xs">
                  <GitBranch className="w-4.5 h-4.5" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  02 · GraphBLAS BFS
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tracking-tight mb-2">
                Causal Provenance Check
              </h3>

              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed mb-4">
                FalkorDB traces the change back to underlying ADRs and facts. If any fact links to a superseded ADR via <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-200 font-mono text-[11px]">[:SUPERSEDES]</code>, the dependency is marked STALE.
              </p>

              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-black/30 border border-slate-200 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Traversal</span>
                <span className="font-semibold text-slate-900 dark:text-white">[:SUPERSEDES] BFS</span>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Engine: FalkorDB RAM</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">&lt; 15ms</span>
            </div>
          </div>

          {/* Step 3: Deterministic Gate */}
          <div className="neo-glass-card p-6 sm:p-7 flex flex-col justify-between group hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            <div 
              aria-hidden="true" 
              className="absolute top-0 right-0 w-24 h-24 bg-slate-950/5 dark:bg-white/5 rounded-bl-full pointer-events-none"
            />

            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-slate-950 dark:text-white group-hover:border-slate-900/30 dark:group-hover:border-white/30 transition-colors shadow-xs">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  03 · Execution Gate
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tracking-tight mb-2">
                Commit or Hard Reject
              </h3>

              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed mb-4">
                Intact dependencies return 200 OK and commit to disk. Stale dependencies trigger an immediate 403 Forbidden with the exact invalidation path, forcing the agent to re-read the latest ADR.
              </p>

              <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-black/30 border border-slate-200 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Verdict</span>
                <span className="font-semibold text-slate-900 dark:text-white">200 OK / 403 Reject</span>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Guarantee: Strict</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">Zero Silent Rot</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Telemetry Row */}
      <section id="mcp-telemetry" className="px-6 max-w-5xl mx-auto w-full mb-14">
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
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Package Registry</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">npmjs.com/@cavdax</span>
          </div>
        </div>
      </section>

      {/* 8. Navigation Footer CTA */}
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
