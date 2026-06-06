# Lesson Brief

How to commission a new lesson. Most of the standard is already enforced by the
codebase + process, so a new lesson only needs the **5 specifics** in section 2.

To kick one off, hand me a filled-in section 2 — or, for a lesson already queued
below, just say "Build lesson #N."

---

## 1. What's automatic (do NOT need to re-state)

These apply to every lesson and are enforced by CLAUDE.md, the CI gates, and the
two audit subagents:

- **First principles lead; analogy is a labeled, skippable helper** — see
  `docs/authoring/epistemic-depth.md`.
- **Every interactive must clear the depth bar:** WHAT (real procedure) · HOW
  (mechanism responds) · WHY (probe a boundary until it breaks → rationale
  discovered) · HOW-WE-KNOW (spec/source + a falsifier). Flip-cards/toys fail.
- **Every factual claim is a `VerifiableClaim`** — sourced, dated, and
  **verified against primary sources (the Enforcer code / protocol specs), not
  blog posts.** Numbers you can't confirm ship `needs-recheck`, not asserted.
- **One analogy world per lesson** (reuse the course "roads"/transport world
  unless deliberately starting a new one); declare it in `analogy`. See
  `docs/authoring/analogy-audit.md`.
- **Guardrails:** Drivechain is a *proposed* soft fork, not live on mainnet;
  other layers are real with varying maturity — say so honestly. No hype, no
  tribal language. Surface real tradeoffs and debates.
- **Accessibility is part of done** (keyboard, focus, no color-only state,
  `aria-live`, no tiny text) and scroll resets to top on step change.
- **Process:** built subagent-driven; runs through the spec, code-quality,
  **analogy-audit**, and **epistemic-depth audit** gates before merge;
  `npm run build` runs `verify:claims` + `verify:analogy`; each lesson is its
  own PR; deploys automatically from `main`.

## 2. The 5 specifics to provide per lesson

1. **Topic & goal** — one line: what the learner should be able to reason about
   by the end.
2. **Source to repurpose** — path/URL of existing material to reauthor into a
   `LessonData` (don't copy markup).
3. **Authoritative sources to verify against** — the code/specs/docs each claim
   must be checked against.
4. **Root analogy mapping** — the world + each technical term → one element of
   that world (reuse roads/transport where it genuinely clarifies).
5. **The interactives** — the 1–3 interactions, each described so it can clear
   WHAT/HOW/WHY/HOW-WE-KNOW (name the boundary the learner probes + the
   falsifier).

Then: register the new `LessonData` in `src/data/registry.ts` (homepage + routing
pick it up automatically), and grow `LessonHome` into a course map once 2+
lessons exist.

---

## 3. Queued: Lesson #2 — "Where Drivechain Sits Among Bitcoin's Layers"

Full plan: `docs/plans/2026-06-04-analogy-audit-and-lesson2.md` (Part B).

1. **Topic & goal:** Situate Drivechain honestly among Bitcoin's layers
   (Lightning, Liquid, Ark, rollups/BitVM) — what each gives up and why (custody,
   trust model, finality, who can censor or block your exit).
2. **Source:** `bitcoin-sovereign-academy/interactive-demos/bitcoin-layers-map/index.html`.
3. **Verify against:** Lightning — lightning.network / BOLTs; Liquid —
   Blockstream Liquid docs; Ark — ark-protocol docs; Drivechain — the
   `bip300301_enforcer` code (as in lesson #1). Numbers from primary sources only.
   **"Layer 5" is editorial taxonomy, not a protocol fact** — present it as such.
4. **Root analogy (roads → transport):** Bitcoin L1 = the main highway ·
   Lightning = express lanes for frequent small trips · Liquid = a members-only
   toll road · Drivechain = side roads off numbered exits (from lesson #1) ·
   Ark = a shared shuttle that batches riders · rollups/BitVM = a chartered bus
   that posts its route back to the highway. Use a transport element only where
   it genuinely clarifies; otherwise stay on plain roads.
5. **Interactives (deep, not flip-cards):**
   - **Layer comparison:** the learner probes *each layer's real trust tradeoff
     and a falsifier* — e.g. "who can stop you exiting/withdrawing?" — and watches
     the answer differ per layer (self-custody vs federation vs miner majority).
   - **"Where does Drivechain sit, and why is it debated":** the learner places
     Drivechain on the trust/finality axes and confronts the honest tradeoff
     (majority-hashrate model) surfaced in lesson #1.

   Prerequisite: `create-a-sidechain`.
