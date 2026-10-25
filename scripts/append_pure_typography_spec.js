import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.resolve(__dirname, '../docs/brand_explorations/wordmarks/TYPOGRAPHY_SPECIFICATION.md');
let content = fs.readFileSync(specPath, 'utf8');

const pureTypographySection = `

### Iron Man 08: Pure Title Typography (Mark VII Armor Finish)
* **Asset**: [\`wordmark-ironman-08-pure-typography-gold-crimson.jpg\`](./wordmark-ironman-08-pure-typography-gold-crimson.jpg)
* **Inspiration**: Pure, unadorned Iron Man movie & comic title lettering. Strictly typography only: zero symbols, zero logos, zero arc reactor cores, zero underline vectors.
* **Glyph Anatomy**:
  - Pure \`CAVDAX\` architectural block forms with 45-degree corner chamfers.
  - Crossbar-less \`A\` glyphs sculpted as pure upward chevrons (\`Λ\`) with clean, open triangular negative space.
  - Multi-tier metallic finish: Specular burnished gold titanium face (\`#FFF9D2\` to \`#F2CB64\` to \`#543404\`) with Stark hot-rod crimson extrusion shadow bevels (\`#FF2E3B\` to \`#1E0002\`).
* **Underline**: None (completely unadorned pure typography).
* **Resonance**: Monumental superhero brand presence with zero distracting decorative clutter.

---

### Iron Man 09: Pure Stark White Typography (Minimalist Architecture)
* **Asset**: [\`wordmark-ironman-09-pure-typography-monochrome-stark.jpg\`](./wordmark-ironman-09-pure-typography-monochrome-stark.jpg)
* **Inspiration**: Minimalist Stark Industries aerospace laboratory branding; high-contrast monolithic white letterforms on obsidian.
* **Glyph Anatomy**:
  - Pristine solid white-to-silver gradient (\`#FFFFFF\` to \`#CBD5E1\`).
  - Pure crossbar-less \`Λ\` chevrons and mitered vertices.
  - Zero decorative elements, zero lines, zero icons.
* **Underline**: None.
* **Resonance**: Surgical, ultra-modern developer tool elegance suitable for enterprise infrastructure.

---

### Iron Man 10: Pure Brushed Titanium Typography (Aerospace Finish)
* **Asset**: [\`wordmark-ironman-10-pure-typography-brushed-titanium.jpg\`](./wordmark-ironman-10-pure-typography-brushed-titanium.jpg)
* **Inspiration**: Milled aerospace titanium chassis plate from Stark flight testing armor.
* **Glyph Anatomy**:
  - Multi-tone brushed titanium gradient (\`#FFFFFF\` to \`#94A3B8\` to \`#1E293B\`) with crisp slate-black bevel outline.
  - Pure geometric \`Λ\` chevrons without crossbars.
* **Underline**: None.
* **Resonance**: Stealth engineering power, mechanical durability, and timeless industrial authority.

---

### Iron Man 11: Pure Typography Comparative Master Board
* **Asset**: [\`wordmark-ironman-11-pure-typography-presentation-board.jpg\`](./wordmark-ironman-11-pure-typography-presentation-board.jpg)
* **Inspiration**: Clean design agency presentation dossier comparing the three pure typography finishes side by side.
* **Glyph Anatomy**:
  - Displays Mark VII Gold & Crimson, Pure Stark White, and Brushed Titanium together for instant evaluation.
* **Underline**: None.
* **Resonance**: Definitive presentation board for pure Iron Man typography selection.
`;

if (!content.includes('Iron Man 08: Pure Title Typography')) {
  content += pureTypographySection;
  fs.writeFileSync(specPath, content, 'utf8');
  console.log('Successfully appended pure typography section to TYPOGRAPHY_SPECIFICATION.md');
} else {
  console.log('Section already exists.');
}
