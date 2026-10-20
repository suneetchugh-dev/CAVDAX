import React, { useState, useEffect } from 'react';
import CavdaxBrandLoader from './CavdaxBrandLoader';
import { playLoadingSound } from '../utils/soundFx';

export let isInitialSplashFinished = false;

const FULL_FORM_WORDS = [
  { prefix: '', acro: 'C', suffix: 'ontextual', delay: '0.3s' },
  { prefix: '', acro: 'A', suffix: 'ction', delay: '0.6s' },
  { prefix: '', acro: '&', suffix: '', isSymbol: true, delay: '0.9s' },
  { prefix: '', acro: 'V', suffix: 'erified', delay: '1.2s' },
  { prefix: '', acro: 'D', suffix: 'ecision', delay: '1.5s' },
  { prefix: '', acro: 'A', suffix: 'utonomous', delay: '1.8s' },
  { prefix: 'e', acro: 'X', suffix: 'ecution', delay: '2.1s' },
];

export default function SplashLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Total animation cycle + full form text reveal hold (4.8s)
    const drawDuration = 4800;
    const fadeDuration = 650;

    // Smooth telemetry progress tracking (0% to 100% across duration)
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / drawDuration) * 100));
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 30);

    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
      isInitialSplashFinished = true;
      playLoadingSound();
    }, drawDuration);

    const unmountTimer = setTimeout(() => {
      setIsVisible(false);
    }, drawDuration + fadeDuration);

    const handleKeyDown = () => {
      setIsFadingOut(true);
      isInitialSplashFinished = true;
      playLoadingSound();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => {
        setIsFadingOut(true);
        isInitialSplashFinished = true;
        playLoadingSound();
      }}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050608] select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFadingOut ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <style>{`
        @keyframes splashWordFadeIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }

        @keyframes splashFullFormBreathe {
          0%, 100% {
            opacity: 0.85;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.15);
          }
          50% {
            opacity: 1;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
          }
        }

        @keyframes splashBrandGlow {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.6;
          }
        }

        .splash-word-item {
          opacity: 0;
          animation: splashWordFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .splash-full-form-fading {
          animation: splashFullFormBreathe 2.8s ease-in-out infinite;
        }
      `}</style>

      <div className="relative flex flex-col items-center max-w-xl px-6">
        {/* Monochromatic Specular Radial Aura behind larger logo */}
        <div
          aria-hidden="true"
          className="absolute -top-12 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white/[0.04] blur-3xl pointer-events-none animate-[splashBrandGlow_4.2s_ease-in-out_infinite]"
        />

        {/* 1. Large Brand Logo (size 260, container h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80) */}
        <div className="relative h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80 flex items-center justify-center">
          <CavdaxBrandLoader 
            size={260} 
            strokeWidth={7.4} 
            colorClassName="text-white"
          />
        </div>

        {/* 2. Acronym Title (Clean unbracketed, without v1.0 per Rule) */}
        <div className="mt-3 flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-mono font-extrabold tracking-[0.35em] text-white">
            CAVDAX
          </span>
        </div>

        {/* 3. Full Form with Fading Text & Staggered Reveal — Balanced Clauses, Guaranteed Zero Lonely Child */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-x-2.5 gap-y-1.5 text-center font-mono text-xs sm:text-sm tracking-wider splash-full-form-fading max-w-3xl px-4">
          {/* Clause 1: Contextual Action & Verified Decision */}
          <div className="flex items-baseline justify-center gap-x-2 whitespace-nowrap">
            {FULL_FORM_WORDS.slice(0, 5).map((part, idx) => (
              <span
                key={idx}
                className="splash-word-item inline-flex items-baseline whitespace-nowrap"
                style={{ animationDelay: part.delay }}
              >
                {part.prefix && (
                  <span className="text-slate-400 text-xs">{part.prefix}</span>
                )}
                <span
                  className={
                    part.isSymbol
                      ? 'text-slate-400 font-semibold px-0.5'
                      : 'text-white font-bold text-sm sm:text-base'
                  }
                >
                  {part.acro}
                </span>
                {part.suffix && (
                  <span className="text-slate-300 font-medium">
                    {part.suffix}
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Clause 2: Autonomous eXecution — Always paired together, NEVER eXecution as a lonely child */}
          <div className="flex items-baseline justify-center gap-x-2 whitespace-nowrap">
            {FULL_FORM_WORDS.slice(5).map((part, idx) => (
              <span
                key={idx + 5}
                className="splash-word-item inline-flex items-baseline whitespace-nowrap"
                style={{ animationDelay: part.delay }}
              >
                {part.prefix && (
                  <span className="text-slate-400 text-xs">{part.prefix}</span>
                )}
                <span
                  className={
                    part.isSymbol
                      ? 'text-slate-400 font-semibold px-0.5'
                      : 'text-white font-bold text-sm sm:text-base'
                  }
                >
                  {part.acro}
                </span>
                {part.suffix && (
                  <span className="text-slate-300 font-medium">
                    {part.suffix}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Telemetry Progress & Initialization Bar (No pulsing dots per Rule 3) */}
        <div className="mt-7 w-52 sm:w-72 flex flex-col items-center gap-2">
          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-slate-500 via-slate-300 to-white transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
            SYNCHRONIZING GRAPH KERNEL • {progress}%
          </div>
        </div>

        {/* 5. Minimalist Dismiss Hint (Unbracketed per Rule 4) */}
        <div className="mt-5 text-[9px] font-mono text-slate-500/80 tracking-widest uppercase cursor-pointer hover:text-slate-300 transition-colors">
          Press any key or tap to continue
        </div>
      </div>
    </div>
  );
}
