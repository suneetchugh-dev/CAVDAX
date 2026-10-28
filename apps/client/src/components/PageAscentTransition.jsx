import React, { useEffect, useState } from 'react';

/**
 * PageAscentTransition
 * Ultra-lightweight, GPU-composited page ascent transition component.
 * Produces the signature fluid entry: subtle upward translation + fade-in easing.
 * 
 * @param {React.ReactNode} children - Content of the page/view to animate
 * @param {string|number} routeKey - Unique key representing current route/tab (triggers animation on change)
 * @param {number} distance - Pixels to translate on Y axis during mount (default: 10px)
 * @param {number} duration - Animation duration in milliseconds (default: 240ms)
 * @param {string} className - Optional Tailwind or custom CSS classes
 */
export default function PageAscentTransition({
  children,
  routeKey,
  distance = 10,
  duration = 240,
  className = ''
}) {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [routeKey, duration]);

  // Respect OS-level reduced motion preferences
  const isReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  if (isReducedMotion || distance === 0) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }

  return (
    <div
      key={routeKey}
      className={`page-ascent-wrapper w-full ${className}`}
      style={{
        animation: animating
          ? `cavdaxPageAscentIn ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) both`
          : 'none',
        willChange: animating ? 'opacity, transform' : 'auto'
      }}
    >
      <style>{`
        @keyframes cavdaxPageAscentIn {
          0% {
            opacity: 0;
            transform: translate3d(0, ${distance}px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .page-ascent-wrapper {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}
