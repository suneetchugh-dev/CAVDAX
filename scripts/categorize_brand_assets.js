import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.resolve(__dirname, '../docs/brand_explorations');
const wordmarksDir = path.join(baseDir, 'wordmarks');
const logosDir = path.join(baseDir, 'logos');

// 1. Define target folders
const wmIronManDir = path.join(wordmarksDir, 'iron-man');
const wmTechDir = path.join(wordmarksDir, 'tech-developer');
const wmClassicDir = path.join(wordmarksDir, 'classic-modernist');

const lgMonogramsDir = path.join(logosDir, 'monograms');
const lgGatesDir = path.join(logosDir, 'execution-gates');
const lgIronManDir = path.join(logosDir, 'iron-man');

[wmIronManDir, wmTechDir, wmClassicDir, lgMonogramsDir, lgGatesDir, lgIronManDir].forEach((d) => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
    console.log(`Created: ${d}`);
  }
});

// 2. Move wordmark files
const wmFiles = fs.readdirSync(wordmarksDir);
let movedWmCount = 0;

for (const file of wmFiles) {
  const fullPath = path.join(wordmarksDir, file);
  if (fs.statSync(fullPath).isDirectory()) continue;
  if (file === 'TYPOGRAPHY_SPECIFICATION.md') continue;

  let destDir = null;
  if (file.startsWith('wordmark-ironman-')) {
    destDir = wmIronManDir;
  } else if (file.startsWith('wordmark-tech-')) {
    destDir = wmTechDir;
  } else if (file.startsWith('wordmark-classic-') || file.startsWith('wordmark-study-')) {
    destDir = wmClassicDir;
  }

  if (destDir) {
    fs.renameSync(fullPath, path.join(destDir, file));
    movedWmCount++;
  }
}
console.log(`Moved ${movedWmCount} wordmarks into categorized folders.`);

// 3. Move logo files
const lgFiles = fs.readdirSync(logosDir);
let movedLgCount = 0;

for (const file of lgFiles) {
  const fullPath = path.join(logosDir, file);
  if (fs.statSync(fullPath).isDirectory()) continue;
  if (file === 'README.md') continue;

  let destDir = null;
  if (file.startsWith('logo-monogram-cv-')) {
    destDir = lgMonogramsDir;
  } else if (file.startsWith('logo-cx-') || file.startsWith('logo-dag-shield-') || file.startsWith('logo-presentation-')) {
    destDir = lgGatesDir;
  } else if (file.startsWith('logo-ironman-')) {
    destDir = lgIronManDir;
  }

  if (destDir) {
    fs.renameSync(fullPath, path.join(destDir, file));
    movedLgCount++;
  }
}
console.log(`Moved ${movedLgCount} logos into categorized folders.`);
