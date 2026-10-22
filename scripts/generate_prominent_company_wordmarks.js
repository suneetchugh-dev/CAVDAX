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
// Tech 21: The Linear / Vercel Tier - Precision Monoline Apex
// -------------------------------------------------------------
const htmlTech21 = `<!DOCTYPE html>
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
    height: 680px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="card">
    <svg width="1280" height="230" viewBox="0 0 1280 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C (90° shear terminals, circular architectural arc) -->
      <path d="M 180 25 L 80 25 C 45 25 25 45 25 80 L 25 140 C 25 175 45 195 80 195 L 180 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>

      <!-- A (Razor-sharp mitered apex) -->
      <path d="M 240 195 L 315 25 L 390 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>
      <line x1="268" y1="138" x2="362" y2="138" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>

      <!-- V (Inverted delta vertex) -->
      <path d="M 450 25 L 525 195 L 600 25" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- D (Semicircular bowl meeting razor-sharp vertical stem) -->
      <path d="M 660 25 L 740 25 C 800 25 830 55 830 110 C 830 165 800 195 740 195 L 660 195 Z" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- A (Rhythmic echo of first A) -->
      <path d="M 890 195 L 965 25 L 1040 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square" stroke-linejoin="miter"/>
      <line x1="918" y1="138" x2="1012" y2="138" stroke="#FFFFFF" stroke-width="18" stroke-linecap="square"/>

      <!-- X (Surgical crossing with optical balance) -->
      <path d="M 1100 25 L 1240 195 M 1240 25 L 1100 195" stroke="#FFFFFF" stroke-width="22" stroke-linecap="square"/>

      <!-- Linear Surgical Horizon Line -->
      <g transform="translate(0, 222)">
        <line x1="25" y1="0" x2="1240" y2="0" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="25" cy="0" r="5" fill="#FFFFFF"/>
        <circle cx="660" cy="0" r="5" fill="#FFFFFF"/>
        <polygon points="1245,0 1230,-6 1230,6" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 22: The Palantir / Anduril Tier - Monolithic Chiseled Chamfer
// -------------------------------------------------------------
const htmlTech22 = `<!DOCTYPE html>
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
    height: 680px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="card">
    <svg width="1280" height="230" viewBox="0 0 1280 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C (45° internal chamfer facet) -->
      <path d="M 180 25 L 80 25 L 25 80 L 25 140 L 80 195 L 180 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- A (Low-set heavy crossbar, chiseled miter) -->
      <path d="M 235 195 L 310 25 L 385 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <line x1="260" y1="140" x2="360" y2="140" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>

      <!-- V (Synchronized 45° diagonal angle) -->
      <path d="M 440 25 L 515 195 L 590 25" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- D (Chamfered prow geometry) -->
      <path d="M 645 25 L 725 25 L 795 95 L 795 125 L 725 195 L 645 195 Z" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- A -->
      <path d="M 850 195 L 925 25 L 1000 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>
      <line x1="875" y1="140" x2="975" y2="140" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>

      <!-- X (Heavy forward vector) -->
      <path d="M 1055 25 L 1205 195 M 1205 25 L 1055 195" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- Defense Spec Baseline Vector -->
      <g transform="translate(0, 222)">
        <line x1="25" y1="0" x2="1205" y2="0" stroke="#FFFFFF" stroke-width="2.5"/>
        <rect x="21" y="-4" width="8" height="8" fill="#FFFFFF"/>
        <rect x="641" y="-4" width="8" height="8" fill="#FFFFFF"/>
        <polygon points="1212,0 1195,-7 1195,7" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 23: The DeepMind / OpenAI Tier - Extended Horizon Geometry
