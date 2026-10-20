import React, { useEffect, useRef } from 'react';
import { CAVDAX_WORDMARK_LETTERS_PATH } from './CavdaxWordmark';

/**
 * FooterParticles Component
 * CAVDAX Stippled Pointillism Particle Engine & Dissolve Scattering.
 * Rasterizes "CAVDAX" text onto an offscreen canvas and simulates real-time quadratic
 * repulsion physics and spring-damping return.
 */
export default function FooterParticles({ text = 'CAVDAX' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId = null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = {
      x: -9999,
      y: -9999,
      radius: 120,
      hoverIntensity: 0,
    };

    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();

      width = Math.floor(rect.width) || window.innerWidth;
      height = Math.max(140, Math.min(240, Math.floor(width * 0.18)));

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      mouse.radius = Math.max(80, Math.min(150, width * 0.12));
      generateParticles();
    };

    const generateParticles = () => {
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      offscreen.width = width;
      offscreen.height = height;

      const isCavdax = typeof text === 'string' && text.trim().toUpperCase() === 'CAVDAX';

      if (isCavdax && typeof Path2D !== 'undefined') {
        // EXACT WORDMARK VECTOR RASTERIZATION (1:1 Architectural Typography Fidelity)
        // CAVDAX bespoke letterforms bounding box: width: 954.4, height: 168.4, center: (499.1, 104.4)
        const path = new Path2D(CAVDAX_WORDMARK_LETTERS_PATH);
        const maxScaleW = (width * 0.88) / 954.4;
        const maxScaleH = (height * 0.72) / 168.4;
        const scale = Math.min(maxScaleW, maxScaleH);

        const drawX = width / 2 - 499.1 * scale;
        const drawY = height / 2 - 104.4 * scale;

        offCtx.save();
        offCtx.translate(drawX, drawY);
        offCtx.scale(scale, scale);
        offCtx.fillStyle = '#ffffff';
        offCtx.fill(path, 'evenodd');
        offCtx.restore();
      } else {
        // Fallback / Generic Text: Enforce Swiss Architectural Grotesk Typography
        // Space Grotesk 900 Ultra-Black weight, uppercase, wide tracking (matching Wordmark DNA)
        let fontSize = Math.floor(width / (text.length * 0.62));
        fontSize = Math.max(36, Math.min(fontSize, 120));

        offCtx.font = `900 ${fontSize}px "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillStyle = '#ffffff';
        if ('letterSpacing' in offCtx) {
          offCtx.letterSpacing = '0.04em';
        }
        offCtx.fillText(text, width / 2, height / 2);
      }

      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const step = width < 600 ? 5 : 4;
      const newParticles = [];

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];

          if (alpha > 128) {
            newParticles.push({
              x: x + (Math.random() - 0.5) * 2,
              y: y + (Math.random() - 0.5) * 2,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              size: Math.random() > 0.85 ? 2.2 : 1.4,
              alpha: (alpha / 255) * (0.4 + Math.random() * 0.5),
              spring: 0.05 + Math.random() * 0.03,
              friction: 0.84 + Math.random() * 0.04,
              disperseForce: 1.4 + Math.random() * 0.8,
              isDissolving: false,
              ashVx: 0,
              ashVy: 0,
            });
          }
        }
      }

      particlesRef.current = newParticles;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.isDissolving) {
          p.x += p.ashVx;
          p.y += p.ashVy;
          p.alpha *= 0.94;
        } else {
          // Quadratic Repulsion Physics
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 0) {
            const normDist = dist / mouse.radius;
            const force = Math.pow(1 - normDist, 2) * 8 * p.disperseForce;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          }

          // Spring-Damping Return Physics
          p.vx += (p.originX - p.x) * p.spring;
          p.vy += (p.originY - p.y) * p.spring;
          p.vx *= p.friction;
          p.vy *= p.friction;

          p.x += p.vx;
          p.y += p.vy;
        }

        if (p.alpha > 0.02) {
          const isDark = document.documentElement.classList.contains('dark');
          if (isDark) {
            // Premium chromatic golden-amber gradient across particle typography:
            // Top: Radiant Topaz Gold (251, 191, 36) -> Center: Warm Amber (217, 163, 83) -> Bottom: Burnished Bronze (180, 130, 60)
            const yRatio = height > 0 ? Math.max(0, Math.min(1, p.y / height)) : 0.5;
            const r = Math.round(251 - yRatio * 42);   // 251 -> 209
            const g = Math.round(191 - yRatio * 38);   // 191 -> 153
            const b = Math.round(36 + yRatio * 40);    // 36 -> 76
            const alphaMultiplier = p.size > 2.0 ? 1.0 : 0.92;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * alphaMultiplier})`;
          } else {
            // Light theme: crisp architectural deep slate
            ctx.fillStyle = `rgba(15, 23, 42, ${p.alpha * 0.95})`;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener('resize', resize);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    resize();
    render();

    const handleDissolveEvent = () => {
      particlesRef.current.forEach((p) => {
        p.isDissolving = true;
        p.ashVx = (Math.random() - 0.5) * 8;
        p.ashVy = -Math.random() * 6 - 2;
      });

      setTimeout(() => {
        particlesRef.current.forEach((p) => {
          p.isDissolving = false;
          p.x = p.originX + (Math.random() - 0.5) * 100;
          p.y = p.originY + (Math.random() - 0.5) * 100;
          p.alpha = 0.7;
        });
      }, 1200);
    };

    window.addEventListener('cavdax:dissolve-particles', handleDissolveEvent);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('cavdax:dissolve-particles', handleDissolveEvent);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return (
    <footer className="relative w-full border-t border-slate-300 dark:border-white/10 bg-[var(--bg-main)] pt-8 pb-8 overflow-hidden select-none transition-colors duration-200">
      {/* Particle Canvas Container */}
      <div ref={containerRef} className="relative w-full flex items-center justify-center cursor-crosshair">
        <canvas ref={canvasRef} className="block" />
      </div>

      {/* Footer Meta & Copyright */}
      <div className="max-w-7xl mx-auto px-6 mt-6 pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-500 font-mono gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-950 dark:text-slate-200">CAVDAX</span>
          <span>•</span>
          <span>Contextual Action & Verified Decision Autonomous eXecution</span>
        </div>
        <div className="flex items-center gap-3">
          <span>WeMakeDevs × FalkorDB Graph Hacks</span>
          <span>•</span>
          <span>GNU GPL 3.0</span>
        </div>
      </div>
    </footer>
  );
}
