import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.resolve(__dirname, '../docs/brand_explorations');

// 1. wordmarks/iron-man/README.md
const wmIronManReadme = `# Iron Man & Stark Aerospace Typography Archive

This archive contains all 15 wordmark explorations inspired by Iron Man and Stark Industries aerospace typography for **CAVDAX**.

---

## Catalog Index

### 1. Armor Chassis & Arc Conduit Editions
- [\`wordmark-ironman-01-stark-mark-armor-chassis.jpg\`](./wordmark-ironman-01-stark-mark-armor-chassis.jpg) — **Mark VII Armor Chassis** (Hot-rod crimson & gold-titanium extrusion with glowing arc baseline)
- [\`wordmark-ironman-02-stealth-palladium-reactor.jpg\`](./wordmark-ironman-02-stealth-palladium-reactor.jpg) — **Stealth Ops Titanium** (Brushed palladium steel, laser-etched cuts, and ice-blue conduit)
- [\`wordmark-ironman-03-master-system-board.jpg\`](./wordmark-ironman-03-master-system-board.jpg) — **Iron Man Aerospace Master Executive Board** (Dossier comparing Mark VII and Stealth wordmarks)

### 2. Crossbar-Less Chevron (\`Λ\`) with Embedded Arc Reactor
- [\`wordmark-ironman-04-crossbarless-arc-core.jpg\`](./wordmark-ironman-04-crossbarless-arc-core.jpg) — **Mark VII Crossbar-Less Chevron** (Crossbar eliminated from \`A\`, nesting circular electromagnetic arc reactor)
- [\`wordmark-ironman-05-stealth-chevron-reactor.jpg\`](./wordmarks/wordmark-ironman-05-stealth-chevron-reactor.jpg) — **Stealth Ops Titanium Forward Rake** (12° forward rake with dual arc reactors in both \`A\`s)
- [\`wordmark-ironman-06-stark-corporate-minimalist.jpg\`](./wordmark-ironman-06-stark-corporate-minimalist.jpg) — **Stark Corporate Minimalist** (Surgical monoline white letters with bridging arc light)
- [\`wordmark-ironman-07-dual-arc-chassis-board.jpg\`](./wordmark-ironman-07-dual-arc-chassis-board.jpg) — **Master Executive Crossbar-Less Board** (Comparative study of crossbar-less chevron typography)

### 3. Pure Typography (Zero Symbols, Zero Arc Reactor, Zero Baseline)
- [\`wordmark-ironman-08-pure-typography-gold-crimson.jpg\`](./wordmark-ironman-08-pure-typography-gold-crimson.jpg) — **Pure Iron Man Title Typography** (Gold & crimson extrusion, pure typography only)
- [\`wordmark-ironman-09-pure-typography-monochrome-stark.jpg\`](./wordmark-ironman-09-pure-typography-monochrome-stark.jpg) — **Pure Stark White Typography** (High-contrast pure white crossbar-less letterforms on obsidian)
- [\`wordmark-ironman-10-pure-typography-brushed-titanium.jpg\`](./wordmark-ironman-10-pure-typography-brushed-titanium.jpg) — **Pure Brushed Titanium Typography** (Aerospace brushed titanium with chiseled chamfers)
- [\`wordmark-ironman-11-pure-typography-presentation-board.jpg\`](./wordmark-ironman-11-pure-typography-presentation-board.jpg) — **Pure Typography Master Board** (Side-by-side study of all three pure typography finishes)

### 4. Smooth Curves (Zero Faceted Ridges on \`C\` & \`D\`)
- [\`wordmark-ironman-12-smooth-pure-gold-crimson.jpg\`](./wordmark-ironman-12-smooth-pure-gold-crimson.jpg) — **Smooth C & D Pure Typography (Gold & Crimson)** (Continuous smooth arcs on \`C\` and \`D\`)
- [\`wordmark-ironman-13-smooth-pure-monochrome-stark.jpg\`](./wordmark-ironman-13-smooth-pure-monochrome-stark.jpg) — **Smooth C & D Pure Stark White Typography** (Seamless fluid curves in pure white)
- [\`wordmark-ironman-14-smooth-pure-brushed-titanium.jpg\`](./wordmark-ironman-14-smooth-pure-brushed-titanium.jpg) — **Smooth C & D Pure Brushed Titanium** (Aerospace titanium with ridge-free arcs)
- [\`wordmark-ironman-15-smooth-pure-presentation-board.jpg\`](./wordmark-ironman-15-smooth-pure-presentation-board.jpg) — **Smooth Pure Typography Showcase Board** (Comparative study of smooth, ridge-free letterforms)
`;

