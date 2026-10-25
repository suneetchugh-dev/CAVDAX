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
if (!fs.existsSync(wordmarksDir)) fs.mkdirSync(wordmarksDir, { recursive: true });

const baseHead = `
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Rajdhani:wght@600;700&display=swap" rel="stylesheet">
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

// Helper to generate the Arc Reactor SVG element
function getArcReactorSvg(cx, cy, r = 26, isTriangular = false) {
  if (isTriangular) {
    return `
      <!-- Triangular Arc Reactor Core -->
      <g transform="translate(${cx}, ${cy})">
        <polygon points="0,${r * 0.9} -${r * 0.8},-${r * 0.5} ${r * 0.8},-${r * 0.5}" fill="#0A0203" stroke="#D4AF37" stroke-width="2.5" />
        <polygon points="0,${r * 0.9} -${r * 0.8},-${r * 0.5} ${r * 0.8},-${r * 0.5}" fill="rgba(0, 240, 255, 0.15)" stroke="#00F0FF" stroke-width="1.8" filter="url(#arcGlow)" />
        <circle r="${r * 0.35}" fill="#00F0FF" opacity="0.3" filter="url(#arcGlow)" />
        <circle r="${r * 0.2}" fill="#FFFFFF" filter="url(#arcGlow)" />
      </g>
    `;
  }
  return `
    <!-- Circular Arc Reactor Core -->
    <g transform="translate(${cx}, ${cy})">
      <!-- Outer Ring -->
      <circle r="${r}" fill="#080203" stroke="#D4AF37" stroke-width="2.2" />
      <circle r="${r * 0.82}" fill="none" stroke="#00F0FF" stroke-width="1.4" stroke-dasharray="4 2.5" filter="url(#arcGlow)" />
      <!-- Copper Coils -->
      ${Array.from({ length: 8 }).map((_, i) => {
        const a = i * 45;
        return `<line x1="0" y1="-${r}" x2="0" y2="-${r * 0.72}" stroke="#D4AF37" stroke-width="2" transform="rotate(${a})" />`;
      }).join('')}
      <!-- Inner Core Ring -->
      <circle r="${r * 0.55}" fill="#0A0E17" stroke="#00F0FF" stroke-width="1.6" />
      <!-- White-Hot Plasma Core -->
      <circle r="${r * 0.32}" fill="#00F0FF" opacity="0.4" filter="url(#arcGlow)" />
      <circle r="${r * 0.18}" fill="#FFFFFF" filter="url(#arcGlow)" />
    </g>
  `;
}

// 1. Classic Hot-Rod Gold & Crimson with Crossbar-less A and Arc Reactor in first A
function htmlCrossbarlessArcCore() {
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
    background: radial-gradient(circle at 50% 48%, #160406 0%, #0b0203 55%, #040102 100%);
    border: 1px solid rgba(212, 175, 55, 0.25);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), 0 0 80px -20px rgba(184, 15, 23, 0.25);
    overflow: hidden;
  }

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
    <div class="header-meta">
      <div>STARK PROVING GROUNDS • MARK VII APERTURE SPECIFICATION</div>
      <div>CROSSBAR-LESS CHEVRON Λ • INTEGRATED ARC REACTOR</div>
      <div>SEC-LEVEL: ALPHA</div>
    </div>

    <div class="canvas-center">
      <svg viewBox="0 0 1360 340" width="1340" style="overflow: visible;">
        <defs>
          <linearGradient id="goldFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFF8C4" />
            <stop offset="30%" stop-color="#E5BE53" />
            <stop offset="60%" stop-color="#B8861B" />
            <stop offset="100%" stop-color="#6E4407" />
          </linearGradient>

          <linearGradient id="crimsonBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FF2E3B" />
            <stop offset="50%" stop-color="#8B0000" />
            <stop offset="100%" stop-color="#2A0103" />
          </linearGradient>

          <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="shadowExtrude" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="2" flood-color="#3A0205" flood-opacity="1" />
            <feDropShadow dx="0" dy="16" stdDeviation="10" flood-color="#000000" flood-opacity="0.9" />
          </filter>
        </defs>

        <!-- Main Letterforms Group (No Crossbar in A, Pure Iron Man Chiseled Geometry) -->
        <g id="letterforms" filter="url(#shadowExtrude)">
          <!-- C (x: 140 to 290) -->
          <path
            d="M 290,95 L 290,60 L 195,60 L 140,115 L 140,175 L 195,230 L 290,230 L 290,195 L 205,195 L 180,170 L 180,120 L 205,95 Z"
            fill="url(#goldFace)"
            stroke="url(#crimsonBevel)"
            stroke-width="5"
            stroke-linejoin="miter"
          />

          <!-- A (1st) - CROSSBAR-LESS CHEVRON Λ with Arc Reactor (x: 325 to 475, center 400) -->
          <!-- Inverted V / Chevron Path without any crossbar -->
          <path
            d="M 400,60 L 475,230 L 435,230 L 400,132 L 365,230 L 325,230 Z"
            fill="url(#goldFace)"
            stroke="url(#crimsonBevel)"
            stroke-width="5"
            stroke-linejoin="miter"
          />

          <!-- V (x: 510 to 660, center 585) - Inverted symmetry of A -->
          <path
            d="M 510,60 L 550,60 L 585,158 L 620,60 L 660,60 L 585,230 Z"
            fill="url(#goldFace)"
            stroke="url(#crimsonBevel)"
            stroke-width="5"
            stroke-linejoin="miter"
          />

          <!-- D (x: 695 to 845) -->
          <path
            d="M 695,60 L 795,60 L 845,110 L 845,180 L 795,230 L 695,230 Z M 740,100 L 740,190 L 780,190 L 805,165 L 805,125 L 780,100 Z"
            fill="url(#goldFace)"
            stroke="url(#crimsonBevel)"
            stroke-width="5"
            stroke-linejoin="miter"
          />

          <!-- A (2nd) - CROSSBAR-LESS CHEVRON Λ (x: 880 to 1030, center 955) -->
          <path
            d="M 955,60 L 1030,230 L 990,230 L 955,132 L 920,230 L 880,230 Z"
            fill="url(#goldFace)"
            stroke="url(#crimsonBevel)"
            stroke-width="5"
            stroke-linejoin="miter"
          />

          <!-- X (x: 1065 to 1215, center 1140) -->
          <path
            d="M 1065,60 L 1108,60 L 1140,120 L 1172,60 L 1215,60 L 1162,145 L 1215,230 L 1172,230 L 1140,170 L 1108,230 L 1065,230 L 1118,145 Z"
            fill="url(#goldFace)"
            stroke="url(#crimsonBevel)"
            stroke-width="5"
            stroke-linejoin="miter"
          />
        </g>

        <!-- Integrated Glowing Arc Reactor in First A Aperture (Center at 400, 185) -->
        ${getArcReactorSvg(400, 186, 26, false)}

        <!-- Micro Arc Core also in Second A Aperture (Triangular Prism variant at 955, 186) -->
        ${getArcReactorSvg(955, 186, 24, true)}

        <!-- Hairline Precision Causal Vector Baseline (2.4px with directed arrow) -->
        <g id="baseline">
          <line x1="200" y1="265" x2="1160" y2="265" stroke="url(#goldFace)" stroke-width="2.4" stroke-linecap="round" />
          <line x1="200" y1="265" x2="1160" y2="265" stroke="#00F0FF" stroke-width="1.2" stroke-linecap="round" filter="url(#arcGlow)" />
          
          <!-- Sleek Terminal Arrow pointing under X -->
          <polygon points="1160,260 1174,265 1160,270 1163,265" fill="#00F0FF" filter="url(#arcGlow)" />
          <polygon points="1160,260 1174,265 1160,270 1163,265" fill="#FFF8C4" />

          <!-- Context Root Micro-Node under C -->
          <circle cx="215" cy="265" r="5.2" fill="#00F0FF" filter="url(#arcGlow)" />
          <circle cx="215" cy="265" r="2.2" fill="#FFFFFF" />

          <!-- Arc Reactor Conduit Node directly aligned under First A (400, 265) -->
          <circle cx="400" cy="265" r="5.0" fill="#E5BE53" />
          <circle cx="400" cy="265" r="2.0" fill="#00F0FF" filter="url(#arcGlow)" />

          <!-- Causal Gate Node under V (585, 265) -->
          <rect x="581" y="261" width="8" height="8" transform="rotate(45 585 265)" fill="#00F0FF" filter="url(#arcGlow)" />

          <!-- Verification Node under Second A (955, 265) -->
          <circle cx="955" cy="265" r="5.0" fill="#E5BE53" />
          <circle cx="955" cy="265" r="2.0" fill="#00F0FF" filter="url(#arcGlow)" />
        </g>
      </svg>
    </div>

    <div class="footer-meta">
      <div>CHEVRON APERTURE GEOMETRY: CROSSBAR ELIMINATED (Λ ARCHITECTURE)</div>
      <div>CORE 01: CIRCULAR PALLADIUM RING • CORE 02: TRIANGULAR VIBRANIUM PRISM</div>
      <div>VECTOR LATENCY &lt;0.08MS • DETERMINISTIC STATE ENGINE</div>
    </div>
  </div>
</body>
</html>`;
}

