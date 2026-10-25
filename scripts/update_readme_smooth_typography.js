import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readmePath = path.resolve(__dirname, '../docs/brand_explorations/README.md');
let content = fs.readFileSync(readmePath, 'utf8');

const newEntries = `- [\`wordmark-ironman-12-smooth-pure-gold-crimson.jpg\`](./wordmarks/wordmark-ironman-12-smooth-pure-gold-crimson.jpg) — **Smooth C & D Pure Iron Man Typography (Gold & Crimson)** (Continuous smooth curved \`C\` & \`D\` with zero faceted ridges, crossbar-less \`A\` chevron)
- [\`wordmark-ironman-13-smooth-pure-monochrome-stark.jpg\`](./wordmarks/wordmark-ironman-13-smooth-pure-monochrome-stark.jpg) — **Smooth C & D Pure Stark White Typography (Minimalist)** (Smooth continuous curves in pure white-to-silver on deep obsidian)
- [\`wordmark-ironman-14-smooth-pure-brushed-titanium.jpg\`](./wordmarks/wordmark-ironman-14-smooth-pure-brushed-titanium.jpg) — **Smooth C & D Pure Brushed Titanium Typography (Aerospace)** (Aerospace brushed titanium with ridge-free \`C\` and \`D\` arcs)
- [\`wordmark-ironman-15-smooth-pure-presentation-board.jpg\`](./wordmarks/wordmark-ironman-15-smooth-pure-presentation-board.jpg) — **Smooth Pure Typography Master Showcase Board** (Comparative architectural showcase of the smooth, ridge-free typography)
`;

if (!content.includes('wordmark-ironman-12-smooth-pure-gold-crimson.jpg')) {
  content = content.replace(
    '[`wordmark-ironman-11-pure-typography-presentation-board.jpg`](./wordmarks/wordmark-ironman-11-pure-typography-presentation-board.jpg) — **Pure Typography Master Showcase Board** (Comparative architectural study of the 3 pure unadorned typography finishes)',
    `[\`wordmark-ironman-11-pure-typography-presentation-board.jpg\`](./wordmarks/wordmark-ironman-11-pure-typography-presentation-board.jpg) — **Pure Typography Master Showcase Board** (Comparative architectural study of the 3 pure unadorned typography finishes)\n${newEntries}`
  );
  fs.writeFileSync(readmePath, content, 'utf8');
  console.log('Successfully updated README.md with smooth typography wordmarks');
} else {
  console.log('Entries already exist');
}