// 2. wordmarks/tech-developer/README.md
const wmTechReadme = `# High-Tech & Developer Wordmark Archive

This archive contains the 40 specialized high-tech, cryptographic, compiler, and hardware-inspired wordmarks developed for **CAVDAX**.

---

## Catalog Index (Tech 01 to Tech 40)

- [\`wordmark-tech-01-squircle-aerospace.jpg\`](./wordmark-tech-01-squircle-aerospace.jpg) — Squircle Aerospace (SpaceX / Aerospace HUD standard)
- [\`wordmark-tech-02-terminal-monospace.jpg\`](./wordmark-tech-02-terminal-monospace.jpg) — Developer Terminal Monospace (JetBrains & Berkeley Mono developer terminal)
- [\`wordmark-tech-03-chamfered-cryptographic.jpg\`](./wordmark-tech-03-chamfered-cryptographic.jpg) — Chamfered Cryptographic Hardware (Quantum HSM security)
- [\`wordmark-tech-04-stencil-graph-matrix.jpg\`](./wordmark-tech-04-stencil-graph-matrix.jpg) — Stencil Graph Matrix (Autonomous compiler AST cuts)
- [\`wordmark-tech-05-silicon-pcb-microtrace.jpg\`](./wordmark-tech-05-silicon-pcb-microtrace.jpg) — Silicon PCB Micro-Trace (Semiconductor lithography)
- [\`wordmark-tech-06-crypto-verification-monospace.jpg\`](./wordmark-tech-06-crypto-verification-monospace.jpg) — Cryptographic Verification Monospace (Zero-Knowledge protocol standard)
- [\`wordmark-tech-07-quantum-vector-lattice.jpg\`](./wordmark-tech-07-quantum-vector-lattice.jpg) — Quantum Vector Lattice (GraphBLAS sparse matrix vector intersections)
- [\`wordmark-tech-08-telemetry-hud.jpg\`](./wordmark-tech-08-telemetry-hud.jpg) — Military-Grade Diagnostics HUD (60°/120° chamfers with reticle crosshairs)
- [\`wordmark-tech-09-matrix-monolith.jpg\`](./wordmark-tech-09-matrix-monolith.jpg) — Brutalist Matrix Monolith (Teenage Engineering & Braun hardware grid)
- [\`wordmark-tech-10-compiler-ast-syntax.jpg\`](./wordmark-tech-10-compiler-ast-syntax.jpg) — Deep AST Compiler Syntax Token (Rust/LLVM syntax tokens)
- [\`wordmark-tech-11-laser-etched-monolith.jpg\`](./wordmark-tech-11-laser-etched-monolith.jpg) — Laser-Etched Silicon Dual-Rail (Nanometer hairline tracks)
- [\`wordmark-tech-12-cypherpunk-kernel.jpg\`](./wordmark-tech-12-cypherpunk-kernel.jpg) — Cypherpunk Bytecode Kernel (ASCII bytecode hex tags)
- [\`wordmark-tech-13-radar-oscilloscope.jpg\`](./wordmark-tech-13-radar-oscilloscope.jpg) — Radar Vector Oscilloscope (Concentric radar range sweep)
- [\`wordmark-tech-14-quantum-phase-gate.jpg\`](./wordmark-tech-14-quantum-phase-gate.jpg) — Quantum Phase-Gate Circuit (State vector gate matrix)
- [\`wordmark-tech-15-cyber-chassis-blade.jpg\`](./wordmark-tech-15-cyber-chassis-blade.jpg) — Cyber-Chassis Server Blade (Industrial 1U rack-mount chassis)
- [\`wordmark-tech-16-riscv-micro-op.jpg\`](./wordmark-tech-16-riscv-micro-op.jpg) — RISC-V Micro-Op Architecture (Out-of-order CPU pipeline latches)
- [\`wordmark-tech-17-photonics-waveguide.jpg\`](./wordmark-tech-17-photonics-waveguide.jpg) — Silicon Photonics Waveguide (Mach-Zehnder optical bus)
- [\`wordmark-tech-18-spacecraft-inertial-gyro.jpg\`](./wordmark-tech-18-spacecraft-inertial-gyro.jpg) — Spacecraft Inertial Dynamics (3-axis gyroscope & RCS vector nozzles)
- [\`wordmark-tech-19-merkle-dag-matrix.jpg\`](./wordmark-tech-19-merkle-dag-matrix.jpg) — Cryptographic Merkle-DAG Block (Hexagonal block nodes)
- [\`wordmark-tech-20-neuromorphic-spiking-mesh.jpg\`](./wordmark-tech-20-neuromorphic-spiking-mesh.jpg) — Neuromorphic Spiking Mesh (SNN spike train)
- [\`wordmark-tech-21-linear-precision-apex.jpg\`](./wordmark-tech-21-linear-precision-apex.jpg) — Linear Precision Apex (Surgical Swiss architectural grotesk)
- [\`wordmark-tech-22-palantir-chiseled-chamfer.jpg\`](./wordmark-tech-22-palantir-chiseled-chamfer.jpg) — Palantir Chiseled Chamfer (Sovereign defense chiseled geometry)
- [\`wordmark-tech-23-deepmind-extended-horizon.jpg\`](./wordmarks/tech-developer/wordmark-tech-23-deepmind-extended-horizon.jpg) — DeepMind Extended Horizon (Horizontal foundation AI gravity)
- [\`wordmark-tech-24-nasa-worm-continuous-monoline.jpg\`](./wordmark-tech-24-nasa-worm-continuous-monoline.jpg) — NASA Worm Continuous Monoline (Single-path continuous tubular flow)
- [\`wordmark-tech-25-stripe-grounded-modernist.jpg\`](./wordmark-tech-25-stripe-grounded-modernist.jpg) — Stripe Grounded Modernist (Flat trapezoidal apexes & open 45° terminal)
- [\`wordmark-tech-26-anisotropic-hatch-monolith.jpg\`](./wordmark-tech-26-anisotropic-hatch-monolith.jpg) — Anisotropic Laser-Hatched Titanium (Milled titanium with optical grating)
- [\`wordmark-tech-27-voronoi-graph-shards.jpg\`](./wordmark-tech-27-voronoi-graph-shards.jpg) — Voronoi Topological Graph Shards (Computational geometry)
- [\`wordmark-tech-28-chevron-guilloche-matrix.jpg\`](./wordmark-tech-28-chevron-guilloche-matrix.jpg) — Geometric Chevron Guilloché (Forward chevron optical acceleration)
- [\`wordmark-tech-29-hex-honeycomb-monolith.jpg\`](./wordmark-tech-29-hex-honeycomb-monolith.jpg) — Hexagonal Honeycomb Exoskeleton (Aerospace beryllium bulkhead)
- [\`wordmark-tech-30-stepped-brutalist-ziggurat.jpg\`](./wordmark-tech-30-stepped-brutalist-ziggurat.jpg) — Stepped Brutalist Ziggurat (Tectonic data fortress)
- [\`wordmark-tech-31-moire-interference-lattice.jpg\`](./wordmark-tech-31-moire-interference-lattice.jpg) — Kinetico-Moiré Interference Lattice (Op-Art wave interference)
- [\`wordmark-tech-32-topographic-isocontour-monolith.jpg\`](./wordmark-tech-32-topographic-isocontour-monolith.jpg) — Topographical Causal Iso-Contour Monolith (Continuous geodesic slabs)
- [\`wordmark-tech-33-guilloche-banknote-security-weave.jpg\`](./wordmark-tech-33-guilloche-banknote-security-weave.jpg) — Guilloché Banknote Security Weave (Sovereign security threads)
- [\`wordmark-tech-34-quantum-braided-anyon-topology.jpg\`](./wordmark-tech-34-quantum-braided-anyon-topology.jpg) — Quantum Braided Anyon Topological Braid (Multi-rail topological knot proof)
- [\`wordmark-tech-35-brutalist-rebar-truss.jpg\`](./wordmark-tech-35-brutalist-rebar-truss.jpg) — Brutalist Architectural Rebar Truss (High-tensile Pratt/Warren truss web)
- [\`wordmark-tech-36-penrose-aperiodic-quasicrystal.jpg\`](./wordmark-tech-36-penrose-aperiodic-quasicrystal.jpg) — Penrose Aperiodic Quasicrystal (Golden ratio geometric symmetry)
- [\`wordmark-tech-37-chladni-cymatics-resonant-waveform.jpg\`](./wordmark-tech-37-chladni-cymatics-resonant-waveform.jpg) — Chladni Cymatics Resonant Waveform (Acoustic nodal standing waves)
- [\`wordmark-tech-38-discrete-cellular-automata-matrix.jpg\`](./wordmark-tech-38-discrete-cellular-automata-matrix.jpg) — Discrete Cellular Automata Matrix (Deterministic discrete lattice)
- [\`wordmark-tech-39-anisotropic-carbon-monocoque-weave.jpg\`](./wordmark-tech-39-anisotropic-carbon-monocoque-weave.jpg) — Anisotropic Carbon Monocoque Weave (Twill-weave carbon fiber)
- [\`wordmark-tech-40-fresnel-zone-plate-radar-aperture.jpg\`](./wordmark-tech-40-fresnel-zone-plate-radar-aperture.jpg) — Fresnel Zone Plate Optics (Synthetic aperture radar phase array)
`;

