import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findSystemBrowser() {
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const p of chromePaths) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

const wordmarksDir = path.resolve(__dirname, '../docs/brand_explorations/wordmarks');
const logosDir = path.resolve(__dirname, '../docs/brand_explorations/logos');

if (!fs.existsSync(wordmarksDir)) fs.mkdirSync(wordmarksDir, { recursive: true });
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

// Common CSS & font loading
const baseHead = `
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,600;0,700;1,700&family=JetBrains+Mono:wght@500;700&family=Orbitron:wght@800;900&family=Rajdhani:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #000000;
    width: 1920px;
    height: 1080px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: 'Rajdhani', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #FFFFFF;
  }
</style>
`;

// 1. Mark VII Hot-Rod Crimson & Gold Titanium Armor Wordmark
function htmlMarkArmorWordmark() {
  return `<!DOCTYPE html>
<html>
<head>
${baseHead}
<style>
  .stage {
    position: relative;
    width: 1600px;
    height: 820px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 55px 70px 50px 70px;
    border-radius: 24px;
    background: radial-gradient(circle at 50% 45%, #180507 0%, #0c0203 50%, #050102 90%);
    border: 1px solid rgba(212, 175, 55, 0.25);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), 0 0 80px -20px rgba(184, 15, 23, 0.25), inset 0 0 120px rgba(0,0,0,0.8);
    overflow: hidden;
  }

  /* Micro Arc Reactor Background Atmosphere */
  .stage::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 900px;
    height: 350px;
    transform: translate(-50%, -50%);
    background: radial-gradient(ellipse at center, rgba(0, 240, 255, 0.08) 0%, rgba(212, 175, 55, 0.05) 40%, transparent 75%);
    pointer-events: none;
  }

  /* Aerospace Blueprint Corner Reticles */
  .corner-reticle {
    position: absolute;
    width: 24px;
    height: 24px;
    border-color: rgba(212, 175, 55, 0.5);
    pointer-events: none;
  }
  .top-left { top: 24px; left: 24px; border-top: 2px solid; border-left: 2px solid; }
  .top-right { top: 24px; right: 24px; border-top: 2px solid; border-right: 2px solid; }
  .bottom-left { bottom: 24px; left: 24px; border-bottom: 2px solid; border-left: 2px solid; }
  .bottom-right { bottom: 24px; right: 24px; border-bottom: 2px solid; border-right: 2px solid; }

  .header-meta {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    padding-bottom: 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: #D4AF37;
  }

  .title-tag {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .stark-crest {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #00F0FF;
    box-shadow: 0 0 10px #00F0FF;
    border-radius: 50%;
  }

  .canvas-center {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: auto 0;
  }

  .footer-meta {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(212, 175, 55, 0.2);
    padding-top: 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.18em;
    color: #9E8338;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="corner-reticle top-left"></div>
    <div class="corner-reticle top-right"></div>
    <div class="corner-reticle bottom-left"></div>
    <div class="corner-reticle bottom-right"></div>

    <div class="header-meta">
      <div class="title-tag">
        <span class="stark-crest"></span>
        <span>STARK INDUSTRIES SPECIFICATION • MARK VII ARCHITECTURE</span>
      </div>
      <div>CAUSAL ENGINE SERIES | DEPLOYMENT SPEC 08-MK</div>
      <div>SEC-LEVEL: RED PROTOCOL</div>
    </div>

    <div class="canvas-center">
      <svg viewBox="0 0 1360 320" width="1340" style="overflow: visible;">
        <defs>
          <!-- Stark Gold Titanium Linear Gradient -->
          <linearGradient id="goldTitaniumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFF5B8" />
            <stop offset="25%" stop-color="#EAC159" />
            <stop offset="50%" stop-color="#C59326" />
            <stop offset="75%" stop-color="#946513" />
            <stop offset="100%" stop-color="#5E3E07" />
          </linearGradient>

          <!-- Hot-Rod Crimson Armor Chiseled Extrusion -->
          <linearGradient id="crimsonArmorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FF2E3B" />
            <stop offset="30%" stop-color="#B80F17" />
            <stop offset="70%" stop-color="#6E050A" />
            <stop offset="100%" stop-color="#2E0103" />
          </linearGradient>

          <!-- Arc Reactor Cyan Beam -->
          <linearGradient id="arcReactorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#00F0FF" />
            <stop offset="50%" stop-color="#7DF9FF" />
            <stop offset="100%" stop-color="#00B4D8" />
          </linearGradient>

          <!-- Drop Shadow Filter for Armor Plating -->
          <filter id="armorExtrusion" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="0" flood-color="#3A0205" flood-opacity="1" />
            <feDropShadow dx="0" dy="12" stdDeviation="8" flood-color="#000000" flood-opacity="0.9" />
          </filter>

          <!-- Core Arc Reactor Glow Filter -->
          <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Dynamic Oblique Angle Container (14deg forward rake) -->
        <g transform="skewX(-14) translate(40, 0)">
          <!-- Background Armor Extrusion Silhouette -->
          <text
            x="640"
            y="170"
            text-anchor="middle"
            fill="url(#crimsonArmorGrad)"
            stroke="#1A0103"
            stroke-width="12"
            stroke-linejoin="miter"
            style="
              font-family: 'Orbitron', 'Chakra Petch', sans-serif;
              font-size: 190px;
              font-weight: 900;
              letter-spacing: 0.14em;
              text-rendering: geometricPrecision;
            "
          >CAVDAX</text>

          <!-- Outer Bevel Stroke -->
          <text
            x="640"
            y="170"
            text-anchor="middle"
            fill="none"
            stroke="#FFE685"
            stroke-width="3"
            stroke-opacity="0.8"
            style="
              font-family: 'Orbitron', 'Chakra Petch', sans-serif;
              font-size: 190px;
              font-weight: 900;
              letter-spacing: 0.14em;
              text-rendering: geometricPrecision;
            "
          >CAVDAX</text>

          <!-- Foreground Gold Titanium Face -->
          <text
            x="640"
            y="170"
            text-anchor="middle"
            fill="url(#goldTitaniumGrad)"
            filter="url(#armorExtrusion)"
            style="
              font-family: 'Orbitron', 'Chakra Petch', sans-serif;
              font-size: 190px;
              font-weight: 900;
              letter-spacing: 0.14em;
              text-rendering: geometricPrecision;
            "
          >CAVDAX</text>

          <!-- Horizontal Armor Seam Cutline (Interlocking Chassis Seam) -->
          <line
            x1="180"
            y1="102"
            x2="1100"
            y2="102"
            stroke="#150204"
            stroke-width="2.5"
            stroke-dasharray="14 4 48 4 90 4 32 4"
            opacity="0.9"
          />

          <!-- Internal Arc Energy Filament inside the Armor Cut -->
          <line
            x1="180"
            y1="102"
            x2="1100"
            y2="102"
            stroke="#00F0FF"
            stroke-width="1.2"
            stroke-dasharray="0 18 12 50 20 94"
            filter="url(#arcGlow)"
          />
        </g>

        <!-- Baseline Directed Causal Energy Conduit -->
        <g id="baselineConduit">
          <!-- Background Glow Halo -->
          <line
            x1="260"
            y1="230"
            x2="1090"
            y2="230"
            stroke="#00F0FF"
            stroke-width="6"
            stroke-opacity="0.3"
            stroke-linecap="round"
            filter="url(#arcGlow)"
          />

          <!-- Sleek Titanium Gold Conduit Track -->
          <line
            x1="260"
            y1="230"
            x2="1090"
            y2="230"
            stroke="url(#goldTitaniumGrad)"
            stroke-width="2.6"
            stroke-linecap="round"
          />

          <!-- Active Arc Energy Fiber Line -->
          <line
            x1="260"
            y1="230"
            x2="1090"
            y2="230"
            stroke="#00F0FF"
            stroke-width="1.4"
            stroke-linecap="round"
          />

          <!-- Terminal Repulsor Vector Chevron -->
          <polygon
            points="1090,222 1106,230 1090,238 1095,230"
            fill="#00F0FF"
            filter="url(#arcGlow)"
          />
          <polygon
            points="1090,222 1106,230 1090,238 1095,230"
            fill="#FFF5B8"
          />

          <!-- Origin Node C: Arc Reactor Miniaturized Core -->
          <g transform="translate(320, 230)">
            <circle r="14" fill="#0c0203" stroke="url(#goldTitaniumGrad)" stroke-width="2" />
            <circle r="9" fill="none" stroke="#00F0FF" stroke-width="1.5" stroke-dasharray="3 2" />
            <circle r="4.5" fill="#FFFFFF" filter="url(#arcGlow)" />
          </g>

          <!-- Intermediate Gate V: Causal Pivot Reticle -->
          <g transform="translate(675, 230)">
            <circle r="9" fill="#0c0203" stroke="url(#goldTitaniumGrad)" stroke-width="2" />
            <circle r="4" fill="#00F0FF" filter="url(#arcGlow)" />
            <line x1="-12" y1="0" x2="-9" y2="0" stroke="#00F0FF" stroke-width="1.5" />
            <line x1="9" y1="0" x2="12" y2="0" stroke="#00F0FF" stroke-width="1.5" />
          </g>

          <!-- Execution Gate D: Invalidation Micro-Node -->
          <g transform="translate(850, 230)">
            <circle r="5.5" fill="url(#goldTitaniumGrad)" />
            <circle r="2.5" fill="#00F0FF" />
          </g>
        </g>
      </svg>
    </div>

    <div class="footer-meta">
      <div>DISCRETE CAUSAL ENCLAVE | DETERMINISTIC STATE GRAPH</div>
      <div>ARC REACTOR CORE: 3.8 GJ/S • DIRECTED REASONING LATENCY &lt;0.12MS</div>
      <div>ARMOR COMPOSITE: TI-994 GOLD ALLOY</div>
    </div>
  </div>
</body>
</html>`;
}

