# CAVDAX: Active Development Session State (`DEV_SESSION_STATE.md`)

> **Repository**: `GraphHacks-Hackathon/Codebase`  
> **Session Timestamp**: `2026-10-19T21:17:00+05:30`  
> **Active Branch**: `main` (Feature branches: `frontend`, `backend`, `docs`)  
> **Status**: Full Theme Makeover & Design System Suite Live on Docker • Production Verified

---

## 1. Executive Summary of Complete Theme & Scroller Makeover

## 1.0 Latest Session Achievements (October 22, 2026)

- **Causal Solution Scroller: 3D Rolling Cylindrical Card Sliding Window & Bidirectional Docking Engine**:
  - Implemented standalone production component in `apps/client/src/components/CausalSolutionScroller.jsx` replacing flat carousels with a 3D cylindrical perspective stage (`perspective: 1200px`).
  - **The Problem Space & Failures Resolved**:
    - **Lenis Virtual Scroll Collision**: Calling `lenis.stop()` halted Lenis internal RAF loop and caused subsequent `scrollTo()` calls to be silently dropped due to Lenis checking `(this.isStopped || this.isLocked) && !force`. The user became permanently immobilized.
    - **Premature Card Skipping**: Global keyboard listeners scrolled cards before the user even arrived at the section.
    - **High-Frequency Touchpad Bypass**: Laptop trackpads emitting 60+ wheel events per second skipped all 4 cards in 50ms without debouncing.
    - **Reverse Scrolling Failure (Bottom-to-Top)**: When scrolling up from `#faq-section`, viewport coordinate inversion caused the dock check to fail or initialize at Card 01 instead of Card 04, triggering an immediate exit to Bento without showing cards.
    - **Stale React Closures**: Recreating event listeners inside `useEffect([activeStep])` caused dropped events during fast scroll momentum.
  - **The Battle-Tested Architecture**:
    - **Synchronous Ref Triad**: `isLockedRef`, `activeStepRef`, and `isExitingRef` guarantee zero-latency state reads across high-frequency browser wheel and trackpad streams.
    - **Mathematical Center-Distance Docking**: Viewport capture formula `Math.abs(sectionCenter - viewportCenter) < 0.35 * H` is invariant to screen sizes and laptop DPI scaling.
    - **Directional Entry Seeding**: Approaching from above initializes at Card 01 (`activeStep = 0`); approaching from below initializes at Card 04 (`activeStep = 3`).
    - **Gesture Normalization & 360ms Cooldown**: Normalizes 2-finger horizontal and vertical swipes (`Math.abs(deltaX) > Math.abs(deltaY)`) with a 360ms cooldown preventing multiple card skips.
    - **Natural Directional Lock-Out**: On Card 04, downward gestures smoothly unlock Lenis and glide to `#faq-section`. On Card 01, upward gestures smoothly unlock Lenis and glide back to the bottom of `#bento-section` (`el.offsetTop - 0.75 * H`).
  - **Card 01 Monochromatic Outline Polish**:
    - Replaced unappealing gray dotted circle around the invalidation `X` mark with a crisp, solid circular border: `<circle r="20" className="fill-transparent stroke-slate-950 dark:stroke-white/80" strokeWidth="1.8" />`.
    - Eliminated uncalibrated neon cyan fills in light theme.
  - **Live Browser Verification**:
    - Verified via Chrome DevTools in both directions: forward (Bento -> Card 01 -> 02 -> 03 -> 04 -> FAQ) and reverse (FAQ -> Card 04 -> 03 -> 02 -> 01 -> Bento) with zero page freezing.
  - **Multi-Plane 3D Parallax & Depth Separation**:
    - Stage perspective calibrated to `perspective: 1200px` without `transformStyle: 'preserve-3d'`, ensuring robust 2D DOM hit-testing while projecting authentic 3D spatial geometry.
    - Active center card floats forward at `zPos = +20px` (or `-15px` during dynamic scroll impulse); flanking cards recede into depth at `zPos = -100px` (`scale: 0.82`, `rotateY: ∓24deg`, `opacity: 0.40`).
    - Internal multi-plane SVG separation: diagrams, AST apertures, and status badges implement `transform: translateZ(28px)` with `transformStyle: 'preserve-3d'`, causing graphic elements to visibly float above the frosted glass plane.
    - Interactive pointer micro-tilt tracks mouse position applying spring-damped micro-tilt ($\pm 6^\circ$ `rotateX`, $\pm 9^\circ$ `rotateY`) with 0.40x scaled flanking dampening.
  - **Direction-Aware 10-Second Auto-Scroll & Inner Pill Countdown Fill Bar**:
    - Directional cycling: cards automatically advance every 10.0 seconds along active heading ($01 	o 04$ downward, $04 	o 01$ upward).
    - Inner pill countdown fill: active HUD pill tag renders an inner `0%` to `100%` width fill layer (`bg-white/25` / `dark:bg-slate-950/25`) behind the `z-10` text, providing visual anticipation without clutter.
    - WCAG 2.2.2 hover pause: cursor entry into the stage container immediately freezes countdown and holds the fill bar steady.
    - Directional card clicking: clicks on the right 35% of the center card advance to next; clicks on the left 35% step backward. Flanking cards capture clicks directly with `e.stopPropagation()`.

