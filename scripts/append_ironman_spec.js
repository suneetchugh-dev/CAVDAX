import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.resolve(__dirname, '../docs/brand_explorations/wordmarks/TYPOGRAPHY_SPECIFICATION.md');
let content = fs.readFileSync(specPath, 'utf8');

const ironManSection = `

---

## 4. Iron Man Aerospace & Stark Arc Reactor Archetypes

### Iron Man 01: Mark VII Hot-Rod Crimson & Gold Titanium Armor Chassis
* **Asset**: [\`wordmark-ironman-01-stark-mark-armor-chassis.jpg\`](./wordmark-ironman-01-stark-mark-armor-chassis.jpg)
* **Inspiration**: Tony Stark Mark VII / Mark 85 armor plating, aerospace titanium-gold alloy, Stark Industries military-spec R&D enclaves.
* **Glyph Anatomy**:
  - Aggressive 14-degree forward aerodynamic rake (\`skewX(-14deg)\`) expressing hyper-velocity causal computation.
  - Monumental heavy geometric sans geometry with high crossbars and 45-degree corner chamfers on all stems.
  - Multi-tier dual-metallic finish: Deep Stark hot-rod crimson extrusion shadow bevel (\`#8B0000\` to \`#1A0103\`) topped by a burnished gold-titanium specular face (\`#FFF5B8\` to \`#D4AF37\`).
  - Interlocking armor plate seams etched with horizontal hairline separation cuts revealing internal cyan arc energy glow.
* **Causal Underline**:
  - Multi-layer dual-rail directed conduit: 2.6px burnished gold titanium track paired with a high-intensity 1.4px cyan Arc Reactor energy line.
  - Micro Arc Reactor core node beneath \`C\` (Context Ingestion), intermediate causal pivot reticle beneath \`V\` (Causal Gate), and precision micro-pin beneath \`D\`.
  - Aerodynamic terminal repulsor chevron pointing directly into the execution termination of \`X\`.
* **Resonance**: Extreme computational horsepower, aerospace-grade armor resilience, and uncompromising technical authority.

---

### Iron Man 02: Stealth Ops Titanium & Ice-Blue Arc Reactor
* **Asset**: [\`wordmark-ironman-02-stealth-palladium-reactor.jpg\`](./wordmark-ironman-02-stealth-palladium-reactor.jpg)
* **Inspiration**: Mark XV Sneaky, Mark XVI Nightclub tactical stealth armor, War Machine tactical obsidian matte chassis, palladium-core containment.
* **Glyph Anatomy**:
  - Monochromatic brushed tungsten & aerospace titanium gradient (\`#FFFFFF\` to \`#94A3B8\` to \`#1E293B\`).
  - 15-degree tactical forward rake with laser-etched cyan perimeter halo (\`#00F0FF\`).
  - Precision stencil laser cuts dividing the letter stems into modular flight-surface panels.
* **Causal Underline**:
  - 2.4px hairline conduit track with glowing ice-blue core filament.
  - 5.2px micro-reactor origin node beneath \`C\`, 45-degree diamond causal gate beneath \`V\`, and dual-concentric verification node beneath \`D\`.
  - Aerodynamic white/cyan hyper-velocity terminal chevron beneath \`X\`.
* **Resonance**: Covert high-assurance security, silent causal interception, and zero-compromise architectural defense.

---

### Iron Man 03: Master System & Executive Presentation Board
* **Asset**: [\`wordmark-ironman-03-master-system-board.jpg\`](./wordmark-ironman-03-master-system-board.jpg)
* **Inspiration**: Stark Industries executive presentation dossiers, DARPA advanced technology briefing boards.
* **Glyph Anatomy**:
  - Side-by-side comparative architectural breakdown of both Mark VII Armor and Stealth Ops wordmarks.
  - Technical engineering color swatches (Ti Gold \`#D4AF37\`, Stark Crimson \`#8B0000\`, Arc Cyan \`#00F0FF\`, Titanium \`#E2E8F0\`, Obsidian \`#08090C\`).
  - Cross-referencing the Arc Reactor Causal DAG emblem with exact typographic dimensions.
* **Causal Underline**: Displays the unified causal vector edge standard across all chassis variants.
* **Resonance**: Comprehensive brand architecture ready for enterprise presentation and defense-grade collateral.
`;

if (!content.includes('Iron Man 01: Mark VII')) {
  content += ironManSection;
  fs.writeFileSync(specPath, content, 'utf8');
  console.log('Successfully appended Iron Man section to TYPOGRAPHY_SPECIFICATION.md');
} else {
  console.log('Section already exists.');
}
