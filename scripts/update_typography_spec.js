import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../docs/brand_explorations/wordmarks/TYPOGRAPHY_SPECIFICATION.md');
let content = fs.readFileSync(filePath, 'utf8');

const tableTarget = '| **Classic 04** | Institutional Minimalist Monoline | Apple Pro Display, Helvetica Now Black | [`wordmark-classic-04-institutional-minimalist-monoline.jpg`](./wordmark-classic-04-institutional-minimalist-monoline.jpg) |';
const tableAddition = tableTarget + '\r\n' +
'| **Classic 05** | Micro-Node Precision Vector | Linear / Vercel calibrated micro-nodes (50% reduction) | [`wordmark-classic-05-micro-node-precision.jpg`](./-Semi-Selected-/wordmark-classic-05-micro-node-precision.jpg) |\r\n' +
'| **Classic 06** | Hollow Reticle Aperture | Verification rings, zero-knowledge targeting aperture gates | [`wordmark-classic-06-hollow-reticle-aperture.jpg`](./-Semi-Selected-/wordmark-classic-06-hollow-reticle-aperture.jpg) |\r\n' +
'| **Classic 07** | Minimal Vector Hairline | Stripe Press / Pentagram extreme typographic-to-hairline contrast | [`wordmark-classic-07-minimal-vector-hairline.jpg`](./-Semi-Selected-/wordmark-classic-07-minimal-vector-hairline.jpg) |\r\n' +
'| **Classic 08** | Tri-Vertex Causal DAG | 3-stage milestone proof (Context -> Decision -> Execution) | [`wordmark-classic-08-tri-vertex-causal-dag.jpg`](./-Semi-Selected-/wordmark-classic-08-tri-vertex-causal-dag.jpg) |';

if (!content.includes('Classic 05')) {
  content = content.replace(tableTarget, tableAddition);
}

const newSections = '\r\n\r\n---\r\n\r\n' +
'### Classic 05: Micro-Node Precision Vector\r\n' +
'* **Asset**: [`wordmark-classic-05-micro-node-precision.jpg`](./-Semi-Selected-/wordmark-classic-05-micro-node-precision.jpg)\r\n' +
'* **Inspiration**: Linear, Vercel, Figma - surgical Swiss Neo-Grotesk micro-calibration.\r\n' +
'* **Glyph Anatomy**:\r\n' +
'  - Monumental Swiss Neo-Grotesk architecture (`font-weight: 700`, `letter-spacing: 0.125em`).\r\n' +
'  - Pristine circular geometry on `C` and `D` with razor-sharp mitered vertices on `A`, `V`, `X`.\r\n' +
'* **Causal Underline**:\r\n' +
'  - Micro-nodes scaled to ~50% visual mass (`r = 11px` on a `6px` baseline stroke) centered precisely under `C` (Context) and `D` (Decision).\r\n' +
'  - Open 55° geometric chevron terminating directly beneath the right flank of `X` (Execution).\r\n' +
'* **Resonance**: Eliminates visual clutter beneath the letters; allows the brand wordmark to command maximum primary focus while preserving the causal graph lineage.\r\n' +
'\r\n---\r\n\r\n' +
'### Classic 06: Hollow Reticle Aperture\r\n' +
'* **Asset**: [`wordmark-classic-06-hollow-reticle-aperture.jpg`](./-Semi-Selected-/wordmark-classic-06-hollow-reticle-aperture.jpg)\r\n' +
'* **Inspiration**: Zero-Knowledge proof verification gates, GraphBLAS sparse matrix coordinates, precision optical target reticles.\r\n' +
'* **Glyph Anatomy**:\r\n' +
'  - Identical authoritative Swiss Neo-Grotesk monumental letterforms.\r\n' +
'* **Causal Underline**:\r\n' +
'  - Hollow ring vertices (concentric aperture gates with `stroke: 3.8px` and transparent core) under `C` and `D`.\r\n' +
'  - Lightens baseline optical weight and establishes a high-assurance cryptographic verification aesthetic.\r\n' +
'* **Resonance**: Uncompromising security, formal verification, and zero-knowledge mathematical dignity.\r\n' +
'\r\n---\r\n\r\n' +
'### Classic 07: Minimal Vector Hairline\r\n' +
'* **Asset**: [`wordmark-classic-07-minimal-vector-hairline.jpg`](./-Semi-Selected-/wordmark-classic-07-minimal-vector-hairline.jpg)\r\n' +
'* **Inspiration**: Stripe Press, Pentagram, luxury technical monographs.\r\n' +
'* **Glyph Anatomy**:\r\n' +
'  - Unaltered monumental Swiss Neo-Grotesk bold letterforms.\r\n' +
'* **Causal Underline**:\r\n' +
'  - Ultra-fine `3.2px` hairline vector with delicate `7.5px` micro-pin coordinate stops.\r\n' +
'  - Maximum optical contrast between heavyweight typography and whispering mathematical vector lines.\r\n' +
'* **Resonance**: Peak editorial modernism; whispers extreme technical capability without decorative bulk.\r\n' +
'\r\n---\r\n\r\n' +
'### Classic 08: Tri-Vertex Causal DAG\r\n' +
'* **Asset**: [`wordmark-classic-08-tri-vertex-causal-dag.jpg`](./-Semi-Selected-/wordmark-classic-08-tri-vertex-causal-dag.jpg)\r\n' +
'* **Inspiration**: Complete 3-stage milestone DAG provenance (Context Root -> Decision State -> Execution Output).\r\n' +
'* **Glyph Anatomy**:\r\n' +
'  - Authoritative Swiss Neo-Grotesk architecture.\r\n' +
'* **Causal Underline**:\r\n' +
'  - 3 calibrated micro-nodes: `C` (Cause / Context Root at `x=335`), `D` (Decision Fork at `x=665`), and `X` (Execution Gate at `x=925`), terminating into a sharp chevron at `x=960`.\r\n' +
'* **Resonance**: Full end-to-end formal audit provenance represented in a balanced tri-vertex causal edge.\r\n';

if (!content.includes('Classic 05: Micro-Node Precision Vector')) {
  content = content.trimEnd() + newSections;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated TYPOGRAPHY_SPECIFICATION.md with Classic 05-08');
