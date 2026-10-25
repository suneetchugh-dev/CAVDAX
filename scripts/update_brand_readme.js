import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readmePath = path.resolve(__dirname, '../docs/brand_explorations/README.md');
let content = fs.readFileSync(readmePath, 'utf8');

// Add under wordmarks section if not already present
const wordmarkEntries = `
### D. Iron Man Aerospace & Stark Arc Reactor Archetypes (New)
- [\`wordmark-ironman-01-stark-mark-armor-chassis.jpg\`](./wordmarks/wordmark-ironman-01-stark-mark-armor-chassis.jpg) — **Iron Man Mark VII Armor Wordmark** (Stark hot-rod crimson & gold-titanium chiseled armor typography with arc energy baseline)
- [\`wordmark-ironman-02-stealth-palladium-reactor.jpg\`](./wordmarks/wordmark-ironman-02-stealth-palladium-reactor.jpg) — **Stealth Ops Titanium Wordmark** (Brushed palladium steel, laser-etched stencil cuts, and ice-blue arc conduit)
- [\`wordmark-ironman-03-master-system-board.jpg\`](./wordmarks/wordmark-ironman-03-master-system-board.jpg) — **Iron Man Aerospace Master Executive Board** (Complete architectural comparative showcase with color swatches and DAG emblem)
`;

const logoEntry = `- [\`logo-ironman-01-arc-reactor-causal-dag.jpg\`](./logos/logo-ironman-01-arc-reactor-causal-dag.jpg) — **Arc Reactor Causal DAG Emblem Mark** (Mark VI / Mark 85 Arc Reactor containment ring with inverted triangular 3-vertex causal graph core)\n`;

if (!content.includes('wordmark-ironman-01-stark-mark-armor-chassis.jpg')) {
  // Insert before "## 2. Logos Directory"
  content = content.replace('## 2. Logos Directory', `${wordmarkEntries}\n---\n\n## 2. Logos Directory`);
}

if (!content.includes('logo-ironman-01-arc-reactor-causal-dag.jpg')) {
  // Insert after the last logo entry before "## 3. Banners Directory"
  content = content.replace('## 3. Banners Directory', `${logoEntry}\n---\n\n## 3. Banners Directory`);
}

fs.writeFileSync(readmePath, content, 'utf8');
console.log('Successfully updated docs/brand_explorations/README.md');
