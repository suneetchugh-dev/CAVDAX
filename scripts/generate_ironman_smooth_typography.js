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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #FFFFFF;
  }
</style>
`;

// Mathematical Smooth Glyph Geometry:
// C: 100% smooth continuous elliptical curve (zero faceted ridges)
// A: Smooth straight diagonal chevron Λ (zero crossbar)
// V: Smooth straight inverted diagonal chevron
// D: 100% smooth continuous curved right bowl (zero faceted ridges)
// X: Smooth mitered diagonal crossed blades
function getSmoothCavdaxPaths(fillId, strokeColor = 'none', strokeWidth = 0) {
  return `
    <g id="smoothCavdaxGroup">
      <!-- C (Smooth continuous outer and inner arcs, zero ridges) -->
      <path
        d="M 290,60 L 225,60 A 85 85 0 0 0 140,145 A 85 85 0 0 0 225,230 L 290,230 L 290,192 L 225,192 A 47 47 0 0 1 178,145 A 47 47 0 0 1 225,98 L 290,98 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- A (1st) - Smooth Crossbar-Less Upward Chevron Λ -->
      <path
        d="M 400,60 L 475,230 L 435,230 L 400,132 L 365,230 L 325,230 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- V - Smooth Inverted Chevron -->
      <path
        d="M 510,60 L 550,60 L 585,158 L 620,60 L 660,60 L 585,230 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- D (Smooth continuous right bowl, zero ridges) -->
      <path
        d="M 695,60 L 760,60 A 85 85 0 0 1 845,145 A 85 85 0 0 1 760,230 L 695,230 Z M 733,98 L 733,192 L 760,192 A 47 47 0 0 0 807,145 A 47 47 0 0 0 760,98 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- A (2nd) - Smooth Crossbar-Less Upward Chevron Λ -->
      <path
        d="M 955,60 L 1030,230 L 990,230 L 955,132 L 920,230 L 880,230 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- X - Smooth Crossed Blades -->
      <path
        d="M 1065,60 L 1108,60 L 1140,120 L 1172,60 L 1215,60 L 1162,145 L 1215,230 L 1172,230 L 1140,170 L 1108,230 L 1065,230 L 1118,145 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />
    </g>
  `;
}

// 1. Smooth C & D Pure Gold & Crimson
function htmlSmoothGoldCrimson() {
  return `<!DOCTYPE html>
