# AGENTS.md

Operational constitution, architecture standards, and safety governance for AI coding agents (Antigravity, Claude Code, Cursor, Copilot, OpenCode) working in the **CAVDAX** repository.

---

## 1. Absolute Inviolable Guardrails (Read First)

1. **NEVER Commit Credentials, Secrets, or Sensitive Identifiers**:
   - **Zero Credentials in Git**: Never stage or commit API keys, auth tokens, passwords, private keys, connection strings, or cloud secrets.
   - **Never Commit `.env` / `.env.*` Files**: Only `.env.example` with harmless placeholders (`your_key_here`) may be tracked.
   - **Never Hardcode Secrets in Source**: Access keys exclusively via runtime environment variables (`import.meta.env.VITE_*`, `process.env.*`).
   - **Enforcement**: Run a staged secret scan before any commit. If a hook or pattern matches credentials, unstage, redact, and verify before proceeding.

2. **Zero False Claims & Accurate Concept Framing**:
   - Clearly frame hackathon projects as **concepts, prototypes, and research architectures**.
   - Never claim unauthorized official affiliations, state endorsements, or partnerships with real institutions, corporations, or government bodies unless legally contracted.
   - Replace real institutional names with generic examples (e.g. `Example Municipal Grid`, `Sample CSR Sponsor`) on public surfaces.
   - Never claim to hold or move live third-party financial escrow funds unless operating in a sandbox test mode.

3. **Mandatory Pull Before Every Working Session**:
   - **Always pull before starting**: Before inspecting files, editing code, starting dev servers, or planning tasks, run `git pull` (or `git pull --rebase`) on your active branch.
   - Stale working copies cause design regressions and merge collisions. Sync local git state first, read `docs/DEV_SESSION_STATE.md`, and only then begin work.

4. **UTF-8 Encoding & Mojibake Prevention**:
   - All repository files are **UTF-8 without BOM**.
   - Never read, edit, or save files using Windows-1252, Latin-1, or system default encodings.
   - Maintain non-ASCII characters intact (Devanagari, Ol Chiki, em dashes `—`, box drawing characters).
   - Verify touched files for mojibake or C1 control characters (`U+0080–U+009F`) before completing tasks:
     ```bash
     grep -P "[\x80-\x9f]" <file> && echo "MOJIBAKE DETECTED"
     ```

---

## 2. The Mandatory UI/UX Pre-Flight Interceptor Loop

Whenever your current task touches, modifies, refactors, or creates ANY user interface component, style, page, or layout, **YOU MUST EXECUTE THIS MANDATORY INTERCEPTOR LOOP BEFORE WRITING ANY CODE**:

```
[UI/UX Task Triggered]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│  STEP 1: Read & Reconcile with UI_DESIGN_SYSTEM.md     │
│  • Check tokens, typography, radii, spacing, physics   │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│  STEP 2: The Inviolable Ban Audit                      │
│  • Are there any emojis? (🟢, 🔴, ⚠️, 🤖, ✨) ➔ BAN    │
│  • Are there Gemini / AI sparkles? ➔ BAN               │
│  • Are there colored status orbs / pulsing dots? ➔ BAN │
│  • Are there bracketed tags? ([LIVE], [VERIFIED])➔ BAN │
│  • Are there generic shield SVGs? (Shield) ➔ BAN       │
│  • Are there cliché icons? (Rocket, Bot, Trophy) ➔ BAN │
│  • Are there hackathon track tags / pills? ➔ BAN       │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│  STEP 3: Interaction, Motion, Cursors & Audio          │
│  • Segmented tabs using static CSS swaps?              │
│    ➔ Replace with Framer Motion <motion.div layoutId>  │
│  • Are custom SVG cursors wired from public/cursors/?  │
│    ➔ Copy from sister projects or prompt user          │
│  • Are subtle click sounds wired from public/sounds/?  │
│    ➔ Copy click.mp3 or synthesize via Web Audio API    │
│  • Is Lenis smooth inertial scroll mounted?            │
│    ➔ Verify root instance, RAF guard, data-lenis-prevent│
│  • Are spring physics snappy? (stiffness 420, damp 34) │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│  STEP 4: Layout Stability, Mobile & Responsive Audit   │
│  • Is this a public page (Landing / Team)?             │
│    ➔ Ensure NO guided tours are mounted                │
│  • Is there any "lone pair" / dangling element?        │
│  • Does desktop fit without overflow-y (HP Victus)?   │
│  • Mobile view (< 768px):                              │
│    - Snap pagination: 2-3 logical sections per slide   │
│    - Portfolio dock pattern: bottom dock consolidation │
│    - Mobile bottom nav: max 5 tabs + FAB               │
│    - Safe area inset protection: pb-[env(safe-area...)]│
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
             [Proceed to Implement UI]
```

