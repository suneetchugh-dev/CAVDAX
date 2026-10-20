# CAVDAX: UI & Visual Design System Specification (`UI_DESIGN_SYSTEM.md`)

> **Project**: CAVDAX (Contextual Action & Verified Decision Autonomous eXecution)  
> **Challenge**: WeMakeDevs × FalkorDB Graph Hacks (*Context for AI Agents*)  
> **Repository**: `GraphHacks-Hackathon/Codebase`  
> **Status**: Inviolable Design Standard • Production Source of Truth

---

## 1. Top-Priority Inviolable Anti-Slop Bans (Mandatory Across All Surfaces)

1. **STRICT BAN ON ALL EMOJIS**:
   - Absolutely NO Unicode emojis anywhere on surfaces, code, titles, buttons, labels, toasts, tooltips, cards, console logs, or documentation (no 🟢, 🔴, 🟡, 🔵, ⚠️, 🤖, ✨, 🚀, 💡, 🛡️, etc.).
   - Every visual indicator and action must use clean, minimalist line icons from a professional icon library (Lucide React).

2. **STRICT BAN ON GEMINI / AI SPARKLES & RAINBOW POP**:
   - Strictly ban the `Sparkles` icon, starry gradients, rainbow sweeps, neon blur halos, and speculative "AI magic" visual tropes.
   - Represent AI cognition, autonomous agent state, or graph verification using semantic minimalist iconography: `Cpu`, `Activity`, `Terminal`, `Compass`, or the bespoke `CavdaxAgentStateIndicator`.

3. **STRICT BAN ON COLOURED STATUS ORBS & PULSING DOTS**:
   - Strictly ban animated pinging dots (`animate-ping`), pulsing green/red/amber status spheres, and glowing circular markers.
   - Status indicators must use crisp, monochromatic or executive-calibrated unbracketed monospace typography (e.g., `LIVE`, `STANDBY`, `REASONING`, `EXECUTING`, `VERIFIED`, `REJECTED`, `OFFLINE`).

4. **STRICT BAN ON BRACKETED TAGS (`[...]`)**:
   - NEVER enclose status tags, labels, or telemetry indicators inside brackets (e.g., banned: `[LIVE]`, `[VERIFIED]`, `[ALERT]`, `[ACT 3]`, `[ZONE]`).
   - Approved standard: Render clean, unbracketed text with monospace styling:
     ```jsx
     <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
       VERIFIED
     </span>
     ```

5. **STRICT BAN ON HACKATHON TRACK PILLS / SPONSOR TAGS**:
   - NEVER inject hackathon track identifiers or sponsor tags (e.g., `Track 02: Graph Hacks • FalkorDB`) onto public UI surfaces. Headers, hero sections, and navigation bars must remain immaculately clean, professional, and product-focused.

6. **STRICT BAN ON GUIDED TOURS ON PUBLIC OVERVIEW PAGES**:
   - NEVER mount, render, or trigger Guided Tours or tour trigger buttons on public landing or overview pages. Guided tours are strictly reserved for operational consoles and interactive workspaces (the live graph canvas, terminal execution view, and inspector).

7. **FAST, TACTILE KINETIC PHYSICS (100ms - 180ms)**:
   - UI state transitions must feel snappy, instant, and tactile. Never implement sluggish, floaty 400ms+ animations for theme switches, dropdowns, or tab selections. Micro-interactions must complete within 100ms to 180ms with high-performance easing curves.

8. **MANDATORY SHARED-LAYOUT SLIDING PILLS**:
   - NEVER use static CSS background swaps or jump-cuts for active states in tabs, segmented controls, or mode switchers.
   - Implement smooth sliding pills with snappy spring physics (`stiffness: 420, damping: 34`).