// 3. wordmarks/classic-modernist/README.md
const wmClassicReadme = `# Classic Modernist & Early Study Archive

This archive preserves the foundational Swiss Neo-Grotesk, Extended Sans, and early architectural studies for **CAVDAX**.

---

## Catalog Index

### Modernist Standards
- [\`wordmark-classic-01-swiss-neo-grotesk.jpg\`](./wordmark-classic-01-swiss-neo-grotesk.jpg) — Swiss Neo-Grotesk (Söhne / Neue Haas Grotesk architectural standard)
- [\`wordmark-classic-02-extended-geometric-sans.jpg\`](./wordmark-classic-02-extended-geometric-sans.jpg) — Extended Geometric Sans (Space Grotesk Bold, Raycast & Scale AI)
- [\`wordmark-classic-03-chiseled-precision-modernist.jpg\`](./wordmark-classic-03-chiseled-precision-modernist.jpg) — Chiseled Precision Modernist (Stripe Press & Pentagram mathematical proof)
- [\`wordmark-classic-04-institutional-minimalist-monoline.jpg\`](./wordmark-classic-04-institutional-minimalist-monoline.jpg) — Institutional Minimalist Monoline (Helvetica Now Black / SF Pro Display)
- [\`wordmark-classic-study-monoline-standard.jpg\`](./wordmark-classic-study-monoline-standard.jpg) — Classic Study Monoline Standard

### Directed Arrow & Baseline Studies
- [\`wordmark-study-directed-arrow-v1.jpg\`](./wordmark-study-directed-arrow-v1.jpg) — Directed Arrow Study (v1)
- [\`wordmark-study-directed-arrow-v2.jpg\`](./wordmark-study-directed-arrow-v2.jpg) — Directed Arrow Study (v2)
- [\`wordmark-study-directed-arrow-v3.jpg\`](./wordmark-study-directed-arrow-v3.jpg) — Directed Arrow Study (v3)
- [\`wordmark-study-initial-geometric.jpg\`](./wordmark-study-initial-geometric.jpg) — Initial Geometric Study
- [\`wordmark-study-monochrome-baseline.jpg\`](./wordmark-study-monochrome-baseline.jpg) — Monochrome Baseline Study
`;

