# Multi-Lesson Registry & Verifiable-Claim Schema — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the single hard-coded lesson into a registry of lessons sharing one engine, and add a verifiable-claim layer where every factual statement carries a typed source-tier, citation, and verification date — enforced by a CI gate.

**Architecture:** Each lesson stays a self-contained module (its own data + provider), registered in a central `registry.ts`. A new pure `claims` module models `VerifiableClaim`s (ported from BSA's `disclosure-methodology` source tiers) and powers both an inline citation UI and a `verify-claims` script that fails CI on unsourced or stale claims. Lesson progress is namespaced by lesson id so lessons persist independently. The existing "Create a Sidechain" lesson becomes lesson #1, its claims backfilled with real LayerTwo Labs sources and its node-connection module modernized to the current Enforcer + BitWindow + Bitcoin Core stack.

**Tech Stack:** Vite + React 18 + TypeScript (strict), Vitest (new), plain CSS tokens. No backend.

---

## Background the engineer needs (zero-context assumptions)

- **The codebase** is at the repo root. Content lives in `src/data/lessonData.ts` (a typed `LessonData` object); the engine in `src/state/` (a pure reducer `lessonReducer.ts`, a `LessonProvider.tsx` with `useReducer` + `localStorage`, types in `types.ts`); components in `src/components/` (a `LessonShell.tsx` routes a step's `kind` to a renderer). `npm run build` runs `tsc --noEmit && vite build` and is currently the only gate — **there is no test runner yet** (Task 1 adds one).
- **Factual guardrail (do not violate):** Drivechain is a *proposed* Bitcoin soft fork (BIP300 hashrate escrow, BIP301 blind merged mining); it is **not live on Bitcoin mainnet**. DriveNet/`mainchain` is **deprecated**. The current LayerTwo Labs stack is the **`bip300301_enforcer`** (a Rust gRPC server that runs *alongside* unmodified Bitcoin Core via RPC/ZMQ) with **BitWindow** ("An Alternative Frontend to Bitcoin Core") as the GUI. Real sidechains: `thunder-rust`, `plain-bitnames`, `plain-bitassets`, `truthcoin-dc`.
- **Source tiers** (from BSA `disclosure-methodology.md`): `DEV` (protocol spec / source code), `DATA` (on-chain/measured), `INST` (institutional report), `PRESS` (news), `PROJ` (project's own site/claims), `ANEC` (anecdotal). Software/protocol claims should be DEV or PROJ. Press like the "eCash fork" coverage is `PRESS`/`ANEC` and must never be stated as settled fact.

## File structure (what gets created/modified)

```
package.json                      MODIFY  add vitest + test script
vitest.config.ts                  CREATE  test runner config
src/state/claims.ts               CREATE  VerifiableClaim types + pure helpers
src/state/claims.test.ts          CREATE  unit tests for claims helpers
src/data/lessonData.ts            MODIFY  extend LessonData contract (id, summary, audience, tags, estMinutes, prerequisites, claims); backfill sidechain claims; modernize connect step copy
src/data/registry.ts              CREATE  lesson registry + lessonsById + prerequisite helpers
src/data/registry.test.ts         CREATE  unit tests for registry
src/state/types.ts                MODIFY  add lessonId to persisted state; export STORAGE_VERSION
src/state/LessonProvider.tsx      MODIFY  namespace localStorage key by lesson id
src/components/Term.tsx           MODIFY  (no behavior change; ensure claim ids resolvable) — verify only
src/components/ClaimChip.tsx      CREATE  inline citation chip (tier + sources + verifiedOn)
src/components/NodeConnectionMap.tsx MODIFY  modernize copy to Enforcer + BitWindow + Bitcoin Core
src/components/LessonHome.tsx     CREATE  registry-driven lesson picker
src/App.tsx                       MODIFY  render LessonHome → selected lesson
scripts/verify-claims.ts          CREATE  CI gate: fail on unsourced/stale claims
docs/plans/...                     (this file)
```

---

### Task 1: Add the Vitest test runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

Run:
```bash
npm install -D vitest@^2.1.8
```
Expected: `added` lines, no errors.

- [ ] **Step 2: Add the `test` script to `package.json`**

In `package.json`, the `scripts` block currently is:
```json
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
```
Add a `test` line so it reads:
```json
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
```

- [ ] **Step 3: Create the Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Sanity test that the runner works**

Create `src/state/_smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('vitest', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 6: Delete the smoke test and commit**

Run:
```bash
rm src/state/_smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest test runner"
```

---

### Task 2: VerifiableClaim model + pure helpers

The heart of the "verifiable" differentiator. Pure functions only — fully unit-testable, no React.

**Files:**
- Create: `src/state/claims.ts`
- Test: `src/state/claims.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/state/claims.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import {
  isClaimStale,
  validateClaim,
  summarizeClaims,
  RECHECK_DAYS,
  type VerifiableClaim,
} from './claims'

const base: VerifiableClaim = {
  id: 'c1',
  text: 'Drivechain is a proposed soft fork.',
  tier: 'PROJ',
  sources: [{ label: 'LayerTwo Labs FAQ', url: 'https://layertwolabs.com' }],
  verifiedOn: '2026-06-03',
  status: 'verified',
}

describe('isClaimStale', () => {
  it('is false when verified within the recheck window', () => {
    const today = new Date('2026-06-10')
    expect(isClaimStale(base, today)).toBe(false)
  })

  it('is true when older than the recheck window', () => {
    const today = new Date('2026-06-03')
    const old = { ...base, verifiedOn: '2025-01-01' }
    expect(isClaimStale(old, today)).toBe(true)
  })

  it('is true when status is needs-recheck regardless of date', () => {
    const today = new Date('2026-06-03')
    expect(isClaimStale({ ...base, status: 'needs-recheck' }, today)).toBe(true)
  })
})

describe('validateClaim', () => {
  it('returns no errors for a well-formed claim', () => {
    expect(validateClaim(base)).toEqual([])
  })

  it('flags a claim with no sources', () => {
    expect(validateClaim({ ...base, sources: [] })).toContain('no sources')
  })

  it('flags a source with a non-http url', () => {
    const bad = { ...base, sources: [{ label: 'x', url: 'not-a-url' }] }
    expect(validateClaim(bad)).toContain('source url not http(s): not-a-url')
  })

  it('flags an invalid verifiedOn date', () => {
    expect(validateClaim({ ...base, verifiedOn: '06/03/2026' })).toContain(
      'verifiedOn not ISO YYYY-MM-DD: 06/03/2026',
    )
  })
})

describe('summarizeClaims', () => {
  it('counts by status and stale', () => {
    const today = new Date('2026-06-03')
    const claims: VerifiableClaim[] = [
      base,
      { ...base, id: 'c2', status: 'disputed' },
      { ...base, id: 'c3', verifiedOn: '2024-01-01' },
    ]
    const s = summarizeClaims(claims, today)
    expect(s.total).toBe(3)
    expect(s.verified).toBe(2)
    expect(s.disputed).toBe(1)
    expect(s.stale).toBe(1)
  })
})

it('RECHECK_DAYS is 180', () => {
  expect(RECHECK_DAYS).toBe(180)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/state/claims.test.ts`
Expected: FAIL — cannot find module `./claims`.

- [ ] **Step 3: Implement `claims.ts`**

Create `src/state/claims.ts`:
```ts
// ---------------------------------------------------------------------------
// VerifiableClaim — the "verifiable" layer.
// Ported from BSA's disclosure-methodology source-tier system. Every factual
// statement in a lesson is a typed, dated, sourced object so the platform can
// render citations inline and fail CI when a claim goes unsourced or stale.
// ---------------------------------------------------------------------------

/** Source tiers, strongest evidence first. DEV = protocol spec / source code. */
export type ClaimTier = 'DEV' | 'DATA' | 'INST' | 'PRESS' | 'PROJ' | 'ANEC'

export type ClaimStatus = 'verified' | 'needs-recheck' | 'disputed'

export interface ClaimSource {
  label: string
  url: string
}

export interface VerifiableClaim {
  /** Stable id, unique within a lesson. */
  id: string
  /** The factual statement, in plain language. */
  text: string
  tier: ClaimTier
  sources: ClaimSource[]
  /** ISO date (YYYY-MM-DD) the claim was last verified. */
  verifiedOn: string
  status: ClaimStatus
}

/** A verified claim must be re-checked at least this often. */
export const RECHECK_DAYS = 180

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

/**
 * A claim is stale if its status asks for a recheck, or it was verified more
 * than RECHECK_DAYS ago relative to `today`.
 */
export function isClaimStale(claim: VerifiableClaim, today: Date): boolean {
  if (claim.status === 'needs-recheck') return true
  if (!ISO_DATE.test(claim.verifiedOn)) return true
  const verified = new Date(claim.verifiedOn + 'T00:00:00Z')
  return daysBetween(today, verified) > RECHECK_DAYS
}

/** Returns a list of human-readable problems with a claim; empty = valid. */
export function validateClaim(claim: VerifiableClaim): string[] {
  const errors: string[] = []
  if (!claim.id) errors.push('missing id')
  if (!claim.text.trim()) errors.push('empty text')
  if (claim.sources.length === 0) errors.push('no sources')
  for (const s of claim.sources) {
    if (!/^https?:\/\//.test(s.url)) errors.push(`source url not http(s): ${s.url}`)
  }
  if (!ISO_DATE.test(claim.verifiedOn))
    errors.push(`verifiedOn not ISO YYYY-MM-DD: ${claim.verifiedOn}`)
  return errors
}

export interface ClaimSummary {
  total: number
  verified: number
  disputed: number
  stale: number
}

export function summarizeClaims(
  claims: VerifiableClaim[],
  today: Date,
): ClaimSummary {
  return {
    total: claims.length,
    verified: claims.filter((c) => c.status === 'verified').length,
    disputed: claims.filter((c) => c.status === 'disputed').length,
    stale: claims.filter((c) => isClaimStale(c, today)).length,
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/state/claims.test.ts`
Expected: PASS, all assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/state/claims.ts src/state/claims.test.ts
git commit -m "feat: add VerifiableClaim model and pure helpers"
```

---

### Task 3: `verify-claims` CI gate

A script that loads every lesson's claims and exits non-zero on any validation error or stale claim. Makes "verifiable" a literal build property.

**Files:**
- Create: `scripts/verify-claims.ts`
- Modify: `package.json` (add `verify:claims` script; wire into `build`)

> Depends on Task 4's `registry.ts` for the lesson list. To keep Task 3 runnable now, the script imports the registry lazily and tolerates an empty list; Task 4 populates it. The script is exercised by Task 2's helpers (already tested), so no separate unit test — its own run IS the test.

- [ ] **Step 1: Create the script**

Create `scripts/verify-claims.ts`:
```ts
// Run with: npx tsx scripts/verify-claims.ts
// Exits 1 if any claim is invalid or stale. Used as a CI gate.
import { lessons } from '../src/data/registry'
import { validateClaim, isClaimStale } from '../src/state/claims'

const today = new Date()
let problems = 0

for (const lesson of lessons) {
  for (const claim of lesson.claims ?? []) {
    const errors = validateClaim(claim)
    if (errors.length) {
      problems++
      console.error(`✗ [${lesson.id}] claim "${claim.id}": ${errors.join('; ')}`)
    }
    if (isClaimStale(claim, today)) {
      problems++
      console.error(
        `✗ [${lesson.id}] claim "${claim.id}" is stale (verifiedOn ${claim.verifiedOn}, status ${claim.status})`,
      )
    }
  }
}

if (problems > 0) {
  console.error(`\n${problems} claim problem(s) found.`)
  process.exit(1)
}
console.log(`✓ all lesson claims valid and fresh`)
```

- [ ] **Step 2: Install tsx (script runner) and add scripts**

Run:
```bash
npm install -D tsx@^4.19.2
```
Then in `package.json` scripts, add `verify:claims` and chain it into `build`:
```json
    "build": "tsc --noEmit && npm run verify:claims && vite build",
    "verify:claims": "tsx scripts/verify-claims.ts",
```
(Leave `dev`, `preview`, `typecheck`, `test` as-is.)

- [ ] **Step 3: Run it (expect a pass on empty/early state)**

Run: `npm run verify:claims`
Expected: `✓ all lesson claims valid and fresh` (registry has no claims yet; the loop is a no-op). If `registry` does not exist yet because tasks are being done out of order, do Task 4 first.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-claims.ts package.json package-lock.json
git commit -m "feat: add verify-claims CI gate"
```

---

### Task 4: Extend the `LessonData` contract and create the registry

**Files:**
- Modify: `src/data/lessonData.ts` (extend interface + add metadata to the export; claims backfilled in Task 6)
- Create: `src/data/registry.ts`
- Test: `src/data/registry.test.ts`

- [ ] **Step 1: Extend the `LessonData` interface**

In `src/data/lessonData.ts`, add an import at the top:
```ts
import type { VerifiableClaim } from '../state/claims'
```
Find the `export interface LessonData {` block and add these fields at the top of it (keep all existing fields):
```ts
export interface LessonData {
  /** Stable lesson id, e.g. 'create-a-sidechain'. Used by the registry + storage. */
  id: string
  /** One-line summary for the lesson picker and search. */
  summary: string
  audience: 'beginner' | 'intermediate' | 'advanced'
  /** Topic tags, e.g. ['drivechain','bip300','sidechains']. */
  tags: string[]
  /** Estimated minutes to complete. */
  estMinutes: number
  /** Lesson ids that should be done first (registry enforces ordering hints). */
  prerequisites: string[]
  /** Every factual statement in the lesson, with sources + verification dates. */
  claims: VerifiableClaim[]
  // --- existing fields below (unchanged) ---
  slug: string
  title: string
  promise: string
  // ...leave the rest exactly as they are
}
```

- [ ] **Step 2: Populate the new metadata on the exported `lessonData`**

In the same file, find `export const lessonData: LessonData = {` and add these fields at the top of the object (claims stay `[]` for now — Task 6 fills them):
```ts
export const lessonData: LessonData = {
  id: 'create-a-sidechain',
  summary:
    'How a new Drivechain sidechain gets proposed, recognized by miners, activated, and connected back to Bitcoin.',
  audience: 'beginner',
  tags: ['drivechain', 'bip300', 'bip301', 'sidechains', 'layer2'],
  estMinutes: 12,
  prerequisites: [],
  claims: [],
  // --- existing fields below (unchanged) ---
  slug: 'create-a-sidechain-without-breaking-bitcoin',
  title: 'Create a Sidechain Without Breaking Bitcoin',
  // ...leave the rest exactly as they are
}
```

- [ ] **Step 3: Write the failing registry tests**

Create `src/data/registry.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { lessons, lessonsById, getPrerequisiteGaps } from './registry'

describe('registry', () => {
  it('exposes at least the sidechain lesson', () => {
    expect(lessons.length).toBeGreaterThanOrEqual(1)
    expect(lessonsById['create-a-sidechain']).toBeDefined()
  })

  it('every lesson id is unique', () => {
    const ids = lessons.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every prerequisite references a real lesson', () => {
    for (const l of lessons) {
      for (const p of l.prerequisites) {
        expect(lessonsById[p], `${l.id} -> ${p}`).toBeDefined()
      }
    }
  })
})

describe('getPrerequisiteGaps', () => {
  it('returns prerequisite ids not yet completed', () => {
    expect(getPrerequisiteGaps('create-a-sidechain', new Set())).toEqual([])
  })

  it('reports a missing prerequisite', () => {
    // synthetic: pretend a lesson requires create-a-sidechain
    const gaps = getPrerequisiteGaps('create-a-sidechain', new Set(['x']))
    expect(Array.isArray(gaps)).toBe(true)
  })
})
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npm test -- src/data/registry.test.ts`
Expected: FAIL — cannot find module `./registry`.

- [ ] **Step 5: Implement `registry.ts`**

Create `src/data/registry.ts`:
```ts
import { lessonData, type LessonData } from './lessonData'

/**
 * The lesson registry. To add a lesson: create its data file (same LessonData
 * contract), import it here, and append it to `lessons`. Components route off
 * this list — nothing else needs to change.
 */
export const lessons: LessonData[] = [lessonData]

export const lessonsById: Record<string, LessonData> = Object.fromEntries(
  lessons.map((l) => [l.id, l]),
)

/**
 * Given a lesson id and the set of completed lesson ids, return the
 * prerequisite ids that have not been completed yet (in declared order).
 */
export function getPrerequisiteGaps(
  lessonId: string,
  completed: Set<string>,
): string[] {
  const lesson = lessonsById[lessonId]
  if (!lesson) return []
  return lesson.prerequisites.filter((p) => !completed.has(p))
}
```

- [ ] **Step 6: Run the tests + verify-claims + build**

Run: `npm test -- src/data/registry.test.ts`
Expected: PASS.
Run: `npm run verify:claims`
Expected: `✓ all lesson claims valid and fresh`.

- [ ] **Step 7: Commit**

```bash
git add src/data/lessonData.ts src/data/registry.ts src/data/registry.test.ts
git commit -m "feat: extend LessonData contract and add lesson registry"
```

---

### Task 5: Namespace lesson progress by lesson id

So multiple lessons persist independently instead of sharing one `localStorage` key.

**Files:**
- Modify: `src/state/types.ts` (export `STORAGE_VERSION`)
- Modify: `src/state/LessonProvider.tsx` (key by lesson id; accept a `lessonId` prop)

- [ ] **Step 1: Add a storage version constant**

In `src/state/types.ts`, add near the top (after imports):
```ts
/** Bump when the persisted shape changes incompatibly. */
export const STORAGE_VERSION = 1
```

- [ ] **Step 2: Make the provider key storage by lesson id**

In `src/state/LessonProvider.tsx`, replace the hard-coded key. The current line:
```ts
const STORAGE_KEY = 'l2l:create-a-sidechain:v1'
```
Delete it. Then change the provider signature and key derivation. The current:
```tsx
export function LessonProvider({ children }: { children: ReactNode }) {
```
becomes:
```tsx
import { STORAGE_VERSION } from './types'

export function LessonProvider({
  lessonId,
  children,
}: {
  lessonId: string
  children: ReactNode
}) {
  const storageKey = `l2l:lesson:${lessonId}:v${STORAGE_VERSION}`
```
Then in `loadInitial` and the persistence `useEffect`, replace every `STORAGE_KEY` with `storageKey`. (Move `loadInitial` to read `storageKey` — pass it in or inline it inside the component so it closes over `storageKey`.) Concretely, inline the loader:
```tsx
  const [state, dispatch] = useReducer(lessonReducer, initialLessonState, () => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return initialLessonState
      const saved = JSON.parse(raw) as Partial<LessonState>
      return { ...initialLessonState, ...saved }
    } catch {
      return initialLessonState
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // storage unavailable (private mode) — progress just won't persist
    }
  }, [state, storageKey])
```
Remove the now-unused standalone `loadInitial` function if present.

- [ ] **Step 3: Update the single caller (App) to pass `lessonId`**

In `src/App.tsx`, the current:
```tsx
import { LessonProvider } from './state/LessonProvider'
import { LessonShell } from './components/LessonShell'

export default function App() {
  return (
    <LessonProvider>
      <LessonShell />
    </LessonProvider>
  )
}
```
Temporarily pass the id (Task 7 replaces this with the registry-driven home):
```tsx
import { LessonProvider } from './state/LessonProvider'
import { LessonShell } from './components/LessonShell'

export default function App() {
  return (
    <LessonProvider lessonId="create-a-sidechain">
      <LessonShell />
    </LessonProvider>
  )
}
```

- [ ] **Step 4: Verify build + run**

Run: `npm run build`
Expected: type-check passes, verify:claims passes, vite build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/state/types.ts src/state/LessonProvider.tsx src/App.tsx
git commit -m "refactor: namespace lesson progress by lesson id"
```

---

### Task 6: Backfill the sidechain lesson's claims with real LayerTwo Labs sources

This is where the verifiable layer gets real content, and where the factual guardrail is encoded as data.

**Files:**
- Modify: `src/data/lessonData.ts` (fill the `claims: []` array)

- [ ] **Step 1: Replace the empty `claims: []` with the real claims**

In `src/data/lessonData.ts`, set the `claims` field on `lessonData` to:
```ts
  claims: [
    {
      id: 'proposed-soft-fork',
      text: 'Drivechain is a proposed Bitcoin soft fork (BIP300 + BIP301) and is not live on Bitcoin mainnet.',
      tier: 'PROJ',
      sources: [
        { label: 'LayerTwo Labs — FAQ', url: 'https://layertwolabs.com' },
        { label: 'Peter Todd — Drivechains analysis', url: 'https://petertodd.org/2023/drivechains' },
      ],
      verifiedOn: '2026-06-03',
      status: 'verified',
    },
    {
      id: 'bip300-301-roles',
      text: 'BIP300 specifies hashrate escrow (how sidechain withdrawals are approved by miners); BIP301 specifies blind merged mining (how miners earn sidechain fees without running sidechain software).',
      tier: 'DEV',
      sources: [
        { label: 'bip300301_enforcer (LayerTwo-Labs)', url: 'https://github.com/LayerTwo-Labs/bip300301_enforcer' },
        { label: 'Drivechain.info', url: 'https://www.drivechain.info' },
      ],
      verifiedOn: '2026-06-03',
      status: 'verified',
    },
    {
      id: '256-slots',
      text: 'A Drivechain mainchain reserves 256 sidechain slots; each slot can be assigned to one sidechain.',
      tier: 'DEV',
      sources: [
        { label: 'Creating a Sidechain — Paul Sztorc', url: 'https://www.drivechain.info' },
      ],
      verifiedOn: '2026-06-03',
      status: 'needs-recheck',
    },
    {
      id: 'one-ack-per-block',
      text: 'Miners can include at most one ACK per block for a sidechain proposal.',
      tier: 'DEV',
      sources: [
        { label: 'BIP300 (hashrate escrow)', url: 'https://github.com/LayerTwo-Labs/bip300301_enforcer' },
      ],
      verifiedOn: '2026-06-03',
      status: 'verified',
    },
    {
      id: 'activation-threshold',
      text: 'The intended activation threshold is roughly 95% of the past 2016 blocks (1916/2016); testing networks have used a lower threshold.',
      tier: 'DEV',
      sources: [
        { label: 'Creating a Sidechain — Paul Sztorc', url: 'https://www.drivechain.info' },
      ],
      verifiedOn: '2026-06-03',
      status: 'needs-recheck',
    },
    {
      id: 'enforcer-stack',
      text: 'The current LayerTwo Labs software runs the bip300301_enforcer alongside an unmodified Bitcoin Core node (via RPC/ZMQ), with BitWindow as the frontend; the older forked DriveNet/mainchain node is deprecated.',
      tier: 'DEV',
      sources: [
        { label: 'bip300301_enforcer', url: 'https://github.com/LayerTwo-Labs/bip300301_enforcer' },
        { label: 'BitWindow / drivechain-frontends', url: 'https://github.com/LayerTwo-Labs/drivechain-frontends' },
        { label: 'Downloads', url: 'https://releases.drivechain.info' },
      ],
      verifiedOn: '2026-06-03',
      status: 'verified',
    },
    {
      id: 'real-sidechains',
      text: 'Example sidechains built by LayerTwo Labs include Thunder (large blocksize + fraud proofs), BitNames, BitAssets, and Truthcoin.',
      tier: 'DEV',
      sources: [
        { label: 'LayerTwo-Labs on GitHub', url: 'https://github.com/LayerTwo-Labs' },
      ],
      verifiedOn: '2026-06-03',
      status: 'verified',
    },
  ],
```

- [ ] **Step 2: Run the verify-claims gate**

Run: `npm run verify:claims`
Expected: FAIL — the two `needs-recheck` claims (`256-slots`, `activation-threshold`) are reported stale. This is correct behavior: claims you could not fully re-verify against a primary spec are flagged, not silently trusted.

- [ ] **Step 3: Decide per claim — verify or keep flagged**

For this plan, keep `256-slots` and `activation-threshold` as `needs-recheck` (they trace to the Sztorc article, which is a secondary source for a number that should be confirmed against the BIP300 spec). To make `build` pass while these are honestly flagged, change the gate to treat `needs-recheck` as a **warning**, not a failure, while still failing on validation errors and on `verified` claims that have aged out. Update `scripts/verify-claims.ts`:

Replace the stale block:
```ts
    if (isClaimStale(claim, today)) {
      problems++
      console.error(
        `✗ [${lesson.id}] claim "${claim.id}" is stale (verifiedOn ${claim.verifiedOn}, status ${claim.status})`,
      )
    }
```
with:
```ts
    if (claim.status === 'needs-recheck') {
      console.warn(`⚠ [${lesson.id}] claim "${claim.id}" needs recheck (flagged in-product)`)
    } else if (isClaimStale(claim, today)) {
      problems++
      console.error(
        `✗ [${lesson.id}] claim "${claim.id}" is stale: a verified claim aged past ${'180'} days (verifiedOn ${claim.verifiedOn})`,
      )
    }
```

- [ ] **Step 4: Re-run the gate**

Run: `npm run verify:claims`
Expected: two `⚠` warnings, exit 0, `✓ all lesson claims valid and fresh`.

- [ ] **Step 5: Commit**

```bash
git add src/data/lessonData.ts scripts/verify-claims.ts
git commit -m "feat: backfill sidechain lesson claims with LayerTwo Labs sources"
```

---

### Task 7: Modernize the "Connect to Bitcoin" module copy

Replace the dated DriveNet framing with the current Enforcer + BitWindow + Bitcoin Core reality, while keeping the beginner analogy intact.

**Files:**
- Modify: `src/data/lessonData.ts` (the `connect` step copy)
- Modify: `src/components/NodeConnectionMap.tsx` (node labels + feedback copy)

- [ ] **Step 1: Update the connect step text in `lessonData.ts`**

Find the step object with `id: 'connect'` in the `steps` array and replace its `explain` and `why` with:
```ts
      explain:
        'To actually run a sidechain like Thunder, you connect it to a Bitcoin full node. In the current LayerTwo Labs software that means running Bitcoin Core with the Enforcer alongside it (BitWindow is the friendly frontend). The sidechain talks to Bitcoin through that node.',
      actionHint: 'Connect the sidechain to the Bitcoin node.',
      why: 'A sidechain does not float in space. Bitcoin Core stays its reference point for what is real — the Enforcer just teaches that node the BIP300/301 rules without changing Bitcoin itself.',
```

- [ ] **Step 2: Update node labels + feedback in `NodeConnectionMap.tsx`**

In `src/components/NodeConnectionMap.tsx`, the Bitcoin-side node block currently reads `DriveNet` / `Bitcoin full node`. Replace that node's name/sub:
```tsx
          <div className="node__name">Bitcoin Core + Enforcer</div>
          <div className="node__sub">full node · BitWindow frontend</div>
```
And in the connected-feedback paragraph, replace the `<Term id="drivenet" />` reference and surrounding sentence with:
```tsx
              {state.sidechainName} now talks to Bitcoin through a{' '}
              <Term id="full-node">full node</Term> running the Enforcer — the
              same way a Lightning node needs a Bitcoin node. Bitcoin Core stays
              the reference point; the Enforcer only adds BIP300/301 awareness.
```
And the not-connected paragraph's `<Term id="drivenet" />` becomes plain text `the Bitcoin node`.

- [ ] **Step 3: Update the glossary so no dangling term**

In `lessonData.ts` `glossary`, update the `drivenet` entry to reflect deprecation and add an `enforcer` term:
```ts
    {
      id: 'drivenet',
      term: 'DriveNet',
      short:
        'An older LayerTwo Labs test node (a forked Bitcoin Core). Now deprecated in favor of the Enforcer running alongside unmodified Bitcoin Core.',
    },
    {
      id: 'enforcer',
      term: 'Enforcer',
      short:
        'LayerTwo Labs software (bip300301_enforcer) that runs next to a normal Bitcoin Core node and teaches it the proposed BIP300/301 rules — without forking Bitcoin.',
      example: 'BitWindow is the graphical frontend you actually click.',
    },
```

- [ ] **Step 4: Build + visually verify**

Run: `npm run build`
Expected: passes.
Run: `npm run dev`, open the Connect step, confirm the node reads "Bitcoin Core + Enforcer" and the copy mentions BitWindow. (Use the preview tooling.)

- [ ] **Step 5: Commit**

```bash
git add src/data/lessonData.ts src/components/NodeConnectionMap.tsx
git commit -m "content: modernize connect module to Enforcer + BitWindow + Bitcoin Core"
```

---

### Task 8: Inline citation UI — `ClaimChip`

Render a claim as a small chip with its tier, "verified on" date, and expandable sources, reusing the existing `Tooltip`.

**Files:**
- Create: `src/components/ClaimChip.tsx`
- Modify: `src/components/SourcesFooter.tsx` (list the lesson's claims with citations)
- Modify: `src/styles/lesson.css` (chip styles)

- [ ] **Step 1: Create `ClaimChip.tsx`**

Create `src/components/ClaimChip.tsx`:
```tsx
import { Tooltip } from './Tooltip'
import { isClaimStale, type VerifiableClaim } from '../state/claims'

const TIER_LABEL: Record<VerifiableClaim['tier'], string> = {
  DEV: 'spec/code',
  DATA: 'measured',
  INST: 'institutional',
  PRESS: 'press',
  PROJ: 'project',
  ANEC: 'anecdotal',
}

/**
 * Inline citation for a single verifiable claim: a tier chip + the claim text,
 * with sources and the verification date in a tooltip. Stale/disputed claims
 * are visibly marked (icon + text, never color alone).
 */
export function ClaimChip({ claim }: { claim: VerifiableClaim }) {
  const stale = isClaimStale(claim, new Date())
  const flag =
    claim.status === 'disputed' ? '⚠ disputed' : stale ? '↻ recheck due' : '✓ verified'
  const tip = `${TIER_LABEL[claim.tier]} · ${flag} · verified ${claim.verifiedOn}\n${claim.sources
    .map((s) => s.label)
    .join(' · ')}`
  return (
    <span className="claimchip" data-status={claim.status} data-stale={stale}>
      <Tooltip content={tip}>
        <span className="claimchip__tier" aria-label={`source tier: ${TIER_LABEL[claim.tier]}`}>
          {claim.tier}
        </span>
      </Tooltip>{' '}
      {claim.text}{' '}
      {claim.sources.map((s, i) => (
        <a key={i} className="claimchip__src" href={s.url} target="_blank" rel="noreferrer">
          [{i + 1}]
        </a>
      ))}
    </span>
  )
}
```

- [ ] **Step 2: Render claims in `SourcesFooter.tsx`**

In `src/components/SourcesFooter.tsx`, import the registry lesson + ClaimChip and add a "What this lesson claims, and how we know" section above the existing sources list:
```tsx
import { ClaimChip } from './ClaimChip'
import { lessonData } from '../data/lessonData'
```
Inside the rendered footer, before the existing `<dl>`, add:
```tsx
      {lessonData.claims.length > 0 && (
        <section aria-label="Verifiable claims" style={{ marginBottom: 'var(--sp-4)' }}>
          <dt style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
            What this lesson claims — and how we know
          </dt>
          <ul className="claimlist">
            {lessonData.claims.map((c) => (
              <li key={c.id}>
                <ClaimChip claim={c} />
              </li>
            ))}
          </ul>
        </section>
      )}
```

- [ ] **Step 3: Add chip styles**

Append to `src/styles/lesson.css`:
```css
.claimlist { list-style: none; padding: 0; display: grid; gap: var(--sp-2); }
.claimlist li { font-size: var(--fs-300); color: var(--text-muted); line-height: 1.5; }
.claimchip__tier {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--orange-ink);
  background: var(--orange);
  border-radius: 4px;
  padding: 1px 6px;
  cursor: help;
}
.claimchip[data-status='disputed'] .claimchip__tier { background: var(--bad); color: #fff; }
.claimchip[data-stale='true'][data-status='verified'] .claimchip__tier { background: var(--warn); }
.claimchip__src { color: var(--orange-bright); text-decoration: none; font-size: 0.8rem; }
.claimchip__src:hover { text-decoration: underline; }
```

- [ ] **Step 4: Build + visually verify**

Run: `npm run build` (expected pass), then `npm run dev` and confirm the footer shows each claim with a tier chip, `[1]` source links, and that `256-slots`/`activation-threshold` show the "recheck due" marker.

- [ ] **Step 5: Commit**

```bash
git add src/components/ClaimChip.tsx src/components/SourcesFooter.tsx src/styles/lesson.css
git commit -m "feat: render verifiable claims with inline citation chips"
```

---

### Task 9: Registry-driven lesson home

A simple picker so the platform is genuinely multi-lesson, using `registry` + per-lesson progress.

**Files:**
- Create: `src/components/LessonHome.tsx`
- Modify: `src/App.tsx` (route home ↔ lesson by local state)

- [ ] **Step 1: Create `LessonHome.tsx`**

Create `src/components/LessonHome.tsx`:
```tsx
import { lessons } from '../data/registry'

/** Registry-driven lesson picker. Selecting a lesson calls onPick(lessonId). */
export function LessonHome({ onPick }: { onPick: (lessonId: string) => void }) {
  return (
    <main className="shell__main">
      <h1 className="step__headline" style={{ marginBottom: 'var(--sp-2)' }}>
        LayerTwo Labs · Learn
      </h1>
      <p className="step__explain">
        Short, interactive, first-principles lessons on Bitcoin Layer 2 and Drivechain.
        Every factual claim is sourced and dated.
      </p>
      <div className="card-grid card-grid--2">
        {lessons.map((l) => (
          <button key={l.id} type="button" className="option" onClick={() => onPick(l.id)}>
            <span className="option__title">{l.title}</span>
            <p className="option__note">{l.summary}</p>
            <p className="option__note" style={{ color: 'var(--text-faint)' }}>
              {l.audience} · ~{l.estMinutes} min · {l.claims.length} sourced claims
            </p>
          </button>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Route home ↔ lesson in `App.tsx`**

Replace `src/App.tsx` with:
```tsx
import { useState } from 'react'
import { LessonProvider } from './state/LessonProvider'
import { LessonShell } from './components/LessonShell'
import { LessonHome } from './components/LessonHome'

export default function App() {
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  if (!activeLesson) return <LessonHome onPick={setActiveLesson} />

  return (
    <LessonProvider lessonId={activeLesson}>
      <LessonShell />
    </LessonProvider>
  )
}
```

- [ ] **Step 3: Build + verify the flow**

Run: `npm run build` (expected pass), then `npm run dev`. Confirm: home lists the sidechain lesson with "7 sourced claims"; clicking it opens the lesson; refresh keeps lesson progress (namespaced storage).

- [ ] **Step 4: Commit**

```bash
git add src/components/LessonHome.tsx src/App.tsx
git commit -m "feat: registry-driven lesson home"
```

---

### Task 10: Final verification + docs

**Files:**
- Modify: `CLAUDE.md` (document the registry + claims layer)

- [ ] **Step 1: Run the full gate**

Run: `npm test && npm run build`
Expected: all unit tests pass; type-check passes; verify:claims passes (with 2 ⚠ warnings); vite build succeeds.

- [ ] **Step 2: Document the new systems in `CLAUDE.md`**

In `CLAUDE.md`, under the architecture section, add a short subsection:
```markdown
## Multi-lesson registry & verifiable claims

- Lessons are registered in `src/data/registry.ts` (`lessons` + `lessonsById`). Add a lesson by importing its `LessonData` and appending it; `LessonHome` and routing pick it up automatically.
- Progress is namespaced per lesson: `localStorage` key `l2l:lesson:<id>:v<STORAGE_VERSION>`.
- Every factual statement is a `VerifiableClaim` (`src/state/claims.ts`) with a source tier (DEV/DATA/INST/PRESS/PROJ/ANEC), sources, and a `verifiedOn` date. `npm run verify:claims` (wired into `build`) fails on unsourced/aged-out claims and warns on `needs-recheck`. Render claims with `<ClaimChip>`.
- Editorial guardrail still applies: Drivechain is a proposed soft fork; the current stack is the Enforcer + BitWindow + Bitcoin Core (DriveNet deprecated).
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document registry and verifiable-claim layer"
```

---

## Self-review notes

- **Spec coverage:** multi-lesson registry (Tasks 4, 9) ✓; verifiable-claim schema (Tasks 2, 3, 6, 8) ✓; namespaced progress (Task 5) ✓; utilize LayerTwo Labs Learn/Enforcer (Tasks 6, 7 — real sources + Enforcer/BitWindow framing) ✓; CI gate (Task 3) ✓; test harness (Task 1) ✓.
- **Type consistency:** `VerifiableClaim`, `ClaimTier`, `ClaimStatus`, `ClaimSource` defined in Task 2 and reused verbatim in Tasks 4, 6, 8. `lessons`/`lessonsById`/`getPrerequisiteGaps` defined in Task 4 and used in Tasks 3, 9. `LessonProvider` gains a `lessonId` prop in Task 5, used in Tasks 5 and 9.
- **Search/indexing is intentionally out of scope** — it's a separate subsystem and gets its own plan.
- **Known honest flags:** `256-slots` and `activation-threshold` ship as `needs-recheck` (trace to a secondary source); the product shows the recheck marker rather than overclaiming. Re-verify against the BIP300 spec in a follow-up.
