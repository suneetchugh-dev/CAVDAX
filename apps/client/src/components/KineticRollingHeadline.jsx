import React, { useState, useEffect } from 'react';

/**
 * KineticRollingHeadline
 * Ported from CAVDAX with high-precision cubic-bezier physics.
 * Smoothly rolls phrases vertically with blur and spring-like inertia.
 * Zero layout-shift grid locking and generous descender headroom (pb-2.5 leading-[1.3]).
 */
export default function KineticRollingHeadline({
  phrases = [
    "In Autonomous AI Coding Agents",
    "Across Multi-Hop Git Commits",
    "Inside Model Context Protocols",
    "For Deterministic Agentic Workflows"
  ],
  className = ''
}) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevIndex(index);
      setAnimating(true);
      setIndex((prev) => (prev + 1) % phrases.length);

      const endTimer = setTimeout(() => {
        setAnimating(false);
        setPrevIndex(null);
      }, 700);

      return () => clearTimeout(endTimer);
    }, 3200);

    return () => clearInterval(timer);
  }, [index, phrases.length]);

  const current = phrases[index] || phrases[0];
  const previous = prevIndex !== null ? phrases[prevIndex] : null;

  return (
    <span className={`inline-grid grid-cols-1 grid-rows-1 relative overflow-hidden align-baseline py-2 -my-2 pb-2 leading-[1.3] flex-shrink-0 ${className}`}>
      {/* Permanent multi-phrase baseline sizers — locks grid column width to the widest phrase to permanently eliminate layout shift */}
      {phrases.map((phrase, pIdx) => (
        <span
          key={pIdx}
          aria-hidden="true"
          className="invisible opacity-0 select-none pointer-events-none col-start-1 row-start-1 whitespace-nowrap pb-2 leading-[1.3] font-black"
        >
          {phrase}
        </span>
      ))}

      {/* Outgoing Phrase: Slides UP smoothly (-115%) and fades with blur */}
      {animating && previous && (
        <span
          className="kinetic-phrase-gradient col-start-1 row-start-1 whitespace-nowrap will-change-transform pb-2 leading-[1.3] font-black"
          style={{
            animation: 'kineticWordRollUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {previous}
        </span>
      )}

      {/* Incoming Phrase: Rises from BOTTOM (115% -> 0%) into position */}
      <span
        className="kinetic-phrase-gradient col-start-1 row-start-1 whitespace-nowrap will-change-transform pb-2 leading-[1.3] font-black"
        style={animating ? {
          animation: 'kineticWordRollIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        } : undefined}
      >
        {current}
      </span>
    </span>
  );
}
