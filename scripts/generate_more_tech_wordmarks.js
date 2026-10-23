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
// Tech 11: Laser-Etched Dual-Rail Silicon Monolith
// -------------------------------------------------------------
const htmlTech11 = `<!DOCTYPE html>
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
  .frame {
    position: relative;
    width: 1540px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .tag {
    position: absolute;
    top: 24px;
    left: 36px;
    font-size: 11px;
    letter-spacing: 0.4em;
    font-family: 'SF Mono', Consolas, monospace;
    opacity: 0.6;
  }
  .spec {
    position: absolute;
    bottom: 24px;
    right: 36px;
    font-size: 11px;
    letter-spacing: 0.35em;
    font-family: 'SF Mono', Consolas, monospace;
    opacity: 0.6;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="tag">// ARCHETYPE: 11 // SILICON_DUAL_RAIL // NEURAL_DIE_LITHOGRAPHY</div>
    <div class="spec">NANOMETER_PRECISION // 0.05nm BUS GATE</div>

    <svg width="1300" height="270" viewBox="0 0 1300 270" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C Dual Rail -->
      <path d="M 170 30 L 70 30 C 40 30 30 40 30 70 L 30 150 C 30 180 40 190 70 190 L 170 190" stroke="#FFFFFF" stroke-width="6" stroke-linecap="square"/>
      <path d="M 170 44 L 80 44 C 55 44 44 55 44 80 L 44 140 C 44 165 55 176 80 176 L 170 176" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square" opacity="0.7"/>

      <!-- A Dual Rail -->
      <path d="M 230 190 L 300 30 L 370 190 M 255 140 L 345 140" stroke="#FFFFFF" stroke-width="6" stroke-linecap="square"/>
      <path d="M 245 186 L 300 62 L 355 186 M 268 148 L 332 148" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square" opacity="0.7"/>

      <!-- V Dual Rail -->
      <path d="M 430 30 L 500 190 L 570 30" stroke="#FFFFFF" stroke-width="6" stroke-linecap="square"/>
      <path d="M 445 34 L 500 166 L 555 34" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square" opacity="0.7"/>

      <!-- D Dual Rail -->
      <path d="M 630 30 L 710 30 C 765 30 790 55 790 110 C 790 165 765 190 710 190 L 630 190 Z" stroke="#FFFFFF" stroke-width="6" stroke-linecap="square"/>
      <path d="M 644 44 L 700 44 C 745 44 774 65 774 110 C 774 155 745 176 700 176 L 644 176 Z" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square" opacity="0.7"/>

      <!-- A Dual Rail -->
      <path d="M 850 190 L 920 30 L 990 190 M 875 140 L 965 140" stroke="#FFFFFF" stroke-width="6" stroke-linecap="square"/>
      <path d="M 865 186 L 920 62 L 975 186 M 888 148 L 952 148" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square" opacity="0.7"/>

      <!-- X Dual Rail -->
      <path d="M 1050 30 L 1190 190 M 1190 30 L 1050 190" stroke="#FFFFFF" stroke-width="6" stroke-linecap="square"/>
      <path d="M 1066 30 L 1174 190 M 1174 30 L 1066 190" stroke="#FFFFFF" stroke-width="3" stroke-linecap="square" opacity="0.7"/>

      <!-- Optical Bus Baseline -->
      <g transform="translate(0, 240)">
        <line x1="30" y1="0" x2="1190" y2="0" stroke="#FFFFFF" stroke-width="2"/>
        <line x1="30" y1="5" x2="1190" y2="5" stroke="#FFFFFF" stroke-width="1" opacity="0.4"/>
        
        <!-- Neural Cluster Nodes -->
        <circle cx="30" cy="0" r="6" fill="#FFFFFF"/>
        <circle cx="630" cy="0" r="6" fill="#FFFFFF"/>
        <polygon points="1190,0 1175,-7 1175,7" fill="#FFFFFF"/>

        <text x="50" y="3" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">OPTICAL_BUS: CONTEXT</text>
        <text x="650" y="3" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">GATE: VERIFIED_DECISION</text>
        <text x="1155" y="3" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em" text-anchor="end">TERMINAL_EXECUTE</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 12: Cypherpunk Bytecode Kernel
// -------------------------------------------------------------
const htmlTech12 = `<!DOCTYPE html>
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
  .frame {
    position: relative;
    width: 1540px;
    height: 720px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .header-hex {
    font-size: 13px;
    letter-spacing: 0.45em;
    margin-bottom: 35px;
    opacity: 0.5;
  }
  .memory-bus {
    font-size: 13px;
    letter-spacing: 0.3em;
    margin-top: 40px;
    opacity: 0.75;
    display: flex;
    gap: 25px;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="header-hex">HEX: 0x43 [C]  0x41 [A]  0x56 [V]  0x44 [D]  0x41 [A]  0x58 [X]</div>

    <svg width="1280" height="240" viewBox="0 0 1280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C -->
      <path d="M 180 30 L 70 30 L 30 70 L 30 150 L 70 190 L 180 190" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <text x="30" y="20" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" opacity="0.4">0x43</text>

      <!-- A -->
      <path d="M 240 190 L 310 30 L 380 190 M 265 140 L 355 140" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <text x="240" y="20" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" opacity="0.4">0x41</text>

      <!-- V -->
      <path d="M 440 30 L 510 190 L 580 30" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <text x="440" y="20" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" opacity="0.4">0x56</text>

      <!-- D -->
      <path d="M 640 30 L 720 30 L 780 90 L 780 130 L 720 190 L 640 190 Z" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <text x="640" y="20" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" opacity="0.4">0x44</text>

      <!-- A -->
      <path d="M 840 190 L 910 30 L 980 190 M 865 140 L 955 140" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <text x="840" y="20" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" opacity="0.4">0x41</text>

      <!-- X -->
      <path d="M 1040 30 L 1180 190 M 1180 30 L 1040 190" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <text x="1040" y="20" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" opacity="0.4">0x58</text>

      <!-- Kernel Bus Line -->
      <g transform="translate(0, 225)">
        <line x1="30" y1="0" x2="1180" y2="0" stroke="#FFFFFF" stroke-width="3"/>
        <rect x="25" y="-5" width="10" height="10" fill="#FFFFFF"/>
        <rect x="635" y="-5" width="10" height="10" fill="#FFFFFF"/>
        <polygon points="1185,0 1170,-7 1170,7" fill="#FFFFFF"/>
      </g>
    </svg>

    <div class="memory-bus">
      <span>PTR: 0x0000_CTX</span>
      <span>━━━[FALKOR_DAG]━━━</span>
      <span>PTR: 0x0040_DEC</span>
      <span>━━━[MCP_GATE]━━━&gt;</span>
      <span>PTR: 0x0080_EXEC</span>
    </div>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 13: Radar Vector Oscilloscope
// -------------------------------------------------------------
const htmlTech13 = `<!DOCTYPE html>
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
  .frame {
    position: relative;
    width: 1540px;
    height: 720px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .radar-ring {
    position: absolute;
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 50%;
  }
  .ring-1 { width: 500px; height: 500px; }
  .ring-2 { width: 850px; height: 850px; }
  .telemetry-bar {
    position: absolute;
    bottom: 24px;
    width: calc(100% - 80px);
    display: flex;
    justify-content: space-between;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.7;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="radar-ring ring-1"></div>
    <div class="radar-ring ring-2"></div>

    <svg width="1280" height="260" viewBox="0 0 1280 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Radar Target Grid Background Ticks -->
      <line x1="640" y1="0" x2="640" y2="210" stroke="#FFFFFF" stroke-width="1" stroke-dasharray="4 6" opacity="0.2"/>

      <!-- C with 90° azimuth tick -->
      <path d="M 180 25 C 100 25 35 70 35 115 C 35 160 100 205 180 205" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round"/>
      <line x1="25" y1="115" x2="45" y2="115" stroke="#FFFFFF" stroke-width="3"/>
      <text x="10" y="119" font-family="'SF Mono', Consolas, monospace" font-size="10" fill="#FFFFFF" opacity="0.6">090°</text>

      <!-- A -->
      <path d="M 240 205 L 315 25 L 390 205 M 268 145 L 362 145" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- V -->
      <path d="M 450 25 L 525 205 L 600 25" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- D -->
      <path d="M 660 25 L 730 25 C 800 25 830 65 830 115 C 830 165 800 205 730 205 L 660 205 Z" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- A -->
      <path d="M 890 205 L 965 25 L 1040 205 M 918 145 L 1012 145" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- X with Lock Target Reticle -->
      <path d="M 1100 25 L 1240 205 M 1240 25 L 1100 205" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="1170" cy="115" r="22" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="1170" cy="115" r="3" fill="#FFFFFF"/>

      <!-- Causal Sonar Waveform Baseline -->
      <g transform="translate(0, 240)">
        <path d="M 35 0 L 220 0 L 240 -10 L 260 10 L 280 0 L 660 0 L 680 -10 L 700 10 L 720 0 L 1215 0" stroke="#FFFFFF" stroke-width="3" fill="none"/>
        <circle cx="35" cy="0" r="7" fill="#FFFFFF"/>
        <circle cx="660" cy="0" r="7" fill="#FFFFFF"/>
        <polygon points="1240,0 1220,-8 1220,8" fill="#FFFFFF"/>
      </g>
    </svg>

    <div class="telemetry-bar">
      <span>AZIMUTH: 045.2° // BEARING: VERIFIED</span>
      <span>FREQ: 1420 MHz // GRAPHBLAS PULSE</span>
      <span>RANGE_LOCK: AUTONOMOUS_EXEC</span>
    </div>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 14: Quantum Phase-Gate Lattice
// -------------------------------------------------------------
const htmlTech14 = `<!DOCTYPE html>
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
    font-family: 'SF Mono', Consolas, monospace;
    color: #FFFFFF;
  }
  .frame {
    position: relative;
    width: 1540px;
    height: 720px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .state-vector {
    font-size: 13px;
    letter-spacing: 0.4em;
    margin-bottom: 45px;
    opacity: 0.6;
  }
  .circuit-label {
    font-size: 13px;
    letter-spacing: 0.35em;
    margin-top: 45px;
    opacity: 0.8;
    display: flex;
    gap: 30px;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="state-vector">|Ψ_CAVDAX⟩ = α |CONTEXT⟩ + β |DECISION⟩ ➔ |1_EXECUTION⟩</div>

    <svg width="1300" height="240" viewBox="0 0 1300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C -->
      <path d="M 180 20 L 70 20 L 25 65 L 25 145 L 70 190 L 180 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      
      <!-- A -->
      <path d="M 240 190 L 310 20 L 380 190 M 265 135 L 355 135" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- V -->
      <path d="M 440 20 L 510 190 L 580 20" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- D -->
      <path d="M 640 20 L 710 20 L 780 90 L 780 120 L 710 190 L 640 190 Z" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- A -->
      <path d="M 840 190 L 910 20 L 980 190 M 865 135 L 955 135" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- X -->
      <path d="M 1040 20 L 1190 190 M 1190 20 L 1040 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- Quantum Circuit Baseline -->
      <g transform="translate(0, 225)">
        <line x1="25" y1="0" x2="1190" y2="0" stroke="#FFFFFF" stroke-width="2"/>
        
        <!-- Hadamard Gate Box under C -->
        <rect x="15" y="-14" width="28" height="28" stroke="#FFFFFF" stroke-width="2" fill="#000000"/>
        <text x="29" y="5" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" text-anchor="middle">H</text>

        <!-- Phase Gate Box under D -->
        <rect x="696" y="-14" width="28" height="28" stroke="#FFFFFF" stroke-width="2" fill="#000000"/>
        <text x="710" y="5" font-family="'SF Mono', Consolas, monospace" font-size="12" fill="#FFFFFF" text-anchor="middle">Z</text>

        <!-- Measurement Gate under X -->
        <polygon points="1200,0 1180,-10 1180,10" fill="#FFFFFF"/>
      </g>
    </svg>

    <div class="circuit-label">
      <span>GATE[0]: HADAMARD(CAUSE)</span>
      <span>━━━[Q-ENTANGLE]━━━</span>
      <span>GATE[1]: PHASE_SHIFT(DECISION)</span>
      <span>━━━&gt;</span>
      <span>MEASURE: |EXECUTE⟩</span>
    </div>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 15: Cyber-Chassis Server Blade
// -------------------------------------------------------------
const htmlTech15 = `<!DOCTYPE html>
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
  .blade-frame {
    position: relative;
    width: 1540px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(255,255,255,0.15);
  }
  .rack-mount {
    position: absolute;
    top: 24px;
    left: 36px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 12px;
    letter-spacing: 0.35em;
    opacity: 0.7;
  }
  .mount-hole {
    width: 14px;
    height: 14px;
    border: 2px solid #FFFFFF;
    border-radius: 50%;
  }
  .rack-spec {
    position: absolute;
    bottom: 24px;
    right: 36px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.7;
  }
</style>
</head>
<body>
  <div class="blade-frame">
    <div class="rack-mount">
      <div class="mount-hole"></div>
      <span>SERVER_RACK_BLADE // EXOSKELETON_CHASSIS // 1U SPEC</span>
    </div>
    <div class="rack-spec">HOT_SWAP_DAG_NODE // 100GbE FABRIC</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C with Ventilation Slot -->
      <path d="M 170 30 L 70 30 C 40 30 30 40 30 70 L 30 150 C 30 180 40 190 70 190 L 170 190" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
      <line x1="30" y1="95" x2="30" y2="125" stroke="#000000" stroke-width="8" stroke-linecap="square"/>

      <!-- A with Center Slot -->
      <path d="M 230 190 L 300 30 L 370 190 M 255 140 L 345 140" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>

      <!-- V -->
      <path d="M 430 30 L 500 190 L 570 30" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>

      <!-- D with Internal Void -->
      <path d="M 630 30 L 710 30 C 765 30 790 55 790 110 C 790 165 765 190 710 190 L 630 190 Z" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>
      <line x1="790" y1="95" x2="790" y2="125" stroke="#000000" stroke-width="8" stroke-linecap="square"/>

      <!-- A -->
      <path d="M 850 190 L 920 30 L 990 190 M 875 140 L 965 140" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>

      <!-- X -->
      <path d="M 1050 30 L 1190 190 M 1190 30 L 1050 190" stroke="#FFFFFF" stroke-width="26" stroke-linecap="square"/>

      <!-- Heavy Industrial Conduit Baseline -->
      <g transform="translate(0, 235)">
        <line x1="30" y1="0" x2="1190" y2="0" stroke="#FFFFFF" stroke-width="4"/>
        
        <!-- Conduit Clamps -->
        <rect x="20" y="-8" width="20" height="16" fill="#FFFFFF"/>
        <rect x="620" y="-8" width="20" height="16" fill="#FFFFFF"/>
        <polygon points="1195,0 1175,-10 1175,10" fill="#FFFFFF"/>

        <text x="50" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">POWER: 48V_VERIFIED</text>
        <text x="650" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">LINK: FALKOR_BUS</text>
        <text x="1160" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em" text-anchor="end">STATUS: ARMED</text>
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
    { name: 'wordmark-tech-11-laser-etched-monolith', html: htmlTech11 },
    { name: 'wordmark-tech-12-cypherpunk-kernel', html: htmlTech12 },
    { name: 'wordmark-tech-13-radar-oscilloscope', html: htmlTech13 },
    { name: 'wordmark-tech-14-quantum-phase-gate', html: htmlTech14 },
    { name: 'wordmark-tech-15-cyber-chassis-blade', html: htmlTech15 },
  ];

  for (const t of targets) {
    await page.setContent(t.html, { waitUntil: 'domcontentloaded' });
    const imgPath = path.join(wordmarksDir, `${t.name}.jpg`);
    await page.screenshot({ path: imgPath, type: 'jpeg', quality: 95 });
    console.log(`Saved screenshot: ${imgPath}`);
  }

  await browser.close();
  console.log('All 5 new techy wordmarks successfully rendered into wordmarks/!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
