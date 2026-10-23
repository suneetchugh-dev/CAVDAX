import React, { useState } from 'react';
import { Coffee, CheckCircle2, ArrowRight, Heart } from 'lucide-react';
import { playClick } from '../utils/soundFx';

/**
 * SupportPage.jsx — Minimalist Community Sponsorship & Backer Portal
 * 
 * Strict Compliance with UI_DESIGN_SYSTEM.md:
 * - Ultra-minimalist, clutter-free layout with concise typography.
 * - Reduced, student/dev-friendly coffee pricing ($2, $4, $10).
 * - Calibrated monochrome with subtle amber accent.
 * - Zero decorative noise, zero emojis, zero cyan/teal.
 */
export default function SupportPage({ onLaunchConsole, onNavigateHome }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [hoveredTier, setHoveredTier] = useState(null);
  const [thankYouMsg, setThankYouMsg] = useState(false);

  const handleSponsor = (tierName) => {
    playClick();
    setSelectedTier(tierName);
    setThankYouMsg(true);
    setTimeout(() => setThankYouMsg(false), 3500);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full select-none">
      
      {/* ── 1. Concise Header ── */}
      <section className="text-center mb-10 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-mono font-bold text-slate-950 dark:text-white tracking-tight flex items-center justify-center gap-2.5">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-current shrink-0" />
          <span>Support CAVDAX</span>
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-current shrink-0" />
        </h1>
        <div className="mt-3 flex items-center justify-center overflow-x-auto py-1">
          <p className="text-xs sm:text-sm font-sans tracking-wide whitespace-nowrap text-center bg-clip-text text-transparent bg-gradient-to-r from-slate-500 via-slate-950 to-slate-500 dark:from-slate-400 dark:via-white dark:to-slate-400">
            Direct community backing to fund open causal benchmarks.
          </p>
        </div>

        {thankYouMsg && (
          <div
            role="status"
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-mono font-semibold shadow-2xl border border-slate-800 dark:border-white/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 pointer-events-none"
          >
            <Heart className="w-3.5 h-3.5 fill-current text-rose-500 shrink-0" />
            <span>Thank you for supporting open-source causal intelligence.</span>
          </div>
        )}
      </section>

      {/* ── 2. Minimalist Sponsorship Tiers (Affordable Pricing) ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-12">
        
        {/* Tier 1: Single Coffee ($2) */}
        <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-900/[0.02] dark:bg-white/[0.02] flex flex-col justify-between hover:border-slate-400 dark:hover:border-white/30 transition-all">
          <div>
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-600 dark:text-slate-400 mb-3.5">
              <Coffee className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-950 dark:text-white mb-1.5">
              $2 <span className="text-[11px] font-normal text-slate-500 font-sans">/ coffee</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-5 leading-relaxed">
              Community supporter tier to fuel development.
            </p>
            <ul className="text-xs font-mono space-y-2 text-slate-600 dark:text-slate-300 mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>README Backer badge</span>
              </li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Community role</span>
              </li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Public backer directory</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleSponsor('$2 Coffee')}
            onMouseEnter={() => setHoveredTier(1)}
            onMouseLeave={() => setHoveredTier(null)}
            className={`relative overflow-hidden group w-full h-[36px] flex items-center justify-center rounded-lg border text-xs font-mono font-semibold shadow-xs cursor-pointer select-none transition-all duration-300 ${
              hoveredTier === 1
                ? 'border-slate-500 dark:border-slate-400 text-white cursor-pointer shadow-xs'
                : 'bg-transparent border-slate-300 dark:border-white/20 hover:border-slate-500 dark:hover:border-slate-400 text-slate-900 dark:text-white'
            }`}
          >
            <div
              aria-hidden="true"
              style={{
                transform: hoveredTier === 1 ? 'translateY(0%)' : 'translateY(105%)',
                opacity: hoveredTier === 1 ? 1 : 0,
                transition: hoveredTier === 1
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
            <span className="relative z-10 transition-colors duration-300">
              Buy Coffee ($2)
            </span>
          </button>
        </div>

        {/* Tier 2: 2 Coffees ($4) — Popular */}
        <div className="p-6 sm:p-7 rounded-2xl border border-amber-400 dark:border-amber-400/90 ring-2 ring-amber-400/30 bg-slate-50 dark:bg-white/[0.04] flex flex-col justify-between relative overflow-hidden md:scale-[1.03] md:-translate-y-2 shadow-[0_14px_38px_rgba(245,158,11,0.20)] dark:shadow-[0_0_36px_rgba(245,158,11,0.16)] z-10">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-amber-400 text-slate-950 font-mono font-extrabold text-[9px] uppercase tracking-widest rounded-full shadow-md z-20">
            Popular
          </div>
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-slate-900 dark:text-white mb-3">
              <Coffee className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-950 dark:text-white mb-1">
              $4 <span className="text-[11px] font-normal text-slate-500 font-sans">/ 2 cups</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-4">
              Powers automated graph fuzzing and regression passes.
            </p>
            <ul className="text-xs font-mono space-y-1.5 text-slate-600 dark:text-slate-300 mb-5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Everything in $2 tier</span>
              </li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Priority issue triage</span>
              </li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Early MCP plugin access</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleSponsor('$4 Supporter')}
            onMouseEnter={() => setHoveredTier(2)}
            onMouseLeave={() => setHoveredTier(null)}
            className={`relative overflow-hidden group w-full h-[36px] flex items-center justify-center rounded-lg border text-xs font-mono font-bold shadow-xs cursor-pointer select-none transition-all duration-300 ${
              hoveredTier === 2
                ? 'border-amber-400 text-slate-950 shadow-xs'
                : 'bg-transparent border-slate-300 dark:border-white/20 hover:border-amber-400 text-slate-900 dark:text-white'
            }`}
          >
            <div
              aria-hidden="true"
              style={{
                transform: hoveredTier === 2 ? 'translateY(0%)' : 'translateY(105%)',
                opacity: hoveredTier === 2 ? 1 : 0,
                transition: hoveredTier === 2
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
            <span className="relative z-10 transition-colors duration-300">
              Sponsor ($4)
            </span>
          </button>
        </div>

        {/* Tier 3: Core Supporter ($10) */}
        <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-900/[0.02] dark:bg-white/[0.02] flex flex-col justify-between hover:border-slate-400 dark:hover:border-white/30 transition-all">
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3">
              {/* Ember Gold Honey & Artisan Pour-Over Drip Coffee SVG */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-amber-500 dark:text-amber-400"
                aria-hidden="true"
              >
                <path d="M5 9h14l-1.5 9.5a2 2 0 0 1-2 1.5h-7a2 2 0 0 1-2-1.5L5 9z" fill="currentColor" fillOpacity="0.15" />
                <path d="M4 9h16" />
                <path d="M7 5h10" />
                <path d="M9 5c0-1.5 1.5-2 3-2s3 .5 3 2" />
                <circle cx="12" cy="14" r="1.5" fill="currentColor" />
                <path d="M12 11v1.5" />
                <line x1="8.5" y1="13" x2="10" y2="13" />
                <line x1="14" y1="13" x2="15.5" y2="13" />
              </svg>
            </div>
            <div className="text-lg font-bold font-mono text-slate-950 dark:text-white mb-1">
              $10 <span className="text-[11px] font-normal text-slate-500 font-sans">/ core</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-4">
              Funds high-frequency FalkorDB benchmark instances &amp; continuous graph validation.
            </p>
            <ul className="text-xs font-mono space-y-1.5 text-slate-600 dark:text-slate-300 mb-5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Backers Wall listing</span>
              </li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Direct RFC discussion</span>
              </li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>GitHub Sponsor badge</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleSponsor('$10 Core Backer')}
            onMouseEnter={() => setHoveredTier(3)}
            onMouseLeave={() => setHoveredTier(null)}
            className={`relative overflow-hidden group w-full h-[36px] flex items-center justify-center rounded-lg border text-xs font-mono font-semibold shadow-xs cursor-pointer select-none transition-all duration-300 ${
              hoveredTier === 3
                ? 'border-amber-500 dark:border-amber-400 text-slate-950 dark:text-white cursor-pointer shadow-xs'
                : 'bg-transparent border-slate-300 dark:border-white/20 hover:border-amber-500 dark:hover:border-amber-400 text-slate-900 dark:text-white'
            }`}
          >
            <div
              aria-hidden="true"
              style={{
                transform: hoveredTier === 3 ? 'translateY(0%)' : 'translateY(105%)',
                opacity: hoveredTier === 3 ? 1 : 0,
                transition: hoveredTier === 3
                  ? 'transform 900ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out'
                  : 'opacity 250ms ease-out, transform 0s 250ms'
              }}
              className="absolute left-[-15%] right-[-15%] bottom-0 h-[260%] flex flex-col pointer-events-none z-0"
            >
              <svg viewBox="0 0 320 48" preserveAspectRatio="none" className="w-full h-6 shrink-0 text-amber-500 fill-current block" >
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
              <div className="flex-1 w-full bg-amber-500" />
            </div>
            <span className="relative z-10 transition-colors duration-300">
              Sponsor ($10)
            </span>
          </button>
        </div>

      </section>

      {/* ── 3. Concise Resource Stewardship (Clean Pills) ── */}
      <section className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-900/[0.02] dark:bg-white/[0.02] mb-8">
        <div className="mb-4">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Fund Allocation
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02]">
            <span className="text-sm font-bold text-slate-950 dark:text-white block">50%</span>
            <span className="text-[10px] text-slate-500">Benchmark Nodes</span>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02]">
            <span className="text-sm font-bold text-slate-950 dark:text-white block">35%</span>
            <span className="text-[10px] text-slate-500">CI Fuzzing</span>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02]">
            <span className="text-sm font-bold text-slate-950 dark:text-white block">15%</span>
            <span className="text-[10px] text-slate-500">NPM Infrastructure</span>
          </div>
        </div>
      </section>





    </div>
  );
}
