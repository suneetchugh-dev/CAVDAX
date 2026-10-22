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

// Monolithic Concrete Architectural Glyphs (Chamfered 45°/90° vectors)
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
        <text x="50" y="4" font-family="'SF Mono', Consolas, monospace" font-size="10.5" fill="#FFFFFF" opacity="0.85" letter-spacing="0.25em">CAUSAL_SEED: DETERMINISTIC_STATE</text>
        <text x="660" y="4" font-family="'SF Mono', Consolas, monospace" font-size="10.5" fill="#FFFFFF" opacity="0.85" letter-spacing="0.25em">SYNAPSE_TOPOLOGY: APERIODIC_VERIFIED</text>
        <text x="1110" y="4" font-family="'SF Mono', Consolas, monospace" font-size="10.5" fill="#FFFFFF" opacity="0.85" letter-spacing="0.25em">EXEC_STATE: FINAL</text>
      </g>
    </svg>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 1. Tech 36: Penrose Aperiodic Quasicrystal Matrix
// ---------------------------------------------------------------------------
const patternTech36 = `
  <pattern id="penrosePattern" width="30" height="30" patternUnits="userSpaceOnUse">
    <!-- Rhombic & Dart Aperiodic Vectors with 72° / 36° golden ratio symmetry -->
    <polygon points="15,0 30,10 15,20 0,10" stroke="#FFFFFF" stroke-width="1.4" fill="none"/>
    <polygon points="15,10 30,20 15,30 0,20" stroke="#FFFFFF" stroke-width="1.4" fill="none"/>
    <line x1="15" y1="0" x2="15" y2="30" stroke="#FFFFFF" stroke-width="0.9" stroke-dasharray="2 3" opacity="0.7"/>
    <circle cx="15" cy="10" r="1.8" fill="#FFFFFF"/>
    <circle cx="0" cy="10" r="1.5" fill="#FFFFFF"/>
    <circle cx="30" cy="10" r="1.5" fill="#FFFFFF"/>
    <circle cx="15" cy="20" r="1.8" fill="#FFFFFF"/>
  </pattern>
`;

// ---------------------------------------------------------------------------
// 2. Tech 37: Chladni Cymatics Resonant Waveform
// ---------------------------------------------------------------------------
const patternTech37 = `
  <pattern id="chladniPattern" width="32" height="32" patternUnits="userSpaceOnUse">
    <!-- Hyperbolic acoustic nodal lines & circular standing waves -->
    <circle cx="16" cy="16" r="14" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.8"/>
    <circle cx="16" cy="16" r="8" stroke="#FFFFFF" stroke-width="1.5" fill="none"/>
    <path d="M 0 0 Q 16 16, 32 0" stroke="#FFFFFF" stroke-width="1.3" fill="none"/>
    <path d="M 0 32 Q 16 16, 32 32" stroke="#FFFFFF" stroke-width="1.3" fill="none"/>
    <path d="M 0 0 Q 16 16, 0 32" stroke="#FFFFFF" stroke-width="1.3" fill="none"/>
    <path d="M 32 0 Q 16 16, 32 32" stroke="#FFFFFF" stroke-width="1.3" fill="none"/>
    <circle cx="16" cy="16" r="2.2" fill="#FFFFFF"/>
  </pattern>
`;

// ---------------------------------------------------------------------------
// 3. Tech 38: Cellular Automata (Rule 30 & Conway Glider)
// ---------------------------------------------------------------------------
const patternTech38 = `
  <pattern id="automataPattern" width="24" height="24" patternUnits="userSpaceOnUse">
    <!-- Discrete triangular chaotic pyramidal growth & glider coordinates -->
    <rect x="0" y="0" width="24" height="24" stroke="#FFFFFF" stroke-width="0.8" stroke-dasharray="1 3" fill="none" opacity="0.3"/>
    <!-- Binary Active State Cells -->
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
    <!-- Directional automata connection micro-vectors -->
    <line x1="4" y1="4" x2="8" y2="10" stroke="#FFFFFF" stroke-width="0.9" opacity="0.6"/>
    <line x1="12" y1="4" x2="16" y2="10" stroke="#FFFFFF" stroke-width="0.9" opacity="0.6"/>
  </pattern>
`;

// ---------------------------------------------------------------------------
// 4. Tech 39: Anisotropic Carbon-Fiber Twill Monocoque Weave
// ---------------------------------------------------------------------------
const patternTech39 = `
  <pattern id="carbonPattern" width="24" height="24" patternUnits="userSpaceOnUse">
    <!-- 2x2 Aerospace Carbon Twill Weave Blocks -->
    <rect x="0" y="0" width="12" height="12" fill="#000000"/>
    <line x1="0" y1="0" x2="12" y2="12" stroke="#FFFFFF" stroke-width="1.4"/>
    <line x1="0" y1="4" x2="8" y2="12" stroke="#FFFFFF" stroke-width="1.4"/>
    <line x1="4" y1="0" x2="12" y2="8" stroke="#FFFFFF" stroke-width="1.4"/>
    
    <rect x="12" y="12" width="12" height="12" fill="#000000"/>
    <line x1="12" y1="12" x2="24" y2="24" stroke="#FFFFFF" stroke-width="1.4"/>
    <line x1="12" y1="16" x2="20" y2="24" stroke="#FFFFFF" stroke-width="1.4"/>
    <line x1="16" y1="12" x2="24" y2="20" stroke="#FFFFFF" stroke-width="1.4"/>

    <!-- Counter-Directional Blocks (-45° striations) -->
    <line x1="24" y1="0" x2="12" y2="12" stroke="#FFFFFF" stroke-width="1.4"/>
    <line x1="20" y1="0" x2="12" y2="8" stroke="#FFFFFF" stroke-width="1.4"/>
    <line x1="24" y1="4" x2="16" y2="12" stroke="#FFFFFF" stroke-width="1.4"/>

    <line x1="12" y1="12" x2="0" y2="24" stroke="#FFFFFF" stroke-width="1.4"/>
    <line x1="8" y1="12" x2="0" y2="20" stroke="#FFFFFF" stroke-width="1.4"/>
    <line x1="12" y1="16" x2="4" y2="24" stroke="#FFFFFF" stroke-width="1.4"/>
  </pattern>
`;

