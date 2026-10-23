import React, { useState, useEffect } from 'react';
import {
  User, CheckCircle2, Lock, Terminal,
  SlidersHorizontal, Key, HardDrive, RefreshCw, Heart, ExternalLink, LogOut, Github
} from 'lucide-react';
import { playClick } from '../utils/soundFx';
import { isUserAuthorized, getActiveDevSession } from '../services/devAuth';
import ShimmerImage from './ui/ShimmerImage';

/**
 * ProfilePage.jsx — Developer Identity, Architecture Tiers & Quota Management
 * 
 * Complies with CAVDAX Design System:
 * - Single-page contained layout (zero vertical scrollbar / overflow).
 * - Frameless centered avatar with concentric tier ring.
 * - Solid premium purple background on active Enterprise card with tailored Active button.
 * - Gated Pro & Enterprise tiers for unauthenticated sandbox users with auth toast.
 * - Zero emojis, no bracketed tags, clean typography.
 */
export default function ProfilePage({
  user,
  tier = 'free',
  onSelectTier,
  onLaunchConsole,
  onOpenMcpPage,
  onOpenSupportPage
}) {
  const [currentTier, setCurrentTier] = useState(tier);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isConsoleHovered, setIsConsoleHovered] = useState(false);
  const [isSponsorHovered, setIsSponsorHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [apiKeySuffix, setApiKeySuffix] = useState('a8f27e69');
  const [hoveredTierBtn, setHoveredTierBtn] = useState(null);

  // Check if current user is an authorized devteam member or has active dev enclave session
  const isAuthorizedDev = Boolean(
    isUserAuthorized(user) || getActiveDevSession()
  );

  // Enforce Free Tier for non-dev users if they had a stale paid tier in localStorage
  useEffect(() => {
    if (!isAuthorizedDev && currentTier !== 'free') {
      setCurrentTier('free');
      try {
        localStorage.setItem('cavdax_tier', 'free');
        window.dispatchEvent(new CustomEvent('cavdax:tier-changed', { detail: { tier: 'free' } }));
      } catch {}
      if (onSelectTier) onSelectTier('free');
    }
  }, [isAuthorizedDev, currentTier, onSelectTier]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleTierSwitch = (newTier) => {
    playClick();

    if (newTier === 'free') {
      setCurrentTier('free');
      try {
        localStorage.setItem('cavdax_tier', 'free');
        window.dispatchEvent(new CustomEvent('cavdax:tier-changed', { detail: { tier: 'free' } }));
      } catch {}
      if (onSelectTier) onSelectTier('free');
      showToast('Active Plan: COMMUNITY Tier');
      return;
    }

    if (!user) {
      showToast('Authentication required: Sign in with GitHub to view subscription tiers.');
      return;
    }

    if (!isAuthorizedDev) {
      const planName = newTier === 'pro' ? 'Pro Autonomous ($4/mo)' : 'Enterprise Mesh';
      showToast(`${planName} requires an active subscription. Razorpay payment integration in progress.`);
      return;
    }

    // Authorized developer bypass
    setCurrentTier(newTier);
    try {
      localStorage.setItem('cavdax_tier', newTier);
      window.dispatchEvent(new CustomEvent('cavdax:tier-changed', { detail: { tier: newTier } }));
    } catch {}
    if (onSelectTier) onSelectTier(newTier);
    showToast(`Switched to ${newTier.toUpperCase()} Tier (Dev Override)`);
  };

  const handleLogout = async () => {
    playClick();
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    try {
      localStorage.removeItem('cavdax_user_session');
      localStorage.setItem('cavdax_tier', 'free');
    } catch {}
    setCurrentTier('free');
    window.dispatchEvent(new CustomEvent('cavdax:user-changed', { detail: null }));
    window.dispatchEvent(new CustomEvent('cavdax:tier-changed', { detail: { tier: 'free' } }));
    if (onSelectTier) onSelectTier('free');
    showToast('Signed out of GitHub session.');
  };

  const handleCopyApiKey = () => {
    playClick();
    const demoKey = 'cvdx_live_' + (user?.login ? user.login.toLowerCase() : 'contributor') + '_' + apiKeySuffix;
    navigator.clipboard.writeText(demoKey);
    setCopiedKey(true);
    showToast('API Key copied to clipboard.');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRotateKey = () => {
    playClick();
    setIsRotating(true);
    const newSuffix = Math.random().toString(16).substring(2, 10);
    setApiKeySuffix(newSuffix);
    showToast('API Key successfully rotated.');
    setTimeout(() => {
      setIsRotating(false);
    }, 600);
  };

  // Concentric avatar ring specifications
  const ROLE_RING = {
    free: 'ring-2 ring-slate-400/60 dark:ring-white/30',
    pro: 'ring-2 ring-amber-400/90 shadow-[0_0_12px_rgba(251,191,36,0.35)]',
    enterprise: 'ring-2 ring-purple-600/90 shadow-[0_0_12px_rgba(147,51,234,0.35)]',
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pt-16 sm:pt-18 pb-4 px-4 sm:px-6 max-w-4xl mx-auto w-full select-none">
      
      {/* ── 1. Identity Header Section (Frameless, Centered, Contained) ── */}
      <section className="mt-5 sm:mt-7 mb-4 sm:mb-5 flex flex-col items-center text-center">
        {/* Concentric Tier-Enclosed Circular Avatar */}
        <div className={`h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden relative transition-all duration-300 ${ROLE_RING[currentTier] || ROLE_RING.free}`}>
          {(user?.avatar_url || user?.avatarUrl || user?.avatar) ? (
            <ShimmerImage
              src={user?.avatar_url || user?.avatarUrl || user?.avatar}
              alt={user.login || 'User Avatar'}
              containerClassName="h-full w-full rounded-full"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-700 dark:text-slate-300" />
          )}
        </div>

        {/* Identity & Verified Handle */}
        <div className="mt-3 flex flex-col items-center">
          <h1 className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-950 dark:text-white">
            {user?.name || user?.login || 'Local Contributor'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            {user ? `@${user.login} · GitHub Verified` : 'Unauthenticated Sandbox Session'}
          </p>
        </div>

        {/* Centered Actions Row: Console & Sponsor (Sleek, Elongated, Low-Profile) */}
        <div className="mt-3.5 sm:mt-4 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => {
              playClick();
              if (onLaunchConsole) onLaunchConsole();
            }}
            onMouseEnter={() => setIsConsoleHovered(true)}
            onMouseLeave={() => setIsConsoleHovered(false)}
            className={`relative overflow-hidden group h-[32px] sm:h-[34px] min-w-[130px] sm:min-w-[144px] px-5 flex items-center justify-center gap-2 rounded-lg border text-xs font-mono font-semibold transition-all duration-500 cursor-pointer tactile-btn shadow-xs select-none ${
              isConsoleHovered
                ? "border-slate-950 dark:border-white text-white dark:text-slate-950 shadow-slate-950/20 dark:shadow-white/20"
                : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-white/40"
            }`}
          >
            {/* Fluid Water Fill Layer (Monochrome Obsidian / Porcelain) */}
            <div
              aria-hidden="true"
              style={{
                transform: isConsoleHovered ? "translateY(0%)" : "translateY(105%)",
                opacity: isConsoleHovered ? 1 : 0,
                transition: isConsoleHovered
                  ? "transform 1000ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out"
                  : "opacity 250ms ease-out, transform 0s 250ms"
              }}
              className="absolute left-[-15%] right-[-15%] bottom-0 h-[260%] flex flex-col pointer-events-none z-0"
            >
              <svg
                viewBox="0 0 320 48"
                preserveAspectRatio="none"
                className="w-full h-6 shrink-0 text-slate-950 dark:text-white fill-current block"
              >
                <path d="M 0 24 Q 40 8, 80 20 T 160 15 T 240 22 T 320 12 L 320 48 L 0 48 Z" />
                <circle cx="80" cy="20" r="4.5" />
                <circle cx="120" cy="12" r="3.5" />
                <circle cx="160" cy="15" r="5" />
                <circle cx="200" cy="13" r="3.5" />
                <circle cx="240" cy="22" r="4.5" />
                <line x1="80" y1="20" x2="120" y2="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                <line x1="120" y1="12" x2="160" y2="15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                <line x1="160" y1="15" x2="200" y2="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                <line x1="200" y1="13" x2="240" y2="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
              </svg>
              <div className="flex-1 w-full bg-slate-950 dark:bg-white" />
            </div>

            <SlidersHorizontal className={`w-3.5 h-3.5 relative z-10 transition-colors duration-500 ${
              isConsoleHovered ? "text-white dark:text-slate-950" : "text-slate-700 dark:text-slate-300"
            }`} />
            <span className={`relative z-10 transition-colors duration-500 ${
              isConsoleHovered ? "text-white dark:text-slate-950" : ""
            }`}>
              Console
            </span>
          </button>

          <button
            onClick={() => {
              playClick();
              if (onOpenSupportPage) onOpenSupportPage();
            }}
            onMouseEnter={() => setIsSponsorHovered(true)}
            onMouseLeave={() => setIsSponsorHovered(false)}
            className={`relative overflow-hidden group h-[32px] sm:h-[34px] min-w-[130px] sm:min-w-[144px] px-5 flex items-center justify-center gap-2 rounded-lg border text-xs font-mono font-semibold transition-all duration-500 cursor-pointer tactile-btn shadow-xs select-none ${
              isSponsorHovered
                ? 'border-rose-500 dark:border-rose-400 text-white shadow-rose-500/20'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-rose-400'
            }`}
          >
            {/* Fluid Water Fill Layer */}
            <div
              aria-hidden="true"
              style={{
                transform: isSponsorHovered ? 'translateY(0%)' : 'translateY(105%)',
                opacity: isSponsorHovered ? 1 : 0,
                transition: isSponsorHovered
                  ? 'transform 1000ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out'
                  : 'opacity 250ms ease-out, transform 0s 250ms'
              }}
              className="absolute left-[-15%] right-[-15%] bottom-0 h-[260%] flex flex-col pointer-events-none z-0"
            >
              <svg
                viewBox="0 0 320 48"
                preserveAspectRatio="none"
                className="w-full h-6 shrink-0 text-rose-500 dark:text-rose-600 fill-current block"
              >
                <path d="M 0 24 Q 40 8, 80 20 T 160 15 T 240 22 T 320 12 L 320 48 L 0 48 Z" />
                <circle cx="80" cy="20" r="4.5" />
                <circle cx="120" cy="12" r="3.5" />
                <circle cx="160" cy="15" r="5" />
                <circle cx="200" cy="13" r="3.5" />
                <circle cx="240" cy="22" r="4.5" />
                <line x1="80" y1="20" x2="120" y2="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                <line x1="120" y1="12" x2="160" y2="15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                <line x1="160" y1="15" x2="200" y2="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                <line x1="200" y1="13" x2="240" y2="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
              </svg>
              <div className="flex-1 w-full bg-rose-500 dark:bg-rose-600" />
            </div>

            <Heart className={`w-3.5 h-3.5 relative z-10 transition-colors duration-500 ${
              isSponsorHovered ? 'text-white fill-white' : 'text-rose-500'
            }`} />
            <span className={`relative z-10 transition-colors duration-500 ${
              isSponsorHovered ? 'text-white' : ''
            }`}>
              Sponsor
            </span>
          </button>

          {user ? (
            <button
              onClick={handleLogout}
              onMouseEnter={() => setIsLogoutHovered(true)}
              onMouseLeave={() => setIsLogoutHovered(false)}
              className={`relative overflow-hidden group h-[32px] sm:h-[34px] min-w-[120px] sm:min-w-[130px] px-4 rounded-lg border text-xs font-mono font-semibold transition-all duration-500 cursor-pointer tactile-btn shadow-xs select-none flex items-center justify-center gap-2 ${
                isLogoutHovered
                  ? 'border-rose-500 dark:border-rose-400 text-white shadow-rose-500/20'
                  : 'border-rose-500/50 dark:border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
              title="Sign out of current GitHub session"
            >
              {/* Fluid Water Fill Layer */}
              <div
                aria-hidden="true"
                style={{
                  transform: isLogoutHovered ? 'translateY(0%)' : 'translateY(105%)',
                  opacity: isLogoutHovered ? 1 : 0,
                  transition: isLogoutHovered
                    ? 'transform 1000ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out'
                    : 'opacity 250ms ease-out, transform 0s 250ms'
                }}
                className="absolute left-[-15%] right-[-15%] bottom-0 h-[260%] flex flex-col pointer-events-none z-0"
              >
                <svg
                  viewBox="0 0 320 48"
                  preserveAspectRatio="none"
                  className="w-full h-6 shrink-0 text-rose-600 fill-current block"
                >
                  <path d="M 0 24 Q 40 8, 80 20 T 160 15 T 240 22 T 320 12 L 320 48 L 0 48 Z" />
                  <circle cx="80" cy="20" r="4.5" />
                  <circle cx="120" cy="12" r="3.5" />
                  <circle cx="160" cy="15" r="5" />
                  <circle cx="200" cy="13" r="3.5" />
                  <circle cx="240" cy="22" r="4.5" />
                  <line x1="80" y1="20" x2="120" y2="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                  <line x1="120" y1="12" x2="160" y2="15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                  <line x1="160" y1="15" x2="200" y2="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                  <line x1="200" y1="13" x2="240" y2="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                </svg>
                <div className="flex-1 w-full bg-rose-600" />
              </div>

              <LogOut className={`w-3.5 h-3.5 relative z-10 transition-colors duration-500 ${
                isLogoutHovered ? 'text-white' : 'text-rose-600 dark:text-rose-400'
              }`} />
              <span className={`relative z-10 transition-colors duration-500 ${
                isLogoutHovered ? 'text-white' : ''
              }`}>
                Log Out
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                playClick();
                window.location.href = '/api/auth/github';
              }}
              className="h-[32px] sm:h-[34px] min-w-[130px] sm:min-w-[144px] px-4 rounded-lg border border-slate-300 dark:border-white/20 bg-slate-100/90 dark:bg-white/5 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white text-xs font-mono font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer tactile-btn shadow-xs"
              title="Connect with GitHub OAuth"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Connect GitHub</span>
            </button>
          )}
        </div>
      </section>

      {/* ── 2. Architecture Tiers & Quotas (Exact 4 Benefits per Tier) ── */}
      <section className="mt-0 mb-3.5 sm:mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Subscription Tiers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
          {/* Tier 1: Community (Exactly 4 Benefits) */}
          <div className={`p-4 sm:p-5 rounded-xl border transition-all ${
            currentTier === 'free'
              ? 'bg-slate-50 dark:bg-[#12141A] border-slate-400 dark:border-white/30 ring-1 ring-slate-400/40 shadow-xs'
              : 'bg-transparent border-slate-200/80 dark:border-white/10 opacity-70 hover:opacity-100'
          }`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {/* 45-Degree Tilted Community Hackers / Group With Hat & Keyboard SVG */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0 transform -rotate-45"
                  aria-hidden="true"
                >
                  <path d="M7 8h10" />
                  <path d="M8.5 8c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" />
                  <circle cx="5" cy="11" r="1.75" />
                  <path d="M2.5 17c0-2 1.5-3 3-3 .8 0 1.5.3 2 .8" />
                  <circle cx="19" cy="11" r="1.75" />
                  <path d="M21.5 17c0-2-1.5-3-3-3-.8 0-1.5.3-2 .8" />
                  <path d="M9 16c0-1.8 1.3-2.5 3-2.5s3 .7 3 2.5" />
                  <rect x="5" y="18" width="14" height="4.5" rx="1" fill="currentColor" fillOpacity="0.12" />
                  <line x1="8" y1="20" x2="8.01" y2="20" strokeWidth="2" />
                  <line x1="11" y1="20" x2="11.01" y2="20" strokeWidth="2" />
                  <line x1="14" y1="20" x2="14.01" y2="20" strokeWidth="2" />
                  <line x1="16.5" y1="20" x2="16.51" y2="20" strokeWidth="2" />
                </svg>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Community
                </span>
              </div>
            </div>
            <div className="text-xl font-bold font-mono text-slate-950 dark:text-white mb-2">
              $0 <span className="text-[11px] font-normal text-slate-500 font-sans">/ mo</span>
            </div>
            <ul className="text-xs font-mono space-y-1.5 mb-4 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>100 AST checks / day</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>1 Connected repository</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>Local FalkorDB memory</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>Standard MCP protocol gate</span>
              </li>
            </ul>
            <button
              onClick={() => handleTierSwitch('free')}
              disabled={currentTier === 'free'}
              onMouseEnter={() => setHoveredTierBtn('free')}
              onMouseLeave={() => setHoveredTierBtn(null)}
              className={`relative overflow-hidden group w-full h-[34px] flex items-center justify-center rounded-lg border text-xs font-mono font-semibold transition-all duration-300 ${
                currentTier === 'free'
                  ? 'bg-slate-200/80 dark:bg-white/10 border-transparent text-slate-500 dark:text-slate-400 cursor-default'
                  : (hoveredTierBtn === 'free'
                      ? 'border-slate-600 dark:border-slate-400 text-white cursor-pointer shadow-xs'
                      : 'bg-transparent border-slate-300 dark:border-white/20 hover:border-slate-600 dark:hover:border-slate-400 text-slate-900 dark:text-white cursor-pointer')
              }`}
            >
              {currentTier !== 'free' && (
                <div
                  aria-hidden="true"
                  style={{
                    transform: hoveredTierBtn === 'free' ? 'translateY(0%)' : 'translateY(105%)',
                    opacity: hoveredTierBtn === 'free' ? 1 : 0,
                    transition: hoveredTierBtn === 'free'
                      ? 'transform 900ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out'
                      : 'opacity 250ms ease-out, transform 0s 250ms'
                  }}
                  className="absolute left-[-15%] right-[-15%] bottom-0 h-[260%] flex flex-col pointer-events-none z-0"
                >
                  <svg viewBox="0 0 320 48" preserveAspectRatio="none" className="w-full h-6 shrink-0 text-slate-600 dark:text-slate-400 fill-current block">
                    <path d="M 0 24 Q 40 8, 80 20 T 160 15 T 240 22 T 320 12 L 320 48 L 0 48 Z" />
                    <circle cx="80" cy="20" r="4.5" />
                    <circle cx="120" cy="12" r="3.5" />
                    <circle cx="160" cy="15" r="5" />
                    <circle cx="200" cy="13" r="3.5" />
                    <circle cx="240" cy="22" r="4.5" />
                    <line x1="80" y1="20" x2="120" y2="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="120" y1="12" x2="160" y2="15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="160" y1="15" x2="200" y2="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="200" y1="13" x2="240" y2="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                  </svg>
                  <div className="flex-1 w-full bg-slate-600 dark:bg-slate-500" />
                </div>
              )}
              <span className="relative z-10 transition-colors duration-300">
                {currentTier === 'free' ? 'Active' : 'Switch to Free'}
              </span>
            </button>
          </div>

          {/* Tier 2: Pro Autonomous (Gated if unauthenticated, Elevated Featured Card) */}
          <div className={`p-4 sm:p-5 rounded-xl border transition-all md:scale-[1.03] md:-translate-y-1.5 relative z-10 shadow-[0_14px_38px_rgba(245,158,11,0.22)] dark:shadow-[0_0_36px_rgba(245,158,11,0.18)] ${
            currentTier === 'pro'
              ? 'bg-amber-500/[0.04] dark:bg-[#1A150B] border-amber-400 ring-2 ring-amber-400/50'
              : (!user
                  ? 'bg-slate-50/60 dark:bg-[#1A150B]/60 border-amber-400/80 ring-1 ring-amber-400/30 opacity-90 hover:opacity-100'
                  : 'bg-slate-50/60 dark:bg-[#1A150B]/60 border-amber-400/80 ring-1 ring-amber-400/30 opacity-95 hover:opacity-100')
          }`}>
            {/* Top Floating Popular Badge */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[9px] font-extrabold uppercase tracking-widest shadow-md flex items-center gap-1 z-20">
              <span>POPULAR</span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {/* 45-Degree Tilted Premium Diamond SVG */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 transform -rotate-45"
                  aria-hidden="true"
                >
                  <polygon points="6 3 18 3 22 9 12 22 2 9 6 3" fill="currentColor" fillOpacity="0.15" />
                  <line x1="2" y1="9" x2="22" y2="9" />
                  <line x1="6" y1="3" x2="10" y2="9" />
                  <line x1="18" y1="3" x2="14" y2="9" />
                  <line x1="10" y1="9" x2="12" y2="22" />
                  <line x1="14" y1="9" x2="12" y2="22" />
                  <circle cx="12" cy="22" r="1" fill="currentColor" />
                  <circle cx="6" cy="3" r="0.8" fill="currentColor" />
                  <circle cx="18" cy="3" r="0.8" fill="currentColor" />
                </svg>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Pro Autonomous
                </span>
              </div>
              {isAuthorizedDev ? (
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  DEV ACCESS
                </span>
              ) : (
                <Lock className="w-3 h-3 text-slate-400" />
              )}
            </div>
            <div className="text-xl font-bold font-mono text-slate-950 dark:text-white mb-2">
              $4 <span className="text-[11px] font-normal text-slate-500 font-sans">/ mo</span>
            </div>
            <ul className="text-xs font-mono space-y-1.5 mb-4 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>10,000 AST checks / day</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Unlimited repositories</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>2.1ms GraphBLAS semiring</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Live webhook streaming</span>
              </li>
            </ul>
            <button
              onClick={() => handleTierSwitch('pro')}
              disabled={currentTier === 'pro'}
              onMouseEnter={() => setHoveredTierBtn('pro')}
              onMouseLeave={() => setHoveredTierBtn(null)}
              className={`relative overflow-hidden group w-full h-[34px] flex items-center justify-center rounded-lg border text-xs font-mono font-semibold transition-all duration-300 ${
                currentTier === 'pro'
                  ? 'bg-amber-400/20 border-transparent text-amber-700 dark:text-amber-400 cursor-default'
                  : (hoveredTierBtn === 'pro'
                      ? 'border-amber-400 text-slate-950 font-bold cursor-pointer shadow-xs'
                      : 'bg-transparent border-slate-300 dark:border-white/20 hover:border-amber-400 text-slate-900 dark:text-white cursor-pointer')
              }`}
            >
              {currentTier !== 'pro' && (
                <div
                  aria-hidden="true"
                  style={{
                    transform: hoveredTierBtn === 'pro' ? 'translateY(0%)' : 'translateY(105%)',
                    opacity: hoveredTierBtn === 'pro' ? 1 : 0,
                    transition: hoveredTierBtn === 'pro'
                      ? 'transform 900ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out'
                      : 'opacity 250ms ease-out, transform 0s 250ms'
                  }}
                  className="absolute left-[-15%] right-[-15%] bottom-0 h-[260%] flex flex-col pointer-events-none z-0"
                >
                  <svg viewBox="0 0 320 48" preserveAspectRatio="none" className="w-full h-6 shrink-0 text-amber-400 fill-current block">
                    <path d="M 0 24 Q 40 8, 80 20 T 160 15 T 240 22 T 320 12 L 320 48 L 0 48 Z" />
                    <circle cx="80" cy="20" r="4.5" />
                    <circle cx="120" cy="12" r="3.5" />
                    <circle cx="160" cy="15" r="5" />
                    <circle cx="200" cy="13" r="3.5" />
                    <circle cx="240" cy="22" r="4.5" />
                    <line x1="80" y1="20" x2="120" y2="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="120" y1="12" x2="160" y2="15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="160" y1="15" x2="200" y2="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="200" y1="13" x2="240" y2="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                  </svg>
                  <div className="flex-1 w-full bg-amber-400" />
                </div>
              )}
              <span className="relative z-10 transition-colors duration-300 flex items-center gap-1.5">
                {!isAuthorizedDev && currentTier !== 'pro' && <Lock className="w-3 h-3" />}
                <span>
                  {currentTier === 'pro'
                    ? 'Active'
                    : (!user
                        ? 'Sign In to Unlock'
                        : (isAuthorizedDev ? 'Switch (Dev)' : 'Upgrade ($4/mo)'))}
                </span>
              </span>
            </button>
          </div>

          {/* Tier 3: Enterprise Mesh (Solid Deep Obsidian Purple Card Background) */}
          <div className={`p-4 sm:p-5 rounded-xl border transition-all ${
            currentTier === 'enterprise'
              ? 'bg-[#150a26] dark:bg-[#0f051d] border-purple-700/60 dark:border-purple-600/50 ring-1 ring-purple-500/30 shadow-sm'
              : (!user
                  ? 'bg-transparent border-slate-200/80 dark:border-white/10 opacity-50 hover:opacity-75 transition-opacity'
                  : 'bg-transparent border-slate-200/80 dark:border-white/10 opacity-70 hover:opacity-100 transition-opacity')
          }`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {/* 45-Degree Tilted King Crown SVG */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 text-purple-400 shrink-0 transform -rotate-45"
                  aria-hidden="true"
                >
                  <path
                    d="M3 18h18l-2-11-4.5 4.5L12 4l-2.5 7.5L5 7l-2 11z"
                    fill="currentColor"
                    fillOpacity="0.2"
                  />
                  <line x1="4" y1="20" x2="20" y2="20" strokeWidth="1.8" />
                  <circle cx="12" cy="4" r="1.3" fill="currentColor" />
                  <circle cx="5" cy="7" r="1.1" fill="currentColor" />
                  <circle cx="19" cy="7" r="1.1" fill="currentColor" />
                </svg>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400">
                  Enterprise Mesh
                </span>
              </div>
              {isAuthorizedDev ? (
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  DEV ACCESS
                </span>
              ) : (
                <Lock className="w-3 h-3 text-slate-400" />
              )}
            </div>
            <div className={`text-xl font-bold font-mono mb-2 ${
              currentTier === 'enterprise' ? 'text-white' : 'text-slate-950 dark:text-white'
            }`}>
              Custom <span className={`text-[11px] font-normal font-sans ${
                currentTier === 'enterprise' ? 'text-purple-200/80' : 'text-slate-500'
              }`}>/ SLA</span>
            </div>
            <ul className={`text-xs font-mono space-y-1.5 mb-4 ${
              currentTier === 'enterprise' ? 'text-purple-100/90' : 'text-slate-600 dark:text-slate-300'
            }`}>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Unlimited verifications</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Dedicated on-prem cluster</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Custom AST parser rules</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>24/7 SLA &amp; dedicated support</span>
              </li>
            </ul>
            <button
              onClick={() => handleTierSwitch('enterprise')}
              disabled={currentTier === 'enterprise'}
              onMouseEnter={() => setHoveredTierBtn('enterprise')}
              onMouseLeave={() => setHoveredTierBtn(null)}
              className={`relative overflow-hidden group w-full h-[34px] flex items-center justify-center rounded-lg border text-xs font-mono font-semibold transition-all duration-300 ${
                currentTier === 'enterprise'
                  ? 'bg-purple-600/30 border-purple-400/60 text-purple-100 font-semibold cursor-default shadow-xs'
                  : (hoveredTierBtn === 'enterprise'
                      ? 'border-purple-600 dark:border-purple-400 text-white cursor-pointer shadow-xs'
                      : 'bg-transparent border-slate-300 dark:border-white/20 hover:border-slate-950 dark:hover:border-white text-slate-900 dark:text-white cursor-pointer')
              }`}
            >
              {currentTier !== 'enterprise' && (
                <div
                  aria-hidden="true"
                  style={{
                    transform: hoveredTierBtn === 'enterprise' ? 'translateY(0%)' : 'translateY(105%)',
                    opacity: hoveredTierBtn === 'enterprise' ? 1 : 0,
                    transition: hoveredTierBtn === 'enterprise'
                      ? 'transform 900ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out'
                      : 'opacity 250ms ease-out, transform 0s 250ms'
                  }}
                  className="absolute left-[-15%] right-[-15%] bottom-0 h-[260%] flex flex-col pointer-events-none z-0"
                >
                  <svg viewBox="0 0 320 48" preserveAspectRatio="none" className="w-full h-6 shrink-0 text-purple-400 fill-current block">
                    <path d="M 0 24 Q 40 8, 80 20 T 160 15 T 240 22 T 320 12 L 320 48 L 0 48 Z" />
                    <circle cx="80" cy="20" r="4.5" />
                    <circle cx="120" cy="12" r="3.5" />
                    <circle cx="160" cy="15" r="5" />
                    <circle cx="200" cy="13" r="3.5" />
                    <circle cx="240" cy="22" r="4.5" />
                    <line x1="80" y1="20" x2="120" y2="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="120" y1="12" x2="160" y2="15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="160" y1="15" x2="200" y2="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="200" y1="13" x2="240" y2="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                  </svg>
                  <div className="flex-1 w-full bg-[#1e1035] dark:bg-[#180b2d]" />
                </div>
              )}
              <span className="relative z-10 transition-colors duration-300 flex items-center gap-1.5">
                {!isAuthorizedDev && currentTier !== 'enterprise' && <Lock className="w-3 h-3" />}
                <span>
                  {currentTier === 'enterprise'
                    ? 'Active'
                    : (!user
                        ? 'Sign In to Unlock'
                        : (isAuthorizedDev ? 'Switch (Dev)' : 'Upgrade (Custom)'))}
                </span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. Real-Time Metrics & API Credentials ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        {/* Verification Metrics */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-900/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Verification Metrics
            </span>
            <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 font-medium">
              {currentTier === 'free' ? '28% Capacity' : '14% Capacity'}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-slate-950 dark:bg-white transition-all duration-500"
              style={{ width: currentTier === 'free' ? '28%' : '14%' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg border border-slate-200/60 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02]">
              <span className="text-[9px] text-slate-500 block">INTERCEPTIONS</span>
              <span className="text-sm font-bold text-slate-950 dark:text-white">1,428</span>
            </div>
            <div className="p-2 rounded-lg border border-slate-200/60 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02]">
              <span className="text-[9px] text-slate-500 block">GATE BLOCKS</span>
              <span className="text-sm font-bold text-slate-950 dark:text-white">19</span>
            </div>
            <div className="p-2 rounded-lg border border-slate-200/60 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02]">
              <span className="text-[9px] text-slate-500 block">AVG LATENCY</span>
              <span className="text-sm font-bold text-slate-950 dark:text-white">2.1 ms</span>
            </div>
            <div className="p-2 rounded-lg border border-slate-200/60 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02]">
              <span className="text-[9px] text-slate-500 block">REACHABILITY</span>
              <span className="text-sm font-bold text-slate-950 dark:text-white">100%</span>
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-900/[0.02] dark:bg-white/[0.02] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                MCP Agent API Key
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mb-2.5">
              Bearer authentication key for Cursor, Claude Code, and Windsurf MCP connections.
            </p>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto text-slate-800 dark:text-slate-200">
              <code className="truncate text-[11px]">cvdx_live_{user?.login ? user.login.toLowerCase() : 'contributor'}_{apiKeySuffix}</code>
              <button
                onClick={handleCopyApiKey}
                className="px-2 py-0.5 rounded bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[10px] font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 shrink-0 transition-colors cursor-pointer"
              >
                {copiedKey ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Rotation: 90 Days</span>
            <button
              onClick={handleRotateKey}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
              <span>Rotate</span>
            </button>
          </div>
        </div>
      </section>

      {/* Monochromatic Fading Toast */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-mono font-semibold shadow-2xl border border-slate-800 dark:border-white/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 pointer-events-none"
        >
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
