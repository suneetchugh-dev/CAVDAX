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

// Common glyph path definitions (Concrete monolithic Chamfered 45°/90° vectors)
const GLYPH_C = `M 180 25 L 75 25 L 25 75 L 25 145 L 75 195 L 180 195 L 180 155 L 90 155 L 60 125 L 60 95 L 90 65 L 180 65 Z`;
const GLYPH_A1 = `M 235 195 L 310 25 L 385 195 L 345 195 L 325 150 L 295 150 L 275 195 Z M 300 85 L 285 125 L 335 125 Z`;
const GLYPH_V = `M 435 25 L 510 195 L 585 25 L 545 25 L 510 135 L 475 25 Z`;
const GLYPH_D = `M 635 25 L 725 25 L 795 95 L 795 125 L 725 195 L 635 195 Z M 670 60 L 670 160 L 715 160 L 760 115 L 760 105 L 715 60 Z`;
const GLYPH_A2 = `M 845 195 L 920 25 L 995 195 L 955 195 L 935 150 L 905 150 L 885 195 Z M 910 85 L 895 125 L 945 125 Z`;
const GLYPH_X = `M 1045 25 L 1120 110 L 1045 195 L 1085 195 L 1140 130 L 1195 195 L 1235 195 L 1160 110 L 1235 25 L 1195 25 L 1140 90 L 1085 25 Z`;