// 2. Stealth Ops Titanium & Ice-Blue Arc Reactor Wordmark
function htmlStealthPalladiumWordmark() {
  return `<!DOCTYPE html>
<html>
<head>
${baseHead}
<style>
  .stage {
    position: relative;
    width: 1600px;
    height: 820px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 55px 70px 50px 70px;
    border-radius: 24px;
    background: radial-gradient(circle at 50% 50%, #0d1117 0%, #080a0e 55%, #030406 100%);
    border: 1px solid rgba(0, 240, 255, 0.2);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), 0 0 60px -15px rgba(0, 240, 255, 0.15), inset 0 0 100px rgba(0,0,0,0.85);
    overflow: hidden;
  }

  /* Coordinate Grid Background */
  .stage::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .corner-reticle {
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: rgba(0, 240, 255, 0.5);
    pointer-events: none;
  }
  .top-left { top: 24px; left: 24px; border-top: 2px solid; border-left: 2px solid; }
  .top-right { top: 24px; right: 24px; border-top: 2px solid; border-right: 2px solid; }
  .bottom-left { bottom: 24px; left: 24px; border-bottom: 2px solid; border-left: 2px solid; }
  .bottom-right { bottom: 24px; right: 24px; border-bottom: 2px solid; border-right: 2px solid; }

  .header-meta {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 240, 255, 0.15);
    padding-bottom: 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #38BDF8;
  }

  .canvas-center {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: auto 0;
  }

  .footer-meta {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(0, 240, 255, 0.15);
    padding-top: 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.18em;
    color: #64748B;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="corner-reticle top-left"></div>
    <div class="corner-reticle top-right"></div>
    <div class="corner-reticle bottom-left"></div>
    <div class="corner-reticle bottom-right"></div>

    <div class="header-meta">
      <div>STARK TACTICAL LABS • MARK XVI STEALTH CHASSIS</div>
      <div>PALLADIUM-CORE CAUSAL VECTOR</div>
      <div>STATUS: INTERCEPTOR ACTIVE</div>
    </div>

    <div class="canvas-center">
      <svg viewBox="0 0 1360 320" width="1340" style="overflow: visible;">
        <defs>
          <!-- Brushed Titanium Monolith Gradient -->
          <linearGradient id="titaniumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="25%" stop-color="#E2E8F0" />
            <stop offset="55%" stop-color="#94A3B8" />
            <stop offset="85%" stop-color="#475569" />
            <stop offset="100%" stop-color="#1E293B" />
          </linearGradient>

          <!-- Matte Tungsten Extrusion -->
          <linearGradient id="tungstenExtrusion" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#334155" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>

          <!-- Core Arc Cyan Glow Filter -->
          <filter id="arcLaserGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="10" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- 15deg Precision Forward Rake -->
        <g transform="skewX(-15) translate(40, 0)">
          <!-- Base Extrusion Shadow -->
          <text
            x="640"
            y="170"
            text-anchor="middle"
            fill="url(#tungstenExtrusion)"
            stroke="#020617"
            stroke-width="14"
            style="
              font-family: 'Orbitron', 'Rajdhani', sans-serif;
              font-size: 192px;
              font-weight: 900;
              letter-spacing: 0.15em;
              text-rendering: geometricPrecision;
            "
          >CAVDAX</text>

          <!-- Laser-Etched Cyan Rim -->
          <text
            x="640"
            y="170"
            text-anchor="middle"
            fill="none"
            stroke="#00F0FF"
            stroke-width="2.2"
            filter="url(#arcLaserGlow)"
            style="
              font-family: 'Orbitron', 'Rajdhani', sans-serif;
              font-size: 192px;
              font-weight: 900;
              letter-spacing: 0.15em;
              text-rendering: geometricPrecision;
            "
          >CAVDAX</text>

          <!-- Main Brushed Titanium Face -->
          <text
            x="640"
            y="170"
            text-anchor="middle"
            fill="url(#titaniumGrad)"
            style="
              font-family: 'Orbitron', 'Rajdhani', sans-serif;
              font-size: 192px;
              font-weight: 900;
              letter-spacing: 0.15em;
              text-rendering: geometricPrecision;
            "
          >CAVDAX</text>

          <!-- Stencil Laser Cuts (Precision Aerospace Segments) -->
          <line x1="200" y1="110" x2="1080" y2="110" stroke="#00F0FF" stroke-width="1.8" filter="url(#arcLaserGlow)" />
          <line x1="200" y1="110" x2="1080" y2="110" stroke="#FFFFFF" stroke-width="1.0" />
        </g>

        <!-- Precision Hairline Vector Conduit -->
        <g id="stealthBaseline">
          <!-- 2.4px Hairline Conduit -->
          <line
            x1="260"
            y1="230"
            x2="1090"
            y2="230"
            stroke="#334155"
            stroke-width="2.4"
            stroke-linecap="round"
          />
          <line
            x1="260"
            y1="230"
            x2="1090"
            y2="230"
            stroke="#00F0FF"
            stroke-width="1.2"
            stroke-linecap="round"
            filter="url(#arcLaserGlow)"
          />

          <!-- Sleek Aerodynamic Terminal Arrow -->
          <polygon
            points="1090,224 1104,230 1090,236 1093,230"
            fill="#00F0FF"
            filter="url(#arcLaserGlow)"
          />
          <polygon
            points="1090,224 1104,230 1090,236 1093,230"
            fill="#FFFFFF"
          />

          <!-- Context Root Micro-Reactor (5.5px Core) -->
          <g transform="translate(320, 230)">
            <circle r="11" fill="#080a0e" stroke="#00F0FF" stroke-width="1.8" />
            <circle r="5.2" fill="#FFFFFF" filter="url(#arcLaserGlow)" />
          </g>

          <!-- Causal Gate Node (5.2px) -->
          <g transform="translate(680, 230)">
            <rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" fill="#080a0e" stroke="#38BDF8" stroke-width="1.6" />
            <circle r="3.2" fill="#00F0FF" filter="url(#arcLaserGlow)" />
          </g>

          <!-- Verification Gate Node (5.2px) -->
          <g transform="translate(860, 230)">
            <circle r="5.2" fill="#00F0FF" filter="url(#arcLaserGlow)" />
            <circle r="2.2" fill="#FFFFFF" />
          </g>
        </g>
      </svg>
    </div>

    <div class="footer-meta">
      <div>DISCRETE CAUSAL ENCLAVE | TACTICAL GRAPH ACCELERATOR</div>
      <div>CORE FREQUENCY: 840 GHZ • PALLADIUM MATRIX ISOLATION</div>
      <div>ENCRYPTED HARDWARE BOUNDARY</div>
    </div>
  </div>
</body>
</html>`;
}

