import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard as KeyboardIcon, Layers, SlidersHorizontal, Cable, Play, Users, Sun, Settings, Compass, RotateCcw } from 'lucide-react';
import { playClick } from '../utils/soundFx';

const SHORTCUT_GROUPS = [
  {
    title: "Global Navigation",
    items: [
      { key: "1", label: "Product Overview", icon: Layers, desc: "Navigate to system landing & architecture" },
      { key: "2", label: "Verification Console", icon: SlidersHorizontal, desc: "Interactive GraphBLAS verification HUD" },
      { key: "3", label: "Connect MCP", icon: Cable, desc: "Agent integration & MCP stdio protocol" },
      { key: "4", label: "Demo Video", icon: Play, desc: "Watch video presentation & live proof" },
      { key: "5", label: "Team Page", icon: Users, desc: "Team Contrarians presentation" },
      { key: "W", label: "Wordmark Intro", icon: Compass, desc: "Jump to pure typographic brand entry" },
    ]
  },
  {
    title: "Actions & Controls",
    items: [
      { key: "D", label: "Toggle Theme", icon: Sun, desc: "Switch between Dark and Light themes" },
      { key: "T", label: "Tour Guide", icon: Compass, desc: "Start / Resume interactive console walkthrough" },
      { key: "R", label: "Reset Demo", icon: RotateCcw, desc: "Reset knowledge graph & verification pipeline" },
      { key: ",", label: "Preferences", icon: Settings, desc: "Open audio, telemetry & HUD preferences" },
      { key: "?", label: "Shortcuts Help", icon: KeyboardIcon, desc: "Toggle this keyboard shortcuts panel" },
      { key: "Esc", label: "Close Overlay", icon: X, desc: "Dismiss active modal, guide or tooltip" },
    ]
  }
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        playClick();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="relative w-full max-w-2xl neo-glass-card rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/95 dark:bg-[#0C0E12]/95 shadow-2xl p-6 sm:p-7 overflow-hidden z-10 text-slate-900 dark:text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <KeyboardIcon size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
                    Keyboard Shortcuts
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 font-normal">
                      HUD
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                    Universal navigation and tactical keyboard controls
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/15 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Close shortcuts modal"
              >
                <X size={15} />
              </button>
            </div>

            {/* Shortcuts Content (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-h-[60vh] overflow-y-auto pr-1">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title} className="flex flex-col gap-2.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-100 dark:border-white/5">
                    {group.title}
                  </span>
                  <div className="flex flex-col gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-100/60 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <Icon size={14} className="shrink-0 text-slate-500 dark:text-slate-400" />
                            <div className="truncate">
                              <span className="text-xs font-medium font-sans text-slate-800 dark:text-slate-200 block truncate">
                                {item.label}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                                {item.desc}
                              </span>
                            </div>
                          </div>
                          <kbd className="shrink-0 px-2.5 py-1 rounded-md bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-mono text-xs font-bold shadow-2xs">
                            {item.key}
                          </kbd>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="text-[11px]">
                Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 border border-slate-300 dark:border-white/15 font-mono text-[10px]">?</kbd> anytime to toggle
              </span>
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="px-3 py-1 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-sans text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
