import React, { useState, useEffect } from 'react';
import { 
  Settings, 
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
 * Ported from SAHNIRMAAN: clean semantic React button slider with zero outline artifacts.
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
        className={`inline-block rounded-full transition-transform duration-300 shadow-xs pointer-events-none border border-transparent ${
          isSmall ? 'w-4 h-4' : 'w-5 h-5'
        } ${
          checked 
            ? 'bg-white dark:bg-black' 
            : 'bg-white dark:bg-neutral-300'
        }`}
        style={{
          transform: checked 
            ? (isSmall ? 'translateX(16px)' : 'translateX(20px)') 
            : 'translateX(0px)'
        }}
      />
    </button>
  );
}

/**
 * PreferencesModal
 * Replicates SAHNIRMAAN's luxury monochromatic settings modal:
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Dialog Card (Ported from SAHNIRMAAN Luxury Architectural Shell) */}
      <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar bg-white/95 dark:bg-[#0A0D12] border border-slate-200/90 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl animate-in zoom-in-95 duration-250 p-4 sm:p-7">
        
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
            Configure telemetry channels, sensory audio feedback, visual kinetics, and platform state.
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
                    {isDarkTheme ? 'Deep Obsidian Void (#060709)' : 'Porcelain Light Minimalist (#F8FAFC)'}
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
                  <MousePointer size={13} className="text-slate-600 dark:text-slate-400" />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Tactile Micro-Clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playClick()}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition"
                  >
                    Test
                  </button>
                  <ToggleSwitch 
                    checked={clickSoundActive} 
                    onChange={handleClickSoundToggle} 
                    size="sm"
                    disabled={!soundsActive}
                    ariaLabel="Toggle button click sound"
                  />
                </div>
              </div>

              {/* Sound Sub 2: Loading Splash Chime */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Waves size={13} className="text-slate-600 dark:text-slate-400" />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">Loading Splash Chime</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playLoadingSound()}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition"
                  >
                    Test
                  </button>
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
          </div>

          {/* 3. Motion & Animation Dynamics (Expandable Accordion) */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/15 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 min-w-0">
                <Activity size={16} className="text-slate-900 dark:text-white flex-shrink-0" />
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
                  <Layers size={13} className="text-slate-600 dark:text-slate-400" />
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
                  <Sparkles size={13} className="text-slate-600 dark:text-slate-400" />
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

                    {/* 5. Keyboard Shortcuts HUD */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/15 transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 min-w-0">
                <KeyboardIcon size={16} className="text-slate-900 dark:text-white flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-950 dark:text-white leading-snug">
                    Keyboard Shortcuts Guide
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    Universal keybindings for navigation, HUD controls &amp; workflow
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  if (onOpenShortcuts) onOpenShortcuts();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition shadow-xs flex-shrink-0 bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>View</span>
                <kbd className="px-1 py-0.2 rounded bg-black/10 dark:bg-white/20 text-[10px]">?</kbd>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