// 3. Arc Reactor Causal DAG Logo / Emblem Mark
function htmlArcReactorDagLogo() {
  return `<!DOCTYPE html>
<html>
<head>
${baseHead}
<style>
  .stage {
    position: relative;
    width: 1440px;
    height: 920px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 55px 70px 50px 70px;
    border-radius: 24px;
    background: radial-gradient(circle at 50% 45%, #150406 0%, #0a0203 50%, #040102 100%);
    border: 1px solid rgba(212, 175, 55, 0.3);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), 0 0 80px -15px rgba(212, 175, 55, 0.2);
    overflow: hidden;
  }

  .header-meta {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    padding-bottom: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: #D4AF37;
  }

  .center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
    margin: auto 0;
  }

  .typography-lockup {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .wordmark-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 64px;
    font-weight: 900;
    letter-spacing: 0.28em;
    background: linear-gradient(180deg, #FFF5B8 0%, #D4AF37 50%, #8A5F12 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.9));
  }

  .subtitle-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.38em;
    color: #38BDF8;
    text-transform: uppercase;
  }

  .footer-meta {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(212, 175, 55, 0.2);
    padding-top: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.2em;
    color: #9E8338;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="header-meta">
      <div>STARK PROVING GROUNDS • EMBLEM ARCHITECTURE</div>
      <div>ARC REACTOR CAUSAL DAG MARK</div>
      <div>CORE DESIGN: MK-85</div>
    </div>

    <div class="center-content">
      <!-- Arc Reactor Master SVG -->
      <svg viewBox="0 0 540 540" width="460" height="460" style="overflow: visible;">
        <defs>
          <linearGradient id="starkGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF5B8" />
            <stop offset="50%" stop-color="#D4AF37" />
            <stop offset="100%" stop-color="#84570E" />
          </linearGradient>

          <linearGradient id="starkCrimson" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#C41E3A" />
            <stop offset="50%" stop-color="#8B0000" />
            <stop offset="100%" stop-color="#3A0205" />
          </linearGradient>

          <filter id="arcGlowHigh" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur1" />
            <feGaussianBlur stdDeviation="18" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(270, 270)">
          <!-- Outer Titanium Containment Ring -->
          <circle r="230" fill="#0c0203" stroke="url(#starkCrimson)" stroke-width="16" />
          <circle r="230" fill="none" stroke="url(#starkGold)" stroke-width="2" opacity="0.8" />
          <circle r="218" fill="none" stroke="#1A0204" stroke-width="4" />

          <!-- 10 Electromagnetic Copper/Gold Containment Brackets -->
          ${Array.from({ length: 10 }).map((_, i) => {
            const angle = i * 36;
            return `
            <g transform="rotate(${angle})">
              <!-- Coil Block -->
              <rect x="-18" y="-235" width="36" height="34" rx="4" fill="url(#starkGold)" stroke="#3A2202" stroke-width="2" />
              <line x1="-12" y1="-226" x2="12" y2="-226" stroke="#00F0FF" stroke-width="1.8" filter="url(#arcGlowHigh)" />
              <line x1="-12" y1="-216" x2="12" y2="-216" stroke="#00F0FF" stroke-width="1.8" filter="url(#arcGlowHigh)" />
            </g>`;
          }).join('')}

          <!-- Outer Energy Track -->
          <circle r="195" fill="none" stroke="#00F0FF" stroke-width="3" stroke-opacity="0.4" />
          <circle r="195" fill="none" stroke="#7DF9FF" stroke-width="1.5" stroke-dasharray="14 10" filter="url(#arcGlowHigh)" />

          <!-- Intermediate Titanium Armor Chassis Ring -->
          <circle r="172" fill="#070102" stroke="url(#starkCrimson)" stroke-width="8" />
          <circle r="166" fill="none" stroke="url(#starkGold)" stroke-width="2" />

          <!-- Inner Causal DAG Inverted Triangle Core (Ingestion, Validation, Execution) -->
          <!-- Inverted Equilateral Triangle (Mark VI / Mark 85 Arc Geometry) -->
          <polygon
            points="0,135 -117,-68 117,-68"
            fill="#090203"
            stroke="url(#starkGold)"
            stroke-width="10"
            stroke-linejoin="round"
          />

          <!-- Internal Cyan Plasma Energy Wave -->
          <polygon
            points="0,135 -117,-68 117,-68"
            fill="rgba(0, 240, 255, 0.12)"
            stroke="#00F0FF"
            stroke-width="3.5"
            stroke-linejoin="round"
            filter="url(#arcGlowHigh)"
          />

          <!-- Concentric Inner Triangular Core -->
          <polygon
            points="0,105 -91,-52 91,-52"
            fill="none"
            stroke="#FFFFFF"
            stroke-width="1.5"
            stroke-dasharray="6 4"
            filter="url(#arcGlowHigh)"
          />

          <!-- The Three Causal DAG Vertices (Nodes) -->
          <!-- Vertex 1: Ingestion (Top Left) -->
          <g transform="translate(-117, -68)">
            <circle r="18" fill="#080102" stroke="url(#starkGold)" stroke-width="3" />
            <circle r="9" fill="#00F0FF" filter="url(#arcGlowHigh)" />
            <circle r="4" fill="#FFFFFF" />
          </g>

          <!-- Vertex 2: Validation (Top Right) -->
          <g transform="translate(117, -68)">
            <circle r="18" fill="#080102" stroke="url(#starkGold)" stroke-width="3" />
            <circle r="9" fill="#00F0FF" filter="url(#arcGlowHigh)" />
            <circle r="4" fill="#FFFFFF" />
          </g>

          <!-- Vertex 3: Deterministic Execution (Bottom Apex) -->
          <g transform="translate(0, 135)">
            <circle r="22" fill="#080102" stroke="url(#starkCrimson)" stroke-width="3.5" />
            <circle r="11" fill="#00F0FF" filter="url(#arcGlowHigh)" />
            <circle r="5" fill="#FFFFFF" />
          </g>

          <!-- Central Pure White-Hot Arc Nucleus -->
          <circle r="36" fill="#00F0FF" opacity="0.3" filter="url(#arcGlowHigh)" />
          <circle r="24" fill="#080102" stroke="#00F0FF" stroke-width="3" />
          <circle r="14" fill="#FFFFFF" filter="url(#arcGlowHigh)" />

          <!-- Repulsor Directed Radiation Vectors (Causal Directed Edges) -->
          <line x1="-100" y1="-58" x2="-22" y2="-8" stroke="#00F0FF" stroke-width="2" stroke-dasharray="4 2" />
          <line x1="100" y1="-58" x2="22" y2="-8" stroke="#00F0FF" stroke-width="2" stroke-dasharray="4 2" />
          <line x1="0" y1="115" x2="0" y2="24" stroke="#00F0FF" stroke-width="2" stroke-dasharray="4 2" />
        </g>
      </svg>

      <div class="typography-lockup">
        <div class="wordmark-text">CAVDAX</div>
        <div class="subtitle-text">STARK CAUSAL VECTOR ENGINE • HIGH-VELOCITY DAG</div>
      </div>
    </div>

    <div class="footer-meta">
      <div>OUTPUT: 3.8 GJ/S CONTINUOUS</div>
      <div>CORE TOPOLOGY: 3-VERTEX TRIANGULAR CAUSAL DAG</div>
      <div>ALLOY: GOLD TITANIUM MATRIX</div>
    </div>
  </div>
</body>
</html>`;
}

