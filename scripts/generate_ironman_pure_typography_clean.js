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

// Common CSS
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

// Helper for the pure Iron Man typography paths
// Letters: C, A (crossbar-less), V, D, A (crossbar-less), X
function getPureCavdaxPaths(fillId, strokeColor = 'none', strokeWidth = 0) {
  return `
    <g id="pureLetterforms">
      <!-- C (x: 140 to 290) -->
      <path
        d="M 290,95 L 290,60 L 195,60 L 140,115 L 140,175 L 195,230 L 290,230 L 290,195 L 205,195 L 180,170 L 180,120 L 205,95 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- A (1st) - Pure Crossbar-Less Chevron (x: 325 to 475, center 400) -->
      <path
        d="M 400,60 L 475,230 L 435,230 L 400,132 L 365,230 L 325,230 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- V (x: 510 to 660, center 585) -->
      <path
        d="M 510,60 L 550,60 L 585,158 L 620,60 L 660,60 L 585,230 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- D (x: 695 to 845) -->
      <path
        d="M 695,60 L 795,60 L 845,110 L 845,180 L 795,230 L 695,230 Z M 740,100 L 740,190 L 780,190 L 805,165 L 805,125 L 780,100 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- A (2nd) - Pure Crossbar-Less Chevron (x: 880 to 1030, center 955) -->
      <path
        d="M 955,60 L 1030,230 L 990,230 L 955,132 L 920,230 L 880,230 Z"
        fill="${fillId}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="miter"
      />

      <!-- X (x: 1065 to 1215, center 1140) -->
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

// 1. Pure Gold & Crimson Iron Man Title Typography (No symbols, no arc reactor, no lines)
function htmlPureGoldCrimson() {
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
        <!-- Stark Burnished Gold Face Gradient -->
        <linearGradient id="pureGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFF9D2" />
          <stop offset="25%" stop-color="#F2CB64" />
          <stop offset="55%" stop-color="#C69324" />
          <stop offset="85%" stop-color="#8F5F10" />
          <stop offset="100%" stop-color="#543404" />
        </linearGradient>

        <!-- Stark Hot-Rod Crimson Deep Bevel Extrusion -->
        <linearGradient id="pureCrimsonExtrude" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FF2E3B" />
          <stop offset="40%" stop-color="#A50E17" />
          <stop offset="80%" stop-color="#540408" />
          <stop offset="100%" stop-color="#1E0002" />
        </linearGradient>

        <filter id="heavyExtrusion" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="0" flood-color="#4A0206" flood-opacity="1" />
          <feDropShadow dx="0" dy="16" stdDeviation="6" flood-color="#000000" flood-opacity="0.95" />
        </filter>
      </defs>

      <!-- Pure Typography in Center -->
      <g filter="url(#heavyExtrusion)">
        ${getPureCavdaxPaths('url(#pureGoldGrad)', 'url(#pureCrimsonExtrude)', 6)}
      </g>
    </svg>
  </div>
</body>
</html>`;
}

// 2. Pure Stark White / Silver Monolith (Minimalist, completely clean)
function htmlPureStarkWhite() {
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
        <linearGradient id="pureWhiteSilver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="60%" stop-color="#F1F5F9" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>

        <filter id="crispShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.9" />
        </filter>
      </defs>

      <g filter="url(#crispShadow)">
        ${getPureCavdaxPaths('url(#pureWhiteSilver)', 'none', 0)}
      </g>
    </svg>
  </div>
</body>
</html>`;
}

// 3. Pure Brushed Titanium Metallic (Clean chiseled titanium finish)
function htmlPureTitanium() {
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
        <!-- Multi-stop Brushed Titanium Linear Gradient -->
        <linearGradient id="brushedTi" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="25%" stop-color="#E2E8F0" />
          <stop offset="50%" stop-color="#94A3B8" />
          <stop offset="80%" stop-color="#475569" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>

        <filter id="tiExtrusion" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="0" flood-color="#0F172A" flood-opacity="1" />
          <feDropShadow dx="0" dy="14" stdDeviation="8" flood-color="#000000" flood-opacity="0.9" />
        </filter>
      </defs>

      <g filter="url(#tiExtrusion)">
        ${getPureCavdaxPaths('url(#brushedTi)', '#0F172A', 4)}
      </g>
    </svg>
  </div>
</body>
</html>`;
}

