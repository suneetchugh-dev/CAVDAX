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

const outputDir = path.resolve(__dirname, '../docs/brand_explorations');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Tech 08: Telemetry HUD
const htmlTech08 = `<!DOCTYPE html>
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
  .hud-frame {
    position: relative;
    width: 1500px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.12);
  }
  .corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border-color: #FFFFFF;
    border-style: solid;
  }
  .top-left { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
  .top-right { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
  .bottom-left { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
  .bottom-right { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
  .hud-tag {
    position: absolute;
    top: 20px;
    left: 28px;
    font-size: 11px;
    letter-spacing: 0.35em;
    font-family: 'SF Mono', Consolas, monospace;
    opacity: 0.6;
    text-transform: uppercase;
  }
  .hud-coord {
    position: absolute;
    bottom: 20px;
    right: 28px;
    font-size: 11px;
    letter-spacing: 0.35em;
    font-family: 'SF Mono', Consolas, monospace;
    opacity: 0.6;
  }
</style>
</head>
<body>
  <div class="hud-frame">
    <div class="corner top-left"></div>
    <div class="corner top-right"></div>
    <div class="corner bottom-left"></div>
    <div class="corner bottom-right"></div>
    <div class="hud-tag">// SYSTEM_ARCHETYPE: 08 // TELEMETRY_HUD // SPEC_ISO_26043</div>
    <div class="hud-coord">LAT: 0xCAVDAX // RETICLE_GATE: [0101]</div>

    <!-- Exact Architectural Vector SVG -->
    <svg width="1200" height="260" viewBox="0 0 1200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Letter C -->
      <path d="M 160 30 L 70 30 L 25 75 L 25 145 L 70 190 L 160 190" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square" stroke-linejoin="miter" />
      
      <!-- Letter A -->
      <path d="M 220 190 L 290 30 L 360 190 M 248 135 L 332 135" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square" stroke-linejoin="miter" />

      <!-- Letter V -->
      <path d="M 420 30 L 490 190 L 560 30" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square" stroke-linejoin="miter" />

      <!-- Letter D -->
      <path d="M 620 30 L 700 30 L 760 90 L 760 130 L 700 190 L 620 190 Z" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square" stroke-linejoin="miter" />

      <!-- Letter A -->
      <path d="M 820 190 L 890 30 L 960 190 M 848 135 L 932 135" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square" stroke-linejoin="miter" />

      <!-- Letter X -->
      <path d="M 1020 30 L 1160 190 M 1160 30 L 1020 190" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square" stroke-linejoin="miter" />

      <!-- Reticle Crosshair at X center -->
      <circle cx="1090" cy="110" r="14" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.6"/>
      <line x1="1090" y1="90" x2="1090" y2="130" stroke="#FFFFFF" stroke-width="2" opacity="0.6"/>
      <line x1="1070" y1="110" x2="1110" y2="110" stroke="#FFFFFF" stroke-width="2" opacity="0.6"/>

      <!-- Integrated Causal DAG Pipeline -->
      <g transform="translate(0, 235)">
        <!-- Horizontal Trace -->
        <line x1="25" y1="0" x2="1160" y2="0" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square" />
        
        <!-- Vertex C (Context) -->
        <circle cx="25" cy="0" r="7" fill="#FFFFFF" />
        <text x="38" y="4" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" opacity="0.8" letter-spacing="0.1em">CTX</text>

        <!-- Vertex D (Decision) -->
        <circle cx="620" cy="0" r="7" fill="#FFFFFF" />
        <text x="633" y="4" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" opacity="0.8" letter-spacing="0.1em">DEC</text>

        <!-- Vertex X (Execution Chevron) -->
        <polygon points="1160,0 1145,-9 1145,9" fill="#FFFFFF" />
        <text x="1110" y="4" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" opacity="0.8" letter-spacing="0.1em" text-anchor="end">EXEC</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// 2. Tech 09: Matrix Monolith (Teenage Engineering & Hardware Brutalism)
const htmlTech09 = `<!DOCTYPE html>
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
  .monolith-frame {
    position: relative;
    width: 1540px;
    height: 680px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .hardware-badge {
    position: absolute;
    top: 24px;
    left: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 12px;
    letter-spacing: 0.3em;
    opacity: 0.7;
  }
  .dot-grid {
    width: 12px;
    height: 12px;
    background: #FFFFFF;
    border-radius: 2px;
  }
</style>
</head>
<body>
  <div class="monolith-frame">
    <div class="hardware-badge">
      <div class="dot-grid"></div>
      <span>TE-MODULAR // HARDWARE_BRUTALIST // OP-01 STANDARD</span>
    </div>

    <!-- Pure Monolithic Geometric Typography SVG -->
    <svg width="1300" height="280" viewBox="0 0 1300 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C -->
      <path d="M 180 20 L 60 20 C 30 20 20 30 20 60 L 20 160 C 20 190 30 200 60 200 L 180 200" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- A -->
      <path d="M 250 200 L 320 20 L 390 200" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="275" y1="140" x2="365" y2="140" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round"/>

      <!-- V -->
      <path d="M 460 20 L 530 200 L 600 20" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- D -->
      <path d="M 670 20 L 740 20 C 790 20 820 50 820 110 C 820 170 790 200 740 200 L 670 200 Z" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- A -->
      <path d="M 890 200 L 960 20 L 1030 200" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="915" y1="140" x2="1005" y2="140" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round"/>

      <!-- X -->
      <path d="M 1100 20 L 1240 200 M 1240 20 L 1100 200" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Mechanical Waveform Causal Edge -->
      <g transform="translate(0, 255)">
        <path d="M 20 0 L 220 0 L 240 -12 L 260 12 L 280 0 L 650 0 L 670 -12 L 690 12 L 710 0 L 1210 0" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="square"/>
        <circle cx="20" cy="0" r="8" fill="#FFFFFF"/>
        <circle cx="670" cy="0" r="8" fill="#FFFFFF"/>
        <polygon points="1240,0 1215,-10 1215,10" fill="#FFFFFF"/>
        <text x="40" y="-8" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.7" letter-spacing="0.2em">IN: CAUSE</text>
        <text x="730" y="-8" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.7" letter-spacing="0.2em">STAGE: DECISION</text>
        <text x="1190" y="-8" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.7" letter-spacing="0.2em" text-anchor="end">OUT: EXECUTE</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// 3. Tech 10: Deep AST Compiler Syntax Token
const htmlTech10 = `<!DOCTYPE html>
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
    font-family: 'SF Mono', Consolas, "Fira Code", monospace;
    color: #FFFFFF;
  }
  .compiler-frame {
    position: relative;
    width: 1560px;
    height: 720px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .header-syntax {
    font-size: 13px;
    letter-spacing: 0.4em;
    margin-bottom: 50px;
    opacity: 0.6;
    text-transform: uppercase;
  }
  .proof-line {
    font-size: 14px;
    letter-spacing: 0.35em;
    margin-top: 45px;
    opacity: 0.85;
    display: flex;
    align-items: center;
    gap: 20px;
  }
</style>
</head>
<body>
  <div class="compiler-frame">
    <div class="header-syntax">type CavdaxGate = AST::CausalProofEngine&lt;FalkorDB, GraphBLAS&gt;;</div>

    <!-- Pure Rust/LLVM Syntax Token Wordmark -->
    <svg width="1340" height="230" viewBox="0 0 1340 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Syntactic Open Bracket -->
      <path d="M 60 20 L 20 20 L 20 180 L 60 180" stroke="#FFFFFF" stroke-width="8" stroke-linecap="square" opacity="0.5"/>
      
      <!-- C -->
      <path d="M 210 20 L 130 20 L 90 60 L 90 140 L 130 180 L 210 180" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- A -->
      <path d="M 270 180 L 340 20 L 410 180 M 295 130 L 385 130" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- V -->
      <path d="M 470 20 L 540 180 L 610 20" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- D -->
      <path d="M 670 20 L 750 20 L 810 80 L 810 120 L 750 180 L 670 180 Z" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- A -->
      <path d="M 870 180 L 940 20 L 1010 180 M 895 130 L 985 130" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- X -->
      <path d="M 1070 20 L 1210 180 M 1210 20 L 1070 180" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- Syntactic Close Bracket -->
      <path d="M 1240 20 L 1280 20 L 1280 180 L 1240 180" stroke="#FFFFFF" stroke-width="8" stroke-linecap="square" opacity="0.5"/>

      <!-- Compiler Transition Operator Lambda -->
      <g transform="translate(0, 215)">
        <line x1="90" y1="0" x2="1210" y2="0" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8 6"/>
        <circle cx="90" cy="0" r="5" fill="#FFFFFF"/>
        <circle cx="670" cy="0" r="5" fill="#FFFFFF"/>
        <polygon points="1215,0 1200,-6 1200,6" fill="#FFFFFF"/>
      </g>
    </svg>

    <div class="proof-line">
      <span>⊢ ctx.eval()</span>
      <span>━━━●━━━</span>
      <span>dec.verify()</span>
      <span>━━━●━━━&gt;</span>
      <span>exec()</span>
    </div>
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
    { name: 'wordmark-tech-08-telemetry-hud', html: htmlTech08 },
    { name: 'wordmark-tech-09-matrix-monolith', html: htmlTech09 },
    { name: 'wordmark-tech-10-compiler-ast-syntax', html: htmlTech10 },
  ];

  for (const t of targets) {
    await page.setContent(t.html, { waitUntil: 'domcontentloaded' });
    const imgPath = path.join(outputDir, `${t.name}.jpg`);
    await page.screenshot({ path: imgPath, type: 'jpeg', quality: 95 });
    console.log(`Saved screenshot: ${imgPath}`);
  }

  await browser.close();
  console.log('All 3 new techy wordmarks generated and saved successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
