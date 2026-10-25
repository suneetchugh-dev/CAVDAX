import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.resolve(__dirname, '../docs/brand_explorations/wordmarks/TYPOGRAPHY_SPECIFICATION.md');
let content = fs.readFileSync(specPath, 'utf8');

const smoothSection = `

### Iron Man 12: Smooth C & D Pure Typography (Mark VII Armor Finish)
* **Asset**: [\`wordmark-ironman-12-smooth-pure-gold-crimson.jpg\`](./wordmark-ironman-12-smooth-pure-gold-crimson.jpg)
* **Inspiration**: Refined Iron Man title architecture with completely smooth, ridge-free continuous curves on \`C\` and \`D\`, matching the sleek diagonal blades of crossbar-less \`A\` (\`Λ\`).
* **Glyph Anatomy**:
  - \`C\`: Continuous mathematical elliptical arcs (\`R=85px\` outer, \`R=47px\` inner) eliminating all faceted corner ridges.
  - \`D\`: Smooth aerodynamic right bowl arc matching the continuous curve geometry of \`C\`.
  - \`A\`: Pure upward chevrons (\`Λ\`) with zero horizontal crossbars and smooth straight diagonal legs.
  - \`V\` & \`X\`: Symmetrical downward chevron (\`V\`) and mitered crossed blades (\`X\`).
  - Finish: Specular burnished gold titanium face (\`#FFF9D2\` to \`#F2CB64\` to \`#543404\`) with Stark hot-rod crimson extrusion shadow bevels (\`#FF2E3B\` to \`#1E0002\`).
* **Underline**: None (pure unadorned typography).
* **Resonance**: Flawless, aerodynamic luxury superhero finish with zero visual roughness.

---

### Iron Man 13: Smooth C & D Pure Stark White Typography (Minimalist)
* **Asset**: [\`wordmark-ironman-13-smooth-pure-monochrome-stark.jpg\`](./wordmark-ironman-13-smooth-pure-monochrome-stark.jpg)
* **Inspiration**: Stark Industries aerospace corporate monoline with smooth, continuous \`C\` and \`D\` contours on deep obsidian black.
* **Glyph Anatomy**:
  - Crisp solid white-to-silver gradient (\`#FFFFFF\` to \`#CBD5E1\`).
  - Seamless fluid curves on \`C\` and \`D\`; pure crossbar-less \`Λ\` chevrons on \`A\`.
  - 100% clean: zero symbols, zero logos, zero baseline lines.
* **Underline**: None.
* **Resonance**: Highest enterprise modernism, calm executive authority, and surgical precision.

---

### Iron Man 14: Smooth C & D Pure Brushed Titanium Typography (Aerospace)
* **Asset**: [\`wordmark-ironman-14-smooth-pure-brushed-titanium.jpg\`](./wordmark-ironman-14-smooth-pure-brushed-titanium.jpg)
* **Inspiration**: Milled smooth aerospace titanium flight surface; seamless transitions between curved and angular glyphs.
* **Glyph Anatomy**:
  - Multi-tone brushed titanium gradient (\`#FFFFFF\` to \`#94A3B8\` to \`#1E293B\`) with slate-black bevel outline.
  - Smooth continuous \`C\` and \`D\` arcs; crossbar-less \`A\` chevrons.
* **Underline**: None.
* **Resonance**: Heavy armor-grade industrial permanence with aerodynamic fluid elegance.

---

### Iron Man 15: Smooth Typography Comparative Master Board
* **Asset**: [\`wordmark-ironman-15-smooth-pure-presentation-board.jpg\`](./wordmark-ironman-15-smooth-pure-presentation-board.jpg)
* **Inspiration**: Executive comparative briefing dossier evaluating the ridge-free smooth \`C\` & \`D\` letterforms across all three finishes.
* **Glyph Anatomy**:
  - Side-by-side presentation of Smooth Mark VII Gold & Crimson, Smooth Stark White, and Smooth Brushed Titanium.
* **Underline**: None.
* **Resonance**: Comprehensive architectural proof of the smooth, ridge-free Iron Man typography standard.
`;

if (!content.includes('Iron Man 12: Smooth C & D')) {
  content += smoothSection;
  fs.writeFileSync(specPath, content, 'utf8');
  console.log('Successfully appended smooth typography section to TYPOGRAPHY_SPECIFICATION.md');
} else {
  console.log('Section already exists.');
}
