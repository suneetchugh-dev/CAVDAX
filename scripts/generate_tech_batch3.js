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
// Tech 16: RISC-V Silicon Micro-Op Architecture
// -------------------------------------------------------------
const htmlTech16 = `<!DOCTYPE html>
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
    border: 1px solid rgba(255,255,255,0.12);
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
    <div class="tag">// ARCHETYPE: 16 // RISC-V_MICRO_OP // OUT_OF_ORDER_EXECUTION</div>
    <div class="spec">RV64GC_PIPELINE // 8-WIDE ISSUE // CACHE_L1: VERIFIED</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C with segmented micro-op execution blocks -->
      <path d="M 170 30 L 70 30 L 30 70 L 30 150 L 70 190 L 170 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-dasharray="38 6"/>

      <!-- A segmented -->
      <path d="M 230 190 L 300 30 L 370 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-dasharray="45 6"/>
      <line x1="255" y1="135" x2="345" y2="135" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>

      <!-- V segmented -->
      <path d="M 430 30 L 500 190 L 570 30" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-dasharray="45 6"/>

      <!-- D segmented -->
      <path d="M 630 30 L 710 30 L 770 90 L 770 130 L 710 190 L 630 190 Z" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-dasharray="40 6"/>

      <!-- A segmented -->
      <path d="M 830 190 L 900 30 L 970 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-dasharray="45 6"/>
      <line x1="855" y1="135" x2="945" y2="135" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>

      <!-- X segmented -->
      <path d="M 1030 30 L 1170 190 M 1170 30 L 1030 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-dasharray="40 6"/>

      <!-- CPU Pipeline Register Latch Baseline -->
      <g transform="translate(0, 235)">
        <line x1="30" y1="0" x2="1170" y2="0" stroke="#FFFFFF" stroke-width="2"/>
        
        <!-- Pipeline Latches [IF] [ID] [EX] [WB] -->
        <rect x="25" y="-10" width="20" height="20" stroke="#FFFFFF" stroke-width="2" fill="#000000"/>
        <text x="35" y="4" font-family="'SF Mono', Consolas, monospace" font-size="9" fill="#FFFFFF" text-anchor="middle">IF</text>

        <rect x="625" y="-10" width="20" height="20" stroke="#FFFFFF" stroke-width="2" fill="#000000"/>
        <text x="635" y="4" font-family="'SF Mono', Consolas, monospace" font-size="9" fill="#FFFFFF" text-anchor="middle">EX</text>

        <polygon points="1175,0 1155,-8 1155,8" fill="#FFFFFF"/>
        <text x="1145" y="4" font-family="'SF Mono', Consolas, monospace" font-size="9" fill="#FFFFFF" text-anchor="end">WB</text>

        <text x="60" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">INSTRUCTION_FETCH: CONTEXT</text>
        <text x="660" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.2em">EXECUTE: VERIFIED_DAG</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 17: Fiber-Optic Waveguide & Silicon Photonics
// -------------------------------------------------------------
const htmlTech17 = `<!DOCTYPE html>
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
  <div class="frame">
    <div class="tag">// ARCHETYPE: 17 // SILICON_PHOTONICS // MACH-ZEHNDER_OPTICAL_BUS</div>
    <div class="spec">λ=1550nm DFB // 800Gbps PAM4 // LOSS: 0.05dB/cm</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C Euler spiral continuous curve -->
      <path d="M 180 30 C 80 30 30 70 30 110 C 30 150 80 190 180 190" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round"/>
      <circle cx="180" cy="30" r="5" fill="#FFFFFF"/>
      <circle cx="180" cy="190" r="5" fill="#FFFFFF"/>

      <!-- A Waveguide -->
      <path d="M 240 190 L 310 30 L 380 190 M 265 140 L 355 140" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- V Waveguide -->
      <path d="M 440 30 L 510 190 L 580 30" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- D Waveguide -->
      <path d="M 640 30 L 710 30 C 780 30 810 65 810 110 C 810 155 780 190 710 190 L 640 190 Z" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- A Waveguide -->
      <path d="M 870 190 L 940 30 L 1010 190 M 895 140 L 985 140" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- X Waveguide -->
      <path d="M 1070 30 L 1210 190 M 1210 30 L 1070 190" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Photonic Waveguide Interconnect Pipeline -->
      <g transform="translate(0, 235)">
        <path d="M 30 0 L 250 0 C 270 0 280 -14 300 -14 L 600 -14 C 620 -14 630 0 650 0 L 1180 0" stroke="#FFFFFF" stroke-width="2" fill="none"/>
        <path d="M 30 0 L 250 0 C 270 0 280 14 300 14 L 600 14 C 620 14 630 0 650 0 L 1180 0" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.6"/>

        <circle cx="30" cy="0" r="6" fill="#FFFFFF"/>
        <circle cx="650" cy="0" r="6" fill="#FFFFFF"/>
        <polygon points="1210,0 1190,-7 1190,7" fill="#FFFFFF"/>

        <text x="45" y="-5" font-family="'SF Mono', Consolas, monospace" font-size="10" fill="#FFFFFF" opacity="0.8">LASER_EMITTER (CTX)</text>
        <text x="665" y="-5" font-family="'SF Mono', Consolas, monospace" font-size="10" fill="#FFFFFF" opacity="0.8">PHASE_MODULATOR (DEC)</text>
        <text x="1175" y="-5" font-family="'SF Mono', Consolas, monospace" font-size="10" fill="#FFFFFF" opacity="0.8" text-anchor="end">PHOTODETECTOR (EXEC)</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 18: Spacecraft Reaction Control & Inertial Gyroscope