// -------------------------------------------------------------
const htmlTech23 = `<!DOCTYPE html>
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
    height: 680px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="card">
    <svg width="1340" height="230" viewBox="0 0 1340 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C (Wide horizontal stance, expansive open aperture) -->
      <path d="M 190 35 C 90 35 30 75 30 110 C 30 145 90 185 190 185" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round"/>

      <!-- A (Expansive horizontal triangle) -->
      <path d="M 250 185 L 330 35 L 410 185" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="275" y1="135" x2="385" y2="135" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>

      <!-- V (Wide delta wing) -->
      <path d="M 470 35 L 550 185 L 630 35" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- D (Deep horizontal expansion) -->
      <path d="M 690 35 L 770 35 C 840 35 875 65 875 110 C 875 155 840 185 770 185 L 690 185 Z" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- A -->
      <path d="M 935 185 L 1015 35 L 1095 185" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="960" y1="135" x2="1070" y2="135" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>

      <!-- X (Expansive balanced cross) -->
      <path d="M 1155 35 L 1305 185 M 1305 35 L 1155 185" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Horizon Baseline Wave Vector -->
      <g transform="translate(0, 218)">
        <line x1="30" y1="0" x2="1305" y2="0" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="30" cy="0" r="5" fill="#FFFFFF"/>
        <circle cx="690" cy="0" r="5" fill="#FFFFFF"/>
        <polygon points="1312,0 1295,-6 1295,6" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 24: The NASA Worm / Teenage Engineering Tier - Iconic Continuous Monoline
// -------------------------------------------------------------
const htmlTech24 = `<!DOCTYPE html>
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
    height: 680px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="card">
    <svg width="1280" height="230" viewBox="0 0 1280 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C (Worm tubular arc with perfectly rounded caps) -->
      <path d="M 180 30 L 80 30 C 45 30 25 50 25 85 L 25 135 C 25 170 45 190 80 190 L 180 190" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round"/>

      <!-- A (NASA arch with open baseline loop) -->
      <path d="M 240 190 L 310 30 L 380 190" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="262" y1="135" x2="358" y2="135" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round"/>

      <!-- V (Tubular inverted apex) -->
      <path d="M 440 30 L 510 190 L 580 30" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- D (Semicircular continuous capsule) -->
      <path d="M 640 30 L 710 30 C 770 30 805 55 805 110 C 805 165 770 190 710 190 L 640 190 Z" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- A -->
      <path d="M 865 190 L 935 30 L 1005 190" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="887" y1="135" x2="983" y2="135" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round"/>

      <!-- X (Tubular crossing) -->
      <path d="M 1065 30 L 1205 190 M 1205 30 L 1065 190" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Iconic Minimalist Vector Wire Baseline -->
      <g transform="translate(0, 222)">
        <line x1="25" y1="0" x2="1205" y2="0" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        <circle cx="25" cy="0" r="6" fill="#FFFFFF"/>
        <circle cx="640" cy="0" r="6" fill="#FFFFFF"/>
        <polygon points="1215,0 1198,-8 1198,8" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
</body>
</html>`;

// -------------------------------------------------------------
// Tech 25: The Stripe Press / Supabase Tier - Grounded Chiseled Modernist
// -------------------------------------------------------------
const htmlTech25 = `<!DOCTYPE html>
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
    height: 680px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="card">
    <svg width="1280" height="230" viewBox="0 0 1280 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- C (Open 45° angled terminal cut, architectural presence) -->
      <path d="M 175 40 L 80 40 C 45 40 25 60 25 95 L 25 125 C 25 160 45 180 80 180 L 175 180" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- A (Trapezoidal flat apex top, grounded monumental stance) -->
      <path d="M 235 180 L 295 40 L 325 40 L 385 180" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-linejoin="miter"/>
      <line x1="262" y1="130" x2="358" y2="130" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>

      <!-- V (Flat base vertex) -->
      <path d="M 445 40 L 500 180 L 530 180 L 585 40" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- D (Monumental geometric semicircle) -->
      <path d="M 645 40 L 720 40 C 785 40 815 65 815 110 C 815 155 785 180 720 180 L 645 180 Z" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-linejoin="miter"/>

      <!-- A -->
      <path d="M 875 180 L 935 40 L 965 40 L 1025 180" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square" stroke-linejoin="miter"/>
      <line x1="902" y1="130" x2="998" y2="130" stroke="#FFFFFF" stroke-width="20" stroke-linecap="square"/>

      <!-- X (Symmetrical bold intersection) -->
      <path d="M 1085 40 L 1225 180 M 1225 40 L 1085 180" stroke="#FFFFFF" stroke-width="24" stroke-linecap="square"/>

      <!-- Stripe Press Surgical Directed Vector Baseline -->
      <g transform="translate(0, 215)">
        <line x1="25" y1="0" x2="1225" y2="0" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="25" cy="0" r="5" fill="#FFFFFF"/>
        <circle cx="645" cy="0" r="5" fill="#FFFFFF"/>
        <polygon points="1235,0 1218,-6 1218,6" fill="#FFFFFF"/>
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
    { name: 'wordmark-tech-21-linear-precision-apex', html: htmlTech21 },
    { name: 'wordmark-tech-22-palantir-chiseled-chamfer', html: htmlTech22 },
    { name: 'wordmark-tech-23-deepmind-extended-horizon', html: htmlTech23 },
    { name: 'wordmark-tech-24-nasa-worm-continuous-monoline', html: htmlTech24 },
    { name: 'wordmark-tech-25-stripe-grounded-modernist', html: htmlTech25 },
  ];

  for (const t of targets) {
    await page.setContent(t.html, { waitUntil: 'domcontentloaded' });
    const imgPath = path.join(wordmarksDir, `${t.name}.jpg`);
    await page.screenshot({ path: imgPath, type: 'jpeg', quality: 95 });
    console.log(`Saved screenshot: ${imgPath}`);
  }

  await browser.close();
  console.log('Batch 4 (Prominent Company Tier Tech 21-25) successfully rendered into wordmarks/!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