## 1.1 Previous Session Achievements (October 21, 2026)

- **Interactive Causal Knowledge Graph & Dynamic Firefly Swarm Engine (`SpotlightDataRain.jsx`)**:
  - Replaced legacy matrix rain with a high-contrast Causal Knowledge Graph DAG mesh (~95 micro-vertices, directed vector links, and traveling data packets).
  - Designed an invisible cursor inspection hub: nearby nodes hook into the cursor position with dashed probe lines, with zero physical dot obstruction on the cursor point.
  - Implemented biomimetic firefly & glow-worm swarm migrations with randomized short (2.2s–4.5s) and long (6.0s–10.5s) intervals, naturally orbiting and contouring around focal elements: the Stretchy Lamp Toggle, the CAVDAX Wordmark, the Explore CTA button, and the Scroll prompt.
  - Added obstacle boundary avoidance and perimeter glide so fireflies frame UI text without overlapping letters.
  - Grounded "Scroll to inspect engine" at the viewport bottom (`bottom-10 sm:bottom-12 md:bottom-14 lg:bottom-16`), eliminating negative space across mobile, tablet, and ultra-wide screens.

- **Git Commit Hygiene & Atomic Feature Squashing Standard**:
  - Enshrined the mandatory **"Atomic Feature Squashing & History Cleanliness"** rule in `AGENTS.md`.
  - Consolidated iterative micro-commits into a single cohesive, bisectable milestone commit (`3dbca03`) on `origin/frontend`.

- **Mathematical Polar Synchronization & De-Cluttering of Causal Radar (`CausalProvenanceRadar.jsx`)**:
  - Replaced desynchronized CSS animation delays with a unified `requestAnimationFrame` polar coordinate loop (`x = r * sin(theta)`, `y = -r * cos(theta)`).
  - Beam rotation and target illumination are 100% mathematically synchronized: targets illuminate only when the beam sweeps directly over their radial angle.
  - Replaced jerky stroboscopic pops with smooth Hermite smoothstep ease-in and a lingering exponential decay curve (`Math.pow(1 - decay, 2.2)`).
  - Calibrated theme beam ray: Deep slate/cobalt (`rgba(30, 41, 59, 0.22)`) in light mode, warm amber (`#d9a353`) in dark mode.
  - Eliminated card clutter: stripped HOP labels, redundant secondary status tags, and explanatory bottom text.

- **Design System Governance: Rule 11C & Checklist Item 20 Added (`docs/UI_DESIGN_SYSTEM.md`, `AGENTS.md`)**:
  - Formalized **Rule 11C (Strict Ban on Card Clutter, Redundant Labels & Over-Explanatory Fluff)** in `docs/UI_DESIGN_SYSTEM.md`.
  - Added **Checklist Item 20** to the mandatory UI pre-flight interceptor in `AGENTS.md`, enforcing the 3-point Indispensable Utility Audit prior to writing or modifying any UI component.

- **Puppeteer Signed-In Browser Automation & Persistent Profile Architecture**:
  - Implemented the industry-standard dual-mode browser automation runner in `scripts/browser-runner.js`:
    - **Mode A (Direct Attach to Live Browser)**: If Chrome or Edge is running with `--remote-debugging-port=9222`, Puppeteer automatically connects (`puppeteer.connect`) straight to the user's active, open browser session. No new window is opened; tests execute against the user's live signed-in tabs.
    - **Mode B (Persistent Dev Profile)**: If no debug port is active, launches Chrome/Edge with `userDataDir: .puppeteer-profile/`. The user logs in once, and all authentication tokens, cookies, and localStorage are saved permanently across all test runs. Zero incognito resets.
  - Added Windows one-click debug launcher: `scripts/launch-signedin-browser.ps1` and `scripts/launch-signedin-browser.bat`.
  - Added npm scripts to `package.json`: `npm run browser:open`, `npm run browser:debug`, and `npm run test:e2e`.
  - Added `.puppeteer-profile/` and `.puppeteer-user-data/` to `.gitignore` to prevent any accidental staging or leakage of developer session cookies.
  - Authored comprehensive developer documentation in `docs/PUPPETEER_SIGNED_IN_BROWSER.md`.

