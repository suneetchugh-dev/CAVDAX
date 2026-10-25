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

const targetDir = path.resolve(__dirname, '../docs/brand_explorations/wordmarks/-Semi-Selected-Refined-');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Common Shared Styles
const baseHead = `
<meta charset="utf-8">
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #FFFFFF;
  }
  .stage {
    position: relative;
    width: 1540px;
    height: 720px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: radial-gradient(circle at 50% 48%, #14161b 0%, #07080a 85%);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.95), 0 0 1px 1px rgba(255,255,255,0.06);
  }
</style>
`;

// ---------------------------------------------------------------------------
// 1. Classic Architectural Board (The Present Wordmark - Refined Sleek Line & Small Dots)
// ---------------------------------------------------------------------------
const htmlClassic = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg viewBox="0 0 1280 250" width="1240" style="overflow: visible;">
      <text
        x="640"
        y="142"
        text-anchor="middle"
        fill="#FFFFFF"
        style="
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif;
          font-size: 195px;
          font-weight: 700;
          letter-spacing: 0.125em;
          text-rendering: geometricPrecision;
        "
      >CAVDAX</text>
      <!-- Sleek 2.8px line with small 5.5px dots -->
      <g fill="#FFFFFF" stroke="#FFFFFF">
        <line x1="335" y1="195" x2="955" y2="195" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="335" cy="195" r="5.5"/>
        <circle cx="665" cy="195" r="5.5"/>
        <path d="M 942 184 L 956 195 L 942 206" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 2. Tech 01: Squircle Aerospace
// ---------------------------------------------------------------------------
const htmlTech01 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg viewBox="0 0 1280 250" width="1240" style="overflow: visible;">
      <!-- Aerospace Extended Squircle Glyphs -->
      <g fill="#FFFFFF">
        <!-- C -->
        <path d="M 220 40 L 130 40 C 95 40 75 60 75 95 L 75 140 C 75 175 95 195 130 195 L 220 195 L 220 160 L 140 160 C 120 160 110 150 110 135 L 110 100 C 110 85 120 75 140 75 L 220 75 Z"/>
        <!-- A -->
        <path d="M 290 195 L 360 40 L 415 40 L 485 195 L 440 195 L 420 155 L 355 155 L 335 195 Z M 370 120 L 405 120 L 388 80 Z"/>
        <!-- V -->
        <path d="M 505 40 L 565 195 L 610 195 L 670 40 L 625 40 L 588 150 L 550 40 Z"/>
        <!-- D -->
        <path d="M 695 40 L 780 40 C 825 40 850 65 850 115 C 850 165 825 195 780 195 L 695 195 Z M 735 75 L 735 160 L 775 160 C 800 160 815 145 815 115 C 815 85 800 75 775 75 Z"/>
        <!-- A -->
        <path d="M 870 195 L 940 40 L 995 40 L 1065 195 L 1020 195 L 1000 155 L 935 155 L 915 195 Z M 950 120 L 985 120 L 968 80 Z"/>
        <!-- X -->
        <path d="M 1085 40 L 1145 118 L 1085 195 L 1130 195 L 1170 142 L 1210 195 L 1255 195 L 1195 118 L 1255 40 L 1210 40 L 1170 92 L 1130 40 Z"/>
      </g>
      <!-- Sleek 2.8px line with small 5.5px dots -->
      <g fill="#FFFFFF" stroke="#FFFFFF">
        <line x1="75" y1="225" x2="1255" y2="225" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="75" cy="225" r="5.5"/>
        <circle cx="695" cy="225" r="5.5"/>
        <path d="M 1242 214 L 1256 225 L 1242 236" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 3. Tech 04: Stencil Graph Matrix
