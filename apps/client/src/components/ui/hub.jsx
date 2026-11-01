import React, { useRef, useEffect } from 'react';
import { hub } from '@lucasmarkes/hairline';

/**
 * Hub.jsx — Shadcn-compatible theme wrapper for Hairline's Hub figure.
 * 
 * Supports:
 * - `activeTile`: -1 for Core resting state, 0..7 for solitary elevated tile
 * - Direct programmatic control via hairline engine
 * - Theme-mapped vector tokens: `--hl-plate`, `--hl-hi`, `--hl-edge`, `--hl-lo`
 */
export default function Hub({
  activeTile = -1,
  intensity = 1,
  onRead,
  className = '',
  style = {},
  ...props
}) {
  const containerRef = useRef(null);
  const figureRef = useRef(null);
  const onReadRef = useRef(onRead);

  useEffect(() => {
    onReadRef.current = onRead;
  }, [onRead]);

  useEffect(() => {
    if (!containerRef.current) return;

    const fig = hub(containerRef.current, {
      intensity,
      play: false,
      onRead: (text) => {
        onReadRef.current?.(text);
      }
    });
    figureRef.current = fig; containerRef.current.__hairline = fig;

    // Set initial active tile if specified
    if (activeTile !== undefined && fig.setActiveTile) {
      fig.setActiveTile(activeTile);
    }

    return () => {
      fig.destroy();
      figureRef.current = null;
    };
  }, []);

  // Sync activeTile prop whenever it changes
  useEffect(() => {
    if (figureRef.current?.setActiveTile) {
      figureRef.current.setActiveTile(activeTile);
    }
  }, [activeTile]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full select-none ${className}`}
      style={{
        aspectRatio: '5 / 4',
        ...style
      }}
      {...props}
    />
  );
}