function generateHtml(id, name, subtitle, patternDef, patternId, specText) {
  return `<!DOCTYPE html>
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
    border: 1px solid rgba(255,255,255,0.12);
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, rgba(0,0,0,1) 85%);
  }
  .tag {
    position: absolute;
    top: 24px;
    left: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.4em;
    opacity: 0.65;
  }
  .spec {
    position: absolute;
    bottom: 24px;
    right: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.65;
  }
  .corner-tl { position: absolute; top: 12px; left: 12px; width: 10px; height: 10px; border-top: 2px solid #FFF; border-left: 2px solid #FFF; }
  .corner-tr { position: absolute; top: 12px; right: 12px; width: 10px; height: 10px; border-top: 2px solid #FFF; border-right: 2px solid #FFF; }
  .corner-bl { position: absolute; bottom: 12px; left: 12px; width: 10px; height: 10px; border-bottom: 2px solid #FFF; border-left: 2px solid #FFF; }
  .corner-br { position: absolute; bottom: 12px; right: 12px; width: 10px; height: 10px; border-bottom: 2px solid #FFF; border-right: 2px solid #FFF; }
</style>
</head>
<body>
  <div class="card">
    <div class="corner-tl"></div>
    <div class="corner-tr"></div>
    <div class="corner-bl"></div>
    <div class="corner-br"></div>
    <div class="tag">// ARCHETYPE: ${id} // ${name} // ${subtitle}</div>
    <div class="spec">${specText}</div>

    <svg width="1300" height="270" viewBox="0 0 1300 270" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${patternDef}
      </defs>

      <!-- Monolithic Structural Glyphs (Solid Outer Contour enclosing Dense Pattern) -->
      <path d="${GLYPH_C}" fill="url(#${patternId})" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_A1}" fill="url(#${patternId})" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_V}" fill="url(#${patternId})" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_D}" fill="url(#${patternId})" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_A2}" fill="url(#${patternId})" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>
      <path d="${GLYPH_X}" fill="url(#${patternId})" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="miter"/>

      <!-- Concrete Architectural Directed Causal Graph Underline -->
      <g transform="translate(0, 235)">
        <line x1="25" y1="0" x2="1235" y2="0" stroke="#FFFFFF" stroke-width="2.5"/>
        
        <!-- Root Context Node under 'C' -->
        <circle cx="25" cy="0" r="7.5" fill="#FFFFFF"/>
        <circle cx="25" cy="0" r="14" stroke="#FFFFFF" stroke-width="1" stroke-dasharray="2 2"/>
        
        <!-- Decision Pivot Node under 'D' -->
        <rect x="630" y="-6" width="12" height="12" fill="#FFFFFF"/>
        <rect x="625" y="-11" width="22" height="22" stroke="#FFFFFF" stroke-width="1" stroke-dasharray="2 2" fill="none"/>
        
        <!-- Forward Execution Chevron under 'X' -->
        <polygon points="1248,0 1230,-8 1230,8" fill="#FFFFFF"/>
        <line x1="1225" y1="-12" x2="1225" y2="12" stroke="#FFFFFF" stroke-width="1.5"/>

        <!-- High-Assurance Telemetry Labels -->
        <text x="50" y="4" font-family="'SF Mono', Consolas, monospace" font-size="10.5" fill="#FFFFFF" opacity="0.85" letter-spacing="0.25em">CONTEXT_ROOT: 0xCAVDAX</text>
        <text x="660" y="4" font-family="'SF Mono', Consolas, monospace" font-size="10.5" fill="#FFFFFF" opacity="0.85" letter-spacing="0.25em">DECISION_PLANE: CONCRETE_PROVENANCE</text>
        <text x="1100" y="4" font-family="'SF Mono', Consolas, monospace" font-size="10.5" fill="#FFFFFF" opacity="0.85" letter-spacing="0.25em">GATE: APPROVED</text>
      </g>
    </svg>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 1. Tech 31: Kinetico-Moiré Interference Lattice
// ---------------------------------------------------------------------------
const patternTech31 = `
  <pattern id="moirePattern" width="16" height="16" patternUnits="userSpaceOnUse">
    <!-- Base 45° Micro Lines -->
    <line x1="0" y1="0" x2="16" y2="16" stroke="#FFFFFF" stroke-width="1.8" />
    <line x1="0" y1="8" x2="16" y2="24" stroke="#FFFFFF" stroke-width="1.8" />
    <line x1="-8" y1="0" x2="8" y2="16" stroke="#FFFFFF" stroke-width="1.8" />
    <!-- Secondary 15° Optical Interference Lines -->
    <line x1="0" y1="0" x2="16" y2="4.2" stroke="#FFFFFF" stroke-width="1.0" opacity="0.75" />
    <line x1="0" y1="8" x2="16" y2="12.2" stroke="#FFFFFF" stroke-width="1.0" opacity="0.75" />
    <circle cx="8" cy="8" r="1.5" fill="#FFFFFF" />
  </pattern>
`;

// ---------------------------------------------------------------------------
// 2. Tech 32: Topographical Causal Iso-Contour Monolith
// ---------------------------------------------------------------------------
const patternTech32 = `
  <pattern id="contourPattern" width="28" height="28" patternUnits="userSpaceOnUse">
    <!-- Concentric Geodesic LiDAR Isobars -->
    <path d="M 0 14 Q 7 4, 14 14 T 28 14" stroke="#FFFFFF" stroke-width="1.8" fill="none" />
    <path d="M 0 7 Q 7 -3, 14 7 T 28 7" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.85" />
    <path d="M 0 21 Q 7 11, 14 21 T 28 21" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.85" />
    <path d="M 0 28 Q 7 18, 14 28 T 28 28" stroke="#FFFFFF" stroke-width="1.8" fill="none" />
    <!-- Subtle Cross-Elevation Tick -->
    <line x1="14" y1="0" x2="14" y2="28" stroke="#FFFFFF" stroke-width="0.8" stroke-dasharray="2 4" opacity="0.4" />
  </pattern>
`;

// ---------------------------------------------------------------------------
// 3. Tech 33: Guilloché Banknote Security Weave
// ---------------------------------------------------------------------------
const patternTech33 = `
  <pattern id="guillochePattern" width="24" height="24" patternUnits="userSpaceOnUse">
    <!-- Sovereign Currency Rosette Oscillation -->
    <path d="M 0 12 C 6 0, 18 24, 24 12" stroke="#FFFFFF" stroke-width="1.6" fill="none" />
    <path d="M 0 12 C 6 24, 18 0, 24 12" stroke="#FFFFFF" stroke-width="1.6" fill="none" />
    <path d="M 12 0 C 0 6, 24 18, 12 24" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.75" />
    <path d="M 12 0 C 24 6, 0 18, 12 24" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.75" />
    <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
  </pattern>
`;

// ---------------------------------------------------------------------------
// 4. Tech 34: Quantum Braided Anyon Topological Braid
// ---------------------------------------------------------------------------
const patternTech34 = `
  <pattern id="braidPattern" width="20" height="20" patternUnits="userSpaceOnUse">
    <!-- Non-Abelian Anyon World-Line Braided Conduits -->
    <line x1="0" y1="10" x2="20" y2="10" stroke="#FFFFFF" stroke-width="2.2" />
    <path d="M 0 0 L 10 10 L 20 0" stroke="#FFFFFF" stroke-width="1.8" fill="none" />
    <path d="M 0 20 L 10 10 L 20 20" stroke="#FFFFFF" stroke-width="1.8" fill="none" />
    <!-- Over-Under Crossing Shield Blocks -->
    <rect x="8.5" y="8.5" width="3" height="3" fill="#000000" stroke="#FFFFFF" stroke-width="1.2" />
    <circle cx="0" cy="10" r="1.8" fill="#FFFFFF" />
    <circle cx="20" cy="10" r="1.8" fill="#FFFFFF" />
  </pattern>
`;

// ---------------------------------------------------------------------------
// 5. Tech 35: Brutalist Architectural Rebar Truss
// ---------------------------------------------------------------------------
const patternTech35 = `
  <pattern id="trussPattern" width="24" height="24" patternUnits="userSpaceOnUse">
    <!-- Heavy Industrial Pratt / Warren Truss Matrix -->
    <rect x="0" y="0" width="24" height="24" stroke="#FFFFFF" stroke-width="1.6" fill="none" />
    <line x1="0" y1="0" x2="24" y2="24" stroke="#FFFFFF" stroke-width="2.0" />
    <line x1="24" y1="0" x2="0" y2="24" stroke="#FFFFFF" stroke-width="1.2" opacity="0.7" />
    <!-- Gusset Joint Node Plates -->
    <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
    <circle cx="24" cy="0" r="2.5" fill="#FFFFFF" />
    <circle cx="0" cy="24" r="2.5" fill="#FFFFFF" />
    <circle cx="24" cy="24" r="2.5" fill="#FFFFFF" />
    <circle cx="12" cy="12" r="2.8" fill="#FFFFFF" />
  </pattern>
`;

const items = [
  {
    id: '31',
    name: 'MOIRE_INTERFERENCE_LATTICE',
    subtitle: 'KINETICO_OPTICAL_RESONANCE',
    specText: 'GEOMETRY: 45°/15° DUAL_RASTER // OP_ART COMPUTE_WAVE',
    patternDef: patternTech31,
    patternId: 'moirePattern',
    filename: 'wordmark-tech-31-moire-interference-lattice.jpg'
  },
  {
    id: '32',
    name: 'TOPOGRAPHIC_ISOCONTOUR_MONOLITH',
    subtitle: 'LIDAR_GEODESIC_ELEVATION',
    specText: 'SURFACE: 5-AXIS CNC MILLED // CONTINUOUS GEODESIC STEPS',
    patternDef: patternTech32,
    patternId: 'contourPattern',
    filename: 'wordmark-tech-32-topographic-isocontour-monolith.jpg'
  },
  {
    id: '33',
    name: 'GUILLOCHE_SECURITY_WEAVE',
    subtitle: 'SOVEREIGN_CRYPTOGRAPHIC_PASSPORT',
    specText: 'SECURITY: MATHEMATICAL SINE_ROSETTE // ZERO_FORGERY_THREAD',
    patternDef: patternTech33,
    patternId: 'guillochePattern',
    filename: 'wordmark-tech-33-guilloche-banknote-security-weave.jpg'
  },
  {
    id: '34',
    name: 'QUANTUM_BRAIDED_ANYON_TOPOLOGY',
    subtitle: 'NON_ABELIAN_WORLDLINE_BRAID',
    specText: 'LATTICE: MULTI_RAIL QUANTUM DATA // TOPOLOGICAL_KNOT_PROOF',
    patternDef: patternTech34,
    patternId: 'braidPattern',
    filename: 'wordmark-tech-34-quantum-braided-anyon-topology.jpg'
  },
  {
    id: '35',
    name: 'BRUTALIST_REBAR_TRUSS',
    subtitle: 'VIERENDEEL_STRUCTURAL_GIRDER',
    specText: 'STRUCTURE: HIGH_TENSILE REBAR // RIVETED_GUSSET_JOINTS',
    patternDef: patternTech35,
    patternId: 'trussPattern',
    filename: 'wordmark-tech-35-brutalist-rebar-truss.jpg'
  }
];

async function main() {
  const browserPath = findSystemBrowser();
  if (!browserPath) {
    console.error('No system Chrome or Edge browser found.');
    process.exit(1);
  }
  console.log(`Launching headless browser from ${browserPath}...`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  for (const item of items) {
    const html = generateHtml(item.id, item.name, item.subtitle, item.patternDef, item.patternId, item.specText);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 120));
    const outPath = path.join(wordmarksDir, item.filename);
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 98 });
    console.log(`✓ Rendered Archetype ${item.id} -> ${item.filename}`);
  }

  await browser.close();
  console.log('Successfully rendered all 5 Batch 8 Pattern Wordmarks in 1920x1080!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
