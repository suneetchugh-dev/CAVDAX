import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  FileCode, 
  Lock, 
  Unlock, 
  Users, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Activity, 
  Clock, 
  ArrowRight, 
  RefreshCw,
  GitBranch,
  Layers,
  Flame
} from 'lucide-react';
import { playClick, playApprovalChime, playRejectBuzz } from '../utils/soundFx';

export default function ProactiveIntentLockPlayground({ onActionComplete }) {
  // Mode: 'clearance' | 'write_gate' | 'multi_agent_lock'
  const [activeMode, setActiveMode] = useState('clearance');

  // Mode 1: Pre-Flight Intent Clearance State
  const [clearanceDecision, setClearanceDecision] = useState('DEC-103');
  const [clearanceFile, setClearanceFile] = useState('src/services/checkout.js');
  const [clearanceIntent, setClearanceIntent] = useState('Implement OAuth2 checkout token validation');
  const [isVerifyingClearance, setIsVerifyingClearance] = useState(false);
  const [clearanceResult, setClearanceResult] = useState(null);

  // Mode 2: Enclosed Code Write Gate State
  const [writeDecision, setWriteDecision] = useState('DEC-102');
  const [writeFile, setWriteFile] = useState('src/services/payment.js');
  const [codePayload, setCodePayload] = useState(
`// Proposed mutation relying on decommissioned TokenAuth v1:
app.post('/api/checkout', (req, res) => {
  verifyToken(req.headers['authorization']);
});`
  );
  const [isWritingCode, setIsWritingCode] = useState(false);
  const [writeResult, setWriteResult] = useState(null);

  // Mode 3: Multi-Agent Concurrency Lock State
  const [lockDecision, setLockDecision] = useState('DEC-103');
  const [activeLease, setActiveLease] = useState(null);
  const [lockStatus, setLockStatus] = useState(null); // 'idle' | 'conflict' | 'acquired' | 'released'
  const [lockFeedback, setLockFeedback] = useState(null);
  const [isLocking, setIsLocking] = useState(false);
  const [collisionsPrevented, setCollisionsPrevented] = useState(0);

  // Fetch active locks on mount and subscribe to SSE
  useEffect(() => {
    let isMounted = true;
    const fetchLocks = async () => {
      try {
        const res = await fetch('/api/mcp/locks');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.active_locks?.length > 0) {
            const current = data.active_locks.find(l => l.decision_id === lockDecision);
            if (current) setActiveLease(current);
          }
        }
      } catch (err) {
        // Fallback simulation mode
      }
    };
    fetchLocks();

    const es = new EventSource('/api/events');
    es.addEventListener('DECISION_LOCK_CHANGED', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (isMounted) {
          const match = data.activeLocks?.find(l => l.decision_id === lockDecision);
          setActiveLease(match || null);
        }
      } catch (err) {}
    });

    return () => {
      isMounted = false;
      es.close();
    };
  }, [lockDecision]);

  // Handle Intent Clearance Verification
  const handleVerifyClearance = async (e) => {
    if (e) e.preventDefault();
    playClick();
    setIsVerifyingClearance(true);
    setClearanceResult(null);

    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: 'check_intent_clearance',
          args: {
            decision_id: clearanceDecision,
            target_file: clearanceFile,
            proposed_action: clearanceIntent
          }
        })
      });

      const data = await res.json();
      setClearanceResult(data);

      const isApproved = Boolean(data.clearance_granted || data.gate_verdict === 'APPROVED');
      if (isApproved) {
        playApprovalChime();
      } else {
        playRejectBuzz();
      }
      if (onActionComplete) onActionComplete(data);
    } catch (err) {
      // Local fallback simulation
      const isApproved = clearanceDecision === 'DEC-103';
      const sim = {
        isError: !isApproved,
        clearance_granted: isApproved,
        gate_verdict: isApproved ? 'APPROVED' : 'BLOCKED_SUPERSEDED_SOURCE',
        latency_ms: 1.62,
        simulated: true,
        violation_paths: !isApproved ? [['Source:ADR-001 (SUPERSEDED)', 'Fact:F-Auth-v1 (STALE)', `Decision:${clearanceDecision}`]] : [],
        message: isApproved
          ? `CLEARANCE GRANTED: Decision '${clearanceDecision}' is verified and active. Safe to generate code.`
          : `CLEARANCE DENIED: Decision '${clearanceDecision}' is grounded in superseded source 'ADR-001'. Pre-flight check failed.`
      };
      setClearanceResult(sim);
      if (isApproved) playApprovalChime();
      else playRejectBuzz();
    } finally {
      setIsVerifyingClearance(false);
    }
  };

  // Handle Enclosed Code Write
  const handleApplyCodeWrite = async (e) => {
    if (e) e.preventDefault();
    playClick();
    setIsWritingCode(true);
    setWriteResult(null);

    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: 'apply_code_change',
          args: {
            decision_id: writeDecision,
            file_path: writeFile,
            code_payload: codePayload
          }
        })
      });

      const data = await res.json();
      setWriteResult(data);

      const isApproved = Boolean(data.is_approved || data.gate_verdict === 'APPROVED');
      if (isApproved) {
        playApprovalChime();
      } else {
        playRejectBuzz();
      }
      if (onActionComplete) onActionComplete(data);
    } catch (err) {
      const isApproved = writeDecision === 'DEC-103';
      const sim = {
        isError: !isApproved,
        is_approved: isApproved,
        gate_verdict: isApproved ? 'APPROVED' : 'BLOCKED_SUPERSEDED_SOURCE',
        latency_ms: 1.84,
        simulated: true,
        violation_paths: !isApproved ? [['Source:ADR-001 (SUPERSEDED)', 'Fact:F-Auth-v1 (STALE)', `Decision:${writeDecision}`]] : []
      };
      setWriteResult(sim);
      if (isApproved) playApprovalChime();
      else playRejectBuzz();
    } finally {
      setIsWritingCode(false);
    }
  };

  // Handle Agent Lock Acquisition
  const handleAcquireLock = async (agentId) => {
    playClick();
    setIsLocking(true);
    setLockFeedback(null);

    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: 'acquire_decision_lock',
          args: {
            decision_id: lockDecision,
            agent_id: agentId,
            ttl_ms: 30000
          }
        })
      });

      const data = await res.json();
      if (res.status === 409) {
        playRejectBuzz();
        setLockStatus('conflict');
        setLockFeedback(data);
        setCollisionsPrevented(prev => prev + 1);
      } else {
        playApprovalChime();
        setLockStatus('acquired');
        setLockFeedback(data);
        setActiveLease({
          agent_id: agentId,
          decision_id: lockDecision,
          expires_at: Date.now() + 30000
        });
      }
    } catch (err) {
      // Local Simulation
      if (activeLease && activeLease.agent_id !== agentId) {
        playRejectBuzz();
        setLockStatus('conflict');
        setLockFeedback({
          isError: true,
          acquired: false,
          gate_verdict: 'BLOCKED_LOCK_HELD_BY_OTHER_AGENT',
          decision_id: lockDecision,
          holder_agent_id: activeLease.agent_id,
          message: `CONCURRENCY COLLISION: Decision '${lockDecision}' is leased to '${activeLease.agent_id}'. Collision blocked.`
        });
        setCollisionsPrevented(prev => prev + 1);
      } else {
        playApprovalChime();
        setLockStatus('acquired');
        const lease = { agent_id: agentId, decision_id: lockDecision, expires_at: Date.now() + 30000 };
        setActiveLease(lease);
        setLockFeedback({
          isError: false,
          acquired: true,
          message: `LOCK ACQUIRED: Agent '${agentId}' holds exclusive lease on '${lockDecision}'.`
        });
      }
    } finally {
      setIsLocking(false);
    }
  };

  // Handle Agent Lock Release
  const handleReleaseLock = async (agentId) => {
    playClick();
    setIsLocking(true);

    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: 'release_decision_lock',
          args: {
            decision_id: lockDecision,
            agent_id: agentId
          }
        })
      });

      const data = await res.json();
      setActiveLease(null);
      setLockStatus('released');
      setLockFeedback(data);
      playApprovalChime();
    } catch (err) {
      setActiveLease(null);
      setLockStatus('released');
      setLockFeedback({
        isError: false,
        released: true,
        message: `LOCK RELEASED: Decision '${lockDecision}' is available for other agents.`
      });
      playApprovalChime();
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#07090e]/95 backdrop-blur-xl p-5 sm:p-7 shadow-xl font-mono text-xs select-none">
      
      {/* ── Top Header & Metrics Badges ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">
              Live MCP Governance & Lock Playground
            </h3>
            <span className="text-[10px] text-slate-500 tracking-tight block">
              Pre-flight Intent Clearance • Enclosed Write Interception • Multi-Agent Concurrency Leases
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
            GraphBLAS: &lt; 2.0ms
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Token Drain: 0 TOKENS
          </span>
        </div>
      </div>

      {/* ── 3-Way Mode Segmented Control ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 mb-6">
        <button
          type="button"
          onClick={() => { setActiveMode('clearance'); playClick(); }}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMode === 'clearance'
              ? 'bg-white text-slate-950 dark:bg-white dark:text-slate-950 shadow-xs scale-[1.01]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>1. Intent Clearance</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveMode('write_gate'); playClick(); }}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMode === 'write_gate'
              ? 'bg-white text-slate-950 dark:bg-white dark:text-slate-950 shadow-xs scale-[1.01]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>2. Code Write Gate</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveMode('multi_agent_lock'); playClick(); }}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMode === 'multi_agent_lock'
              ? 'bg-white text-slate-950 dark:bg-white dark:text-slate-950 shadow-xs scale-[1.01]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. Multi-Agent Locks</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODE 1: PRE-FLIGHT INTENT CLEARANCE                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMode === 'clearance' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">What this demonstrates: </span>
            Before Claude Code or Cursor spends prompt tokens drafting code mutations, it requests pre-flight clearance. 
            If the proposed action relies on a superseded decision (e.g. <span className="font-bold text-amber-500">DEC-102</span>), the write is blocked <span className="font-bold">before any tokens or disk writes occur</span>.
          </div>

          <form onSubmit={handleVerifyClearance} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                  Target Decision Grounding:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clearanceDecision}
                    onChange={(e) => setClearanceDecision(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#0c0f16] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white/40"
                    placeholder="e.g. DEC-103 or DEC-102"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      if (clearanceDecision === 'DEC-103') {
                        setClearanceDecision('DEC-102');
                        setClearanceIntent('Implement TokenAuth v1 checkout handler');
                      } else {
                        setClearanceDecision('DEC-103');
                        setClearanceIntent('Implement OAuth2 checkout token validation');
                      }
                    }}
                    className="px-2.5 py-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-[10px] text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {clearanceDecision === 'DEC-103' ? 'Toggle DEC-102 (Stale)' : 'Toggle DEC-103 (Active)'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                  Target Destination File:
                </label>
                <input
                  type="text"
                  value={clearanceFile}
                  onChange={(e) => setClearanceFile(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#0c0f16] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                Proposed Agent Action / Intent Statement:
              </label>
              <input
                type="text"
                value={clearanceIntent}
                onChange={(e) => setClearanceIntent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#0c0f16] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white/40"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingClearance}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold tracking-wider uppercase text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isVerifyingClearance ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Traversing GraphBLAS Semiring Matrix...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Pre-Flight Intent Clearance</span>
                </>
              )}
            </button>
          </form>

          {/* Result Inspection Readout */}
          {clearanceResult && (
            <div className={`mt-4 p-4 rounded-xl border ${
              clearanceResult.clearance_granted || clearanceResult.gate_verdict === 'APPROVED'
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-red-500/5 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-current/10 mb-2.5">
                <div className="flex items-center gap-2">
                  {clearanceResult.clearance_granted || clearanceResult.gate_verdict === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-bold uppercase tracking-wider text-xs ${
                    clearanceResult.clearance_granted || clearanceResult.gate_verdict === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {clearanceResult.gate_verdict}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Latency: {clearanceResult.latency_ms || clearanceResult.simulated_latency_ms || 1.62}ms
                </span>
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed mb-2">
                {clearanceResult.message}
              </p>

              {clearanceResult.violation_paths?.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-red-500/20 text-[11px]">
                  <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">
                    Causal Violation Path Detected:
                  </span>
                  <div className="p-2 rounded bg-red-500/10 font-mono text-red-700 dark:text-red-300">
                    {clearanceResult.violation_paths[0].join(' ──> ')}
                  </div>
                </div>
              )}

              {clearanceResult.instructions_for_agent && (
                <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Agent Directive: </span>
                  {clearanceResult.instructions_for_agent}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODE 2: ENCLOSED CODE WRITE GATE                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMode === 'write_gate' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">What this demonstrates: </span>
            When an agent calls <span className="font-mono font-bold">apply_code_change</span>, the write operation is intercepted in-flight. 
            If the grounding decision has been invalidated by a superseding ADR, the write is aborted before disk bytes are committed.
          </div>

          <form onSubmit={handleApplyCodeWrite} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                  Grounding Decision ID:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={writeDecision}
                    onChange={(e) => setWriteDecision(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#0c0f16] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      if (writeDecision === 'DEC-102') {
                        setWriteDecision('DEC-103');
                        setCodePayload(`// Compliant with ADR-002 OAuth2:\napp.post('/api/checkout', (req, res) => {\n  verifyOAuth2Token(req.headers['authorization']);\n});`);
                      } else {
                        setWriteDecision('DEC-102');
                        setCodePayload(`// Stale implementation relying on TokenAuth v1:\napp.post('/api/checkout', (req, res) => {\n  verifyToken(req.headers['authorization']);\n});`);
                      }
                    }}
                    className="px-2.5 py-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-[10px] text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {writeDecision === 'DEC-102' ? 'Toggle DEC-103 (Valid)' : 'Toggle DEC-102 (Stale)'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                  Destination Code File:
                </label>
                <input
                  type="text"
                  value={writeFile}
                  onChange={(e) => setWriteFile(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#0c0f16] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                Agent In-Flight Code Payload:
              </label>
              <textarea
                value={codePayload}
                onChange={(e) => setCodePayload(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg bg-slate-100 dark:bg-[#0c0f16] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-slate-900 dark:focus:border-white/40 resize-none leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isWritingCode}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold tracking-wider uppercase text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isWritingCode ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Invariant Constraints...</span>
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  <span>Execute Enclosed Code Write Gate</span>
                </>
              )}
            </button>
          </form>

          {/* Write Result Readout Box */}
          {writeResult && (
            <div className={`mt-4 p-4 rounded-xl border ${
              writeResult.is_approved || writeResult.gate_verdict === 'APPROVED'
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-red-500/5 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-current/10 mb-2.5">
                <div className="flex items-center gap-2">
                  {writeResult.is_approved || writeResult.gate_verdict === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-bold uppercase tracking-wider text-xs ${
                    writeResult.is_approved || writeResult.gate_verdict === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {writeResult.gate_verdict || (writeResult.is_approved ? 'APPROVED' : 'BLOCKED')}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Latency: {writeResult.latency_ms || writeResult.simulated_latency_ms || 1.84}ms
                </span>
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed mb-1">
                {writeResult.message || (writeResult.is_approved ? 'File mutation written and signed to audit trail.' : 'File write aborted. Zero bytes committed to disk.')}
              </p>

              {writeResult.violation_paths?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-red-500/20 text-[11px]">
                  <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">
                    Causal Path Invalidation:
                  </span>
                  <div className="p-2 rounded bg-red-500/10 font-mono text-red-700 dark:text-red-300">
                    {writeResult.violation_paths[0].join(' ──> ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODE 3: MULTI-AGENT CONCURRENCY LOCK PLAYGROUND               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMode === 'multi_agent_lock' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">What this demonstrates: </span>
            When multiple autonomous agents (e.g. Claude Code CLI and Cursor IDE) operate on the same codebase simultaneously, 
            FalkorDB leases provide distributed decision locks. If Agent 1 holds the lease, Agent 2 is blocked from concurrent mutation, 
            <span className="font-bold"> completely preventing split-brain merge collisions</span>.
          </div>

          {/* Current Decision Lease Status Panel */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Lock className={`w-4 h-4 ${activeLease ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                  Active Lease on {lockDecision}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                activeLease 
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' 
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              }`}>
                {activeLease ? `LOCKED BY ${activeLease.agent_id}` : 'UNLOCKED / AVAILABLE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Lease Holder</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {activeLease ? activeLease.agent_id : 'None'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Lock TTL</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {activeLease ? '30.0s Auto-Expire' : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Collisions Prevented</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {collisionsPrevented} Collisions
                </span>
              </div>
            </div>
          </div>

          {/* Dual Agent Fleet Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Agent 1: Claude Code Worker */}
            <div className={`p-4 rounded-xl border transition-all ${
              activeLease?.agent_id === 'claude-code-worker-01'
                ? 'border-amber-500 bg-amber-500/5'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.02]'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Claude Code Agent</h4>
                    <span className="text-[10px] text-slate-500 block">Agent ID: claude-code-worker-01</span>
                  </div>
                </div>
                {activeLease?.agent_id === 'claude-code-worker-01' && (
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    LEASE HOLDER
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  disabled={isLocking || activeLease?.agent_id === 'claude-code-worker-01'}
                  onClick={() => handleAcquireLock('claude-code-worker-01')}
                  className="flex-1 py-2 px-2.5 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Lock className="w-3 h-3" />
                  <span>Acquire Lease</span>
                </button>

                {activeLease?.agent_id === 'claude-code-worker-01' && (
                  <button
                    type="button"
                    disabled={isLocking}
                    onClick={() => handleReleaseLock('claude-code-worker-01')}
                    className="py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>Release</span>
                  </button>
                )}
              </div>
            </div>

            {/* Agent 2: Cursor IDE Agent */}
            <div className={`p-4 rounded-xl border transition-all ${
              activeLease?.agent_id === 'cursor-composer-02'
                ? 'border-amber-500 bg-amber-500/5'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.02]'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Cursor Composer</h4>
                    <span className="text-[10px] text-slate-500 block">Agent ID: cursor-composer-02</span>
                  </div>
                </div>
                {activeLease?.agent_id === 'cursor-composer-02' && (
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    LEASE HOLDER
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  disabled={isLocking || activeLease?.agent_id === 'cursor-composer-02'}
                  onClick={() => handleAcquireLock('cursor-composer-02')}
                  className="flex-1 py-2 px-2.5 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Lock className="w-3 h-3" />
                  <span>Acquire Lease</span>
                </button>

                {activeLease?.agent_id === 'cursor-composer-02' && (
                  <button
                    type="button"
                    disabled={isLocking}
                    onClick={() => handleReleaseLock('cursor-composer-02')}
                    className="py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>Release</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Collision / Resolution Inspection Banner */}
          {lockFeedback && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              lockStatus === 'conflict'
                ? 'bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {lockStatus === 'conflict' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>409 CONFLICT: CONCURRENCY LEASE VIOLATION</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>200 OK: DISTRIBUTED LEASE GRANTED</span>
                  </>
                )}
              </div>
              <p>{lockFeedback.message}</p>
              {lockFeedback.instructions_for_agent && (
                <p className="mt-1.5 text-[11px] opacity-80 font-mono">
                  Directive: {lockFeedback.instructions_for_agent}
                </p>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