// ---------------------------------------------------------------------------
const htmlTech04 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg viewBox="0 0 1280 250" width="1240" style="overflow: visible;">
      <!-- Heavy Stencil Glyphs with clean negative incisions -->
      <g fill="#FFFFFF">
        <!-- C with 2 horizontal stencil cuts -->
        <path d="M 220 40 L 130 40 C 95 40 75 60 75 95 L 75 110 L 110 110 L 110 98 C 110 85 120 75 140 75 L 220 75 Z M 75 125 L 75 140 C 75 175 95 195 130 195 L 220 195 L 220 160 L 140 160 C 120 160 110 150 110 137 L 110 125 Z"/>
        <!-- A with horizontal stencil gap at crossbar -->
        <path d="M 335 195 L 355 155 L 338 120 L 305 195 Z M 440 195 L 420 155 L 437 120 L 470 195 Z M 365 40 L 410 40 L 425 105 L 350 105 Z M 360 135 L 415 135 L 415 145 L 360 145 Z"/>
        <!-- V with center vertical split apex -->
        <path d="M 505 40 L 560 175 L 540 40 Z M 670 40 L 615 175 L 635 40 Z M 575 180 L 600 180 L 587.5 195 Z"/>
        <!-- D with top/bottom stencil apertures -->
        <path d="M 695 40 L 780 40 C 825 40 850 65 850 115 C 850 165 825 195 780 195 L 695 195 Z M 735 75 L 735 160 L 775 160 C 800 160 815 145 815 115 C 815 85 800 75 775 75 Z"/>
        <line x1="690" y1="115" x2="855" y2="115" stroke="#101216" stroke-width="6"/>
        <!-- A -->
        <path d="M 915 195 L 935 155 L 918 120 L 885 195 Z M 1020 195 L 1000 155 L 1017 120 L 1050 195 Z M 945 40 L 990 40 L 1005 105 L 930 105 Z M 940 135 L 995 135 L 995 145 L 940 145 Z"/>
        <!-- X with center diamond stencil void -->
        <path d="M 1085 40 L 1145 112 L 1085 195 L 1130 195 L 1165 145 L 1200 195 L 1245 195 L 1185 112 L 1245 40 L 1200 40 L 1165 88 L 1130 40 Z"/>
      </g>
      <!-- Sleek 2.8px line with small 5.5px dots -->
      <g fill="#FFFFFF" stroke="#FFFFFF">
        <line x1="75" y1="225" x2="1245" y2="225" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="75" cy="225" r="5.5"/>
        <circle cx="695" cy="225" r="5.5"/>
        <path d="M 1232 214 L 1246 225 L 1232 236" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 4. Tech 07: Quantum Vector Lattice
// ---------------------------------------------------------------------------
const htmlTech07 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg viewBox="0 0 1280 250" width="1240" style="overflow: visible;">
      <!-- Monoline Quantum Vector Letters -->
      <g stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- C -->
        <path d="M 215 50 C 140 30, 80 80, 80 120 C 80 160, 140 210, 215 190"/>
        <!-- A (open lambda) -->
        <path d="M 285 200 L 360 40 L 435 200"/>
        <!-- V -->
        <path d="M 495 40 L 570 200 L 645 40"/>
        <!-- D -->
        <path d="M 705 40 L 705 200 L 775 200 C 825 200, 855 165, 855 120 C 855 75, 825 40, 775 40 Z"/>
        <!-- A (open lambda) -->
        <path d="M 915 200 L 990 40 L 1065 200"/>
        <!-- X -->
        <path d="M 1125 40 L 1245 200 M 1245 40 L 1125 200"/>
      </g>
      <!-- Ultra-Sleek 2.4px line with small 5.0px dots -->
      <g fill="#FFFFFF" stroke="#FFFFFF">
        <line x1="80" y1="230" x2="1245" y2="230" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="80" cy="230" r="5.0"/>
        <circle cx="705" cy="230" r="5.0"/>
        <path d="M 1234 220 L 1247 230 L 1234 240" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 5. Tech 15: Cyber-Chassis Server Blade
// ---------------------------------------------------------------------------
const htmlTech15 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg width="1280" height="250" viewBox="0 0 1280 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C with Ventilation Slot -->
      <path d="M 170 30 L 70 30 C 40 30 30 40 30 70 L 30 150 C 30 180 40 190 70 190 L 170 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <line x1="30" y1="95" x2="30" y2="125" stroke="#080a0d" stroke-width="8" stroke-linecap="square"/>
      <!-- A with Center Slot -->
      <path d="M 230 190 L 300 30 L 370 190 M 255 140 L 345 140" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <!-- V -->
      <path d="M 430 30 L 500 190 L 570 30" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <!-- D with Internal Void -->
      <path d="M 630 30 L 710 30 C 765 30 790 55 790 110 C 790 165 765 190 710 190 L 630 190 Z" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <line x1="790" y1="95" x2="790" y2="125" stroke="#080a0d" stroke-width="8" stroke-linecap="square"/>
      <!-- A -->
      <path d="M 850 190 L 920 30 L 990 190 M 875 140 L 965 140" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <!-- X -->
      <path d="M 1050 30 L 1190 190 M 1190 30 L 1050 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- Sleek 2.8px line with small 5.5px nodes -->
      <g transform="translate(0, 225)">
        <line x1="30" y1="0" x2="1190" y2="0" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
        <rect x="25" y="-5" width="10" height="10" fill="#FFFFFF"/>
        <rect x="625" y="-5" width="10" height="10" fill="#FFFFFF"/>
        <polygon points="1200,0 1184,-7 1184,7" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 6. Tech 22: Palantir Chiseled Chamfer
