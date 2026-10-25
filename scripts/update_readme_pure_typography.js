import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readmePath = path.resolve(__dirname, '../docs/brand_explorations/README.md');
let content = fs.readFileSync(readmePath, 'utf8');

const newEntries = `- [\`wordmark-ironman-08-pure-typography-gold-crimson.jpg\`](./wordmarks/wordmark-ironman-08-pure-typography-gold-crimson.jpg) — **Pure Iron Man Title Typography (Gold & Crimson)** (Pure typography only: zero symbols, zero logos, zero arc reactor cores, crossbar-less \`A\` chevron)
- [\`wordmark-ironman-09-pure-typography-monochrome-stark.jpg\`](./wordmarks/wordmark-ironman-09-pure-typography-monochrome-stark.jpg) — **Pure Stark White Typography (Minimalist)** (High-contrast pure white crossbar-less letterforms on deep obsidian)
- [\`wordmark-ironman-10-pure-typography-brushed-titanium.jpg\`](./wordmarks/wordmark-ironman-10-pure-typography-brushed-titanium.jpg) — **Pure Brushed Titanium Typography (Aerospace)** (Multi-tone brushed aerospace titanium with chiseled chamfers)
- [\`wordmark-ironman-11-pure-typography-presentation-board.jpg\`](./wordmarks/wordmark-ironman-11-pure-typography-presentation-board.jpg) — **Pure Typography Master Showcase Board** (Comparative architectural study of the 3 pure unadorned typography finishes)
`;

if (!content.includes('wordmark-ironman-08-pure-typography-gold-crimson.jpg')) {
  content = content.replace(
    '[`wordmark-ironman-07-dual-arc-chassis-board.jpg`](./wordmarks/wordmark-ironman-07-dual-arc-chassis-board.jpg) — **Master Executive Crossbar-Less Showcase Board** (Comparative architectural study of crossbar-less chevron typography)',
    `[\`wordmark-ironman-07-dual-arc-chassis-board.jpg\`](./wordmarks/wordmark-ironman-07-dual-arc-chassis-board.jpg) — **Master Executive Crossbar-Less Showcase Board** (Comparative architectural study of crossbar-less chevron typography)\n${newEntries}`
  );
  fs.writeFileSync(readmePath, content, 'utf8');
  console.log('Successfully updated README.md with pure typography wordmarks');
} else {
  console.log('Entries already exist');
}
