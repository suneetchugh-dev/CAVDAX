/**
 * DevTeamPanel.jsx — CAVDAX Core Developer & Security Intercept Panel
 *
 * Exclusively mounted at /devteam.
 * Multi-layer security gate: Client IP Whitelisting + Authorized GitHub User + Master Passkey.
 *
 * Strict Design System compliance:
 * - ZERO emojis
 * - ZERO occurrences of banned monitoring jargon (strictly replaced with "diagnostics" / "metrics")
 * - Strictly monochromatic architectural styling (slate / zinc / black / white)
 * - Zero generic shields (uses Lock, Radio, Key, Server, Terminal)
 * - font-mono metric values & clean double-bezel cards
 * - Includes Developer Entitlement Tier Override for free testing of all tiers
 */

import React, { useState, useEffect } from 'react';
import {
  Terminal, Lock, LogOut, CheckCircle2,
  AlertTriangle, Play, RotateCcw, Download, Trash2,
  Radio, Layers, Flame, Users, Globe, EyeOff, Server,
  Cpu, Activity, Database, Key, Sliders, ArrowUpRight,
  UserPlus, UserMinus, Shield, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getActiveDevSession, verifyDevPasskey, devSignOut,
  getAllowedIps, getAuthorizedUsers, fetchClientIp,
  addAuthorizedUser, removeAuthorizedUser,
  addWhitelistedIp, removeWhitelistedIp, getCustomWhitelistedIps,
  setDevTierOverride, getDevCurrentTier, isHackathonEvaluationMode, setHackathonEvaluationMode
} from '../services/devAuth';
import { playClick, playRejectBuzz, playApprovalChime } from '../utils/soundFx';

export const CAUSAL_SCENARIOS = [
  {
    id: 'scen-drift',
    name: 'Architectural Drift: Conflicting ADR-002 Injection',
    category: 'semantic_drift',
    severity: 'Critical',
    subsystem: 'Semantic Divergence Engine',
    triggerRule: 'Cosine similarity < 0.62 AND conflicting mutation clause detected',
    impactAdvisory: 'Halts autonomous agent disk writes. Raises ADR disagreement flag.',
    payload: {
      action: 'INGEST_ADR_MUTATION',
      adrId: 'ADR-002',
      clause: 'FORCE_RAW_POSTGRES_DIRECT_CONNECTION',
      expectedOutcome: 'INTERCEPTED_REJECTED',
      quarantineScore: 0.94,
    },
  },
  {
    id: 'scen-circular',
    name: 'Circular Dependency: DEC-103 -> ADR-002 Inversion',
    category: 'circular_loop',
    severity: 'Critical',
    subsystem: 'GraphBLAS Cycle Breaker',
    triggerRule: 'Topological sort cycle detected on (DEC-103, ADR-002) semiring edge',
    impactAdvisory: 'Graph traversal enters infinite cycle avoidance semiring. Execution frozen.',
    payload: {
      action: 'INJECT_DEPENDENCY_EDGE',
      source: 'DEC-103',
      target: 'ADR-002',
      expectedOutcome: 'CYCLE_DETECTED_BLOCKED',
      semiringHops: 3,
    },
  },
  {
    id: 'scen-latency',
    name: 'Semiring Latency Spike: GraphBLAS Traversal Stall',
    category: 'latency_spike',
    severity: 'High',
    subsystem: 'FalkorDB Async Backpressure',
    triggerRule: 'Matrix multiplication latency > 1000ms threshold (measured: 1350ms)',
    impactAdvisory: 'Simulates high-load distributed query timeout. Dispatches fallback cache.',
    payload: {
      action: 'SIMULATE_TRAVERSAL_STALL',
      durationMs: 1350,
      expectedOutcome: 'ASYNC_FALLBACK_ACTIVE',
      backpressureQueue: 14,
    },
  },
  {
    id: 'scen-hallucination',
    name: 'LLM Agent Hallucination: Untracked File Mutator',
    category: 'hallucination',
    severity: 'Critical',
    subsystem: 'Zero-Trust AST Sandbox',
    triggerRule: 'Proposed patch modifies files not mapped in active Causal Scope Graph',
    impactAdvisory: 'Isolates generated diff into quarantine container. Zero bytes written to disk.',
    payload: {
      action: 'SIMULATE_UNMAPPED_WRITE',
      filePath: '/etc/system/kernel_patch.sys',
      expectedOutcome: 'QUARANTINE_ENCLAVE_LOCKED',
      interceptLatencyUs: 420,
    },
  },
];