- **Enterprise Audit Subsystem Hardening & BLOCKED Action Logging**:
  - Resolved critical compliance gap: `core/mcp/server.js` and `apps/server/index.js` now record an `AgentAction` node with `status: 'BLOCKED_SUPERSEDED_SOURCE'` when Act III rejects unauthorized agent file writes.
  - Linked blocked actions directly to the invalidated decision node (`DEC-102`) via `[:GROUNDED_IN]` edge.
  - Enriched `/api/audit` simulation fallback to populate `executed_at`, `decision_status`, and `decision_title` dynamically.

- **Zero-State Elimination & Historical Demo Seeding**:
  - Added 2 realistic historical actions (`act-hist-001: EXECUTED`, `act-hist-002: BLOCKED_SUPERSEDED_SOURCE`) to `core/graph/queries.js` (`seedDemoGraph`) and `fallbackGraphState`.
  - Visitors and evaluators landing on the `/audit` tab now immediately see a live, populated compliance table with telemetry.

- **Commercial Product Roadmap Architecture (`docs/FUTURE_ROADMAP.md`)**:
  - Codified Section 5: Commercial Multi-Tenant Architecture & Dual-Mode Visualizer.
  - Documented Organization Accounts (GitHub/GitLab OAuth), Multi-Tenant FalkorDB Graph Isolation (`cavdax_graph_{orgId}_{repoId}`), and RBAC.
  - Formulated the Dual-Mode Console pattern: permanently preserving the 4-Act Demo Sandbox alongside connected enterprise live repositories.
  - Contrasted Local Open-Source Studio (`npx cavdax studio`, zero-auth) with Hosted Enterprise Cloud (`cavdax.sahnirmaan.live`, org-auth).

## 1.2 Previous Session Achievements (October 20, 2026)

