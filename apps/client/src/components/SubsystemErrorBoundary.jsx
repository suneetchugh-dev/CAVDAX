/**
 * SubsystemErrorBoundary.jsx — CAVDAX Global React 18 Error Boundary
 *
 * Roadmap §6.2: Every top-level view (AuditPage, DevConsolePage, GraphCanvas,
 * ConnectMcpPage) is wrapped in a localized Error Boundary. If an unexpected
 * runtime rendering error occurs:
 *   - The error is isolated to that specific tab (Header and nav stay intact).
 *   - User sees a double-bezel recovery card, not a blank white crash screen.
 *   - "Reload View" resets the boundary state without a full page refresh.
 *   - Technical details are collapsible (hidden by default).
 *
 * Design System compliance (docs/UI_DESIGN_SYSTEM.md):
 *   - NO emojis — Lucide icons only
 *   - NO colored pulsing orbs — monospace status text
 *   - Double-bezel card geometry
 *   - font-mono for technical details
 */

import React from 'react';
import { AlertTriangle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default class SubsystemErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console for devs — never surface raw stack to end-users
    console.error(`[CAVDAX SubsystemErrorBoundary] Caught in "${this.props.name || 'subsystem'}":`, error, errorInfo);
  }

  handleReloadView = () => {
    // Reset boundary state — React will re-render the children from scratch
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { name = 'Subsystem' } = this.props;
    const { error, errorInfo, showDetails } = this.state;

    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-main,#ffffff)] dark:bg-[#0d0d0f]">
        {/* Outer bezel */}
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0D11] p-1 shadow-sm">
          {/* Inner bezel */}
          <div className="rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0E1118] p-6">

            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  Subsystem Recovered
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
                  {name} encountered an unexpected rendering error. Local state reset required.
                </div>
              </div>
            </div>

            {/* Primary action */}
            <button
              onClick={this.handleReloadView}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                         bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100
                         text-white dark:text-slate-950 text-[12px] font-mono font-semibold
                         transition-colors mb-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload View
            </button>

            {/* Collapsible technical details */}
            <button
              onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                         text-[10px] font-mono text-slate-400 hover:text-slate-600
                         dark:text-slate-600 dark:hover:text-slate-400
                         border border-slate-200 dark:border-white/[0.06]
                         bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02]
                         transition-colors"
            >
              <span>Technical Details</span>
              {showDetails
                ? <ChevronUp className="w-3 h-3" />
                : <ChevronDown className="w-3 h-3" />}
            </button>

            {showDetails && (
              <div className="mt-2 p-3 rounded-lg bg-slate-950/5 dark:bg-black/30
                              border border-slate-200 dark:border-white/[0.06]
                              max-h-40 overflow-y-auto">
                <pre className="text-[9px] font-mono text-slate-500 dark:text-slate-500
                                whitespace-pre-wrap break-all leading-relaxed">
                  {error?.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