// 4. Master Executive Presentation Board
function htmlMasterSystemBoard() {
  return `<!DOCTYPE html>
<html>
<head>
${baseHead}
<style>
  .stage {
    position: relative;
    width: 1720px;
    height: 960px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 45px 65px;
    border-radius: 28px;
    background: #08090C;
    border: 1px solid rgba(212, 175, 55, 0.25);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), inset 0 0 120px rgba(0,0,0,0.9);
    overflow: hidden;
  }

  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    padding-bottom: 16px;
    font-family: 'JetBrains Mono', monospace;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .header-title {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.24em;
    color: #D4AF37;
    text-transform: uppercase;
  }
  .header-badge {
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid #D4AF37;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: #FFF5B8;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 36px;
    margin: auto 0;
  }

  .card {
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .card-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #94A3B8;
    margin-bottom: 20px;
  }

  .swatches {
    display: flex;
    gap: 14px;
    margin-top: 20px;
  }
  .swatch {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #64748B;
  }
  .swatch-box {
    width: 65px;
    height: 38px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.15);
  }

  .footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(212, 175, 55, 0.2);
    padding-top: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.18em;
    color: #64748B;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="header">
      <div class="header-left">
        <div class="header-title">CAVDAX • STARK AEROSPACE BRAND SYSTEM</div>
        <div class="header-badge">IRON MAN AESTHETIC DOSSIER</div>
      </div>
      <div style="font-size: 13px; color: #38BDF8; letter-spacing: 0.2em;">SPEC: MK-VII &amp; MK-85 UNIFIED</div>
    </div>

    <div class="grid-layout">
      <!-- Left Column: Wordmarks -->
      <div class="card">
        <div>
          <div class="card-label">Primary Aerospace Armor Wordmark (Gold Titanium &amp; Hot-Rod Crimson)</div>
          <svg viewBox="0 0 900 170" width="100%" style="overflow: visible;">
            <defs>
              <linearGradient id="bGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFF5B8" />
                <stop offset="40%" stop-color="#D4AF37" />
                <stop offset="100%" stop-color="#6E4407" />
              </linearGradient>
              <linearGradient id="bCrimson" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FF2E3B" />
                <stop offset="100%" stop-color="#4A0205" />
              </linearGradient>
              <filter id="bGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g transform="skewX(-14) translate(30, 0)">
              <!-- Extrusion Shadow -->
              <text x="400" y="105" text-anchor="middle" fill="url(#bCrimson)" stroke="#1A0103" stroke-width="8" style="font-family: 'Orbitron'; font-size: 110px; font-weight: 900; letter-spacing: 0.15em;">CAVDAX</text>
              <text x="400" y="105" text-anchor="middle" fill="url(#bGold)" style="font-family: 'Orbitron'; font-size: 110px; font-weight: 900; letter-spacing: 0.15em;">CAVDAX</text>
              <line x1="80" y1="65" x2="720" y2="65" stroke="#00F0FF" stroke-width="1.2" filter="url(#bGlow)" stroke-dasharray="0 14 10 35 15 60" />
            </g>
            <line x1="160" y1="140" x2="720" y2="140" stroke="url(#bGold)" stroke-width="2.4" stroke-linecap="round" />
            <line x1="160" y1="140" x2="720" y2="140" stroke="#00F0FF" stroke-width="1.2" filter="url(#bGlow)" />
            <polygon points="720,135 732,140 720,145 723,140" fill="#00F0FF" filter="url(#bGlow)" />
            <circle cx="200" cy="140" r="5.5" fill="#00F0FF" filter="url(#bGlow)" />
            <circle cx="450" cy="140" r="4.5" fill="url(#bGold)" />
            <circle cx="580" cy="140" r="4.5" fill="url(#bGold)" />
          </svg>
        </div>

        <div style="margin-top: 30px;">
          <div class="card-label">Secondary Stealth Ops Wordmark (Brushed Titanium &amp; Ice Cyan)</div>
          <svg viewBox="0 0 900 130" width="100%" style="overflow: visible;">
            <g transform="skewX(-15) translate(30, 0)">
              <text x="400" y="85" text-anchor="middle" fill="#0A0E17" stroke="#00F0FF" stroke-width="2" filter="url(#bGlow)" style="font-family: 'Orbitron'; font-size: 90px; font-weight: 900; letter-spacing: 0.16em;">CAVDAX</text>
              <text x="400" y="85" text-anchor="middle" fill="#E2E8F0" style="font-family: 'Orbitron'; font-size: 90px; font-weight: 900; letter-spacing: 0.16em;">CAVDAX</text>
            </g>
            <line x1="180" y1="112" x2="700" y2="112" stroke="#334155" stroke-width="2.2" />
            <line x1="180" y1="112" x2="700" y2="112" stroke="#00F0FF" stroke-width="1.0" filter="url(#bGlow)" />
            <polygon points="700,108 710,112 700,116 702,112" fill="#00F0FF" />
            <circle cx="220" cy="112" r="4.5" fill="#00F0FF" />
            <circle cx="470" cy="112" r="3.8" fill="#FFFFFF" />
          </svg>
        </div>

        <div class="swatches">
          <div class="swatch">
            <div class="swatch-box" style="background: #D4AF37;"></div>
            <span>TI GOLD</span>
          </div>
          <div class="swatch">
            <div class="swatch-box" style="background: #8B0000;"></div>
            <span>STARK RED</span>
          </div>
          <div class="swatch">
            <div class="swatch-box" style="background: #00F0FF; box-shadow: 0 0 10px rgba(0,240,255,0.4);"></div>
            <span>ARC CYAN</span>
          </div>
          <div class="swatch">
            <div class="swatch-box" style="background: #E2E8F0;"></div>
            <span>TITANIUM</span>
          </div>
          <div class="swatch">
            <div class="swatch-box" style="background: #08090C;"></div>
            <span>OBSIDIAN</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Arc Reactor DAG Emblem -->
      <div class="card" style="align-items: center; justify-content: center; gap: 20px;">
        <div class="card-label" style="align-self: flex-start;">Arc Reactor Causal DAG Emblem</div>
        <svg viewBox="0 0 320 320" width="260" height="260" style="overflow: visible;">
          <g transform="translate(160, 160)">
            <circle r="135" fill="#0a0203" stroke="#8B0000" stroke-width="10" />
            <circle r="135" fill="none" stroke="#D4AF37" stroke-width="2" />
            <!-- Coils -->
            ${Array.from({ length: 8 }).map((_, i) => {
              const a = i * 45;
              return `<g transform="rotate(${a})">
                <rect x="-12" y="-140" width="24" height="20" rx="3" fill="#D4AF37" />
                <line x1="-8" y1="-130" x2="8" y2="-130" stroke="#00F0FF" stroke-width="1.5" />
              </g>`;
            }).join('')}
            <circle r="115" fill="none" stroke="#00F0FF" stroke-width="2" stroke-dasharray="8 6" filter="url(#bGlow)" />
            <polygon points="0,80 -70,-40 70,-40" fill="#070102" stroke="#D4AF37" stroke-width="6" />
            <polygon points="0,80 -70,-40 70,-40" fill="rgba(0,240,255,0.12)" stroke="#00F0FF" stroke-width="2" filter="url(#bGlow)" />
            <circle cx="-70" cy="-40" r="11" fill="#080102" stroke="#D4AF37" stroke-width="2" />
            <circle cx="-70" cy="-40" r="5" fill="#00F0FF" filter="url(#bGlow)" />
            <circle cx="70" cy="-40" r="11" fill="#080102" stroke="#D4AF37" stroke-width="2" />
            <circle cx="70" cy="-40" r="5" fill="#00F0FF" filter="url(#bGlow)" />
            <circle cx="0" cy="80" r="13" fill="#080102" stroke="#8B0000" stroke-width="2.5" />
            <circle cx="0" cy="80" r="6" fill="#00F0FF" filter="url(#bGlow)" />
            <circle r="16" fill="#FFFFFF" filter="url(#bGlow)" />
          </g>
        </svg>
        <div style="text-align: center;">
          <div style="font-family: 'Orbitron'; font-size: 26px; font-weight: 900; letter-spacing: 0.22em; color: #FFF5B8;">CAVDAX</div>
          <div style="font-family: 'JetBrains Mono'; font-size: 11px; letter-spacing: 0.28em; color: #38BDF8; margin-top: 4px;">CAUSAL REACTOR GATE</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>CAVDAX ARCHITECTURAL SPECIFICATION • IRON MAN TYPOGRAPHY STUDY</div>
      <div>14° FORWARD AERODYNAMIC RAKE | CHISELED 45° APEXES | DIRECTED VECTOR CONDUIT</div>
      <div>PROPRIETARY STARK ENCLAVE PROTOCOL</div>
    </div>
  </div>
</body>
</html>`;
}