// ---------------------------------------------------------------------------
const htmlTech22 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg width="1280" height="240" viewBox="0 0 1280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C (45° internal chamfer facet) -->
      <path d="M 180 25 L 80 25 L 25 80 L 25 140 L 80 195 L 180 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <!-- A -->
      <path d="M 235 195 L 310 25 L 385 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <line x1="260" y1="140" x2="360" y2="140" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>
      <!-- V -->
      <path d="M 440 25 L 515 195 L 590 25" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <!-- D -->
      <path d="M 645 25 L 725 25 L 795 95 L 795 125 L 725 195 L 645 195 Z" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <!-- A -->
      <path d="M 850 195 L 925 25 L 1000 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <line x1="875" y1="140" x2="975" y2="140" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>
      <!-- X -->
      <path d="M 1055 25 L 1205 195 M 1205 25 L 1055 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>

      <!-- Sleek 2.6px line with small 5.0px diamond nodes -->
      <g transform="translate(0, 222)">
        <line x1="25" y1="0" x2="1205" y2="0" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
        <rect x="21" y="-4" width="8" height="8" fill="#FFFFFF" transform="rotate(45 25 0)"/>
        <rect x="641" y="-4" width="8" height="8" fill="#FFFFFF" transform="rotate(45 645 0)"/>
        <polygon points="1214,0 1200,-6 1200,6" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 7. Tech 25: Stripe Grounded Modernist
// ---------------------------------------------------------------------------
const htmlTech25 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg width="1280" height="240" viewBox="0 0 1280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C -->
      <path d="M 175 40 L 80 40 C 45 40 25 60 25 95 L 25 125 C 25 160 45 180 80 180 L 175 180" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <!-- A -->
      <path d="M 235 180 L 295 40 L 325 40 L 385 180" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>
      <line x1="262" y1="130" x2="358" y2="130" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>
      <!-- V -->
      <path d="M 445 40 L 500 180 L 530 180 L 585 40" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>
      <!-- D -->
      <path d="M 645 40 L 720 40 C 785 40 815 65 815 110 C 815 155 785 180 720 180 L 645 180 Z" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>
      <!-- A -->
      <path d="M 875 180 L 935 40 L 965 40 L 1025 180" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>
      <line x1="902" y1="130" x2="998" y2="130" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>
      <!-- X -->
      <path d="M 1085 40 L 1225 180 M 1225 40 L 1085 180" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>

      <!-- Sleek 2.5px line with small 5.0px dots -->
      <g transform="translate(0, 215)">
        <line x1="25" y1="0" x2="1225" y2="0" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="25" cy="0" r="5" fill="#FFFFFF"/>
        <circle cx="645" cy="0" r="5" fill="#FFFFFF"/>
        <polygon points="1235,0 1220,-6 1220,6" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 8. Tech 28: Chevron Guilloche Matrix