// 2. Stealth Titanium Ops with Forward Dynamic Oblique & Central Arc Core
function htmlStealthChevronReactor() {
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
    background: radial-gradient(circle at 50% 50%, #0c1017 0%, #07090e 60%, #030406 100%);
    border: 1px solid rgba(0, 240, 255, 0.2);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), 0 0 60px -15px rgba(0, 240, 255, 0.15);
    overflow: hidden;
  }

  .stage::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(0, 240, 255, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 240, 255, 0.025) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

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
    <div class="header-meta">
      <div>STARK TACTICAL LABS • MARK XVI STEALTH ENCLAVE</div>
      <div>MONOLITHIC CHEVRONS | TITANIUM ALLOY • CROSSBAR VOID</div>
      <div>STATUS: VECTOR ARMED</div>
    </div>

    <div class="canvas-center">
      <svg viewBox="0 0 1360 340" width="1340" style="overflow: visible;">
        <defs>
          <linearGradient id="stealthTi" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="35%" stop-color="#CBD5E1" />
            <stop offset="70%" stop-color="#64748B" />
            <stop offset="100%" stop-color="#1E293B" />
          </linearGradient>

          <filter id="cyanLaserGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- 12deg Dynamic Forward Rake for Stealth Flight Attitude -->
        <g transform="skewX(-12) translate(30, 0)">
          <!-- C -->
          <path
            d="M 290,95 L 290,60 L 195,60 L 140,115 L 140,175 L 195,230 L 290,230 L 290,195 L 205,195 L 180,170 L 180,120 L 205,95 Z"
            fill="url(#stealthTi)"
            stroke="#020617"
            stroke-width="4"
          />

          <!-- A (1st) - Crossbar-less inverted chevron Λ -->
          <path
            d="M 400,60 L 475,230 L 435,230 L 400,132 L 365,230 L 325,230 Z"
            fill="url(#stealthTi)"
            stroke="#020617"
            stroke-width="4"
          />

          <!-- V -->
          <path
            d="M 510,60 L 550,60 L 585,158 L 620,60 L 660,60 L 585,230 Z"
            fill="url(#stealthTi)"
            stroke="#020617"
            stroke-width="4"
          />

          <!-- D -->
          <path
            d="M 695,60 L 795,60 L 845,110 L 845,180 L 795,230 L 695,230 Z M 740,100 L 740,190 L 780,190 L 805,165 L 805,125 L 780,100 Z"
            fill="url(#stealthTi)"
            stroke="#020617"
            stroke-width="4"
          />

          <!-- A (2nd) - Crossbar-less inverted chevron Λ -->
          <path
            d="M 955,60 L 1030,230 L 990,230 L 955,132 L 920,230 L 880,230 Z"
            fill="url(#stealthTi)"
            stroke="#020617"
            stroke-width="4"
          />

          <!-- X -->
          <path
            d="M 1065,60 L 1108,60 L 1140,120 L 1172,60 L 1215,60 L 1162,145 L 1215,230 L 1172,230 L 1140,170 L 1108,230 L 1065,230 L 1118,145 Z"
            fill="url(#stealthTi)"
            stroke="#020617"
            stroke-width="4"
          />

          <!-- Suspended Cyan Arc Energy Core in A (1st) -->
          <g transform="translate(400, 185)">
            <circle r="24" fill="#07090e" stroke="#00F0FF" stroke-width="2" filter="url(#cyanLaserGlow)" />
            <circle r="18" fill="none" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="3 2" />
            <polygon points="0,-10 9,6 -9,6" fill="none" stroke="#00F0FF" stroke-width="1.5" />
            <circle r="4.5" fill="#FFFFFF" filter="url(#cyanLaserGlow)" />
          </g>

          <!-- Suspended Cyan Arc Energy Core in A (2nd) -->
          <g transform="translate(955, 185)">
            <circle r="24" fill="#07090e" stroke="#00F0FF" stroke-width="2" filter="url(#cyanLaserGlow)" />
            <circle r="18" fill="none" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="3 2" />
            <polygon points="0,10 -9,-6 9,-6" fill="none" stroke="#00F0FF" stroke-width="1.5" />
            <circle r="4.5" fill="#FFFFFF" filter="url(#cyanLaserGlow)" />
          </g>
        </g>

        <!-- Precision Hairline Vector Conduit -->
        <g id="stealthConduit">
          <line x1="200" y1="270" x2="1170" y2="270" stroke="#334155" stroke-width="2.2" stroke-linecap="round" />
          <line x1="200" y1="270" x2="1170" y2="270" stroke="#00F0FF" stroke-width="1.2" stroke-linecap="round" filter="url(#cyanLaserGlow)" />
          <polygon points="1170,265 1184,270 1170,275 1173,270" fill="#00F0FF" filter="url(#cyanLaserGlow)" />
          <polygon points="1170,265 1184,270 1170,275 1173,270" fill="#FFFFFF" />

          <circle cx="215" cy="270" r="5.2" fill="#00F0FF" filter="url(#cyanLaserGlow)" />
          <circle cx="430" cy="270" r="4.8" fill="#38BDF8" />
          <circle cx="615" cy="270" r="4.8" fill="#38BDF8" />
          <circle cx="985" cy="270" r="4.8" fill="#38BDF8" />
        </g>
      </svg>
    </div>

    <div class="footer-meta">
      <div>DISCRETE CAUSAL ENCLAVE | STEALTH AVIONICS BLUEPRINT</div>
      <div>RAKE: 12° FORWARD | APERTURE: VACUUM-CHAMFERED CHEVRONS</div>
      <div>CORE FREQUENCY: 840 GHZ • PALLADIUM MATRIX</div>
    </div>
  </div>