- **Two-Section Asymmetric Bento Architecture (`LandingPage.jsx`)**:
  - Structured the landing page into a clean Problem-to-Solution sequence:
    - **Section 1: The Problem Space**: "Why Vector RAG Fails" with dynamic Thanos typewriter headline, 4 asymmetric diagnostic cards highlighting *Semantic Cosine Blindness*, *Silent Cache Rot*, *Unprotected Tool Writes*, and *Broken Dependency Cascades*.
    - **Section 2: The Solution Space**: "<span class="text-[#d9a353]">Graph-Grounded</span> → Decision Execution" featuring 4 asymmetric solution cards showcasing FalkorDB GraphBLAS, Enclosed MCP Gate, Causal Matrix Invalidation, and Closed-Loop Revalidation.
  - Stripped all category tag noise and eyebrow pills; reduced paragraph text to 1–2 punchy lines.
  - Connected the solution title using an elegant typographic directed arrow (`→`).

- **Brand Typographic Parity in Particle Canvas (`FooterParticles.jsx`)**:
  - Exported `CAVDAX_WORDMARK_LETTERS_PATH` from `CavdaxWordmark.jsx` as the Single Source of Truth for the 9-loop closed contour Swiss architectural letterforms.
  - `FooterParticles.jsx` now directly rasterizes `new Path2D(CAVDAX_WORDMARK_LETTERS_PATH)` onto an offscreen buffer before sampling coordinate pixels.
  - Eliminated generic browser font fallbacks for brand marks, preserving 90° orthogonal shear cuts and razor-sharp mitered apexes in the particle pointillism canvas.

- **Kinetic Headline Harmony & Smooth Physics (`KineticRollingHeadline.jsx` & `index.css`)**:
  - Harmonized hero rolling phrases from khaki-champagne (`#DFCA9E`) to the canonical golden-amber gradient (`#FDE68A` ➔ `#D9A353` ➔ `#B45309`).
  - Eliminated the CSS keyframe `filter` collision where idle `drop-shadow` caused a jerky shadow pop when the roll completed; converted to pure vector rendering (`filter: none`) for silky 60fps interpolation.

- **Palette Drift Elimination (Unified Amber Token `#d9a353`)**:
  - Standardized all warm accents across the landing page (Thanos typewriter headline, `Graph-Grounded` accent, and footer particle center gradient) to the exact canonical hex token `#d9a353`.

- **Dedicated Theme-Aware Splash Loader (`SplashLoader.jsx` & `CavdaxBrandLoader.jsx`)**:
  - Banned CSS `filter: invert(1)` hacks.
  - Implemented calibrated dual-theme splash screens: Deep Obsidian Void (`#050608`) and Porcelain White (`#F8FAFC`) with zero-latency pre-mount `localStorage` theme resolution.

- **System Provenance & Open Source Attribution Bento Pattern Codified**:
  - Added Section 38 to `docs/UI_DESIGN_SYSTEM.md` and master generator prompts, establishing the spacious 2-column bento card pattern (`md:grid-cols-2`) for technical stacks and hardware benchmarks.

- **CI/CD Automated Deployment (`.github/workflows/deploy.yml`)**:
  - Created automated GitHub Actions workflow targeting AWS EC2 (`cavdax.sahnirmaan.live`) using GitHub Secrets (`VM_HOST`, `VM_USER`, `VM_SSH_KEY`, `VM_APP_DIR`) with dual-engine fallback (`docker compose` / `docker-compose`).

---

A complete visual and architectural transformation has been executed across the frontend and documentation, strictly reconciling all specifications from `#Prompt For UI_DESIGN_SYSTEM.md file.md`, `##The 6 Context Files`, and `TOUR_GUIDE_PROMPT.txt`:

### A. Total Visual & Theme Transformation
- **Design Token Engine (`index.css`)**:
  - Replaced legacy hardcoded palette with CSS Custom Properties supporting both Dark Obsidian Void (`#060709`) and Light Sea Porcelain (`#F4F6F8`).
  - Implemented `.bezel-card` (1px tactile border, subtle elevation, specular highlights) and `.bezel-inner` sub-containers across all UI surfaces.
  - Added tactile button physics (`.tactile-btn`, `.btn-primary`, `.btn-secondary`) with micro-kinetic translations on hover.
  - Bound custom SVG cursors (`default_cursor.svg`, `hand-pointer.svg`, `cover_hand_grab_dark.svg`, `scroll-up.svg`).
  - Added custom cyber glass scrollbar with `scrollbar-gutter: stable`.

- **Dynamic Morphing Header (`Header.jsx`)**:
  - Unscrolled at top: Full-bleed transparent bar with complete brand identity.
  - Scrolled (`scrollY > 24px`): Morphs into a floating centered capsule pill (`w-[min(94%, 980px)] rounded-full backdrop-blur-xl border border-[var(--border-color)] bg-[#0B0D11]/90 shadow-2xl`).
  - Segmented view switcher (`Overview` vs `Live Console`), Live FalkorDB status, SoundFx mute toggle, Guided Tour launcher, Theme switch, and Reset State CTA.

- **Architectural Hero Section (`HeroSection.jsx`)**:
  - Eyebrow badge: `FALKORDB GRAPHBLAS ENGINE • DETERMINISTIC MULTI-HOP TRAVERSAL`.
  - Section 15 Symmetrical Dual Action CTA Buttons (`Start Guided Tour →` and `Inspect Live Graph ↗`).
  - Double-bezel KPI benchmark cards: `< 15ms` Gate Latency, `100%` Precision, Multi-Hop Cypher traversal, and Enclosed MCP Protocol.

- **Interactive Pointillism Particle Engine (`FooterParticles.jsx`)**:
  - Offscreen HTML5 canvas rasterization of `CAVDAX` with 900-weight geometric font.
  - Real-time quadratic mouse repulsion physics and spring-damping return.
  - Circular scroll-to-top button with `/cursors/scroll-up.svg` custom cursor, triggering explosive particle dissolution.

- **Interactive Guided Tour Overlay (`TourGuide.jsx`)**:
  - Fullscreen SVG mask cutout (`#cavdax-tour-spotlight-mask`) with animated cyan accent stroke.
  - Collision-aware popover card (360px), step indicators (`STEP 1 OF 4`), keyboard navigation (`←`, `→`, `Esc`), and first-visit auto-trigger.

- **Interactive Causal Graph Canvas (`GraphCanvas.jsx`)**:
  - Overhauled from crude SVG circles to architectural double-bezel node cards.
  - Curved cubic-bezier connecting edges with glowing data-stream particle trails.
  - Fully unbracketed monospace status badges (`ACTIVE`, `SUPERSEDED`, `STALE`, `VALID`, `BLOCKED`, `EXECUTED`).

- **Cybernetic Terminal & Enclosed MCP Gate (`TerminalView.jsx`)**:
  - Integrated `CavdaxAgentStateIndicator` (Vertex Mitosis HUD) tracking 5 cognitive states (`idle`, `reasoning`, `executing`, `verified`, `rejected`).
  - Removed all Unicode emojis; replaced with clean Lucide icons (`AlertTriangle`, `CheckCircle2`).
  - Code payload inspector and violation path readouts.

- **Node Inspector Drawer (`NodeInspector.jsx`)**:
  - Upgraded with double-bezel styling, pure Lucide icons, and raw Cypher property inspection.

---

## 2. Docker Services Status (Host System Live)

| Container | Service | Host Port | Internal Port | Health / Status | Engine Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cavdax-falkordb` | FalkorDB Graph Database | `6379` | `6379` | **Up (Healthy)** | GraphBLAS Sparse Matrix Engine |
| `cavdax-server` | CAVDAX Backend & MCP Gate | `3001` | `3000` | **Up (Live)** | Connected to `falkordb:6379` |
| `cavdax-client` | Porcelain Dark Web HUD | `5173` | `5173` | **Up (Live)** | Vite 5.4 Dev Server (Freshly Rebuilt) |

---

## 3. Build & Health Verification

- `npm run build` in `apps/client`: **1590 modules transformed**, built in **2.89s** with **0 errors and 0 warnings**.
- Backend health check (`http://localhost:3001/api/health`): `falkordb_connected: true`, `status: "online"`.
- Frontend HUD (`http://localhost:5173/`): `HTTP/1.1 200 OK`.
- Chrome DevTools Inspection: Console clean (0 errors, 0 warnings).

---

## 4. Splash Screen & Brand Identity Overhaul (Latest Polish)

- **Large Logo Scale**: Enriched `CavdaxBrandLoader` to `size={240}` inside a responsive `w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80` container with a luminous cyan-tinted ambient radial aura.
- **Full Animation Sequence**: Extended duration to `4800ms` so the loader executes its full inception-to-lock sequence without being prematurely cut off:
  - `0.0s - 0.4s`: Node vertices materialize.
  - `0.4s - 1.2s`: Outer 'C' and 'V' letterforms draw in.
  - `1.2s - 1.5s`: Vertical DAG spine edge connects.
  - `1.5s - 1.8s`: Symmetrical DAG wings branch across to the junction.
  - `1.8s - 2.1s`: Forward bridge shoots into the chevron apex.
  - `2.1s - 2.4s`: Specular white lock ping flashes at `(74, 50)`.
  - `2.4s - 4.8s`: Fully assembled, locked monogram held in crisp high-contrast clarity.
  - `4.8s - 5.5s`: Smooth fade-out into the main application.
- **Fading Full Form Typography**:
  - `Contextual Action & Verified Decision Autonomous eXecution` displayed with staggered progressive blur-to-focus fade-in (`0.4s` to `2.7s`).
  - Acronym anchor letters (`C`, `A`, `V`, `D`, `A`, `X`) highlighted in electric cyan (`text-cyan-400 font-bold`).
  - Continuous luminous breathing text animation (`splashFullFormBreathe`).
  - Live synchronized telemetry progress bar (`0%` to `100%`) with `[ Click anywhere or press any key to skip ]` convenience.

---

## 5. MCP Architecture, Tour Guide Non-Collision Engine & Team Page Refinements

- **Connect MCP Page Layout (`ConnectMcpPage.jsx`)**:
  - `Enclosed MCP Agent Interceptor` heading is 100% optically and mathematically centered.
  - The `Interactive Guide` button (`[ 🧭 Interactive Guide ]`) is cleanly positioned directly **below** the heading with balanced margin and spacing.
  - All SVG icon colors strictly conform to the primary theme (`text-slate-800 dark:text-white` on button, `text-slate-900 dark:text-white` on section icons, zero unwanted yellow).
  - Decommissioned the toy "Interactive Gateway Diagnostic Tester" card from `/mcp`, elevating the page to production documentation standards with drop-in configs, 3-step loop architecture, relocated 4-pill telemetry row, and direct CTA to the Verification Console.
  - Obsidian syntax-highlighted code console with amber keys and emerald strings.

- **Tour Guide Unhighlighted Placement Engine (`TourGuide.jsx`)**:
  - **Rule 1 (Zero-Overlap / Strict Non-Intersection)**: `collidesWithSpotlight` ensures the floating tour card's bounding box never intersects the highlighted spotlight cutout, eliminating any card overlap over highlighted elements.
  - **Rule 2 (Dynamic Spatial Journey / Never Static)**: Defined explicit per-step placements so the card travels across the screen as the user advances:
    - Step 1 (`mcp-overview`): `bottom-center` (isolated content container with `top ≈ 100px`, completely clearing the floating navbar).
    - Step 2 (`mcp-clients`): `bottom-right` (positioned in unhighlighted area below client config card).
    - Step 3 (`mcp-workflow`): `right` (positioned in the unhighlighted right side gutter, leaving all 3 loop steps 100% uncovered).
    - Console Steps 1-4: `bottom-right`, `right`, `left`, `right` (Console Step 4 `mcp-gate` sits in the unhighlighted graph canvas column on the right with zero overlap).
  - **Rule 3 (Dual-Boundary "When to Scroll" Rule)**:
    - An element is only "already visible" if both its top clears the navbar (`rect.top >= 80px`) AND its bottom does not extend below the viewport fold (`rect.bottom <= vh - 30px`).
    - If the element is within those bounds (like Step 1 and Step 2), it **never triggers an unnecessary scroll jump**.
    - If the element sits below the fold (like Step 3 `mcp-workflow` at $y = 656\text{px}$ to $1017\text{px}$), it automatically and smoothly scrolls to center so the full section and its side card are completely in view.

- **Team Page Provenance & Open Source Attribution (`TeamPage.jsx`)**:
  - Expanded container width to `max-w-6xl` for ample horizontal breathing room.
  - Formatted `System Provenance & Open Source Attribution` sub-cards into a spacious 2-column bento grid (`grid-cols-1 md:grid-cols-2`), providing each card >520px of width.
  - Every detail subtext string fits completely on a single uninterrupted line with zero lonely children/orphans (`text-pretty`, `whitespace-normal sm:whitespace-nowrap`).

---

## 6. Fullscreen Canvas Containment, Micro-Kinetics & Typewriter Polish (Latest Milestone)

- **Fullscreen Causal Graph Containment (`GraphCanvas.jsx`)**:
  - Encapsulated `<NodeInspector>` directly inside `GraphCanvas.jsx` (within `containerRef`). In browser fullscreen mode (`element.requestFullscreen()`), selecting any graph node now reliably displays the inspector panel layered on top of the canvas, rather than being orphaned in the hidden parent DOM.
  - Added `${isFullscreen && isDarkTheme ? ' dark' : ''}` to the root container to ensure dark mode styles and dropshadows stay active in fullscreen viewports.
- **Micro-Kinetic SVG Hover Animations (`App.jsx`)**:
  - Tour Guide button (`Compass`): `group-hover:rotate-45 transition-transform duration-300`.
  - Reset Demo button (`RotateCcw`): `group-hover:-rotate-180 transition-transform duration-500` (while preserving active `animate-spin`).
- **Contextual Tooltip Engine & Keyboard Shortcut Discovery**:
  - Wired custom portal-backed `<Tooltip>` component to Console subheader action buttons.
  - Added keyboard shortcut hints and listeners:
    - `Tour Guide`: <kbd>T</kbd>
    - `Reset Demo`: <kbd>R</kbd>
- **Thanos Typewriter Headline Cursor Discipline (`ThanosTypewriterHeadline.jsx`)**:
  - Strictly hid the blinking `|` cursor block once the phrase has finished typing (`phase === 'typing'` only). The cursor never lingers after finished punctuation or during hold/dissolve phases.
- **Eyebrow Section Pill Ban Enforced (`LandingPage.jsx`)**:
  - Removed decorative category eyebrow pills above headings (`Architectural Problem Space`, `Knowledge Base & System Architecture`).
- **Prompt Rules Updates**:
  - Updated `#AGENTS.md File.md` and `#UI_DESIGN_SYSTEM.md file.md` in `C:\(Lectures)\+[Dev-Assets]\#(AI-AGENTS)\#Prompts\#General-Main` with the non-collision tour placement engine, dual-boundary scroll rule, fullscreen canvas architecture, SVG chromatic discipline, typewriter cursor discipline, and the End-of-Session Domain-Partitioned Git Governance Protocol.