// ---------------------------------------------------------------------------
const htmlTech28 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg width="1280" height="240" viewBox="0 0 1280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C -->
      <path d="M 180 25 L 80 25 C 45 25 25 45 25 80 L 25 140 C 25 175 45 195 80 195 L 180 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <polyline points="40,90 50,110 40,130" stroke="#080a0d" stroke-width="5" stroke-linecap="square"/>
      <!-- A -->
      <path d="M 235 195 L 310 25 L 385 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <line x1="260" y1="140" x2="360" y2="140" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>
      <polyline points="295,125 310,140 295,155" stroke="#080a0d" stroke-width="5" stroke-linecap="square"/>
      <!-- V -->
      <path d="M 440 25 L 515 195 L 590 25" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <polyline points="500,160 515,175 530,160" stroke="#080a0d" stroke-width="5" stroke-linecap="square"/>
      <!-- D -->
      <path d="M 645 25 L 725 25 C 785 25 815 55 815 110 C 815 165 785 195 725 195 L 645 195 Z" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <polyline points="630,90 645,110 630,130" stroke="#080a0d" stroke-width="5" stroke-linecap="square"/>
      <!-- A -->
      <path d="M 850 195 L 925 25 L 1000 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <line x1="875" y1="140" x2="975" y2="140" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>
      <polyline points="910,125 925,140 910,155" stroke="#080a0d" stroke-width="5" stroke-linecap="square"/>
      <!-- X -->
      <path d="M 1055 25 L 1205 195 M 1205 25 L 1055 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <polyline points="1115,95 1130,110 1115,125" stroke="#080a0d" stroke-width="5" stroke-linecap="square"/>

      <!-- Sleek 2.8px line with small 5.5px nodes -->
      <g transform="translate(0, 225)">
        <line x1="25" y1="0" x2="1205" y2="0" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
        <polyline points="20,-6 28,0 20,6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="square"/>
        <polyline points="640,-6 648,0 640,6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="square"/>
        <polygon points="1215,0 1200,-6 1200,6" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 9. Tech 29: Hex Honeycomb Monolith
// ---------------------------------------------------------------------------
const htmlTech29 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg width="1280" height="240" viewBox="0 0 1280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <polygon id="hexCut" points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5" fill="#080a0d" stroke="#FFFFFF" stroke-width="1.2"/>
      </defs>
      <!-- C -->
      <g>
        <path d="M 180 25 L 80 25 L 25 80 L 25 140 L 80 195 L 180 195" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
        <use href="#hexCut" x="80" y="25"/>
        <use href="#hexCut" x="37" y="110"/>
        <use href="#hexCut" x="80" y="195"/>
      </g>
      <!-- A -->
      <g>
        <path d="M 235 195 L 310 25 L 385 195" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
        <line x1="260" y1="140" x2="360" y2="140" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
        <use href="#hexCut" x="310" y="55"/>
        <use href="#hexCut" x="310" y="140"/>
      </g>
      <!-- V -->
      <g>
        <path d="M 440 25 L 515 195 L 590 25" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
        <use href="#hexCut" x="515" y="165"/>
      </g>
      <!-- D -->
      <g>
        <path d="M 645 25 L 725 25 L 795 95 L 795 125 L 725 195 L 645 195 Z" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
        <use href="#hexCut" x="645" y="110"/>
        <use href="#hexCut" x="780" y="110"/>
      </g>
      <!-- A -->
      <g>
        <path d="M 850 195 L 925 25 L 1000 195" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
        <line x1="875" y1="140" x2="975" y2="140" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
        <use href="#hexCut" x="925" y="55"/>
        <use href="#hexCut" x="925" y="140"/>
      </g>
      <!-- X -->
      <g>
        <path d="M 1055 25 L 1205 195 M 1205 25 L 1055 195" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
        <use href="#hexCut" x="1130" y="110"/>
      </g>

      <!-- Sleek 2.8px line with small 5.0px hex nodes -->
      <g transform="translate(0, 225)">
        <line x1="25" y1="0" x2="1205" y2="0" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
        <polygon points="25,-6 30,-3 30,3 25,6 20,3 20,-3" fill="#FFFFFF"/>
        <polygon points="645,-6 650,-3 650,3 645,6 640,3 640,-3" fill="#FFFFFF"/>
        <polygon points="1215,0 1200,-6 1200,6" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 10. Tech 30: Stepped Brutalist Ziggurat