// -------------------------------------------------------------
const htmlTech18 = `<!DOCTYPE html>
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
    border: 1px solid rgba(255,255,255,0.08);
  }
  .attitude-box {
    position: absolute;
    top: 24px;
    left: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.7;
    display: flex;
    gap: 30px;
  }
  .gyro-spec {
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
  <div class="frame">
    <div class="attitude-box">
      <span>// ARCHETYPE: 18 // DEEP_SPACE_INERTIAL_TELEMETRY</span>
      <span>YAW: +00.00° // PITCH: +00.00° // ROLL: +00.00°</span>
    </div>
    <div class="gyro-spec">ATTITUDE_CONTROL: 3-AXIS GYRO // AUTONOMY_LVL: 5</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C with attitude nozzle ticks -->
      <path d="M 180 30 L 80 30 C 50 30 30 50 30 80 L 30 140 C 30 170 50 190 80 190 L 180 190" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <circle cx="180" cy="30" r="4" fill="#FFFFFF"/>
      <circle cx="180" cy="190" r="4" fill="#FFFFFF"/>

      <!-- A with Lunar Truss Apex -->
      <path d="M 240 190 L 310 30 L 380 190" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <line x1="265" y1="135" x2="355" y2="135" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>
      <line x1="310" y1="30" x2="310" y2="135" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4 4" opacity="0.6"/>

      <!-- V Vector Thruster Nozzle -->
      <path d="M 440 30 L 510 190 L 580 30" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>

      <!-- D Orbital Shield -->
      <path d="M 640 30 L 720 30 C 775 30 805 55 805 110 C 805 165 775 190 720 190 L 640 190 Z" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>

      <!-- A Truss -->
      <path d="M 860 190 L 930 30 L 1000 190" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <line x1="885" y1="135" x2="975" y2="135" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>

      <!-- X Gimbal Crosshair -->
      <path d="M 1060 30 L 1200 190 M 1200 30 L 1060 190" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>
      <circle cx="1130" cy="110" r="16" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.6"/>

      <!-- Trajectory Delta-V Burn Baseline -->
      <g transform="translate(0, 235)">
        <line x1="30" y1="0" x2="1190" y2="0" stroke="#FFFFFF" stroke-width="2"/>
        <line x1="30" y1="-5" x2="30" y2="5" stroke="#FFFFFF" stroke-width="2"/>
        <line x1="640" y1="-5" x2="640" y2="5" stroke="#FFFFFF" stroke-width="2"/>
        <polygon points="1205,0 1185,-8 1185,8" fill="#FFFFFF"/>

        <circle cx="30" cy="0" r="5" fill="#FFFFFF"/>
        <circle cx="640" cy="0" r="5" fill="#FFFFFF"/>

        <text x="45" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.15em">T-00:00:00 [TRAJECTORY_ACQUIRED]</text>
        <text x="655" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.15em">T+00:02:15 [DECISION_BURN_LOCKED]</text>
        <text x="1170" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.15em" text-anchor="end">ORBITAL_INSERTION</text>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 19: Cryptographic Merkle-DAG Block Matrix
// -------------------------------------------------------------
const htmlTech19 = `<!DOCTYPE html>
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
  .merkle-header {
    font-size: 13px;
    letter-spacing: 0.4em;
    margin-bottom: 40px;
    opacity: 0.6;
  }
  .ledger-bar {
    font-size: 12px;
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
    <div class="merkle-header">MERKLE_ROOT: 0x7F9A_FALKOR_DAG // PROOF: BLAKE3_256 // IMMUTABLE</div>

    <svg width="1300" height="250" viewBox="0 0 1300 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C Block -->
      <path d="M 180 20 L 70 20 L 25 65 L 25 145 L 70 190 L 180 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <rect x="15" y="10" width="10" height="10" fill="#FFFFFF"/>

      <!-- A Block -->
      <path d="M 240 190 L 310 20 L 380 190 M 265 135 L 355 135" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <rect x="305" y="10" width="10" height="10" fill="#FFFFFF"/>

      <!-- V Block -->
      <path d="M 440 20 L 510 190 L 580 20" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- D Block -->
      <path d="M 640 20 L 720 20 L 785 85 L 785 125 L 720 190 L 640 190 Z" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <rect x="780" y="100" width="10" height="10" fill="#FFFFFF"/>

      <!-- A Block -->
      <path d="M 850 190 L 920 20 L 990 190 M 875 135 L 965 135" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- X Block -->
      <path d="M 1050 20 L 1190 190 M 1190 20 L 1050 190" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <rect x="1115" y="100" width="10" height="10" fill="#FFFFFF"/>

      <!-- Merkle Verification Tree Trace Baseline -->
      <g transform="translate(0, 230)">
        <line x1="25" y1="0" x2="1190" y2="0" stroke="#FFFFFF" stroke-width="2"/>
        
        <!-- Hex Block Nodes -->
        <polygon points="25,-9 34,-4 34,4 25,9 16,4 16,-4" fill="#FFFFFF"/>
        <polygon points="640,-9 649,-4 649,4 640,9 631,4 631,-4" fill="#FFFFFF"/>
        <polygon points="1200,0 1180,-9 1180,9" fill="#FFFFFF"/>

        <text x="45" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.15em">BLOCK_0: CAUSE_ORIGIN</text>
        <text x="660" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.15em">BLOCK_1: DECISION_PROOF</text>
        <text x="1170" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.15em" text-anchor="end">BLOCK_2: CONSENSUS_EXEC</text>
      </g>
    </svg>

    <div class="ledger-bar">
      <span>CHAIN: FALKOR_PROVENANCE</span>
      <span>━━━[ZERO_LEAK_GUARD]━━━</span>
      <span>RULE_13: PASSED</span>
      <span>━━━&gt;</span>
      <span>STATE: COMMITTED</span>
    </div>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 20: Bio-Cybernetic Neuromorphic Spiking Mesh
// -------------------------------------------------------------
const htmlTech20 = `<!DOCTYPE html>
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
    left: 40px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.35em;
    opacity: 0.7;
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
  <div class="frame">
    <div class="tag">// ARCHETYPE: 20 // NEUROMORPHIC_SPIKING_MESH // LOIHI_SNN_CORE</div>
    <div class="spec">1M_NEURONS // SPIKE_RATE: 10kHz // SYNAPSE_PLASTICITY: STDP</div>

    <svg width="1300" height="260" viewBox="0 0 1300 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C with Synaptic Terminals -->
      <path d="M 180 30 L 80 30 C 50 30 30 50 30 80 L 30 140 C 30 170 50 190 80 190 L 180 190" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round"/>
      <circle cx="180" cy="30" r="10" fill="#FFFFFF"/>
      <circle cx="180" cy="190" r="10" fill="#FFFFFF"/>
      <circle cx="30" cy="110" r="8" fill="#FFFFFF"/>

      <!-- A with Synaptic Apex -->
      <path d="M 240 190 L 310 30 L 380 190 M 265 140 L 355 140" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="310" cy="30" r="10" fill="#FFFFFF"/>

      <!-- V with Terminal Node -->
      <path d="M 440 30 L 510 190 L 580 30" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="510" cy="190" r="10" fill="#FFFFFF"/>

      <!-- D with Synaptic Outer Node -->
      <path d="M 640 30 L 720 30 C 780 30 810 65 810 110 C 810 155 780 190 720 190 L 640 190 Z" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="810" cy="110" r="10" fill="#FFFFFF"/>

      <!-- A -->
      <path d="M 870 190 L 940 30 L 1010 190 M 895 140 L 985 140" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="940" cy="30" r="10" fill="#FFFFFF"/>

      <!-- X with Interlocking Central Synapse -->
      <path d="M 1070 30 L 1210 190 M 1210 30 L 1070 190" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="1140" cy="110" r="12" fill="#FFFFFF"/>

      <!-- Action Potential Spike Train Baseline -->
      <g transform="translate(0, 235)">
        <path d="M 30 0 L 220 0 L 230 -14 L 240 14 L 250 -8 L 260 0 L 630 0 L 640 -14 L 650 14 L 660 -8 L 670 0 L 1180 0" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
        <circle cx="30" cy="0" r="7" fill="#FFFFFF"/>
        <circle cx="670" cy="0" r="7" fill="#FFFFFF"/>
        <polygon points="1210,0 1190,-8 1190,8" fill="#FFFFFF"/>

        <text x="45" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.15em">V_MEM: INTEGRATE (CAUSE)</text>
        <text x="690" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.15em">THRESHOLD: FIRE (DECISION)</text>
        <text x="1175" y="4" font-family="'SF Mono', Consolas, monospace" font-size="11" fill="#FFFFFF" opacity="0.8" letter-spacing="0.15em" text-anchor="end">ACTION_POTENTIAL: EXEC</text>
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
    { name: 'wordmark-tech-16-riscv-micro-op', html: htmlTech16 },
    { name: 'wordmark-tech-17-photonics-waveguide', html: htmlTech17 },
    { name: 'wordmark-tech-18-spacecraft-inertial-gyro', html: htmlTech18 },
    { name: 'wordmark-tech-19-merkle-dag-matrix', html: htmlTech19 },
    { name: 'wordmark-tech-20-neuromorphic-spiking-mesh', html: htmlTech20 },
  ];

  for (const t of targets) {
    await page.setContent(t.html, { waitUntil: 'domcontentloaded' });
    const imgPath = path.join(wordmarksDir, `${t.name}.jpg`);
    await page.screenshot({ path: imgPath, type: 'jpeg', quality: 95 });
    console.log(`Saved screenshot: ${imgPath}`);
  }

  await browser.close();
  console.log('Batch 3 (Tech 16-20) rendered successfully into wordmarks/!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