async function render() {
  const browserPath = findSystemBrowser();
  if (!browserPath) {
    console.error('System browser not found!');
    process.exit(1);
  }

  console.log('Launching browser for Iron Man brand suite generation...');
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const tasks = [
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-01-stark-mark-armor-chassis.jpg'),
      html: htmlMarkArmorWordmark(),
      label: 'Mark VII Hot-Rod Crimson & Gold Titanium Armor Wordmark',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-02-stealth-palladium-reactor.jpg'),
      html: htmlStealthPalladiumWordmark(),
      label: 'Stealth Ops Titanium & Ice-Blue Arc Reactor Wordmark',
    },
    {
      file: path.join(logosDir, 'logo-ironman-01-arc-reactor-causal-dag.jpg'),
      html: htmlArcReactorDagLogo(),
      label: 'Arc Reactor Causal DAG Emblem Mark',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-03-master-system-board.jpg'),
      html: htmlMasterSystemBoard(),
      label: 'Iron Man Aerospace Master Executive Presentation Board',
    },
  ];

  for (const task of tasks) {
    console.log(`Rendering ${task.label}...`);
    await page.setContent(task.html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 450));
    await page.screenshot({ path: task.file, type: 'jpeg', quality: 95 });
    console.log(`Saved: ${task.file}`);
  }

  await browser.close();
  console.log('Iron Man Brand Suite rendering completed successfully.');
}

render().catch((err) => {
  console.error('Rendering error:', err);
  process.exit(1);
});
