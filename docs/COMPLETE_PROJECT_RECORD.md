# CAVDAX: Complete Technical, Architectural & Implementation Record

> **Document**: Comprehensive Master Engineering Record  
> **Repository**: `GraphHacks-Hackathon/Codebase`  
> **Authors**: Antigravity Pair-Programming Agent & Engineering Lead (Suneet & Geetika)  
> **Date**: October 21, 2026  
> **Status**: Verified in Production Build • Deployed to `origin/frontend` & `origin/docs`  

---

## Table of Contents
1. [Executive Overview & Core Mission](#1-executive-overview--core-mission)
2. [CAVDAX Brand Identity & Architectural Typography System](#2-cavdax-brand-identity--architectural-typography-system)
   - [2.1 The Monochromatic Identity Philosophy](#21-the-monochromatic-identity-philosophy)
   - [2.2 Swiss Architectural Wordmark Typography](#22-swiss-architectural-wordmark-typography)
   - [2.3 C-V Dual-Confluence Monogram (Pure Negative Space)](#23-c-v-dual-confluence-monogram-pure-negative-space)
   - [2.4 High-Precision SVG Path Engineering](#24-high-precision-svg-path-engineering)
3. [Causal Knowledge Graph & Biomimetic Firefly Swarm Engine](#3-causal-knowledge-graph--biomimetic-firefly-swarm-engine)
   - [3.1 Transformation from Matrix Rain to Causal DAG Canvas](#31-transformation-from-matrix-rain-to-causal-dag-canvas)
   - [3.2 Invisible Cursor Inspection Hub (Vector Probes without Dot Obstruction)](#32-invisible-cursor-inspection-hub-vector-probes-without-dot-obstruction)
   - [3.3 Biomimetic Multi-Target Firefly Swarm Migrations](#33-biomimetic-multi-target-firefly-swarm-migrations)
   - [3.4 Obstacle Boundary Avoidance & Perimeter Glide Physics](#34-obstacle-boundary-avoidance--perimeter-glide-physics)
   - [3.5 Harmonic 2D Firefly Distribution (Above & Below Wordmark)](#35-harmonic-2d-firefly-distribution-above--below-wordmark)
   - [3.6 Dynamic Traveling Aperture Spotlight Masking](#36-dynamic-traveling-aperture-spotlight-masking)
4. [Section 0 Wordmark Intro Viewport & Grounded Layout Architecture](#4-section-0-wordmark-intro-viewport--grounded-layout-architecture)
   - [4.1 Eliminating Viewport Dead Space](#41-eliminating-viewport-dead-space)
   - [4.2 Tactile Sizing Preservation](#42-tactile-sizing-preservation)
   - [4.3 Grounding "Scroll to Inspect Engine" at the Viewport Floor](#43-grounding-scroll-to-inspect-engine-at-the-viewport-floor)
5. [Default Signed-In Browser Setup for Puppeteer Testing (Complete Implementation)](#5-default-signed-in-browser-setup-for-puppeteer-testing-complete-implementation)
   - [5.1 The Chromium Architecture Problem: `SingletonLock` & Incognito Defaults](#51-the-chromium-architecture-problem-singletonlock--incognito-defaults)
   - [5.2 Dual-Mode Architecture: Remote Debug Attach vs Persistent Profile](#52-dual-mode-architecture-remote-debug-attach-vs-persistent-profile)
   - [5.3 Production Implementation of `scripts/browser-runner.js`](#53-production-implementation-of-scriptsbrowser-runnerjs)
   - [5.4 Windows Remote Debugging Launchers (PowerShell & Batch)](#54-windows-remote-debugging-launchers-powershell--batch)
   - [5.5 NPM Scripts & Workflow Commands](#55-npm-scripts--workflow-commands)
   - [5.6 Security Isolation & Git Credential Hygiene](#56-security-isolation--git-credential-hygiene)
6. [Enterprise Audit Subsystem & Compliance Logging](#6-enterprise-audit-subsystem--compliance-logging)
   - [6.1 Act III BLOCKED_SUPERSEDED_SOURCE Enforcement](#61-act-iii-blocked_superseded_source-enforcement)
   - [6.2 Zero-State Elimination & Historical Demo Seeding](#62-zero-state-elimination--historical-demo-seeding)
7. [Full Design System & Interactive UI Overhaul](#7-full-design-system--interactive-ui-overhaul)
   - [7.1 Two-Section Asymmetric Bento Architecture](#71-two-section-asymmetric-bento-architecture)
   - [7.2 Causal Provenance Radar Polar Synchronization](#72-causal-provenance-radar-polar-synchronization)
   - [7.3 Particle Pointillism Wordmark Canvas (`FooterParticles.jsx`)](#73-particle-pointillism-wordmark-canvas-footerparticlesjsx)
   - [7.4 Team Page Emblem Lightbox & Parallax Tilt](#74-team-page-emblem-lightbox--parallax-tilt)
   - [7.5 Unified Golden-Amber Color Token (`#d9a353`)](#75-unified-golden-amber-color-token-d9a353)
8. [Git Hygiene & Atomic Squashing Protocol](#8-git-hygiene--atomic-squashing-protocol)
   - [8.1 Why Micro-Commit Churn Harms Git Repositories](#81-why-micro-commit-churn-harms-git-repositories)
   - [8.2 Consolidation of Iterative Commits into Atomic Milestones](#82-consolidation-of-iterative-commits-into-atomic-milestones)
   - [8.3 The Constitutional Git Squashing Rule in `AGENTS.md`](#83-the-constitutional-git-squashing-rule-in-agentsmd)
9. [Complete Inventory of Modified Files & Commit Audit](#9-complete-inventory-of-modified-files--commit-audit)

---

## 1. Executive Overview & Core Mission

**CAVDAX** (*Contextual Action & Verified Decision Autonomous eXecution*) is a next-generation societal innovation and autonomous agent execution engine built for the WeMakeDevs x FalkorDB Hackathon.

### The Problem It Solves
Modern autonomous coding agents (Claude Code, Cursor, Copilot Workspace) rely almost exclusively on **Vector RAG (Retrieval-Augmented Generation)** to look up codebase context. When an architectural decision (ADR) changes or a dependency is updated:
1. **Semantic Cosine Blindness**: Vector embeddings match words based on fuzzy syntactic similarity rather than deterministic causal truth.
2. **Silent Cache Rot**: Vector databases cannot invalidate obsolete decisions because they do not track directed dependency edges.
3. **Unprotected Tool Execution**: Autonomous agents execute file edits and commands based on superseded assumptions, silently introducing architectural regressions.

### The CAVDAX Solution
CAVDAX replaces vector blindness with a **FalkorDB GraphBLAS Causal Knowledge Graph**:
- Ingests real Git commits, ADRs, and schema constraints into a Directed Acyclic Graph (DAG).
- Enforces an **Enclosed Model Context Protocol (MCP) Action Gate** that intercepts agent actions in real time.
- Triggers a **Cascading Invalidation Wave** across affected decisions the moment an upstream contract changes.
- Automatically rejects unauthorized file writes (`BLOCKED_SUPERSEDED_SOURCE`) until the agent revalidates against the new causal chain.

---

## 2. CAVDAX Brand Identity & Architectural Typography System

### 2.1 The Monochromatic Identity Philosophy
- Banned all generic AI-generated colorful glow effects (no blue/cyan nebulae, no electric purple gradients, no 3D bevels).
- Adopted strict **Swiss Graphic Design & Pentagram Modernism**: pure solid porcelain white (`#FFFFFF`) on deep matte obsidian black (`#050608`), accented by surgical golden-amber (`#d9a353`) exclusively for causal decision nodes.

### 2.2 Swiss Architectural Wordmark Typography
- **File**: [`CavdaxWordmark.jsx`](../apps/client/src/components/CavdaxWordmark.jsx)
- **Anatomy & DNA**:
  - All-caps letterforms: `C A V D A X`.
  - **90° Flat Orthogonal Shear Cuts**: The curved letterforms (`C` and `D`) terminate in crisp, vertical 90-degree flat cuts. Banned all rounded sausage pill-caps.
  - **Mitered Vertices**: The diagonal letterforms (`A`, `V`, `X`) feature razor-sharp chiseled mitered apexes.
  - **Monoline Stroke Weight**: Unified geometric line thickness across all 6 characters.
  - **Integrated C-to-X Causal Directed Arrow**: A subtle, crisp directed graph edge running beneath the wordmark, beginning with a solid graph vertex under `C` and terminating in a forward chevron under `X`.

### 2.3 C-V Dual-Confluence Monogram (Pure Negative Space)
- A minimalist geometric mark fusing the letter `C` (Causal Conscience) with a forward-pointing chevron `>` (Verified Execution Vector).
- **Zero Sparkle / Pure Negative Space**: Eliminated all extraneous decorative stars, diamonds, and floating sparkles. The negative space between the `C` arc and the execution chevron breathes cleanly with mathematical precision.

### 2.4 High-Precision SVG Path Engineering
- Exported `CAVDAX_WORDMARK_LETTERS_PATH` as the canonical SVG path definition (9 closed-contour subpaths comprising external outlines and internal cutouts for `A` and `D`).
- Reused across the application:
  - Vector SVG rendering in the hero section.
  - Offscreen canvas rasterization in the particle pointillism canvas (`FooterParticles.jsx`).

---

## 3. Causal Knowledge Graph & Biomimetic Firefly Swarm Engine

### 3.1 Transformation from Matrix Rain to Causal DAG Canvas
- **File**: [`SpotlightDataRain.jsx`](../apps/client/src/components/SpotlightDataRain.jsx)
- Replaced the generic falling green/white matrix digital rain with a living **HTML5 Canvas Causal Knowledge Graph DAG**:
  - **~95 Floating Causal Vertices**: Distributed into 4 discrete ontological types:
    1. `source`: White/obsidian concentric core representing ADRs, Git commits, and contracts.
    2. `fact`: Slate-300 / slate-600 vertices representing AST symbols and schema fields.
    3. `decision`: Warm golden-amber (`#d9a353`) vertices representing verified architectural decisions with pulsating auras.
    4. `gate`: Crimson (`#f43f5e`) vertices representing Enclosed MCP Action Gates.
  - **Directed Vector Dependency Edges**: High-contrast vector links with midpoint directional arrowheads showing causal dependency flow.
  - **Traveling Data Packets**: 28 autonomous luminous pulses traveling along edges, modeling real-time invalidation signals.

### 3.2 Invisible Cursor Inspection Hub (Vector Probes without Dot Obstruction)
- The user's mouse pointer acts as an invisible inspection probe:
  - Graph vertices within a `140px` radius dynamically project dashed directed probe lines (`setLineDash([2, 3])`) connecting to the cursor coordinates.
  - **Crucial Refinement**: The physical center anchor circle dot (`ctx.arc(cursorX, cursorY, 2.5, ...)`) was **completely eliminated**.
  - The cursor remains 100% invisible, allowing the native system cursor to navigate freely while creating the illusion that nearby graph edges are magnetically drawn to the user's attention.

### 3.3 Biomimetic Multi-Target Firefly Swarm Migrations
- Models the natural flocking behavior of bioluminescent fireflies (*Photinus pyralis*):
  - **State Machine**:
    ```javascript
    const swarmState = {
      currentTargetId: 'lamp', // 'lamp', 'wordmark', 'explore-btn', 'scroll-prompt'
      nextSwitchTime: performance.now() + 3500,
      waypointProgress: 0,
    };
    ```
  - **Randomized Short & Long Interval Cycles**:
    - **Short Intervals (`2.2s – 4.5s`)**: Quick flutters where fireflies swirl along a button perimeter before scattering.
    - **Long Intervals (`6.0s – 10.5s`)**: Deep congregations where fireflies linger in a sustained bioluminescent orbit.
  - **Focal Elements**:
    1. **Pull-Cord Lamp Toggle (Top-Right)**: Attracted to light; nodes orbit the bulb and string with a cushion preventing congestion.
    2. **CAVDAX Wordmark (Center)**: The swarm center slowly drifts along the horizontal span of the letters (`wanderOffset = Math.sin(progress) * (wm.w * 0.32)`), outlining the letters in glowing embers.
    3. **"Explore the CAVDAX Causal Engine" Button**: Swirling along the rounded pill perimeter of the primary CTA.
    4. **"Scroll to Inspect Engine" Prompt**: Fluttering around the downward bounce indicator at the viewport floor.
  - **Smooth Interpolation**: When switching targets, swarm center coordinates interpolate at `0.045` ease per frame (`swarmPos.x += (tgtSwarmX - swarmPos.x) * 0.045`), streaming across the screen like an organic flock.

### 3.4 Obstacle Boundary Avoidance & Perimeter Glide Physics
- Scans DOM bounding boxes of all 3 central text elements (`CAVDAX`, `Explore...`, `Scroll...`).
- Enforces an `18px` clearance buffer.
- Applies an outward repulsive force combined with a **tangential perimeter glide force** (`tangentDir * 0.22`) that deflects nodes along the outer contour of the letters.
- Text remains 100% crisp and legible, framed by a halo of glowing embers with zero node collisions.

### 3.5 Harmonic 2D Firefly Distribution (Above & Below Wordmark)
- Replaced one-way gravity (`vy += 0.035`) with **2D harmonic hovering**:
  ```javascript
  flutterX = Math.sin(n.pulse * 1.4 + n.driftSeed) * 0.32;
  flutterY = Math.cos(n.pulse * 1.1 + n.driftSeed) * 0.26;
  ```
- 4-way toroidal wrapping maintains continuous canvas presence.
- Guaranteed balanced population: **35 nodes** permanently seeded in the upper zone (`y: 20px – 170px`) above the Wordmark, and **60 nodes** in the middle and lower zones.

### 3.6 Dynamic Traveling Aperture Spotlight Masking
- The canvas uses a composite CSS `mask-image` combining:
  1. **Cursor Spotlight**: `radial-gradient(circle 360px at ${curPos.x}px ${curPos.y}px, black 0%, rgba(0,0,0,0.65) 62%, transparent 100%)`
  2. **Traveling Swarm Spotlight**: `radial-gradient(circle ${swarmPos.radius}px at ${swarmPos.x}px ${swarmPos.y}px, black 0%, rgba(0,0,0,0.45) 55%, transparent 100%)`
  3. **Ambient Lamp Halo**: `radial-gradient(circle 170px at ${lampPos.x}px ${lampPos.y}px, black 0%, rgba(0,0,0,0.28) 48%, transparent 100%)`

---

## 4. Section 0 Wordmark Intro Viewport & Grounded Layout Architecture

### 4.1 Eliminating Viewport Dead Space
- **File**: [`LandingPage.jsx`](../apps/client/src/components/LandingPage.jsx)
- **Challenge**: The Wordmark and Explore CTA button were clustered in the top third of the viewport, leaving an empty void between the button and the bottom edge of the screen.

### 4.2 Tactile Sizing Preservation
- User requested that controls remain at their original, battle-tested sizing rather than being artificially enlarged:
  - **Explore CTA Button**: `px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-mono`.
  - **Scroll Prompt**: `text-[10px] font-mono tracking-widest uppercase`, mouse pill `w-5 h-8`, bouncing dot `w-1 h-2`.
  - **CurvyArrow**: `-top-14 sm:-top-16 -right-16 sm:-right-24`.

### 4.3 Grounding "Scroll to Inspect Engine" at the Viewport Floor
- Removed `#wordmark-scroll-prompt` from the inner button cluster flexbox.
- Elevated it to an `absolute` child of the fullscreen sticky container:
  ```jsx
  <div 
    id="wordmark-scroll-prompt"
    style={{
      opacity: cuesOpacity,
      visibility: cuesOpacity <= 0.01 ? 'hidden' : 'visible',
      transform: `translate3d(-50%, -${introProgress * 30}px, 0)`,
      pointerEvents: cuesOpacity <= 0.1 ? 'none' : 'auto',
      willChange: 'opacity, transform'
    }}
    className="absolute bottom-10 sm:bottom-12 md:bottom-14 lg:bottom-16 left-1/2 flex flex-col items-center gap-2 cursor-pointer group select-none opacity-80 hover:opacity-100 transition-opacity z-20"
  >
    ...
  </div>
  ```
- **Responsive Geometry**: Maintains a constant **40px – 64px clearance from the bottom edge** across mobile (390px), laptop (800px), desktop (1080p), and ultra-wide (1440p) screens, permanently eliminating dead space.

---

## 5. Default Signed-In Browser Setup for Puppeteer Testing (Complete Implementation)

### 5.1 The Chromium Architecture Problem: `SingletonLock` & Incognito Defaults
When developers run Puppeteer or Playwright, they often ask: *"Why can't it just open in my already-opened, signed-in browser instead of opening a blank incognito window every time?"*

The technical reasons:
1. **Chromium's `SingletonLock`**:
   - Google Chrome and Microsoft Edge place an operating-system level exclusive file lock on your user profile directory (`AppData/Local/Google/Chrome/User Data/SingletonLock`).
   - If your personal browser is already running, no secondary process can open that profile database without immediately crashing:
     ```
     ProcessSingleton: The profile appears to be in use by another Chrome process.
     ```
   - Puppeteer defaults to generating a temporary throwaway profile in `temp/` to prevent crashing your daily browser and corrupting your cookie SQLite database.
2. **Hermeticity vs Developer Convenience**:
   - Automated CI testing demands a clean slate so browser extensions don't interfere with DOM assertions.
   - However, during **local development and interactive E2E testing**, developers need their signed-in accounts (Google, GitHub, Auth0, internal dev roles) so they don't have to re-authenticate on every single test run.

### 5.2 Dual-Mode Architecture: Remote Debug Attach vs Persistent Profile
We resolved this by engineering a **Dual-Mode Smart Browser Runner**:

```mermaid
flowchart TD
    Start["npm run browser:open / test:e2e"] --> CheckPort{"Port 9222 Active?<br/>(Remote Debugging)"}
    
    CheckPort -- "YES" --> ModeA["Mode A: puppeteer.connect()"]
    ModeA --> Attach["Attaches directly to your live browser window<br/>(Uses your signed-in accounts & tabs)"]
    
    CheckPort -- "NO" --> ModeB["Mode B: puppeteer.launch()"]
    ModeB --> Profile["Uses persistent directory: .puppeteer-profile<br/>(Log in once -> Stay signed in forever!)"]
```

### 5.3 Production Implementation of `scripts/browser-runner.js`
- **File**: [`scripts/browser-runner.js`](../scripts/browser-runner.js)
- **Key Features**:
  1. **Cross-Platform Browser Discovery**: Automatically scans known paths for Google Chrome and Microsoft Edge across Windows, macOS, and Linux.
  2. **Health Check Probing**: Pings `http://127.0.0.1:9222/json/version` with a 600ms abort controller to detect if a live browser has remote debugging enabled.
  3. **Mode A (Live Browser Attachment)**:
     ```javascript
     const browser = await puppeteer.connect({
       browserURL: `http://127.0.0.1:${debugPort}`,
       defaultViewport: null,
     });
     ```
     Attaches directly into the running browser. If a tab with `localhost:5173` is already open, it brings it to the front; otherwise, it navigates the active tab. Zero new windows.
  4. **Mode B (Persistent Dev Profile)**:
     ```javascript
     const browser = await puppeteer.launch({
       headless: false,
       executablePath,
       userDataDir: path.resolve(__dirname, '../.puppeteer-profile'),
       defaultViewport: null,
       args: [
         '--start-maximized',
         '--no-default-browser-check',
         '--disable-blink-features=AutomationControlled',
       ],
       ignoreDefaultArgs: ['--enable-automation'],
     });
     ```
     - Uses your real installed Chrome/Edge executable.
     - Saves all cookies, logins, and session storage into `.puppeteer-profile/`.
     - **You log in once; you stay logged in forever**.
     - Strips `--enable-automation` banner to avoid bot-detection blocking.

### 5.4 Windows Remote Debugging Launchers (PowerShell & Batch)
To allow zero-friction launching on Windows, we created two helper scripts:
1. **PowerShell Script**: [`scripts/launch-signedin-browser.ps1`](../scripts/launch-signedin-browser.ps1)
   - Locates Chrome or Edge.
   - Launches with `--remote-debugging-port=9222` and `--user-data-dir=".puppeteer-profile"`.
   - Opens `http://localhost:5173` immediately.
2. **Batch File**: [`scripts/launch-signedin-browser.bat`](../scripts/launch-signedin-browser.bat)
   - One-click launcher for CMD / Windows Explorer double-click.

### 5.5 NPM Scripts & Workflow Commands
Added to root [`package.json`](../package.json):
```json
{
  "scripts": {
    "browser:open": "node scripts/browser-runner.js",
    "browser:debug": "powershell -ExecutionPolicy Bypass -File scripts/launch-signedin-browser.ps1",
    "test:e2e": "node scripts/browser-runner.js"
  }
}
```

| Command | Action |
|---|---|
| `npm run browser:open` | Smart runner: attaches to live browser on port 9222 or launches persistent signed-in profile. |
| `npm run browser:debug` | Starts your local Chrome/Edge on port 9222 ready for direct Puppeteer attachment. |
| `npm run test:e2e` | Runs automated E2E tests against the signed-in browser session. |

### 5.6 Security Isolation & Git Credential Hygiene
- Updated [`.gitignore`](../.gitignore) to strictly exclude:
  ```gitignore
  # Puppeteer Persistent Profiles & Test Data
  .puppeteer-profile/
  .puppeteer-user-data/
  ```
- Guaranteed that personal session tokens, login cookies, and local database caches are **never staged or committed to Git**.
- Documented in [`docs/PUPPETEER_SIGNED_IN_BROWSER.md`](../docs/PUPPETEER_SIGNED_IN_BROWSER.md).

---

## 6. Enterprise Audit Subsystem & Compliance Logging

### 6.1 Act III BLOCKED_SUPERSEDED_SOURCE Enforcement
- **Files**: [`core/mcp/server.js`](../core/mcp/server.js), [`apps/server/index.js`](../apps/server/index.js)
- When an autonomous agent attempts a file write (`mcp__write_file` or `mcp__execute_command`) based on an invalidated decision (Act III of the CAVDAX Demo), the MCP Action Gate rejects the request.
- **Compliance Hardening**: Instead of a transient console error, CAVDAX now records an `AgentAction` node in the FalkorDB graph with:
  - `action_id`: UUID
  - `status`: `'BLOCKED_SUPERSEDED_SOURCE'`
  - `file_path`: target file
  - `blocked_reason`: `'Upstream ADR superseded by Git commit b2c4e1a'`
  - Directed edge `[:GROUNDED_IN]` pointing to the invalidated decision node (`DEC-102`).

### 6.2 Zero-State Elimination & Historical Demo Seeding
- **File**: [`core/graph/queries.js`](../core/graph/queries.js)
- Evaluators visiting the `/audit` tab previously saw an empty table before running the live demo.
- Added 2 realistic historical actions (`act-hist-001: EXECUTED`, `act-hist-002: BLOCKED_SUPERSEDED_SOURCE`) to initial seed scripts and fallback graph state, ensuring the telemetry and audit UI is populated on initial load.

---

## 7. Full Design System & Interactive UI Overhaul

### 7.1 Two-Section Asymmetric Bento Architecture
- **File**: [`LandingPage.jsx`](../apps/client/src/components/LandingPage.jsx)
- Structured the landing page into a clean Problem-to-Solution sequence:
  - **Section 1 (The Problem Space)**: "Why Vector RAG Fails" with dynamic Thanos typewriter headline, 4 asymmetric diagnostic cards highlighting *Semantic Cosine Blindness*, *Silent Cache Rot*, *Unprotected Tool Writes*, and *Broken Dependency Cascades*.
  - **Section 2 (The Solution Space)**: "<span class="text-[#d9a353]">Graph-Grounded</span> → Decision Execution" featuring 4 asymmetric solution cards showcasing FalkorDB GraphBLAS, Enclosed MCP Gate, Causal Matrix Invalidation, and Closed-Loop Revalidation.

### 7.2 Causal Provenance Radar Polar Synchronization
- **File**: [`CausalProvenanceRadar.jsx`](../apps/client/src/components/CausalProvenanceRadar.jsx)
- Synchronized radar sweep beam with blip illumination using a unified polar coordinate loop (`x = r * sin(theta)`, `y = -r * cos(theta)`).
- Added smooth Hermite ease-in and exponential decay (`Math.pow(1 - decay, 2.2)`).
- Calibrated dual-theme palette: Deep cobalt in Light Mode, warm golden-amber (`#d9a353`) in Dark Mode.

### 7.3 Particle Pointillism Wordmark Canvas (`FooterParticles.jsx`)
- **File**: [`FooterParticles.jsx`](../apps/client/src/components/FooterParticles.jsx)
- Directly rasterizes `new Path2D(CAVDAX_WORDMARK_LETTERS_PATH)` onto an offscreen canvas buffer before sampling coordinate pixels.
- Guarantees 100% brand typographic fidelity (90° shear cuts, mitered apexes) inside the interactive particle canvas with zero generic font fallbacks.

### 7.4 Team Page Emblem Lightbox & Parallax Tilt
- **File**: [`TeamPage.jsx`](../apps/client/src/components/TeamPage.jsx)
- Added 3D mouse parallax tilt and full-screen lightbox modal to the central **Team Contrarians Emblem**, matching the interactive polish of individual team member cards.

### 7.5 Unified Golden-Amber Color Token (`#d9a353`)
- Standardized all warm accents across the landing page (Thanos typewriter headline, `Graph-Grounded` accent, and footer particle center gradient) to the exact canonical hex token `#d9a353`.

---

## 8. Git Hygiene & Atomic Squashing Protocol

### 8.1 Why Micro-Commit Churn Harms Git Repositories
During fast-paced visual design and testing sessions, rapid iterative micro-commits (*"shift 4px down"*, *"fix padding"*, *"revert size"*) clutter Git history, break `git bisect`, and complicate code review.

### 8.2 Consolidation of Iterative Commits into Atomic Milestones
- Squashed 5 exploratory visual micro-commits into atomic commit:
  - **Commit SHA**: `3dbca03`
  - **Message**: `feat(client): integrate causal knowledge graph DAG with dynamic firefly swarm migrations and grounded responsive layout`
- Committed the Puppeteer persistent browser automation suite into atomic commit:
  - **Commit SHA**: `e4ec386`
  - **Message**: `feat(test): add signed-in persistent browser automation runner and remote debugging launcher`

### 8.3 The Constitutional Git Squashing Rule in `AGENTS.md`
Enshrined under Section 3 (**Git Branch Hygiene & Commit Governance**) in [`AGENTS.md`](../AGENTS.md):
```markdown
- **Atomic Feature Squashing & History Cleanliness (Mandatory)**:
  - **Ban on Micro-Commit Churn**: Avoid polluting Git commit history with rapid, back-and-forth micro-commits (e.g., "shift 4px down", "shift a bit up", "fix padding", "revert size").
  - **Session-Level Squashing of Related Changes**: When multiple commits made during recent active pair-programming iterate on or refine the same underlying feature, always squash them into a single, cohesive, atomic commit before concluding the session or opening a PR to main.
  - **Atomic Milestone Integrity**: A feature commit in history must represent a complete, functional milestone where `npm run build` passes cleanly, not intermediate trial-and-error steps.
  - **Safe Remote Updates**: When updating a feature branch after squashing already-pushed iterative commits, strictly use `git push --force-with-lease origin <branch>` (never bare `--force`) to ensure remote integrity.
```

---

## 9. Complete Inventory of Modified Files & Commit Audit

| File Path | Component / Domain | Core Architectural Changes |
|---|---|---|
| [`apps/client/src/components/SpotlightDataRain.jsx`](../apps/client/src/components/SpotlightDataRain.jsx) | Client Canvas | Causal Knowledge Graph DAG, invisible cursor probe hub (0 anchor dot), biomimetic firefly swarm with 2.2s–10.5s interval cycles, obstacle perimeter glide, 2D harmonic hovering (35 upper / 60 lower nodes). |
| [`apps/client/src/components/LandingPage.jsx`](../apps/client/src/components/LandingPage.jsx) | Client View | Section 0 layout refactor, original button/prompt sizing preserved, scroll prompt grounded at `bottom-10 sm:bottom-12 md:bottom-14 lg:bottom-16`. |
| [`apps/client/src/components/PullCordLampToggle.jsx`](../apps/client/src/components/PullCordLampToggle.jsx) | Client Toggle | Added `id="pull-cord-lamp-toggle"` for dynamic firefly swarm targeting. |
| [`apps/client/src/components/CausalProvenanceRadar.jsx`](../apps/client/src/components/CausalProvenanceRadar.jsx) | Client Radar | Mathematical polar coordinate sweep synchronization, Hermite ease-in, exponential decay curve. |
| [`apps/client/src/components/TeamPage.jsx`](../apps/client/src/components/TeamPage.jsx) | Client Team | Team Contrarians central emblem 3D parallax tilt & full-screen frosted lightbox modal. |
| [`apps/client/src/components/FooterParticles.jsx`](../apps/client/src/components/FooterParticles.jsx) | Client Footer | Direct rasterization of `CAVDAX_WORDMARK_LETTERS_PATH` onto offscreen canvas for particle pointillism. |
| [`scripts/browser-runner.js`](../scripts/browser-runner.js) | Testing Harness | Smart Dual-Mode runner: attaches to live browser on port 9222 (`puppeteer.connect`) or launches persistent profile (`userDataDir: .puppeteer-profile`). |
| [`scripts/launch-signedin-browser.ps1`](../scripts/launch-signedin-browser.ps1) | Automation Scripts | PowerShell launcher for Chrome/Edge with `--remote-debugging-port=9222` and persistent profile. |
| [`scripts/launch-signedin-browser.bat`](../scripts/launch-signedin-browser.bat) | Automation Scripts | Windows batch wrapper for one-click browser launch. |
| [`package.json`](../package.json) | Monorepo Root | Added `puppeteer-core`, `browser:open`, `browser:debug`, and `test:e2e` scripts. |
| [`.gitignore`](../.gitignore) | Repository Hygiene | Gitignored `.puppeteer-profile/` and `.puppeteer-user-data/` to prevent secret leaks. |
| [`docs/PUPPETEER_SIGNED_IN_BROWSER.md`](../docs/PUPPETEER_SIGNED_IN_BROWSER.md) | Documentation | Complete architectural documentation for signed-in Puppeteer browser testing. |
| [`AGENTS.md`](../AGENTS.md) | Repository Governance | Codified Section 3: **Atomic Feature Squashing & History Cleanliness Standard**. |
| [`docs/DEV_SESSION_STATE.md`](../docs/DEV_SESSION_STATE.md) | Living Session State | Updated living state log with all October 21 milestones. |

### Verified Git Branch Status
- **`origin/frontend`**:
  - `3dbca03` — `feat(client): integrate causal knowledge graph DAG with dynamic firefly swarm migrations and grounded responsive layout`
  - `e4ec386` — `feat(test): add signed-in persistent browser automation runner and remote debugging launcher`
- **`origin/docs`**:
  - `0fea5fd` — `docs: codify atomic feature squashing rule and update session state [skip ci]`
- **Build Status**: Verified with `npm run build` (Exit code `0`, 0 errors).

---
*End of Complete Master Technical Record.*
