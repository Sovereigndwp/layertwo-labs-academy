# LayerTwo Labs Academy — Foundation & Repurposing Plan

_Generated from a parallel audit of the existing Bitcoin/sovereignty content corpus
(bitcoin-sovereign-academy, tyb-engine, financially-sovereign-academy, first-principles,
bitcoin-learning-nextjs). 7 of 8 content areas surveyed; the-sovereign-academy +
sovereign-academy-hub survey did not complete and is a known gap to re-run._

---

## 1. What you already have

**Strengths (the corpus is deep, sourced, and yours).**
- A genuinely rigorous reference spine: the **foundational-layer thesis v4**
  (`bitcoin-sovereign-academy/deep-dives/foundational-layer-thesis/thesis-v4.md`),
  **field-guide.md** (14 protocol panels with maturity + legal-pressure tags),
  **counter-map.md**, **falsification-framework-v4.md** (17 dated falsifiers), and
  **disclosure-methodology.md** (the `[DEV][DATA][INST][PRESS][PROJ][ANEC]` source-tier
  system). This is the credibility layer most education projects never build.
- A working **content/engine split** already in the new repo: typed `LessonData`
  contract, pure reducer, context + `localStorage`, step-router keyed on `StepKind`,
  and a persistent **factual-accuracy guardrail** (`factBadge` + `SourcesFooter`).
- Reusable interactive infrastructure in BSA: `js/lab-guide.js` (1,512 lines),
  `js/progress-manager.js` (1,251 lines, persona-aware, with migration),
  `js/reflect-widget.js` (991 lines, Socratic 3-tier prompts), `js/learning-path.js`.
  Framework-agnostic; portable as *patterns*.
- The single best Layer-2 visual asset:
  `bitcoin-sovereign-academy/interactive-demos/bitcoin-layers-map/index.html` — already
  has a Drivechain/BIP300-301 card linking to drivechain.info and the LayerTwo-Labs enforcer.
- A locked **voice spec** (`bitcoin-sovereign-academy/docs/marketing/voice-spec.md`) and a
  mature **glossary** (`bitcoin-sovereign-academy/memory/glossary.md`, 120+ terms) —
  first-principles-only, anti-authority, bilingual-ready.
- A prior **content audit** (`bitcoin-sovereign-academy/audit-2026-04/findings.md`, 135
  findings) and a **consolidation roadmap**
  (`bitcoin-sovereign-academy/docs/comprehensive-resource-database.md`) — weeks of triage done.
- The `tyb-engine` pipeline contributes reusable *process* patterns: 15-stage gating,
  misconception taxonomy (`telemetry/misconceptions.js`), `files/juice.js` for game-feel.

**Duplicated / stale (do not carry forward as-is).**
- **Thesis version sprawl:** v1–v4 + falsification-framework v3–v4 with ~89% overlap.
  Keep **v4 only** as canonical; archive the rest as an annotated changelog.
- **Draft paralysis:** 7 unconsolidated `substack-bitcoin-moe` variants. Pick one, archive rest.
- **Generation artifacts:** `bitcoin-sovereign-academy/answers/what-is-bitcoin-self-custody-...-h.html`
  has concatenated JSON-LD/CSS in its `<head>` — do not migrate without cleaning.
- **Stub beginner content:** only `foundation-2.en.json` exists (foundation-1, 3–5 missing);
  4 guide stubs say "being written." Thin where it matters most for complete beginners.
- **Stale data points:** Lightning capacity / Citrea TVL snapshots age fast — anything migrated
  needs a `verifiedOn` date and a re-check workflow.
- **Mock/stubbed code:** 6 of 8 MCP agents are TODO stubs; CheckOnChain metrics use mock data.
- **Bloat:** FSA (139 MB w/ `.venv`), bitcoin-learning-nextjs (556 MB `node_modules`). Never
  migrate directories — extract specific files.

**Factual-accuracy risks to police.**
- Drivechain is a **proposed** soft fork (BIP300/301), **not live on mainnet**. The corpus is
  inconsistent. `thesis-v3` frames a "Drivechain eCash August 2026 fork" as if scheduled — **do
  not** port that as fact.
- `bitcoin-layers-map` labels Drivechain "experimental Layer 5." "Layer 5" is an editorial
  taxonomy, not a protocol fact — present it as such.
- Maturity tags in `field-guide.md` (Lightning "battle-tested," Citrea "early") are
  time-sensitive; carry the source tier and date with every claim.

---

## 2. Repo & workspace foundation

**Status: the hard part is done.** New repo `/Users/dalia/projects/layertwo-labs-academy` is its
own git root, branch `main`, detached from the home-dir junk repo (10,003 files), `.gitignore`
covers `node_modules`, `dist`, `.DS_Store`, `.vite`, `*.tsbuildinfo`.

**Remaining actions:**
- Add `.claude/settings.local.json`, `.env`, `.env.local` to `.gitignore` (keep `.claude/launch.json`
  and shared config tracked so agents/workflows are reproducible).
- Work on a branch (`feat/multi-lesson-engine`), not `main`.
- Optionally publish a private remote: `gh repo create layertwo-labs-academy --private --source=. --push`.
- Delete the old `layer 2 labs` stub once nothing references the path.
- **Home-dir junk repo:** isolation, not surgery. The new repo is independent; leave the junk repo
  alone. `feat/tyb-engine-v1` lives there and is irrelevant to this project.

---

## 3. The engine — from one lesson to a registry

