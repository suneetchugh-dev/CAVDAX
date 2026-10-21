/**
 * AuditPage.jsx — CAVDAX Agent Action Audit Log
 *
 * Displays a live, queryable table of every AgentAction node written to FalkorDB
 * by the MCP gate. Powers enterprise security and compliance team workflows.
 *
 * Design System compliance (docs/UI_DESIGN_SYSTEM.md):
 *  - NO emojis — Lucide icons only
 *  - NO brackets around status tags
 *  - NO colored pulsing orbs — monospace text indicators
 *  - NO eyebrow pills above headings
 *  - Double-bezel card geometry (bezel-card class)
 *  - font-mono for IDs, timestamps, verdicts
 *  - rose / teal / slate palette for status severity
 *  - Zero-overflow containment (h-full flex flex-col)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, FileText, AlertTriangle, CheckCircle2, Clock, Database } from 'lucide-react';
import { playClick } from '../utils/soundFx';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─── Status badge — monospace, no brackets, severity-mapped colour ───────────
function VerdictBadge({ status }) {
  const s = (status || '').toUpperCase();

  if (s === 'EXECUTED' || s === 'APPROVED') {
    return (
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
        {s}
      </span>
    );
  }
  if (s === 'BLOCKED' || s === 'BLOCKED_SUPERSEDED_SOURCE' || s === 'BLOCKED_STALE_FACT' || s === 'BLOCKED_DECISION_INVALIDATED') {
    return (
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
        {s}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
      {s || 'UNKNOWN'}
    </span>
  );
}

// ─── Decision status indicator ────────────────────────────────────────────────
function DecisionStatus({ status }) {
  if (!status) return <span className="text-slate-600 font-mono text-[10px]">—</span>;
  const s = status.toUpperCase();
  const colour =
    s === 'VALID' ? 'text-teal-400' :
    s === 'REPLACED_ARCHIVED' ? 'text-slate-500' :
    s === 'INVALIDATED_NEEDS_REVALIDATION' ? 'text-amber-400' :
    'text-slate-400';
  return <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${colour}`}>{s}</span>;
}

// ─── Timestamp formatter ──────────────────────────────────────────────────────
function formatTs(ts) {
  if (!ts) return '—';
  try {
    // FalkorDB timestamps are Unix milliseconds
    return new Date(Number(ts)).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  } catch {
    return String(ts);
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ simulated }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
      <Database className="w-8 h-8 opacity-30" />
      <p className="text-xs font-mono uppercase tracking-wider">
        {simulated ? 'No agent actions recorded in simulation mode' : 'No agent actions found'}
      </p>
      <p className="text-[11px] font-sans text-slate-600 max-w-xs text-center">
        Run the 4-Act demo from the Console tab to generate audit entries via the MCP gate.
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AuditPage() {
  const [entries, setEntries]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [latencyMs, setLatencyMs] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [simulated, setSimulated] = useState(false);
  const [limit, setLimit]         = useState(50);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/audit?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntries(data.entries || []);
      setTotal(data.total ?? (data.entries || []).length);
      setLatencyMs(data.latency_ms ?? null);
      setSimulated(!!data.simulated);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">

      {/* ── Header bar ── */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-300 dark:border-white/10">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white font-mono">
            Agent Action Audit Log
          </h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-sans">
            Every MCP gate decision — approved writes and blocked attempts — recorded in FalkorDB.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Total count */}
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {total} total
          </span>

          {/* Latency */}
          {latencyMs !== null && (
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {latencyMs.toFixed(2)}ms
            </span>
          )}

          {/* Limit selector */}
          <select
            value={limit}
            onChange={(e) => { playClick(); setLimit(Number(e.target.value)); }}
            className="text-[10px] font-mono bg-white/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded px-2 py-1 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {[25, 50, 100, 250, 500].map(n => (
              <option key={n} value={n}>{n} rows</option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={() => { playClick(); fetchAudit(); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-mono">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Failed to fetch audit log: {error}</span>
        </div>
      )}

      {/* ── Last fetch timestamp ── */}
      {lastFetch && !error && (
        <div className="flex-shrink-0 text-[10px] font-mono text-slate-500 dark:text-slate-600 tabular-nums">
          Last fetched: {lastFetch.toISOString().replace('T', ' ').slice(0, 19)} UTC
        </div>
      )}

      {/* ── Audit table ── */}
      <div className="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
        {entries.length === 0 && !loading ? (
          <EmptyState simulated={simulated} />
        ) : (
          <div className="bezel-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1.4fr_0.9fr_0.9fr_1.5fr] gap-x-3 px-3 py-2 border-b border-white/10 bg-white/[0.02]">
              {['Action ID', 'Target File', 'Verdict', 'Decision', 'Executed At'].map(h => (
                <span key={h} className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">
                  {h}
                </span>
              ))}
            </div>

            {/* Table rows */}
            {loading && entries.length === 0 ? (
              <div className="px-3 py-6 text-center text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                Loading...
              </div>
            ) : (
              entries.map((entry, idx) => (
                <div
                  key={entry.action_id || idx}
                  className="grid grid-cols-[1fr_1.4fr_0.9fr_0.9fr_1.5fr] gap-x-3 px-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.025] transition-colors"
                >
                  {/* Action ID */}
                  <span className="text-[10px] font-mono text-slate-400 truncate" title={entry.action_id}>
                    {entry.action_id || '—'}
                  </span>

                  {/* Target file */}
                  <span className="text-[10px] font-mono text-slate-300 truncate flex items-center gap-1" title={entry.target_file}>
                    {entry.target_file ? (
                      <>
                        <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                        {entry.target_file}
                      </>
                    ) : '—'}
                  </span>

                  {/* Verdict */}
                  <VerdictBadge status={entry.status} />

                  {/* Decision */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] font-mono text-slate-300 truncate" title={entry.decision_id}>
                      {entry.decision_id || '—'}
                    </span>
                    <DecisionStatus status={entry.decision_status} />
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] font-mono text-slate-500 tabular-nums truncate">
                    {formatTs(entry.executed_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Footer telemetry ── */}
      {entries.length > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between pt-1 border-t border-slate-300 dark:border-white/10">
          <span className="text-[10px] font-mono text-slate-500 tabular-nums">
            Showing {entries.length} of {total} entries
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <Activity className="w-3 h-3" />
            <span>
              {entries.filter(e => (e.status || '').toUpperCase() === 'EXECUTED').length} approved
            </span>
            <span className="text-slate-700">·</span>
            <span>
              {entries.filter(e => (e.status || '').toUpperCase().startsWith('BLOCKED')).length} blocked
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