// ---------------------------------------------------------------------------
const htmlTech30 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg width="1280" height="240" viewBox="0 0 1280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C -->
      <path d="M 180 25 L 85 25 L 85 45 L 60 45 L 60 70 L 40 70 L 40 150 L 60 150 L 60 175 L 85 175 L 85 195 L 180 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <!-- A -->
      <path d="M 235 195 L 235 150 L 260 150 L 260 100 L 285 100 L 285 50 L 310 25 L 335 50 L 335 100 L 360 100 L 360 150 L 385 150 L 385 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <line x1="260" y1="140" x2="360" y2="140" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>
      <!-- V -->
      <path d="M 440 25 L 440 70 L 465 70 L 465 120 L 490 120 L 490 170 L 515 195 L 540 170 L 540 120 L 565 120 L 565 70 L 590 70 L 590 25" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <!-- D -->
      <path d="M 645 25 L 725 25 L 755 55 L 775 80 L 795 110 L 775 140 L 755 165 L 725 195 L 645 195 Z" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <!-- A -->
      <path d="M 850 195 L 850 150 L 875 150 L 875 100 L 900 100 L 900 50 L 925 25 L 950 50 L 950 100 L 975 100 L 975 150 L 1000 150 L 1000 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <line x1="875" y1="140" x2="975" y2="140" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>
      <!-- X -->
      <path d="M 1055 25 L 1080 55 L 1105 85 L 1130 110 L 1155 140 L 1180 165 L 1205 195 M 1205 25 L 1180 55 L 1155 85 L 1130 110 L 1105 140 L 1080 165 L 1055 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>

      <!-- Sleek 2.6px orthogonal line with small 6x6 square nodes -->
      <g transform="translate(0, 225)">
        <path d="M 25 0 L 200 0 L 200 -5 L 215 -5 L 215 0 L 625 0 L 625 -5 L 640 -5 L 640 0 L 1190 0" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <rect x="22" y="-3" width="6" height="6" fill="#FFFFFF"/>
        <rect x="625" y="-3" width="6" height="6" fill="#FFFFFF"/>
        <polygon points="1205,0 1192,-6 1192,6" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// Common Contour & Automata Glyphs
const GLYPH_C = `M 180 25 L 75 25 L 25 75 L 25 145 L 75 195 L 180 195 L 180 155 L 90 155 L 60 125 L 60 95 L 90 65 L 180 65 Z`;
const GLYPH_A1 = `M 235 195 L 310 25 L 385 195 L 345 195 L 325 150 L 295 150 L 275 195 Z M 300 85 L 285 125 L 335 125 Z`;
const GLYPH_V = `M 435 25 L 510 195 L 585 25 L 545 25 L 510 135 L 475 25 Z`;
const GLYPH_D = `M 635 25 L 725 25 L 795 95 L 795 125 L 725 195 L 635 195 Z M 670 60 L 670 160 L 715 160 L 760 115 L 760 105 L 715 60 Z`;
const GLYPH_A2 = `M 845 195 L 920 25 L 995 195 L 955 195 L 935 150 L 905 150 L 885 195 Z M 910 85 L 895 125 L 945 125 Z`;
const GLYPH_X = `M 1045 25 L 1120 110 L 1045 195 L 1085 195 L 1140 130 L 1195 195 L 1235 195 L 1160 110 L 1235 25 L 1195 25 L 1140 90 L 1085 25 Z`;

// ---------------------------------------------------------------------------
// 11. Tech 32: Topographical Causal Iso-Contour Monolith
// ---------------------------------------------------------------------------
const patternTech32 = `
  <pattern id="contourPattern" width="28" height="28" patternUnits="userSpaceOnUse">
    <path d="M 0 14 Q 7 4, 14 14 T 28 14" stroke="#FFFFFF" stroke-width="1.8" fill="none" />
    <path d="M 0 7 Q 7 -3, 14 7 T 28 7" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.85" />
    <path d="M 0 21 Q 7 11, 14 21 T 28 21" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.85" />
    <path d="M 0 28 Q 7 18, 14 28 T 28 28" stroke="#FFFFFF" stroke-width="1.8" fill="none" />
    <line x1="14" y1="0" x2="14" y2="28" stroke="#FFFFFF" stroke-width="0.8" stroke-dasharray="2 4" opacity="0.4" />
  </pattern>
`;
const htmlTech32 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg width="1280" height="250" viewBox="0 0 1280 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>${patternTech32}</defs>
      <path d="${GLYPH_C}" fill="url(#contourPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_A1}" fill="url(#contourPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_V}" fill="url(#contourPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_D}" fill="url(#contourPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_A2}" fill="url(#contourPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_X}" fill="url(#contourPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>

      <!-- Sleek 2.6px line with small 5.0px dots -->
      <g transform="translate(0, 225)">
        <line x1="25" y1="0" x2="1235" y2="0" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="25" cy="0" r="5.0" fill="#FFFFFF"/>
        <circle cx="635" cy="0" r="5.0" fill="#FFFFFF"/>
        <polygon points="1245,0 1230,-6 1230,6" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// 12. Tech 38: Discrete Cellular Automata Matrix