// 4. Pure Typography Master Presentation Board (Comparing the 3 pure typography finishes)
function htmlPureTypographyBoard() {
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
    width: 320px;
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
      <div class="header-title">CAVDAX • PURE IRON MAN TYPOGRAPHY STUDY</div>
      <div style="font-size: 13px; color: #94A3B8; letter-spacing: 0.18em;">ZERO SYMBOLS • ZERO ICONS • PURE LETTERFORM GEOMETRY</div>
    </div>

    <div class="content-stack">
      <!-- 1. Gold & Crimson -->
      <div class="variant-card">
        <div class="variant-meta">
          <div class="variant-title" style="color: #F2CB64;">01. Mark VII Armor Finish</div>
          <div class="variant-desc">Specular burnished gold titanium face with deep Stark hot-rod crimson extrusion shadow bevel.</div>
        </div>
        <div class="variant-svg-wrap">
          <svg viewBox="0 0 1360 290" width="760">
            <defs>
              <linearGradient id="bPureGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFF9D2" />
                <stop offset="50%" stop-color="#C69324" />
                <stop offset="100%" stop-color="#543404" />
              </linearGradient>
            </defs>
            <g>${getPureCavdaxPaths('url(#bPureGold)', '#78080E', 5)}</g>
          </svg>
        </div>
      </div>

      <!-- 2. Pure White Silver -->
      <div class="variant-card">
        <div class="variant-meta">
          <div class="variant-title">02. Pure Stark White</div>
          <div class="variant-desc">Surgical minimalist white on deep obsidian. Zero embellishments, pristine architectural silhouette.</div>
        </div>
        <div class="variant-svg-wrap">
          <svg viewBox="0 0 1360 290" width="760">
            <g>${getPureCavdaxPaths('#FFFFFF', 'none', 0)}</g>
          </svg>
        </div>
      </div>

      <!-- 3. Brushed Titanium -->
      <div class="variant-card">
        <div class="variant-meta">
          <div class="variant-title" style="color: #CBD5E1;">03. Brushed Titanium</div>
          <div class="variant-desc">Aerospace titanium multi-tone gradient with chiseled tungsten edge contrast.</div>
        </div>
        <div class="variant-svg-wrap">
          <svg viewBox="0 0 1360 290" width="760">
            <defs>
              <linearGradient id="bTi" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="50%" stop-color="#94A3B8" />
                <stop offset="100%" stop-color="#1E293B" />
              </linearGradient>
            </defs>
            <g>${getPureCavdaxPaths('url(#bTi)', '#0F172A', 4)}</g>
          </svg>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>CHEVRON APERTURE GEOMETRY (CROSSBAR ELIMINATED)</div>
      <div>PURE CHISELED 45° APEXES | MATHEMATICAL SYMMETRY</div>
      <div>STARK AEROSPACE PROVING SPECIFICATION</div>
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

  console.log('Launching browser for pure clean typography generation...');
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const tasks = [
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-08-pure-typography-gold-crimson.jpg'),
      html: htmlPureGoldCrimson(),
      label: 'Pure Iron Man Typography (Gold & Crimson Finish)',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-09-pure-typography-monochrome-stark.jpg'),
      html: htmlPureStarkWhite(),
      label: 'Pure Stark White Typography (Minimalist Architecture)',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-10-pure-typography-brushed-titanium.jpg'),
      html: htmlPureTitanium(),
      label: 'Pure Brushed Titanium Typography (Aerospace Finish)',
    },
    {
      file: path.join(wordmarksDir, 'wordmark-ironman-11-pure-typography-presentation-board.jpg'),
      html: htmlPureTypographyBoard(),
      label: 'Pure Typography Comparative Master Board',
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
  console.log('Pure Clean Iron Man Typography Suite completed successfully.');
}

render().catch((err) => {
  console.error('Rendering error:', err);
  process.exit(1);
});
