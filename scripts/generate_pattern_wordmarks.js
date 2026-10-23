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
if (!fs.existsSync(wordmarksDir)) {
  fs.mkdirSync(wordmarksDir, { recursive: true });
}

// -------------------------------------------------------------
// Tech 26: Anisotropic Laser-Hatched Titanium
// -------------------------------------------------------------
const htmlTech26 = `<!DOCTYPE html>
<html>
<head>
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    color: #FFFFFF;
  }
  .card {
    position: relative;
    width: 1540px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .tag {
    position: absolute;
    top: 24px;
    left: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.4em;
    opacity: 0.6;
  }
  .spec {
    position: absolute;
    bottom: 24px;
    right: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.6;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="tag">// ARCHETYPE: 26 // ANISOTROPIC_HATCH_MONOLITH // LASER_ETCHED_TITANIUM</div>
    <div class="spec">SURFACE: CONCRETE_CAST_FACET // 45° OPTICAL_GRATING</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Crisp 45° Anisotropic Hatch Pattern -->
        <pattern id="hatchPattern" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#FFFFFF" stroke-width="2.5" />
        </pattern>
      </defs>

      <!-- Outer Concrete Silhouette Mask with Hatch Fill -->
      <!-- C -->
      <path d="M 180 25 L 75 25 L 25 75 L 25 145 L 75 195 L 180 195 L 180 160 L 90 160 L 60 130 L 60 90 L 90 60 L 180 60 Z" fill="url(#hatchPattern)" stroke="#FFFFFF" stroke-width="2"/>

      <!-- A -->
      <path d="M 235 195 L 310 25 L 385 195 L 345 195 L 325 150 L 295 150 L 275 195 Z M 300 85 L 285 125 L 335 125 Z" fill="url(#hatchPattern)" stroke="#FFFFFF" stroke-width="2"/>

      <!-- V -->
      <path d="M 435 25 L 510 195 L 585 25 L 545 25 L 510 135 L 475 25 Z" fill="url(#hatchPattern)" stroke="#FFFFFF" stroke-width="2"/>

      <!-- D -->
      <path d="M 635 25 L 725 25 L 795 95 L 795 125 L 725 195 L 635 195 Z M 670 60 L 670 160 L 715 160 L 760 115 L 760 105 L 715 60 Z" fill="url(#hatchPattern)" stroke="#FFFFFF" stroke-width="2"/>

      <!-- A -->
      <path d="M 845 195 L 920 25 L 995 195 L 955 195 L 935 150 L 905 150 L 885 195 Z M 910 85 L 895 125 L 945 125 Z" fill="url(#hatchPattern)" stroke="#FFFFFF" stroke-width="2"/>

      <!-- X -->
      <path d="M 1045 25 L 1120 110 L 1045 195 L 1085 195 L 1140 130 L 1195 195 L 1235 195 L 1160 110 L 1235 25 L 1195 25 L 1140 90 L 1085 25 Z" fill="url(#hatchPattern)" stroke="#FFFFFF" stroke-width="2"/>

      <!-- Concrete Structural Baseline Rail -->
      <g transform="translate(0, 230)">
        <line x1="25" y1="0" x2="1235" y2="0" stroke="#FFFFFF" stroke-width="2.5"/>
        <rect x="25" y="-6" width="12" height="12" fill="#FFFFFF"/>
        <rect x="635" y="-6" width="12" height="12" fill="#FFFFFF"/>
        <polygon points="1245,0 1228,-8 1228,8" fill="#FFFFFF"/>

        <text x="50" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">PROVENANCE_ROOT: 0xCAVDAX</text>
        <text x="660" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">DECISION_PLANE: CONCRETE_VERIFIED</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 27: Voronoi Topological Graph Shards
// -------------------------------------------------------------
const htmlTech27 = `<!DOCTYPE html>
<html>
<head>
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    color: #FFFFFF;
  }
  .card {
    position: relative;
    width: 1540px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .tag {
    position: absolute;
    top: 24px;
    left: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.4em;
    opacity: 0.6;
  }
  .spec {
    position: absolute;
    bottom: 24px;
    right: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.6;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="tag">// ARCHETYPE: 27 // VORONOI_FACET_SHARDS // COMPUTATIONAL_GEOMETRY</div>
    <div class="spec">TOPOLOGICAL_PARTITION // ZERO_SLIME // BRUTALIST_CHISEL</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C Faceted Shards -->
      <polygon points="180,25 75,25 60,60 180,60" fill="#FFFFFF"/>
      <polygon points="75,25 25,75 60,110 60,60" fill="#FFFFFF" opacity="0.9"/>
      <polygon points="25,75 25,145 60,130 60,110" fill="#FFFFFF"/>
      <polygon points="25,145 75,195 60,160 60,130" fill="#FFFFFF" opacity="0.9"/>
      <polygon points="75,195 180,195 180,160 60,160" fill="#FFFFFF"/>

      <!-- A Faceted Shards -->
      <polygon points="310,25 340,95 280,95" fill="#FFFFFF"/>
      <polygon points="280,95 300,140 260,140 235,195" fill="#FFFFFF" opacity="0.9"/>
      <polygon points="340,95 385,195 355,195 320,140" fill="#FFFFFF"/>
      <polygon points="275,140 345,140 330,165 290,165" fill="#FFFFFF" opacity="0.85"/>

      <!-- V Faceted Shards -->
      <polygon points="435,25 470,25 510,135 480,110" fill="#FFFFFF"/>
      <polygon points="585,25 550,25 510,135 540,110" fill="#FFFFFF" opacity="0.9"/>
      <polygon points="510,135 490,165 510,195 530,165" fill="#FFFFFF"/>

      <!-- D Faceted Shards -->
      <polygon points="635,25 725,25 700,60 670,60" fill="#FFFFFF"/>
      <polygon points="635,25 670,60 670,160 635,195" fill="#FFFFFF" opacity="0.95"/>
      <polygon points="725,25 795,95 750,95 700,60" fill="#FFFFFF" opacity="0.9"/>
      <polygon points="795,95 795,125 750,125 750,95" fill="#FFFFFF"/>
      <polygon points="795,125 725,195 700,160 750,125" fill="#FFFFFF" opacity="0.9"/>
      <polygon points="635,195 725,195 700,160 670,160" fill="#FFFFFF"/>

      <!-- A Faceted Shards -->
      <polygon points="920,25 950,95 890,95" fill="#FFFFFF"/>
      <polygon points="890,95 910,140 870,140 845,195" fill="#FFFFFF" opacity="0.9"/>
      <polygon points="950,95 995,195 965,195 930,140" fill="#FFFFFF"/>
      <polygon points="885,140 955,140 940,165 900,165" fill="#FFFFFF" opacity="0.85"/>

      <!-- X Faceted Shards -->
      <polygon points="1045,25 1090,25 1140,85 1115,85" fill="#FFFFFF"/>
      <polygon points="1235,25 1190,25 1140,85 1165,85" fill="#FFFFFF" opacity="0.9"/>
      <polygon points="1115,85 1165,85 1165,135 1115,135" fill="#FFFFFF"/>
      <polygon points="1045,195 1090,195 1140,135 1115,135" fill="#FFFFFF" opacity="0.9"/>
      <polygon points="1235,195 1190,195 1140,135 1165,135" fill="#FFFFFF"/>

      <!-- Structural Tectonic Baseline -->
      <g transform="translate(0, 230)">
        <line x1="25" y1="0" x2="1235" y2="0" stroke="#FFFFFF" stroke-width="2.5"/>
        <polygon points="25,-6 33,-2 33,6 25,10 17,6 17,-2" fill="#FFFFFF"/>
        <polygon points="635,-6 643,-2 643,6 635,10 627,6 627,-2" fill="#FFFFFF"/>
        <polygon points="1245,0 1228,-8 1228,8" fill="#FFFFFF"/>

        <text x="45" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">TECTONIC_PARTITION: CONTEXT</text>
        <text x="655" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">TOPOLOGICAL_GATE: VERIFIED</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 28: Geometric Chevron Guilloché
// -------------------------------------------------------------
const htmlTech28 = `<!DOCTYPE html>
<html>
<head>
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    color: #FFFFFF;
  }
  .card {
    position: relative;
    width: 1540px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .tag {
    position: absolute;
    top: 24px;
    left: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.4em;
    opacity: 0.6;
  }
  .spec {
    position: absolute;
    bottom: 24px;
    right: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.6;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="tag">// ARCHETYPE: 28 // CHEVRON_GUILLOCHE // OPTICAL_ACCELERATION</div>
    <div class="spec">CONCRETE_MASS // FORWARD_PROPULSION // ZERO_SLIME</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C with internal chevron cutouts -->
      <path d="M 180 25 L 80 25 C 45 25 25 45 25 80 L 25 140 C 25 175 45 195 80 195 L 180 195" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
      <!-- Chevron Cuts in C -->
      <polyline points="40,90 50,110 40,130" stroke="#000000" stroke-width="5" stroke-linecap="square"/>
      <polyline points="90,40 100,60 90,80" stroke="#000000" stroke-width="5" stroke-linecap="square"/>
      <polyline points="90,140 100,160 90,180" stroke="#000000" stroke-width="5" stroke-linecap="square"/>

      <!-- A with chevron steering slot -->
      <path d="M 235 195 L 310 25 L 385 195" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
      <line x1="260" y1="140" x2="360" y2="140" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <polyline points="295,125 310,140 295,155" stroke="#000000" stroke-width="5" stroke-linecap="square"/>

      <!-- V with downward chevron cut -->
      <path d="M 440 25 L 515 195 L 590 25" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
      <polyline points="500,160 515,175 530,160" stroke="#000000" stroke-width="5" stroke-linecap="square"/>

      <!-- D with forward chevron array -->
      <path d="M 645 25 L 725 25 C 785 25 815 55 815 110 C 815 165 785 195 725 195 L 645 195 Z" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
      <polyline points="630,90 645,110 630,130" stroke="#000000" stroke-width="5" stroke-linecap="square"/>
      <polyline points="740,90 755,110 740,130" stroke="#000000" stroke-width="5" stroke-linecap="square"/>

      <!-- A -->
      <path d="M 850 195 L 925 25 L 1000 195" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
      <line x1="875" y1="140" x2="975" y2="140" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <polyline points="910,125 925,140 910,155" stroke="#000000" stroke-width="5" stroke-linecap="square"/>

      <!-- X with quad-chevron convergence -->
      <path d="M 1055 25 L 1205 195 M 1205 25 L 1055 195" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
      <polyline points="1115,95 1130,110 1115,125" stroke="#000000" stroke-width="5" stroke-linecap="square"/>

      <!-- Propulsion Guilloche Vector Line Baseline -->
      <g transform="translate(0, 230)">
        <line x1="25" y1="0" x2="1205" y2="0" stroke="#FFFFFF" stroke-width="3"/>
        <polyline points="20,-8 30,0 20,8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square"/>
        <polyline points="640,-8 650,0 640,8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square"/>
        <polygon points="1215,0 1195,-9 1195,9" fill="#FFFFFF"/>

        <text x="50" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">VECTOR_ACCELERATION: CONTEXT</text>
        <text x="670" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">DECISION_GATE: FORWARD_PROPULSION</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 29: Hexagonal Honeycomb Exoskeleton
// -------------------------------------------------------------
const htmlTech29 = `<!DOCTYPE html>
<html>
<head>
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    color: #FFFFFF;
  }
  .card {
    position: relative;
    width: 1540px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .tag {
    position: absolute;
    top: 24px;
    left: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.4em;
    opacity: 0.6;
  }
  .spec {
    position: absolute;
    bottom: 24px;
    right: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.6;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="tag">// ARCHETYPE: 29 // HEX_HONEYCOMB_EXOSKELETON // AEROSPACE_BULKHEAD</div>
    <div class="spec">BERYLLIUM_MATRIX // ISOMETRIC_CORE // CHISELED_CONCRETE</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Hexagon Helper Macro -->
        <g id="hexCut">
          <polygon points="0,-10 9,-5 9,5 0,10 -9,5 -9,-5" fill="#000000"/>
        </g>
      </defs>

      <!-- Solid Concrete Letters with Hexagonal Honeycomb Core Voids -->
      <!-- C -->
      <g>
        <path d="M 180 25 L 80 25 L 25 80 L 25 140 L 80 195 L 180 195" stroke="#FFFFFF" stroke-width="28" stroke-linecap="square"/>
        <use href="#hexCut" x="80" y="25"/>
        <use href="#hexCut" x="37" y="90"/>
        <use href="#hexCut" x="37" y="130"/>
        <use href="#hexCut" x="80" y="195"/>
      </g>

      <!-- A -->
      <g>
        <path d="M 235 195 L 310 25 L 385 195" stroke="#FFFFFF" stroke-width="28" stroke-linecap="square"/>
        <line x1="260" y1="140" x2="360" y2="140" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
        <use href="#hexCut" x="310" y="55"/>
        <use href="#hexCut" x="275" y="140"/>
        <use href="#hexCut" x="345" y="140"/>
      </g>

      <!-- V -->
      <g>
        <path d="M 440 25 L 515 195 L 590 25" stroke="#FFFFFF" stroke-width="28" stroke-linecap="square"/>
        <use href="#hexCut" x="460" y="65"/>
        <use href="#hexCut" x="515" y="165"/>
        <use href="#hexCut" x="570" y="65"/>
      </g>

      <!-- D -->
      <g>
        <path d="M 645 25 L 725 25 L 795 95 L 795 125 L 725 195 L 645 195 Z" stroke="#FFFFFF" stroke-width="28" stroke-linecap="square"/>
        <use href="#hexCut" x="645" y="70"/>
        <use href="#hexCut" x="645" y="150"/>
        <use href="#hexCut" x="780" y="110"/>
      </g>

      <!-- A -->
      <g>
        <path d="M 850 195 L 925 25 L 1000 195" stroke="#FFFFFF" stroke-width="28" stroke-linecap="square"/>
        <line x1="875" y1="140" x2="975" y2="140" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
        <use href="#hexCut" x="925" y="55"/>
        <use href="#hexCut" x="890" y="140"/>
        <use href="#hexCut" x="960" y="140"/>
      </g>

      <!-- X -->
      <g>
        <path d="M 1055 25 L 1205 195 M 1205 25 L 1055 195" stroke="#FFFFFF" stroke-width="28" stroke-linecap="square"/>
        <use href="#hexCut" x="1130" y="110"/>
      </g>

      <!-- Honeycomb Matrix Vector Baseline -->
      <g transform="translate(0, 230)">
        <line x1="25" y1="0" x2="1205" y2="0" stroke="#FFFFFF" stroke-width="3"/>
        <polygon points="25,-9 34,-4 34,4 25,9 16,4 16,-4" fill="#FFFFFF"/>
        <polygon points="645,-9 654,-4 654,4 645,9 636,4 636,-4" fill="#FFFFFF"/>
        <polygon points="1215,0 1195,-9 1195,9" fill="#FFFFFF"/>

        <text x="50" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">STRUCTURAL_CELL: CAUSE_ORIGIN</text>
        <text x="670" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">EXOSKELETON_VERIFICATION: PASSED</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 30: Stepped Brutalist Ziggurat
// -------------------------------------------------------------
const htmlTech30 = `<!DOCTYPE html>
<html>
<head>
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    color: #FFFFFF;
  }
  .card {
    position: relative;
    width: 1540px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .tag {
    position: absolute;
    top: 24px;
    left: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.4em;
    opacity: 0.6;
  }
  .spec {
    position: absolute;
    bottom: 24px;
    right: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.6;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="tag">// ARCHETYPE: 30 // STEPPED_BRUTALIST_ZIGGURAT // TECTONIC_HEAT_SINK</div>
    <div class="spec">90° STEPPED_TERRACES // PURE_ORTHOGONAL // ZERO_SLIME</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C Stepped Orthogonal Terraces -->
      <path d="M 180 25 L 85 25 L 85 45 L 60 45 L 60 70 L 40 70 L 40 150 L 60 150 L 60 175 L 85 175 L 85 195 L 180 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- A Stepped Pyramid Silhouette -->
      <path d="M 235 195 L 235 150 L 260 150 L 260 100 L 285 100 L 285 50 L 310 25 L 335 50 L 335 100 L 360 100 L 360 150 L 385 150 L 385 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <line x1="260" y1="140" x2="360" y2="140" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>

      <!-- V Stepped Inverted Terraces -->
      <path d="M 440 25 L 440 70 L 465 70 L 465 120 L 490 120 L 490 170 L 515 195 L 540 170 L 540 120 L 565 120 L 565 70 L 590 70 L 590 25" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- D Stepped Fortified Prow -->
      <path d="M 645 25 L 725 25 L 755 55 L 775 80 L 795 110 L 775 140 L 755 165 L 725 195 L 645 195 Z" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- A Stepped -->
      <path d="M 850 195 L 850 150 L 875 150 L 875 100 L 900 100 L 900 50 L 925 25 L 950 50 L 950 100 L 975 100 L 975 150 L 1000 150 L 1000 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <line x1="875" y1="140" x2="975" y2="140" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>

      <!-- X Stepped Crossing Blocks -->
      <path d="M 1055 25 L 1080 55 L 1105 85 L 1130 110 L 1155 140 L 1180 165 L 1205 195 M 1205 25 L 1180 55 L 1155 85 L 1130 110 L 1105 140 L 1080 165 L 1055 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- Stepped Data Fortress Baseline -->
      <g transform="translate(0, 230)">
        <path d="M 25 0 L 200 0 L 200 -8 L 220 -8 L 220 0 L 620 0 L 620 -8 L 640 -8 L 640 0 L 1180 0" stroke="#FFFFFF" stroke-width="3" fill="none"/>
        <rect x="20" y="-5" width="10" height="10" fill="#FFFFFF"/>
        <rect x="625" y="-5" width="10" height="10" fill="#FFFFFF"/>
        <polygon points="1215,0 1195,-9 1195,9" fill="#FFFFFF"/>

        <text x="45" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">TERRACE_ROOT: VERIFIED_PROVENANCE</text>
        <text x="655" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">STAGE: ZIGGURAT_COMMIT</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

async function main() {
  const browserPath = findSystemBrowser();
  if (!browserPath) {
    console.error('No system Chrome found');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const targets = [
    { name: 'wordmark-tech-26-anisotropic-hatch-monolith', html: htmlTech26 },
    { name: 'wordmark-tech-27-voronoi-graph-shards', html: htmlTech27 },
    { name: 'wordmark-tech-28-chevron-guilloche-matrix', html: htmlTech28 },
    { name: 'wordmark-tech-29-hex-honeycomb-monolith', html: htmlTech29 },
    { name: 'wordmark-tech-30-stepped-brutalist-ziggurat', html: htmlTech30 },
  ];

  for (const t of targets) {
    await page.setContent(t.html, { waitUntil: 'domcontentloaded' });
    const imgPath = path.join(wordmarksDir, `${t.name}.jpg`);
    await page.screenshot({ path: imgPath, type: 'jpeg', quality: 95 });
    console.log(`Saved screenshot: ${imgPath}`);
  }

  await browser.close();
  console.log('Batch 5 (Patterned Concrete Brutalist Tech 26-30) successfully rendered into wordmarks/!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