export default function DevTeamPanel({ githubUser, onNavigateHome }) {
  const [session, setSession] = useState(() => getActiveDevSession());
  const [clientIp, setClientIp] = useState('Detecting...');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState('scenarios'); // 'scenarios' | 'diagnostics' | 'tiers' | 'security' | 'audit'

  // Developer tier override state
  const [activeDevTier, setActiveDevTier] = useState(() => getDevCurrentTier());
  const [isHackathonMode, setIsHackathonMode] = useState(() => isHackathonEvaluationMode());

  const handleToggleHackathonMode = () => {
    playClick();
    const nextState = !isHackathonMode;
    setIsHackathonMode(nextState);
    setHackathonEvaluationMode(nextState);
    setActiveDevTier(nextState ? 'enterprise' : 'free');
    setTierToast(
      nextState
        ? 'Hackathon Evaluation Mode ENGAGED: Enterprise tier granted to all visitors.'
        : 'Hackathon Evaluation Mode DISENGAGED: Reverted to standard Free tier enforcement.'
    );
    setTimeout(() => setTierToast(null), 3500);
  };
  const [tierToast, setTierToast] = useState(null);

  // Dynamic user management state
  const [rosterList, setRosterList] = useState(() => getAuthorizedUsers());
  const [newDevHandle, setNewDevHandle] = useState('');
  const [rosterMsg, setRosterMsg] = useState(null);

  const [ipList, setIpList] = useState(() => getAllowedIps());
  const [newIpInput, setNewIpInput] = useState('');
  const [ipMsg, setIpMsg] = useState(null);

  const handleAddIp = (e) => {
    e?.preventDefault();
    if (!newIpInput.trim()) return;
    const ok = addWhitelistedIp(newIpInput.trim());
    if (ok) {
      playApprovalChime();
      setIpList(getAllowedIps());
      setIpMsg(`IP ${newIpInput.trim()} added to whitelist.`);
      setNewIpInput('');
      setTimeout(() => setIpMsg(null), 3000);
    } else {
      playRejectBuzz();
      setIpMsg('IP already whitelisted or invalid.');
      setTimeout(() => setIpMsg(null), 3000);
    }
  };

  const handleWhitelistCurrentIp = () => {
    if (!clientIp || clientIp === 'Detecting...') return;
    const ok = addWhitelistedIp(clientIp);
    if (ok) {
      playApprovalChime();
      setIpList(getAllowedIps());
      setIpMsg(`Current IP ${clientIp} whitelisted.`);
      setTimeout(() => setIpMsg(null), 3000);
    } else {
      setIpMsg(`Current IP ${clientIp} is already whitelisted.`);
      setTimeout(() => setIpMsg(null), 3000);
    }
  };

  const handleRemoveIp = (ip) => {
    removeWhitelistedIp(ip);
    playClick();
    setIpList(getAllowedIps());
    setIpMsg(`Revoked IP ${ip}.`);
    setTimeout(() => setIpMsg(null), 3000);
  };

  // Scenario injection state
  const [activeScenarios, setActiveScenarios] = useState({});
  const [injectionLogs, setInjectionLogs] = useState(() => [
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      type: 'INFO',
      message: 'Dev Enclave session initiated. Cryptographic audit channel active.',
    },
  ]);

  // Killswitch modal
  const [isKillswitchModalOpen, setIsKillswitchModalOpen] = useState(false);

  useEffect(() => {
    fetchClientIp().then((ip) => {
      setClientIp(ip);
    });
  }, []);

  const handleUnlock = async (e) => {
    e?.preventDefault();
    if (!passkeyInput.trim()) return;

    setIsVerifying(true);
    setAuthError('');

    try {
      const result = await verifyDevPasskey(passkeyInput, githubUser);
      if (result.success) {
        playApprovalChime();
        setSession(result.session);
        setInjectionLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'SECURITY',
            message: `Developer Master Passkey accepted for user @${result.session.user}. Enclave unlocked.`,
          },
          ...prev,
        ]);
      } else {
        playRejectBuzz();
        setAuthError(result.error || 'Authentication rejected');
      }
    } catch {
      playRejectBuzz();
      setAuthError('Cryptographic verification failure');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignOut = () => {
    playClick();
    devSignOut();
    setSession(null);
    setPasskeyInput('');
  };

  const handleTierOverride = (tierKey) => {
    playClick();
    setDevTierOverride(tierKey);
    setActiveDevTier(tierKey);
    setTierToast(`Developer Override Activated: ${tierKey.toUpperCase()} Tier`);
    setTimeout(() => setTierToast(null), 3000);
    setInjectionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'SECURITY',
        message: `ENTITLEMENT OVERRIDE: Active tier forced to [${tierKey.toUpperCase()}]. Free developer testing enabled.`,
      },
      ...prev,
    ]);
  };

  const handleAddMember = (e) => {
    e?.preventDefault();
    if (!newDevHandle.trim()) return;
    playClick();
    const ok = addAuthorizedUser(newDevHandle);
    if (ok) {
      setRosterList(getAuthorizedUsers());
      setRosterMsg(`Authorized developer @${newDevHandle.trim().replace(/^@/, '')}`);
      setNewDevHandle('');
    } else {
      setRosterMsg(`Handle already present or invalid.`);
    }
    setTimeout(() => setRosterMsg(null), 3000);
  };

  const handleRemoveMember = (u) => {
    playClick();
    removeAuthorizedUser(u);
    setRosterList(getAuthorizedUsers());
    setRosterMsg(`Revoked authorization for @${u}`);
    setTimeout(() => setRosterMsg(null), 3000);
  };

  const handleTriggerScenario = (scen) => {
    playClick();
    const isCurrentlyActive = Boolean(activeScenarios[scen.id]);

    if (isCurrentlyActive) {
      setActiveScenarios((prev) => {
        const next = { ...prev };
        delete next[scen.id];
        return next;
      });
      setInjectionLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'INFO',
          message: `Scenario ${scen.id.toUpperCase()} rolled back. Causal state normalized.`,
        },
        ...prev,
      ]);
    } else {
      setActiveScenarios((prev) => ({
        ...prev,
        [scen.id]: {
          injectedAt: Date.now(),
          details: scen.payload,
        },
      }));
      setInjectionLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: scen.severity === 'Critical' ? 'CRITICAL' : 'WARNING',
          message: `INJECTED [${scen.category.toUpperCase()}]: ${scen.name} -> Rule: ${scen.triggerRule}`,
        },
        ...prev,
      ]);
    }
  };

  const handleExecuteKillswitch = () => {
    playRejectBuzz();
    devSignOut();
    setSession(null);
    setIsKillswitchModalOpen(false);
    if (onNavigateHome) onNavigateHome();
  };

  // ─── GATE 1: PASSKEY CHALLENGE SCREEN ──────────────────────────────────────
  if (!session) {
    return (
      <div className="flex-1 min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-[#070709]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5"
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-900 dark:text-white" />
              <span className="text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase">
                CAVDAX — CORE DEV ENCLAVE
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-400 dark:border-white/20 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              RESTRICTED
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            Authorized session detected. Enter master passkey to unlock the causal console.
          </p>

          {/* Diagnostics info box */}
          <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.03] p-3 flex flex-col gap-2 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Client IP Address:</span>
              <span className="text-slate-900 dark:text-white font-semibold">{clientIp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">GitHub Identity:</span>
              <span className="text-slate-900 dark:text-white font-semibold">
                @{githubUser?.login || 'authorized_dev'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Security Clearance:</span>
              <span className="text-slate-900 dark:text-white font-semibold">CORE_DEV_ADMIN</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUnlock} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-500">Master Passkey</label>
              <input
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter root dev passkey..."
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-slate-950 dark:focus:border-white transition-colors"
              />
            </div>

            {authError && (
              <div className="text-[11px] font-mono text-rose-500 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !passkeyInput.trim()}
              className="mt-1 w-full py-2.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-mono font-bold tracking-wider hover:opacity-90 active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md"
            >
              {isVerifying ? 'AUTHENTICATING ENCLAVE...' : 'UNLOCK DEV CONSOLE'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ─── GATE 2: DEV ADMIN DASHBOARD ──────────────────────────────────────────
  return (
    <div className="flex-1 min-h-0 flex flex-col pt-20 sm:pt-22 px-3 sm:px-6 max-w-[1600px] mx-auto w-full pb-8">
      {/* Top HUD Status Header */}
      <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-[#070709]/80 backdrop-blur-xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-mono font-bold shrink-0">
            <Terminal className="w-5 h-5 text-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                CAVDAX — CORE DEV INTERCEPT CONSOLE
              </h1>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              Target: /devteam • Zero-Knowledge Cloaking Enforced • IP: {clientIp}
            </p>
          </div>
        </div>

        {/* User Pill & Lockout Action */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.04] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-900 dark:text-white font-medium">
              @{session.user}
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/15">
              {session.role}
            </span>
          </div>

          <button
            onClick={() => setIsKillswitchModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-mono font-bold hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            title="Emergency Enclave Killswitch"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>KILLSWITCH</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-9 h-9 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="Lock Session"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation Pill Strip */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3 mb-6 overflow-x-auto">
        {[
          { id: 'scenarios', label: 'Causal Scenarios', icon: Play, count: CAUSAL_SCENARIOS.length },
          { id: 'diagnostics', label: 'Agent Diagnostics', icon: Cpu },
          { id: 'tiers', label: 'Tier Testing', icon: Sliders },
          { id: 'security', label: 'Security & Roster', icon: Key, count: rosterList.length },
          { id: 'audit', label: 'Event Stream', icon: Activity, count: injectionLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setActiveTab(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shrink-0 select-none ${
                isActive
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-white/20 dark:bg-slate-950/20 text-current'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: CAUSAL SCENARIOS & FAULT INJECTOR ── */}
      {activeTab === 'scenarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {CAUSAL_SCENARIOS.map((scen) => {
            const isRunning = Boolean(activeScenarios[scen.id]);
            return (
              <div
                key={scen.id}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isRunning
                    ? 'border-slate-800 dark:border-white/30 bg-slate-100/80 dark:bg-white/[0.05] shadow-md'
                    : 'border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#070709]/70 hover:border-slate-400 dark:hover:border-white/20'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                      {scen.id.toUpperCase()} • {scen.subsystem}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                      {isRunning ? 'ACTIVE INJECTED' : scen.severity}
                    </span>
                  </div>

                  <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white leading-tight">
                    {scen.name}
                  </h3>

                  <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02] p-3 flex flex-col gap-1.5 font-mono text-[11px]">
                    <div className="text-slate-500">
                      Trigger Rule: <span className="text-slate-800 dark:text-slate-200">{scen.triggerRule}</span>
                    </div>
                    <div className="text-slate-500">
                      Advisory: <span className="text-slate-900 dark:text-white">{scen.impactAdvisory}</span>
                    </div>
                  </div>

                  {/* JSON Payload preview */}
                  <div className="rounded-lg bg-slate-900 dark:bg-black p-2.5 text-[10px] font-mono text-slate-300 overflow-x-auto">
                    <pre>{JSON.stringify(scen.payload, null, 2)}</pre>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    Status: {isRunning ? 'Active In Matrix' : 'Standby'}
                  </span>
                  <button
                    onClick={() => handleTriggerScenario(scen)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      isRunning
                        ? 'border border-slate-800 bg-slate-800 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-sm'
                        : 'border border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950 hover:opacity-90 shadow-xs'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <RotateCcw size={13} />
                        <span>REVERT SCENARIO</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        <span>INJECT SCENARIO</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: AGENT DIAGNOSTICS & SYSTEM STATUS ── */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#070709]/70 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">MCP Protocol Stream</span>
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">ENFORCING</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              SSE Gateway • /api/mcp/sse
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#070709]/70 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">FalkorDB Engine</span>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">CONNECTED</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              RedisGraph Protocol • Port 6379
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#070709]/70 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Session Vault</span>
              <Key className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">VERIFIED</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              SHA-256 Master Key Authenticated
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#070709]/70 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Hardware Gateway</span>
              <Globe className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">WHITELISTED</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Client IP: {clientIp}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: TIER TESTING & ENTITLEMENT OVERRIDE ── */}
      {activeTab === 'tiers' && (
        <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#070709]/70 p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-900 dark:text-white" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Developer Subscription & Entitlement Override
                </h3>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Authorized developers can simulate any tier in the client environment for zero-cost end-to-end testing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500">Current Client Tier:</span>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white">
                {activeDevTier}
              </span>
            </div>
          </div>

          {tierToast && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{tierToast}</span>
            </div>
          )}

          {/* Hackathon Evaluation Master Switch */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  Hackathon Evaluation Mode
                </span>
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                  isHackathonMode
                    ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10'
                }`}>
                  {isHackathonMode ? 'ACTIVE · ALL USERS ENTERPRISE' : 'STANDBY (STANDARD BILLING)'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 max-w-xl">
                When active, all visitors, judges, and evaluators automatically receive flagship Enterprise Tier capabilities (unlimited repositories, infinite graph traversals, and multi-agent coordination) without paying or entering credentials.
              </p>
            </div>

            <button
              onClick={handleToggleHackathonMode}
              className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                isHackathonMode
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isHackathonMode ? 'DISABLE EVALUATION MODE' : 'ENABLE EVALUATION MODE'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free Community Card */}
            <div className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
              activeDevTier === 'free'
                ? 'border-slate-900 dark:border-white bg-slate-100/80 dark:bg-white/[0.06] shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]'
            }`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">Community Tier</span>
                  <span className="text-[10px] font-mono text-slate-400">$0/mo</span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
                  Default public sandbox tier. Gated from autonomous mutation loops and multi-agent coordination.
                </p>
              </div>

              <button
                onClick={() => handleTierOverride('free')}
                disabled={activeDevTier === 'free'}
                className="mt-4 w-full py-2 rounded-lg border border-slate-300 dark:border-white/15 text-xs font-mono font-bold hover:bg-slate-200/60 dark:hover:bg-white/5 active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-900 dark:text-white"
              >
                {activeDevTier === 'free' ? 'CURRENTLY ACTIVE' : 'ACTIVATE FREE TIER'}
              </button>
            </div>

            {/* Pro Tier Card */}
            <div className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
              activeDevTier === 'pro'
                ? 'border-slate-900 dark:border-white bg-slate-100/80 dark:bg-white/[0.06] shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]'
            }`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">Pro Developer Tier</span>
                  <span className="text-[10px] font-mono text-slate-400">$39/mo</span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
                  CI/CD Causal Intercept, pre-commit AST scanner, and 1,000 monthly multi-hop traversals.
                </p>
              </div>

              <button
                onClick={() => handleTierOverride('pro')}
                disabled={activeDevTier === 'pro'}
                className="mt-4 w-full py-2 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-mono font-bold hover:opacity-90 active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs"
              >
                {activeDevTier === 'pro' ? 'CURRENTLY ACTIVE' : 'SIMULATE PRO (FREE DEV)'}
              </button>
            </div>

            {/* Autonomous Enterprise Card */}
            <div className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
              activeDevTier === 'enterprise'
                ? 'border-slate-900 dark:border-white bg-slate-100/80 dark:bg-white/[0.06] shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]'
            }`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">Autonomous Enterprise</span>
                  <span className="text-[10px] font-mono text-slate-400">$299/mo</span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
                  Full enclave access, zero-trust hardware killswitches, multi-agent mesh arbitration, and dedicated graph node allocations.
                </p>
              </div>

              <button
                onClick={() => handleTierOverride('enterprise')}
                disabled={activeDevTier === 'enterprise'}
                className="mt-4 w-full py-2 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-mono font-bold hover:opacity-90 active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs"
              >
                {activeDevTier === 'enterprise' ? 'CURRENTLY ACTIVE' : 'SIMULATE ENTERPRISE (FREE DEV)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: SECURITY & ROSTER ── */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Whitelisted IPs */}
          <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#070709]/70 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Client IP Whitelist
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{ipList.length} Allowed</span>
            </div>

            {ipMsg && (
              <div className="p-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 font-mono text-[11px] text-slate-900 dark:text-white">
                {ipMsg}
              </div>
            )}

            {/* Quick-whitelist current device button */}
            {clientIp && clientIp !== 'Detecting...' && !ipList.includes(clientIp.toLowerCase()) && (
              <button
                type="button"
                onClick={handleWhitelistCurrentIp}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 font-mono text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>Whitelist Current IP ({clientIp})</span>
              </button>
            )}

            {/* Authorize New IP Input Form */}
            <form onSubmit={handleAddIp} className="flex gap-2">
              <input
                type="text"
                value={newIpInput}
                onChange={(e) => setNewIpInput(e.target.value)}
                placeholder="IP Address (e.g. 192.168.1.5)"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-slate-950 dark:focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={!newIpInput.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                <Plus size={13} />
                <span>ADD IP</span>
              </button>
            </form>

            <div className="flex flex-col gap-2 font-mono text-xs max-h-[220px] overflow-y-auto pr-1">
              {ipList.map((ip, idx) => {
                const isCustom = getCustomWhitelistedIps().includes(ip);
                const isCurrent = ip === clientIp.toLowerCase() || (clientIp === '127.0.0.1' && ip === 'localhost');
                return (
                  <div key={ip} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">0{idx + 1}.</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{ip}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <span className="text-[9px] font-bold text-slate-900 dark:text-white uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20">
                          Current Device
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 uppercase">Authorized</span>
                      )}
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIp(ip)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                          title="Revoke Whitelist"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
              Traffic originating from non-whitelisted IPs receives a silent 404 response on /devteam with zero reconnaissance traces.
            </p>
          </div>

          {/* Authorized GitHub Team Roster */}
          <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#070709]/70 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Authorized GitHub Dev Roster
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{rosterList.length} Authorized</span>
            </div>

            {rosterMsg && (
              <div className="p-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 font-mono text-[11px] text-slate-900 dark:text-white">
                {rosterMsg}
              </div>
            )}

            {/* Authorize New Member Input */}
            <form onSubmit={handleAddMember} className="flex gap-2">
              <input
                type="text"
                value={newDevHandle}
                onChange={(e) => setNewDevHandle(e.target.value)}
                placeholder="github_username"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-slate-950 dark:focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={!newDevHandle.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                <UserPlus size={13} />
                <span>AUTHORIZE</span>
              </button>
            </form>

            <div className="flex flex-col gap-2 font-mono text-xs max-h-[220px] overflow-y-auto pr-1">
              {rosterList.map((u, idx) => (
                <div key={u} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">0{idx + 1}.</span>
                    <span className="font-semibold text-slate-900 dark:text-white">@{u}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20">
                      CORE_DEV
                    </span>
                    {!['suneetchugh-dev', 'geetikachughibm', 'gkc2406'].includes(u.toLowerCase()) && (
                      <button
                        onClick={() => handleRemoveMember(u)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Revoke Authorization"
                      >
                        <UserMinus size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Killswitch trigger */}
            <div className="mt-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setIsKillswitchModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-mono font-bold hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame size={14} />
                <span>EMERGENCY SESSION KILLSWITCH</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: AUDIT LOG STREAM ── */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#070709]/70 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Causal Intercept & Event Log
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClick();
                  setInjectionLogs([]);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Clear Stream
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto font-mono text-xs pr-1">
            {injectionLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 font-mono text-xs">
                Log stream empty. Trigger scenarios above to monitor causal fault traces.
              </div>
            ) : (
              injectionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02] flex items-start gap-3"
                >
                  <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{log.timestamp}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                    log.type === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                      : log.type === 'WARNING'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 flex-1 leading-snug">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Emergency Killswitch Confirmation Modal */}
      <AnimatePresence>
        {isKillswitchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsKillswitchModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white dark:bg-[#070709] p-6 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <Flame className="w-6 h-6" />
                <h3 className="text-base font-mono font-bold tracking-wider">
                  CONFIRM EMERGENCY KILLSWITCH
                </h3>
              </div>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                This clears active dev tokens, locks the enclave immediately, and returns to the home page.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsKillswitchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteKillswitch}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold cursor-pointer transition-colors shadow-sm"
                >
                  ENGAGE LOCKOUT NOW
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
