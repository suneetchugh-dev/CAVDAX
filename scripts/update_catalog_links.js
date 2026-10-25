import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.resolve(__dirname, '../docs/brand_explorations');
const specPath = path.join(baseDir, 'wordmarks/TYPOGRAPHY_SPECIFICATION.md');
const readmePath = path.join(baseDir, 'README.md');

// 1. Update TYPOGRAPHY_SPECIFICATION.md
let specContent = fs.readFileSync(specPath, 'utf8');

// Replace relative paths for wordmark-tech (excluding any already in subfolders)
specContent = specContent.replace(/\(\.\/wordmark-tech-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./tech-developer/wordmark-tech-$1)');

// Replace relative paths for wordmark-classic-01 through 04 (leave -Semi-Selected- intact)
specContent = specContent.replace(/\(\.\/wordmark-classic-(0[1-4]-[a-zA-Z0-9_-]+\.jpg)\)/g, '(./classic-modernist/wordmark-classic-$1)');

// Replace relative paths for wordmark-ironman
specContent = specContent.replace(/\(\.\/wordmark-ironman-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./iron-man/wordmark-ironman-$1)');

fs.writeFileSync(specPath, specContent, 'utf8');
console.log('Updated TYPOGRAPHY_SPECIFICATION.md links.');

// 2. Update README.md
let readmeContent = fs.readFileSync(readmePath, 'utf8');

readmeContent = readmeContent.replace(/\(\.\/wordmarks\/wordmark-tech-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./wordmarks/tech-developer/wordmark-tech-$1)');
readmeContent = readmeContent.replace(/\(\.\/wordmarks\/wordmark-classic-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./wordmarks/classic-modernist/wordmark-classic-$1)');
readmeContent = readmeContent.replace(/\(\.\/wordmarks\/wordmark-study-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./wordmarks/classic-modernist/wordmark-study-$1)');
readmeContent = readmeContent.replace(/\(\.\/wordmarks\/wordmark-ironman-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./wordmarks/iron-man/wordmark-ironman-$1)');

readmeContent = readmeContent.replace(/\(\.\/logos\/logo-monogram-cv-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./logos/monograms/logo-monogram-cv-$1)');
readmeContent = readmeContent.replace(/\(\.\/logos\/logo-cx-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./logos/execution-gates/logo-cx-$1)');
readmeContent = readmeContent.replace(/\(\.\/logos\/logo-dag-shield-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./logos/execution-gates/logo-dag-shield-$1)');
readmeContent = readmeContent.replace(/\(\.\/logos\/logo-presentation-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./logos/execution-gates/logo-presentation-$1)');
readmeContent = readmeContent.replace(/\(\.\/logos\/logo-ironman-([a-zA-Z0-9_-]+\.jpg)\)/g, '(./logos/iron-man/logo-ironman-$1)');

// Update directory tree in README.md
const oldTree = `\`\`\`
Codebase/docs/brand_explorations/
├── wordmarks/          # Wordmark typography (Tech 01-15, Classic 01-04, Study boards) [41 files]
├── logos/              # Monograms, C-V marks, DAG shields, execution gates [12 files]
├── banners/            # Technical publication headers & blog covers [3 files]
├── concepts/           # Architectural 3D renders & protocol conceptual art [3 files]
├── previews/           # Live headless browser UI component screenshots [2 files]
└── README.md           # This master index
\`\`\``;

const newTree = `\`\`\`
Codebase/docs/brand_explorations/
├── wordmarks/                  # Categorized wordmark typography
│   ├── iron-man/               # Iron Man & Stark Aerospace explorations [15 files]
│   ├── tech-developer/         # High-tech & developer archetypes [40 files]
│   ├── classic-modernist/      # Swiss Neo-Grotesk & minimalist studies [9 files]
│   ├── -Semi-Selected-/        # Curated candidate shortlist [16 files]
│   ├── -Semi-Selected-Refined-/# Refined candidate shortlist (2.4px line / 5px dot) [12 files]
│   └── TYPOGRAPHY_SPECIFICATION.md
├── logos/                      # Categorized marks & monograms
│   ├── monograms/              # C-V negative space & vertex confluence marks [7 files]
│   ├── execution-gates/        # C-X interlocking gates & DAG shields [5 files]
│   └── iron-man/               # Arc Reactor Causal DAG emblem [1 file]
├── banners/                    # Technical publication headers & blog covers [3 files]
├── concepts/                   # Architectural 3D renders & protocol conceptual art [3 files]
├── previews/                   # Live headless browser UI component screenshots [2 files]
└── README.md                   # This master index
\`\`\``;

readmeContent = readmeContent.replace(oldTree, newTree);

fs.writeFileSync(readmePath, readmeContent, 'utf8');
console.log('Updated README.md links and directory architecture tree.');
