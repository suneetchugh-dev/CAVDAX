import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readmePath = path.resolve(__dirname, '../docs/brand_explorations/README.md');
let content = fs.readFileSync(readmePath, 'utf8');

const newEntries = `- [\`wordmark-ironman-04-crossbarless-arc-core.jpg\`](./wordmarks/wordmark-ironman-04-crossbarless-arc-core.jpg) — **Iron Man Mark VII Crossbar-Less Chevron Wordmark** (Authentic Iron Man title typography with crossbar-less \`A\` chevron housing an active Arc Reactor)
- [\`wordmark-ironman-05-stealth-chevron-reactor.jpg\`](./wordmarks/wordmark-ironman-05-stealth-chevron-reactor.jpg) — **Stealth Ops Titanium Forward-Rake Wordmark** (Brushed titanium with 12° forward rake and dual cyan Arc Reactors inside both \`A\` chevrons)
- [\`wordmark-ironman-06-stark-corporate-minimalist.jpg\`](./wordmarks/wordmark-ironman-06-stark-corporate-minimalist.jpg) — **Stark Corporate Minimalist Wordmark** (Surgical monoline white letterforms with crossbar-less \`A\` and bridging Arc Reactor light)
- [\`wordmark-ironman-07-dual-arc-chassis-board.jpg\`](./wordmarks/wordmark-ironman-07-dual-arc-chassis-board.jpg) — **Master Executive Crossbar-Less Showcase Board** (Comparative architectural study of crossbar-less chevron typography)
`;

if (!content.includes('wordmark-ironman-04-crossbarless-arc-core.jpg')) {
  content = content.replace(
    '[`wordmark-ironman-03-master-system-board.jpg`](./wordmarks/wordmark-ironman-03-master-system-board.jpg) — **Iron Man Aerospace Master Executive Board** (Complete architectural comparative showcase with color swatches and DAG emblem)',
    `[\`wordmark-ironman-03-master-system-board.jpg\`](./wordmarks/wordmark-ironman-03-master-system-board.jpg) — **Iron Man Aerospace Master Executive Board** (Complete architectural comparative showcase with color swatches and DAG emblem)\n${newEntries}`
  );
  fs.writeFileSync(readmePath, content, 'utf8');
  console.log('Successfully updated README.md with crossbarless wordmarks');
} else {
  console.log('Entries already exist');
}
