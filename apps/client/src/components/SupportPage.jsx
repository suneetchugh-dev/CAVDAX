import React, { useState, useEffect, useCallback } from 'react';
import { Coffee, CheckCircle2, Heart, HandHeart, Loader2 } from 'lucide-react';
import { playClick } from '../utils/soundFx';

/**
 * SupportPage.jsx — Razorpay-powered Community Sponsor Portal
 *
 * Design System Compliance (UI_DESIGN_SYSTEM.md):
 * - Zero emojis, zero eyebrow pills, zero bracketed tags
 * - Lucide icons only, font-mono telemetry identifiers
 * - Constant 1px border — opacity lifts on hover, never border-2
 * - Popular card elevated only on xl: (1280px+) to prevent laptop overflow
 * - Fluid wave fill buttons (§11H persistent interaction fills)
 * - No multi-line centered body prose (§13)
 * - Toast: fixed bottom, monochrome, pointer-events-none
 *
 * Razorpay Standard Checkout (feature/razorpay-sponsor):
 *   1. Button click → POST /api/billing/create-order  → order_id
 *   2. checkout.js loaded dynamically → Razorpay modal opens
 *   3. handler() → POST /api/billing/verify-payment (HMAC-SHA256)
 *   4. Confirmed toast on success, error toast on failure / dismiss
 *
 * VITE_RAZORPAY_KEY_ID is the public key only — secret stays server-side.
 */

// Public key — Vite inlines VITE_* at build time. Secret never reaches client.
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

// Sponsor tiers: amounts in paise (₹1 = 100 paise)
const TIERS = [
  {
    id:       1,
    usdPrice: '$2',
    inrPrice: '₹169',
    sub:      '/ coffee',
    usdSub:   'approx ₹169 INR',
    inrSub:   'approx $2 USD',
    paise:    16900,
    desc:     'One coffee to fuel development.',
    perks:    ['README Backer badge', 'Community role', 'Public backer directory'],
    amber:    false,
    popular:  false,
  },
  {
    id:       2,
    usdPrice: '$4',
    inrPrice: '₹339',
    sub:      '/ 2 cups',
    usdSub:   'approx ₹339 INR',
    inrSub:   'approx $4 USD',
    paise:    33900,
    desc:     'Powers automated graph fuzzing and regression passes.',
    perks:    ['Everything in $2 tier', 'Priority issue triage', 'Early MCP plugin access'],
    amber:    true,
    popular:  true,
  },
  {
    id:       3,
    usdPrice: '$10',
    inrPrice: '₹849',
    sub:      '/ core',
    usdSub:   'approx ₹849 INR',
    inrSub:   'approx $10 USD',
    paise:    84900,
    desc:     'Funds FalkorDB benchmark instances and continuous graph validation.',
    perks:    ['Backers Wall listing', 'Direct RFC discussion', 'GitHub Sponsor badge'],
    amber:    true,
    popular:  false,
  },
];

