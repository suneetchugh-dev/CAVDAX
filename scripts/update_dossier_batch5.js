import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.resolve(__dirname, '../docs/brand_explorations/wordmarks/TYPOGRAPHY_SPECIFICATION.md');
let content = fs.readFileSync(file, 'utf8');

const tableMarker = "| **Tech 25** | Grounded Chiseled Modernist | Stripe Press, Supabase - monumental flat apex trapezoid authority | [`wordmark-tech-25-stripe-grounded-modernist.jpg`](./wordmark-tech-25-stripe-grounded-modernist.jpg) |";
const newRows = `| **Tech 26** | Anisotropic Laser-Hatched Titanium | Milled aerospace titanium, 45° optical grating laser hatch pattern | [\`wordmark-tech-26-anisotropic-hatch-monolith.jpg\`](./wordmark-tech-26-anisotropic-hatch-monolith.jpg) |
| **Tech 27** | Voronoi Topological Graph Shards | Computational geometry, faceted Voronoi polygon shards, zero slime | [\`wordmark-tech-27-voronoi-graph-shards.jpg\`](./wordmark-tech-27-voronoi-graph-shards.jpg) |
| **Tech 28** | Geometric Chevron Guilloché | Structural concrete mass with internal forward chevron optical acceleration | [\`wordmark-tech-28-chevron-guilloche-matrix.jpg\`](./wordmark-tech-28-chevron-guilloche-matrix.jpg) |
| **Tech 29** | Hexagonal Honeycomb Exoskeleton | Aerospace beryllium bulkhead, 60°/120° isometric core weight voids | [\`wordmark-tech-29-hex-honeycomb-monolith.jpg\`](./wordmark-tech-29-hex-honeycomb-monolith.jpg) |
| **Tech 30** | Stepped Brutalist Ziggurat | Tectonic data fortress, 90° stepped orthogonal terraces, pure brutalism | [\`wordmark-tech-30-stepped-brutalist-ziggurat.jpg\`](./wordmark-tech-30-stepped-brutalist-ziggurat.jpg) |`;

if (content.includes(tableMarker)) {
  content = content.replace(tableMarker, tableMarker + '\n' + newRows);
}

const sectionMarker = "## 3. Classic Modernist Archetypes";
const newSections = `### Tech 26: Anisotropic Laser-Hatched Titanium (Milled Titanium Standard)
* **Asset**: [\`wordmark-tech-26-anisotropic-hatch-monolith.jpg\`](./wordmark-tech-26-anisotropic-hatch-monolith.jpg)
* **Inspiration**: CNC-milled aerospace titanium, semiconductor wafer stepper lithography, concrete cast facets.
* **Glyph Anatomy**:
  - Exterior silhouette: Chiseled, solid monolithic planes with razor-sharp 90° shear edges. Zero rounded caps.
  - Interior pattern: Filled with dense, ultra-crisp 45-degree diagonal laser hatch lines (1.5px strokes on 8px pitch) creating an optical micro-grating reflection.
* **Causal Underline**: Concrete structural baseline rail with square anchor points: \`PROVENANCE_ROOT: 0xCAVDAX\` -> \`DECISION_PLANE: CONCRETE_VERIFIED\`.
* **Resonance**: Hardcore aerospace manufacturing, physical hardware prestige, and unyielding material substance.

---

### Tech 27: Voronoi Topological Graph Shards (Computational Geometry Standard)
* **Asset**: [\`wordmark-tech-27-voronoi-graph-shards.jpg\`](./wordmark-tech-27-voronoi-graph-shards.jpg)
* **Inspiration**: Computational geometry, GraphBLAS partition matrices, concrete tectonic plates, armor plating.
* **Glyph Anatomy**:
  - Each letter is segmented into precision-faceted polygonal Voronoi shards separated by crisp 2.5px negative-space fracture seams.
  - Zero organic slime; every vertex is a sharp, chiseled planar polygon angle.
* **Causal Underline**: Structural tectonic baseline connecting diamond/polygonal block nodes: \`TECTONIC_PARTITION: CONTEXT\` -> \`TOPOLOGICAL_GATE: VERIFIED\`.
* **Resonance**: Graph partition theory, distributed database resilience, and faceted architectural dominance.

---

### Tech 28: Geometric Chevron Guilloché (Optical Acceleration Standard)
* **Asset**: [\`wordmark-tech-28-chevron-guilloche-matrix.jpg\`](./wordmark-tech-28-chevron-guilloche-matrix.jpg)
* **Inspiration**: High-frequency algorithmic execution pipelines, supersonic wind-tunnel shock diamonds, currency guilloché security.
* **Glyph Anatomy**:
  - Heavy 26px solid concrete letterforms with square orthogonal cut terminals.
  - Internal negative-space forward-pointing chevron directional arrows (\`>>>\`) cut out directly from the solid cores.
* **Causal Underline**: Forward propulsion vector baseline with chevron stage markers: \`VECTOR_ACCELERATION: CONTEXT\` -> \`DECISION_GATE: FORWARD_PROPULSION\`.
* **Resonance**: Relentless forward momentum, high-frequency autonomous execution, and massive concrete stability.

---

### Tech 29: Hexagonal Honeycomb Exoskeleton (Aerospace Bulkhead Standard)
* **Asset**: [\`wordmark-tech-29-hex-honeycomb-monolith.jpg\`](./wordmark-tech-29-hex-honeycomb-monolith.jpg)
* **Inspiration**: James Webb Space Telescope beryllium mirrors, rocket engine thrust puck bulkheads, composite carbon-fiber monocoques.
* **Glyph Anatomy**:
  - Heavy 28px square-shear letter silhouettes.
  - Symmetrically placed hexagonal void core cutouts (\`⬡\`) throughout each letter's structural spine.
* **Causal Underline**: Honeycomb matrix baseline with hexagonal cell nodes: \`STRUCTURAL_CELL: CAUSE_ORIGIN\` -> \`EXOSKELETON_VERIFICATION: PASSED\`.
* **Resonance**: Lightweight extreme-strength aerospace architecture, structural fault tolerance, and unbending integrity.

---

### Tech 30: Stepped Brutalist Ziggurat (Tectonic Data Fortress Standard)
* **Asset**: [\`wordmark-tech-30-stepped-brutalist-ziggurat.jpg\`](./wordmark-tech-30-stepped-brutalist-ziggurat.jpg)
* **Inspiration**: Brutalist concrete architecture, stepped pyramid ziggurats, high-performance server cooling heat sinks.
* **Glyph Anatomy**:
  - Diagonal strokes and curved bowls are completely replaced with 90° stepped micro-terraces.
  - 100% orthogonal: every single angle is a strict 90-degree right angle step-down.
  - Eliminates all curves and diagonals, producing a concrete monolithic monument.
* **Causal Underline**: Stepped data fortress baseline with notched terrace stages: \`TERRACE_ROOT: VERIFIED_PROVENANCE\` -> \`STAGE: ZIGGURAT_COMMIT\`.
* **Resonance**: Monumental infrastructure permanence, architectural brutalism, and immutable compute power.

---

`;

if (content.includes(sectionMarker)) {
  content = content.replace(sectionMarker, newSections + sectionMarker);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated TYPOGRAPHY_SPECIFICATION.md with Tech 26-30');
