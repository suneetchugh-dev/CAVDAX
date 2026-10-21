import React, { useEffect, useRef, useState } from 'react';

/**
 * SpotlightDataRain.jsx
 * CAVDAX Refined Monochromatic Data Rain with Cursor Spotlight Mask
 * 
 * - Pristine Void by Default: When idle or outside, the background is 100% clean obsidian/porcelain void.
 * - Interactive Causal Discovery: A soft circular aperture (~320px radius) follows the cursor, revealing
 *   streaming causal provenance data trails underneath the surface.
 * - Monochromatic & Dual-Theme:
 *     Dark Mode: Porcelain & soft white trails with subtle warm amber micro-sparks.
 *     Light Mode: Slate-950 obsidian ink trails.
 * - High-efficiency lightweight physics: ~420 particles, GPU-accelerated canvas.
 * - Pointer-events-none: Zero obstruction of buttons, lamp cord, or text.
 */
export default function SpotlightDataRain({ isDarkTheme = true, opacity = 1 }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let isRunning = true;

    // Spotlight physics state
    const curPos = { x: -1000, y: -1000 };
    const tgtPos = { x: -1000, y: -1000 };
    let idleTimer = null;

    // ─── Particle Buffer Setup (~420 particles for silky 60fps) ─────────────
    const COUNT = 420;
    const HISTORY_LEN = 14;
    const STEP = 1 / 60;

    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);
    const vx = new Float32Array(COUNT);
    const vy = new Float32Array(COUNT);
    const pz = new Float32Array(COUNT); // depth factor (0.35 to 1.0)
    const baseSpeed = new Float32Array(COUNT);
    const historyX = new Float32Array(COUNT * HISTORY_LEN);
    const historyY = new Float32Array(COUNT * HISTORY_LEN);
    const sparkAlpha = new Float32Array(COUNT);
    let headIdx = 0;
    let time = 0;

    const seedParticle = (i, uniform = false) => {
      px[i] = uniform ? Math.random() * width : -20 + Math.random() * (width + 40);
      py[i] = uniform ? Math.random() * height : -30 - Math.random() * 60;
      pz[i] = 0.4 + Math.random() * 0.6;
      baseSpeed[i] = (65 + Math.random() * 85) * pz[i];
      vx[i] = 0;
      vy[i] = baseSpeed[i];
      sparkAlpha[i] = Math.random() < 0.09 ? 1 : 0;

      const base = i * HISTORY_LEN;
      for (let k = 0; k < HISTORY_LEN; k++) {
        historyX[base + k] = px[i];
        historyY[base + k] = py[i];
      }
    };

    const handleResize = () => {
      const parent = container.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, rect.width || window.innerWidth);
      height = Math.max(1, rect.height || window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      for (let i = 0; i < COUNT; i++) {
        seedParticle(i, true);
      }
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    if (container.parentElement) ro.observe(container.parentElement);

    // ─── Pointer Event Listener ──────────────────────────────────────────────
    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      tgtPos.x = x;
      tgtPos.y = y;

      if (curPos.x < -500) {
        curPos.x = x;
        curPos.y = y;
      }

      setIsVisible(true);

      // Reset idle timer (fades out smoothly after 2.8s of inactivity)
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsVisible(false);
      }, 2800);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // ─── Theme Colors ────────────────────────────────────────────────────────
    const getColors = () => {
      if (isDarkTheme) {
        return {
          primary: [255, 255, 255],     // Pure crisp white
          secondary: [226, 232, 240],   // Slate-200
          accent: [217, 163, 83],       // CAVDAX warm amber core
        };
      } else {
        return {
          primary: [15, 23, 42],        // Slate-950 obsidian ink
          secondary: [51, 65, 85],      // Slate-700
          accent: [180, 83, 9],         // Deep amber ink
        };
      }
    };

    // ─── Physics Simulation ──────────────────────────────────────────────────
    const updatePhysics = () => {
      headIdx = (headIdx + 1) % HISTORY_LEN;
      time += STEP;

      const cursorX = tgtPos.x;
      const cursorY = tgtPos.y;
      const hasCursor = cursorX > -500 && cursorY > -500;
      const obstacleRadius = 85;

      for (let i = 0; i < COUNT; i++) {
        const sway = Math.sin(time * 1.6 + px[i] * 0.006) * 11 * pz[i];
        let targetVx = sway;
        let targetVy = baseSpeed[i];

        if (hasCursor) {
          const dx = px[i] - cursorX;
          const dy = py[i] - cursorY;
          const distSq = dx * dx + dy * dy;
          if (distSq < obstacleRadius * obstacleRadius) {
            const dist = Math.sqrt(distSq) || 1;
            const push = (1 - dist / obstacleRadius) * 100;
            targetVx += (dx / dist) * push;
            targetVy += (dy / dist) * push * 0.35;
          }
        }

        vx[i] += (targetVx - vx[i]) * 0.12;
        vy[i] += (targetVy - vy[i]) * 0.12;

        px[i] += vx[i] * STEP;
        py[i] += vy[i] * STEP;

        if (Math.random() < 0.001) {
          sparkAlpha[i] = 1;
        } else {
          sparkAlpha[i] *= 0.94;
        }

        const slot = i * HISTORY_LEN + headIdx;
        historyX[slot] = px[i];
        historyY[slot] = py[i];

        if (py[i] > height + 30 || px[i] < -30 || px[i] > width + 30) {
          seedParticle(i, false);
        }
      }
    };

    // ─── Render Canvas ───────────────────────────────────────────────────────
    const render = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const colors = getColors();

      for (let i = 0; i < COUNT; i++) {
        const base = i * HISTORY_LEN;
        const depth = pz[i];
        const isSpark = sparkAlpha[i] > 0.15;

        const c = isSpark ? colors.accent : (depth > 0.7 ? colors.primary : colors.secondary);
        const maxAlpha = (isDarkTheme ? 0.44 : 0.32) * depth * (isSpark ? 1.6 : 1);

        ctx.beginPath();
        let idx = headIdx;
        ctx.moveTo(historyX[base + idx], historyY[base + idx]);

        for (let k = 1; k < HISTORY_LEN; k++) {
          idx = idx === 0 ? HISTORY_LEN - 1 : idx - 1;
          ctx.lineTo(historyX[base + idx], historyY[base + idx]);
        }

        ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${maxAlpha.toFixed(3)})`;
        ctx.lineWidth = depth * (isSpark ? 1.6 : 1.1);
        ctx.lineCap = 'round';
        ctx.stroke();

        const headX = historyX[base + headIdx];
        const headY = historyY[base + headIdx];
        ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${(maxAlpha * 1.8).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(headX, headY, depth * (isSpark ? 1.8 : 1.15), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // ─── Main Unified Animation Loop ─────────────────────────────────────────
    const loop = () => {
      if (!isRunning) return;

      curPos.x += (tgtPos.x - curPos.x) * 0.18;
      curPos.y += (tgtPos.y - curPos.y) * 0.18;

      if (curPos.x > -500 && curPos.y > -500) {
        const mask = `radial-gradient(circle 320px at ${curPos.x.toFixed(1)}px ${curPos.y.toFixed(1)}px, black 0%, rgba(0,0,0,0.6) 60%, transparent 100%)`;
        container.style.webkitMaskImage = mask;
        container.style.maskImage = mask;
      }

      updatePhysics();
      render();

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    const handleVisibility = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(rafId);
      } else {
        if (!isRunning) {
          isRunning = true;
          rafId = requestAnimationFrame(loop);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      ro.disconnect();
    };
  }, [isDarkTheme]);

  return (
    <div 
      ref={containerRef}
      aria-hidden="true"
      style={{ 
        opacity: isVisible ? opacity : 0,
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
      }}
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden will-change-[opacity,mask-image]"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block filter blur-[0.3px]"
      />
    </div>
  );
}