### Pre-Flight Verification Checklist:
1. **Did I read `docs/UI_DESIGN_SYSTEM.md`?** Reconcile all class names, spacing tokens, and color palettes against the design system.
2. **Are there any emojis or sparkles?** Replace them immediately with clean Lucide line icons.
3. **Are there bracketed status tags?** Remove brackets (e.g., convert `[VERIFIED]` to `VERIFIED` with unbracketed monospace styling).
4. **Are there generic shield SVGs or cliché icons?**
   - Strictly ban generic shields (`Shield`, `ShieldCheck`, `ShieldAlert`, `ShieldQuestion`).
   - Use precision domain alternatives:
     - Alerts Navigation & Header: `<Bell />`
     - Critical Danger Alerts: `<Radio />` (active real-time emergency broadcast)
     - Live Sensor Telemetry Alerts: `<Activity />`
     - Imminent Hazard Popups: `<AlertTriangle />`
     - All Clear / Nominal State: `<CheckCircle2 />`
     - Auth & Credentials: `<Lock />` or `<KeyRound />`
     - Safe Routes: `<Route />`, `<Navigation2 />`, or `<Compass />`
   - Ban cliché icons: `Rocket`, `Bot`, `Lightbulb`, `Trophy`. Use `ArrowUpRight`, `Terminal`, `Cpu`, `TrendingUp`, `BarChart3`.
5. **Are segmented tabs using static CSS background swaps?** Replace with `<motion.div layoutId="uniqueDomainPill" />` using critically damped springs (`stiffness: 420, damping: 34`).
6. **Are custom SVG cursors included?**
   - Verify `public/cursors/` contains `default_cursor.svg`, `hand-pointer.svg`, `cover_hand_grab.svg`, `resize-*.svg`.
   - If missing, copy or synthesize them.
7. **Are subtle click sounds wired via `soundFx.js`?**
   - Verify `public/sounds/` contains `click.mp3` or Web Audio API procedural chime synthesis.
   - Verify low-latency Audio Pool, volume control (`0.30 - 0.35`), and `localStorage` mute toggle (`cavdax_sounds_muted`).
8. **Is Lenis smooth scroll installed and configured?**
   - Verify RAF loop only steps when `scrollHeight > innerHeight + 10` (power-saving guard).
   - Ensure modals, maps, and inner scrollbars have `data-lenis-prevent`.
9. **Are cards using bouncy zoom (`hover:scale-105`) or border-width swaps?** Replace with subtle `-translate-y-0.5` lift, specular highlight brightening, and constant 1px border thickness.
10. **Is body text multi-line centered?** Left-align body copy (`text-left`); center only short single-line subheaders.
11. **Is typography using the architectural standard?** `Inter` or `Geist Sans` with `tracking-tight` for titles, and `JetBrains Mono` or `Geist Mono` with `tabular-nums` for badges/metadata.
12. **Is this a public page (Landing `/` or Team `/team`)?** Ensure NO guided tours or tour buttons are mounted.
13. **Is there any "lone pair" element?** Ensure every control sits in a balanced, symmetrical container.
14. **Is there unnecessary desktop `overflow-y`?** Ensure panels expand with adequate headroom and zero unwanted scrollbars on standard laptop screens.
15. **Is mobile snap pagination applied for dense sections?** Use `snap-y snap-mandatory` with 2–3 logical sections per slide.
16. **Are mobile category tabs/controls consolidated?** Apply the portfolio bottom-dock pattern with the `<head>` anti-FOUC script.
17. **Is the mobile bottom navigation bar adhering to standards?** Max 5 destinations with symmetrical 2+1+2 layout, prominent centered raised FAB, safe area inset padding, unmounted on auth/landing/team pages.
18. **Are sibling action buttons symmetrical?** Sibling action buttons must share identical heights, border radii, and font metrics.

---

## 3. Git Branch Hygiene & Commit Governance

