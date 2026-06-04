# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive, first-principles learning platform that rebuilds LayerTwo Labs
educational content for complete beginners. The first lesson, **"Create a
Sidechain Without Breaking Bitcoin,"** transforms Paul Sztorc's "Creating a
Sidechain" article into a guided 10-step simulator (slot grid, identity game,
miner-ACK timeline, activation, node connection, reflection quiz).

## Commands

```bash
npm install            # install deps
npm run dev            # Vite dev server at http://localhost:5173
npm run build          # tsc --noEmit type-check, then vite production build to dist/
npm run typecheck      # type-check only (no emit)
npm run preview        # serve the built dist/ locally
```

There is no test runner or linter configured yet. `npm run build` is the gate:
it type-checks the whole `src` tree under `strict` before bundling, so a green
build means types are sound. The Vite preview MCP launch config lives in
`.claude/launch.json` (server name `lesson-dev`).

## Architecture: content/engine split

The core design decision is that **all learner-facing content lives in data,
and components are dumb renderers**. This makes the lesson a reusable template:
a new lesson = a new data file + the same engine.

- **`src/data/lessonData.ts`** — the single source of truth for every word the
  learner sees: step copy, the four reflection questions + per-answer feedback,
  the glossary, address-byte tags, software releases, advanced topics, and
  source notes. Edit copy here, not in components. The exported `LessonData`
  type defines the content contract.

- **`src/state/`** — the lesson's entire interaction state.
  - `types.ts` — the `LessonState` shape, `LessonAction` union, defaults, and
    constants (`TOTAL_SLOTS=256`, `TOTAL_BLOCKS=2016`, threshold `1916 ≈ 95%`).
  - `lessonReducer.ts` — a **pure** reducer (no side effects; easy to test in
    isolation). All state transitions go through it.
  - `LessonProvider.tsx` — `useReducer` + React context + `localStorage`
    persistence (key `l2l:create-a-sidechain:v1`). Loading merges saved state
    over defaults, so adding a new state field never breaks existing progress.
    Access state anywhere via the `useLesson()` hook.

- **`src/components/`** — presentation only. Each interactive module reads
  `state` and dispatches actions; none holds its own progress state.
  - `LessonShell.tsx` is the top-level layout **and the step router**: its
    `StepRouter` maps each step's `kind` (`hook | principles | slot | identity
    | release | acks | activation | connect | quiz | advanced`) to the
    component that renders it. To add a step kind, add it to the `StepKind`
    union in `lessonData.ts` and a case here.
  - `StepFrame.tsx` enforces the lesson's pedagogy: every screen wears the same
    five beats (eyebrow · headline · explain · learner action · why-this-matters)
    and gates its Next button on a `canAdvance` prop, so the learner must
    complete the action before moving on.
  - Module components: `SlotGrid`, `AddressBytesGame`, `SoftwareReleaseSelector`,
    `AckTimeline`, `ActivationStateCard`, `NodeConnectionMap`, `ReflectionQuiz`,
    `AdvancedConceptLockbox`, plus `Hook` (hook + principles screens).
  - Shared primitives: `Term` (glossary-linked inline word — wrap every
    technical term in it), `Tooltip` (hover/focus/tap), `FactBadge`,
    `GlossaryDrawer`, `ProgressRail`, `SidechainProposalForm` (read-only recap
    reused across steps), `SourcesFooter`.

- **`src/styles/`** — `tokens.css` (dark theme + Bitcoin-orange design tokens,
  the single source for color/type/spacing) and `lesson.css` (component styles).
  No CSS framework; plain CSS custom properties.

## Non-negotiable conventions

These encode the project's editorial and accessibility rules. Preserve them.

- **Factual accuracy / no overclaiming.** Drivechain is a *proposed* Bitcoin
  soft fork (BIP300/BIP301); DriveNet and Testchain are LayerTwo Labs *testing*
  software — **never** describe any of this as live on Bitcoin mainnet. The
  `FactBadge` (driven by `lessonData.factBadge`) is a quiet **disclosure** present
  on every screen (a small ⓘ that opens the full disclaimer), and `SourcesFooter`
  carries the accuracy note. Keep this framing; keep the disclosure reachable on
  every screen.
- **Tone:** simple, concrete, respectful. No hype, no "crypto bro" or tribal
  Bitcoin language. Explain tradeoffs honestly.
- **One idea per screen**, mobile-first, no walls of text.
- **Accessibility is part of "done":** full keyboard operability (interactions
  are real buttons/sliders, not drag-only — the node map is click-to-connect);
  visible focus rings; **never signal state by color alone** (always pair an
  icon + text label); `aria-live` on changing values (ACK %, activation,
  feedback); honor `prefers-reduced-motion`; no tiny text (min body ≈ 0.95rem).
- **Don't teach the advanced layer here.** BIP300/301, hashrate escrow, and
  blind merged mining are named only as advanced topics (in
  `AdvancedConceptLockbox`), never explained in depth in this beginner lesson.
- **First principles lead; analogies are helpers.** Every teaching screen opens
  with the actual mechanism and the constraint that forces it. The analogy is an
  optional, labeled, skippable helper — never the explanation. See
  `docs/authoring/epistemic-depth.md`.
- **Interactives must be deep, not toys.** Each must let the learner do WHAT
  (the real procedure), HOW (the mechanism responds), WHY (probe a variable until
  it breaks, revealing the rationale), and HOW-WE-KNOW (tie to spec + a
  falsifier). An interactive that only does WHAT is shallow → redesign.
- **Analogy consistency.** Each lesson declares an `analogy` (world +
  term→element map; `src/state/analogy.ts`). Reuse the course "roads" world
  unless deliberately starting a new one. `npm run verify:analogy` (in `build`)
  bans cross-world words; an analogy-audit subagent reviews every lesson. See
  `docs/authoring/analogy-audit.md`.

## Process gates (run on every new/repurposed lesson)

Alongside the spec + code-quality reviews: **analogy audit** and
**epistemic-depth audit** subagents (prompts in `docs/authoring/`). The CI gates
`npm run verify:claims` and `npm run verify:analogy` run inside `npm run build`.

## Multi-lesson registry & verifiable claims

- Lessons are registered in `src/data/registry.ts` (`lessons` + `lessonsById`).
  Add a lesson by importing its `LessonData` and appending it; `LessonHome` and
  `App` routing pick it up automatically.
- Progress is namespaced per lesson: `localStorage` key
  `l2l:lesson:<id>:v<STORAGE_VERSION>` (see `LessonProvider`, which takes a
  `lessonId` prop).
- Every factual statement is a `VerifiableClaim` (`src/state/claims.ts`) with a
  source tier (DEV/DATA/INST/PRESS/PROJ/ANEC), sources, and a `verifiedOn` date.
  `npm run verify:claims` (wired into `build`) fails on unsourced/aged-out
  `verified` claims and warns on `needs-recheck`. Render claims with `<ClaimChip>`
  (used in `SourcesFooter`). Run tests with `npm test` (Vitest).
- Editorial guardrail still applies: Drivechain is a **proposed** soft fork; the
  current stack is the **Enforcer + BitWindow + Bitcoin Core** (DriveNet/mainchain
  deprecated). Numbers you can't confirm against a primary spec ship as
  `needs-recheck`, not as fact.

## Adding the next lesson

Copy `lessonData.ts`, swap the content (new `id`, `claims`, steps), and append
it to `lessons` in `src/data/registry.ts` — progress namespacing and the lesson
picker are automatic. Reuse the engine and components: step kinds that already
have renderers work for free; genuinely new interactions need a new component +
a `StepKind` case in `LessonShell`'s router.