</body>
</html>`;
}

// 3. Stark Corporate Minimalist - Surgical Modernist Lettering with Crossbar-less A & Micro Arc Core
function htmlStarkCorporateMinimalist() {
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
    background: #080A0E;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), inset 0 0 100px rgba(0,0,0,0.8);
    overflow: hidden;
  }

  .header-meta {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #94A3B8;
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
    border-top: 1px solid rgba(255, 255, 255, 0.1);
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
    <div class="header-meta">
      <div>STARK INDUSTRIES CORPORATE IDENTITY • AEROSPACE MONOLINE</div>
      <div>CROSSBAR-LESS Λ ARCHITECTURE • SURGICAL MINIMALISM</div>
      <div>ENTERPRISE CAUSAL SYSTEM</div>
    </div>

    <div class="canvas-center">
      <svg viewBox="0 0 1360 340" width="1340" style="overflow: visible;">
        <defs>
          <filter id="softArcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Upright Monumental Monoline Letterforms with Pure Crossbar-less A -->
        <g id="minimalLetters">
          <!-- C -->
          <path
            d="M 285,95 L 285,60 L 200,60 L 145,115 L 145,175 L 200,230 L 285,230 L 285,195 L 208,195 L 180,167 L 180,123 L 208,95 Z"
            fill="#FFFFFF"
          />

          <!-- A (1st) - Pure Open Inverted V (Λ) -->
          <path
            d="M 400,60 L 475,230 L 438,230 L 400,135 L 362,230 L 325,230 Z"
            fill="#FFFFFF"
          />

          <!-- V -->
          <path
            d="M 510,60 L 547,60 L 585,155 L 623,60 L 660,60 L 585,230 Z"
            fill="#FFFFFF"
          />

          <!-- D -->
          <path
            d="M 695,60 L 795,60 L 845,110 L 845,180 L 795,230 L 695,230 Z M 732,95 L 732,195 L 782,195 L 808,169 L 808,121 L 782,95 Z"
            fill="#FFFFFF"
          />

          <!-- A (2nd) - Pure Open Inverted V (Λ) -->
          <path
            d="M 955,60 L 1030,230 L 993,230 L 955,135 L 917,230 L 880,230 Z"
            fill="#FFFFFF"
          />

          <!-- X -->
          <path
            d="M 1065,60 L 1105,60 L 1140,120 L 1175,60 L 1215,60 L 1162,145 L 1215,230 L 1175,230 L 1140,170 L 1105,230 L 1065,230 L 1118,145 Z"
            fill="#FFFFFF"
          />
        </g>

        <!-- Surgical Arc Reactor Core positioned exactly at crossbar height inside first A -->
        <g transform="translate(400, 185)">
          <circle r="22" fill="#080A0E" stroke="#00F0FF" stroke-width="1.8" filter="url(#softArcGlow)" />
          <circle r="16" fill="none" stroke="#FFFFFF" stroke-width="1.0" opacity="0.8" />
          <line x1="-34" y1="0" x2="-22" y2="0" stroke="#00F0FF" stroke-width="1.5" filter="url(#softArcGlow)" />
          <line x1="22" y1="0" x2="34" y2="0" stroke="#00F0FF" stroke-width="1.5" filter="url(#softArcGlow)" />
          <circle r="4" fill="#00F0FF" filter="url(#softArcGlow)" />
          <circle r="1.8" fill="#FFFFFF" />
        </g>

        <!-- Minimal Hairline Causal Baseline (2.2px with 5px micro-nodes) -->
        <g id="corporateBaseline">
          <line x1="190" y1="265" x2="1170" y2="265" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" />
          <polygon points="1170,260 1184,265 1170,270 1173,265" fill="#FFFFFF" />

          <!-- C Context Node -->
          <circle cx="215" cy="265" r="5.2" fill="#00F0FF" filter="url(#softArcGlow)" />
          <!-- A Node -->
          <circle cx="400" cy="265" r="5.0" fill="#FFFFFF" />
          <!-- V Pivot Node -->
          <circle cx="585" cy="265" r="5.0" fill="#FFFFFF" />
          <!-- D Gate Node -->
          <circle cx="770" cy="265" r="5.0" fill="#FFFFFF" />
          <!-- A Node -->
          <circle cx="955" cy="265" r="5.0" fill="#FFFFFF" />
        </g>
      </svg>
    </div>

    <div class="footer-meta">
      <div>SWISS MONOLINE RIGOR • OPEN CHEVRON APERTURES</div>
      <div>CORE BRIDGING THE STEMS WITH COHERENT ARC ENERGY</div>
      <div>ENTERPRISE ARCHITECTURE | ZERO CLUTTER</div>
    </div>
  </div>
</body>
</html>`;
}

