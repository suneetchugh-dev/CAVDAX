import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Sun, Moon,
  Layers, SlidersHorizontal, Cable, Play, Users, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import CavdaxBrandLoader from './CavdaxBrandLoader';
import Tooltip from './Tooltip';
import { playClick } from '../utils/soundFx';

/**
 * Header — Monochromatic Portfolio Morphing Navbar.
 *
 * Adheres strictly to SAHNIRMAAN & CAVDAX design standards:
 * - Line SVG icons for all navigation items (Layers, SlidersHorizontal, Cable).
 * - Framer Motion shared-layout sliding pill for active tab state.
 * - Unboxed, completely free brand mark (Strictly NO text wordmark in navbar).
 * - Animates on hover ONLY, static by default.
 * - Perfectly centered navigation tabs (flex-1 / flex-shrink-0 / flex-1 3-zone geometry).
 * - 100% consistent across all tabs with zero layout jitter.
 * - Monochromatic light/dark theme inversion with zero cyan.
 * - Dedicated PreferencesModal trigger with smooth gear spin.
 */
export default function Header({
  status,
  activeTab = 'landing',
  landingTarget = 'overview',
  onSelectTab,
  onOpenPreferences,
  isDarkTheme = true,
  onToggleTheme,
}) {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(() => (typeof window !== 'undefined' ? window.scrollY > 20 : false));
  const [gearRotation, setGearRotation] = useState(0);
  const [themeRotation, setThemeRotation] = useState(0);
  
  // Track tab changes vs scroll morphing to eliminate slow pill-crawl
  const prevTabRef = useRef(activeTab);
  const prevScrolledRef = useRef(false);
  const [animatingTab, setAnimatingTab] = useState(false);

  // Industry-Standard Container-Relative Horizontal Slider Tracking (Immune to scroll jumps & Y-flying)
  const tabRefs = useRef({});
  const [pillPosition, setPillPosition] = useState({ x: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const updatePill = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        setPillPosition({
          x: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          ready: true,
        });
      }
    };
    updatePill();
    const rafId = requestAnimationFrame(updatePill);
    window.addEventListener('resize', updatePill);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePill);
    };
  }, [activeTab, isScrolled]);

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      setAnimatingTab(true);
      const timer = setTimeout(() => setAnimatingTab(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, isScrolled]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setIsScrolled(y > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Suppress the navbar exclusively when within the Wordmark Intro Viewport (#brand-intro, before reaching #hero-section)
  // On all other tabs (/console, /mcp, /project, /team) and on Overview content (#hero-section and below), the navbar is ALWAYS visible!
  const isWordmarkSection = activeTab === 'landing' && scrollY < (typeof window !== 'undefined' ? ((document.getElementById('hero-section')?.offsetTop || window.innerHeight) - 80) : 600);
  const isHeaderHidden = isWordmarkSection;

  useEffect(() => {
    prevScrolledRef.current = isScrolled;
  }, [isScrolled]);

  const handlePreferencesClick = () => {
    playClick();
    setGearRotation(prev => prev + 180);
    if (onOpenPreferences) onOpenPreferences();
  };

  const handleToggleTheme = () => {
    playClick();
    setThemeRotation(prev => prev + 360);
    if (onToggleTheme) onToggleTheme();
  };

  return (
    <motion.header
      layoutRoot
      className={`portfolio-header ${isScrolled ? 'scrolled' : ''} ${isHeaderHidden ? 'header-hidden' : ''} ${animatingTab ? 'no-morph' : ''}`}>
      {/* 1. Left: Brand Logo (Unboxed, completely free, larger, animate-on-hover only) */}
      <div
        style={{
          flexGrow: isScrolled ? 0 : 1,
          flexShrink: 0,
          flexBasis: isScrolled ? 'auto' : 0,
          transition: 'flex-grow 0.4s cubic-bezier(0.16, 1, 0.3, 1), flex-basis 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="flex items-center justify-start min-w-0"
      >
        <div
          className="flex items-center cursor-pointer flex-shrink-0 select-none group text-slate-900 dark:text-white hover:text-black dark:hover:text-slate-100 transition-colors"
          onClick={() => {
            playClick();
            if (onSelectTab) onSelectTab('landing', { target: 'wordmark' });
          }}
          title="CAVDAX Home"
        >
          <div className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center flex-shrink-0">
            <CavdaxBrandLoader size={34} strokeWidth={7.4} animateOnHover={true} />
          </div>
        </div>
      </div>

      {/* Left-to-Center Vertical Divider Line — Equidistant in floating navbar */}
      <div className={`block shrink-0 h-4 w-[1px] bg-slate-400/80 dark:bg-white/35 mx-2.5 sm:mx-3.5 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      {/* 2. Center: Clean Nav Links with Container-Relative Horizontal Sliding Pill */}
      <div className="flex items-center justify-center flex-shrink-0">
        <nav
          className={`relative flex items-center transition-all duration-300 ${
            isScrolled
              ? "p-1 rounded-full bg-transparent border border-transparent gap-1 sm:gap-1.5"
              : "p-1 rounded-full bg-slate-200/50 dark:bg-white/[0.06] border border-slate-300/80 dark:border-white/10 backdrop-blur-md shadow-2xs gap-1 sm:gap-1.5"
          }`}
        >
          {/* Single Container-Relative Horizontal Sliding Pill (Y-locked by CSS, slides ONLY left & right) */}
          {pillPosition.ready && (
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-slate-950 dark:bg-white shadow-xs pointer-events-none"
              initial={false}
              animate={{
                x: pillPosition.x,
                width: pillPosition.width,
              }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 34,
              }}
            />
          )}

          {[
            { id: "landing", label: "Overview", icon: Layers },
            { id: "console", label: "Console", icon: SlidersHorizontal },
            { id: "mcp", label: "MCP", icon: Cable },
            { id: "project", label: "Demo", icon: Play },
            { id: "team", label: "Team", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current[tab.id] = el;
                }}
                onClick={() => {
                  playClick();
                  if (onSelectTab) onSelectTab(tab.id, { target: tab.id === "landing" ? "overview" : "top" });
                }}
                className={`relative px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono transition-colors duration-200 tactile-btn flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 select-none portfolio-nav-link ${
                  isActive
                    ? "active-pill text-white dark:text-slate-950 font-bold z-10"
                    : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-white/10"
                }`}
              >
                <Icon size={13} className="shrink-0 relative z-10" />
                <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center-to-Right Vertical Divider Line — Equidistant in floating navbar */}
      <div className={`block shrink-0 h-4 w-[1px] bg-slate-400/80 dark:bg-white/35 mx-2.5 sm:mx-3.5 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      {/* 3. Right: Theme Toggle & Preferences Settings (Symmetric with Left zone) */}
      <div
        style={{
          flexGrow: isScrolled ? 0 : 1,
          flexShrink: 0,
          flexBasis: isScrolled ? 'auto' : 0,
          transition: 'flex-grow 0.4s cubic-bezier(0.16, 1, 0.3, 1), flex-basis 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="flex items-center justify-end space-x-2 sm:space-x-2.5 min-w-0"
      >
        {/* Theme Toggle Button (SAHNIRMAAN Luxury Rounded Style with 360° Spin Physics) */}
        <Tooltip content={isDarkTheme ? 'Switch to Light' : 'Switch to Dark'} position="bottom">
          <button
            onClick={handleToggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-slate-200/80 dark:border-white/20 bg-slate-100/80 dark:bg-white/[0.08] hover:bg-slate-200/80 dark:hover:bg-white/15 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-all shadow-2xs backdrop-blur-md focus:outline-none focus:ring-0 active:outline-none group"
            aria-label="Toggle theme"
          >
            <div
              style={{
                transform: `rotate(${themeRotation}deg)`,
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="flex items-center justify-center"
            >
              {isDarkTheme
                ? <Sun className="w-3.5 h-3.5 text-current transition-colors" />
                : <Moon className="w-3.5 h-3.5 text-current transition-colors" />}
            </div>
          </button>
        </Tooltip>

        {/* System Preferences Settings Button (Ported from SAHNIRMAAN with smooth gear spin) */}
        <Tooltip content="System Preferences" position="bottom">
          <button
            onClick={handlePreferencesClick}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-slate-200/80 dark:border-white/20 bg-slate-100/80 dark:bg-white/[0.08] hover:bg-slate-200/80 dark:hover:bg-white/15 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-all shadow-2xs backdrop-blur-md focus:outline-none focus:ring-0 active:outline-none group"
            aria-label="Open System Preferences"
          >
            <Settings 
              className="w-3.5 h-3.5 text-current group-hover:rotate-45 transition-transform duration-500" 
              style={{
                transform: `rotate(${gearRotation}deg)`,
                transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            />
          </button>
        </Tooltip>
      </div>
    </motion.header>
  );
}