- **Never work directly on `main`**: `main` is the integration and production-truth branch.
- **Dedicated Branch Structure**:
  - `frontend`: Exclusively for client UI/UX code (`apps/client/`).
  - `backend`: Exclusively for API, database, and MCP services (`core/`, `apps/server/`, `infra/`).
  - `docs`: Exclusively for documentation files (`docs/`, `AGENTS.md`, `README.md`).
- **Developer Approval Required for `main` Merge**:
  - Always commit and push on feature branches first.
  - Never merge to `main` without explicit developer verification.
- **Conventional Commit Standard**:
  - Use conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `test:`, `chore:`.
  - Add `[skip ci]` to documentation/backend commits that do not trigger frontend builds.

---

## 4. Multi-Language Parity Rules (When Applicable)

1. **No Pseudo-Translations**: Never write literal transliterations, phonetic approximations, or word-for-word dictionary swaps.
2. **Key Parity**: Any new key added to translation dictionaries must exist synchronously across all configured language files.
3. **Monochrome Validation Indicators**: Form asterisks (`*`) and required tokens must follow monochromatic styling (`text-slate-400 dark:text-slate-500`).
4. **Brand Names Intact**: Keep official brand names (`CAVDAX`, `FalkorDB`, `GraphBLAS`, `MCP`) untranslated in Latin characters.

---

## 5. Session State & Working Memory (`docs/DEV_SESSION_STATE.md`)

- **Single Source of Truth**: At the conclusion of each task or milestone batch, update `docs/DEV_SESSION_STATE.md`.
- **Detail Captured**:
  - Completed items and verified test runs.
  - Active in-progress files.
  - Uncommitted local states.
  - Pending follow-up backlog items.
- Always read `docs/DEV_SESSION_STATE.md` at the start of a conversation to resume without context loss.

---

## 6. Reference Architecture Codebases & Curated UI Resource Matrix

### 6.1 Production Sister Projects
> [!NOTE]
> *(Notice for External Developers: The local machine paths below are historical references for developer Suneet Chugh whose workstation contains these codebases. External developers will not have these local paths and should substitute their own project roots or prompt the user).*

- **DOAB**: `c:\Users\krish\OneDrive\Desktop\(All_&_Everything)\(All-Hackathons)\WeMakeDevs\DOAB-Codebase`
- **SAHNIRMAAN**: `C:\Users\krish\OneDrive\Desktop\(All_&_Everything)\(All-Hackathons)\Z++ Done\(SAHNIRMAAN)`
- **SWATVA**: `c:\Users\krish\OneDrive\Desktop\(All_&_Everything)\(All-Hackathons)\Z++ Done\(SWATVA)`

### 6.2 Curated External UI/UX Engineering Registries
> [!IMPORTANT]
> **Developer Self-Verification Directive**: Prefer extracting core CSS/Tailwind tokens and Framer Motion spring physics directly into repository primitives over pulling heavy external dependencies (the Ponytail principle).

