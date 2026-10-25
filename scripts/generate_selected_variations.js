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

const semiSelectedDir = path.resolve(__dirname, '../docs/brand_explorations/wordmarks/-Semi-Selected-');
if (!fs.existsSync(semiSelectedDir)) {
  fs.mkdirSync(semiSelectedDir, { recursive: true });
}

// Base template builder matching the exact architectural scale and layout of wordmark-classic-study-architectural-board
function buildHtml({
  lineY = 195,
  lineWidth = 6.0,
  lineX1 = 335,
  lineX2 = 955,
  nodeRadius = 12.0,
  isHollow = false,
  nodeStrokeWidth = 3.5,
  includeXNode = false,
  arrowTipX = 955,
  arrowSize = 22,
}) {
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #FFFFFF;
  }
  .stage {
    position: relative;
    width: 1440px;
    height: 780px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    background: radial-gradient(circle at 50% 48%, #16181d 0%, #0c0d10 85%);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.95), 0 0 1px 1px rgba(255,255,255,0.06);
  }
</style>
</head>
<body>
  <div class="stage">
    <svg viewBox="0 0 1280 260" width="1240" style="overflow: visible;">
      <!-- CAVDAX Core Typographic Monument (Swiss Neo-Grotesk) -->
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

      <!-- Baseline Causal Directed Edge -->
      <g fill="#FFFFFF" stroke="#FFFFFF">
        <!-- Baseline Shaft -->
        <line
          x1="${lineX1}"
          y1="${lineY}"
          x2="${lineX2}"
          y2="${lineY}"
          stroke-width="${lineWidth}"
          stroke-linecap="round"
        />

        <!-- Node 1: under C (Context / Cause) -->
        <circle
          cx="335"
          cy="${lineY}"
          r="${nodeRadius}"
          fill="${isHollow ? '#121318' : '#FFFFFF'}"
          stroke="#FFFFFF"
          stroke-width="${isHollow ? nodeStrokeWidth : 0}"
        />

        <!-- Node 2: under D (Decision Gate) -->
        <circle
          cx="665"
          cy="${lineY}"
          r="${nodeRadius * 0.95}"
          fill="${isHollow ? '#121318' : '#FFFFFF'}"
          stroke="#FFFFFF"
          stroke-width="${isHollow ? nodeStrokeWidth : 0}"
        />

        ${includeXNode ? `
        <!-- Node 3: under X (Execution Terminal) -->
        <circle
          cx="925"
          cy="${lineY}"
          r="${nodeRadius * 0.95}"
          fill="${isHollow ? '#121318' : '#FFFFFF'}"
          stroke="#FFFFFF"
          stroke-width="${isHollow ? nodeStrokeWidth : 0}"
        />
        ` : ''}

        <!-- Sharp Forward Chevron Arrow Tip under X -->
        <path
          d="M ${arrowTipX - arrowSize} ${lineY - arrowSize * 0.82} L ${arrowTipX} ${lineY} L ${arrowTipX - arrowSize} ${lineY + arrowSize * 0.82}"
          fill="none"
          stroke="#FFFFFF"
          stroke-width="${lineWidth * 1.05}"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  </div>
</body>
</html>`;
}

// 1. Variation 05: Micro-Node Precision (~45% smaller dots, calibrated 6px vector)
const html05 = buildHtml({
  lineWidth: 6.0,
  nodeRadius: 11.0,  // Refined micro-node down from 19px
  isHollow: false,
  includeXNode: false,
  arrowTipX: 955,
  arrowSize: 22
});

// 2. Variation 06: Hollow Reticle Aperture (High-assurance verification ring)
const html06 = buildHtml({
  lineWidth: 5.0,
  nodeRadius: 15.0,
  isHollow: true,
  nodeStrokeWidth: 3.8,
  includeXNode: false,
  arrowTipX: 955,
  arrowSize: 22
});

// 3. Variation 07: Minimal Vector Hairline (Fine engineering contrast)
const html07 = buildHtml({
  lineWidth: 3.2,
  nodeRadius: 7.5,
  isHollow: false,
  includeXNode: false,
  arrowTipX: 955,
  arrowSize: 18
});

// 4. Variation 08: Tri-Vertex Causal DAG (C -> D -> X 3-stage proof)
const html08 = buildHtml({
  lineWidth: 5.5,
  nodeRadius: 10.5,
  isHollow: false,
  includeXNode: true,
  arrowTipX: 960,
  arrowSize: 20
});

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

  const variations = [
    { name: 'wordmark-classic-05-micro-node-precision', html: html05 },
    { name: 'wordmark-classic-06-hollow-reticle-aperture', html: html06 },
    { name: 'wordmark-classic-07-minimal-vector-hairline', html: html07 },
    { name: 'wordmark-classic-08-tri-vertex-causal-dag', html: html08 },
  ];

  for (const v of variations) {
    await page.setContent(v.html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 400));
    const imgPath = path.join(semiSelectedDir, `${v.name}.jpg`);
    await page.screenshot({ path: imgPath, type: 'jpeg', quality: 95 });
    console.log(`Saved screenshot: ${imgPath}`);
  }

  await browser.close();
  console.log('Successfully rendered refined aesthetic variations into -Semi-Selected-!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
