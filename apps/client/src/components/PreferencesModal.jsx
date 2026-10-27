import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  PauseCircle, 
  X, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  Check, 
  Sun, 
  Moon, 
  Activity, 
  MousePointer, 
  Waves, 
  Sparkles,
  Layers,
  Terminal,
  Keyboard as KeyboardIcon
} from 'lucide-react';
import { playClick, playLoadingSound, isSoundEnabled, toggleSound } from '../utils/soundFx';

/**
 * High-Precision ToggleSwitch Component
 * Ported from CAVDAX: clean semantic React button slider with zero outline artifacts.
 */
function ToggleSwitch({ checked, onChange, disabled = false, size = 'md', ariaLabel = 'Toggle setting' }) {
  const isSmall = size === 'sm';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && onChange) onChange(!checked);
      }}
      className={`relative inline-flex items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer select-none border-transparent ${
        isSmall ? 'w-9 h-5 p-0.5' : 'w-11 h-6 p-0.5'
      } ${
        checked 
          ? 'bg-slate-950 dark:bg-white' 
          : 'bg-slate-200 dark:bg-white/20'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full pointer-events-none shadow-xs border border-transparent transition-all duration-300 ${
          isSmall ? 'w-4 h-4' : 'w-5 h-5'
        } ${
          checked 
            ? 'bg-white dark:bg-black text-slate-950 dark:text-white' 
            : 'bg-white dark:bg-neutral-300 text-slate-400 dark:text-neutral-600'
        }`}
        style={{
          transform: checked 
            ? (isSmall ? 'translateX(16px)' : 'translateX(20px)') 
            : 'translateX(0px)',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <svg
          viewBox="0 0 12 12"
          className={`w-2.5 h-2.5 transition-all duration-300 transform ${
            checked ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-45 opacity-0'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 6.5L4.5 8.5L9.5 3.5" />
        </svg>
      </span>
    </button>
  );
}

/**
 * PreferencesModal
 * Replicates CAVDAX's luxury monochromatic settings modal:
 * - Bare unboxed rotating Settings gear SVG
 * - Display appearance theme toggle (Obsidian Dark / Porcelain Light)
 * - Sensory Sound FX with expandable accordion & live micro-click testing
 * - Motion Kinetics with expandable accordion for kinetic rolling and particles
 * - Interactive Verification Tour launcher (direct jump to 4-act tour)
 * - Platform cache reset & simulation re-initialization
 * - Monochromatic design system with executive amber accents
 */
export default function PreferencesModal({ 
  isOpen, 
  onClose, 
  isDarkTheme, 
  onToggleTheme,
  onStartTour,
  onResetDemo,
  onOpenShortcuts
}) {
  const [soundsActive, setSoundsActive] = useState(() => isSoundEnabled());
  const [clickSoundActive, setClickSoundActive] = useState(() => localStorage.getItem('cavdax_sound_click') !== 'off');
  const [splashSoundActive, setSplashSoundActive] = useState(() => localStorage.getItem('cavdax_sound_splash') !== 'off');
  const [motionActive, setMotionActive] = useState(() => localStorage.getItem('cavdax_motion') !== 'off');
  const [particlesActive, setParticlesActive] = useState(() => localStorage.getItem('cavdax_particles') !== 'off');
  const [kineticActive, setKineticActive] = useState(() => localStorage.getItem('cavdax_kinetic') !== 'off');

  // Single-group accordion expansion: 'sounds' | 'motion' | null
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [gearRotation, setGearRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setGearRotation(prev => prev + 180);
      setExpandedGroupId(null);
      document.documentElement.classList.add('lightbox-active');
    } else {
      document.documentElement.classList.remove('lightbox-active');
    }
    return () => document.documentElement.classList.remove('lightbox-active');
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const spinGear = () => {
    setGearRotation(prev => prev + 90);
  };

  const handleToggleGroup = (groupId) => {
    playClick();
    spinGear();
    setExpandedGroupId(prev => (prev === groupId ? null : groupId));
  };

  const handleMasterSoundToggle = (val) => {
    setSoundsActive(val);
    toggleSound();
    spinGear();
    if (val) playClick();
    else if (expandedGroupId === 'sounds') setExpandedGroupId(null);
  };

  const handleClickSoundToggle = (val) => {
    setClickSoundActive(val);
    localStorage.setItem('cavdax_sound_click', val ? 'on' : 'off');
    spinGear();
    if (val) playClick();
  };

  const handleSplashSoundToggle = (val) => {
    setSplashSoundActive(val);
    localStorage.setItem('cavdax_sound_splash', val ? 'on' : 'off');
    spinGear();
    if (val) playClick();
  };

  const handleMasterMotionToggle = (val) => {
    setMotionActive(val);
    localStorage.setItem('cavdax_motion', val ? 'on' : 'off');
    spinGear();
    if (val) playClick();
    else if (expandedGroupId === 'motion') setExpandedGroupId(null);
  };

  const handleKineticToggle = (val) => {
    setKineticActive(val);
    localStorage.setItem('cavdax_kinetic', val ? 'on' : 'off');
    spinGear();
    if (val) playClick();
  };

  const handleParticlesToggle = (val) => {
    setParticlesActive(val);
    localStorage.setItem('cavdax_particles', val ? 'on' : 'off');
    spinGear();
    if (val) playClick();
  };

  const getAccordionStyle = (isExpanded, openHeight) => ({
    maxHeight: isExpanded ? openHeight : '0px',
    opacity: isExpanded ? 1 : 0,
    marginTop: isExpanded ? '0.75rem' : '0px',
    pointerEvents: isExpanded ? 'auto' : 'none',
    transition: isExpanded
      ? 'max-height 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin-top 0.25s ease'
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6"
        >
          {/* Backdrop Blur matching KeyboardShortcutsModal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              playClick();
              onClose();
            }}
            className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md"
          />

          {/* Modal Dialog Card with smooth spring physics entry and exit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar bg-white/95 dark:bg-[#0A0D12] border border-slate-200/90 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl p-4 sm:p-7 z-10"
          >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition cursor-pointer"
          aria-label="Close preferences"
        >
          <X size={15} />
        </button>

        {/* Modal Header: Bare Unboxed Rotating Gear */}
        <div className="border-b border-slate-200/80 dark:border-white/10 pb-3 sm:pb-4 mb-4 sm:mb-5 pr-8">
          <div className="flex items-center space-x-2.5 mb-1">
            <Settings 
              size={19} 
              className="text-slate-950 dark:text-white flex-shrink-0"
              style={{
                transform: `rotate(${gearRotation}deg)`,
                transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            />
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white font-sans">
              System Preferences
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 ml-7 leading-snug">
            Sensory feedback, kinetics, and system controls.
          </p>
        </div>

        {/* Settings Grid Structure */}
        <div className="space-y-3 font-sans">
          
          {/* 1. Theme Mode Selector */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/15 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 min-w-0">
                {isDarkTheme ? (
                  <Moon size={16} className="text-white flex-shrink-0" />
                ) : (
                  <Sun size={16} className="text-slate-900 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-950 dark:text-white leading-snug">
                    Display Appearance
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {isDarkTheme ? 'Deep Obsidian Dark' : 'Porcelain Light Minimalist'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <ToggleSwitch 
                  checked={isDarkTheme} 
                  onChange={() => {
                    playClick();
                    spinGear();
                    if (onToggleTheme) onToggleTheme();
                  }}
                  ariaLabel="Toggle display theme"
                />
                {/* 23px spacer to align with accordion chevron button */}
                <div className="w-[23px] h-[23px]" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* 2. Audio & Sensory Sound FX (Expandable Accordion) */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/15 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 min-w-0">
                {soundsActive ? (
                  <Volume2 size={16} className="text-slate-900 dark:text-white flex-shrink-0" />
                ) : (
                  <VolumeX size={16} className="text-slate-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-950 dark:text-white leading-snug">
                    Sensory Audio &amp; Sound FX
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    Tactile micro-click audio pool &amp; loading chime
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <ToggleSwitch 
                  checked={soundsActive} 
                  onChange={handleMasterSoundToggle} 
                  ariaLabel="Toggle all sound effects"
                />

                <button
                  type="button"
                  onClick={() => handleToggleGroup('sounds')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition cursor-pointer"
                  title="Configure sound channels"
                >
                  <ChevronDown 
                    size={15} 
                    className="transition-transform duration-300" 
                    style={{ transform: expandedGroupId === 'sounds' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
              </div>
            </div>

            {/* Sub-Accordion */}
            <div 
              className={`space-y-2 border-l-2 border-slate-300 dark:border-white/20 ml-2.5 pl-3.5 overflow-hidden ${
                !soundsActive ? 'opacity-40 pointer-events-none' : ''
              }`}
              style={getAccordionStyle(expandedGroupId === 'sounds', '160px')}
            >
              {/* Sound Sub 1: Tactile Button Clicks */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <MousePointer size={13} className={`transition-colors ${clickSoundActive && soundsActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600 opacity-40"}`} />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Tactile Micro-Clicks</span>
                </div>
                <ToggleSwitch 
                  checked={clickSoundActive} 
                  onChange={handleClickSoundToggle} 
                  size="sm"
                  disabled={!soundsActive}
                  ariaLabel="Toggle button click sound"
                />
              </div>

              {/* Sound Sub 2: Loading Splash Chime */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Waves size={13} className={`transition-colors ${splashSoundActive && soundsActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600 opacity-40"}`} />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Loading Splash Chime</span>
                </div>
                <ToggleSwitch 
                  checked={splashSoundActive} 
                  onChange={handleSplashSoundToggle} 
                  size="sm"
                  disabled={!soundsActive}
                  ariaLabel="Toggle loading sound"
                />
              </div>
            </div>
          </div>

          {/* 3. Motion & Animation Dynamics (Expandable Accordion) */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/15 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 min-w-0">
                {motionActive ? (
                  <Activity size={16} className="text-slate-900 dark:text-white flex-shrink-0" />
                ) : (
                  <PauseCircle size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0 opacity-60" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-950 dark:text-white leading-snug">
                    Motion &amp; Visual Kinetics
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    Spring physics, kinetic word rolling, and dust dissolution
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <ToggleSwitch 
                  checked={motionActive} 
                  onChange={handleMasterMotionToggle} 
                  ariaLabel="Toggle motion and animations"
                />

                <button
                  type="button"
                  onClick={() => handleToggleGroup('motion')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition cursor-pointer"
                  title="Configure motion features"
                >
                  <ChevronDown 
                    size={15} 
                    className="transition-transform duration-300" 
                    style={{ transform: expandedGroupId === 'motion' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
              </div>
            </div>

            {/* Sub-Accordion */}
            <div 
              className={`space-y-2 border-l-2 border-slate-300 dark:border-white/20 ml-2.5 pl-3.5 overflow-hidden ${
                !motionActive ? 'opacity-40 pointer-events-none' : ''
              }`}
              style={getAccordionStyle(expandedGroupId === 'motion', '160px')}
            >
              {/* Motion Sub 1: Kinetic Rolling Headlines */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Layers size={13} className={`transition-colors ${kineticActive && motionActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600 opacity-40"}`} />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Kinetic Rolling Headlines</span>
                </div>
                <ToggleSwitch 
                  checked={kineticActive} 
                  onChange={handleKineticToggle} 
                  size="sm"
                  disabled={!motionActive}
                  ariaLabel="Toggle kinetic rolling headlines"
                />
              </div>

              {/* Motion Sub 2: Particle Typography */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className={`transition-colors ${particlesActive && motionActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600 opacity-40"}`} />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Pointillism Particles</span>
                </div>
                <ToggleSwitch 
                  checked={particlesActive} 
                  onChange={handleParticlesToggle} 
                  size="sm"
                  disabled={!motionActive}
                  ariaLabel="Toggle particle effect"
                />
              </div>
            </div>
          </div>

          
        </div>

      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
}