9. **STRICT BAN ON GENERIC SHIELD SVGs & TOYISH SECURITY BADGES**:
   - NEVER use generic shield icons (`Shield`, `ShieldCheck`, `ShieldAlert`, `ShieldQuestion`, or toyish antivirus/security badge SVGs) across navigation, routing, telemetry, cards, or security/verification indicators.
   - **CAVDAX Operational Icon Mapping Standard**:
     - **Alerts Navigation & Header**: Use `<Bell />` or `<Radio />`.
     - **Critical Hard Rejections**: Use `<AlertTriangle />` or `<XCircle />` with Garnet Rose calibration.
     - **Verified Causal Token**: Use `<CheckCircle2 />` with Forest Teal / Emerald calibration.
     - **Live Cognitive Telemetry**: Use `<Activity />` or `<Cpu />`.
     - **Tool Gate & Interceptor**: Use `<Terminal />`, `<KeyRound />`, or `<Lock />`.
     - **Graph Traversal & Routing**: Use `<Compass />`, `<GitBranch />`, or `<Share2 />`.

10. **STRICT BAN ON CLICHÉ AI ICONOGRAPHY**:
    - NEVER use `Rocket` (cliché launch/deploy), `Bot` or antenna robots (childish AI), `Lightbulb` (PowerPoint ideas), or `Trophy`/`Crown` (toyish gamification).
    - Use precision alternatives: `ArrowUpRight`, `Play`, `Terminal`, `Cpu`, `Layers`, `TrendingUp`, `BarChart3`.

11. **STRICT BAN ON BORDER INJECTION & BOUNCY ZOOM JUMPS**:
    - NEVER use `hover:scale-105` or `scale-110` on cards (causes text blurring and GPU re-rasterization).
    - NEVER change border thickness on hover (`hover:border-2` or adding borders where none existed) — this causes an intolerable 1px layout jitter across sibling elements.
    - Use subtle `-translate-y-0.5` lift, specular highlight brightening, or `outline` / `box-shadow: inset` instead.

12. **STRICT BAN ON MULTI-LINE CENTERED BODY PROSE**:
    - NEVER apply `text-center` across multi-line paragraphs (> 2 lines). It destroys visual eye-tracking. Left-align body copy (`text-left`) and center only short single-line subheaders.

13. **STRICT BAN ON AMBIENT BLOB BLUR OVERKILL**:
    - Ban giant, saturated `blur-3xl` gradient circles that cause GPU frame drops on mobile devices. Background depth must be achieved with fine CSS hairlines, subtle noise, or targeted linear gradients.

---

## 2. Palette & Contrast Architecture (Pitch-Black Obsidian Void)

The CAVDAX interface operates in an executive obsidian cybernetic void, designed for continuous operational monitoring with surgical accent illumination:

| Semantic Role | Token / Hex | Tailwind Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#060709` | `bg-[#060709]` | Pitch-black foundational void |
| **Card / Panel Void** | `#0B0D11` | `bg-[#0B0D11]` | Elevated operational container |
| **Double-Bezel Inner** | `#11141B` | `bg-[#11141B]` | Tactical inner panel inset |
| **Hairline Border** | `#1E293B` | `border-[#1E293B]` | Surgical 1px structural framing |
| **Specular Border** | `rgba(255,255,255,0.12)` | `border-white/10` | Subtle specular highlight |
| **Primary Text** | `#F1F5F9` | `text-slate-100` | High-contrast technical copy |
| **Muted Metadata** | `#94A3B8` | `text-slate-400` | Secondary telemetry and labels |
| **Faint Dim** | `#64748B` | `text-slate-500` | Structural dividers & timestamps |

### Executive Severity Palette (Surgical Accents)
- **Critical / Hard Reject**: Deep Garnet Rose (`bg-rose-500/10 text-rose-400 border-rose-500/20`).
- **High / Invalidation Warning**: Warm Copper Amber (`bg-amber-500/10 text-amber-400 border-amber-500/20`).
- **Active Traversal / Cyan**: Electric Cyan (`bg-cyan-500/10 text-cyan-400 border-cyan-500/20`).
- **Verified / Clean Causal**: Forest Emerald (`bg-emerald-500/10 text-emerald-400 border-emerald-500/20`).
- **Monochromatic Form Indicators**: Form asterisks (`*`) and required tokens inside inputs and cards must strictly follow the monochromatic design standard (`text-slate-400 dark:text-slate-500`), never alarming bright red.