// ---------------------------------------------------------------------------
// 5. Tech 40: Fresnel Zone Plate & Synthetic Aperture Radar (SAR)
// ---------------------------------------------------------------------------
const patternTech40 = `
  <pattern id="fresnelPattern" width="36" height="36" patternUnits="userSpaceOnUse">
    <!-- Concentric Fresnel Zone Phase Rings -->
    <circle cx="18" cy="18" r="17" stroke="#FFFFFF" stroke-width="1.0" fill="none" opacity="0.6"/>
    <circle cx="18" cy="18" r="14" stroke="#FFFFFF" stroke-width="1.8" fill="none"/>
    <circle cx="18" cy="18" r="10" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.8"/>
    <circle cx="18" cy="18" r="6" stroke="#FFFFFF" stroke-width="2.2" fill="none"/>
    <circle cx="18" cy="18" r="2" fill="#FFFFFF"/>
    <!-- Quad-Axis Phase Delay Graticule -->
    <line x1="0" y1="18" x2="36" y2="18" stroke="#FFFFFF" stroke-width="1.0" stroke-dasharray="3 3"/>
    <line x1="18" y1="0" x2="18" y2="36" stroke="#FFFFFF" stroke-width="1.0" stroke-dasharray="3 3"/>
  </pattern>
`;

const items = [
  {
    id: '36',
    name: 'PENROSE_APERIODIC_QUASICRYSTAL',
    subtitle: 'INFINITE_NON_PERIODIC_DAG_ORDER',
    specText: 'GEOMETRY: 5-FOLD APERIODIC LATTICE // GOLDEN_RATIO RHOMBIC_DART',
    patternDef: patternTech36,
    patternId: 'penrosePattern',
    filename: 'wordmark-tech-36-penrose-aperiodic-quasicrystal.jpg'
  },
  {
    id: '37',
    name: 'CHLADNI_CYMATICS_RESONANT_WAVEFORM',
    subtitle: 'ACOUSTIC_FREQUENCY_NODAL_MATRIX',
    specText: 'RESONANCE: HYPERBOLIC STANDING_WAVE // NODAL_POINT_INTEGRITY',
    patternDef: patternTech37,
    patternId: 'chladniPattern',
    filename: 'wordmark-tech-37-chladni-cymatics-resonant-waveform.jpg'
  },
  {
    id: '38',
    name: 'DISCRETE_CELLULAR_AUTOMATA_MATRIX',
    subtitle: 'RULE_30_CHAOTIC_CONWAY_LIFE',
    specText: 'COMPUTE: DISCRETE TIMESTEP EVOLUTION // DETERMINISTIC_CELL_GRID',
    patternDef: patternTech38,
    patternId: 'automataPattern',
    filename: 'wordmark-tech-38-discrete-cellular-automata-matrix.jpg'
  },
  {
    id: '39',
    name: 'ANISOTROPIC_CARBON_MONOCOQUE_WEAVE',
    subtitle: 'AEROSPACE_2X2_CARBON_TWILL',
    specText: 'STRUCTURAL: HIGH_MODULUS CARBON_FIBER // 45°/-45° TENSILE_LATTICE',
    patternDef: patternTech39,
    patternId: 'carbonPattern',
    filename: 'wordmark-tech-39-anisotropic-carbon-monocoque-weave.jpg'
  },
  {
    id: '40',
    name: 'FRESNEL_ZONE_PLATE_RADAR_APERTURE',
    subtitle: 'COHERENT_SYNTHETIC_APERTURE_OPTICS',
    specText: 'OPTICS: PHASE_REVERSAL RADIAL_ZONES // SAR_PHASED_ARRAY_CONJUGATE',
    patternDef: patternTech40,
    patternId: 'fresnelPattern',
    filename: 'wordmark-tech-40-fresnel-zone-plate-radar-aperture.jpg'
  }
];

async function main() {
  const browserPath = findSystemBrowser();
  if (!browserPath) {
    console.error('No suitable browser found.');
    process.exit(1);
  }

  console.log(`Launching browser: ${browserPath}`);
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  for (const item of items) {
    console.log(`Rendering Tech ${item.id}: ${item.name}...`);
    const html = generateHtml(item.id, item.name, item.subtitle, item.patternDef, item.patternId, item.specText);
    
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 150));

    const outPath = path.join(wordmarksDir, item.filename);
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 96 });
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
  console.log('Batch 9 pattern generation complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