<html>
<head>
${baseHead}
<style>
  .stage {
    position: relative;
    width: 1540px;
    height: 720px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24px;
    background: radial-gradient(circle at 50% 50%, #150305 0%, #0a0102 60%, #030001 100%);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), inset 0 0 100px rgba(0,0,0,0.85);
  }
</style>
</head>
<body>
  <div class="stage">
    <svg viewBox="0 0 1360 290" width="1280" style="overflow: visible;">
      <defs>
        <linearGradient id="smoothGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFF9D2" />
          <stop offset="25%" stop-color="#F2CB64" />
          <stop offset="55%" stop-color="#C69324" />
          <stop offset="85%" stop-color="#8F5F10" />
          <stop offset="100%" stop-color="#543404" />
        </linearGradient>

        <linearGradient id="smoothCrimsonExtrude" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FF2E3B" />
          <stop offset="40%" stop-color="#A50E17" />
          <stop offset="80%" stop-color="#540408" />
          <stop offset="100%" stop-color="#1E0002" />
        </linearGradient>

        <filter id="smoothExtrusion" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="0" flood-color="#4A0206" flood-opacity="1" />
          <feDropShadow dx="0" dy="16" stdDeviation="6" flood-color="#000000" flood-opacity="0.95" />
        </filter>
      </defs>

      <g filter="url(#smoothExtrusion)">
        ${getSmoothCavdaxPaths('url(#smoothGoldGrad)', 'url(#smoothCrimsonExtrude)', 6)}
      </g>
    </svg>
  </div>
</body>
</html>`;
}

// 2. Smooth C & D Pure Stark White
function htmlSmoothStarkWhite() {
  return `<!DOCTYPE html>
<html>
<head>
${baseHead}
<style>
  .stage {
    position: relative;
    width: 1540px;
    height: 720px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24px;
    background: radial-gradient(circle at 50% 50%, #0e1117 0%, #080a0e 65%, #030406 100%);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), inset 0 0 100px rgba(0,0,0,0.9);
  }
</style>
</head>
<body>
  <div class="stage">
    <svg viewBox="0 0 1360 290" width="1280" style="overflow: visible;">
      <defs>
        <linearGradient id="smoothWhiteSilver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="60%" stop-color="#F1F5F9" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>

        <filter id="crispShadowSmooth" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.9" />
        </filter>
      </defs>

      <g filter="url(#crispShadowSmooth)">
        ${getSmoothCavdaxPaths('url(#smoothWhiteSilver)', 'none', 0)}
      </g>
    </svg>
  </div>
</body>
</html>`;
}

// 3. Smooth C & D Brushed Titanium
function htmlSmoothTitanium() {
  return `<!DOCTYPE html>
<html>
<head>
${baseHead}
<style>
  .stage {
    position: relative;
    width: 1540px;
    height: 720px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24px;
    background: radial-gradient(circle at 50% 50%, #11141c 0%, #090b10 60%, #030406 100%);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98), inset 0 0 100px rgba(0,0,0,0.9);
  }
</style>
</head>
<body>
  <div class="stage">
    <svg viewBox="0 0 1360 290" width="1280" style="overflow: visible;">
      <defs>
        <linearGradient id="smoothTiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="25%" stop-color="#E2E8F0" />
          <stop offset="50%" stop-color="#94A3B8" />
          <stop offset="80%" stop-color="#475569" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>

        <filter id="smoothTiExtrusion" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="0" flood-color="#0F172A" flood-opacity="1" />
          <feDropShadow dx="0" dy="14" stdDeviation="8" flood-color="#000000" flood-opacity="0.9" />
        </filter>
      </defs>

      <g filter="url(#smoothTiExtrusion)">
        ${getSmoothCavdaxPaths('url(#smoothTiGrad)', '#0F172A', 4)}
      </g>
    </svg>
  </div>
</body>
</html>`;
}

// 4. Smooth Master Presentation Board
function htmlSmoothPresentationBoard() {
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
    padding: 50px 70px;
    border-radius: 28px;
    background: #07080B;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.98);
  }

  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 16px;
  }
  .header-title {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: #F8FAFC;
    text-transform: uppercase;
  }

  .content-stack {
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin: auto 0;
  }

  .variant-card {
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 24px 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .variant-meta {
    width: 340px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .variant-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: #F1F5F9;
    text-transform: uppercase;
  }
  .variant-desc {
    font-size: 12px;
    color: #64748B;
    line-height: 1.4;
  }

  .variant-svg-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 16px;
    font-size: 12px;
    letter-spacing: 0.18em;
    color: #64748B;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="header">
      <div class="header-title">CAVDAX • SMOOTH IRON MAN TYPOGRAPHY STUDY</div>
      <div style="font-size: 13px; color: #94A3B8; letter-spacing: 0.18em;">SMOOTH C &amp; D CURVES • ZERO RIDGES • CROSSBAR-LESS Λ</div>
    </div>

    <div class="content-stack">
      <!-- 1. Gold & Crimson -->
      <div class="variant-card">
        <div class="variant-meta">
          <div class="variant-title" style="color: #F2CB64;">01. Smooth Mark VII Armor</div>
          <div class="variant-desc">Fluid continuous C &amp; D curvature. Gold titanium face with Stark crimson extrusion shadow.</div>
        </div>
        <div class="variant-svg-wrap">
          <svg viewBox="0 0 1360 290" width="760">
            <defs>
              <linearGradient id="bSmoothGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFF9D2" />
                <stop offset="50%" stop-color="#C69324" />
                <stop offset="100%" stop-color="#543404" />
              </linearGradient>
            </defs>
            <g>${getSmoothCavdaxPaths('url(#bSmoothGold)', '#78080E', 5)}</g>
          </svg>
        </div>
      </div>

      <!-- 2. Pure White Silver -->
      <div class="variant-card">
        <div class="variant-meta">
          <div class="variant-title">02. Smooth Stark White</div>
          <div class="variant-desc">Pristine ridge-free silhouette. Monolithic white on deep obsidian with zero decoration.</div>
        </div>
        <div class="variant-svg-wrap">
          <svg viewBox="0 0 1360 290" width="760">
            <g>${getSmoothCavdaxPaths('#FFFFFF', 'none', 0)}</g>
          </svg>
        </div>
      </div>

      <!-- 3. Brushed Titanium -->
      <div class="variant-card">
        <div class="variant-meta">
          <div class="variant-title" style="color: #CBD5E1;">03. Smooth Brushed Titanium</div>
          <div class="variant-desc">Milled aerospace titanium gradient with continuous fluid curves and chiseled edges.</div>
        </div>
        <div class="variant-svg-wrap">
          <svg viewBox="0 0 1360 290" width="760">
            <defs>
              <linearGradient id="bSmoothTi" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="50%" stop-color="#94A3B8" />
                <stop offset="100%" stop-color="#1E293B" />
              </linearGradient>
            </defs>
            <g>${getSmoothCavdaxPaths('url(#bSmoothTi)', '#0F172A', 4)}</g>
          </svg>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>CONTINUOUS ELLIPTICAL ARCS (C &amp; D) | OPEN CHEVRON APERTURES (A)</div>
      <div>STARK AEROSPACE PROVING SPECIFICATION • ZERO RIDGES</div>
      <div>HIGH-VELOCITY CAUSAL ARCHITECTURE</div>
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

  console.log('Launching browser for smooth typography generation...');
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const tasks = [
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-12-smooth-pure-gold-crimson.jpg'),
      html: htmlSmoothGoldCrimson(),
      label: 'Smooth C & D Pure Gold & Crimson Typography',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-13-smooth-pure-monochrome-stark.jpg'),
      html: htmlSmoothStarkWhite(),
      label: 'Smooth C & D Pure Stark White Typography',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-14-smooth-pure-brushed-titanium.jpg'),
      html: htmlSmoothTitanium(),
      label: 'Smooth C & D Pure Brushed Titanium Typography',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-15-smooth-pure-presentation-board.jpg'),
      html: htmlSmoothPresentationBoard(),
      label: 'Smooth Typography Comparative Master Board',
    },
  ];

  for (const task of tasks) {
    console.log(`Rendering ${task.label}...`);
    await page.setContent(task.html, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: task.file, type: 'jpeg', quality: 95 });
    console.log(`Saved: ${task.file}`);
  }

  await browser.close();
  console.log('Smooth Iron Man Typography Suite completed successfully.');
}

render().catch((err) => {
  console.error('Rendering error:', err);
  process.exit(1);
});