/** Dynamically injects checkout.js once; resolves true when ready. */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function SupportPage({ onLaunchConsole, onNavigateHome, user }) {
  const [hoveredTier, setHoveredTier] = useState(null);
  const [loadingTier, setLoadingTier] = useState(null);
  const [toast, setToast]             = useState(null); // { ok: bool, text: string }

  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem('cavdax_currency');
      if (saved === 'USD' || saved === 'INR') return saved;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const lang = navigator.language || '';
      if (tz.includes('Calcutta') || tz.includes('Kolkata') || lang.includes('en-IN') || lang.includes('hi')) {
        return 'INR';
      }
    } catch {}
    return 'USD';
  });

  const toggleCurrency = (newCurr) => {
    playClick();
    setCurrency(newCurr);
    try {
      localStorage.setItem('cavdax_currency', newCurr);
      window.dispatchEvent(new CustomEvent('cavdax:currency-changed', { detail: { currency: newCurr } }));
    } catch {}
  };

  useEffect(() => {
    const handleCurrencyChange = (e) => {
      const next = e.detail?.currency || localStorage.getItem('cavdax_currency');
      if (next && (next === 'USD' || next === 'INR')) {
        setCurrency(next);
      }
    };
    window.addEventListener('cavdax:currency-changed', handleCurrencyChange);
    return () => window.removeEventListener('cavdax:currency-changed', handleCurrencyChange);
  }, []);

  const showToast = (ok, text) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSponsor = useCallback(async (tier) => {
    playClick();



    setLoadingTier(tier.id);

    try {
      // 1. Load checkout.js
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        showToast(false, 'Could not load payment gateway. Check your connection.');
        setLoadingTier(null);
        return;
      }

      // 2. Create order on the backend
      const orderRes  = await fetch('/api/billing/create-order', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({
          amount_paise: tier.paise,
          receipt:      `cavdax_sponsor_${tier.id}_${Date.now()}`
        })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        showToast(false, orderData?.error?.message || 'Failed to create payment order.');
        setLoadingTier(null);
        return;
      }

      const keyId = orderData.key_id || RAZORPAY_KEY_ID;
      if (!keyId) {
        showToast(false, 'Payment gateway key not configured. Contact the team.');
        setLoadingTier(null);
        return;
      }

      // 3. Open Razorpay modal
      const options = {
        key:         keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'CAVDAX',
        description: `${currency === 'INR' ? tier.inrPrice : tier.usdPrice} Sponsor — Open-source causal AI gate`,
        image:       `${window.location.origin}/cavdax-brand-logo.jpg`,
        order_id:    orderData.order_id,
        theme:       { color: '#F59E0B' }, // amber-500 — CAVDAX accent
        modal: {
          ondismiss: () => setLoadingTier(null)
        },
        handler: async (response) => {
          // 4. Verify HMAC-SHA256 signature server-side
          try {
            const verifyRes = await fetch('/api/billing/verify-payment', {
              method:      'POST',
              headers:     { 'Content-Type': 'application/json' },
              credentials: 'include',
              body:        JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              showToast(true, 'Payment verified. Thank you for supporting CAVDAX.');
            } else {
              showToast(false, 'Signature verification failed. Contact support with your payment ID.');
            }
          } catch {
            showToast(false, 'Verification request failed. Contact support with your payment ID.');
          } finally {
            setLoadingTier(null);
          }
        }
      };

      // eslint-disable-next-line no-undef
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        showToast(false, r?.error?.description || 'Payment failed.');
        setLoadingTier(null);
      });

      setLoadingTier(null);
      rzp.open();

    } catch (err) {
      showToast(false, `Error: ${err.message}`);
      setLoadingTier(null);
    }
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full select-none">

      {/* ── 1. Header ── */}
      <section className="text-center mb-10 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-mono font-bold text-slate-950 dark:text-white tracking-tight flex items-center justify-center gap-2.5">
          <Heart className="w-5 h-5 text-rose-500 fill-current shrink-0" />
          <span>Support CAVDAX</span>
          <Heart className="w-5 h-5 text-rose-500 fill-current shrink-0" />
        </h1>
        <p className="mt-3 text-xs font-sans text-slate-500 dark:text-slate-400">
          Direct community backing funds open causal benchmarks and maintainer hours.
        </p>
      </section>

      {/* ── 2. Sponsorship Tiers & Currency Switcher ── */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Sponsorship Tiers
        </span>

        {/* Monochromatic Subtle Currency Switcher (USD / INR) */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => toggleCurrency('USD')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              currency === 'USD'
                ? 'bg-white dark:bg-white/15 text-slate-950 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            USD ($)
          </button>
          <button
            type="button"
            onClick={() => toggleCurrency('INR')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              currency === 'INR'
                ? 'bg-white dark:bg-white/15 text-slate-950 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            INR (₹)
          </button>
        </div>
      </div>

      <section className="pt-0 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-12">
        {TIERS.map((tier) => {
          const isLoading = loadingTier === tier.id;
          const isHovered = hoveredTier === tier.id;

          return (
            <div
              key={tier.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative
                ${tier.popular
                  ? 'border-amber-400 dark:border-amber-400/90 ring-1 ring-amber-400/20 bg-slate-50 dark:bg-white/[0.03] xl:scale-[1.035] xl:-translate-y-2.5 shadow-[0_12px_32px_rgba(245,158,11,0.18)] dark:shadow-[0_0_28px_rgba(245,158,11,0.14)] z-10'
                  : 'border-slate-200/80 dark:border-white/10 bg-transparent hover:border-slate-300 dark:hover:border-white/20'
                }`}
            >
              {tier.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-amber-400 text-slate-950 font-mono font-extrabold text-[9px] uppercase tracking-widest rounded-full z-20">
                  Popular
                </div>
              )}

              <div>
                {/* Icon */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-3 border
                  ${tier.amber
                    ? 'bg-amber-400/10 border-amber-400/25 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-500/10 border-slate-400/20 text-slate-600 dark:text-slate-400'
                  }`}>
                  <Coffee className="w-3.5 h-3.5" />
                </div>

                {/* Price */}
                <div className="text-2xl font-bold font-mono text-slate-950 dark:text-white tracking-tight">
                  {currency === 'INR' ? tier.inrPrice : tier.usdPrice}
                  <span className="text-[11px] font-normal text-slate-500 font-sans ml-1">{tier.sub}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 mb-3">
                  {currency === 'INR' ? tier.inrSub : tier.usdSub}
                </div>

                {/* Desc */}
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-4 leading-relaxed">{tier.desc}</p>

                {/* Perks */}
                <ul className="text-xs font-mono space-y-1.5 mb-6 text-slate-600 dark:text-slate-300">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${tier.amber ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Checkout button — fluid wave fill (§11H) */}
              <button
                onClick={() => handleSponsor(tier)}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
                disabled={loadingTier !== null}
                className={`relative overflow-hidden w-full h-9 flex items-center justify-center rounded-lg border text-xs font-mono font-semibold cursor-pointer select-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  ${tier.amber
                    ? (isHovered && !isLoading ? 'border-amber-400 text-slate-950' : 'bg-transparent border-slate-300 dark:border-white/20 hover:border-amber-400 text-slate-900 dark:text-white')
                    : (isHovered && !isLoading ? 'border-slate-500 dark:border-slate-300 text-white' : 'bg-transparent border-slate-300 dark:border-white/20 hover:border-slate-500 dark:hover:border-slate-300 text-slate-900 dark:text-white')
                  }`}
              >
                {/* Fluid wave fill layer */}
                <div
                  aria-hidden="true"
                  style={{
                    transform:  isHovered && !isLoading ? 'translateY(0%)' : 'translateY(105%)',
                    opacity:    isHovered && !isLoading ? 1 : 0,
                    transition: isHovered
                      ? 'transform 900ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out'
                      : 'opacity 250ms ease-out, transform 0s 250ms'
                  }}
                  className="absolute left-[-15%] right-[-15%] bottom-0 h-[260%] flex flex-col pointer-events-none z-0"
                >
                  <svg viewBox="0 0 320 48" preserveAspectRatio="none"
                    className={`w-full h-6 shrink-0 fill-current block ${tier.amber ? 'text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    <path d="M 0 24 Q 40 8, 80 20 T 160 15 T 240 22 T 320 12 L 320 48 L 0 48 Z" />
                    <circle cx="80" cy="20" r="4.5" /><circle cx="120" cy="12" r="3.5" /><circle cx="160" cy="15" r="5" /><circle cx="200" cy="13" r="3.5" /><circle cx="240" cy="22" r="4.5" />
                    <line x1="80" y1="20" x2="120" y2="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="120" y1="12" x2="160" y2="15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="160" y1="15" x2="200" y2="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                    <line x1="200" y1="13" x2="240" y2="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85" />
                  </svg>
                  <div className={`flex-1 w-full ${tier.amber ? 'bg-amber-400' : 'bg-slate-600 dark:bg-slate-400'}`} />
                </div>

                <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-300">
                  {isLoading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing...</>
                    : <><Coffee className="w-3 h-3 shrink-0" />Sponsor ({currency === 'INR' ? tier.inrPrice : tier.usdPrice})</>
                  }
                </span>
              </button>
            </div>
          );
        })}
      </section>

      {/* ── 3. Capital allocation ── */}
      <section className="mb-8 p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-900/[0.02] dark:bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-3">
          <HandHeart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            How Backing Is Allocated
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-white/5 mb-3">
          <div className="h-full bg-amber-400" style={{ width: '40%' }} />
          <div className="h-full bg-indigo-500/70 dark:bg-indigo-400/70" style={{ width: '35%' }} />
          <div className="h-full bg-slate-400 dark:bg-slate-500" style={{ width: '25%' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          {[
            { dot: 'bg-amber-400',                              label: 'Core Maintainers',  pct: '40%', note: 'Triage & security patches' },
            { dot: 'bg-indigo-500/70 dark:bg-indigo-400/70',   label: 'Benchmark Nodes',   pct: '35%', note: 'FalkorDB cloud clusters'   },
            { dot: 'bg-slate-400 dark:bg-slate-500',           label: 'Automated CI',       pct: '25%', note: 'Regression & fuzzing'      },
          ].map((row) => (
            <div key={row.label} className="p-2.5 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02] flex sm:flex-col gap-2 sm:gap-1 items-center sm:items-start justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${row.dot}`} />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">{row.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-950 dark:text-white">{row.pct}</span>
                <span className="text-[10px] text-slate-500">{row.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold shadow-2xl border pointer-events-none max-w-xs text-center animate-in fade-in slide-in-from-bottom-3
            ${toast.ok
              ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-800 dark:border-white/20'
              : 'bg-rose-600 text-white border-rose-500'
            }`}
        >
          {toast.ok && <Heart className="w-3.5 h-3.5 fill-current text-rose-400 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