---

## 3. Premium Architectural Typography Standard

- **Primary Sans Hierarchy**: `Inter` with `tracking-tight` on headings (`text-2xl font-bold tracking-tight`) and `text-sm leading-relaxed` on body.
- **Dense Technical Monospace**: `Fira Code` / `JetBrains Mono` for telemetry, coordinates, metadata, Cypher queries, and status badges (`text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider tabular-nums`).
- **Brand Logotype**: Swiss Architectural Modernist Sans-Serif (monoline bold weight, 90° flat orthogonal cuts on curved letterforms, razor-sharp mitered apexes on diagonals).
- Google Fonts contract preloaded in `index.html`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  ```

---

## 4. Component Elevation & Double-Bezel Geometry

- **Double-Bezel Architecture**: 1px inner sub-container inside parent card (`bg-[#0B0D11] rounded-xl border border-[#1E293B]`) containing child container (`bg-[#11141B] rounded-lg border border-white/5 p-3`) for tactile depth.
- **Constant 1px Border Thickness**: Maintain exact 1px border width across all idle, hover, and active states. Brighten border opacity on hover instead of increasing width (`hover:border-cyan-500/40`).
- **Kinetic Lift**: Subtle `-translate-y-0.5` lift on hover paired with specular highlight brightening.
- **Button-in-Button Contrast**: Action buttons inside interactive cards must maintain distinct tactile background contrast against the parent container.

---

## 5. Motion Physics & Snappy Transitions

- **Physics Calibration**: Transitions strictly calibrated between 100ms and 180ms (`transition-all duration-150 ease-out`).
- **Zero Overshoot**: Never use bouncy cartoonish overshoot springs on operational navigation.
- **CSS Kinetic Implementation**:
  ```css
  .tactile-btn {
    transition: transform 120ms cubic-bezier(0.16, 1, 0.3, 1), 
                background-color 120ms ease-out, 
                border-color 120ms ease-out;
  }
  .tactile-btn:hover {
    transform: translateY(-1px);
  }
  .tactile-btn:active {
    transform: translateY(0.5px);
  }
  ```

---

## 6. Layout Stability & Desktop Overflow Elimination

- **Scoped `scrollbar-gutter: stable`**: Eliminate Cumulative Layout Shift (CLS) when dynamic terminal logs or validation errors appear.
- **Desktop Viewport Headroom (1536x864 Standard)**: CAVDAX workspace is engineered to fill 100vh cleanly (`h-screen overflow-hidden flex flex-col`). Outer page scrollbars are completely eliminated; scrolling is strictly confined to discrete inner panels (Terminal log stream and Graph Canvas).
- **"No Lone Pair" Rule**: Never leave isolated controls or dangling buttons. Every control sits in a balanced, symmetrical container.

---

## 7. Custom SVG Cursor Integration Pipeline

> [!NOTE]
> **Notice on Local Paths & Cursor Assets**:
> The auto-copy source path (`c:\Users\krish\OneDrive\Desktop\(All_&_Everything)\(All-Hackathons)\WeMakeDevs\DOAB-Codebase\public\cursors\`) is available locally for developer Suneet Chugh. Other developers referencing this repository should provide custom SVG cursors or rely on fallback CSS cursors.

- Cursors loaded from `apps/client/public/cursors/`:
  - `default_cursor.svg` (crisp angled precision arrow)
  - `hand-pointer.svg` (interactive element hover)
  - `cover_hand_grab.svg` (canvas pan / draggable surfaces)
  - `resize-*.svg` (panel resizers)
- CSS Rules defined in `src/index.css`:
  ```css
  html, body, canvas {
    cursor: url('/cursors/default_cursor.svg') 6 3, default;
  }
  a, button, [role="button"], select, label, .cursor-pointer {
    cursor: url('/cursors/hand-pointer.svg') 10 2, pointer !important;
  }
  .cursor-grab {
    cursor: url('/cursors/cover_hand_grab.svg') 12 8, grab !important;
  }
  .cursor-grabbing, .cursor-grab:active {
    cursor: url('/cursors/cover_hand_grab.svg') 12 8, grabbing !important;
  }
  ```

---

## 8. Inertial Scroll & Scoped Container Hygiene

- On inner scroll containers (Terminal, Node Inspector), scroll behavior uses smooth hardware acceleration with `-webkit-overflow-scrolling: touch`.
- Custom cyber glass scrollbar styling:
  ```css
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0B0D11; }
  ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #06B6D4; }
  ```

---

## 9. Mobile Viewport & Responsive Ergonomics (< 768px)

- Below 768px, the split view (Graph Canvas + Terminal) collapses into a stacked layout or dedicated tab switcher (`CANVAS` vs `TERMINAL`).
- **Safe Area Inset Protection**: Apply `pb-[max(0.6rem,env(safe-area-inset-bottom))]` across all bottom sheets and docks to protect against Android gesture bars and iOS Home bars.

---

## 10. Interactive Multi-Phase Audio Synthesizer

- **Web Audio API Procedural Synthesis**: Generate crisp, zero-latency tactile audio feedback (clicks at 800Hz–1200Hz, alerts, mode switches) programmatically without relying exclusively on external `.mp3` assets.
- **Audio Pool Fallback**: Pre-buffered `HTMLAudioElement` pool (`/sounds/click.mp3`) with instant reuse.
- **Mute Persistence**: State saved to `localStorage.getItem('cavdax_sounds_muted')`.
- Global Mute Toggle button placed cleanly in the Header.

---

## 11. Interactive Workspace Guided Tour Engine (Operational Consoles Only)

- **Fullscreen SVG Mask Backdrop**: `<mask id="workspace-tour-mask">` with smooth gliding spotlight cutout coordinates (`getBoundingClientRect()`).
- **Collision-Aware Popover Card**:
  - Dimensions: `max-w-[360px]`, `p-4`, double-bezel styling with obsidian card background.
  - Auto-flipping: Clamped to viewport edges (`Math.max(16, Math.min(vw - cardWidth - 16, left))`).
  - Monospace step badge: `STEP 1 OF 4`.
  - Keyboard shortcuts: `[←] Prev  [→ / ↵] Next  [Esc] Exit`.
- **Trigger Strategy**:
  - Auto-triggers on first visit via `localStorage.getItem('cavdax.tour.completed')`.
  - Manual relaunch button in Header (`Compass` / `HelpCircle` icon).

---

## 12. Monospace Portal Tooltips with Viewport Boundary Clamping

- Tooltips render into `document.body` via React Portal (`createPortal`) at `z-[99999]`.
- Strict screen clamping: Tooltips will never overflow left, right, top, or bottom edges of the viewport.
- Monospace styling: `text-[10px] font-mono uppercase font-bold tracking-tight bg-slate-950 text-white border border-white/20`.

---

## 13. Monochromatic Brand Identity Architecture

- **`CavdaxBrandLoader`**:
  - 4.2-second infinite loop with 3-node ignition, 90° flat orthogonal cuts, center pivot node, and razor-sharp mitered chevron apex.
- **`CavdaxWordmark`**:
  - All-caps Swiss architectural typography with integrated C-to-X directed causal arrow underline.
- **`CavdaxAgentStateIndicator`**:
  - Vertex Mitosis HUD rendering five crisp cognitive states (`idle`, `reasoning`, `executing`, `verified`, `rejected`).