// 4. logos/monograms/README.md
const lgMonogramsReadme = `# Monograms Archive (C-V Causal Marks)

This archive contains all monogram-style brand marks exploring the intersection of \`C\` (Context/Cause) and \`V\` (Vector/Verification) for **CAVDAX**.

---

## Catalog Index

- [\`logo-monogram-cv-negative-space-v1.jpg\`](./logo-monogram-cv-negative-space-v1.jpg) — Pure Negative Space C-V Mark (v1)
- [\`logo-monogram-cv-negative-space-v2.jpg\`](./logo-monogram-cv-negative-space-v2.jpg) — Pure Negative Space C-V Mark (v2)
- [\`logo-monogram-cv-negative-space-v3.jpg\`](./logo-monogram-cv-negative-space-v3.jpg) — Pure Negative Space C-V Mark (v3)
- [\`logo-monogram-cv-pivot-node.jpg\`](./logo-monogram-cv-pivot-node.jpg) — C-V Monogram with Grounded Pivot Node
- [\`logo-monogram-cv-causal-chain.jpg\`](./logo-monogram-cv-causal-chain.jpg) — C-V Monogram with 3-Node Causal Chain
- [\`logo-monogram-cv-confluence-initial.jpg\`](./logo-monogram-cv-confluence-initial.jpg) — C-V Confluence Initial mark
- [\`logo-monogram-cv-vertex-terminals.jpg\`](./logo-monogram-cv-vertex-terminals.jpg) — C-V Mark with Vertex Terminals
`;