// 4. Master Executive Showcase Board
function htmlDualArcChassisBoard() {
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
    background: #07080B;
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
  .header-title {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.24em;
    color: #D4AF37;
    text-transform: uppercase;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    margin: auto 0;
  }

  .card {
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 26px 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
  }

  .card-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #D4AF37;
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
      <div class="header-title">CAVDAX • IRON MAN CHEVRON APERTURE SYSTEM</div>
      <div style="font-size: 13px; color: #38BDF8; letter-spacing: 0.2em;">SPECIFICATION: CROSSBAR-LESS Λ + INTEGRATED ARC REACTOR</div>
    </div>

    <div class="grid-layout">
      <!-- Card 1: Mark VII Gold & Crimson Armor -->
      <div class="card">
        <div class="card-label">01. Mark VII Armor (Gold Titanium &amp; Hot-Rod Crimson)</div>
        <svg viewBox="0 0 700 160" width="100%" style="overflow: visible;">
          <defs>
            <linearGradient id="smGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFF8C4" />
              <stop offset="50%" stop-color="#D4AF37" />
              <stop offset="100%" stop-color="#6E4407" />
            </linearGradient>
            <filter id="smGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g transform="scale(0.55) translate(30, 20)">
            <!-- C -->
            <path d="M 290,95 L 290,60 L 195,60 L 140,115 L 140,175 L 195,230 L 290,230 L 290,195 L 205,195 L 180,170 L 180,120 L 205,95 Z" fill="url(#smGold)" stroke="#8B0000" stroke-width="4" />
            <!-- A Crossbar-less -->
            <path d="M 400,60 L 475,230 L 435,230 L 400,132 L 365,230 L 325,230 Z" fill="url(#smGold)" stroke="#8B0000" stroke-width="4" />
            <!-- V -->
            <path d="M 510,60 L 550,60 L 585,158 L 620,60 L 660,60 L 585,230 Z" fill="url(#smGold)" stroke="#8B0000" stroke-width="4" />
            <!-- D -->
            <path d="M 695,60 L 795,60 L 845,110 L 845,180 L 795,230 L 695,230 Z M 740,100 L 740,190 L 780,190 L 805,165 L 805,125 L 780,100 Z" fill="url(#smGold)" stroke="#8B0000" stroke-width="4" />
            <!-- A Crossbar-less -->
            <path d="M 955,60 L 1030,230 L 990,230 L 955,132 L 920,230 L 880,230 Z" fill="url(#smGold)" stroke="#8B0000" stroke-width="4" />
            <!-- X -->
            <path d="M 1065,60 L 1108,60 L 1140,120 L 1172,60 L 1215,60 L 1162,145 L 1215,230 L 1172,230 L 1140,170 L 1108,230 L 1065,230 L 1118,145 Z" fill="url(#smGold)" stroke="#8B0000" stroke-width="4" />
            <!-- Arc Reactor in A -->
            <circle cx="400" cy="186" r="26" fill="#0A0203" stroke="#D4AF37" stroke-width="2" />
            <circle cx="400" cy="186" r="14" fill="#00F0FF" filter="url(#smGlow)" />
            <circle cx="400" cy="186" r="6" fill="#FFFFFF" />
            <line x1="200" y1="265" x2="1160" y2="265" stroke="url(#smGold)" stroke-width="3" />
            <polygon points="1160,260 1174,265 1160,270" fill="#00F0FF" />
          </g>
        </svg>
        <div style="font-family: 'JetBrains Mono'; font-size: 11px; color: #94A3B8; line-height: 1.5;">
          • Open inverted chevron Λ with complete crossbar elimination<br>
          • Integrated circular electromagnetic arc reactor nested in first A<br>
          • 2.4px hairline baseline conduit with directed causal arrow
        </div>
      </div>

      <!-- Card 2: Stealth Ops Titanium -->
      <div class="card">
        <div class="card-label">02. Stealth Ops Titanium (Matte Obsidian &amp; Cyan Core)</div>
        <svg viewBox="0 0 700 160" width="100%" style="overflow: visible;">
          <g transform="scale(0.55) translate(30, 20) skewX(-12)">
            <path d="M 290,95 L 290,60 L 195,60 L 140,115 L 140,175 L 195,230 L 290,230 L 290,195 L 205,195 L 180,170 L 180,120 L 205,95 Z" fill="#E2E8F0" />
            <path d="M 400,60 L 475,230 L 435,230 L 400,132 L 365,230 L 325,230 Z" fill="#E2E8F0" />
            <path d="M 510,60 L 550,60 L 585,158 L 620,60 L 660,60 L 585,230 Z" fill="#E2E8F0" />
            <path d="M 695,60 L 795,60 L 845,110 L 845,180 L 795,230 L 695,230 Z M 740,100 L 740,190 L 780,190 L 805,165 L 805,125 L 780,100 Z" fill="#E2E8F0" />
            <path d="M 955,60 L 1030,230 L 990,230 L 955,132 L 920,230 L 880,230 Z" fill="#E2E8F0" />
            <path d="M 1065,60 L 1108,60 L 1140,120 L 1172,60 L 1215,60 L 1162,145 L 1215,230 L 1172,230 L 1140,170 L 1108,230 L 1065,230 L 1118,145 Z" fill="#E2E8F0" />
            <!-- Arc Reactor in both A -->
            <circle cx="400" cy="186" r="24" fill="#07090e" stroke="#00F0FF" stroke-width="2" filter="url(#smGlow)" />
            <circle cx="400" cy="186" r="5" fill="#FFFFFF" />
            <circle cx="955" cy="186" r="24" fill="#07090e" stroke="#00F0FF" stroke-width="2" filter="url(#smGlow)" />
            <circle cx="955" cy="186" r="5" fill="#FFFFFF" />
            <line x1="200" y1="265" x2="1160" y2="265" stroke="#38BDF8" stroke-width="2.5" />
            <polygon points="1160,260 1174,265 1160,270" fill="#00F0FF" />
          </g>
        </svg>
        <div style="font-family: 'JetBrains Mono'; font-size: 11px; color: #94A3B8; line-height: 1.5;">
          • 12° forward aerodynamic rake for hyper-velocity diagnostics<br>
          • Dual arc reactor apertures nested inside both A chevrons<br>
          • Brushed palladium steel face with ice-blue laser halo
        </div>
      </div>

      <!-- Card 3: Stark Corporate Minimalist -->
      <div class="card">
        <div class="card-label">03. Stark Corporate Minimalist (Monoline Architecture)</div>
        <svg viewBox="0 0 700 160" width="100%" style="overflow: visible;">
          <g transform="scale(0.55) translate(30, 20)">
            <path d="M 285,95 L 285,60 L 200,60 L 145,115 L 145,175 L 200,230 L 285,230 L 285,195 L 208,195 L 180,167 L 180,123 L 208,95 Z" fill="#FFFFFF" />
            <path d="M 400,60 L 475,230 L 438,230 L 400,135 L 362,230 L 325,230 Z" fill="#FFFFFF" />
            <path d="M 510,60 L 547,60 L 585,155 L 623,60 L 660,60 L 585,230 Z" fill="#FFFFFF" />
            <path d="M 695,60 L 795,60 L 845,110 L 845,180 L 795,230 L 695,230 Z M 732,95 L 732,195 L 782,195 L 808,169 L 808,121 L 782,95 Z" fill="#FFFFFF" />
            <path d="M 955,60 L 1030,230 L 993,230 L 955,135 L 917,230 L 880,230 Z" fill="#FFFFFF" />
            <path d="M 1065,60 L 1105,60 L 1140,120 L 1175,60 L 1215,60 L 1162,145 L 1215,230 L 1175,230 L 1140,170 L 1105,230 L 1065,230 L 1118,145 Z" fill="#FFFFFF" />
            <circle cx="400" cy="185" r="22" fill="#080A0E" stroke="#00F0FF" stroke-width="2" filter="url(#smGlow)" />
            <circle cx="400" cy="185" r="4" fill="#FFFFFF" />
            <line x1="190" y1="265" x2="1170" y2="265" stroke="#FFFFFF" stroke-width="2.5" />
            <polygon points="1170,260 1184,265 1170,270" fill="#FFFFFF" />
          </g>
        </svg>
        <div style="font-family: 'JetBrains Mono'; font-size: 11px; color: #94A3B8; line-height: 1.5;">
          • Clean, unadorned Swiss monoline typography with zero crossbars<br>
          • Central cyan reactor core bridging the diagonal stems<br>
          • Enterprise developer tool dignity (Linear / Vercel grade)
        </div>
      </div>

      <!-- Card 4: Geometric Matrix Breakdown -->
      <div class="card" style="justify-content: center; gap: 14px;">
        <div class="card-label">04. Mathematical Chevron Rhythm</div>
        <div style="display: flex; align-items: center; justify-content: space-around; padding: 15px 0;">
          <div style="text-align: center;">
            <div style="font-size: 38px; font-weight: 900; color: #FFF8C4;">Λ</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 10px; color: #D4AF37;">FIRST CHEVRON (A)</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 38px; font-weight: 900; color: #00F0FF;">V</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 10px; color: #38BDF8;">INVERTED REFLECTION</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 38px; font-weight: 900; color: #FFF8C4;">Λ</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 10px; color: #D4AF37;">SECOND CHEVRON (A)</div>
          </div>
        </div>
        <div style="font-family: 'JetBrains Mono'; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">
          The crossbar-less A creates an alternating geometric wave [ C - Λ - V - D - Λ - X ] where the central arc reactor acts as the prime power source of the causal vector.
        </div>
      </div>
    </div>

    <div class="footer">
      <div>CAVDAX ARCHITECTURAL SPECIFICATION • IRON MAN CROSSBAR-LESS DOSSIER</div>
      <div>PURE Λ CHEVRON GEOMETRY | INTEGRATED ARC REACTOR APERTURE</div>
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

  console.log('Launching browser for pure Iron Man typography suite...');
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const tasks = [
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-04-crossbarless-arc-core.jpg'),
      html: htmlCrossbarlessArcCore(),
      label: 'Mark VII Armor with Crossbar-less A and Arc Reactor Core',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-05-stealth-chevron-reactor.jpg'),
      html: htmlStealthChevronReactor(),
      label: 'Stealth Ops Titanium with Forward Rake and Arc Chevrons',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-06-stark-corporate-minimalist.jpg'),
      html: htmlStarkCorporateMinimalist(),
      label: 'Stark Corporate Minimalist with Crossbar-less Monoline',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-07-dual-arc-chassis-board.jpg'),
      html: htmlDualArcChassisBoard(),
      label: 'Master Executive Crossbar-less Showcase Board',
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
  console.log('Pure Iron Man Typography Suite rendering completed successfully.');
}

render().catch((err) => {
  console.error('Rendering error:', err);
  process.exit(1);
});