// ---------------------------------------------------------------------------
const patternTech38 = `
  <pattern id="automataPattern" width="24" height="24" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="24" height="24" stroke="#FFFFFF" stroke-width="0.8" stroke-dasharray="1 3" fill="none" opacity="0.3"/>
    <rect x="2" y="2" width="4" height="4" fill="#FFFFFF"/>
    <rect x="10" y="2" width="4" height="4" fill="#FFFFFF"/>
    <rect x="6" y="8" width="4" height="4" fill="#FFFFFF"/>
    <rect x="14" y="8" width="4" height="4" fill="#FFFFFF"/>
    <rect x="18" y="8" width="4" height="4" fill="#FFFFFF"/>
    <rect x="2" y="14" width="4" height="4" fill="#FFFFFF"/>
    <rect x="10" y="14" width="4" height="4" fill="#FFFFFF"/>
    <rect x="14" y="14" width="4" height="4" fill="#FFFFFF"/>
    <rect x="6" y="20" width="4" height="4" fill="#FFFFFF"/>
    <rect x="18" y="20" width="4" height="4" fill="#FFFFFF"/>
    <line x1="4" y1="4" x2="8" y2="10" stroke="#FFFFFF" stroke-width="0.9" opacity="0.6"/>
    <line x1="12" y1="4" x2="16" y2="10" stroke="#FFFFFF" stroke-width="0.9" opacity="0.6"/>
  </pattern>
`;
const htmlTech38 = `<!DOCTYPE html>
<html>
<head>${baseHead}</head>
<body>
  <div class="stage">
    <svg width="1280" height="250" viewBox="0 0 1280 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>${patternTech38}</defs>
      <path d="${GLYPH_C}" fill="url(#automataPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_A1}" fill="url(#automataPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_V}" fill="url(#automataPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_D}" fill="url(#automataPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_A2}" fill="url(#automataPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_X}" fill="url(#automataPattern)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>

      <!-- Sleek 2.6px line with small 5.0px dots -->
      <g transform="translate(0, 225)">
        <line x1="25" y1="0" x2="1235" y2="0" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="25" cy="0" r="5.0" fill="#FFFFFF"/>
        <circle cx="635" cy="0" r="5.0" fill="#FFFFFF"/>
        <polygon points="1245,0 1230,-6 1230,6" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

async function main() {
  const browserPath = findSystemBrowser();
  if (!browserPath) {
    throw new Error('No system Chrome or Edge browser found.');
  }

  console.log(`Using browser: ${browserPath}`);
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const targets = [
    { name: 'wordmark-classic-study-architectural-board.jpg', html: htmlClassic },
    { name: 'wordmark-tech-01-squircle-aerospace.jpg', html: htmlTech01 },
    { name: 'wordmark-tech-04-stencil-graph-matrix.jpg', html: htmlTech04 },
    { name: 'wordmark-tech-07-quantum-vector-lattice.jpg', html: htmlTech07 },
    { name: 'wordmark-tech-15-cyber-chassis-blade.jpg', html: htmlTech15 },
    { name: 'wordmark-tech-22-palantir-chiseled-chamfer.jpg', html: htmlTech22 },
    { name: 'wordmark-tech-25-stripe-grounded-modernist.jpg', html: htmlTech25 },
    { name: 'wordmark-tech-28-chevron-guilloche-matrix.jpg', html: htmlTech28 },
    { name: 'wordmark-tech-29-hex-honeycomb-monolith.jpg', html: htmlTech29 },
    { name: 'wordmark-tech-30-stepped-brutalist-ziggurat.jpg', html: htmlTech30 },
    { name: 'wordmark-tech-32-topographic-isocontour-monolith.jpg', html: htmlTech32 },
    { name: 'wordmark-tech-38-discrete-cellular-automata-matrix.jpg', html: htmlTech38 },
  ];

  for (const t of targets) {
    await page.setContent(t.html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 300));
    const imgPath = path.join(targetDir, t.name);
    await page.screenshot({ path: imgPath, type: 'jpeg', quality: 95 });
    console.log(`Saved refined screenshot: ${imgPath}`);
  }

  await browser.close();
  console.log('Successfully regenerated all 12 semi-selected wordmarks with sleek lines and small dots into -Semi-Selected-Refined-!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