**3a. Namespaced multi-lesson progress.** Generalize `LessonState` to per-lesson:
`LessonProgress { lessonId, lessonStep, moduleState: Record<string,unknown>, quizAnswers,
advancedUnlocked, completedAt? }`. `localStorage` key → `l2l:progress:v1` holding
`Record<lessonId, LessonProgress>`, preserving the merge-over-defaults migration safety.

**3b. Extend the `LessonData` contract** with registry/search/verification metadata:
`id, title, summary, audience, career?, tags[], estMinutes, prerequisites[], factBadge, steps[],
glossary[], sources[], claims[]`.

**3c. Lesson registry + search.** `src/data/registry.ts` exports `lessons[]` + `lessonsById`. A
build-time `scripts/build-index.ts` emits `public/search-index.json`; client search via MiniSearch
/ Fuse.js (no backend — matches the static-site posture).

**3d. The "verifiable" layer (the differentiator).** Port BSA's source-tier system into the schema:
`VerifiableClaim { id, text, tier: DEV|DATA|INST|PRESS|PROJ|ANEC, sources[], verifiedOn, status:
verified|needs-recheck|disputed }`. Inline citation UI via the existing `FactBadge`/`Term`/`Tooltip`
primitives. A `scripts/verify-claims.ts` CI gate fails on unsourced or stale claims — making
"verifiable" a literal CI property, not a slogan.

---

## 4. Agents & workflows to set up

| Need | Capability | Role |
|---|---|---|
| Content inventory / triage | `anthropic-skills:content-inventory` | Run first. Scored `.xlsx` of all 373 HTML / 177 MD with cut/merge/rewrite verdicts. |
| Repurpose old HTML → lesson | custom skill via `anthropic-skills:skill-creator` + `superpowers:writing-plans`/`executing-plans` | Turns a source file into a typed `lessonData.ts` draft. |
| Fact-verification | `deep-research` | Re-checks a lesson's `claims[]` against live sources; proposes `verifiedOn`/`status`. |
| Accessibility | `design:accessibility-review` | WCAG 2.1 AA gate per lesson before merge. |
| Brand/voice | `brand-voice:generate-guidelines` (once) + `brand-voice:enforce-voice` (per draft) | Locks the first-principles, no-hype voice. |
| Corpus analysis | `xlsx`/`pdf`/`docx`, `data:explore-data` | Slice the inventory; ingest source assets. |
| Recurring freshness | `schedule` / `loop` running `deep-research` monthly | Automates data-freshness re-checks. |

---

## 5. Repurposing map (highest-leverage first)

| Pri | Source asset | → Target | Action |
|---|---|---|---|
| P0 | `interactive-demos/bitcoin-layers-map/index.html` | Lesson "Where Drivechain sits in Bitcoin's layers" | Reauthor as `lessonData.ts`; fix "Layer 5" framing; add `claims[]` |
| P0 | `deep-dives/foundational-layer-thesis/field-guide.md` | Protocol reference cards | 14 panels → data-driven comparison cards |
| P0 | `deep-dives/foundational-layer-thesis/disclosure-methodology.md` | The verifiable layer (§3d) | Port tier taxonomy into `VerifiableClaim` + CI gate |
| P1 | `memory/glossary.md` | Platform glossary | Filter to Layer-2/Bitcoin terms |
| P1 | `docs/marketing/voice-spec.md` | Brand-voice guideline | Generate guidelines once |
| P1 | `improvements/emotional-hooks-examples.md` | `StepFrame` hook copy | Apply hook pattern to each lesson's first beat |
| P1 | `deep-dives/first-principles/digital-scarcity.html` | Lesson "Why digital scarcity is hard" | Reauthor (supply bar interaction) |
| P2 | `js/reflect-widget.js` (pattern) | Socratic reflection per step | Reimplement as React component |
| P2 | `js/progress-manager.js` (pattern) | Multi-lesson progress (§3a) | Port persona/migration logic |
| P2 | `tyb-engine/files/career-matrix.json` + `telemetry/misconceptions.js` | Career hooks + misconception tagging | Wire to quizzes |
| P2 | `deep-dives/foundational-layer-thesis/counter-map.md` | Advanced "Why Bitcoin isn't everything" | Reauthor honest competitive brief |
| Skip | thesis v1–v3, falsification v3, substack drafts, corrupted answer HTML | Archive | Do not migrate |

_All source paths are under `/Users/dalia/projects/bitcoin-sovereign-academy/`._

---

## 6. Phased plan

**Phase 0 — Lock the foundation (½ day). FIRST.** Verify clean repo; add `.env*`/local settings to
`.gitignore`; branch `feat/multi-lesson-engine`; optional private remote; delete the stub; run
`content-inventory` → master `.xlsx` (the map for everything below).

**Phase 1 — Generalize the engine (2–3 days).** §3a namespaced progress, §3b–3c extended schema +
registry + search index, §3d minimal `VerifiableClaim` + citation UI + CI gate. Backfill the current
lesson's claims. Keep the sidechain lesson green (`npm run build` is the gate).

**Phase 2 — Repurpose the top three P0 assets (1 week).** Build the `repurpose-lesson` skill;
convert `bitcoin-layers-map` → lesson #2; `field-guide.md` → protocol cards; fully port
`disclosure-methodology` tiers. Run accessibility + brand-voice on each before merge.

**Phase 3 — Expand + automate freshness (ongoing).** Add P1 then P2 lessons; schedule monthly
`deep-research` claim re-checks; localize (ES) only lessons you commit to maintaining.

**Sequencing principle:** foundation + engine generalization come *before* mass content migration,
so every repurposed asset lands directly into the typed schema + verifiable layer. The corpus is the
moat; the engine + verification layer is what makes it more understandable, verifiable, and
searchable than the originals.