- **ElevenLabs UI**: [ElevenLabs UI](https://ui.elevenlabs.io/) (Conversational AI & audio waveform patterns)
- **Prompt-Kit**: [Prompt-Kit](https://www.prompt-kit.com/) (LLM prompt inputs, context pills & reasoning traces)
- **RetroUI**: [RetroUI Primitives](https://retro-ui.basecase.site/components) (Tactile brutalist interface primitives)
- **21st.dev**: [React Components](https://21st.dev/) (Curated open-source React/Tailwind component directory)

---

## 7. The Ruthless Mentor & LLM Council Framework

When asked for architectural review, design choices, or feature feasibility:
- **Direct, Honest & Specific**: Prioritize truth over polite agreement.
- **Stress-Test Every Plan**: Evaluate assumptions, operational risks, failure modes, latency tradeoffs, and edge cases.
- **Socratic Inquiry**: Ask hard questions before rushing into code solutions.
- **Minimalist Interventions**: Provide the smallest set of high-leverage changes that makes the idea actually work.

---

## 8. The Ponytail Principle (Zero Overengineering)

- Never add bloated libraries or external state containers when native Web APIs, lightweight React hooks, or simple CSS suffice.
- Inline SVGs with hardware-accelerated CSS keyframes beat heavy JavaScript canvas or runtime animation frameworks for brand logos.
- Sparse matrix causal graph queries beat complex distributed vector databases for deterministic reasoning invalidation.

---

## 9. Project Naming Architecture (Functional Descriptive Acronyms)

- **CAVDAX**: **C**ontextual **A**ction & **V**erified **D**ecision **A**utonomous e**X**ecution.
  - Eliminating Silent Cache Rot in AI Coding Agents via FalkorDB GraphBLAS & Model Context Protocol.

---

## 10. The Canonical `docs/` Architectural Repository & The 6 Context Files

Every AI coding agent must treat the **6 Canonical Context Files** as the persistent, immutable source of truth:

| Canonical File | Purpose & Architectural Boundary | Question Answered | Standard Location |
| :--- | :--- | :--- | :--- |
| **`PRD.md`** | Problem scope, user personas & boundary conditions | *WHAT are we building?* | `docs/PRD.md` |
| **`ARCHITECTURE.md`** | System topology, multi-layer data flow & contracts | *HOW is the system structured?* | `docs/ARCHITECTURE.md` |
| **`AGENTS.md`** | AI behavioral constitution, guardrails & branching laws | *WHAT should AI do / NOT do?* | Repository Root (`AGENTS.md`) |
| **`PHASES.md`** | Phased milestone roadmap with test verification checkpoints | *IN WHAT ORDER should we build?* | `docs/PHASES.md` |
| **`UI_DESIGN_SYSTEM.md`** | Design tokens, color system, motion physics & audio | *HOW should the product look and feel?* | `docs/UI_DESIGN_SYSTEM.md` |
| **`DEV_SESSION_STATE.md`** | Living record of architectural decisions & commit batches | *WHAT has already been decided/built?* | `docs/DEV_SESSION_STATE.md` |

- **Strict Source of Truth**: Before proposing changes, introducing new abstractions, or writing components, the agent must reconcile against `PRD.md`, `ARCHITECTURE.md`, `PHASES.md`, and `UI_DESIGN_SYSTEM.md`. Never invent rogue patterns or unaligned styling.
- **All Documentation Lives in `docs/`**: Only operational governance documents (`AGENTS.md`, `README.md`) live at root; all other specifications live inside `docs/`.

---

## 11. Data Sovereignty & State Storage Contract (LocalStorage vs. Account-Synced)

- **Device-Scoped State (`localStorage` ONLY)**:
  - Hardware & performance engine choices (`cavdax_map_engine`, reduced motion overrides, particle canvas toggles).
  - Device audio ergonomics (`cavdax_sounds_muted`, `cavdax_click_sound` — never follow cross-device account sync).
  - Local display settings (`preferredTheme`, `preferredLanguage`).
  - First-time onboarding/tour completion flags (`cavdax_tour_seen`).
  - Ephemeral offline incident logs and telemetry caches.
- **Account-Scoped State (Database / Cloud Synced)**:
  - User identity, credentials, cryptographic tokens, and verified email.
  - Operational role (`role`: 'engineer' | 'auditor' | 'agent'), model provider configurations.
  - Incident logs, endorsements, audit trail logs, and historical transactions.
- **The Inviolable Logout Retention Rule**:
  - On logout: Clear session tokens, auth credentials, and account profiles.
  - **NEVER wipe device-scoped keys** (`theme`, `preferredTheme`, `cavdax_sounds_muted`, or reduced-motion toggles).

---

## 12. Continuous Security Posture & Vulnerability Hunting (`vibe-guard` & `Agentic-Bug-Hunter`)

1. **Zero-Trust Input & Parameter Validation**:
   - Never trust client-supplied input, query parameters, or localStorage values without schema validation or sanitization.
   - Enforce type guards and bounds checks on numeric inputs.
2. **Authorization & IDOR / BOLA Prevention**:
   - Verify that data retrieval and update operations always check authorized role privileges over the requested resource ID.
   - Enforce authorization at API boundaries, not just client-side toggles.
3. **Secret Leakage & Token Exfiltration Defense (Vibe-Guard)**:
   - Scrutinize network requests, console logs, and client bundles to guarantee API keys, auth headers, private keys, or internal endpoints are never exposed.
   - Staged secret scanning before every Git commit is mandatory.
4. **Injection Vector Hardening**:
   - Neutralize XSS vectors: never use `dangerouslySetInnerHTML` with unsanitized user or external feed strings.
   - Neutralize Cypher/SQL/NoSQL injection: use parameterized queries and ORM binding exclusively.
