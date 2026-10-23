/**
 * DevConsolePage.jsx — CAVDAX Internal Developer Diagnostic Console
 *
 * Accessible via /dev (URL-only — no nav tab).
 * Calls GET /api/dev/tier-check and renders server tier, FalkorDB status,
 * session counts, rate limit config, and process uptime.
 *
 * Design System compliance (docs/UI_DESIGN_SYSTEM.md):
 *  - NO emojis — Lucide icons only
 *  - NO brackets around status tags
 *  - NO colored pulsing orbs — monospace text indicators
 *  - NO eyebrow pills above headings
 *  - Double-bezel card geometry
 *  - font-mono for all metric values
 *  - Zero-overflow containment (h-full flex flex-col)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal, RefreshCw, Database, Activity, Cpu, Lock,
  Server, Layers, Clock
} from 'lucide-react';
import { playClick } from '../utils/soundFx';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─── Connection status badge — monospace, no brackets ────────────────────────
function ConnectionBadge({ connected }) {
  return connected
    ? <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">LIVE</span>
    : <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">SIMULATION</span>;
}

// ─── Tier badge ───────────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  const t = (tier || 'free').toUpperCase();
  const colour =
    t === 'ENTERPRISE' ? 'text-amber-400' :
    t === 'PRO'        ? 'text-teal-400'  :
    'text-slate-400';
  return <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${colour}`}>{t}</span>;
}

// ─── metrics row ────────────────────────────────────────────────────────────
function TelRow({ label, value, mono = true }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[11px] text-slate-400 shrink-0">{label}</span>
      <span className={`text-[11px] text-slate-200 text-right ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-slate-600">—</span>}
      </span>
    </div>
  );
}

// ─── Section card (double-bezel geometry) ────────────────────────────────────
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-slate-500 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Feature list ─────────────────────────────────────────────────────────────
function FeatureList({ features }) {
  if (!features?.length) return null;
  return (
    <ul className="flex flex-col gap-0.5 mt-1">
      {features.map(f => (
        <li key={f} className="flex items-center gap-1.5">
          <Activity className="h-2.5 w-2.5 text-slate-600 shrink-0" />
          <span className="text-[10px] font-mono text-slate-400">{f}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Fallback tier state (shown when /api/dev/tier-check is unreachable) ─────
// Roadmap §6.2: "Render default Tier 1 / Developer state with sample memory
// metrics and mock health check table" — never show a raw error banner.
const FALLBACK_DATA = {
  _offline: true,
  tier: 'free',
  tier_meta: {
    label: 'Free',
    description: 'Local FalkorDB only. Rate limit: 100 req/min. MCP stdio transport.',
    features: ['stdio MCP', 'ADR ingestion', 'local FalkorDB'],
    rate_limit_per_min: 100,
    mcp_rate_limit_per_min: 30
  },
  falkordb: {
    connected: false,
    host: 'localhost',
    port: 6379,
    graph_name: 'cavdax_core_graph',
    mode: 'simulation'
  },
  sessions: { mcp_active: 0, sse_clients: 0, mcp_ttl_ms: 300000 },
  server: {
    uptime_seconds: null,
    node_version: null,
    port: 3000,
    auth_enabled: false
  }
};

// ─── Offline notice banner ────────────────────────────────────────────────────
function OfflineNoticeBanner({ onRetry, loading }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4 px-3 py-2.5 rounded-lg
                    border border-amber-500/20 bg-amber-500/5">
      <div className="flex items-start gap-2 min-w-0">
        <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-[11px] font-mono font-semibold text-amber-400 uppercase tracking-wider">
            Offline Demonstration Mode
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
            Backend unreachable — displaying Tier 1 reference state. Live metrics unavailable.
          </p>
        </div>
      </div>
      <button
        onClick={onRetry}
        disabled={loading}
        className="shrink-0 text-[10px] font-mono text-amber-400/80 hover:text-amber-300
                   underline underline-offset-2 transition-colors disabled:opacity-40"
      >
        Retry Sync
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DevConsolePage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchTierCheck = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/dev/tier-check`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setIsOffline(false);
      setLastFetch(new Date().toISOString());
    } catch {
      // Graceful fallback — never expose raw error to UI (roadmap §6.2)
      setData(FALLBACK_DATA);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTierCheck();
  }, [fetchTierCheck]);

  const handleRefresh = () => {
    playClick?.();
    fetchTierCheck();
  };

  // ─── Uptime formatter ─────────────────────────────────────────────────────
  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden bg-[var(--bg-base,#0d0d0f)] text-slate-200">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-2.5">
          <Terminal className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-semibold tracking-tight text-slate-100">Dev Console</span>
          <span className="text-[10px] font-mono text-slate-600 ml-1">/dev</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8
                     bg-white/[0.04] hover:bg-white/[0.07] transition-colors duration-100
                     text-[11px] font-medium text-slate-300 disabled:opacity-40"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">

        {/* Offline notice — non-alarmist amber banner, not a red error box */}
        {isOffline && !loading && (
          <OfflineNoticeBanner onRetry={handleRefresh} loading={loading} />
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        )}

        {/* Data grid */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Tier */}
            <SectionCard icon={Layers} title="Tier">
              <div className="flex items-center gap-2 mb-1">
                <TierBadge tier={data.tier} />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-1">
                {data.tier_meta?.description}
              </p>
              <FeatureList features={data.tier_meta?.features} />
            </SectionCard>

            {/* FalkorDB */}
            <SectionCard icon={Database} title="FalkorDB">
              <TelRow label="Status"    value={<ConnectionBadge connected={data.falkordb?.connected} />} mono={false} />
              <TelRow label="Mode"      value={data.falkordb?.mode?.toUpperCase()} />
              <TelRow label="Host"      value={data.falkordb?.host} />
              <TelRow label="Port"      value={data.falkordb?.port} />
              <TelRow label="Graph"     value={data.falkordb?.graph_name} />
            </SectionCard>

            {/* Sessions */}
            <SectionCard icon={Activity} title="Sessions">
              <TelRow label="MCP SSE sessions" value={data.sessions?.mcp_active ?? 0} />
              <TelRow label="SSE HUD clients"  value={data.sessions?.sse_clients ?? 0} />
              <TelRow label="Session TTL"      value={`${(data.sessions?.mcp_ttl_ms ?? 0) / 1000}s`} />
            </SectionCard>

            {/* Rate Limits */}
            <SectionCard icon={Cpu} title="Rate Limits">
              <TelRow
                label="API limit (req/min)"
                value={data.tier_meta?.rate_limit_per_min === -1 ? 'UNLIMITED' : data.tier_meta?.rate_limit_per_min}
              />
              <TelRow
                label="MCP limit (req/min)"
                value={data.tier_meta?.mcp_rate_limit_per_min === -1 ? 'UNLIMITED' : data.tier_meta?.mcp_rate_limit_per_min}
              />
            </SectionCard>

            {/* Server */}
            <SectionCard icon={Server} title="Server">
              <TelRow label="Uptime"     value={formatUptime(data.server?.uptime_seconds)} />
              <TelRow label="Port"       value={data.server?.port} />
              <TelRow label="Node.js"    value={data.server?.node_version} />
              <TelRow label="Auth"       value={data.server?.auth_enabled ? 'ENABLED' : 'DISABLED'} />
            </SectionCard>

            {/* Auth */}
            <SectionCard icon={Lock} title="Auth">
              <TelRow
                label="MCP_API_TOKEN"
                value={data.server?.auth_enabled ? 'SET' : 'NOT SET'}
              />
              <TelRow label="CAVDAX_TIER" value={(data.tier || 'free').toUpperCase()} />
              {lastFetch && (
                <TelRow
                  label="Last fetched"
                  value={new Date(lastFetch).toLocaleTimeString()}
                />
              )}
            </SectionCard>

          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-2.5 border-t border-white/5 shrink-0">
        <span className="text-[10px] font-mono text-slate-700">
          /dev — internal diagnostic console — not linked in nav
        </span>
      </div>

    </div>
  );
}
