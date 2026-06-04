# Analogy-Audit System + Lesson #2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (A) Institutionalize analogy consistency as a declared-in-data, CI-enforced, agent-reviewed property; (B) repurpose `bitcoin-layers-map` into lesson #2, "Where Drivechain Sits Among Bitcoin's Layers," using the roads world (extended into the broader transport network where it adds value).

**Architecture:** Mirror the verifiable-claims pattern. Each lesson declares an `analogy` (a named "world" + a term→element map). A pure `auditAnalogy` module + a `verify:analogy` CI script catch cross-world metaphor words (e.g. "parking" in a roads lesson). An analogy-audit subagent becomes a standard review gate. Lesson #2 is a new `LessonData` registered in `registry.ts`, reusing existing step renderers plus one new `LayerMap` interactive.

**Tech Stack:** Vite + React 18 + TypeScript (strict), Vitest, plain CSS tokens. Branch: `feat/lesson2-and-analogy-audit`.

**Context the engineer needs:**
- Lessons are `LessonData` objects (`src/data/lessonData.ts` = lesson #1), registered in `src/data/registry.ts` (`lessons[]`). Each renders via `LessonShell` which routes `step.kind` → a component. Claims use `src/state/claims.ts` + `scripts/verify-claims.ts` (wired into `npm run build`). Tests: `npm test` (Vitest). Per-lesson progress is namespaced (`LessonProvider` takes `lessonId`).
- **Factual guardrail:** Drivechain = proposed soft fork, not live on mainnet; current stack = Enforcer + BitWindow + Bitcoin Core. For lesson #2, other layers are real and shipping (Lightning, Liquid, Ark, etc.) — cite real sources and use honest maturity/tradeoff framing; the `bitcoin-layers-map` source calls Drivechain "Layer 5," which is **editorial taxonomy, not protocol fact** — present it as such.
- **Analogy guardrail:** one analogy world per lesson; reuse the established "roads" world across the course unless deliberately starting fresh. Every technical term maps to exactly one element of the world.

---

# PART A — Analogy-audit system

### Task A1: `analogy` model + pure `auditAnalogy` (TDD)

**Files:** Create `src/state/analogy.ts`, `src/state/analogy.test.ts`.

- [ ] **Step 1: Failing tests** — `src/state/analogy.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { auditAnalogy, WORLD_BANNED, type LessonAnalogy } from './analogy'

const roads: LessonAnalogy = {
  world: 'roads',
  blurb: 'Bitcoin is the main road; sidechains are side roads.',
  mappings: [{ term: 'slot', element: 'a numbered highway exit' }],
}

describe('auditAnalogy', () => {
  it('passes when copy stays in-world', () => {
    const f = auditAnalogy(roads, [{ where: 'step.slot', text: 'A slot is a numbered exit on the highway.' }])
    expect(f).toEqual([])
  })
  it('flags a cross-world word (parking) in a roads lesson', () => {
    const f = auditAnalogy(roads, [{ where: 'step.slot', text: 'A slot is a parking space.' }])
    expect(f).toHaveLength(1)
    expect(f[0]).toMatchObject({ word: 'parking', where: 'step.slot' })
  })
  it('is case-insensitive and word-bounded (no false hit on "flooring" substring rules)', () => {
    const f = auditAnalogy(roads, [{ where: 'x', text: 'Park the idea: a FLOOR here.' }])
    expect(f.map((x) => x.word).sort()).toEqual(['floor'])
  })
  it('returns no findings for an unknown world (nothing to ban)', () => {
    const f = auditAnalogy({ world: 'space', blurb: '', mappings: [] }, [{ where: 'x', text: 'parking floor' }])
    expect(f).toEqual([])
  })
})

it('WORLD_BANNED.roads includes parking and floor', () => {
  expect(WORLD_BANNED.roads).toEqual(expect.arrayContaining(['parking', 'floor']))
})
```

- [ ] **Step 2: Run, confirm fail.** `npm test -- src/state/analogy.test.ts` → FAIL (no module).

- [ ] **Step 3: Implement `src/state/analogy.ts`:**
```ts
export interface AnalogyMapping {
  /** Technical term, e.g. 'slot'. */
  term: string
  /** What it maps to in the world, e.g. 'a numbered highway exit'. */
  element: string
}

export interface LessonAnalogy {
  /** The single root world, e.g. 'roads'. */
  world: string
  /** One-line framing of the world for the learner. */
  blurb: string
  mappings: AnalogyMapping[]
}

export interface AnalogyFinding {
  word: string
  where: string
}

/**
 * Words from OTHER analogy worlds that signal a mixed metaphor when they appear
 * inside a lesson of the given world. Keep conservative to avoid false positives;
 * extend per world as new lessons appear.
 */
export const WORLD_BANNED: Record<string, string[]> = {
  roads: [
    'parking', 'parked', 'floor', 'storey', 'staircase', 'elevator',
    'container', 'shelf', 'warehouse', 'building', 'rooftop',
  ],
}

/**
 * Scan lesson copy for banned cross-world words. Pure + word-bounded
 * (case-insensitive). Unknown worlds have no ban list → no findings.
 */
export function auditAnalogy(
  analogy: LessonAnalogy,
  texts: { where: string; text: string }[],
): AnalogyFinding[] {
  const banned = WORLD_BANNED[analogy.world] ?? []
  if (banned.length === 0) return []
  const findings: AnalogyFinding[] = []
  for (const { where, text } of texts) {
    for (const word of banned) {
      const re = new RegExp(`\\b${word}\\b`, 'i')
      if (re.test(text)) findings.push({ word, where })
    }
  }
  return findings
}
```

- [ ] **Step 4: Run, confirm pass.** `npm test -- src/state/analogy.test.ts` → PASS.
- [ ] **Step 5: Commit.** `git add src/state/analogy.ts src/state/analogy.test.ts && git commit -m "feat: add analogy model and pure auditAnalogy"`

### Task A2: Add `analogy` to `LessonData` + declare lesson #1's roads map

**Files:** Modify `src/data/lessonData.ts`.

- [ ] **Step 1** Add import: `import type { LessonAnalogy } from '../state/analogy'`. Add `analogy: LessonAnalogy` to `interface LessonData` (near `claims`).
- [ ] **Step 2** Add to the lesson #1 object (after `claims`):
```ts
  analogy: {
    world: 'roads',
    blurb: 'Bitcoin is the main road; a sidechain is a side road that joins it at a numbered exit.',
    mappings: [
      { term: 'Bitcoin', element: 'the main road / highway everyone shares' },
      { term: 'sidechain', element: 'a separate side road built next to the main road' },
      { term: 'slot', element: 'a reserved, numbered highway exit where a side road can connect' },
      { term: 'deposit / withdrawal', element: 'traffic moving on and off the highway via that exit' },
      { term: 'miner ACKs', element: 'the highway authority repeatedly voting to open the exit' },
      { term: 'activation', element: 'the exit officially opening to traffic' },
    ],
  },
```
- [ ] **Step 3** Build: `npm run build` (type-check must pass; analogy field now required by the interface).
- [ ] **Step 4** Commit: `git add src/data/lessonData.ts && git commit -m "feat: declare lesson #1 roads analogy map"`

### Task A3: `verify:analogy` CI gate (TDD via the helper)

**Files:** Create `scripts/verify-analogy.ts`; modify `package.json`.

- [ ] **Step 1** Create `scripts/verify-analogy.ts`:
```ts
// Run with: npx tsx scripts/verify-analogy.ts
// Exits 1 if any lesson's copy uses a cross-world metaphor word. CI gate.
import { lessons } from '../src/data/registry'
import { auditAnalogy } from '../src/state/analogy'

let problems = 0
for (const lesson of lessons) {
  if (!lesson.analogy) continue
  const texts: { where: string; text: string }[] = []
  lesson.steps.forEach((s, i) => {
    texts.push({ where: `step[${i}].headline`, text: s.headline })
    texts.push({ where: `step[${i}].explain`, text: s.explain })
    texts.push({ where: `step[${i}].why`, text: s.why })
    ;(s.body ?? []).forEach((b, j) => texts.push({ where: `step[${i}].body[${j}]`, text: b }))
  })
  lesson.glossary.forEach((g) =>
    texts.push({ where: `glossary.${g.id}`, text: `${g.short} ${g.example ?? ''}` }),
  )
  const findings = auditAnalogy(lesson.analogy, texts)
  for (const f of findings) {
    problems++
    console.error(`✗ [${lesson.id}] cross-world word "${f.word}" (world=${lesson.analogy.world}) at ${f.where}`)
  }
}
if (problems > 0) {
  console.error(`\n${problems} analogy problem(s) found.`)
  process.exit(1)
}
console.log('✓ all lessons analogy-consistent')
```
- [ ] **Step 2** Wire into `package.json`: add `"verify:analogy": "tsx scripts/verify-analogy.ts"` and chain into build:
`"build": "tsc --noEmit && npm run verify:claims && npm run verify:analogy && vite build"`.
- [ ] **Step 3** Run `npm run verify:analogy` → expect `✓ all lessons analogy-consistent` (lesson #1 is parking-free). If it fails, a stray cross-world word remains — fix the copy, do not weaken the ban list.
- [ ] **Step 4** Regression proof: temporarily change one lesson #1 line to include "parking", run `npm run verify:analogy`, confirm it FAILS and names the location, then revert.
- [ ] **Step 5** Commit: `git add scripts/verify-analogy.ts package.json package-lock.json && git commit -m "feat: add verify-analogy CI gate"`

### Task A4: Document the analogy audit as process

**Files:** Create `docs/authoring/analogy-audit.md`; modify `CLAUDE.md`.

- [ ] **Step 1** Create `docs/authoring/analogy-audit.md` with: the rule (one world per lesson; reuse the course world unless deliberately new), the declared-`analogy` requirement, how `verify:analogy` works + how to extend `WORLD_BANNED`, and the **analogy-audit subagent prompt** (a reviewer that reads a lesson's copy against its declared `analogy.mappings`, infers strained/unmapped metaphors a wordlist can't catch, and reports findings — to be run as a gate on every new/repurposed lesson alongside spec + quality review).
- [ ] **Step 2** In `CLAUDE.md`, under conventions, add: "**Analogy consistency** — every lesson declares an `analogy` (world + term→element map). Reuse the course 'roads' world unless starting a new world on purpose. `npm run verify:analogy` (in `build`) bans cross-world words; an analogy-audit subagent reviews every new lesson. See `docs/authoring/analogy-audit.md`."
- [ ] **Step 3** Commit: `git add docs/authoring/analogy-audit.md CLAUDE.md && git commit -m "docs: document analogy-audit process"`

---

# PART B — Lesson #2: "Where Drivechain Sits Among Bitcoin's Layers"

Source: `/Users/dalia/projects/bitcoin-sovereign-academy/interactive-demos/bitcoin-layers-map/index.html` (read for content/tradeoffs; do NOT copy markup — reauthor into `LessonData`).

**Root analogy (roads → transport network):** Bitcoin L1 = the main highway. Layers = different ways to travel it, anchored to the one highway. Lightning = express lanes for fast cheap frequent trips; Liquid = a members-only toll road for big cargo; Drivechain sidechains = side roads off numbered exits (from lesson #1); Ark = a shared shuttle that batches riders; rollups/BitVM = a chartered bus that posts its route back. Use a transport element only when it genuinely clarifies; otherwise stay on plain roads.

### Task B1: Lesson #2 data file

**Files:** Create `src/data/lessons/layers-map.ts`. Test: `src/data/lessons/layers-map.test.ts`.

- [ ] **Step 1** Create `src/data/lessons/layers-map.ts` exporting `const layersMapLesson: LessonData` with:
  - `id: 'where-drivechain-sits'`, `summary`, `audience: 'beginner'`, `tags: ['layer2','drivechain','lightning','liquid','sidechains']`, `estMinutes: 10`, `prerequisites: ['create-a-sidechain']`.
  - `analogy`: world `'roads'`, blurb framing the transport network, mappings for Bitcoin/Lightning/Liquid/Drivechain-sidechain/Ark/rollups.
  - `factBadge`: same proposed-not-live guardrail, noting only Drivechain is proposed (others are live, with varying maturity).
  - `steps` (reuse existing `StepKind`s where possible): `hook` (the highway + ways to travel), `principles` (why one road can't serve every trip → layers), a `layers` step (new kind — see B3) to explore the map, a focused step on where Drivechain sits + its honest tradeoffs vs neighbors, `quiz`, `advanced`.
  - `claims[]`: real, sourced, dated — e.g. Lightning (instant low-fee payment channels), Liquid (federated sidechain, 15-of-x), Drivechain (proposed BIP300/301), with sources (lightning.network, Blockstream Liquid docs, layertwolabs/drivechain.info, the layers-map's own cited links). Use tiers DEV/PROJ/PRESS appropriately; flag anything uncertain `needs-recheck`. Do NOT assert "Layer 5" as fact — frame as editorial.
  - `glossary[]`, `sources[]`, `advanced{}` per the existing shape.
- [ ] **Step 2** Test `src/data/lessons/layers-map.test.ts`: asserts the lesson has `analogy.world === 'roads'`, ≥4 claims each with ≥1 source, `prerequisites` includes `'create-a-sidechain'`, and that `auditAnalogy` returns no findings on its copy (import `auditAnalogy` and feed step/glossary text).
- [ ] **Step 3** Run the test → iterate copy until analogy-clean and assertions pass.
- [ ] **Step 4** Commit.

### Task B2: Register lesson #2

**Files:** Modify `src/data/registry.ts`.
- [ ] **Step 1** Import `layersMapLesson` and append to `lessons`. Update `registry.test.ts` expectation (≥2 lessons; both ids unique; lesson #2's prerequisite resolves).
- [ ] **Step 2** `npm run build` + `npm test` → pass. The lesson home now shows both lessons. Commit.

### Task B3: `LayerMap` interactive component + `layers` step kind

**Files:** Create `src/components/LayerMap.tsx`; modify `src/data/lessonData.ts`'s `StepKind` union add `'layers'`; modify `src/components/LessonShell.tsx` router to render `LayerMap` for `kind==='layers'`; add styles to `src/styles/lesson.css`.

- [ ] **Step 1** Add `'layers'` to the `StepKind` union (in `lessonData.ts`).
- [ ] **Step 2** Create `LayerMap.tsx`: renders a keyboard-navigable grid of layer cards (data sourced from the lesson #2 data — define a `layers` array on that lesson or pass via step). Each card: layer name, its road/transport metaphor, one honest tradeoff, and a maturity tag (text + icon, not color-only). Clicking a card reveals detail; selecting the Drivechain card satisfies `canAdvance`. Follow the a11y conventions of existing components (buttons, aria-labels, `Term` tooltips).
- [ ] **Step 3** Wire the router case in `LessonShell.tsx` (mirror an existing case, e.g. `slot`).
- [ ] **Step 4** Styles + `npm run build` + visual check via preview. Commit.

### Task B4: Quality gates on lesson #2

- [ ] **Step 1** `npm run build` (claims + analogy gates must pass for BOTH lessons), `npm test` (all pass).
- [ ] **Step 2** Run the **analogy-audit subagent** (per `docs/authoring/analogy-audit.md`) on lesson #2's copy → address any strained metaphor the wordlist can't catch.
- [ ] **Step 3** Run `design:accessibility-review` on `LayerMap` + the lesson; fix AA issues.
- [ ] **Step 4** Commit any fixes.

---

## Self-review notes
- **Part A is independently shippable** (analogy system + retro lesson #1) even if Part B slips — could be its own PR.
- **Spec coverage:** analogy data field (A2), CI guard (A1/A3), agent gate + docs (A4), retro lesson #1 (A2/A3); lesson #2 data + registry + new interactive + gates (B1–B4). Roads-extended-to-transport analogy honored in B1's `analogy` + copy.
- **Type consistency:** `LessonAnalogy`/`AnalogyMapping`/`AnalogyFinding` defined in A1, used in A2/A3/B1; `auditAnalogy` signature stable across script + tests.
- **Honest flags:** "Layer 5" stays editorial, not asserted; uncertain per-protocol facts ship `needs-recheck`; `WORLD_BANNED` is intentionally conservative (extend as worlds grow) — the agent gate covers what the wordlist misses.
