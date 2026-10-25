import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.resolve(__dirname, '../docs/brand_explorations/wordmarks/TYPOGRAPHY_SPECIFICATION.md');
let content = fs.readFileSync(specPath, 'utf8');

const crossbarlessSection = `

### Iron Man 04: Crossbar-Less Chevron (Λ) with Integrated Arc Reactor Core
* **Asset**: [\`wordmark-ironman-04-crossbarless-arc-core.jpg\`](./wordmark-ironman-04-crossbarless-arc-core.jpg)
* **Inspiration**: Authentic Iron Man comic book & movie title lettering with complete horizontal crossbar elimination in \`A\`, creating an upward chevron \`Λ\` that houses an active Arc Reactor power core.
* **Glyph Anatomy**:
  - Upward \`Λ\` chevron architecture: The horizontal crossbar in both \`A\` glyphs is eliminated, creating an open triangular aperture.
  - Symmetrical chevron cadence: The \`A\` (\`Λ\`) and \`V\` letterforms form an alternating geometric wave (\`C - Λ - V - D - Λ - X\`) where \`Λ\` and \`V\` are exact angular inverted reflections of one another.
  - Multi-tier dual-metallic finish: Specular burnished gold titanium face (\`#FFF8C4\` to \`#D4AF37\`) framed by Stark hot-rod crimson bevel extrusion shadows (\`#FF2E3B\` to \`#2A0103\`).
  - Integrated Arc Core: A concentric circular electromagnetic Arc Reactor (with copper containment coils and white-hot cyan plasma core) is nestled inside the open aperture of the first \`A\`, while a miniature triangular vibranium prism core powers the second \`A\`.
* **Causal Underline**: Sleek 2.4px gold/cyan hairline baseline with micro-nodes aligned under each letterform and a terminal aerodynamic arrow under \`X\`.
* **Resonance**: Instantly recognizable Marvel Iron Man typography aesthetic fused with high-velocity causal vector computation.

---

### Iron Man 05: Stealth Ops Titanium with Forward Rake & Dual Arc Chevrons
* **Asset**: [\`wordmark-ironman-05-stealth-chevron-reactor.jpg\`](./wordmark-ironman-05-stealth-chevron-reactor.jpg)
* **Inspiration**: Mark XVI Nightclub tactical stealth chassis, high-velocity avionics, tungsten-palladium monolithic plates.
* **Glyph Anatomy**:
  - 12-degree forward aerodynamic rake (\`skewX(-12deg)\`) providing aggressive forward velocity.
  - Brushed palladium and aerospace titanium gradient (\`#FFFFFF\` to \`#64748B\` to \`#1E293B\`).
  - Suspended cyan Arc Energy cores positioned at the exact crossbar altitude inside both \`A\` chevrons.
* **Causal Underline**: 2.2px stealth hairline vector conduit with electric cyan laser glow and diamond-faceted causal gate stops.
* **Resonance**: Covert tactical defense aesthetic, high-assurance formal verification, and sub-millisecond execution.

---

### Iron Man 06: Stark Corporate Minimalist (Monoline Architecture)
* **Asset**: [\`wordmark-ironman-06-stark-corporate-minimalist.jpg\`](./wordmark-ironman-06-stark-corporate-minimalist.jpg)
* **Inspiration**: Stark Industries corporate identity, Swiss architectural monoline rigor, clean enterprise developer platforms (Linear, Stripe).
* **Glyph Anatomy**:
  - Unadorned stark porcelain white typography with pure \`Λ\` crossbar-less chevrons.
  - A surgical, ultra-clean cyan Arc Reactor core nestled in the first \`A\` bridging the diagonal stems with coherent light.
  - Generous optical tracking and razor-sharp 90-degree mitered vertices.
* **Causal Underline**: 2.2px white monoline with 5.0px micro-nodes and directed terminal arrow.
* **Resonance**: Highest enterprise dignity for infrastructure products: marries iconic superhero branding with executive boardroom minimalism.

---

### Iron Man 07: Master Executive Crossbar-Less Showcase Board
* **Asset**: [\`wordmark-ironman-07-dual-arc-chassis-board.jpg\`](./wordmark-ironman-07-dual-arc-chassis-board.jpg)
* **Inspiration**: Stark Industries R&D presentation dossier comparing crossbar-less \`A\` chevron apertures.
* **Glyph Anatomy**:
  - Multi-card comparative breakdown showcasing Mark VII Armor, Stealth Ops Titanium, Stark Corporate Minimalist, and the \`Λ - V - Λ\` mathematical chevron rhythm.
* **Causal Underline**: Standardized 2.2px - 2.4px hairline directed vector conduit across all variants.
* **Resonance**: Comprehensive architectural dossier verifying the crossbar-less \`A\` typography system.
`;

if (!content.includes('Iron Man 04: Crossbar-Less Chevron')) {
  content += crossbarlessSection;
  fs.writeFileSync(specPath, content, 'utf8');
  console.log('Successfully appended crossbarless section to TYPOGRAPHY_SPECIFICATION.md');
} else {
  console.log('Section already exists.');
}