// 5. logos/execution-gates/README.md
const lgGatesReadme = `# Execution Gates & Shield Logos Archive

This archive contains interlocking gate, DAG shield, and governance execution marks for **CAVDAX**.

---

## Catalog Index

- [\`logo-cx-interlocking-gate-v1.jpg\`](./logo-cx-interlocking-gate-v1.jpg) — C-X Interlocking Gate Logo (v1)
- [\`logo-cx-interlocking-gate-v2.jpg\`](./logo-cx-interlocking-gate-v2.jpg) — C-X Interlocking Gate Logo (v2)
- [\`logo-cx-interlocking-gate-v3.jpg\`](./logo-cx-interlocking-gate-v3.jpg) — C-X Interlocking Gate Logo (v3)
- [\`logo-dag-shield-mcp-gate.jpg\`](./logo-dag-shield-mcp-gate.jpg) — DAG Shield & Model Context Protocol Gate
- [\`logo-presentation-board-vector.jpg\`](./logo-presentation-board-vector.jpg) — Vector Logo Master Presentation Board
`;

// 6. logos/iron-man/README.md
const lgIronManReadme = `# Iron Man & Stark Aerospace Emblem Archive

This archive contains emblem and badge designs inspired by Iron Man and Stark Arc Reactor technology for **CAVDAX**.

---

## Catalog Index

- [\`logo-ironman-01-arc-reactor-causal-dag.jpg\`](./logo-ironman-01-arc-reactor-causal-dag.jpg) — **Arc Reactor Causal DAG Emblem Mark** (Mark VI / Mark 85 Arc Reactor containment ring with inverted triangular 3-vertex causal graph core)
`;

fs.writeFileSync(path.join(baseDir, 'wordmarks/iron-man/README.md'), wmIronManReadme, 'utf8');
fs.writeFileSync(path.join(baseDir, 'wordmarks/tech-developer/README.md'), wmTechReadme, 'utf8');
fs.writeFileSync(path.join(baseDir, 'wordmarks/classic-modernist/README.md'), wmClassicReadme, 'utf8');

fs.writeFileSync(path.join(baseDir, 'logos/monograms/README.md'), lgMonogramsReadme, 'utf8');
fs.writeFileSync(path.join(baseDir, 'logos/execution-gates/README.md'), lgGatesReadme, 'utf8');
fs.writeFileSync(path.join(baseDir, 'logos/iron-man/README.md'), lgIronManReadme, 'utf8');

console.log('Successfully generated catalog README.md in all 6 subfolders.');
